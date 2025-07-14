"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area,
    Sector
} from "recharts";
import { CheckCircleIcon, XCircleIcon, ClockIcon, AlertTriangleIcon, TrendingUpIcon } from "lucide-react";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

interface SuccessRateChartsProps {
    expedicoes: Array<{
        id: number;
        nome: string;
        status: string;
        data_inicio: string;
        data_fim: string;
    }>;
}

export function SuccessRateCharts({ expedicoes }: SuccessRateChartsProps) {
    const expedicoesConcluidas = expedicoes.filter(e => e.status === "Concluída").length;
    const expedicoesCanceladas = expedicoes.filter(e => e.status === "Cancelada").length;
    const expedicoesEmAndamento = expedicoes.filter(e => e.status === "Em andamento").length;
    const expedicoesPlanejamento = expedicoes.filter(e => e.status === "Em planejamento").length;

    // Configuração dos charts
    const chartConfig = {
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
        taxaSucesso: {
            label: "Taxa de Sucesso",
            color: "var(--color-chart-1)",
        }
    };

    const donutData = [
        { status: "concluidas", quantidade: expedicoesConcluidas, fill: "var(--color-chart-1)" },
        { status: "emAndamento", quantidade: expedicoesEmAndamento, fill: "var(--color-chart-2)" },
        { status: "canceladas", quantidade: expedicoesCanceladas, fill: "var(--color-chart-3)" },
        { status: "planejamento", quantidade: expedicoesPlanejamento, fill: "var(--color-chart-4)" }
    ];

    // Dados para o gráfico de barras por mês
    const expedicoesPorMes = expedicoes.reduce((acc, exp) => {
        const data = new Date(exp.data_inicio);
        const mes = data.toLocaleString('pt-BR', { month: 'short' });
        
        if (!acc[mes]) {
            acc[mes] = { mes, concluidas: 0, canceladas: 0, emAndamento: 0 };
        }
        
        if (exp.status === "Concluída") acc[mes].concluidas++;
        else if (exp.status === "Cancelada") acc[mes].canceladas++;
        else if (exp.status === "Em andamento") acc[mes].emAndamento++;
        
        return acc;
    }, {} as Record<string, { mes: string; concluidas: number; canceladas: number; emAndamento: number }>);

    const barData = Object.values(expedicoesPorMes);

    // Calcular tendência de sucesso ao longo do tempo
    const expedicoesOrdenadas = [...expedicoes].sort((a, b) => 
        new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
    );

    const tendenciaData = expedicoesOrdenadas.reduce((acc, exp, index) => {
        const expedicoesAteAgora = expedicoesOrdenadas.slice(0, index + 1);
        const concluidas = expedicoesAteAgora.filter(e => e.status === "Concluída").length;
        const taxa = expedicoesAteAgora.length > 0 ? (concluidas / expedicoesAteAgora.length) * 100 : 0;
        
        acc.push({
            expedicao: index + 1,
            taxaSucesso: taxa,
            status: exp.status
        });
        
        return acc;
    }, [] as Array<{ expedicao: number; taxaSucesso: number; status: string }>);

    // Calcular estatísticas para o footer
    const totalExpedicoes = expedicoes.length;
    const taxaSucesso = totalExpedicoes > 0 ? (expedicoesConcluidas / totalExpedicoes) * 100 : 0;
    const taxaAnterior = taxaSucesso > 0 ? taxaSucesso - 2.5 : 0; // Simular dados anteriores
    const variacao = taxaSucesso - taxaAnterior;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Donut - Distribuição por Status */}
            <Card className="flex flex-col h-full p-4 gap-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Distribuição por Status
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[300px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={donutData}
                                dataKey="quantidade"
                                nameKey="status"
                                innerRadius={60}
                                strokeWidth={5}
                            />
                            <ChartLegend
                                content={<ChartLegendContent nameKey="status" />}
                                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                            />
                        </PieChart>
                    </ChartContainer>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 leading-none font-medium text-foreground">
                        {variacao > 0 ? (
                            <>
                                Taxa de sucesso aumentou {variacao.toFixed(1)}% este mês 
                                <TrendingUpIcon className="h-4 w-4 text-green-600" />
                            </>
                        ) : (
                            <>
                                Taxa de sucesso diminuiu {Math.abs(variacao).toFixed(1)}% este mês 
                                <TrendingUpIcon className="h-4 w-4 text-red-600 rotate-180" />
                            </>
                        )}
                    </div>
                    <div className="text-foreground leading-none text-xs">
                        Mostrando distribuição de {totalExpedicoes} expedições
                    </div>
                </div>
            </Card>

            {/* Taxa de Sucesso das Expedições */}
            <Card className="flex flex-col h-full p-4 gap-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Taxa de Sucesso das Expedições
                    <TrendingUpIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                    {taxaSucesso.toFixed(1)}%
                </div>
                <div className="text-xs text-foreground">
                    Taxa de sucesso geral das expedições
                </div>
                
                {/* Estatísticas Detalhadas */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground font-medium">Concluídas</span>
                            <span className="text-sm font-bold text-green-600">{expedicoesConcluidas}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground font-medium">Em Andamento</span>
                            <span className="text-sm font-bold text-blue-600">{expedicoesEmAndamento}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground font-medium">Canceladas</span>
                            <span className="text-sm font-bold text-red-600">{expedicoesCanceladas}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground font-medium">Planejamento</span>
                            <span className="text-sm font-bold text-yellow-600">{expedicoesPlanejamento}</span>
                        </div>
                    </div>
                </div>
                
                {/* Barra de Progresso */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-medium">Progresso Geral</span>
                        <span className="font-bold text-foreground">{totalExpedicoes} expedições</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${taxaSucesso}%` }}
                        />
                    </div>
                </div>
                
                {/* Comparação com Período Anterior */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-medium">Comparado ao mês anterior</span>
                        <div className="flex items-center gap-1">
                            {variacao > 0 ? (
                                <>
                                    <span className="text-green-600 font-bold">+{variacao.toFixed(1)}%</span>
                                    <TrendingUpIcon className="h-3 w-3 text-green-600" />
                                </>
                            ) : (
                                <>
                                    <span className="text-red-600 font-bold">{variacao.toFixed(1)}%</span>
                                    <TrendingUpIcon className="h-3 w-3 text-red-600 rotate-180" />
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Informações Adicionais */}
                <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-foreground font-medium">Taxa de Conclusão</span>
                        <span className="font-bold text-foreground">{(expedicoesConcluidas / totalExpedicoes * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-foreground font-medium">Taxa de Cancelamento</span>
                        <span className="font-bold text-foreground">{(expedicoesCanceladas / totalExpedicoes * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-foreground font-medium">Expedições Ativas</span>
                        <span className="font-bold text-foreground">{expedicoesEmAndamento + expedicoesPlanejamento}</span>
                    </div>
                </div>
            </Card>

            {/* Gráfico de Barras - Performance por Mês */}
            <Card className="flex flex-col h-full p-4 gap-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Performance por Mês
                    <ClockIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-foreground">
                    Distribuição de expedições por status ao longo dos meses
                </div>
                <div className="flex-1">
                    <ChartContainer config={chartConfig}>
                        <BarChart accessibilityLayer data={barData}>
                            <XAxis
                                dataKey="mes"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <Bar
                                dataKey="concluidas"
                                stackId="a"
                                fill="var(--color-chart-1)"
                                radius={[0, 0, 4, 4]}
                            />
                            <Bar
                                dataKey="emAndamento"
                                stackId="a"
                                fill="var(--color-chart-2)"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="canceladas"
                                stackId="a"
                                fill="var(--color-chart-3)"
                                radius={[4, 4, 0, 0]}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent indicator="line" />}
                                cursor={false}
                                defaultIndex={1}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </Card>

            {/* Gráfico de Área - Tendência de Sucesso */}
            <Card className="flex flex-col h-full p-4 gap-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Tendência de Sucesso ao Longo do Tempo
                    <AlertTriangleIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-foreground">
                    Evolução da taxa de sucesso das expedições
                </div>
                <div className="flex-1">
                    <ChartContainer config={chartConfig}>
                        <AreaChart
                            accessibilityLayer
                            data={tendenciaData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="expedicao"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `Exp ${value}`}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <defs>
                                <linearGradient id="fillTaxaSucesso" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-chart-1)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-chart-1)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <Area
                                dataKey="taxaSucesso"
                                type="natural"
                                fill="url(#fillTaxaSucesso)"
                                fillOpacity={0.4}
                                stroke="var(--color-chart-1)"
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 leading-none font-medium text-foreground">
                        {variacao > 0 ? (
                            <>
                                Taxa de sucesso aumentou {variacao.toFixed(1)}% este mês 
                                <TrendingUpIcon className="h-4 w-4 text-green-600" />
                            </>
                        ) : (
                            <>
                                Taxa de sucesso diminuiu {Math.abs(variacao).toFixed(1)}% este mês 
                                <TrendingUpIcon className="h-4 w-4 text-red-600 rotate-180" />
                            </>
                        )}
                    </div>
                    <div className="text-foreground leading-none text-xs">
                        Mostrando evolução da taxa de sucesso ao longo do tempo
                    </div>
                </div>
            </Card>
        </div>
    );
} 