"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, Line, LineChart, Area, AreaChart, CartesianGrid } from "recharts";
import { CalendarIcon, TrendingUpIcon, ClockIcon, CalendarDaysIcon } from "lucide-react";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart";

interface TemporalChartsProps {
    expedicoes: Array<{
        id: number;
        nome: string;
        status: string;
        data_inicio: string;
        data_fim: string;
    }>;
}

export function TemporalCharts({ expedicoes }: TemporalChartsProps) {
    const calcularDuracao = (dataInicio: string, dataFim: string) => {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        return Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    };

    const expedicoesComDuracao = expedicoes
        .filter(e => e.data_inicio && e.data_fim)
        .map(e => ({
            ...e,
            duracao: calcularDuracao(e.data_inicio, e.data_fim)
        }));

    // Configuração dos charts
    const chartConfig = {
        expedicoes: {
            label: "Expedições",
            color: "var(--color-primary)",
        },
        duracao: {
            label: "Duração (dias)",
            color: "var(--color-primary)",
        },
        concluidas: {
            label: "Concluídas",
            color: "var(--color-chart-1)",
        },
        emAndamento: {
            label: "Em Andamento",
            color: "var(--color-chart-2)",
        },
        canceladas: {
            label: "Canceladas",
            color: "var(--color-chart-3)",
        },
        planejamento: {
            label: "Em Planejamento",
            color: "var(--color-chart-4)",
        },
        total: {
            label: "Total",
            color: "var(--color-primary)",
        }
    };

    // Dados para distribuição mensal
    const expedicoesPorMes = expedicoes.reduce((acc, e) => {
        const mes = new Date(e.data_inicio).getMonth();
        acc[mes] = (acc[mes] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const nomesMeses = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const dadosMensais = nomesMeses.map((mes, index) => ({
        mes,
        expedicoes: expedicoesPorMes[index] || 0
    }));

    // Dados para duração por status
    const duracaoPorStatus = expedicoesComDuracao.reduce((acc, e) => {
        if (!acc[e.status]) {
            acc[e.status] = { total: 0, count: 0 };
        }
        acc[e.status].total += e.duracao;
        acc[e.status].count += 1;
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const dadosDuracao = Object.entries(duracaoPorStatus).map(([status, data]) => ({
        status,
        duracaoMedia: data.count > 0 ? Math.round(data.total / data.count) : 0,
        quantidade: data.count
    }));

    // Dados para tendência temporal com mais detalhes
    const expedicoesPorAno = expedicoes.reduce((acc, e) => {
        const ano = new Date(e.data_inicio).getFullYear();
        if (!acc[ano]) {
            acc[ano] = { total: 0, concluidas: 0, emAndamento: 0, canceladas: 0, planejamento: 0 };
        }
        acc[ano].total += 1;
        if (e.status === "Concluída") acc[ano].concluidas += 1;
        if (e.status === "Em andamento") acc[ano].emAndamento += 1;
        if (e.status === "Cancelada") acc[ano].canceladas += 1;
        if (e.status === "Em planejamento") acc[ano].planejamento += 1;
        return acc;
    }, {} as Record<number, { total: number; concluidas: number; emAndamento: number; canceladas: number; planejamento: number }>);

    const dadosTendencia = Object.entries(expedicoesPorAno)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([ano, data]) => ({
            ano: parseInt(ano),
            total: data.total,
            concluidas: data.concluidas,
            emAndamento: data.emAndamento,
            canceladas: data.canceladas,
            planejamento: data.planejamento
        }));

    // Dados para análise de sazonalidade
    const expedicoesPorEstacao = expedicoes.reduce((acc, e) => {
        const mes = new Date(e.data_inicio).getMonth();
        let estacao = '';
        if (mes >= 2 && mes <= 4) estacao = 'Primavera';
        else if (mes >= 5 && mes <= 7) estacao = 'Verão';
        else if (mes >= 8 && mes <= 10) estacao = 'Outono';
        else estacao = 'Inverno';
        
        acc[estacao] = (acc[estacao] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const dadosSazonalidade = Object.entries(expedicoesPorEstacao).map(([estacao, quantidade]) => ({
        estacao,
        quantidade
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Distribuição Mensal */}
            <Card className="flex flex-col h-full p-4 gap-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Distribuição Mensal
                    <CalendarIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-foreground">
                    Número de expedições iniciadas por mês
                </div>
                <div className="flex-1">
                    <ChartContainer config={chartConfig}>
                        <BarChart data={dadosMensais}>
                            <XAxis
                                dataKey="mes"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                cursor={false}
                            />
                            <Bar
                                dataKey="expedicoes"
                                fill="var(--color-primary)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </Card>

            {/* Gráfico de Duração por Status */}
            <Card className="flex flex-col h-full p-4 gap-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Duração por Status
                    <ClockIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-foreground">
                    Duração média das expedições por status
                </div>
                <div className="flex-1">
                    <ChartContainer config={chartConfig}>
                        <BarChart data={dadosDuracao}>
                            <XAxis
                                dataKey="status"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `${value}d`}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                cursor={false}
                            />
                            <Bar
                                dataKey="duracaoMedia"
                                fill="var(--color-primary)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </Card>

            {/* Gráfico de Tendência Temporal */}
            <Card className="flex flex-col h-full p-4 gap-2 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Tendência Temporal</CardTitle>
                    <CardDescription>Evolução das expedições por ano e status</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <AreaChart
                            accessibilityLayer
                            data={dadosTendencia}
                            margin={{ left: 12, right: 12 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="ano"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => String(value)}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <defs>
                                <linearGradient id="fillConcluidas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillEmAndamento" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillCanceladas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-chart-3)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillPlanejamento" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-chart-4)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-chart-4)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <Area
                                dataKey="concluidas"
                                type="natural"
                                fill="url(#fillConcluidas)"
                                fillOpacity={0.4}
                                stroke="var(--color-chart-1)"
                                stackId="a"
                            />
                            <Area
                                dataKey="emAndamento"
                                type="natural"
                                fill="url(#fillEmAndamento)"
                                fillOpacity={0.4}
                                stroke="var(--color-chart-2)"
                                stackId="a"
                            />
                            <Area
                                dataKey="canceladas"
                                type="natural"
                                fill="url(#fillCanceladas)"
                                fillOpacity={0.4}
                                stroke="var(--color-chart-3)"
                                stackId="a"
                            />
                            <Area
                                dataKey="planejamento"
                                type="natural"
                                fill="url(#fillPlanejamento)"
                                fillOpacity={0.4}
                                stroke="var(--color-chart-4)"
                                stackId="a"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2 leading-none font-medium">
                                Evolução anual de expedições <TrendingUpIcon className="h-4 w-4" />
                            </div>
                            <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                {dadosTendencia.length > 0 ? `${dadosTendencia[0].ano} - ${dadosTendencia[dadosTendencia.length-1].ano}` : ""}
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            {/* Gráfico de Sazonalidade */}
            <Card className="flex flex-col h-full p-4 gap-2 lg:col-span-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Análise Sazonal
                    <CalendarDaysIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-foreground">
                    Distribuição de expedições por estação do ano
                </div>
                <div className="flex-1">
                    <ChartContainer config={chartConfig}>
                        <BarChart data={dadosSazonalidade}>
                            <XAxis
                                dataKey="estacao"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                cursor={false}
                            />
                            <Bar
                                dataKey="quantidade"
                                fill="var(--color-primary)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </Card>
        </div>
    );
} 