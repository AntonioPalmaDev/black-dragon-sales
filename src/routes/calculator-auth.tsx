import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calculator, 
  Lock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/calculator-auth" as any)({
  component: CalculatorAuthPage,
});

const TOKEN_KEY = "mecbd_token";
const VALID_TOKEN = "MECBD";

function CalculatorAuthPage() {
  const [tokenInput, setTokenInput] = useState("");
  const navigate = useNavigate();

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.toUpperCase() === VALID_TOKEN) {
      localStorage.setItem(TOKEN_KEY, VALID_TOKEN);
      toast.success("Acesso liberado!");
      navigate({ to: "/calculator" as any });
    } else {
      toast.error("Token inválido!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-md bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 shadow-2xl border-t-4 border-t-[#FF1F3D] animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-[#FF1F3D]/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-[#FF1F3D]" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Área Restrita</h1>
          <p className="text-[#94a3b8] text-center mt-2 text-sm">
            Esta calculadora é exclusiva para membros autorizados. Insira seu token de acesso para continuar.
          </p>
        </div>
        <form onSubmit={handleTokenSubmit} className="space-y-4">
          <Input
            placeholder="Digite seu token..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="bg-[#0A0A0A] border-[#1F1F1F] text-white text-center h-12 text-lg font-bold tracking-widest focus:border-[#FF1F3D]"
          />
          <Button type="submit" className="w-full bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-black h-12">
            ACESSAR CALCULADORA <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
