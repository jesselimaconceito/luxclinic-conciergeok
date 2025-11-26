import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Building2, Users, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  totalPatients: number;
  totalAppointments: number;
}

export default function SuperAdminDashboard() {
  // Buscar estatísticas
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["super-admin-stats"],
    queryFn: async () => {
      // Total de organizações
      const { count: totalOrgs } = await supabase
        .from("organizations")
        .select("*", { count: "exact", head: true });

      // Organizações ativas
      const { count: activeOrgs } = await supabase
        .from("organizations")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Total de usuários
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_super_admin", false);

      // Total de pacientes
      const { count: totalPatients } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });

      // Total de compromissos
      const { count: totalAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

      return {
        totalOrganizations: totalOrgs || 0,
        activeOrganizations: activeOrgs || 0,
        totalUsers: totalUsers || 0,
        totalPatients: totalPatients || 0,
        totalAppointments: totalAppointments || 0,
      };
    },
  });

  // Buscar últimas organizações
  const { data: recentOrgs } = useQuery({
    queryKey: ["recent-organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total de Organizações",
      value: stats?.totalOrganizations || 0,
      description: `${stats?.activeOrganizations || 0} ativas`,
      icon: Building2,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Total de Usuários",
      value: stats?.totalUsers || 0,
      description: "Usuários cadastrados",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total de Pacientes",
      value: stats?.totalPatients || 0,
      description: "Em todas as organizações",
      icon: Activity,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Total de Compromissos",
      value: stats?.totalAppointments || 0,
      description: "Agendamentos totais",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-purple-100">Dashboard</h1>
        <p className="text-purple-400 mt-1">
          Visão geral do sistema LuxClinic
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.title}
              className="border-purple-800/30 bg-slate-900/40 backdrop-blur-xl"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">
                  {kpi.title}
                </CardTitle>
                <div
                  className={`rounded-lg bg-gradient-to-br ${kpi.color} p-2`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-50">
                  {kpi.value}
                </div>
                <p className="text-xs text-purple-400 mt-1">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Organizations */}
      <Card className="border-purple-800/30 bg-slate-900/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-purple-100">
            Organizações Recentes
          </CardTitle>
          <CardDescription className="text-purple-400">
            Últimas organizações cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrgs?.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between rounded-lg border border-purple-800/30 bg-slate-800/40 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-100">{org.name}</p>
                    <p className="text-xs text-purple-400">{org.slug}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      org.is_active
                        ? "bg-green-600/20 text-green-300 ring-1 ring-green-500/30"
                        : "bg-red-600/20 text-red-300 ring-1 ring-red-500/30"
                    }`}
                  >
                    {org.is_active ? "Ativa" : "Inativa"}
                  </span>
                  <p className="text-xs text-purple-400 mt-1">
                    {new Date(org.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
            {(!recentOrgs || recentOrgs.length === 0) && (
              <p className="text-center text-purple-400 py-8">
                Nenhuma organização cadastrada ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

