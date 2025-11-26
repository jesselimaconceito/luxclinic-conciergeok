import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface OrganizationFormData {
  name: string;
  adminEmail: string;
  adminPassword: string;
  adminFullName: string;
  is_active: boolean;
}

export default function OrganizationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<OrganizationFormData>({
    defaultValues: {
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  // Buscar organização (se editando)
  const { data: organization } = useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Preencher form ao editar
  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
        is_active: organization.is_active,
        adminEmail: "",
        adminPassword: "",
        adminFullName: "",
      });
    }
  }, [organization, reset]);

  // Criar/Atualizar organização
  const saveMutation = useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Não autenticado");
      }

      if (isEditing) {
        // Chamar Edge Function para atualizar
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-organization`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              organizationId: id,
              name: data.name,
              isActive: data.is_active,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Erro ao atualizar organização");
        }
      } else {
        // Chamar Edge Function para criar
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-organization`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              organizationName: data.name,
              adminEmail: data.adminEmail,
              adminPassword: data.adminPassword,
              adminFullName: data.adminFullName,
              isActive: data.is_active,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Erro ao criar organização");
        }
      }
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? "Organização atualizada com sucesso!"
          : "Organização criada com sucesso!"
      );
      navigate("/super-admin/organizations");
    },
    onError: (error: any) => {
      console.error("Erro ao salvar organização:", error);
      toast.error(error.message || "Erro ao salvar organização");
    },
  });

  const onSubmit = (data: OrganizationFormData) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/super-admin/organizations")}
          className="text-purple-300 hover:text-purple-100 hover:bg-purple-800/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-purple-100">
            {isEditing ? "Editar Organização" : "Nova Organização"}
          </h1>
          <p className="text-purple-400 mt-1">
            {isEditing
              ? "Atualize as informações da organização"
              : "Crie uma nova clínica/consultório e seu administrador"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Organization Info */}
        <Card className="border-purple-800/30 bg-slate-900/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-purple-100">Informações da Organização</CardTitle>
            <CardDescription className="text-purple-400">
              Dados básicos da clínica/consultório
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-purple-200">
                Nome da Organização *
              </Label>
              <Input
                id="name"
                {...register("name", { required: "Nome é obrigatório" })}
                placeholder="Ex: Clínica São Paulo"
                className="mt-1.5 bg-slate-800/40 border-purple-800/30 text-purple-100 placeholder:text-purple-400/50"
              />
              {errors.name && (
                <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active" className="text-purple-200">
                  Organização Ativa
                </Label>
                <p className="text-xs text-purple-400">
                  Organizações inativas não podem acessar o sistema
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Admin Info (only when creating) */}
        {!isEditing && (
          <Card className="border-purple-800/30 bg-slate-900/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-purple-100">Administrador da Organização</CardTitle>
              <CardDescription className="text-purple-400">
                Criar usuário admin para gerenciar a clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adminFullName" className="text-purple-200">
                  Nome Completo *
                </Label>
                <Input
                  id="adminFullName"
                  {...register("adminFullName", {
                    required: !isEditing && "Nome completo é obrigatório",
                  })}
                  placeholder="Ex: Dr. João Silva"
                  className="mt-1.5 bg-slate-800/40 border-purple-800/30 text-purple-100 placeholder:text-purple-400/50"
                />
                {errors.adminFullName && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.adminFullName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="adminEmail" className="text-purple-200">
                  Email *
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  {...register("adminEmail", {
                    required: !isEditing && "Email é obrigatório",
                  })}
                  placeholder="admin@clinica.com"
                  className="mt-1.5 bg-slate-800/40 border-purple-800/30 text-purple-100 placeholder:text-purple-400/50"
                />
                {errors.adminEmail && (
                  <p className="text-xs text-red-400 mt-1">{errors.adminEmail.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="adminPassword" className="text-purple-200">
                  Senha *
                </Label>
                <Input
                  id="adminPassword"
                  type="password"
                  {...register("adminPassword", {
                    required: !isEditing && "Senha é obrigatória",
                    minLength: {
                      value: 6,
                      message: "Senha deve ter no mínimo 6 caracteres",
                    },
                  })}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-1.5 bg-slate-800/40 border-purple-800/30 text-purple-100 placeholder:text-purple-400/50"
                />
                {errors.adminPassword && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.adminPassword.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/super-admin/organizations")}
            className="border-purple-600/30 text-purple-300 hover:bg-purple-800/30 hover:text-purple-100"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending
              ? "Salvando..."
              : isEditing
              ? "Atualizar"
              : "Criar Organização"}
          </Button>
        </div>
      </form>
    </div>
  );
}

