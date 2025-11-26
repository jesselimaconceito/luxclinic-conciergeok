import { useAuth } from '@/contexts/AuthContext';

export function useOrganization() {
  const { organization, profile, loading } = useAuth();

  return {
    organization,
    organizationId: profile?.organization_id ?? null,
    loading,
  };
}

