"use client";

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarIcon, 
  TrendingUpIcon, 
  ClockIcon
} from "lucide-react"

interface TemporalAnalysisProps {
    expedicoes: Array<{
        id: number;
        nome: string;
        status: string;
        data_inicio: string;
        data_fim: string;
    }>;
}

export function TemporalAnalysis({ expedicoes }: TemporalAnalysisProps) {
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
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Análise Temporal</h3>
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <ClockIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {duracaoMedia.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Dias Média</div>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUpIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {mesMaisAtivo.count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {nomesMeses[mesMaisAtivo.mes]} Mais Ativo
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Distribuição Mensal</h4>
                    <div className="space-y-2">
                        {nomesMeses.map((mes, index) => (
                            <div key={mes} className="flex items-center justify-between">
                                <span className="text-sm text-foreground">{mes}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all"
                                            style={{ 
                                                width: `${(expedicoesPorMes[index] || 0) / Math.max(...Object.values(expedicoesPorMes)) * 100}%` 
                                            }}
                                        />
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {expedicoesPorMes[index] || 0}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Extremos de Duração</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="text-sm font-medium text-foreground">Mais Longa</div>
                            <div className="text-lg font-bold text-foreground">
                                {expedicaoMaisLonga.duracao} dias
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {expedicaoMaisLonga.nome}
                            </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="text-sm font-medium text-foreground">Mais Curta</div>
                            <div className="text-lg font-bold text-foreground">
                                {expedicaoMaisCurta.duracao} dias
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {expedicaoMaisCurta.nome}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
} 