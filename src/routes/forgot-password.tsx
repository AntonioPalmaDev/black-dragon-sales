import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Email de recuperação enviado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao solicitar recuperação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#FF1F3D] shadow-[0_0_30px_rgba(255,31,61,0.3)] mb-6">
            <span className="font-display text-2xl font-black text-white">BD</span>
          </div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
            RECUPERAR <span className="text-[#FF1F3D]">SENHA</span>
          </h1>
          <p className="mt-2 text-[#94a3b8] font-medium">
            Enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F1F1F] bg-[#111111] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleResetRequest} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-[#475569]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@blackdragons.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0A0A0A] border-[#1F1F1F] text-white focus-visible:ring-[#FF1F3D] h-12"
              />
            </div>

            <Button type="submit" className="w-full bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-black h-12 text-base shadow-[0_10px_20px_rgba(255,31,61,0.2)]" disabled={loading}>
              {loading ? "ENVIANDO..." : (
                <>
                  <Mail className="mr-2 h-5 w-5" /> ENVIAR LINK
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm">
            <a href="/login" className="text-[#475569] hover:text-white flex items-center justify-center gap-2 font-bold transition-colors">
              <ArrowLeft size={14} /> Voltar para o Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
