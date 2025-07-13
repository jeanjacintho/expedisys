"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { AlertTriangleIcon } from "lucide-react";
import { ExpeditionSuccessRate } from "@/components/analytics/expedition-success-rate";
import { TemporalAnalysis } from "@/components/analytics/temporal-analysis";
import { ChallengeAnalysis } from "@/components/analytics/challenge-analysis";
import { LocationAnalysis } from "@/components/analytics/location-analysis";
import { InsightsRecommendations } from "@/components/analytics/insights-recommendations";

interface Expedicao {
    id: number;
    nome: string;
    status: string;
    data_inicio: string;
    data_fim: string;
    Localizacao_id: number;
}

interface Artefato {
    id: number;
    nome: string;
    Expedicao_id: number;
    valor_estimado: number;
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

// Hook personalizado para buscar dados
function useAnalyticsData() {
    const [data, setData] = useState<{
        expedicoes: Expedicao[];
        artefatos: Artefato[];
        desafios: Desafio[];
        desafioHasExpedicao: DesafioHasExpedicao[];
        localizacoes: Localizacao[];
    }>({
        expedicoes: [],
        artefatos: [],
        desafios: [],
        desafioHasExpedicao: [],
        localizacoes: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [expedicoesData, artefatosData, desafiosData, desafioHasExpedicaoData, localizacoesData] = await Promise.all([
                    ApiService.getExpedicoes(),
                    ApiService.getArtefatos(),
                    ApiService.getDesafios(),
                    ApiService.getDesafioHasExpedicao(),
                    ApiService.getLocalizacoes(),
                ]);

                setData({
                    expedicoes: expedicoesData,
                    artefatos: artefatosData,
                    desafios: desafiosData,
                    desafioHasExpedicao: desafioHasExpedicaoData,
                    localizacoes: localizacoesData
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

// Componente de loading
function AnalyticsSkeleton() {
    return (
        <div className="flex flex-col gap-4 md:gap-4">
            <Card className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                </div>
            </Card>
        </div>
    );
}

// Componente principal
export default function AnalyticsPage() {
    const { data, loading, error } = useAnalyticsData();

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
            <div>
                <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                <p className="text-muted-foreground">
                    Análise completa e insights sobre o desempenho das expedições
                </p>
            </div>

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

            <InsightsRecommendations 
                expedicoes={data.expedicoes}
                desafioHasExpedicao={data.desafioHasExpedicao}
                localizacoes={data.localizacoes}
            />
        </div>
    );
}