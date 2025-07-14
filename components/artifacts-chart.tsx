"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Artefato {
  id: number;
  nome: string;
  Expedicao_id: number;
  valor_estimado: number;
  data_encontrado: string;
}

interface Expedicao {
  id: number;
  nome: string;
  data_inicio: string;
  data_fim: string;
  status: string;
}

interface ChartData {
  date: string;
  artefatos: number;
  valor_total: number;
}

interface ArtifactsChartProps {
  expedicoesAtivas: Expedicao[];
  artefatos: Artefato[];
  loading: boolean;
}

const chartConfig = {
  artefatos: {
    label: "Artefatos Encontrados",
    color: "var(--primary)",
  },
  valor_total: {
    label: "Valor Total (R$)",
    color: "oklch(0.7 0.15 73.85)",
  },
} satisfies ChartConfig;

export function ArtifactsChart({ expedicoesAtivas, artefatos, loading }: ArtifactsChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d");

  // Calcular dados do gráfico
  const chartData: ChartData[] = React.useMemo(() => {
    if (loading || !expedicoesAtivas.length || !artefatos.length) {
      return [];
    }

    const idsExpedicoesAtivas = expedicoesAtivas.map(exp => exp.id);
    const artefatosEncontrados = artefatos.filter(artefato => 
      idsExpedicoesAtivas.includes(artefato.Expedicao_id)
    );

    const artefatosPorDia = new Map<string, { count: number; valor: number }>();
    
    artefatosEncontrados.forEach(artefato => {
      const data = new Date(artefato.data_encontrado);
      const dataFormatada = data.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const existing = artefatosPorDia.get(dataFormatada) || { count: 0, valor: 0 };
      artefatosPorDia.set(dataFormatada, {
        count: existing.count + 1,
        valor: existing.valor + artefato.valor_estimado
      });
    });

    return Array.from(artefatosPorDia.entries())
      .map(([date, { count, valor }]) => ({ 
        date, 
        artefatos: count,
        valor_total: Math.round(valor / 1000) // Converter para milhares para melhor visualização
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expedicoesAtivas, artefatos, loading]);

  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return [];

    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    return chartData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [chartData, timeRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value * 1000); // Multiplicar por 1000 pois convertemos para milhares
  };

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b p-4 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Descobertas Arqueológicas</CardTitle>
          <CardDescription>
            Artefatos encontrados e valor total por período
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Selecionar período"
          >
            <SelectValue placeholder="Últimos 3 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 3 meses
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 dias
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 dias
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-[200px] w-full" />
            <div className="flex items-center justify-center gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : filteredData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillArtefatos" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillValor" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.7 0.15 73.85)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.7 0.15 73.85)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("pt-BR", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("pt-BR", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    formatter={(value, name) => {
                      if (name === "valor_total") {
                        return [formatCurrency(value as number), "Valor Total"];
                      }
                      return [value, "Artefatos"];
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="valor_total"
                type="natural"
                fill="url(#fillValor)"
                stroke="oklch(0.7 0.15 73.85)"
                stackId="a"
              />
              <Area
                dataKey="artefatos"
                type="natural"
                fill="url(#fillArtefatos)"
                stroke="var(--primary)"
                stackId="a"
              />
              {/* ChartLegend removed to fix linter error */}
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl">🏺</div>
              <p className="text-sm">Nenhum artefato encontrado no período selecionado</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 