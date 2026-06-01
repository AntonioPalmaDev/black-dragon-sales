import { createFileRoute } from "@tanstack/react-router";
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Database,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as preferências e segurança do sistema.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User size={20} className="text-primary" /> Perfil
            </CardTitle>
            <CardDescription>Atualize suas informações pessoais e avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white">Nome de Exibição</Label>
                <Input defaultValue="Administrador" className="bg-black/20 border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Email</Label>
                <Input defaultValue="admin@blackdragons.com" className="bg-black/20 border-border" disabled />
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90">Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield size={20} className="text-primary" /> Segurança
            </CardTitle>
            <CardDescription>Controle de acesso e senhas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Autenticação em Duas Etapas</p>
                <p className="text-xs text-muted-foreground">Adicione uma camada extra de segurança.</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div>
                <p className="text-sm font-medium text-white">Alterar Senha</p>
                <p className="text-xs text-muted-foreground">Recomendado trocar a cada 90 dias.</p>
              </div>
              <Button variant="outline" className="border-border text-white hover:bg-white/5">Alterar</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database size={20} className="text-primary" /> Sistema
            </CardTitle>
            <CardDescription>Configurações de integração e dados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Moeda Principal</p>
                <p className="text-xs text-muted-foreground">Usada para cálculos e relatórios.</p>
              </div>
              <span className="text-sm font-bold text-white">BRL (R$)</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div>
                <p className="text-sm font-medium text-white">Alertas de Estoque</p>
                <p className="text-xs text-muted-foreground">Notificar quando atingir estoque mínimo.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
