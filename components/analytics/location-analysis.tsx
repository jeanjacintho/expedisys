"use client";

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPinIcon, 
  TrendingUpIcon
} from "lucide-react"

interface Localizacao {
    id: number;
    pais: string;
    latitude: number;
    longitude: number;
}

interface Expedicao {
    id: number;
    nome: string;
    status: string;
    Localizacao_id: number;
    localizacao?: Localizacao;
}

interface LocationAnalysisProps {
    expedicoes: Expedicao[];
    localizacoes: Localizacao[];
}

export function LocationAnalysis({ expedicoes, localizacoes }: LocationAnalysisProps) {
    const expedicoesComLocalizacao = expedicoes.map(expedicao => {
        const localizacao = localizacoes.find(l => l.id === expedicao.Localizacao_id);
        return {
            ...expedicao,
            localizacao
        };
    }).filter(e => e.localizacao);

    const expedicoesPorPais = expedicoesComLocalizacao.reduce((acc, e) => {
        const pais = e.localizacao?.pais || 'Desconhecido';
        acc[pais] = (acc[pais] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const expedicoesConcluidasPorPais = expedicoesComLocalizacao
        .filter(e => e.status === "Concluída")
        .reduce((acc, e) => {
            const pais = e.localizacao?.pais || 'Desconhecido';
            acc[pais] = (acc[pais] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    const paisMaisAtivo = Object.entries(expedicoesPorPais).reduce((max, [pais, count]) => 
        count > max.count ? { pais, count } : max, 
        { pais: '', count: 0 });

    const paisMaisBemSucedido = Object.entries(expedicoesConcluidasPorPais).reduce((max, [pais, count]) => 
        count > max.count ? { pais, count } : max, 
        { pais: '', count: 0 });

    const totalPaises = Object.keys(expedicoesPorPais).length;
    const totalLocalizacoes = localizacoes.length;

    const paisesOrdenados = Object.entries(expedicoesPorPais)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Análise de Localização</h3>
                <MapPinIcon className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <MapPinIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {totalPaises}
                        </div>
                        <div className="text-xs text-muted-foreground">Países Ativos</div>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUpIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {paisMaisBemSucedido.count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {paisMaisBemSucedido.pais} Mais Sucedido
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Top 5 Países Mais Ativos</h4>
                    <div className="space-y-2">
                        {paisesOrdenados.map(([pais, count], index) => (
                            <div key={pais} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        #{index + 1}
                                    </Badge>
                                    <span className="text-sm font-medium text-foreground">{pais}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all"
                                            style={{ 
                                                width: `${(count / Math.max(...paisesOrdenados.map(([,c]) => c))) * 100}%` 
                                            }}
                                        />
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {count}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">País Mais Ativo</h4>
                    <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-foreground">
                                    {paisMaisAtivo.pais}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {paisMaisAtivo.count} expedições
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-foreground">
                                    {paisMaisAtivo.count}
                                </div>
                                <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Estatísticas</h4>
                    <div className="space-y-2 text-sm">
                        <div className="p-2 bg-muted/30 rounded">
                            <span className="font-medium text-foreground">Total de Localizações:</span> {totalLocalizacoes}
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                            <span className="font-medium text-foreground">Países com Expedições:</span> {totalPaises}
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                            <span className="font-medium text-foreground">Média por País:</span> {
                                (expedicoesComLocalizacao.length / totalPaises).toFixed(1)
                            } expedições
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
} 