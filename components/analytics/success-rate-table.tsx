"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    ClockIcon, 
    AlertTriangleIcon,
    CalendarIcon,
    TrendingUpIcon
} from "lucide-react";

interface SuccessRateTableProps {
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

export function SuccessRateTable({ expedicoes }: SuccessRateTableProps) {




    const formatarData = (dataString: string) => {
        return new Date(dataString).toLocaleDateString('pt-BR');
    };

    const calcularDuracao = (dataInicio: string, dataFim: string) => {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        const diffTime = Math.abs(fim.getTime() - inicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const expedicoesComDetalhes = expedicoes.map(exp => ({
        ...exp,
        duracao: exp.data_inicio && exp.data_fim ? calcularDuracao(exp.data_inicio, exp.data_fim) : 0,
        dataInicioFormatada: formatarData(exp.data_inicio),
        dataFimFormatada: exp.data_fim ? formatarData(exp.data_fim) : '-'
    }));

    // Estatísticas da tabela
    const totalExpedicoes = expedicoes.length;
    const expedicoesConcluidas = expedicoes.filter(e => e.status === "Concluída").length;
    const expedicoesCanceladas = expedicoes.filter(e => e.status === "Cancelada").length;
    const duracaoMedia = expedicoesComDetalhes
        .filter(e => e.status === "Concluída" && e.duracao > 0)
        .reduce((acc, exp) => acc + exp.duracao, 0) / 
        expedicoesComDetalhes.filter(e => e.status === "Concluída" && e.duracao > 0).length || 0;

    return (
        <Card className="p-4 gap-2">
            <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">Detalhamento das Expedições</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* Estatísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-foreground">{totalExpedicoes}</div>
                        <div className="text-foreground text-xs">Total de Expedições</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{expedicoesConcluidas}</div>
                        <div className="text-foreground text-xs">Concluídas</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{expedicoesCanceladas}</div>
                        <div className="text-foreground text-xs">Canceladas</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{duracaoMedia.toFixed(0)}</div>
                        <div className="text-foreground text-xs">Duração Média (dias)</div>
                    </div>
                </div>

                {/* Tabela detalhada */}
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-4"></TableHead>
                                <TableHead className="text-foreground font-medium">Expedição</TableHead>
                                <TableHead className="text-foreground font-medium">Equipe</TableHead>
                                <TableHead className="text-foreground font-medium">Status</TableHead>
                                <TableHead className="text-foreground font-medium">Início</TableHead>
                                <TableHead className="text-foreground font-medium">Fim</TableHead>
                                <TableHead className="text-foreground font-medium">Duração</TableHead>
                                <TableHead className="text-foreground font-medium">Performance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expedicoesComDetalhes.map((expedicao) => (
                                <TableRow key={expedicao.id} className="hover:bg-muted/50">
                                    <TableCell></TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-foreground font-medium">{expedicao.nome}</div>
                                            <div className="text-foreground text-xs">ID: {expedicao.id}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-foreground font-medium">{expedicao.equipe?.nome || "Não atribuída"}</div>
                                            {expedicao.equipe && (
                                                <div className="text-foreground text-xs">ID: {expedicao.equipe.id}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                                                            <TableCell>
                                            <StatusBadge status={expedicao.status} />
                                        </TableCell>
                                    <TableCell>
                                        <span className="text-foreground">{expedicao.dataInicioFormatada}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-foreground">{expedicao.dataFimFormatada}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-foreground font-medium">
                                            {expedicao.duracao > 0 ? `${expedicao.duracao} dias` : '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {expedicao.status === "Concluída" ? (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <TrendingUpIcon className="w-4 h-4" />
                                                <span className="text-sm">Sucesso</span>
                                            </div>
                                        ) : expedicao.status === "Cancelada" ? (
                                            <div className="flex items-center gap-1 text-red-600">
                                                <XCircleIcon className="w-4 h-4" />
                                                <span className="text-sm">Falha</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-blue-600">
                                                <ClockIcon className="w-4 h-4" />
                                                <span className="text-sm">Em Progresso</span>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Resumo final */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-foreground font-medium mb-2">Resumo Executivo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-foreground text-xs">Taxa de Sucesso: </span>
                            <span className="text-foreground font-bold text-green-600">
                                {totalExpedicoes > 0 ? ((expedicoesConcluidas / totalExpedicoes) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div>
                            <span className="text-foreground text-xs">Taxa de Cancelamento: </span>
                            <span className="text-foreground font-bold text-red-600">
                                {totalExpedicoes > 0 ? ((expedicoesCanceladas / totalExpedicoes) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div>
                            <span className="text-foreground text-xs">Duração Média: </span>
                            <span className="text-foreground font-bold text-blue-600">
                                {duracaoMedia.toFixed(0)} dias
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 