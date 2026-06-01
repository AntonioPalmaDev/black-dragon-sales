import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserPlus 
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

export const Route = createFileRoute("/_authenticated/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");

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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes e parceiros.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-secondary p-4 rounded-xl border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por nome, documento ou email..." 
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
              <TableHead className="text-white">Nome</TableHead>
              <TableHead className="text-white">Documento</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Telefone</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
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
                <TableRow key={client.id} className="hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white">{client.name}</TableCell>
                  <TableCell className="text-muted-foreground">{client.document || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{client.email || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{client.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={client.is_active ? "default" : "secondary"} className={client.is_active ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}>
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
