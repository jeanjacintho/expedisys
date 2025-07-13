"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { AlertTriangleIcon } from "lucide-react";
import { TemporalAnalysis } from "@/components/analytics/temporal-analysis";

interface Expedicao {
    id: number;
    nome: string;
    status: string;
    data_inicio: string;
    data_fim: string;
}

// Hook personalizado para buscar dados
function useAnalyticsData() {
    const [data, setData] = useState<{
        expedicoes: Expedicao[];
    }>({
        expedicoes: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const expedicoesData = await ApiService.getExpedicoes();

                setData({
                    expedicoes: expedicoesData
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
export default function TemporalPage() {
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
                <h1 className="text-2xl font-bold text-foreground">Análise Temporal</h1>
                <p className="text-muted-foreground">
                    Análise temporal e sazonal das expedições ao longo do tempo
                </p>
            </div>
            <TemporalAnalysis expedicoes={data.expedicoes} />
        </div>
    );
} 