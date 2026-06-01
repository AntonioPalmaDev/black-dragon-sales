import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "Clientes", icon: Users, to: "/clients" },
    { label: "Produtos", icon: Package, to: "/products" },
    { label: "Vendas", icon: ShoppingCart, to: "/sales" },
    { label: "Relatórios", icon: BarChart3, to: "/reports" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 h-screen border-r border-border bg-secondary transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-20 items-center justify-between px-6">
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="size-6 bg-primary rotate-45 flex-shrink-0" />
                  <span className="font-display text-lg font-bold uppercase tracking-tighter text-white">
                    BLACK DRAGONS
                  </span>
                </div>
              )}
              {isCollapsed && (
                <div className="mx-auto size-6 bg-primary rotate-45" />
              )}
            </div>

            <nav className="flex-1 space-y-2 px-4 py-6">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeProps={{ className: "bg-primary/10 text-primary border-primary" }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-white",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="size-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border p-4 space-y-2">
              <Link
                to="/settings"
                activeProps={{ className: "bg-primary/10 text-primary" }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white",
                  isCollapsed && "justify-center"
                )}
              >
                <Settings className="size-5 shrink-0" />
                {!isCollapsed && <span>Configurações</span>}
              </Link>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                  isCollapsed && "justify-center"
                )}
              >
                <LogOut className="size-5 shrink-0" />
                {!isCollapsed && <span>Sair</span>}
              </button>
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-24 z-50 rounded-full border border-border bg-secondary p-1 text-muted-foreground hover:text-white"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Nav */}
      {isMobile && (
        <>
          <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-secondary px-6">
            <div className="flex items-center gap-2">
              <div className="size-5 bg-primary rotate-45" />
              <span className="font-display text-sm font-bold uppercase tracking-tighter text-white">
                BLACK DRAGONS
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="text-white" />
            </Button>
          </header>

          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm pt-16">
              <nav className="flex flex-col gap-4 p-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-xl font-bold uppercase text-white"
                  >
                    <item.icon className="size-6 text-primary" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 text-xl font-bold uppercase text-destructive mt-4"
                >
                  <LogOut className="size-6" />
                  Sair
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      <main
        className={cn(
          "flex-1 transition-all duration-300",
          !isMobile && (isCollapsed ? "ml-20" : "ml-64"),
          isMobile && "pt-16"
        )}
      >
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
