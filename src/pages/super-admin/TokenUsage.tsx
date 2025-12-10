import { useEffect, useState } from "react";
import { Zap, TrendingUp, Building2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface OrganizationTokens {
  organization_id: string;
  organization_name: string;
  organization_logo: string | null;
  total_tokens: number;
  total_cost: number;
}

export default function TokenUsage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orgTokens, setOrgTokens] = useState<OrganizationTokens[]>([]);
  const [grandTotalTokens, setGrandTotalTokens] = useState<number>(0);
  const [grandTotalCost, setGrandTotalCost] = useState<number>(0);

  useEffect(() => {
    loadTokenUsage();
  }, []);

  const loadTokenUsage = async () => {
    try {
      setIsLoading(true);

      // Buscar todos os registros de token_usage com informações da organização
      const { data: tokenData, error: tokenError } = await supabase
        .from("token_usage")
        .select(`
          organization_id,
          total_tokens,
          cost_reais
        `);

      if (tokenError) throw tokenError;

      // Buscar informações das organizações
      const { data: orgsData, error: orgsError } = await supabase
        .from("organizations")
        .select("id, name, logo_url");

      if (orgsError) throw orgsError;

      // Agrupar por organização
      const grouped: Record<string, { total_tokens: number; total_cost: number }> = {};
      
      tokenData?.forEach((record) => {
        if (!grouped[record.organization_id]) {
          grouped[record.organization_id] = { total_tokens: 0, total_cost: 0 };
        }
        grouped[record.organization_id].total_tokens += record.total_tokens || 0;
        grouped[record.organization_id].total_cost += record.cost_reais || 0;
      });

      // Combinar com dados das organizações
      const result: OrganizationTokens[] = Object.entries(grouped).map(([orgId, data]) => {
        const org = orgsData?.find((o) => o.id === orgId);
        return {
          organization_id: orgId,
          organization_name: org?.name || "Organização Desconhecida",
          organization_logo: org?.logo_url || null,
          total_tokens: data.total_tokens,
          total_cost: data.total_cost,
        };
      });

      // Ordenar por custo (maior para menor)
      result.sort((a, b) => b.total_cost - a.total_cost);

      setOrgTokens(result);

      // Calcular totais gerais
      const totalTks = result.reduce((sum, org) => sum + org.total_tokens, 0);
      const totalCst = result.reduce((sum, org) => sum + org.total_cost, 0);
      setGrandTotalTokens(totalTks);
      setGrandTotalCost(totalCst);
    } catch (error) {
      console.error("Erro ao carregar gastos de token:", error);
      toast.error("Erro ao carregar gastos de token");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-400">Carregando gastos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-purple-100">
                Gastos de Token
              </h1>
            </div>
          </div>
          <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            Analytics
          </Badge>
        </div>
        <p className="text-base md:text-lg text-purple-400">
          Consumo de tokens e custos por organização
        </p>
      </div>

      {/* Card de Resumo Geral */}
      <Card className="card-luxury p-6 animate-fade-in-up border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-100">Total Geral</h3>
              <p className="text-sm text-purple-400">Todas as organizações</p>
            </div>
          </div>
          <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20">
            {orgTokens.length} organizações
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="bg-purple-950/30 rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <p className="text-sm text-purple-400">Total de Tokens</p>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-purple-100">
              {grandTotalTokens.toLocaleString('pt-BR')}
            </p>
          </div>
          
          <div className="bg-purple-950/30 rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <p className="text-sm text-purple-400">Custo Total</p>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-green-400">
              {grandTotalCost.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
                maximumFractionDigits: 8
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Cards por Organização */}
      <div>
        <h2 className="text-xl font-semibold text-purple-100 mb-4">
          Por Organização
        </h2>
        
        {orgTokens.length === 0 ? (
          <Card className="card-luxury p-12 text-center border-purple-800/30">
            <Zap className="h-16 w-16 mx-auto mb-4 text-purple-500/50" />
            <p className="text-lg text-purple-400">
              Nenhum consumo de token registrado ainda
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orgTokens.map((org, index) => (
              <Card
                key={org.organization_id}
                className="card-luxury p-5 animate-fade-in-up hover:border-purple-500/50 transition-all"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {org.organization_logo ? (
                      <img
                        src={org.organization_logo}
                        alt={org.organization_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                        <Building2 className="h-5 w-5 text-purple-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-purple-100 truncate">
                        {org.organization_name}
                      </h3>
                      <p className="text-xs text-purple-400">
                        {((org.total_cost / grandTotalCost) * 100).toFixed(1)}% do total
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
                    <p className="text-xs text-purple-400 mb-1">Tokens</p>
                    <p className="text-xl font-bold text-purple-100">
                      {org.total_tokens.toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
                    <p className="text-xs text-purple-400 mb-1">Custo</p>
                    <p className="text-xl font-bold text-green-400">
                      {org.total_cost.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

