import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContextType, Profile, Organization, SignUpData } from '@/types/auth';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoggingOutRef = useRef(false);

  // Carregar dados do perfil e organização
  const loadUserData = async (userId: string, forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Limpar cache do profile anterior se forçar refresh
      if (forceRefresh) {
        console.log('🔄 Forçando atualização do profile...');
        setProfile(null);
        setOrganization(null);
      }
      
      console.log('📥 Carregando dados do usuário:', userId);
      
      // Buscar profile - sempre buscar do banco (Supabase não usa cache HTTP)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
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
          toast.error('Perfil não encontrado. Por favor, entre em contato com o suporte.');
          return;
        }
        throw profileError;
      }

      if (!profileData && !isLoggingOutRef.current) {
        // Profile não existe
        console.error('Profile não encontrado. Fazendo logout...');
        isLoggingOutRef.current = true;
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setOrganization(null);
        toast.error('Perfil não encontrado. Por favor, entre em contato com o suporte.');
        return;
      }

      console.log('✅ Profile encontrado:', {
        id: profileData.id,
        full_name: profileData.full_name,
        is_super_admin: profileData.is_super_admin,
        organization_id: profileData.organization_id,
        role: profileData.role
      });
      
      setProfile(profileData);

      // Buscar organization (apenas se não for super admin)
      if (profileData?.organization_id && !profileData?.is_super_admin) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single();

        if (orgError) {
          console.error('Erro ao carregar organização:', orgError);
          // Não fazer logout se a organização não existir, apenas logar o erro
        } else {
          console.log('✅ Organização carregada:', orgData.name);
          setOrganization(orgData);
        }
      } else if (profileData?.is_super_admin) {
        // Super admins não têm organização
        console.log('✅ Super admin - sem organização');
        setOrganization(null);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Se for erro de profile não encontrado, fazer logout
      if ((error?.code === 'PGRST116' || error?.message?.includes('No rows')) && !isLoggingOutRef.current) {
        isLoggingOutRef.current = true;
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setOrganization(null);
        toast.error('Perfil não encontrado. Por favor, entre em contato com o suporte.');
      } else {
        setProfile(null);
        setOrganization(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Verificar sessão inicial
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setUser(session?.user ?? null);
      if (session?.user) {
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
        // Forçar refresh em eventos de login/token refresh
        const forceRefresh = event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED';
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
      const { data: registerData, error: registerError } = await supabase
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

