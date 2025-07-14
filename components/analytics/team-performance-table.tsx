"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PerformanceBadge } from "@/components/ui/performance-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { UsersIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

interface Equipe {
    id: number;
    nome: string;
    lider_id: number;
}

interface Expedicao {
    id: number;
    nome: string;
    status: string;
    data_inicio: string;
    data_fim: string;
    equipe?: {
        id: number;
        nome: string;
    };
}

interface TeamPerformanceTableProps {
    equipes: Equipe[];
    expedicoes: Expedicao[];
}

export function TeamPerformanceTable({ equipes, expedicoes }: TeamPerformanceTableProps) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Calcular dados de performance para cada equipe
    const teamPerformanceData = equipes.map(equipe => {
        const expedicoesEquipe = expedicoes.filter(e => e.equipe?.id === equipe.id);
        const concluidas = expedicoesEquipe.filter(e => e.status === "Concluída").length;
        const emAndamento = expedicoesEquipe.filter(e => e.status === "Em andamento").length;
        const canceladas = expedicoesEquipe.filter(e => e.status === "Cancelada").length;
        const planejamento = expedicoesEquipe.filter(e => e.status === "Em planejamento").length;
        const total = expedicoesEquipe.length;
        const taxaSucesso = total > 0 ? (concluidas / total) * 100 : 0;

        return {
            ...equipe,
            expedicoes: expedicoesEquipe,
            concluidas,
            emAndamento,
            canceladas,
            planejamento,
            total,
            taxaSucesso
        };
    });

    // Ordenar por taxa de sucesso (maior primeiro)
    const sortedData = teamPerformanceData.sort((a, b) => b.taxaSucesso - a.taxaSucesso);

    // Calcular paginação
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = sortedData.slice(startIndex, endIndex);

    const getTrendIcon = (taxaSucesso: number) => {
        if (taxaSucesso >= 80) {
            return <TrendingUpIcon className="w-4 h-4 text-green-600" />;
        } else if (taxaSucesso >= 60) {
            return <MinusIcon className="w-4 h-4 text-yellow-600" />;
        } else {
            return <TrendingDownIcon className="w-4 h-4 text-red-600" />;
        }
    };



    return (
        <Card className="p-4 gap-2">
            <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">Performance por Equipe</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-4">
                    {/* Tabela */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-4"></TableHead>
                                    <TableHead className="text-foreground font-medium">Equipe</TableHead>
                                    <TableHead className="text-foreground font-medium">Taxa de Sucesso</TableHead>
                                    <TableHead className="text-foreground font-medium">Status</TableHead>
                                    <TableHead className="text-foreground font-medium">Expedições</TableHead>
                                    <TableHead className="text-foreground font-medium">Detalhes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentData.map((equipe) => (
                                    <TableRow key={equipe.id} className="hover:bg-muted/50">
                                        <TableCell></TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="text-foreground font-medium">{equipe.nome}</div>
                                                <div className="text-foreground text-xs">
                                                    ID: {equipe.id}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-foreground">
                                                    {equipe.taxaSucesso.toFixed(1)}%
                                                </span>
                                                {getTrendIcon(equipe.taxaSucesso)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <PerformanceBadge taxaSucesso={equipe.taxaSucesso} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-600 font-bold">
                                                        {equipe.concluidas}
                                                    </span>
                                                    <span className="text-foreground text-xs">concluídas</span>
                                                    <span className="text-foreground text-xs">/</span>
                                                    <span className="text-foreground text-xs">
                                                        {equipe.total} total
                                                    </span>
                                                </div>
                                                <div className="text-foreground text-xs">
                                                    {equipe.emAndamento} em andamento, {equipe.canceladas} canceladas
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-foreground text-xs">
                                                <div>Em andamento: {equipe.emAndamento}</div>
                                                <div>Planejamento: {equipe.planejamento}</div>
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
                            <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
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
                                Mostrando {sortedData.length > 0 ? ((page - 1) * rowsPerPage) + 1 : 0} a {Math.min(page * rowsPerPage, sortedData.length)} de {sortedData.length} resultados
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
                </div>
            </CardContent>
        </Card>
    );
} 