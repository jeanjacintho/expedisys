"use client";

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPinIcon, TrendingUpIcon, GlobeIcon, PieChartIcon, BarChart3Icon, FilterIcon, LightbulbIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { LocationPerformanceTable } from "@/components/analytics/location-performance-table"
import { ChartContainer } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const Map = dynamic(() => import("@/components/map"), { ssr: false })

interface Localizacao {
    id: number;
    pais: string;
    latitude: number;
    longitude: number;
}

interface Expedicao {
    id: number;
    nome: string;
    status: string;
    Localizacao_id: number;
    data_inicio: string;
    data_fim: string;
    localizacao?: Localizacao;
}

interface LocationAnalysisProps {
    expedicoes: Expedicao[];
    localizacoes: Localizacao[];
}

export function LocationAnalysis({ expedicoes, localizacoes }: LocationAnalysisProps) {
    // Filtros globais
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [continenteFilter, setContinenteFilter] = useState<string | null>(null);
    const [paisFilter, setPaisFilter] = useState<string | null>(null);

    // Helper para continente
    const getContinente = (pais: string) => {
        const regions: Record<string, string> = {
            'Brasil': 'América do Sul', 'Argentina': 'América do Sul', 'Chile': 'América do Sul', 'Peru': 'América do Sul',
            'México': 'América do Norte', 'Estados Unidos': 'América do Norte', 'Canadá': 'América do Norte',
            'Egito': 'África', 'Marrocos': 'África', 'Tunísia': 'África',
            'Grécia': 'Europa', 'Itália': 'Europa', 'Espanha': 'Europa', 'França': 'Europa',
            'China': 'Ásia', 'Japão': 'Ásia', 'Índia': 'Ásia', 'Tailândia': 'Ásia'
        };
        return regions[pais] || 'Outros';
    };

    // Expedições com localizacao
    const expedicoesComLocalizacao = useMemo(() => expedicoes.map(expedicao => {
        const localizacao = localizacoes.find(l => l.id === expedicao.Localizacao_id);
        return {
            ...expedicao,
            localizacao,
            continente: getContinente(localizacao?.pais || '')
        };
    }).filter(e => e.localizacao), [expedicoes, localizacoes]);

    // Aplicar filtros globais
    const expedicoesFiltradas = useMemo(() => {
        return expedicoesComLocalizacao.filter(e => {
            if (statusFilter && e.status !== statusFilter) return false;
            if (continenteFilter && e.continente !== continenteFilter) return false;
            if (paisFilter && e.localizacao?.pais !== paisFilter) return false;
            return true;
        });
    }, [expedicoesComLocalizacao, statusFilter, continenteFilter, paisFilter]);

    // Métricas principais
    const totalExpedicoes = expedicoesFiltradas.length;
    const totalPaises = new Set(expedicoesFiltradas.map(e => e.localizacao?.pais)).size;
    const totalContinentes = new Set(expedicoesFiltradas.map(e => e.continente)).size;
    const localMaisAtivo = useMemo(() => {
        const count: Record<string, number> = {};
        expedicoesFiltradas.forEach(e => {
            const key = e.localizacao?.pais || '-';
            count[key] = (count[key] || 0) + 1;
        });
        return Object.entries(count).sort(([,a],[,b]) => b-a)[0]?.[0] || '-';
    }, [expedicoesFiltradas]);
    const localMaiorSucesso = useMemo(() => {
        const taxa: Record<string, number> = {};
        const total: Record<string, number> = {};
        expedicoesFiltradas.forEach(e => {
            const key = e.localizacao?.pais || '-';
            total[key] = (total[key] || 0) + 1;
            if (e.status === 'Concluída') taxa[key] = (taxa[key] || 0) + 1;
        });
        return (Object.entries(taxa)
            .map(([k, v]) => [k, v/(total[k]||1)] as [string, number])
            .sort((a, b) => b[1] - a[1])[0]?.[0]) || '-';
    }, [expedicoesFiltradas]);
    const expMaisLonga = useMemo<string>(() => {
        let max: { nome: string; dur: number; pais: string } | null = null;
        expedicoesFiltradas.forEach(e => {
            if (e.data_inicio && e.data_fim) {
                const dur = new Date(e.data_fim).getTime() - new Date(e.data_inicio).getTime();
                const pais = e.localizacao?.pais || '-';
                if (!max || dur > max.dur) max = { nome: e.nome, dur, pais };
            }
        });
        if (!max) return '-';
        const typedMax = max as { nome: string; dur: number; pais: string };
        return `${typedMax.nome} (${typedMax.pais})`;
    }, [expedicoesFiltradas]);
    const expMaisCurta = useMemo<string>(() => {
        let min: { nome: string; dur: number; pais: string } | null = null;
        expedicoesFiltradas.forEach(e => {
            if (e.data_inicio && e.data_fim) {
                const dur = new Date(e.data_fim).getTime() - new Date(e.data_inicio).getTime();
                const pais = e.localizacao?.pais || '-';
                if (!min || dur < min.dur) min = { nome: e.nome, dur, pais };
            }
        });
        if (!min) return '-';
        const typedMin = min as { nome: string; dur: number; pais: string };
        return `${typedMin.nome} (${typedMin.pais})`;
    }, [expedicoesFiltradas]);
    const localMaisCancelado = useMemo(() => {
        const count: Record<string, number> = {};
        expedicoesFiltradas.forEach(e => {
            if (e.status === 'Cancelada') {
                const key = e.localizacao?.pais || '-';
                count[key] = (count[key] || 0) + 1;
            }
        });
        return Object.entries(count).sort(([,a],[,b]) => b-a)[0]?.[0] || '-';
    }, [expedicoesFiltradas]);

    // Dados para gráficos
    const chartContinenteData = useMemo(() => {
        const acc: Record<string, number> = {};
        expedicoesFiltradas.forEach(e => {
            acc[e.continente] = (acc[e.continente] || 0) + 1;
        });
        return Object.entries(acc).map(([name, value], i) => ({ name, value, fill: `var(--chart-${i+1})` }));
    }, [expedicoesFiltradas]);
    const chartPaisData = useMemo(() => {
        const acc: Record<string, number> = {};
        expedicoesFiltradas.forEach(e => {
            acc[e.localizacao?.pais || '-'] = (acc[e.localizacao?.pais || '-'] || 0) + 1;
        });
        return Object.entries(acc).sort(([,a],[,b]) => b-a).slice(0,10).map(([name, value], i) => ({ name, value, fill: `var(--chart-${i+1})` }));
    }, [expedicoesFiltradas]);
    const chartStatusContinenteData = useMemo(() => {
        const acc: Record<string, Record<string, number>> = {};
        expedicoesFiltradas.forEach(e => {
            if (!acc[e.continente]) acc[e.continente] = {};
            acc[e.continente][e.status] = (acc[e.continente][e.status] || 0) + 1;
        });
        return acc;
    }, [expedicoesFiltradas]);
    // Dados para gráfico de evolução temporal
    const chartEvolucaoTemporalData = useMemo(() => {
        // Agrupar por mês/ano e continente
        const acc: Record<string, Record<string, number>> = {};
        expedicoesFiltradas.forEach(e => {
            if (!e.data_inicio) return;
            const date = new Date(e.data_inicio);
            const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
            if (!acc[key]) acc[key] = {};
            acc[key][e.continente] = (acc[key][e.continente] || 0) + 1;
        });
        // Transformar em array para o LineChart
        return Object.entries(acc).sort(([a],[b]) => a.localeCompare(b)).map(([date, conts]) => ({
            date,
            ...conts
        }));
    }, [expedicoesFiltradas]);

    // Insights automáticos
    const insights = useMemo(() => {
        const arr = [];
        if (totalExpedicoes === 0) return ["Nenhuma expedição encontrada para os filtros selecionados."];
        if (chartContinenteData.length > 0) {
            const max = chartContinenteData.reduce((a, b) => a.value > b.value ? a : b);
            arr.push(`O continente com mais expedições é ${max.name}.`);
        }
        if (localMaisCancelado !== '-' && localMaisCancelado !== undefined) {
            arr.push(`O local com mais expedições canceladas é ${localMaisCancelado}.`);
        }
        if (localMaiorSucesso !== '-' && localMaiorSucesso !== undefined) {
            arr.push(`O local com maior taxa de sucesso é ${localMaiorSucesso}.`);
        }
        if (expMaisLonga !== '-' && expMaisLonga !== undefined) {
            arr.push(`A expedição mais longa foi ${expMaisLonga}.`);
        }
        return arr;
    }, [totalExpedicoes, chartContinenteData, localMaisCancelado, localMaiorSucesso, expMaisLonga]);

    // Listas para selects de filtro
    const statusList = useMemo(() => Array.from(new Set(expedicoesComLocalizacao.map(e => e.status))), [expedicoesComLocalizacao]);
    const continenteList = useMemo(() => Array.from(new Set(expedicoesComLocalizacao.map(e => e.continente))), [expedicoesComLocalizacao]);
    const paisList = useMemo(() => Array.from(new Set(expedicoesComLocalizacao.map(e => e.localizacao?.pais))).filter((p): p is string => Boolean(p)), [expedicoesComLocalizacao]);

    return (
        <div className="flex flex-col gap-8">
            {/* Filtros globais */}
            <Card className="p-4 flex flex-wrap gap-4 items-center justify-between border bg-card/80 shadow-xs">
                <div className="flex items-center gap-2">
                    <FilterIcon className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">Filtros Globais</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Select value={statusFilter || "all"} onValueChange={v => setStatusFilter(v === "all" ? null : v)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Status</SelectItem>
                            {statusList.filter(Boolean).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={continenteFilter || "all"} onValueChange={v => setContinenteFilter(v === "all" ? null : v)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Continente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Continentes</SelectItem>
                            {continenteList.filter(Boolean).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={paisFilter || "all"} onValueChange={v => setPaisFilter(v === "all" ? null : v)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="País" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Países</SelectItem>
                            {paisList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Cards de destaque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between text-sm text-foreground font-medium">
                        Total de Expedições
                        <GlobeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {totalExpedicoes}
                    </div>
                    <div className="text-xs text-foreground font-medium">
                        Expedições registradas
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between text-sm text-foreground font-medium">
                        Total de Países
                        <MapPinIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {totalPaises}
                    </div>
                    <div className="text-xs text-foreground font-medium">
                        Países distintos
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between text-sm text-foreground font-medium">
                        Total de Continentes
                        <GlobeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {totalContinentes}
                    </div>
                    <div className="text-xs text-foreground font-medium">
                        Continentes distintos
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between text-sm text-foreground font-medium">
                        Local Mais Ativo
                        <TrendingUpIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {localMaisAtivo}
                    </div>
                    <div className="text-xs text-foreground font-medium">
                        País com mais expedições
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between text-sm text-foreground font-medium">
                        Maior Taxa de Sucesso
                        <TrendingUpIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {localMaiorSucesso}
                    </div>
                    <div className="text-xs text-foreground font-medium">
                        País com maior % de sucesso
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between text-sm text-foreground font-medium">
                        Expedição Mais Longa
                        <TrendingUpIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {expMaisLonga}
                    </div>
                    <div className="text-xs text-foreground font-medium">
                        Maior duração registrada
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between text-sm text-foreground font-medium">
                        Expedição Mais Curta
                        <TrendingUpIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {expMaisCurta}
                    </div>
                    <div className="text-xs text-foreground font-medium">
                        Menor duração registrada
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between text-sm text-foreground font-medium">
                        Local com Mais Cancelamentos
                        <TrendingUpIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {localMaisCancelado}
                    </div>
                    <div className="text-xs text-foreground font-medium">
                        País com mais cancelamentos
                    </div>
                </Card>
            </div>

            {/* Mapa Interativo */}
            <Card className="p-6 border bg-card/80 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">Mapa das Expedições</span>
                </div>
                <div className="h-[420px] w-full rounded-lg overflow-hidden">
                    <Map expedicoes={expedicoesFiltradas} />
                </div>
            </Card>

            {/* Gráficos avançados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Distribuição por Continente */}
                <Card className="flex flex-col h-full p-4 gap-2">
                    <CardHeader>
                        <CardTitle>Distribuição por Continente</CardTitle>
                        <CardDescription>Expedições agrupadas por continente</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={Object.fromEntries(chartContinenteData.map((d, i) => [d.name, { label: d.name, color: `var(--color-chart-${i+1})` }]))}>
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Pie data={chartContinenteData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                    {chartContinenteData.map((entry, i) => (
                                        <Cell key={`cell-continente-${i}`} fill={`var(--color-chart-${i+1})`} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                {/* Top 10 Países */}
                <Card className="flex flex-col h-full p-4 gap-2">
                    <CardHeader>
                        <CardTitle>Top 10 Países</CardTitle>
                        <CardDescription>Países com maior número de expedições</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={Object.fromEntries(chartPaisData.map((d, i) => [d.name, { label: d.name, color: `var(--color-chart-${i+1})` }]))}>
                            <BarChart data={chartPaisData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                <Bar dataKey="value">
                                    {chartPaisData.map((entry, i) => (
                                        <Cell key={`cell-pais-${i}`} fill={`var(--color-chart-${i+1})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                {/* Status por Continente */}
                <Card className="flex flex-col h-full p-4 gap-2">
                    <CardHeader>
                        <CardTitle>Status por Continente</CardTitle>
                        <CardDescription>Distribuição dos status das expedições por continente</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={Object.fromEntries(Array.from(new Set(expedicoesFiltradas.map(e => e.status))).map((status, i) => [status, { label: status, color: `var(--color-chart-${i+1})` }]))}>
                            <BarChart data={Object.entries(chartStatusContinenteData).map(([cont, stats]) => ({ continente: cont, ...stats }))}>
                                <XAxis dataKey="continente" />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent nameKey="continente" />} />
                                {Array.from(new Set(expedicoesFiltradas.map(e => e.status))).map((status, i) => (
                                    <Bar key={status} dataKey={status} stackId="a" fill={`var(--color-chart-${i+1})`} />
                                ))}
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                {/* Evolução Temporal */}
                <Card className="flex flex-col h-full p-4 gap-2">
                    <CardHeader>
                        <CardTitle>Evolução Temporal</CardTitle>
                        <CardDescription>Evolução das expedições por continente ao longo do tempo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={Object.fromEntries(continenteList.map((cont, i) => [cont, { label: cont, color: `var(--chart-${i+1})` }]))}>
                            <AreaChart
                                accessibilityLayer
                                data={chartEvolucaoTemporalData}
                                margin={{ left: 12, right: 12 }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <defs>
                                    {continenteList.map((cont, i) => (
                                        <linearGradient key={cont} id={`fill${cont.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={`var(--chart-${i+1})`} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={`var(--chart-${i+1})`} stopOpacity={0.1} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                {continenteList.map((cont, i) => (
                                    <Area
                                        key={cont}
                                        dataKey={cont}
                                        type="natural"
                                        fill={`url(#fill${cont.replace(/\s/g, "")})`}
                                        fillOpacity={0.4}
                                        stroke={`var(--chart-${i+1})`}
                                        stackId="a"
                                    />
                                ))}
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full items-start gap-2 text-sm">
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2 leading-none font-medium">
                                    Evolução mensal por continente <TrendingUpIcon className="h-4 w-4" />
                                </div>
                                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                    {chartEvolucaoTemporalData.length > 0 ? `${chartEvolucaoTemporalData[0].date} - ${chartEvolucaoTemporalData[chartEvolucaoTemporalData.length-1].date}` : ""}
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Insights e Recomendações */}
            <Card className="p-6 flex flex-col gap-2 border bg-card/80 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                    <LightbulbIcon className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">Insights & Recomendações</span>
                </div>
                <ul className="text-muted-foreground text-sm list-disc pl-4">
                    {insights.map((i, idx) => <li key={idx}>{i}</li>)}
                </ul>
            </Card>

            {/* Tabela Detalhada */}
            <LocationPerformanceTable localizacoes={localizacoes} expedicoes={expedicoesFiltradas} />
        </div>
    );
} 