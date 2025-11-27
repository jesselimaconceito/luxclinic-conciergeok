import { Plug } from "lucide-react";

export default function Integrations() {
  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <Plug className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Integração
            </h1>
          </div>
        </div>
        <p className="text-base md:text-lg text-muted-foreground">
          Conecte suas ferramentas e automatize seu fluxo de trabalho
        </p>
      </div>

      {/* Conteúdo será adicionado aqui */}
      <div className="card-luxury p-8 text-center animate-fade-in-up">
        <Plug className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Página em Construção
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure suas integrações para automatizar processos
        </p>
      </div>
    </div>
  );
}
