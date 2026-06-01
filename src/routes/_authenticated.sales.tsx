import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  FileText, 
  XCircle,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/sales")({
  component: SalesPage,
});

function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: sales, isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredSales = sales?.filter((sale) =>
    sale.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sale_number?.toString().includes(searchTerm)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

    const getStatusBadge = (status: string) => {
    switch (status) {
      case "concluido":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-bold uppercase tracking-tighter">Concluída</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] font-bold uppercase tracking-tighter">Pendente</Badge>;
      case "cancelado":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-bold uppercase tracking-tighter">Cancelada</Badge>;
      default:
        return <Badge className="text-[10px] font-bold uppercase tracking-tighter">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            HISTÓRICO DE <span className="text-[#FF1F3D]">VENDAS</span>
          </h1>
          <p className="text-[#94a3b8] font-medium mt-1">Monitore e registre suas operações comerciais.</p>
        </div>
        <Button className="bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-bold px-6">
          <Plus className="mr-2 h-4 w-4" /> NOVA VENDA
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#1F1F1F] shadow-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
          <Input 
            placeholder="Pesquisar por número ou cliente..." 
            className="pl-10 bg-[#0A0A0A] border-none text-sm focus-visible:ring-1 focus-visible:ring-[#FF1F3D]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#1F1F1F] bg-[#111111] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/[0.01]">
            <TableRow className="hover:bg-transparent border-[#1F1F1F]">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Nº Venda</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Data</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Cliente</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Valor Total</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Status</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Carregando vendas...
                </TableCell>
              </TableRow>
            ) : filteredSales?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredSales?.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-white/[0.02] transition-colors border-[#1F1F1F] group cursor-pointer">
                  <TableCell className="font-mono text-sm text-[#FF1F3D] font-bold">#{sale.sale_number}</TableCell>
                  <TableCell className="text-[#475569] text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-[#475569]" />
                      {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-bold group-hover:text-[#FF1F3D] transition-colors">{sale.clients?.name || "Consumidor Final"}</TableCell>
                  <TableCell className="text-white font-black">{formatCurrency(sale.total_amount ?? 0)}</TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-secondary border-border text-white">
                        <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
                          <Eye className="mr-2 h-4 w-4" /> Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
                          <FileText className="mr-2 h-4 w-4" /> Comprovante
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-destructive hover:bg-destructive/10">
                          <XCircle className="mr-2 h-4 w-4" /> Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
