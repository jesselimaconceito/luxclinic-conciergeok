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

  const loadUserData = async (userId: string) => {
    if (isLoadingDataRef.current) return;
    isLoadingDataRef.current = true;

    try {
      console.log('📥 Carregando dados do usuário:', userId);

      // Usar cache enquanto carrega
      const cachedProfileStr = localStorage.getItem(STORAGE_PROFILE_KEY);
      const cachedOrgStr = localStorage.getItem(STORAGE_ORG_KEY);

      if (cachedProfileStr && !profile) {
        try {
          const cachedProfile = JSON.parse(cachedProfileStr);
          if (cachedProfile.id === userId) {
            setProfile(cachedProfile);
            if (cachedOrgStr) setOrganization(JSON.parse(cachedOrgStr));
          }
        } catch (e) {
          console.warn('Cache inválido');
        }
      }

      // Buscar dados atualizados
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        profileLoadedRef.current = false;
        throw profileError;
      }

      if (profileData) {
        setProfile(profileData);
        profileLoadedRef.current = true;
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profileData));

        if (profileData.organization_id && !profileData.is_super_admin) {
          const { data: orgData, error: orgError } = await (supabase as any)
            .from('organizations')
            .select('*')
            .eq('id', profileData.organization_id)
            .single();

          if (orgData) {
            setOrganization(orgData);
            localStorage.setItem(STORAGE_ORG_KEY, JSON.stringify(orgData));
          }
        } else {
          setOrganization(null);
          localStorage.removeItem(STORAGE_ORG_KEY);
        }
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      profileLoadedRef.current = false;
      // Não fazemos logout aqui para evitar loop em caso de erro de rede
    } finally {
      isLoadingDataRef.current = false;
      // IMPORTANTE: Só liberamos o loading após tentar carregar os dados
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Bloqueia redirecionamentos até a sessão ser verificada
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session?.user) {
          console.log('🔓 Sessão inicial encontrada:', session.user.email);
          userIdRef.current = session.user.id;
          setUser(session.user);
          await loadUserData(session.user.id);
        } else {
          console.log('🔒 Sem sessão inicial');
          if (mounted) setLoading(false);
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
        // Otimização Refinada: Só ignora se o ID bater E o perfil já estiver carregado
        if (userIdRef.current === session.user.id && profileLoadedRef.current) {
          console.log('🔄 Sessão confirmada (sem refetch)');
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
  }, []); // Dependências vazias = roda apenas uma vez

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
