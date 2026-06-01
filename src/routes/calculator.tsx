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
  ArrowRight
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

export const Route = createFileRoute("/calculator" as any)({
  component: CalculatorPage,
});

const TOKEN_KEY = "mecbd_token";
const VALID_TOKEN = "MECBD";

function CalculatorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState("");
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const [items, setItems] = useState([{ id: Date.now(), price: 0, quantity: 1, cost: 0 }]);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
        setIsLogged(true);
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

  const addItem = () => {
    setItems([...items, { id: Date.now(), price: 0, quantity: 1, cost: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalCost = items.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);
  const profit = total - totalCost;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!isAuthenticated && !showTokenModal) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF1F3D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 font-sans text-white">
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-6 w-6 text-[#FF1F3D]" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-[#FF1F3D]">Simulador Financeiro</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                CALCULADORA <span className="text-[#FF1F3D]">BLACK DRAGONS</span>
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-[#111111] border-[#1F1F1F] shadow-2xl">
                <CardHeader className="border-b border-white/[0.02] flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-white">Itens da Simulação</CardTitle>
                  <Button 
                    onClick={addItem}
                    size="sm"
                    className="bg-[#FF1F3D] hover:bg-[#D91B34] text-white text-[10px] font-bold h-8"
                  >
                    <Plus className="mr-1 h-3 w-3" /> ADICIONAR ITEM
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#1F1F1F]">
                    {items.map((item, index) => (
                      <div key={item.id} className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 group">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">Preço de Venda</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#475569]">R$</span>
                            <Input 
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                              className="bg-[#0A0A0A] border-[#1F1F1F] pl-8 h-10 text-white font-mono focus:border-[#FF1F3D]"
                            />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">Custo do Corpo</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#475569]">R$</span>
                            <Input 
                              type="number"
                              value={item.cost}
                              onChange={(e) => updateItem(item.id, "cost", Number(e.target.value))}
                              className="bg-[#0A0A0A] border-[#1F1F1F] pl-8 h-10 text-white font-mono focus:border-[#FF1F3D]"
                            />
                          </div>
                        </div>
                        <div className="w-24 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">Qtd</label>
                          <Input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                            className="bg-[#0A0A0A] border-[#1F1F1F] h-10 text-white font-mono focus:border-[#FF1F3D]"
                          />
                        </div>
                        <div className="flex items-end justify-end md:pb-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(item.id)}
                            className="text-[#475569] hover:text-[#FF1F3D] hover:bg-[#FF1F3D]/10"
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#111111] border-[#1F1F1F]">
                  <CardContent className="p-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#475569] block mb-2">Desconto Geral</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#475569]">R$</span>
                      <Input 
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="bg-[#0A0A0A] border-[#1F1F1F] pl-8 h-12 text-white font-mono text-lg focus:border-[#FF1F3D]"
                      />
                    </div>
                  </CardContent>
                </Card>
                <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 flex items-center justify-between overflow-hidden relative group">
                  <div className="absolute right-0 top-0 h-full w-1 bg-[#FF1F3D]" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#475569] mb-1">Status da Operação</p>
                    <p className="text-xl font-black text-white uppercase tracking-tighter">PRONTO PARA <span className="text-[#FF1F3D]">VENDER</span></p>
                  </div>
                  <Target className="h-8 w-8 text-[#1F1F1F] group-hover:text-[#FF1F3D]/20 transition-colors" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-[#FF1F3D] border-[#FF1F3D] shadow-[0_0_50px_rgba(255,31,61,0.15)] text-white overflow-hidden relative">
                <div className="absolute -right-8 -top-8 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Faturamento Bruto</p>
                    <p className="text-2xl font-black font-mono tracking-tighter">{formatCurrency(subtotal)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Custo Total (Corpo)</p>
                    <p className="text-2xl font-black font-mono tracking-tighter">{formatCurrency(totalCost)}</p>
                  </div>
                  <div className="h-px bg-white/20 my-4" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Valor Final (Receita)</p>
                    <p className="text-4xl font-black font-mono tracking-tighter">{formatCurrency(total)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#1F1F1F] shadow-xl border-t-4 border-t-emerald-500 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">Margem Real</p>
                      <p className="text-xs font-black text-emerald-500">{total > 0 ? ((profit / total) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#475569] mb-1">Lucro Líquido Final</p>
                  <p className="text-3xl font-black text-white font-mono tracking-tighter group-hover:text-emerald-500 transition-colors">
                    {formatCurrency(profit)}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#475569]">
                    <Wallet size={12} className="text-[#FF1F3D]" />
                    <span>Cálculo baseado no preço final</span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={() => window.print()}
                variant="outline" 
                className="w-full border-[#1F1F1F] bg-[#0A0A0A] text-white hover:bg-white/5 h-12 font-bold uppercase tracking-widest"
              >
                Gerar Relatório PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
