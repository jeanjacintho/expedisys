"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon, ClockIcon, AlertTriangleIcon } from "lucide-react";

interface ExpeditionSuccessRateProps {
    expedicoes: Array<{
        id: number;
        nome: string;
        status: string;
        data_inicio: string;
        data_fim: string;
        equipe?: {
            id: number;
            nome: string;
        };
    }>;
}

export function ExpeditionSuccessRate({ expedicoes }: ExpeditionSuccessRateProps) {
    const totalExpedicoes = expedicoes.length;
    const expedicoesConcluidas = expedicoes.filter(e => e.status === "Concluída").length;
    const expedicoesEmAndamento = expedicoes.filter(e => e.status === "Em andamento").length;
    const expedicoesCanceladas = expedicoes.filter(e => e.status === "Cancelada").length;
    const expedicoesPlanejamento = expedicoes.filter(e => e.status === "Em planejamento").length;

    const taxaSucesso = totalExpedicoes > 0 ? (expedicoesConcluidas / totalExpedicoes) * 100 : 0;
    const taxaAndamento = totalExpedicoes > 0 ? (expedicoesEmAndamento / totalExpedicoes) * 100 : 0;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Concluída": return <CheckIcon className="w-4 h-4 text-foreground" />;
            case "Em andamento": return <ClockIcon className="w-4 h-4 text-foreground" />;
            case "Cancelada": return <XIcon className="w-4 h-4 text-foreground" />;
            case "Em planejamento": return <AlertTriangleIcon className="w-4 h-4 text-foreground" />;
            default: return null;
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Taxa de Sucesso das Expedições</h3>
                <Badge variant="outline">{totalExpedicoes} total</Badge>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Taxa de Sucesso</span>
                        <span className="text-sm font-bold text-foreground">{taxaSucesso.toFixed(1)}%</span>
                    </div>
                    <Progress value={taxaSucesso} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <CheckIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">{expedicoesConcluidas}</div>
                        <div className="text-xs text-muted-foreground">Concluídas</div>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <ClockIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">{expedicoesEmAndamento}</div>
                        <div className="text-xs text-muted-foreground">Em Andamento</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Distribuição por Status</h4>
                    {[
                        { status: "Concluída", count: expedicoesConcluidas },
                        { status: "Em andamento", count: expedicoesEmAndamento },
                        { status: "Em planejamento", count: expedicoesPlanejamento },
                        { status: "Cancelada", count: expedicoesCanceladas }
                    ].map((item) => (
                        <div key={item.status} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(item.status)}
                                <span className="text-sm text-foreground">{item.status}</span>
                            </div>
                            <Badge variant="outline">
                                {item.count}
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
} 