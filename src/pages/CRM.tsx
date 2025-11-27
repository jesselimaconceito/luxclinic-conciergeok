import { Search, UserPlus, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { usePatients, useCreatePatient } from "@/hooks/usePatients";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export default function CRM() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: patients = [], isLoading } = usePatients();
  const { profile } = useAuth();
  const createPatient = useCreatePatient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PatientFormData>({
    defaultValues: {
      status: 'active',
    },
  });

  const status = watch('status');

  const onSubmit = async (data: PatientFormData) => {
    if (!profile?.organization_id) {
      toast.error('Erro: organização não identificada');
      return;
    }

    try {
      await createPatient.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        organization_id: profile.organization_id,
        total_visits: 0,
      });

      toast.success('Paciente cadastrado com sucesso!');
      setIsDialogOpen(false);
      reset();
    } catch (error: any) {
      console.error('Erro ao criar paciente:', error);
      toast.error(error.message || 'Erro ao cadastrar paciente');
    }
  };

  // Filtrar pacientes pela busca
  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(search) ||
      patient.email.toLowerCase().includes(search) ||
      patient.phone.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-1 md:mb-2">
            CRM
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Gerencie seus pacientes com cuidado
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <UserPlus className="h-4 w-4" />
              Adicionar Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Paciente</DialogTitle>
              <DialogDescription>
                Adicione um novo paciente ao seu sistema de gestão.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Ex: João da Silva"
                  {...register('name', { required: 'Nome é obrigatório' })}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@example.com"
                  {...register('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="(11) 98888-8888"
                  {...register('phone', { required: 'Telefone é obrigatório' })}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value: 'active' | 'inactive') =>
                    setValue('status', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPatient.isPending}>
                  {createPatient.isPending ? 'Criando...' : 'Criar Paciente'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative animate-fade-in-up">
        <Search className="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar pacientes por nome, email ou telefone..."
          className="pl-10 md:pl-12 h-11 md:h-12 bg-card border-border/50 focus:border-accent text-sm md:text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-2 md:grid-cols-4 animate-fade-in-up">
        <div className="card-luxury p-3 md:p-4">
          <p className="text-caption mb-1.5 md:mb-2 text-[10px] md:text-xs">Total de Pacientes</p>
          <p className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
            {patients.length}
          </p>
        </div>
        <div className="card-luxury p-3 md:p-4">
          <p className="text-caption mb-1.5 md:mb-2 text-[10px] md:text-xs">Ativos</p>
          <p className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-success">
            {patients.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="card-luxury p-3 md:p-4">
          <p className="text-caption mb-1.5 md:mb-2 text-[10px] md:text-xs">Inativos</p>
          <p className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-muted-foreground">
            {patients.filter(p => p.status === 'inactive').length}
          </p>
        </div>
        <div className="card-luxury p-3 md:p-4">
          <p className="text-caption mb-1.5 md:mb-2 text-[10px] md:text-xs">Total Visitas</p>
          <p className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-accent">
            {patients.reduce((sum, p) => sum + p.total_visits, 0)}
          </p>
        </div>
      </div>

      {/* Patient Cards Grid */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 card-luxury">
          <UserPlus className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? "Tente buscar com outros termos" : "Adicione seu primeiro paciente para começar"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient, index) => (
            <div
              key={patient.id}
              className="card-luxury group p-4 md:p-5 lg:p-6 animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              {/* Patient Header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 font-display text-base md:text-lg font-semibold text-accent">
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm md:text-base truncate">{patient.name}</h3>
                    <span
                      className={`text-xs font-medium ${
                        patient.status === "active"
                          ? "text-success"
                          : "text-muted-foreground"
                      }`}
                    >
                      {patient.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 rounded-full bg-accent/10 px-2.5 md:px-3 py-1 text-xs font-medium text-accent whitespace-nowrap">
                  {patient.total_visits} {patient.total_visits === 1 ? "visita" : "visitas"}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 border-t border-border/50 pt-3 md:pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                  <span className="truncate text-xs md:text-sm">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                  <span className="text-xs md:text-sm">{patient.phone}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-3 md:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 border-t border-border/50 pt-3 md:pt-4">
                <span className="text-xs text-muted-foreground">
                  Última visita: {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString('pt-BR') : 'Nunca'}
                </span>
                <button className="text-xs md:text-sm font-medium text-accent transition-colors hover:text-accent/80 self-start">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
