"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LightbulbIcon, TrendingUpIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react";

interface InsightsRecommendationsProps {
    expedicoes: Array<{
        id: number;
        nome: string;
        status: string;
        data_inicio: string;
        data_fim: string;
        Localizacao_id: number;
    }>;
    desafioHasExpedicao: Array<{
        Desafio_id: number;
        Expedicao_id: number;
        despesa_adicional: number;
    }>;
    localizacoes: Array<{
        id: number;
        pais: string;
    }>;
}

export function InsightsRecommendations({ expedicoes, desafioHasExpedicao, localizacoes }: InsightsRecommendationsProps) {
    // Análises para insights
    const totalExpedicoes = expedicoes.length;
    const expedicoesConcluidas = expedicoes.filter(e => e.status === "Concluída").length;
    const expedicoesCanceladas = expedicoes.filter(e => e.status === "Cancelada").length;
    const taxaSucesso = totalExpedicoes > 0 ? (expedicoesConcluidas / totalExpedicoes) * 100 : 0;
    const taxaCancelamento = totalExpedicoes > 0 ? (expedicoesCanceladas / totalExpedicoes) * 100 : 0;

    const totalDespesas = desafioHasExpedicao.reduce((acc, d) => acc + d.despesa_adicional, 0);
    const mediaDespesaPorExpedicao = totalExpedicoes > 0 ? totalDespesas / totalExpedicoes : 0;

    const paisesUnicos = new Set(expedicoes.map(e => {
        const localizacao = localizacoes.find(l => l.id === e.Localizacao_id);
        return localizacao?.pais;
    }).filter(Boolean));

    const getInsightStyles = (type: string) => {
        switch (type) {
            case 'success':
                return {
                    borderClass: 'border-green-500',
                    bgClass: 'bg-green-50',
                    iconColor: 'text-green-600',
                    titleColor: 'text-green-800',
                    badgeColor: 'border-green-200 bg-green-100 text-green-800'
                };
            case 'warning':
                return {
                    borderClass: 'border-yellow-500',
                    bgClass: 'bg-yellow-50',
                    iconColor: 'text-yellow-600',
                    titleColor: 'text-yellow-800',
                    badgeColor: 'border-yellow-200 bg-yellow-100 text-yellow-800'
                };
            case 'info':
                return {
                    borderClass: 'border-blue-500',
                    bgClass: 'bg-blue-50',
                    iconColor: 'text-blue-600',
                    titleColor: 'text-blue-800',
                    badgeColor: 'border-blue-200 bg-blue-100 text-blue-800'
                };
            default:
                return {
                    borderClass: 'border-gray-500',
                    bgClass: 'bg-gray-50',
                    iconColor: 'text-gray-600',
                    titleColor: 'text-gray-800',
                    badgeColor: 'border-gray-200 bg-gray-100 text-gray-800'
                };
        }
    };

    // Gerar insights
    const insights = [
        {
            type: 'success',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            title: 'Taxa de Sucesso',
            description: `Taxa de sucesso de ${taxaSucesso.toFixed(1)}% indica boa performance geral`,
            recommendation: 'Manter padrões de qualidade e processos estabelecidos'
        },
        {
            type: 'warning',
            icon: <AlertTriangleIcon className="w-4 h-4" />,
            title: 'Taxa de Cancelamento',
            description: `Taxa de cancelamento de ${taxaCancelamento.toFixed(1)}% requer atenção`,
            recommendation: 'Revisar critérios de seleção e planejamento de expedições'
        },
        {
            type: 'info',
            icon: <TrendingUpIcon className="w-4 h-4" />,
            title: 'Cobertura Geográfica',
            description: `${paisesUnicos.size} países diferentes explorados`,
            recommendation: 'Considerar expansão para novas regiões estratégicas'
        },
        {
            type: 'info',
            icon: <LightbulbIcon className="w-4 h-4" />,
            title: 'Custo Médio',
            description: `Custo médio de R$ ${mediaDespesaPorExpedicao.toLocaleString()} por expedição`,
            recommendation: 'Otimizar alocação de recursos e gestão de riscos'
        }
    ];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Insights e Recomendações</h3>
                <LightbulbIcon className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
                {insights.map((insight, index) => {
                    const styles = getInsightStyles(insight.type);
                    
                    return (
                        <div key={index} className={`p-4 rounded-lg border ${styles.bgClass} ${styles.borderClass}`}>
                            <div className="flex items-start gap-3">
                                <div className={`${styles.iconColor}`}>
                                    {insight.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-semibold ${styles.titleColor}`}>
                                            {insight.title}
                                        </h4>
                                        <Badge className={`text-xs ${styles.badgeColor}`}>
                                            {insight.type}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {insight.description}
                                    </p>
                                    <div className="text-xs font-medium text-muted-foreground">
                                        💡 <span className="font-semibold">Recomendação:</span> {insight.recommendation}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-500">
                    <h4 className="font-semibold text-blue-800 mb-2">Próximos Passos Sugeridos</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            Implementar sistema de monitoramento de riscos em tempo real
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            Desenvolver métricas de ROI para cada expedição
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            Criar programa de treinamento baseado nos desafios mais comuns
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            Estabelecer parcerias estratégicas nos países mais ativos
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-500">
                    <h4 className="font-semibold text-green-800 mb-2">Oportunidades Identificadas</h4>
                    <div className="space-y-2 text-sm text-green-700">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Expansão para novos sítios arqueológicos em países emergentes
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Otimização de custos através de tecnologia avançada
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Desenvolvimento de metodologias de escavação mais eficientes
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
} 