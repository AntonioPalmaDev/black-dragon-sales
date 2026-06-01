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
  ChevronDown
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

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const revenueData = [
  { name: "01/06", revenue: 4500, billing: 5200 },
  { name: "05/06", revenue: 5200, billing: 6100 },
  { name: "10/06", revenue: 4800, billing: 5800 },
  { name: "15/06", revenue: 6100, billing: 7200 },
  { name: "20/06", revenue: 5900, billing: 6900 },
  { name: "25/06", revenue: 7500, billing: 8800 },
  { name: "30/06", revenue: 8200, billing: 9500 },
];

const topProducts = [
  { name: "Dragon Alpha Pro", sales: 145, revenue: "R$ 12.450" },
  { name: "Black Edition v2", sales: 132, revenue: "R$ 10.200" },
  { name: "Obsidian Case", sales: 98, revenue: "R$ 8.900" },
  { name: "SaaS Enterprise", sales: 87, revenue: "R$ 7.500" },
];

function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">
            DASHBOARD <span className="text-[#FF1F3D]">EXECUTIVO</span>
          </h1>
          <p className="text-[#94a3b8] font-medium mt-1">
            Análise de performance e receita da operação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-[#1F1F1F] bg-[#111111] text-white hover:bg-white/5">
            <Calendar className="mr-2 h-4 w-4 text-[#FF1F3D]" />
            Últimos 30 dias
          </Button>
          <Button className="bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-bold px-6">
            EXPORTAR
          </Button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[#111111] border border-[#1F1F1F] rounded-xl shadow-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
          <Input 
            placeholder="Busca global..." 
            className="pl-10 bg-[#0A0A0A] border-none text-sm focus-visible:ring-1 focus-visible:ring-[#FF1F3D]"
          />
        </div>
        <FilterSelect label="Status" />
        <FilterSelect label="Categoria" />
        <FilterSelect label="Responsável" />
        <FilterSelect label="Pagamento" />
        <Button size="icon" variant="outline" className="border-[#1F1F1F] bg-[#111111] shrink-0">
          <Filter className="h-4 w-4 text-[#94a3b8]" />
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <KPICard 
          title="Receita Líquida" 
          value="R$ 145.231" 
          change="+12.5%" 
          trend="up" 
          icon={Wallet} 
        />
        <KPICard 
          title="Faturamento" 
          value="R$ 182.430" 
          change="+8.2%" 
          trend="up" 
          icon={TrendingUp} 
        />
        <KPICard 
          title="Lucro Líquido" 
          value="R$ 42.150" 
          change="+15.3%" 
          trend="up" 
          icon={Activity} 
        />
        <KPICard 
          title="Ticket Médio" 
          value="R$ 342,00" 
          change="-2.4%" 
          trend="down" 
          icon={ShoppingCart} 
        />
        <KPICard 
          title="Total Vendas" 
          value="452" 
          change="+5.4%" 
          trend="up" 
          icon={Package} 
        />
        <KPICard 
          title="Clientes Ativos" 
          value="1.240" 
          change="+18%" 
          trend="up" 
          icon={Users} 
        />
        <KPICard 
          title="Produtos Vendidos" 
          value="3.840" 
          change="+10.2%" 
          trend="up" 
          icon={Package} 
        />
        <KPICard 
          title="Crescimento" 
          value="+24.5%" 
          change="vs. anterior" 
          trend="up" 
          icon={TrendingUp} 
          isHighlight
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <Card className="lg:col-span-7 bg-[#111111] border-[#1F1F1F] shadow-2xl overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/[0.02]">
            <div>
              <CardTitle className="text-xl font-bold text-white tracking-tight">Movimentação de Receita Real</CardTitle>
              <p className="text-xs text-[#475569] mt-0.5">Receita líquida + faturamento consolidado</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#FF1F3D]" />
                <span className="text-[10px] text-[#94a3b8] uppercase">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#475569]" />
                <span className="text-[10px] text-[#94a3b8] uppercase">Faturamento</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
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
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0A0A0A", 
                    border: "1px solid #1F1F1F",
                    borderRadius: "8px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                  }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FF1F3D" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={2000}
                />
                <Area 
                  type="monotone" 
                  dataKey="billing" 
                  stroke="#475569" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-[#111111] border-[#1F1F1F] h-full shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#FF1F3D]">Métricas de Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <StatRow label="Receita do Período" value="R$ 45.890" />
              <StatRow label="Média Diária" value="R$ 1.529" />
              <StatRow label="Crescimento" value="+24.5%" isGreen />
              
              <div className="pt-6 border-t border-[#1F1F1F]">
                <p className="text-[10px] uppercase font-bold text-[#475569] mb-4">Meta Mensal</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white">R$ 145.231 / R$ 200.000</span>
                    <span className="text-[#FF1F3D] font-bold">72%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF1F3D] w-[72%] shadow-[0_0_10px_rgba(255,31,61,0.5)]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second Line Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <IndicatorPanel title="Top Produtos" data={topProducts} type="product" />
        <IndicatorPanel 
          title="Top Clientes" 
          data={[
            { name: "Tech Solutions", revenue: "R$ 45.200", meta: "Elite" },
            { name: "Global Trade", revenue: "R$ 38.900", meta: "VIP" },
            { name: "Nova Corp", revenue: "R$ 32.100", meta: "VIP" },
            { name: "Delta Group", revenue: "R$ 28.500", meta: "Standard" },
          ]} 
          type="client" 
        />
        <IndicatorPanel 
          title="Últimas Operações" 
          data={[
            { name: "Venda #842", revenue: "R$ 1.200", time: "Há 2 min" },
            { name: "Venda #841", revenue: "R$ 850", time: "Há 15 min" },
            { name: "Venda #840", revenue: "R$ 3.400", time: "Há 42 min" },
            { name: "Venda #839", revenue: "R$ 2.100", time: "Há 1h" },
          ]} 
          type="operation" 
        />
        <IndicatorPanel 
          title="Status Metas" 
          data={[
            { name: "Faturamento", value: 85, color: "#FF1F3D" },
            { name: "Novos Clientes", value: 64, color: "#475569" },
            { name: "Retenção", value: 92, color: "#FF1F3D" },
            { name: "Satisfação", value: 78, color: "#475569" },
          ]} 
          type="goal" 
        />
      </div>
    </div>
  );
}

// Sub-components
function FilterSelect({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A] border border-white/[0.03] rounded-lg cursor-pointer hover:bg-white/5 transition-colors shrink-0">
      <span className="text-xs text-[#475569] font-medium">{label}:</span>
      <span className="text-xs text-white font-bold">Todos</span>
      <ChevronDown className="h-3 w-3 text-[#FF1F3D]" />
    </div>
  );
}

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
      <CardContent className="p-4 flex flex-col justify-between h-full">
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
        <div className="mt-2 flex items-center gap-1">
          {trend === "up" ? (
            <ArrowUpRight size={12} className={isHighlight ? "text-white" : "text-green-500"} />
          ) : (
            <ArrowDownRight size={12} className={isHighlight ? "text-white" : "text-red-500"} />
          )}
          <span className={cn(
            "text-[10px] font-bold",
            isHighlight ? "text-white" : trend === "up" ? "text-green-500" : "text-red-500"
          )}>
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Add these to make it work with the icons we imported
const Wallet = DollarSign;
