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
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            SISTEMA <span className="text-[#FF1F3D]">SETTINGS</span>
          </h1>
          <p className="text-[#94a3b8] font-medium mt-1">Gerencie as preferências e segurança do sistema.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-[#111111] border-[#1F1F1F] shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 font-bold uppercase tracking-tight">
              <User size={20} className="text-[#FF1F3D]" /> Perfil do Usuário
            </CardTitle>
            <CardDescription className="text-[#475569]">Atualize suas informações pessoais e avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#475569]">Nome de Exibição</Label>
                <Input defaultValue="Administrador" className="bg-[#0A0A0A] border-[#1F1F1F] text-white focus-visible:ring-[#FF1F3D]" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#475569]">Email</Label>
                <Input defaultValue="admin@blackdragons.com" className="bg-[#0A0A0A] border-[#1F1F1F] text-[#475569]" disabled />
              </div>
            </div>
            <Button className="bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-bold px-6">SALVAR ALTERAÇÕES</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#1F1F1F] shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 font-bold uppercase tracking-tight">
              <Shield size={20} className="text-[#FF1F3D]" /> Segurança Avançada
            </CardTitle>
            <CardDescription className="text-[#475569]">Controle de acesso e proteção de dados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between group">
              <div>
                <p className="text-sm font-bold text-white group-hover:text-[#FF1F3D] transition-colors">Autenticação em Duas Etapas</p>
                <p className="text-xs text-[#475569]">Adicione uma camada extra de segurança.</p>
              </div>
              <Switch className="data-[state=checked]:bg-[#FF1F3D]" />
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.02] pt-6 group">
              <div>
                <p className="text-sm font-bold text-white group-hover:text-[#FF1F3D] transition-colors">Alterar Senha de Acesso</p>
                <p className="text-xs text-[#475569]">Recomendado trocar a cada 90 dias.</p>
              </div>
              <Button variant="outline" className="border-[#1F1F1F] bg-[#0A0A0A] text-white hover:bg-white/5 font-bold">ALTERAR</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#1F1F1F] shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 font-bold uppercase tracking-tight">
              <Database size={20} className="text-[#FF1F3D]" /> Preferências do Sistema
            </CardTitle>
            <CardDescription className="text-[#475569]">Configurações de integração e processamento de dados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between group">
              <div>
                <p className="text-sm font-bold text-white group-hover:text-[#FF1F3D] transition-colors">Moeda Principal</p>
                <p className="text-xs text-[#475569]">Usada para cálculos e relatórios consolidados.</p>
              </div>
              <span className="text-sm font-black text-white">BRL (R$)</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.02] pt-6 group">
              <div>
                <p className="text-sm font-bold text-white group-hover:text-[#FF1F3D] transition-colors">Alertas de Estoque Crítico</p>
                <p className="text-xs text-[#475569]">Notificar quando atingir estoque mínimo configurado.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#FF1F3D]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
