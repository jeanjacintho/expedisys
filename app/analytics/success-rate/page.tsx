"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { AlertTriangleIcon } from "lucide-react";

import { SuccessRateCharts } from "@/components/analytics/success-rate-charts";
import { SuccessRateMetrics } from "@/components/analytics/success-rate-metrics";
import { TeamPerformanceTable } from "@/components/analytics/team-performance-table";
import { LocationPerformanceTable } from "@/components/analytics/location-performance-table";
import { ExpeditionDetailTable } from "@/components/analytics/expedition-detail-table";

interface Expedicao {
    id: number;
    nome: string;
    status: string;
    data_inicio: string;
    data_fim: string;
    equipe?: {
        id: number;
        nome: string;
    };
}

interface Equipe {
    id: number;
    nome: string;
    lider_id: number;
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
        equipes: Equipe[];
        localizacoes: Localizacao[];
    }>({
        expedicoes: [],
        equipes: [],
        localizacoes: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [expedicoesData, equipesData, localizacoesData] = await Promise.all([
                    ApiService.getExpedicoes(),
                    ApiService.getEquipes(),
                    ApiService.getLocalizacoes(),
                ]);

                setData({
                    expedicoes: expedicoesData,
                    equipes: equipesData,
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
        <div className="space-y-6">
            <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-64 mb-2"></div>
                <div className="h-4 bg-muted rounded w-96"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                        <div className="h-6 bg-muted rounded mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded"></div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
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

// Componente principal
export default function SuccessRatePage() {
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
            {/* Métricas Principais */}
            <SuccessRateMetrics expedicoes={data.expedicoes} />

            {/* Charts e Gráficos */}
            <SuccessRateCharts expedicoes={data.expedicoes} />

            {/* Análise por Equipe */}
            <TeamPerformanceTable equipes={data.equipes} expedicoes={data.expedicoes} />

            {/* Análise por Localização */}
            <LocationPerformanceTable localizacoes={data.localizacoes} expedicoes={data.expedicoes} />

            {/* Tabela Detalhada */}
            <ExpeditionDetailTable expedicoes={data.expedicoes} />
        </div>
    );
} 