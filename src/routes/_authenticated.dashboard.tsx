import { createFileRoute } from "@tanstack/react-router";
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Calendar,
  Filter,
  MoreVertical,
  Activity,
  ChevronDown,
  Wallet,
  LayoutDashboard,
  BarChart2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  subDays,
  isWithinInterval,
  startOfDay,
  endOfDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useMemo } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [dateRange, setDateRange] = useState<"7d" | "15d" | "30d" | "current_month">("current_month");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ["dashboard-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: saleItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ["dashboard-sale-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_items")
        .select("*, products(*)");
      if (error) throw error;
      return data;
    },
  });

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["dashboard-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);

    if (dateRange === "7d") {
      start = startOfDay(subDays(now, 6));
    } else if (dateRange === "15d") {
      start = startOfDay(subDays(now, 14));
    } else if (dateRange === "30d") {
      start = startOfDay(subDays(now, 29));
    } else {
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return isWithinInterval(saleDate, { start, end });
    });
  }, [sales, dateRange]);

  const isLoading = isLoadingSales || isLoadingItems || isLoadingClients;

  // Calculate KPIs
  const totalFaturamento = filteredSales?.reduce((acc, sale) => acc + (sale.total_amount || 0), 0) || 0;
  
  const totalLucroLiquido = filteredSales?.reduce((acc, sale) => acc + (Number(sale.net_profit) || 0), 0) || 0;

  const totalVendas = filteredSales?.length || 0;
  const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0;
  const clientesAtivos = clients?.filter(c => c.is_active).length || 0;
  const produtosVendidos = saleItems?.reduce((acc, item) => {
    // Check if item belongs to a filtered sale
    const sale = filteredSales.find(s => s.id === item.sale_id);
    if (sale) return acc + (item.quantity || 0);
    return acc;
  }, 0) || 0;

  // Revenue Chart Data
  const chartInterval = useMemo(() => {
    const now = new Date();
    if (dateRange === "7d") {
      return { start: subDays(now, 6), end: now };
    } else if (dateRange === "15d") {
      return { start: subDays(now, 14), end: now };
    } else if (dateRange === "30d") {
      return { start: subDays(now, 29), end: now };
    } else {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [dateRange]);

  const revenueData = eachDayOfInterval(chartInterval).map(date => {
    const daySales = filteredSales?.filter(sale => isSameDay(new Date(sale.created_at), date)) || [];
    const revenue = daySales.reduce((acc, sale) => acc + (sale.total_amount || 0), 0);
    
    // Calculate net profit based on items in those sales
    const dayProfit = saleItems?.reduce((acc, item) => {
      const sale = daySales.find(s => s.id === item.sale_id);
      if (sale) {
        // If we have product cost info, use it. 
        // net_profit in sale might be 0 if not updated by trigger, so we calculate here
        const product = item.products;
        const cost = product?.cost_price || 0;
        const price = item.unit_price || 0;
        return acc + ((price - cost) * (item.quantity || 1));
      }
      return acc;
    }, 0) || 0;

    return {
      name: format(date, "dd/MM"),
      revenue,
      netProfit: dayProfit
    };
  });

  // Top Products
  const productStats = saleItems?.reduce((acc: any, item: any) => {
    const productName = item.products?.name || "Desconhecido";
    if (!acc[productName]) {
      acc[productName] = { name: productName, sales: 0, revenue: 0 };
    }
    acc[productName].sales += item.quantity;
    acc[productName].revenue += item.total_item;
    return acc;
  }, {});

  const topProducts = Object.values(productStats || {})
    .sort((a: any, b: any) => b.sales - a.sales)
    .slice(0, 4)
    .map((p: any) => ({
      ...p,
      revenue: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.revenue)
    }));

  // Top Clients
  const clientStats = sales?.reduce((acc: any, sale: any) => {
    const clientName = sale.clients?.name || "Consumidor Final";
    if (!acc[clientName]) {
      acc[clientName] = { name: clientName, revenue: 0, count: 0 };
    }
    acc[clientName].revenue += sale.total_amount || 0;
    acc[clientName].count += 1;
    return acc;
  }, {});

  const topClients = Object.values(clientStats || {})
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 4)
    .map((c: any) => ({
      name: c.name,
      revenue: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.revenue),
      meta: c.revenue > 10000 ? "Elite" : c.revenue > 5000 ? "VIP" : "Standard"
    }));

  // Recent Operations
  const recentOperations = sales?.slice(0, 5).map(sale => ({
    id: `#${sale.sale_number}`,
    client: sale.clients?.name || "Consumidor Final",
    date: format(new Date(sale.created_at), "dd/MM HH:mm"),
    status: sale.status,
    amount: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(sale.total_amount || 0)
  })) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatCompactNumber = (value: number) => {
    if (value >= 1000000) {
      const formatted = (value / 1000000).toFixed(1);
      return `R$ ${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}M`;
    }
    if (value >= 1000) {
      const formatted = (value / 1000).toFixed(1);
      return `R$ ${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}k`;
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF1F3D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Header Section with Filters */}
      <div className="flex flex-col gap-6 bg-[#111111] p-6 border border-[#1F1F1F] rounded-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase">
              DASHBOARD <span className="text-[#FF1F3D]">EXECUTIVO</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569] group-focus-within:text-[#FF1F3D] transition-colors" />
              <Input 
                placeholder="Buscar operação..." 
                className="pl-10 w-[200px] md:w-[300px] bg-[#0A0A0A] border-[#1F1F1F] text-white focus:border-[#FF1F3D] focus:ring-1 focus:ring-[#FF1F3D] transition-all"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-[#1F1F1F] bg-[#0A0A0A] text-white hover:bg-white/5 h-10 px-4">
                  <Calendar className="mr-2 h-4 w-4 text-[#FF1F3D]" />
                  {dateRange === "7d" ? "Últimos 7 dias" : 
                   dateRange === "15d" ? "Últimos 15 dias" : 
                   dateRange === "30d" ? "Últimos 30 dias" : "Mês Atual"}
                  <ChevronDown className="ml-2 h-4 w-4 text-[#475569]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#111111] border-[#1F1F1F] text-white">
                <DropdownMenuItem onClick={() => setDateRange("7d")} className="hover:bg-white/5">Últimos 7 dias</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("15d")} className="hover:bg-white/5">Últimos 15 dias</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("30d")} className="hover:bg-white/5">Últimos 30 dias</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("current_month")} className="hover:bg-white/5">Mês Atual</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="border-[#1F1F1F] bg-[#0A0A0A] text-white hover:bg-white/5 h-10 px-4">
              <Filter className="mr-2 h-4 w-4 text-[#FF1F3D]" />
              Filtros
            </Button>
            <Button className="bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-bold h-10 px-6 shadow-[0_0_20px_rgba(255,31,61,0.2)]">
              EXPORTAR
            </Button>
          </div>
        </div>
      </div>

      {/* Main Large Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-9 bg-[#111111] border-[#1F1F1F] shadow-2xl overflow-hidden group border-t-2 border-t-[#FF1F3D]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/[0.02] bg-white/[0.01]">
            <div>
              <CardTitle className="text-xl font-bold text-white tracking-tight uppercase">Performance de Receita</CardTitle>
              <p className="text-xs text-[#475569] mt-0.5">
                Análise consolidada de faturamento e lucro ({
                  dateRange === "7d" ? "7 dias" : 
                  dateRange === "15d" ? "15 dias" : 
                  dateRange === "30d" ? "30 dias" : "Mês Atual"
                })
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-lg border border-[#1F1F1F]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setChartType("area")}
                  className={cn("h-8 px-2", chartType === "area" ? "bg-[#FF1F3D] text-white" : "text-[#475569]")}
                >
                  <Activity className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setChartType("bar")}
                  className={cn("h-8 px-2", chartType === "bar" ? "bg-[#FF1F3D] text-white" : "text-[#475569]")}
                >
                  <BarChart2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-6 bg-[#0A0A0A] p-2 px-4 rounded-lg border border-[#1F1F1F]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#FF1F3D] shadow-[0_0_5px_#FF1F3D]" />
                  <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">Receita Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#475569]" />
                  <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">Lucro Final</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF1F3D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF1F3D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0A0A0A", 
                      border: "1px solid #1F1F1F",
                      borderRadius: "12px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                      color: "white"
                    }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                    cursor={{ stroke: '#FF1F3D', strokeWidth: 1 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Receita Total"
                    stroke="#FF1F3D" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netProfit" 
                    name="Lucro Final"
                    stroke="#475569" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                  />
                </AreaChart>
              ) : (
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0A0A0A", 
                      border: "1px solid #1F1F1F",
                      borderRadius: "12px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                      color: "white"
                    }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                    cursor={{ fill: 'rgba(255,31,61,0.1)' }}
                  />
                  <Bar dataKey="revenue" name="Receita Total" fill="#FF1F3D" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="netProfit" name="Lucro Final" fill="#475569" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-[#111111] border-[#1F1F1F] shadow-xl border-l-2 border-l-[#FF1F3D]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#FF1F3D]">Metas Globais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <StatRow label="Receita Total Acumulada" value={formatCurrency(totalFaturamento)} />
              <StatRow label="Ticket Médio" value={formatCurrency(ticketMedio)} />
              <StatRow label="Produtividade" value="+12.5%" isGreen />
              
              <div className="pt-6 border-t border-[#1F1F1F]">
                <p className="text-[10px] uppercase font-bold text-[#475569] mb-4 tracking-widest">Meta de Vendas</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#475569] uppercase font-bold">Progresso</span>
                      <span className="text-sm font-black text-white">{formatCurrency(totalLucroLiquido)}</span>
                    </div>
                    <span className="text-[#FF1F3D] font-black text-xl">{Math.round((totalLucroLiquido / 200000) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#0A0A0A] rounded-full overflow-hidden border border-[#1F1F1F]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF1F3D] to-[#D91B34] shadow-[0_0_15px_rgba(255,31,61,0.5)] transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (totalLucroLiquido / 200000) * 100)}%` }} 
                    />
                  </div>
                  <p className="text-[10px] text-[#475569] text-center italic">R$ 200.000,00 projetados para este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#1F1F1F] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Activity className="h-12 w-12 text-[#FF1F3D]" />
            </div>
            <CardContent className="p-6">
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-1">Status da Operação</p>
              <h3 className="text-xl font-black text-white uppercase mb-4">Saudável</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-[#475569] uppercase font-medium">Uptime</p>
                  <p className="text-xs font-bold text-white">99.9%</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#475569] uppercase font-medium">Sincronia</p>
                  <p className="text-xs font-bold text-green-500">Real-time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* KPI Grid - Now below the main chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <KPICard 
          title="Lucro Final" 

          value={formatCurrency(totalLucroLiquido)} 

          change="+8.4%" 
          trend="up" 
          icon={Wallet} 
        />
        <KPICard 
          title="Receita Total" 
          value={formatCurrency(totalFaturamento)} 
          change="+12.1%" 
          trend="up" 
          icon={TrendingUp} 
        />
        <KPICard 
          title="Lucro Final" 
          value={formatCurrency(totalLucroLiquido)} 
          change="+5.2%" 
          trend="up" 
          icon={Activity} 
        />
        <KPICard 
          title="Ticket Médio" 
          value={formatCurrency(ticketMedio)} 
          change="-2.4%" 
          trend="down" 
          icon={ShoppingCart} 
        />
        <KPICard 
          title="Total Vendas" 
          value={totalVendas.toString()} 
          change="+15%" 
          trend="up" 
          icon={Package} 
        />
        <KPICard 
          title="Clientes Ativos" 
          value={clientesAtivos.toString()} 
          change="+4" 
          trend="up" 
          icon={Users} 
        />
        <KPICard 
          title="Produtos Vendidos" 
          value={produtosVendidos.toString()} 
          change="+42" 
          trend="up" 
          icon={Package} 
        />
        <KPICard 
          title="ROI Médio" 
          value="3.2x" 
          change="vs. anterior" 
          trend="up" 
          icon={TrendingUp} 
          isHighlight
        />
      </div>

      {/* Second Line Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <IndicatorPanel title="Top Produtos" data={topProducts} type="product" />
        <IndicatorPanel 
          title="Top Clientes" 
          data={topClients} 
          type="client" 
        />
        <IndicatorPanel 
          title="Últimas Operações" 
          data={recentOperations.map(op => ({ name: op.id, revenue: op.amount, time: op.date }))} 
          type="operation" 
        />
        <IndicatorPanel 
          title="Status Metas" 
          data={[
            { name: "Receita Total", value: Math.min(100, Math.round((totalFaturamento / 250000) * 100)), color: "#FF1F3D" },
            { name: "Novos Clientes", value: Math.min(100, Math.round((clientesAtivos / 50) * 100)), color: "#475569" },
            { name: "Ticket Médio", value: Math.min(100, Math.round((ticketMedio / 500) * 100)), color: "#FF1F3D" },
            { name: "Vendas", value: Math.min(100, Math.round((totalVendas / 100) * 100)), color: "#475569" },
          ]} 
          type="goal" 
        />
      </div>

      {/* Recent Operations Table */}
      <Card className="bg-[#111111] border-[#1F1F1F] shadow-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/[0.02] p-6">
          <div>
            <CardTitle className="text-xl font-bold text-white tracking-tight uppercase">Operações Recentes</CardTitle>
            <p className="text-xs text-[#475569] mt-0.5">Últimas movimentações do sistema</p>
          </div>
          <Button variant="outline" className="border-[#1F1F1F] bg-[#0A0A0A] text-[#FF1F3D] font-bold text-xs">
            VER TODAS
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1F1F1F] bg-white/[0.01]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#475569]">ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#475569]">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#475569]">Data/Hora</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#475569]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#475569] text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {recentOperations.map((op, idx) => (
                  <tr key={idx} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-xs font-mono text-[#475569]">{op.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-[#1A1A1A] border border-[#1F1F1F] flex items-center justify-center text-[10px] font-bold text-white">
                          {op.client.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-white group-hover:text-[#FF1F3D] transition-colors">{op.client}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#475569]">{op.date}</td>
                    <td className="px-6 py-4">
                    <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter border",
                        op.status === 'concluido' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                        op.status === 'cancelado' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      )}>
                        {op.status === 'concluido' ? 'Concluída' : op.status === 'cancelado' ? 'Cancelada' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-white text-right">{op.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-components
function StatRow({ label, value, isGreen }: { label: string; value: string; isGreen?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-[#94a3b8] font-medium">{label}</span>
      <span className={cn("text-sm font-bold", isGreen ? "text-green-500" : "text-white")}>{value}</span>
    </div>
  );
}

function IndicatorPanel({ title, data, type }: { title: string; data: any[]; type: string }) {
  return (
    <Card className="bg-[#111111] border-[#1F1F1F] shadow-lg hover:border-[#FF1F3D]/30 transition-all">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">{title}</CardTitle>
        <MoreVertical className="h-4 w-4 text-[#475569]" />
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center group-hover:bg-[#FF1F3D]/10 transition-colors">
                {type === 'product' && <Package className="h-4 w-4 text-[#FF1F3D]" />}
                {type === 'client' && <Users className="h-4 w-4 text-[#FF1F3D]" />}
                {type === 'operation' && <Activity className="h-4 w-4 text-[#FF1F3D]" />}
                {type === 'goal' && <div className="text-[10px] font-bold text-[#FF1F3D]">{idx + 1}</div>}
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-[#FF1F3D] transition-colors">{item.name}</p>
                <p className="text-[10px] text-[#475569]">{item.sales || item.meta || item.time || `${item.value}% concluído`}</p>
              </div>
            </div>
            <p className="text-xs font-black text-white">{item.revenue || item.value + '%'}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: any;
  isHighlight?: boolean;
}

function KPICard({ title, value, change, trend, icon: Icon, isHighlight }: KPICardProps) {
  return (
    <Card className={cn(
      "border-[#1F1F1F] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group h-full",
      isHighlight ? "bg-[#FF1F3D] shadow-[0_10px_30px_rgba(255,31,61,0.2)]" : "bg-[#111111] hover:bg-[#151515] shadow-xl"
    )}>
      <div className={cn(
        "absolute -right-4 -bottom-4 opacity-5 transition-transform group-hover:scale-110 duration-500",
        isHighlight ? "text-black" : "text-white"
      )}>
        <Icon size={80} />
      </div>
      <CardContent className="p-4 flex flex-col justify-between h-full relative z-10">
        <div>
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            isHighlight ? "text-white/80" : "text-[#475569]"
          )}>{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className={cn(
              "text-xl font-black tracking-tighter",
              isHighlight ? "text-white" : "text-white"
            )}>{value}</h3>
          </div>
        </div>
        {!isHighlight && (
          <div className="flex items-center gap-1.5 mt-4">
            <div className={cn(
              "flex items-center text-[10px] font-black px-1.5 py-0.5 rounded",
              trend === 'up' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {trend === 'up' ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
              {change}
            </div>
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-tight text-[#475569]"
            )}>vs. anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
