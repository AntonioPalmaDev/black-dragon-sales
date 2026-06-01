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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary rotate-45 mb-4 shadow-lg shadow-primary/20">
            <div className="size-4 bg-background rounded-full" />
          </div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tighter text-white">
            RECUPERAR SENHA
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-secondary p-8 shadow-2xl">
          <form onSubmit={handleResetRequest} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@blackdragons.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/20 border-border"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Enviando..." : (
                <>
                  <Mail className="mr-2 h-4 w-4" /> Enviar Link
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm">
            <a href="/login" className="text-muted-foreground hover:text-white flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> Voltar para o Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
