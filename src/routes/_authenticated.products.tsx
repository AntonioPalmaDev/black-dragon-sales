import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle
} from "lucide-react";
import { ProductModal } from "@/components/modals/ProductModal";
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

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            CATÁLOGO DE <span className="text-[#FF1F3D]">PRODUTOS</span>
          </h1>
          <p className="text-[#94a3b8] font-medium mt-1">Gerencie seu inventário e níveis de estoque.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-bold px-6"
        >
          <Plus className="mr-2 h-4 w-4" /> NOVO PRODUTO
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#1F1F1F] shadow-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
          <Input 
            placeholder="Pesquisar por nome ou SKU..." 
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
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Produto</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">SKU</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Categoria</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Estoque</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Preço Venda</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Carregando produtos...
                </TableCell>
              </TableRow>
            ) : filteredProducts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts?.map((product) => {
                const isLowStock = (product.stock_current ?? 0) <= (product.stock_min ?? 0);
                return (
                  <TableRow key={product.id} className="hover:bg-white/[0.02] transition-colors border-[#1F1F1F] group cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-[#0A0A0A] flex items-center justify-center border border-[#1F1F1F] group-hover:border-[#FF1F3D]/30 transition-colors">
                          <Package size={18} className="text-[#FF1F3D]" />
                        </div>
                        <span className="font-bold text-white group-hover:text-[#FF1F3D] transition-colors">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#475569] font-mono text-xs">{product.sku || "-"}</TableCell>
                    <TableCell className="text-[#94a3b8] text-xs font-medium">
                      {product.categories?.name || "Sem categoria"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-bold", isLowStock ? "text-[#FF1F3D]" : "text-white")}>
                          {product.stock_current} {product.unit_measure}
                        </span>
                        {isLowStock && <AlertTriangle size={14} className="text-[#FF1F3D] animate-pulse" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-black text-sm">
                      {formatCurrency(product.sale_price ?? 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-[#475569] hover:text-white transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#111111] border-[#1F1F1F] text-white">
                          <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive hover:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
