import { createFileRoute } from "@tanstack/react-router";
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const data = [
  { name: "Jan", sales: 4000, revenue: 2400 },
  { name: "Fev", sales: 3000, revenue: 1398 },
  { name: "Mar", sales: 2000, revenue: 9800 },
  { name: "Abr", sales: 2780, revenue: 3908 },
  { name: "Mai", sales: 1890, revenue: 4800 },
  { name: "Jun", sales: 2390, revenue: 3800 },
];

const pieData = [
  { name: "Eletrônicos", value: 400 },
  { name: "Roupas", value: 300 },
  { name: "Casa", value: 300 },
  { name: "Outros", value: 200 },
];

const COLORS = ["#FF2E2E", "#475569", "#1f2937", "#94a3b8"];

function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Executivo</h1>
        <p className="text-muted-foreground">Bem-vindo ao centro de comando Black Dragons.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Total Vendas (Mês)" 
          value="R$ 45.231,89" 
          change="+20.1%" 
          trend="up" 
          icon={DollarSign} 
        />
        <KPICard 
          title="Faturamento Total" 
          value="R$ 128.430,00" 
          change="+12.5%" 
          trend="up" 
          icon={TrendingUp} 
        />
        <KPICard 
          title="Ticket Médio" 
          value="R$ 342,00" 
          change="-2.4%" 
          trend="down" 
          icon={ShoppingCart} 
        />
        <KPICard 
          title="Clientes Ativos" 
          value="1,240" 
          change="+18%" 
          trend="up" 
          icon={Users} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Evolução de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid #1f2937" }}
                  itemStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="revenue" fill="#FF2E2E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid #1f2937" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3 bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Top Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-black/50 flex items-center justify-center rounded border border-border">
                      <Package size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Produto Alpha {i}</p>
                      <p className="text-xs text-muted-foreground">SKU-00{i}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white">R$ 1.200,00</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-4 bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white">Faturamento por Mês</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid #1f2937" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#FF2E2E" strokeWidth={2} dot={{ fill: "#FF2E2E" }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, change, trend, icon: Icon }) {
  return (
    <Card className="bg-secondary border-border overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon size={48} />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend === "up" ? (
            <ArrowUpRight size={14} className="text-green-500" />
          ) : (
            <ArrowDownRight size={14} className="text-red-500" />
          )}
          <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
            {change}
          </span>{" "}
          em relação ao mês anterior
        </p>
      </CardContent>
    </Card>
  );
}
