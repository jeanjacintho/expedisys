"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { AlertTriangleIcon, DollarSignIcon, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

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

interface ChallengeTableProps {
    desafios: Desafio[];
    desafioHasExpedicao: DesafioHasExpedicao[];
}

export function ChallengeTable({ desafios, desafioHasExpedicao }: ChallengeTableProps) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const desafiosComDetalhes = desafioHasExpedicao.map(dhe => {
        const desafio = desafios.find(d => d.id === dhe.Desafio_id);
        return {
            ...dhe,
            desafio: desafio
        };
    }).filter(d => d.desafio);

    const formatarValor = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const getRiscoBadge = (risco: string) => {
        switch (risco) {
            case 'baixo':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Baixo
                    </Badge>
                );
            case 'medio':
                return (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Médio
                    </Badge>
                );
            case 'alto':
                return (
                    <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        Alto
                    </Badge>
                );
            case 'critico':
                return (
                    <Badge variant="default" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Crítico
                    </Badge>
                );
            default:
                return <Badge variant="outline">{risco}</Badge>;
        }
    };

    // Paginação
    const totalPages = Math.ceil(desafiosComDetalhes.length / rowsPerPage);
    const paginated = desafiosComDetalhes.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // Resetar página quando mudar rowsPerPage
    const handleRowsPerPageChange = (value: string) => {
        setRowsPerPage(Number(value));
        setPage(1);
    };

    return (
        <Card className="p-4 gap-2">
            <div className="text-sm text-foreground flex justify-between font-medium">
                Análise Detalhada de Desafios
                <AlertTriangleIcon className="w-4 h-4 text-primary" />
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-4"></TableHead>
                            <TableHead className="text-foreground font-medium">Desafio</TableHead>
                            <TableHead className="text-foreground font-medium">Risco</TableHead>
                            <TableHead className="text-foreground font-medium">Expedição</TableHead>
                            <TableHead className="text-foreground font-medium">Despesa Adicional</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.map((item) => (
                            <TableRow key={`${item.Desafio_id}-${item.Expedicao_id}`} className="hover:bg-muted/50">
                                <TableCell></TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-foreground font-medium max-w-[200px] truncate">
                                            {item.desafio?.descricao}
                                        </span>
                                        <span className="text-foreground text-xs">ID: {item.Desafio_id}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getRiscoBadge(item.desafio?.nivel_risco || 'baixo')}
                                </TableCell>
                                <TableCell>
                                    <span className="text-foreground font-medium">
                                        #{item.Expedicao_id}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-foreground">
                                            {formatarValor(item.despesa_adicional)}
                                        </span>
                                        <DollarSignIcon className="w-4 h-4 text-primary" />
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
                        Mostrando {desafiosComDetalhes.length > 0 ? ((page - 1) * rowsPerPage) + 1 : 0} a {Math.min(page * rowsPerPage, desafiosComDetalhes.length)} de {desafiosComDetalhes.length} resultados
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
                        <AlertTriangleIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {desafiosComDetalhes.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Total de Desafios</div>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                        <DollarSignIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {formatarValor(desafiosComDetalhes.reduce((acc, d) => acc + d.despesa_adicional, 0))}
                    </div>
                    <div className="text-xs text-muted-foreground">Total de Despesas</div>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                        <AlertTriangleIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {desafiosComDetalhes.filter(d => d.desafio?.nivel_risco === 'critico').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Desafios Críticos</div>
                </div>
            </div>
        </Card>
    );
} 