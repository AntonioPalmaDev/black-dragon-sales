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
} from "lucide-react";
import { ClientModal } from "@/components/modals/ClientModal";
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

export const Route = createFileRoute("/_authenticated/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            GESTÃO DE <span className="text-[#FF1F3D]">CLIENTES</span>
          </h1>
          <p className="text-[#94a3b8] font-medium mt-1">Gerencie sua base de clientes e parceiros estratégicos.</p>
        </div>
        <Button className="bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-bold px-6">
          <Plus className="mr-2 h-4 w-4" /> NOVO CLIENTE
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#1F1F1F] shadow-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
          <Input 
            placeholder="Pesquisar por nome, documento ou email..." 
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
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Nome</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Documento</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Email</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Telefone</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Status</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[#475569] h-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Carregando clientes...
                </TableCell>
              </TableRow>
            ) : filteredClients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredClients?.map((client) => (
                <TableRow key={client.id} className="hover:bg-white/[0.02] transition-colors border-[#1F1F1F] group cursor-pointer">
                  <TableCell className="font-bold text-white group-hover:text-[#FF1F3D] transition-colors">{client.name}</TableCell>
                  <TableCell className="text-[#475569] text-xs font-mono">{client.document || "-"}</TableCell>
                  <TableCell className="text-[#94a3b8] text-xs">{client.email || "-"}</TableCell>
                  <TableCell className="text-[#94a3b8] text-xs">{client.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={client.is_active ? "default" : "secondary"} className={cn("text-[10px] font-bold uppercase tracking-tighter", client.is_active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-[#1A1A1A] text-[#475569] border-[#1F1F1F]")}>
                      {client.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-secondary border-border text-white">
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
