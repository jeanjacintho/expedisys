"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { CalendarIcon, ClockIcon, TrendingUpIcon, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TemporalTableProps {
    expedicoes: Array<{
        id: number;
        nome: string;
        status: string;
        data_inicio: string;
        data_fim: string;
    }>;
}

export function TemporalTable({ expedicoes }: TemporalTableProps) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const calcularDuracao = (dataInicio: string, dataFim: string) => {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        return Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    };

    const formatarData = (dataString: string) => {
        try {
            const data = new Date(dataString);
            return format(data, 'dd/MM/yyyy', { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    const expedicoesComDuracao = expedicoes
        .filter(e => e.data_inicio && e.data_fim)
        .map(e => ({
            ...e,
            duracao: calcularDuracao(e.data_inicio, e.data_fim)
        }))
        .sort((a, b) => b.duracao - a.duracao);

    const getDuracaoColor = (duracao: number) => {
        if (duracao <= 30) return "text-green-600";
        if (duracao <= 60) return "text-blue-600";
        if (duracao <= 90) return "text-yellow-600";
        return "text-red-600";
    };

    // Paginação
    const totalPages = Math.ceil(expedicoesComDuracao.length / rowsPerPage);
    const paginated = expedicoesComDuracao.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // Resetar página quando mudar rowsPerPage
    const handleRowsPerPageChange = (value: string) => {
        setRowsPerPage(Number(value));
        setPage(1);
    };



    return (
        <Card className="p-4 gap-2">
            <div className="text-sm text-foreground flex justify-between font-medium">
                Análise Temporal Detalhada
                <CalendarIcon className="w-4 h-4 text-primary" />
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-4"></TableHead>
                            <TableHead className="text-foreground font-medium">Expedição</TableHead>
                            <TableHead className="text-foreground font-medium">Status</TableHead>
                            <TableHead className="text-foreground font-medium">Início</TableHead>
                            <TableHead className="text-foreground font-medium">Fim</TableHead>
                            <TableHead className="text-foreground font-medium">Duração</TableHead>
                            <TableHead className="text-foreground font-medium">Classificação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.map((expedicao) => (
                            <TableRow key={expedicao.id} className="hover:bg-muted/50">
                                <TableCell></TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-foreground font-medium max-w-[200px] truncate">
                                            {expedicao.nome}
                                        </span>
                                        <span className="text-foreground text-xs">ID: {expedicao.id}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={expedicao.status} />
                                </TableCell>
                                <TableCell>
                                    <span className="text-foreground">{formatarData(expedicao.data_inicio)}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-foreground">{formatarData(expedicao.data_fim)}</span>
                                </TableCell>
                                <TableCell>
                                    <span className={`font-bold ${getDuracaoColor(expedicao.duracao)}`}>
                                        {expedicao.duracao} dias
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {expedicao.duracao <= 30 && (
                                            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                                                Rápida
                                            </span>
                                        )}
                                        {expedicao.duracao > 30 && expedicao.duracao <= 60 && (
                                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                                                Normal
                                            </span>
                                        )}
                                        {expedicao.duracao > 60 && expedicao.duracao <= 90 && (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full">
                                                Longa
                                            </span>
                                        )}
                                        {expedicao.duracao > 90 && (
                                            <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full">
                                                Muito Longa
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="text-foreground text-sm font-medium">Linhas por página:</span>
                    <Select value={rowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
                        <SelectTrigger className="w-16">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="15">15</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-foreground text-sm">
                        Mostrando {expedicoesComDuracao.length > 0 ? ((page - 1) * rowsPerPage) + 1 : 0} a {Math.min(page * rowsPerPage, expedicoesComDuracao.length)} de {expedicoesComDuracao.length} resultados
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-foreground text-sm font-medium">
                        Página {page} de {totalPages}
                    </span>
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                aria-label="Primeira página"
                                className="w-8 h-8"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                aria-label="Página anterior"
                                className="w-8 h-8"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                aria-label="Próxima página"
                                className="w-8 h-8"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                                aria-label="Última página"
                                className="w-8 h-8"
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </div>
            </div>

            {/* Estatísticas Resumo */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                        <ClockIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {expedicoesComDuracao.length > 0 
                            ? Math.round(expedicoesComDuracao.reduce((acc, e) => acc + e.duracao, 0) / expedicoesComDuracao.length)
                            : 0
                        }
                    </div>
                    <div className="text-xs text-muted-foreground">Duração Média (dias)</div>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                        <TrendingUpIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {expedicoesComDuracao.filter(e => e.duracao <= 30).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Expedições Rápidas</div>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {expedicoesComDuracao.filter(e => e.duracao > 90).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Expedições Longas</div>
                </div>
            </div>
        </Card>
    );
} 