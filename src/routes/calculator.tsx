import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calculator, 
  Trash2, 
  Plus, 
  Target, 
  Wallet, 
  TrendingUp,
  Lock,
  ArrowRight,
  Wrench,
  Hammer,
  Gauge,
  ShoppingCart,
  Copy,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/calculator")({
  component: CalculatorPage,
});

const TOKEN_KEY = "mecbd_token";
const VALID_TOKEN = "MECBD";

function CalculatorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState("");
  
  // Itens state
  const [commonItems, setCommonItems] = useState<{ [key: string]: number }>({});
  const [simpleActions, setSimpleActions] = useState<{ [key: string]: number }>({});
  const [tuningValue, setTuningValue] = useState<string>("");

  const ITENS_COMUNS = [
    { name: "Chave Inglesa", price: 700 },
    { name: "Elevador Hidráulico", price: 900 },
    { name: "Ferramentas", price: 400 },
    { name: "Ferramentas Premium", price: 1100 },
    { name: "Pé de Cabra", price: 1200 },
    { name: "Pneu", price: 200 },
  ];

  const ACOES_SIMPLES = [
    { name: "Reparo do Veículo", price: 1000 },
    { name: "Pneu Instalado", price: 375 },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
      } else {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken === VALID_TOKEN) {
          setIsAuthenticated(true);
        } else {
          setShowTokenModal(true);
        }
      }
    };
    checkAuth();
  }, []);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.toUpperCase() === VALID_TOKEN) {
      localStorage.setItem(TOKEN_KEY, VALID_TOKEN);
      setIsAuthenticated(true);
      setShowTokenModal(false);
      toast.success("Acesso liberado!");
    } else {
      toast.error("Token inválido!");
    }
  };

  const updateQuantity = (category: 'common' | 'simple', name: string, delta: number) => {
    const setter = category === 'common' ? setCommonItems : setSimpleActions;
    const current = category === 'common' ? commonItems : simpleActions;
    
    setter({
      ...current,
      [name]: Math.max(0, (current[name] || 0) + delta)
    });
  };

  const calculateCategoryTotal = (items: typeof ITENS_COMUNS, selected: { [key: string]: number }) => {
    return items.reduce((acc, item) => acc + (item.price * (selected[item.name] || 0)), 0);
  };

  const tuningsCost = Number(tuningValue) || 0;
  const tuningsToCharge = tuningsCost * 1.2; // Assuming 20% margin as default for "margem padrão"
  
  const commonTotal = calculateCategoryTotal(ITENS_COMUNS, commonItems);
  const simpleTotal = calculateCategoryTotal(ACOES_SIMPLES, simpleActions);
  const totalGeral = tuningsToCharge + commonTotal + simpleTotal;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleClear = () => {
    setCommonItems({});
    setSimpleActions({});
    setTuningValue("");
    toast.info("Calculadora limpa");
  };

  const handleCopy = () => {
    const text = `--- ORÇAMENTO BLACK DRAGONS ---
Tunagens: ${formatCurrency(tuningsToCharge)}
Itens Comuns: ${formatCurrency(commonTotal)}
Ações Simples: ${formatCurrency(simpleTotal)}
------------------------------
TOTAL GERAL: ${formatCurrency(totalGeral)}`;

    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  if (!isAuthenticated && !showTokenModal) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF1F3D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 md:p-8 font-sans text-white">
      <Dialog open={showTokenModal} onOpenChange={() => {}}>
        <DialogContent className="bg-[#111111] border-[#1F1F1F] text-white sm:max-w-md border-t-4 border-t-[#FF1F3D]">
          <DialogHeader className="flex flex-col items-center">
            <div className="h-16 w-16 bg-[#FF1F3D]/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-[#FF1F3D]" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Área Restrita</DialogTitle>
            <DialogDescription className="text-[#94a3b8] text-center">
              Esta calculadora é exclusiva para membros autorizados. Insira seu token de acesso (MECBD) para continuar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTokenSubmit} className="space-y-4 mt-4">
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
        </DialogContent>
      </Dialog>

      {isAuthenticated && (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF1F3D] p-2 rounded-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Calculadora Black Dragons</h1>
              <p className="text-[#94a3b8] text-sm">Orçamentos de customização e reparos automotivos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Itens Comuns */}
              <Card className="bg-[#111111] border-[#1F1F1F]">
                <CardHeader className="flex flex-row items-center gap-2 py-4">
                  <Wrench className="h-5 w-5 text-[#FF1F3D]" />
                  <CardTitle className="text-lg font-bold">Itens Comuns</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ITENS_COMUNS.map((item) => (
                    <div key={item.name} className="bg-[#0A0A0A] p-4 rounded-xl border border-[#1F1F1F] flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{item.name}</span>
                        <span className="text-[#94a3b8] text-xs">{formatCurrency(item.price)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-[#111111] rounded-lg border border-[#1F1F1F]">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-[#94a3b8] hover:text-[#FF1F3D]"
                            onClick={() => updateQuantity('common', item.name, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-bold text-sm">
                            {commonItems[item.name] || 0}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-[#94a3b8] hover:text-[#FF1F3D]"
                            onClick={() => updateQuantity('common', item.name, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button 
                          className="flex-1 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white text-xs font-bold h-8"
                          onClick={() => updateQuantity('common', item.name, 1)}
                        >
                          + Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Ações Simples */}
              <Card className="bg-[#111111] border-[#1F1F1F]">
                <CardHeader className="flex flex-row items-center gap-2 py-4">
                  <Hammer className="h-5 w-5 text-[#FF1F3D]" />
                  <CardTitle className="text-lg font-bold">Ações Simples</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ACOES_SIMPLES.map((item) => (
                    <div key={item.name} className="bg-[#0A0A0A] p-4 rounded-xl border border-[#1F1F1F] flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{item.name}</span>
                        <span className="text-[#94a3b8] text-xs">{formatCurrency(item.price)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-[#111111] rounded-lg border border-[#1F1F1F]">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-[#94a3b8] hover:text-[#FF1F3D]"
                            onClick={() => updateQuantity('simple', item.name, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-bold text-sm">
                            {simpleActions[item.name] || 0}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-[#94a3b8] hover:text-[#FF1F3D]"
                            onClick={() => updateQuantity('simple', item.name, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button 
                          className="flex-1 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white text-xs font-bold h-8"
                          onClick={() => updateQuantity('simple', item.name, 1)}
                        >
                          + Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tunagens */}
              <Card className="bg-[#111111] border-[#1F1F1F]">
                <CardHeader className="flex flex-row items-center gap-2 py-4">
                  <Gauge className="h-5 w-5 text-[#FF1F3D]" />
                  <CardTitle className="text-lg font-bold">Tunagens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor do Painel</label>
                    <Input 
                      placeholder="Ex: 50000"
                      type="number"
                      value={tuningValue}
                      onChange={(e) => setTuningValue(e.target.value)}
                      className="bg-[#0A0A0A] border-[#1F1F1F] h-12 focus:border-[#FF1F3D]"
                    />
                    <p className="text-[#94a3b8] text-xs">Informe o valor exibido no painel do jogo. O valor cobrado ao cliente aplica a margem padrão.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#1F1F1F]">
                      <p className="text-[#94a3b8] text-xs mb-1">Custo (Painel)</p>
                      <p className="text-lg font-bold">{formatCurrency(tuningsCost)}</p>
                    </div>
                    <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#FF1F3D]/20">
                      <p className="text-[#94a3b8] text-xs mb-1">Cobrar do Cliente</p>
                      <p className="text-lg font-bold text-[#FF1F3D]">{formatCurrency(tuningsToCharge)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Resumo */}
              <Card className="bg-[#111111] border-[#1F1F1F] sticky top-8">
                <CardHeader className="flex flex-row items-center gap-2 py-4 border-b border-[#1F1F1F]">
                  <ShoppingCart className="h-5 w-5 text-[#FF1F3D]" />
                  <CardTitle className="text-lg font-bold">Resumo do Orçamento</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94a3b8]">Tunagens</span>
                      <span className="font-semibold">{formatCurrency(tuningsToCharge)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94a3b8]">Itens Comuns</span>
                      <span className="font-semibold">{formatCurrency(commonTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94a3b8]">Ações Simples</span>
                      <span className="font-semibold">{formatCurrency(simpleTotal)}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#1F1F1F]">
                    <div className="flex justify-between items-center">
                      <span className="font-black uppercase tracking-wider text-xs">TOTAL GERAL</span>
                      <span className="text-2xl font-black text-[#FF1F3D]">{formatCurrency(totalGeral)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={handleClear}
                      className="border-[#1F1F1F] hover:bg-[#1A1A1A] font-bold"
                    >
                      Limpar
                    </Button>
                    <Button 
                      onClick={handleCopy}
                      className="bg-[#FF1F3D] hover:bg-[#D91B34] font-bold"
                    >
                      <Copy className="mr-2 h-4 w-4" /> $ Copiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
