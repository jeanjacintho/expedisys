"use client";

import { Card } from "@/components/ui/card";
import { 
    AlertTriangleIcon, 
    DollarSignIcon, 
    TrendingUpIcon, 
    ShieldIcon,
    TrendingDownIcon,
    ClockIcon,
    TargetIcon
} from "lucide-react";

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

interface ChallengeMetricsProps {
    desafios: Desafio[];
    desafioHasExpedicao: DesafioHasExpedicao[];
}

export function ChallengeMetrics({ desafios, desafioHasExpedicao }: ChallengeMetricsProps) {
    const totalDesafios = desafios.length;
    const desafiosComDetalhes = desafioHasExpedicao.map(dhe => {
        const desafio = desafios.find(d => d.id === dhe.Desafio_id);
        return {
            ...dhe,
            desafio: desafio
        };
    }).filter(d => d.desafio);

    const totalDespesas = desafiosComDetalhes.reduce((acc, d) => acc + d.despesa_adicional, 0);
    const mediaDespesaPorDesafio = totalDesafios > 0 ? totalDespesas / totalDesafios : 0;

    // Desafio mais caro
    const desafioMaisCaro = desafiosComDetalhes.reduce((max, d) => 
        d.despesa_adicional > max.despesa_adicional ? d : max, desafiosComDetalhes[0] || { despesa_adicional: 0 });

    // Distribuição por risco
    const desafiosPorRisco = desafiosComDetalhes.reduce((acc, d) => {
        const risco = d.desafio?.nivel_risco || 'baixo';
        acc[risco] = (acc[risco] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const riscoMaisComum = Object.entries(desafiosPorRisco).reduce((max, [risco, count]) => 
        count > max.count ? { risco, count } : max, { risco: 'baixo', count: 0 });

    // Calcular estatísticas de impacto
    const desafiosCriticos = desafiosComDetalhes.filter(d => d.desafio?.nivel_risco === 'critico').length;
    const desafiosAltos = desafiosComDetalhes.filter(d => d.desafio?.nivel_risco === 'alto').length;
    const impactoAlto = desafiosCriticos + desafiosAltos;
    const percentualImpactoAlto = totalDesafios > 0 ? (impactoAlto / totalDesafios) * 100 : 0;

    // Calcular tendência de custos
    const custosOrdenados = desafiosComDetalhes
        .map(d => d.despesa_adicional)
        .sort((a, b) => a - b);
    const medianaCustos = custosOrdenados.length > 0 
        ? custosOrdenados[Math.floor(custosOrdenados.length / 2)]
        : 0;

    const formatarValor = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const metrics = [
        {
            title: "Total de Despesas",
            value: formatarValor(totalDespesas),
            description: `${totalDesafios} desafios registrados`,
            icon: DollarSignIcon,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
            borderColor: "border-green-200 dark:border-green-800"
        },
        {
            title: "Média por Desafio",
            value: formatarValor(mediaDespesaPorDesafio),
            description: "Custo médio por desafio",
            icon: TrendingUpIcon,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
            borderColor: "border-blue-200 dark:border-blue-800"
        },
        {
            title: "Desafio Mais Caro",
            value: formatarValor(desafioMaisCaro.despesa_adicional),
            description: desafioMaisCaro.desafio?.descricao || "N/A",
            icon: AlertTriangleIcon,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-950",
            borderColor: "border-red-200 dark:border-red-800"
        },
        {
            title: "Risco Mais Comum",
            value: riscoMaisComum.risco.charAt(0).toUpperCase() + riscoMaisComum.risco.slice(1),
            description: `${riscoMaisComum.count} ocorrências`,
            icon: ShieldIcon,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
            borderColor: "border-purple-200 dark:border-purple-800"
        },
        {
            title: "Impacto Alto",
            value: `${percentualImpactoAlto.toFixed(1)}%`,
            description: `${impactoAlto} desafios críticos/altos`,
            icon: TargetIcon,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
            borderColor: "border-orange-200 dark:border-orange-800"
        },
        {
            title: "Mediana de Custos",
            value: formatarValor(medianaCustos),
            description: "Valor mediano dos custos",
            icon: ClockIcon,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50 dark:bg-indigo-950",
            borderColor: "border-indigo-200 dark:border-indigo-800"
        },
        {
            title: "Desafios Críticos",
            value: `${desafiosCriticos}`,
            description: "Máximo nível de risco",
            icon: TrendingDownIcon,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-950",
            borderColor: "border-red-200 dark:border-red-800"
        },
        {
            title: "Custo Total Críticos",
            value: formatarValor(desafiosComDetalhes
                .filter(d => d.desafio?.nivel_risco === 'critico')
                .reduce((acc, d) => acc + d.despesa_adicional, 0)),
            description: "Soma dos desafios críticos",
            icon: AlertTriangleIcon,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-950",
            borderColor: "border-red-200 dark:border-red-800"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                    <Card key={index} className="p-4 gap-2">
                        <div className="text-sm text-foreground flex justify-between font-medium">
                            {metric.title}
                            <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {metric.value}
                        </div>
                        <div className="text-xs text-foreground">
                            {metric.description}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
} 