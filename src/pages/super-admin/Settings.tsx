import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SuperAdminSettings() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-purple-100">Configurações</h1>
        <p className="text-purple-400 mt-1">
          Configurações gerais do sistema
        </p>
      </div>

      {/* Settings Card */}
      <Card className="border-purple-800/30 bg-slate-900/40 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-purple-100">Configurações do Sistema</CardTitle>
              <CardDescription className="text-purple-400">
                Em breve: configurações avançadas do sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-purple-800/30 bg-slate-800/40 p-8 text-center">
            <p className="text-purple-400">
              Esta seção estará disponível em breve para configurações avançadas do sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

