import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "manager" | "seller";
export type ProfileStatus = "pending" | "approved" | "rejected";

interface CurrentUser {
  id: string;
  email: string | null;
  displayName: string | null;
  status: ProfileStatus | null;
  roles: AppRole[];
  isAdmin: boolean;
  loading: boolean;
}

export function useCurrentUser(): CurrentUser {
  const [state, setState] = useState<CurrentUser>({
    id: "",
    email: null,
    displayName: null,
    status: null,
    roles: [],
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) setState((s) => ({ ...s, loading: false }));
        return;
      }
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("display_name,email,status").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (!mounted) return;
      const roleList = (roles ?? []).map((r: any) => r.role as AppRole);
      setState({
        id: user.id,
        email: profile?.email ?? user.email ?? null,
        displayName: profile?.display_name ?? null,
        status: (profile?.status as ProfileStatus) ?? null,
        roles: roleList,
        isAdmin: roleList.includes("admin"),
        loading: false,
      });
    };

    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
