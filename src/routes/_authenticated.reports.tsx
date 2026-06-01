import { createFileRoute } from "@tanstack/react-router";
import { 
  FileDown, 
  Table as TableIcon, 
  BarChart2, 
  Calendar,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const reports = [
    { title: "Vendas por Período", description: "Relatório detalhado de todas as vendas em um intervalo de datas.", icon: BarChart2 },
    { title: "Lucro por Período", description: "Cálculo de margem e lucro líquido baseado no custo dos produtos.", icon: BarChart2 },
    { title: "Movimentação de Estoque", description: "Histórico de entradas e saídas de produtos.", icon: BarChart2 },
    { title: "Produtos Mais Vendidos", description: "Ranking de performance por volume e faturamento.", icon: BarChart2 },
    { title: "Clientes que Mais Compram", description: "Identifique seus melhores clientes e ticket médio.", icon: BarChart2 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Relatórios</h1>
          <p className="text-muted-foreground">Analise os dados da sua operação em profundidade.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 bg-secondary p-4 rounded-xl border border-border items-center">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-muted-foreground" />
          <Select defaultValue="this-month">
            <SelectTrigger className="w-[180px] bg-black/20 border-border text-white">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="bg-secondary border-border text-white">
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7-days">Últimos 7 dias</SelectItem>
              <SelectItem value="this-month">Este Mês</SelectItem>
              <SelectItem value="last-month">Mês Passado</SelectItem>
              <SelectItem value="this-year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" className="border-border text-white hover:bg-white/5">
          <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, i) => (
          <Card key={i} className="bg-secondary border-border hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="size-10 rounded-lg bg-black/50 flex items-center justify-center border border-border group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                <report.icon className="size-5 text-primary" />
              </div>
              <CardTitle className="text-white text-lg">{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                {report.description}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="bg-black/40 text-xs border border-border hover:bg-white/5">
                  <FileDown className="mr-2 h-3 w-3" /> PDF
                </Button>
                <Button size="sm" variant="secondary" className="bg-black/40 text-xs border border-border hover:bg-white/5">
                  <TableIcon className="mr-2 h-3 w-3" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
