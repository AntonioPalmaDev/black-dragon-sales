import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check approval status
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", data.user!.id)
        .maybeSingle();

      if (profile?.status === "pending") {
        await supabase.auth.signOut();
        toast.warning("Seu cadastro está aguardando aprovação do administrador.");
        setLoading(false);
        return;
      }
      if (profile?.status === "rejected") {
        await supabase.auth.signOut();
        toast.error("Seu acesso foi negado pelo administrador.");
        setLoading(false);
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login com Google");
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
            BLACK <span className="text-[#FF1F3D]">DRAGONS</span>
          </h1>
          <p className="mt-2 text-[#94a3b8] font-medium">
            Acesse sua central de comando de vendas.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F1F1F] bg-[#111111] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleLogin} className="space-y-6">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-[#475569]">Senha</Label>
                <Link to="/forgot-password" data-size="sm" className="text-xs text-[#FF1F3D] hover:underline font-bold">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0A0A0A] border-[#1F1F1F] text-white focus-visible:ring-[#FF1F3D] h-12"
              />
            </div>

            <Button type="submit" className="w-full bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-black h-12 text-base shadow-[0_10px_20px_rgba(255,31,61,0.2)]" disabled={loading}>
              {loading ? "PROCESSANDO..." : (
                <>
                  <LogIn className="mr-2 h-5 w-5" /> ENTRAR NO SISTEMA
                </>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#1F1F1F]"></span>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-[#111111] px-4 text-[#475569]">Ou continue com</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            type="button" 
            className="w-full border-[#1F1F1F] bg-[#0A0A0A] text-white hover:bg-white/5 h-12 font-bold"
            onClick={handleGoogleLogin}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="mr-2 h-4 w-4" />
            GOOGLE ACCOUNT
          </Button>

          <p className="mt-8 text-center text-sm text-[#94a3b8]">
            Não tem uma conta?{" "}
            <Link to="/signup" className="text-[#FF1F3D] hover:underline font-bold">
              Crie agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
