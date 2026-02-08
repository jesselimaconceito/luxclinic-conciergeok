import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

// Tipo definido localmente para garantir tipagem correta
interface PlanConfig {
    id: string;
    plan_id: string;
    plan_name: string;
    plan_description: string | null;
    atendimento_inteligente: boolean;
    agendamento_automatico: boolean;
    lembretes_automaticos: boolean;
    confirmacao_email: boolean;
    base_conhecimento: boolean;
    relatorios_avancados: boolean;
    integracao_whatsapp: boolean;
    multi_usuarios: boolean;
    personalizacao_agente: boolean;
    analytics: boolean;
    max_agendamentos_mes: number | null;
    max_mensagens_whatsapp_mes: number | null;
    max_usuarios: number | null;
    max_pacientes: number | null;
    price_monthly: number | null;
    price_annual: number | null;
}

interface PlanEditorDialogProps {
    plan: PlanConfig | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PlanEditorDialog({ plan, open, onOpenChange }: PlanEditorDialogProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Partial<PlanConfig>>({});

    // Atualizar form quando o plano mudar
    useState(() => {
        if (plan) setFormData(plan);
    });

    // Efeito para resetar form quando abrir modal
    if (plan && open && formData.id !== plan.id) {
        setFormData(plan);
    }

    const updateMutation = useMutation({
        mutationFn: async (data: Partial<PlanConfig>) => {
            if (!plan?.id) throw new Error("Plan ID missing");

            const { error } = await supabase
                .from('subscription_plan_configs')
                .update(data)
                .eq('id', plan.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
            queryClient.invalidateQueries({ queryKey: ['subscription-plans'] }); // Invalida cache global
            toast.success("Plano atualizado com sucesso!");
            onOpenChange(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error("Erro ao atualizar plano");
        }
    });

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    const handleChange = (field: keyof PlanConfig, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNumberChange = (field: keyof PlanConfig, value: string) => {
        const num = value === '' ? null : Number(value);
        handleChange(field, num);
    };

    if (!plan) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Plano: {plan.plan_name}</DialogTitle>
                    <DialogDescription>
                        Alterações feitas aqui serão refletidas IMEDIATAMENTE para todas as organizações neste plano.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">Geral & Preços</TabsTrigger>
                        <TabsTrigger value="features">Recursos</TabsTrigger>
                        <TabsTrigger value="limits">Limites</TabsTrigger>
                    </TabsList>

                    {/* ABA GERAL */}
                    <TabsContent value="general" className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="plan_name">Nome do Plano</Label>
                            <Input
                                id="plan_name"
                                value={formData.plan_name || ''}
                                onChange={e => handleChange('plan_name', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição Curta</Label>
                            <Textarea
                                id="description"
                                value={formData.plan_description || ''}
                                onChange={e => handleChange('plan_description', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price_monthly">Preço Mensal (R$)</Label>
                                <Input
                                    id="price_monthly"
                                    type="number"
                                    step="0.01"
                                    value={formData.price_monthly ?? ''}
                                    onChange={e => handleNumberChange('price_monthly', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price_annual">Preço Anual (R$)</Label>
                                <Input
                                    id="price_annual"
                                    type="number"
                                    step="0.01"
                                    value={formData.price_annual ?? ''}
                                    onChange={e => handleNumberChange('price_annual', e.target.value)}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* ABA RECURSOS */}
                    <TabsContent value="features" className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'atendimento_inteligente', label: 'Atendimento Inteligente (AI)' },
                                { key: 'agendamento_automatico', label: 'Agendamento Automático' },
                                { key: 'lembretes_automaticos', label: 'Lembretes Automáticos' },
                                { key: 'confirmacao_email', label: 'Confirmação por Email' },
                                { key: 'base_conhecimento', label: 'Base de Conhecimento' },
                                { key: 'relatorios_avancados', label: 'Relatórios Avançados' },
                                { key: 'integracao_whatsapp', label: 'Integração WhatsApp' },
                                { key: 'multi_usuarios', label: 'Múltiplos Usuários' },
                                { key: 'personalizacao_agente', label: 'Personalização do Agente' },
                                { key: 'analytics', label: 'Analytics & Dashboards' },
                            ].map((feature) => (
                                <div key={feature.key} className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor={feature.key} className="flex-1 cursor-pointer">
                                        {feature.label}
                                    </Label>
                                    <Switch
                                        id={feature.key}
                                        checked={!!formData[feature.key as keyof PlanConfig]}
                                        onCheckedChange={checked => handleChange(feature.key as keyof PlanConfig, checked)}
                                    />
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* ABA LIMITES */}
                    <TabsContent value="limits" className="space-y-4 py-4">
                        <div className="p-3 bg-accent/10 text-accent rounded-md text-sm mb-4">
                            Deixe em branco ou 0 para ilimitado (infinito).
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="max_agendamentos">Max Agendamentos / Mês</Label>
                                <Input
                                    id="max_agendamentos"
                                    type="number"
                                    placeholder="∞"
                                    value={formData.max_agendamentos_mes ?? ''}
                                    onChange={e => handleNumberChange('max_agendamentos_mes', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="max_whatsapp">Max Mensagens WhatsApp / Mês</Label>
                                <Input
                                    id="max_whatsapp"
                                    type="number"
                                    placeholder="∞"
                                    value={formData.max_mensagens_whatsapp_mes ?? ''}
                                    onChange={e => handleNumberChange('max_mensagens_whatsapp_mes', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="max_users">Max Usuários (Staff)</Label>
                                <Input
                                    id="max_users"
                                    type="number"
                                    placeholder="∞"
                                    value={formData.max_usuarios ?? ''}
                                    onChange={e => handleNumberChange('max_usuarios', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="max_patients">Max Pacientes (CRM)</Label>
                                <Input
                                    id="max_patients"
                                    type="number"
                                    placeholder="∞"
                                    value={formData.max_pacientes ?? ''}
                                    onChange={e => handleNumberChange('max_pacientes', e.target.value)}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
