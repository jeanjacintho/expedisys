"use client";

import { Card } from "@/components/ui/card";
import { 
    CalendarIcon, 
    ClockIcon, 
    TrendingUpIcon, 
    CalendarDaysIcon
} from "lucide-react";

interface TemporalMetricsProps {
    expedicoes: Array<{
        id: number;
        nome: string;
        status: string;
        data_inicio: string;
        data_fim: string;
    }>;
}

export function TemporalMetrics({ expedicoes }: TemporalMetricsProps) {
    const calcularDuracao = (dataInicio: string, dataFim: string) => {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        return Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    };

    const expedicoesComDuracao = expedicoes
        .filter(e => e.data_inicio && e.data_fim)
        .map(e => ({
            ...e,
            duracao: calcularDuracao(e.data_inicio, e.data_fim)
        }));

    const duracaoMedia = expedicoesComDuracao.length > 0 
        ? expedicoesComDuracao.reduce((acc, e) => acc + e.duracao, 0) / expedicoesComDuracao.length 
        : 0;

    const expedicaoMaisLonga = expedicoesComDuracao.reduce((max, e) => 
        e.duracao > max.duracao ? e : max, expedicoesComDuracao[0] || { duracao: 0 });

    const expedicaoMaisCurta = expedicoesComDuracao.reduce((min, e) => 
        e.duracao < min.duracao ? e : min, expedicoesComDuracao[0] || { duracao: 0 });

    const expedicoesPorMes = expedicoes.reduce((acc, e) => {
        const mes = new Date(e.data_inicio).getMonth();
        acc[mes] = (acc[mes] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const mesMaisAtivo = Object.entries(expedicoesPorMes).reduce((max, [mes, count]) => 
        count > max.count ? { mes: parseInt(mes), count } : max, 
        { mes: 0, count: 0 });

    const nomesMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const totalExpedicoes = expedicoes.length;
    const expedicoesEsteAno = expedicoes.filter(e => {
        const ano = new Date(e.data_inicio).getFullYear();
        return ano === new Date().getFullYear();
    }).length;

    const metrics = [
        {
            title: "Duração Média",
            value: `${duracaoMedia.toFixed(0)} dias`,
            description: `${expedicoesComDuracao.length} expedições analisadas`,
            icon: ClockIcon,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
            borderColor: "border-blue-200 dark:border-blue-800"
        },
        {
            title: "Expedição Mais Longa",
            value: `${expedicaoMaisLonga.duracao} dias`,
            description: expedicaoMaisLonga.nome || "N/A",
            icon: TrendingUpIcon,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
            borderColor: "border-green-200 dark:border-green-800"
        },
        {
            title: "Mês Mais Ativo",
            value: nomesMeses[mesMaisAtivo.mes],
            description: `${mesMaisAtivo.count} expedições`,
            icon: CalendarDaysIcon,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
            borderColor: "border-purple-200 dark:border-purple-800"
        },
        {
            title: "Expedições Este Ano",
            value: expedicoesEsteAno.toString(),
            description: `${totalExpedicoes} total de expedições`,
            icon: CalendarIcon,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
            borderColor: "border-orange-200 dark:border-orange-800"
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