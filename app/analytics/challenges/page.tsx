"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { AlertTriangleIcon } from "lucide-react";
import { ChallengeAnalysis } from "@/components/analytics/challenge-analysis";

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

// Hook personalizado para buscar dados
function useAnalyticsData() {
    const [data, setData] = useState<{
        desafios: Desafio[];
        desafioHasExpedicao: DesafioHasExpedicao[];
    }>({
        desafios: [],
        desafioHasExpedicao: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [desafiosData, desafioHasExpedicaoData] = await Promise.all([
                    ApiService.getDesafios(),
                    ApiService.getDesafioHasExpedicao(),
                ]);

                setData({
                    desafios: desafiosData,
                    desafioHasExpedicao: desafioHasExpedicaoData
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
export default function ChallengesPage() {
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
                <h1 className="text-2xl font-bold text-foreground">Análise de Desafios</h1>
                <p className="text-muted-foreground">
                    Análise detalhada dos desafios enfrentados durante as expedições
                </p>
            </div>
            <ChallengeAnalysis 
                desafios={data.desafios} 
                desafioHasExpedicao={data.desafioHasExpedicao} 
            />
        </div>
    );
} 