"use client";

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUpIcon, 
  AlertTriangleIcon,
  DollarSignIcon
} from "lucide-react"

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

interface ChallengeAnalysisProps {
    desafios: Desafio[];
    desafioHasExpedicao: DesafioHasExpedicao[];
}

export function ChallengeAnalysis({ desafios, desafioHasExpedicao }: ChallengeAnalysisProps) {
    const desafiosComDetalhes = desafioHasExpedicao.map(dhe => {
        const desafio = desafios.find(d => d.id === dhe.Desafio_id);
        return {
            ...dhe,
            desafio: desafio
        };
    }).filter(d => d.desafio);

    const totalDespesas = desafiosComDetalhes.reduce((acc, d) => acc + d.despesa_adicional, 0);
    const mediaDespesaPorDesafio = desafiosComDetalhes.length > 0 
        ? totalDespesas / desafiosComDetalhes.length 
        : 0;

    const desafiosPorRisco = desafiosComDetalhes.reduce((acc, d) => {
        const risco = d.desafio?.nivel_risco || 'baixo';
        acc[risco] = (acc[risco] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const despesasPorRisco = desafiosComDetalhes.reduce((acc, d) => {
        const risco = d.desafio?.nivel_risco || 'baixo';
        acc[risco] = (acc[risco] || 0) + d.despesa_adicional;
        return acc;
    }, {} as Record<string, number>);

    const desafioMaisCaro = desafiosComDetalhes.reduce((max, d) => 
        d.despesa_adicional > max.despesa_adicional ? d : max, 
        desafiosComDetalhes[0] || { despesa_adicional: 0 });

    const getRiscoIcon = (risco: string) => {
        switch (risco) {
            case 'baixo': return '🟢';
            case 'medio': return '🟡';
            case 'alto': return '🟠';
            case 'critico': return '🔴';
            default: return '⚪';
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Análise de Desafios</h3>
                <AlertTriangleIcon className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <DollarSignIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            R$ {totalDespesas.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Despesas</div>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUpIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            R$ {mediaDespesaPorDesafio.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Média por Desafio</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Distribuição por Risco</h4>
                    <div className="space-y-2">
                        {(['baixo', 'medio', 'alto', 'critico'] as const).map((risco) => (
                            <div key={risco} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{getRiscoIcon(risco)}</span>
                                    <span className="text-sm capitalize text-foreground">{risco}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                        {desafiosPorRisco[risco] || 0}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        R$ {(despesasPorRisco[risco] || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Desafio Mais Caro</h4>
                    <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-foreground">
                                    {desafioMaisCaro.desafio?.descricao}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Risco: {desafioMaisCaro.desafio?.nivel_risco}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-foreground">
                                    R$ {desafioMaisCaro.despesa_adicional.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">Custo</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Insights</h4>
                    <div className="space-y-2 text-sm">
                        <div className="p-2 bg-muted/30 rounded">
                            <span className="font-medium text-foreground">Total de Desafios:</span> {desafiosComDetalhes.length}
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                            <span className="font-medium text-foreground">Risco Mais Comum:</span> {
                                Object.entries(desafiosPorRisco).reduce((max, [risco, count]) => 
                                    count > max.count ? { risco, count } : max, 
                                    { risco: 'baixo', count: 0 }
                                ).risco
                            }
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                            <span className="font-medium text-foreground">Custo Médio por Risco:</span> R$ {
                                (Object.values(despesasPorRisco).reduce((acc, val) => acc + val, 0) / 
                                Object.keys(despesasPorRisco).length).toLocaleString()
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
} 