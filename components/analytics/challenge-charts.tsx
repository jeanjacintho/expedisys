"use client";

import { Card } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, Line, LineChart, CartesianGrid } from "recharts";
import { AlertTriangleIcon, DollarSignIcon, TrendingUpIcon, ShieldIcon } from "lucide-react";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart";

interface Desafio {
    id: number;
    descricao: string;
    nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
}

interface DesafioHasExpedicao {
    Desafio_id: number;
    Expedicao_id: number;
    despesa_adicional: number;
}

interface ChallengeChartsProps {
    desafios: Desafio[];
    desafioHasExpedicao: DesafioHasExpedicao[];
}

export function ChallengeCharts({ desafios, desafioHasExpedicao }: ChallengeChartsProps) {
    const desafiosComDetalhes = desafioHasExpedicao.map(dhe => {
        const desafio = desafios.find(d => d.id === dhe.Desafio_id);
        return {
            ...dhe,
            desafio: desafio
        };
    }).filter(d => d.desafio);

    // Configuração dos charts
    const chartConfig = {
        baixo: {
            label: "Baixo",
            color: "var(--color-chart-1)",
        },
        medio: {
            label: "Médio",
            color: "var(--color-chart-2)",
        },
        alto: {
            label: "Alto",
            color: "var(--color-chart-3)",
        },
        critico: {
            label: "Crítico",
            color: "var(--color-chart-4)",
        },
        despesa: {
            label: "Despesa (R$)",
            color: "var(--chart-1)",
        },
        quantidade: {
            label: "Quantidade",
            color: "var(--chart-2)",
        }
    };

    // Dados para distribuição por risco
    const desafiosPorRisco = desafiosComDetalhes.reduce((acc, d) => {
        const risco = d.desafio?.nivel_risco || 'baixo';
        acc[risco] = (acc[risco] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const dadosRisco = [
        { risco: 'baixo', quantidade: desafiosPorRisco['baixo'] || 0, fill: "var(--color-chart-2)" },
        { risco: 'medio', quantidade: desafiosPorRisco['medio'] || 0, fill: "var(--color-chart-3)" },
        { risco: 'alto', quantidade: desafiosPorRisco['alto'] || 0, fill: "var(--color-chart-4)" },
        { risco: 'critico', quantidade: desafiosPorRisco['critico'] || 0, fill: "var(--color-chart-1)" }
    ];

    // Dados para despesas por risco
    const despesasPorRisco = desafiosComDetalhes.reduce((acc, d) => {
        const risco = d.desafio?.nivel_risco || 'baixo';
        acc[risco] = (acc[risco] || 0) + d.despesa_adicional;
        return acc;
    }, {} as Record<string, number>);

    const dadosDespesas = [
        { risco: 'Baixo', despesa: despesasPorRisco['baixo'] || 0, fill: "var(--color-chart-2)" },
        { risco: 'Médio', despesa: despesasPorRisco['medio'] || 0, fill: "var(--color-chart-3)" },
        { risco: 'Alto', despesa: despesasPorRisco['alto'] || 0, fill: "var(--color-chart-4)" },
        { risco: 'Crítico', despesa: despesasPorRisco['critico'] || 0, fill: "var(--color-chart-1)" }
    ];

    // Dados para top 5 desafios mais caros
    const desafiosMaisCaros = desafiosComDetalhes
        .sort((a, b) => b.despesa_adicional - a.despesa_adicional)
        .slice(0, 5)
        .map(d => ({
            descricao: d.desafio?.descricao || 'N/A',
            despesa: d.despesa_adicional,
            risco: d.desafio?.nivel_risco || 'baixo'
        }));

    // Dados para tendência de custos por mês
    const desafiosPorMes = desafiosComDetalhes.reduce((acc, d) => {
        // Simular mês baseado no Desafio_id para demonstração
        const mes = (d.Desafio_id % 12) + 1;
        const nomeMes = [
            "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"
        ][mes - 1];
        
        if (!acc[nomeMes]) {
            acc[nomeMes] = { total: 0, count: 0 };
        }
        acc[nomeMes].total += d.despesa_adicional;
        acc[nomeMes].count += 1;
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const dadosTendencia = Object.entries(desafiosPorMes).map(([mes, data]) => ({
        mes,
        despesaTotal: data.total,
        quantidade: data.count,
        media: data.count > 0 ? data.total / data.count : 0
    }));

    const formatarValor = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const getRiscoColor = (risco: string) => {
        switch (risco) {
            case 'baixo': return 'text-green-600';
            case 'medio': return 'text-yellow-600';
            case 'alto': return 'text-orange-600';
            case 'critico': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Distribuição por Risco */}
            <Card className="flex flex-col h-full p-4 gap-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Distribuição por Risco
                    <ShieldIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-foreground">
                    Quantidade de desafios por nível de risco
                </div>
                <div className="flex-1">
                    <ChartContainer config={chartConfig}>
                        <PieChart>
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                cursor={false}
                            />
                            <Pie
                                data={dadosRisco}
                                dataKey="quantidade"
                                nameKey="risco"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={40}
                                strokeWidth={2}
                            >
                                {dadosRisco.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartLegend
                                content={<ChartLegendContent nameKey="risco" />}
                                className="mt-4"
                            />
                        </PieChart>
                    </ChartContainer>
                </div>
            </Card>

            {/* Gráfico de Despesas por Risco */}
            <Card className="flex flex-col h-full p-4 gap-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Despesas por Risco
                    <DollarSignIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-foreground">
                    Custo total dos desafios por nível de risco
                </div>
                <div className="flex-1">
                    <ChartContainer config={chartConfig}>
                        <BarChart data={dadosDespesas}>
                            <XAxis
                                dataKey="risco"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                cursor={false}
                            />
                            <Bar
                                dataKey="despesa"
                                fill="var(--chart-1)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </Card>

            {/* Gráfico de Tendência de Custos */}
            <Card className="flex flex-col h-full p-4 gap-2 lg:col-span-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Tendência de Custos
                    <TrendingUpIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-foreground">
                    Evolução dos custos dos desafios ao longo dos meses
                </div>
                <div className="flex-1">
                    <ChartContainer config={chartConfig}>
                        <LineChart data={dadosTendencia}>
                            <CartesianGrid strokeDasharray="3 3" />
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
                                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                cursor={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="despesaTotal"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                dot={{ fill: "var(--chart-1)", strokeWidth: 2, r: 4 }}
                            />
                        </LineChart>
                    </ChartContainer>
                </div>
            </Card>

            {/* Top 5 Desafios Mais Caros */}
            <Card className="flex flex-col h-full p-4 gap-2 lg:col-span-2">
                <div className="text-sm text-foreground flex justify-between font-medium">
                    Top 5 Desafios Mais Caros
                    <AlertTriangleIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-foreground">
                    Desafios com maior impacto financeiro
                </div>
                <div className="space-y-3 mt-2">
                    {desafiosMaisCaros.map((desafio, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">
                                        {desafio.descricao}
                                    </div>
                                    <div className={`text-xs capitalize ${getRiscoColor(desafio.risco)}`}>
                                        Risco: {desafio.risco}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-foreground">
                                    {formatarValor(desafio.despesa)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Custo adicional
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
} 