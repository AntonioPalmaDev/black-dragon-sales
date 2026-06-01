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
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Concluída</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pendente</Badge>;
      case "cancelado":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Vendas</h1>
          <p className="text-muted-foreground">Monitore e registre suas operações comerciais.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Venda
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-secondary p-4 rounded-xl border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por número ou cliente..." 
            className="pl-10 bg-black/20 border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary overflow-hidden">
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow>
              <TableHead className="text-white">Nº Venda</TableHead>
              <TableHead className="text-white">Data</TableHead>
              <TableHead className="text-white">Cliente</TableHead>
              <TableHead className="text-white">Valor Total</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
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
                <TableRow key={sale.id} className="hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-sm text-primary">#{sale.sale_number}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-medium">{sale.clients?.name || "Consumidor Final"}</TableCell>
                  <TableCell className="text-white font-bold">{formatCurrency(sale.total_amount ?? 0)}</TableCell>
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
