import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const isLoggingOutRef = useRef(false);
  const loadingUserDataRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileRef = useRef<Profile | null>(null);

  // Manter ref sincronizado com estado
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Carregar dados do perfil e organização
  const loadUserData = async (userId: string, forceRefresh = false) => {
    // Prevenir requisições duplicadas simultâneas
    if (loadingUserDataRef.current === userId && !forceRefresh) {
      console.log('⏭️ Requisição duplicada ignorada para:', userId);
      return;
    }

    // Cancelar requisição anterior se houver
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Limpar timeout anterior
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Criar novo AbortController para esta requisição
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    loadingUserDataRef.current = userId;

    // Só mostrar loading se ainda não tem profile carregado (primeira carga)
    // Em navegação subsequente, manter dados antigos enquanto carrega novos
    // Verificar profileRef.current para evitar problemas de closure
    if (!profileRef.current && !initialLoadComplete) {
      setLoading(true);
    }

    // Timeout de segurança: resetar loading após 10 segundos para evitar carregamento infinito
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Timeout de segurança: resetando loading após 10 segundos');
      setLoading(false);
      setInitialLoadComplete(true);
    }, 10000);

    try {
      // Limpar cache do profile anterior se forçar refresh
      if (forceRefresh) {
        console.log('🔄 Forçando atualização do profile...');
        // Clear state but NOT cache yet, to avoid flicker if refresh fails? 
        // Or clear everything? "Force refresh" usually implies we want fresh data.
        // Let's clear cache to be safe if forcing.
        localStorage.removeItem(STORAGE_PROFILE_KEY);
        localStorage.removeItem(STORAGE_ORG_KEY);
        setProfile(null);
        setOrganization(null);
      }

      console.log('📥 Carregando dados do usuário:', userId);

      // Verificar se a requisição foi cancelada
      if (abortController.signal.aborted) {
        console.log('⚠️ Requisição cancelada antes de buscar profile');
        return;
      }

      // Buscar profile - sempre buscar do banco (Supabase não usa cache HTTP)
      // Nota: o `Database` atual em `@/types/database` não tipa a tabela `profiles`,
      // então o Supabase infere `never`. Fazemos cast local para manter o app compilando.
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Verificar se foi cancelada após a requisição
      if (abortController.signal.aborted) {
        console.log('⚠️ Requisição cancelada após buscar profile');
        return;
      }

      console.log('📊 Profile carregado:', profileData);

      if (profileError) {
        // Se o profile não existe, fazer logout automático
        if (profileError.code === 'PGRST116' && !isLoggingOutRef.current) {
          console.error('Profile não encontrado. Fazendo logout...');
          isLoggingOutRef.current = true;
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setOrganization(null);
          localStorage.removeItem(STORAGE_PROFILE_KEY);
          localStorage.removeItem(STORAGE_ORG_KEY);
          toast.error('Perfil não encontrado. Por favor, entre em contato com o suporte.');
          return;
        }
        throw profileError;
      }

      // Se não veio profileData, considerar inválido (não depende de flag para o TypeScript estreitar o tipo)
      if (!profileData) {
        if (!isLoggingOutRef.current) {
          console.error('Profile não encontrado. Fazendo logout...');
          isLoggingOutRef.current = true;
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setOrganization(null);
          localStorage.removeItem(STORAGE_PROFILE_KEY);
          localStorage.removeItem(STORAGE_ORG_KEY);
          toast.error('Perfil não encontrado. Por favor, entre em contato com o suporte.');
        }
        return;
      }

      // A partir daqui, profileData é garantidamente não-nulo
      const p = profileData;

      console.log('✅ Profile encontrado:', {
        id: p.id,
        full_name: p.full_name,
        is_super_admin: p.is_super_admin,
        organization_id: p.organization_id,
        role: p.role
      });

      setProfile(p);
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(p));

      // Verificar se foi cancelada antes de buscar organização
      if (abortController.signal.aborted) {
        console.log('⚠️ Requisição cancelada antes de buscar organização');
        return;
      }

      // Buscar organization (apenas se não for super admin)
      if (p.organization_id && !p.is_super_admin) {
        const { data: orgData, error: orgError } = await (supabase as any)
          .from('organizations')
          .select('*')
          .eq('id', p.organization_id)
          .single();

        // Verificar se foi cancelada após buscar organização
        if (abortController.signal.aborted) {
          console.log('⚠️ Requisição cancelada após buscar organização');
          return;
        }

        if (orgError) {
          console.error('Erro ao carregar organização:', orgError);
          // Não fazer logout se a organização não existir, apenas logar o erro
        } else {
          if (orgData) {
            console.log('✅ Organização carregada:', orgData.name);
            setOrganization(orgData);
            localStorage.setItem(STORAGE_ORG_KEY, JSON.stringify(orgData));
          } else {
            console.warn('⚠️ Organização não encontrada (orgData null)');
            setOrganization(null);
            localStorage.removeItem(STORAGE_ORG_KEY);
          }
        }
      } else if (p.is_super_admin) {
        // Super admins não têm organização
        console.log('✅ Super admin - sem organização');
        setOrganization(null);
        localStorage.removeItem(STORAGE_ORG_KEY);
      }
    } catch (error: any) {
      // Ignorar erros de abort
      if (error?.name === 'AbortError' || abortController.signal.aborted) {
        console.log('⚠️ Requisição cancelada (AbortError ignorado)');
        return;
      }

      console.error('Erro ao carregar dados do usuário:', error);
      // Se for erro de profile não encontrado, fazer logout
      if ((error?.code === 'PGRST116' || error?.message?.includes('No rows')) && !isLoggingOutRef.current) {
        isLoggingOutRef.current = true;
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setOrganization(null);
        localStorage.removeItem(STORAGE_PROFILE_KEY);
        localStorage.removeItem(STORAGE_ORG_KEY);
        toast.error('Perfil não encontrado. Por favor, entre em contato com o suporte.');
      } else {
        setProfile(null);
        setOrganization(null);
      }
    } finally {
      // Limpar referências apenas se esta requisição ainda estiver ativa
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
        loadingUserDataRef.current = null;
      }
      // Limpar timeout de segurança
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Verificar sessão inicial
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
      if (session?.user) {
        // Tentar recuperar do cache para exibir UI imediatamente
        try {
          const cachedProfileStr = localStorage.getItem(STORAGE_PROFILE_KEY);
          const cachedOrgStr = localStorage.getItem(STORAGE_ORG_KEY);

          if (cachedProfileStr) {
            const cachedProfile = JSON.parse(cachedProfileStr);
            // Verificar se o cache pertence ao usuário atual
            if (cachedProfile.id === session.user.id) {
              console.log('📦 Usando profile em cache:', cachedProfile.id);
              setProfile(cachedProfile);

              if (cachedOrgStr) {
                setOrganization(JSON.parse(cachedOrgStr));
              }

              // Se carregamos do cache, podemos liberar a UI
              setLoading(false);
              setInitialLoadComplete(true);
            }
          }
        } catch (e) {
          console.error('Erro ao recuperar cache:', e);
          localStorage.removeItem(STORAGE_PROFILE_KEY);
          localStorage.removeItem(STORAGE_ORG_KEY);
        }

        await loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Resetar flag de logout quando não há sessão
      if (!session) {
        isLoggingOutRef.current = false;
      }

      setUser(session?.user ?? null);
      if (session?.user && !isLoggingOutRef.current) {
        // Só forçar refresh em login real (SIGNED_IN)
        // TOKEN_REFRESHED não deve recarregar se já tem profile (evita flicker ao trocar de aba)
        const forceRefresh = event === 'SIGNED_IN';

        // Se já tem profile carregado e é apenas refresh de token, não recarregar
        if (event === 'TOKEN_REFRESHED' && profileRef.current && profileRef.current.id === session.user.id) {
          console.log('⏭️ TOKEN_REFRESHED ignorado - profile já carregado');
          return;
        }

        await loadUserData(session.user.id, forceRefresh);
      } else {
        setProfile(null);
        setOrganization(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      // Cancelar requisições pendentes ao desmontar
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      loadingUserDataRef.current = null;
    };
  }, []);

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  };

  // Cadastro
  const signUp = async ({ email, password, fullName, organizationName }: SignUpData) => {
    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      console.log('✅ Usuário criado no Auth:', authData.user.id);

      // 2. Gerar slug da organização
      const slug = organizationName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-' + Date.now();

      console.log('📝 Slug gerado:', slug);

      // 3. Usar função SQL para criar organização + profile + settings de forma atômica
      // Obs: essa RPC não está tipada no `Database` gerado, então fazemos cast local para evitar `never`
      const { data: registerData, error: registerError } = await (supabase as any)
        .rpc('register_user_with_organization', {
          p_user_id: authData.user.id,
          p_full_name: fullName,
          p_organization_name: organizationName,
          p_slug: slug
        });

      if (registerError) {
        console.error('❌ Erro ao registrar usuário com organização:', registerError);
        throw registerError;
      }

      console.log('✅ Registro completo:', registerData);

      // Verificar se precisa confirmar email
      if (authData.session) {
        // Email já confirmado, pode fazer login direto
        toast.success('Cadastro realizado com sucesso!');
      } else {
        // Precisa confirmar email
        toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error(error.message || 'Erro ao fazer cadastro');
      throw error;
    }
  };

  // Logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      // Limpar estado local independente do erro
      setUser(null);
      setProfile(null);
      setOrganization(null);
      localStorage.removeItem(STORAGE_PROFILE_KEY);
      localStorage.removeItem(STORAGE_ORG_KEY);

      // Se não for erro de sessão, mostrar erro
      if (error && error.message !== 'Auth session missing!') {
        console.error('Erro no logout:', error);
        toast.error(error.message || 'Erro ao fazer logout');
      } else {
        toast.success('Logout realizado com sucesso!');
      }
    } catch (error: any) {
      // Limpar estado mesmo com erro
      setUser(null);
      setProfile(null);
      setOrganization(null);
      localStorage.removeItem(STORAGE_PROFILE_KEY);
      localStorage.removeItem(STORAGE_ORG_KEY);

      console.error('Erro no logout:', error);

      // Só mostrar erro se não for sessão ausente
      if (error.message !== 'Auth session missing!') {
        toast.error('Erro ao fazer logout');
      } else {
        toast.success('Logout realizado com sucesso!');
      }
    }
  };

  // Reset de senha
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      toast.success('Email de recuperação enviado!');
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast.error(error.message || 'Erro ao enviar email');
      throw error;
    }
  };

  // Recarregar dados do usuário (forçar atualização)
  const reloadUserData = async () => {
    if (user) {
      await loadUserData(user.id, true);
    }
  };

  const value: AuthContextType = {
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

