import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
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
  Menu,
  Calculator,
  History,
  FileText,
  Wallet,
  Terminal,
  User
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "Clientes", icon: Users, to: "/clients" },
    { label: "Produtos", icon: Package, to: "/products" },
    { label: "Operações de Vendas", icon: ShoppingCart, to: "/sales" },
    { label: "Financeiro", icon: Wallet, to: "/finance" },
    { label: "Relatórios", icon: BarChart3, to: "/reports" },
    { label: "Histórico", icon: History, to: "/history" },
    { label: "Logs", icon: FileText, to: "/logs" },
    { label: "Calculadora", icon: Calculator, to: "/calculator" },
    { label: "Configurações", icon: Settings, to: "/settings" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-[#050505] font-sans text-white">
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 h-screen border-r border-[#1F1F1F] bg-[#0A0A0A] transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-20 items-center px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF1F3D] shadow-[0_0_15px_rgba(255,31,61,0.3)]">
                  <span className="font-display text-xl font-black text-white">BD</span>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span className="font-display text-lg font-bold uppercase leading-none tracking-tighter text-white">
                      BLACK DRAGONS
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-[#FF1F3D]">Enterprise</span>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto custom-scrollbar">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to as any}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-[#FF1F3D]/10 text-white" 
                        : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#FF1F3D]" />
                    )}
                    <item.icon className={cn(
                      "size-5 shrink-0 transition-colors",
                      isActive ? "text-[#FF1F3D]" : "group-hover:text-[#FF1F3D]"
                    )} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#1F1F1F] p-4 bg-[#0A0A0A]">
              <div className={cn(
                "flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer",
                isCollapsed && "justify-center"
              )}>
                <Avatar className="h-9 w-9 border border-[#1F1F1F]">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#1A1A1A] text-white text-xs">AD</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">Administrador</span>
                    <span className="text-[10px] text-[#94a3b8] truncate">admin@blackdragons.com</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className={cn(
                  "mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#94a3b8] hover:bg-[#FF1F3D]/10 hover:text-[#FF1F3D] transition-all",
                  isCollapsed && "justify-center"
                )}
              >
                <LogOut className="size-5 shrink-0" />
                {!isCollapsed && <span>Sair do Sistema</span>}
              </button>
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-[#1F1F1F] bg-[#0A0A0A] text-[#94a3b8] shadow-lg transition-transform hover:scale-110 hover:text-white"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Nav */}
      {isMobile && (
        <>
          <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#1F1F1F] bg-[#0A0A0A] px-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-[#FF1F3D] flex items-center justify-center">
                <span className="text-sm font-black text-white">BD</span>
              </div>
              <span className="font-display text-sm font-bold uppercase tracking-tighter text-white">
                BLACK DRAGONS
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="text-white" />
            </Button>
          </header>

          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-[#050505]/95 backdrop-blur-md pt-16">
              <nav className="flex flex-col gap-1 p-6 h-[calc(100vh-64px)] overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to as any}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 rounded-lg px-4 py-4 text-lg font-bold uppercase transition-all",
                        isActive ? "bg-[#FF1F3D]/10 text-[#FF1F3D]" : "text-white"
                      )}
                    >
                      <item.icon className={cn("size-6", isActive ? "text-[#FF1F3D]" : "text-[#94a3b8]")} />
                      {item.label}
                    </Link>
                  );
                })}
                <div className="mt-auto pt-6 border-t border-[#1F1F1F]">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-4 py-4 text-lg font-bold uppercase text-[#FF1F3D]"
                  >
                    <LogOut className="size-6" />
                    Sair
                  </button>
                </div>
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
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
