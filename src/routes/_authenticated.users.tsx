import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCurrentUser, type AppRole, type ProfileStatus } from "@/hooks/use-current-user";
import { Check, X, ShieldAlert, Users as UsersIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersAdminPage,
});

interface Row {
  id: string;
  email: string | null;
  display_name: string | null;
  status: ProfileStatus;
  created_at: string;
  role: AppRole;
}

function UsersAdminPage() {
  const me = useCurrentUser();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase.from("profiles").select("id,email,display_name,status,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    if (pErr || rErr) {
      toast.error("Erro ao carregar usuários");
      setLoading(false);
      return;
    }
    const roleMap = new Map<string, AppRole>();
    (roles ?? []).forEach((r: any) => roleMap.set(r.user_id, r.role));
    setRows(
      (profiles ?? []).map((p: any) => ({
        id: p.id,
        email: p.email,
        display_name: p.display_name,
        status: p.status,
        created_at: p.created_at,
        role: roleMap.get(p.id) ?? "seller",
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    if (me.isAdmin) load();
  }, [me.isAdmin]);

  const updateStatus = async (id: string, status: ProfileStatus) => {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    load();
  };

  const updateRole = async (userId: string, newRole: AppRole) => {
    // Replace existing role
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) return toast.error(delErr.message);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) return toast.error(error.message);
    toast.success("Cargo atualizado");
    load();
  };

  if (me.loading) return <div className="text-[#94a3b8]">Carregando...</div>;

  if (!me.isAdmin) {
    return (
      <div className="rounded-2xl border border-[#1F1F1F] bg-[#111111] p-10 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-[#FF1F3D] mb-4" />
        <h2 className="font-display text-2xl font-black uppercase text-white">Acesso restrito</h2>
        <p className="mt-2 text-[#94a3b8]">Apenas administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FF1F3D]/10">
          <UsersIcon className="h-6 w-6 text-[#FF1F3D]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tighter text-white">
            Central de <span className="text-[#FF1F3D]">Usuários</span>
          </h1>
          <p className="text-sm text-[#94a3b8]">Aprove cadastros e gerencie cargos.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1F1F1F] bg-[#111111] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0A0A0A] border-b border-[#1F1F1F]">
            <tr>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-[#475569]">Nome</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-[#475569]">Email</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-[#475569]">Status</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-[#475569]">Cargo</th>
              <th className="text-right p-4 text-xs font-bold uppercase tracking-widest text-[#475569]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="p-8 text-center text-[#94a3b8]">Carregando...</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-[#94a3b8]">Nenhum usuário cadastrado.</td></tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-[#1F1F1F] hover:bg-white/5">
                <td className="p-4 text-white font-medium">{u.display_name ?? "—"}</td>
                <td className="p-4 text-[#94a3b8]">{u.email ?? "—"}</td>
                <td className="p-4">
                  {u.status === "approved" && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Aprovado</Badge>}
                  {u.status === "pending" && <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Pendente</Badge>}
                  {u.status === "rejected" && <Badge className="bg-[#FF1F3D]/15 text-[#FF1F3D] border-[#FF1F3D]/30">Rejeitado</Badge>}
                </td>
                <td className="p-4">
                  <Select
                    value={u.role}
                    onValueChange={(v) => updateRole(u.id, v as AppRole)}
                    disabled={u.id === me.id}
                  >
                    <SelectTrigger className="w-36 bg-[#0A0A0A] border-[#1F1F1F] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0A] border-[#1F1F1F] text-white">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="seller">Vendedor</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    {u.status !== "approved" && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => updateStatus(u.id, "approved")}
                      >
                        <Check className="h-4 w-4 mr-1" /> Aprovar
                      </Button>
                    )}
                    {u.status !== "rejected" && u.id !== me.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#1F1F1F] bg-transparent text-[#FF1F3D] hover:bg-[#FF1F3D]/10"
                        onClick={() => updateStatus(u.id, "rejected")}
                      >
                        <X className="h-4 w-4 mr-1" /> Rejeitar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
