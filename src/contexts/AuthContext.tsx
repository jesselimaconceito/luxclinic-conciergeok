import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContextType, Profile, Organization, SignUpData } from '@/types/auth';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_PROFILE_KEY = 'luxclinic_profile';
const STORAGE_ORG_KEY = 'luxclinic_org';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  // Ref para controlar requisições em andamento
  const isLoadingDataRef = useRef(false);
  // Ref para evitar stale closures no onAuthStateChange
  const userIdRef = useRef<string | null>(null);
  // Ref para garantir que o perfil foi carregado com sucesso antes de otimizar
  const profileLoadedRef = useRef(false);

  // Função auxiliar para limpar estado
  const clearState = () => {
    userIdRef.current = null;
    profileLoadedRef.current = false;
    setUser(null);
    setProfile(null);
    setOrganization(null);
    localStorage.removeItem(STORAGE_PROFILE_KEY);
    localStorage.removeItem(STORAGE_ORG_KEY);
  };

  const recordLogin = async (userId: string) => {
    try {
      // Tenta obter IP e Localização de forma simples (best effort)
      let ipData = { ip: 'unknown', city: 'unknown', region: 'unknown', country: 'unknown' };
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          ipData = await res.json();
        }
      } catch (e) {
        // Silently fail external IP check
      }

      const { error } = await (supabase as any)
        .from('login_history')
        .insert({
          user_id: userId,
          ip_address: ipData.ip,
          user_agent: navigator.userAgent,
          location: {
            city: ipData.city,
            region: ipData.region,
            country: ipData.country
          }
        });

      if (error) console.error('Error logging login:', error);
    } catch (e) {
      console.error('Error in recordLogin:', e);
    }
  };

  const loadUserData = async (userId: string) => {
    if (isLoadingDataRef.current) return;
    isLoadingDataRef.current = true;

    try {
      console.log('📥 Carregando dados do usuário:', userId);

      // Usar cache de IMEDIATO se disponível
      const cachedProfileStr = localStorage.getItem(STORAGE_PROFILE_KEY);
      const cachedOrgStr = localStorage.getItem(STORAGE_ORG_KEY);
      let loadedFromCache = false;

      if (cachedProfileStr) {
        try {
          const cachedProfile = JSON.parse(cachedProfileStr);
          if (cachedProfile.id === userId) {
            setProfile(cachedProfile);
            profileLoadedRef.current = true; // Assume loaded if cached
            if (cachedOrgStr) setOrganization(JSON.parse(cachedOrgStr));

            console.log('⚡ Cache encontrado e aplicado imediatamente');
            setLoading(false); // Libera UI imediatamente
            loadedFromCache = true;
          }
        } catch (e) {
          console.warn('Cache inválido');
        }
      }

      // Define um timeout para a requisição ao Supabase (ex: 5 segundos)
      const fetchPromise = async () => {
        const { data: profileData, error: profileError } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        return profileData;
      };

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      try {
        const profileData: any = await Promise.race([fetchPromise(), timeoutPromise]);

        if (profileData) {
          setProfile(profileData);
          profileLoadedRef.current = true;
          localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profileData));

          if (profileData.organization_id && !profileData.is_super_admin) {
            const { data: orgData } = await (supabase as any)
              .from('organizations')
              .select('*')
              .eq('id', profileData.organization_id)
              .single();

            if (orgData) {
              setOrganization(orgData);
              localStorage.setItem(STORAGE_ORG_KEY, JSON.stringify(orgData));
            }
          }
        }
      } catch (error: any) {
        console.warn('⚠️ Falha ao buscar dados frescos (timeout ou erro):', error);
        // Se já carregou do cache, ignoramos o erro de rede/timeout
        if (!loadedFromCache) {
          // Se não temos cache e deu erro, infelizmente temos que lidar com isso.
          // Mas para evitar "travamento", vamos liberar o loading mesmo assim se for timeout
          if (error.message === 'Timeout' || error.message?.includes('fetch')) {
            console.log('⚠️ Timeout mas liberando UI (modo offline/lento)');
          } else {
            throw error; // Erros de auth reais repassamos
          }
        }
      }

      // Registrar login em background
      recordLogin(userId);

    } catch (error) {
      console.error('Erro crítico ao carregar dados:', error);
      profileLoadedRef.current = false;
    } finally {
      isLoadingDataRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session?.user) {
          console.log('🔓 Sessão inicial encontrada:', session.user.email);
          userIdRef.current = session.user.id;
          setUser(session.user);
          await loadUserData(session.user.id);
        } else {
          console.log('🔒 Sem sessão inicial');
          const hasCache = localStorage.getItem(STORAGE_PROFILE_KEY);
          // Se tem cache, libera a UI rapidinho pra não piscar
          if (hasCache && mounted) {
            setLoading(false);
          } else {
            if (mounted) setLoading(false);
          }
        }
      } catch (error) {
        console.error('Erro na inicialização da auth:', error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log(`🔔 Auth Event: ${event}`);

      if (event === 'SIGNED_OUT') {
        clearState();
        setLoading(false);
      } else if (session?.user) {
        if (userIdRef.current === session.user.id && profileLoadedRef.current) {
          return;
        }
        userIdRef.current = session.user.id;
        setUser(session.user);
        await loadUserData(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
      setLoading(false);
      throw error;
    }
  };

  const signUp = async ({ email, password, fullName, organizationName }: SignUpData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const slug = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

      const { error: registerError } = await (supabase as any)
        .rpc('register_user_with_organization', {
          p_user_id: authData.user!.id,
          p_full_name: fullName,
          p_organization_name: organizationName,
          p_slug: slug
        });

      if (registerError) throw registerError;
      toast.success('Cadastro realizado! Verifique seu email.');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      clearState();
      toast.success('Logout realizado');
    } catch (error) {
      console.error('Erro no logout', error);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    toast.success('Email de recuperação enviado!');
  };

  const reloadUserData = async () => {
    if (user) await loadUserData(user.id);
  };

  const value = {
    user,
    profile,
    organization,
    isSuperAdmin: profile?.is_super_admin ?? false,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    reloadUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
