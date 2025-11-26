import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Componente para proteger rotas que só podem ser acessadas por Super Admins
 */
export default function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { user, profile, loading, isSuperAdmin } = useAuth();

  // Aguardar carregamento completo
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Aguardar profile ser carregado após login
  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Não é super admin, vai para painel de organização
  if (!isSuperAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}

