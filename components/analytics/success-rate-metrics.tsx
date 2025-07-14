"use client";

import { Card } from "@/components/ui/card";
import { 
    TrendingUpIcon, 
    TrendingDownIcon, 
    CheckCircleIcon, 
    ClockIcon
} from "lucide-react";

interface SuccessRateMetricsProps {
    expedicoes: Array<{
        id: number;
        nome: string;
        status: string;
        data_inicio: string;
        data_fim: string;
    }>;
}

export function SuccessRateMetrics({ expedicoes }: SuccessRateMetricsProps) {
    const totalExpedicoes = expedicoes.length;
    const expedicoesConcluidas = expedicoes.filter(e => e.status === "Concluída").length;
    const expedicoesCanceladas = expedicoes.filter(e => e.status === "Cancelada").length;
    const expedicoesEmAndamento = expedicoes.filter(e => e.status === "Em andamento").length;
    const expedicoesPlanejamento = expedicoes.filter(e => e.status === "Em planejamento").length;

    const taxaSucesso = totalExpedicoes > 0 ? (expedicoesConcluidas / totalExpedicoes) * 100 : 0;
    const taxaCancelamento = totalExpedicoes > 0 ? (expedicoesCanceladas / totalExpedicoes) * 100 : 0;
    const taxaEmAndamento = totalExpedicoes > 0 ? (expedicoesEmAndamento / totalExpedicoes) * 100 : 0;

    // Calcular duração média das expedições concluídas
    const expedicoesComDuracao = expedicoes.filter(e => 
        e.status === "Concluída" && e.data_inicio && e.data_fim
    );
    
    const duracaoMedia = expedicoesComDuracao.length > 0 
        ? expedicoesComDuracao.reduce((acc, exp) => {
            const inicio = new Date(exp.data_inicio);
            const fim = new Date(exp.data_fim);
            return acc + (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / expedicoesComDuracao.length
        : 0;

    const metrics = [
        {
            title: "Taxa de Sucesso",
            value: `${taxaSucesso.toFixed(1)}%`,
            description: `${expedicoesConcluidas} de ${totalExpedicoes} expedições`,
            icon: TrendingUpIcon,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
            borderColor: "border-green-200 dark:border-green-800"
        },
        {
            title: "Taxa de Cancelamento",
            value: `${taxaCancelamento.toFixed(1)}%`,
            description: `${expedicoesCanceladas} expedições canceladas`,
            icon: TrendingDownIcon,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-950",
            borderColor: "border-red-200 dark:border-red-800"
        },
        {
            title: "Em Andamento",
            value: `${taxaEmAndamento.toFixed(1)}%`,
            description: `${expedicoesEmAndamento} expedições ativas`,
            icon: ClockIcon,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
            borderColor: "border-blue-200 dark:border-blue-800"
        },
        {
            title: "Duração Média",
            value: `${duracaoMedia.toFixed(0)} dias`,
            description: "Expedições concluídas",
            icon: CheckCircleIcon,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
            borderColor: "border-purple-200 dark:border-purple-800"
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