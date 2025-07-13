"use client";

import { useState, useEffect, useMemo } from "react";
import { ApiService } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    BarChart3Icon, 
    TrendingUpIcon, 
    MapPinnedIcon, 
    AlertTriangleIcon,
    DollarSignIcon,
    ClockIcon
} from "lucide-react";

// Componentes de análise
import { ExpeditionSuccessRate } from "@/components/analytics/expedition-success-rate";
import { TemporalAnalysis } from "@/components/analytics/temporal-analysis";
import { ChallengeAnalysis } from "@/components/analytics/challenge-analysis";
import { LocationAnalysis } from "@/components/analytics/location-analysis";
import { InsightsRecommendations } from "@/components/analytics/insights-recommendations";

// Interfaces
interface Expedicao {
    id: number;
    nome: string;
    status: string;
    data_inicio: string;
    data_fim: string;
    Localizacao_id: number;
    equipe_id: number;
}

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

interface Localizacao {
    id: number;
    pais: string;
    latitude: number;
    longitude: number;
}

interface Equipe {
    id: number;
    nome: string;
    lider_id: number;
}

// Componente de loading
function AnalyticsSkeleton() {
    return (
        <div className="flex flex-col gap-4 md:gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-4 animate-pulse">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-8 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded"></div>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                        <div className="h-6 bg-muted rounded mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// Hook personalizado para buscar dados
function useAnalyticsData() {
    const [data, setData] = useState<{
        expedicoes: Expedicao[];
        desafios: Desafio[];
        desafioHasExpedicao: DesafioHasExpedicao[];
        localizacoes: Localizacao[];
        equipes: Equipe[];
    }>({
        expedicoes: [],
        desafios: [],
        desafioHasExpedicao: [],
        localizacoes: [],
        equipes: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [
                    expedicoesData,
                    desafiosData,
                    desafioHasExpedicaoData,
                    localizacoesData,
                    equipesData
                ] = await Promise.all([
                    ApiService.getExpedicoes(),
                    ApiService.getDesafios(),
                    ApiService.getDesafioHasExpedicao(),
                    ApiService.getLocalizacoes(),
                    ApiService.getEquipes(),
                ]);

                setData({
                    expedicoes: expedicoesData,
                    desafios: desafiosData,
                    desafioHasExpedicao: desafioHasExpedicaoData,
                    localizacoes: localizacoesData,
                    equipes: equipesData
                });
            } catch (err) {
                setError('Erro ao carregar dados de analytics');
                console.error('Erro ao carregar dados:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { data, loading, error };
}

// Componente principal
export default function AnalyticsPage() {
    const { data, loading, error } = useAnalyticsData();

    // Cálculos de métricas principais
    const metricas = useMemo(() => {
        const totalExpedicoes = data.expedicoes.length;
        const expedicoesConcluidas = data.expedicoes.filter(e => e.status === "Concluída").length;
        const expedicoesEmAndamento = data.expedicoes.filter(e => e.status === "Em andamento").length;
        const totalDespesas = data.desafioHasExpedicao.reduce((acc, d) => acc + d.despesa_adicional, 0);
        const paisesUnicos = new Set(data.expedicoes.map(e => {
            const localizacao = data.localizacoes.find(l => l.id === e.Localizacao_id);
            return localizacao?.pais;
        }).filter(Boolean));

        return {
            totalExpedicoes,
            expedicoesConcluidas,
            expedicoesEmAndamento,
            totalDespesas,
            paisesUnicos: paisesUnicos.size,
            taxaSucesso: totalExpedicoes > 0 ? (expedicoesConcluidas / totalExpedicoes) * 100 : 0
        };
    }, [data]);

    if (loading) {
        return <AnalyticsSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <Card className="p-6">
                    <div className="text-center text-red-600">
                        <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Dados</h3>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 md:gap-4">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Total de Expedições
                        <MapPinnedIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {metricas.totalExpedicoes}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        expedições realizadas
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Taxa de Sucesso
                        <TrendingUpIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {metricas.taxaSucesso.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                        expedições concluídas
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Despesas Totais
                        <DollarSignIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        R$ {metricas.totalDespesas.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        custos com desafios
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Cobertura Geográfica
                        <BarChart3Icon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {metricas.paisesUnicos}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        países explorados
                    </div>
                </Card>
            </div>

            {/* Análises Detalhadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ExpeditionSuccessRate expedicoes={data.expedicoes} />
                <TemporalAnalysis expedicoes={data.expedicoes} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChallengeAnalysis 
                    desafios={data.desafios} 
                    desafioHasExpedicao={data.desafioHasExpedicao} 
                />
                <LocationAnalysis 
                    expedicoes={data.expedicoes} 
                    localizacoes={data.localizacoes} 
                />
            </div>

            {/* Insights e Recomendações */}
            <InsightsRecommendations 
                expedicoes={data.expedicoes}
                desafioHasExpedicao={data.desafioHasExpedicao}
                localizacoes={data.localizacoes}
            />
        </div>
    );
}