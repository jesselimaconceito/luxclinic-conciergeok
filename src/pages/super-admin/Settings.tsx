import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, MessageCircle, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GlobalSettingsForm {
  support_whatsapp: string;
  openai_api_key: string;
}

export default function SuperAdminSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GlobalSettingsForm>();

  // Carregar configurações atuais
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('global_settings')
          .select('*')
          .single();

        if (error) throw error;

        if (data) {
          reset({
            support_whatsapp: data.support_whatsapp || "",
            openai_api_key: data.openai_api_key || "",
          });
        }
      } catch (error: any) {
        console.error('Erro ao carregar configurações:', error);
        toast.error('Erro ao carregar configurações');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [reset]);

  const onSubmit = async (data: GlobalSettingsForm) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('global_settings')
        .update({
          support_whatsapp: data.support_whatsapp || null,
          openai_api_key: data.openai_api_key || null,
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast.error(error.message || 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-purple-100">Configurações</h1>
        <p className="text-purple-400 mt-1">
          Configurações gerais do sistema
        </p>
      </div>

      {/* Support WhatsApp Card */}
      <Card className="border-purple-800/30 bg-slate-900/40 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-purple-100">WhatsApp de Suporte</CardTitle>
              <CardDescription className="text-purple-400">
                Configure o número de WhatsApp que aparecerá como botão de suporte para todos os usuários
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="support_whatsapp" className="text-purple-200">
                  Número de WhatsApp (formato internacional)
                </Label>
                <Input
                  id="support_whatsapp"
                  type="tel"
                  {...register("support_whatsapp")}
                  placeholder="5511999999999"
                  className="bg-slate-800/40 border-purple-800/30 text-purple-100 placeholder:text-purple-400/50"
                />
                <p className="text-xs text-purple-400">
                  Digite o número no formato internacional sem espaços ou caracteres especiais (ex: 5511999999999)
                </p>
                <p className="text-xs text-purple-400 mt-2">
                  Este número será exibido como um botão flutuante verde no canto inferior direito para todos os usuários de todas as organizações.
                </p>
                {errors.support_whatsapp && (
                  <p className="text-xs text-red-400">{errors.support_whatsapp.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* OpenAI API Key Card */}
      <Card className="border-purple-800/30 bg-slate-900/40 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-purple-100">API Key OpenAI</CardTitle>
              <CardDescription className="text-purple-400">
                Configure a chave de API OpenAI usada por todas as organizações
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai_api_key" className="text-purple-200">
                  Chave de API OpenAI
                </Label>
                <Input
                  id="openai_api_key"
                  type="password"
                  {...register("openai_api_key")}
                  placeholder="sk-..."
                  className="bg-slate-800/40 border-purple-800/30 text-purple-100 placeholder:text-purple-400/50 font-mono"
                />
                <p className="text-xs text-purple-400">
                  Esta chave será usada por todas as organizações para funcionalidades de IA como confirmação de agendamento por e-mail, respostas automáticas, etc.
                </p>
                <p className="text-xs text-purple-400 mt-2">
                  ⚠️ Esta configuração é global e afeta todas as organizações do sistema.
                </p>
                {errors.openai_api_key && (
                  <p className="text-xs text-red-400">{errors.openai_api_key.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

