"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, AlertTriangleIcon } from "lucide-react";

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

interface Expedicao {
    id: number;
    nome: string;
    status: string;
    data_inicio: string;
    data_fim: string;
}

interface ChallengeCostTableProps {
    desafios: Desafio[];
    desafioHasExpedicao: DesafioHasExpedicao[];
    expedicoes: Expedicao[];
}

export function ChallengeCostTable({ desafios, desafioHasExpedicao, expedicoes }: ChallengeCostTableProps) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Calcular dados de custo para cada desafio
    const costData = desafios.map(desafio => {
        const desafioExpedicoes = desafioHasExpedicao.filter(dhe => dhe.Desafio_id === desafio.id);
        const totalDespesa = desafioExpedicoes.reduce((acc, dhe) => acc + dhe.despesa_adicional, 0);
        const mediaDespesa = desafioExpedicoes.length > 0 ? totalDespesa / desafioExpedicoes.length : 0;
        const expedicoesRelacionadas = desafioExpedicoes.map(dhe => 
            expedicoes.find(exp => exp.id === dhe.Expedicao_id)
        ).filter(Boolean);
        
        const expedicoesConcluidas = expedicoesRelacionadas.filter(exp => exp?.status === "Concluída").length;
        const totalExpedicoes = expedicoesRelacionadas.length;
        const taxaSucesso = totalExpedicoes > 0 ? (expedicoesConcluidas / totalExpedicoes) * 100 : 0;

        return {
            ...desafio,
            totalDespesa,
            mediaDespesa,
            expedicoesRelacionadas,
            expedicoesConcluidas,
            totalExpedicoes,
            taxaSucesso
        };
    });

    // Ordenar por custo total (maior primeiro)
    const sortedData = costData.sort((a, b) => b.totalDespesa - a.totalDespesa);

    // Calcular paginação
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = sortedData.slice(startIndex, endIndex);

    const getRiskColor = (risco: string) => {
        switch (risco) {
            case 'baixo': return 'bg-green-100 text-green-800 border-green-200';
            case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'alto': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'critico': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatarValor = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    return (
        <Card className="p-4 gap-2">
            <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                    <DollarSignIcon className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">Análise por Custo</span>
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
                                    <TableHead className="text-foreground font-medium">Desafio</TableHead>
                                    <TableHead className="text-foreground font-medium">Custo Total</TableHead>
                                    <TableHead className="text-foreground font-medium">Custo Médio</TableHead>
                                    <TableHead className="text-foreground font-medium">Nível de Risco</TableHead>
                                    <TableHead className="text-foreground font-medium">Taxa de Sucesso</TableHead>
                                    <TableHead className="text-foreground font-medium">Expedições</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentData.map((desafio) => (
                                    <TableRow key={desafio.id} className="hover:bg-muted/50">
                                        <TableCell></TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 max-w-[220px]">
                                                <div className="text-foreground font-medium truncate" title={desafio.descricao}>{desafio.descricao}</div>
                                                <div className="text-foreground text-xs truncate" title={`ID: ${desafio.id}`}>ID: {desafio.id}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-lg font-bold text-foreground whitespace-nowrap">
                                                {formatarValor(desafio.totalDespesa)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-foreground whitespace-nowrap">
                                                {formatarValor(desafio.mediaDespesa)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getRiskColor(desafio.nivel_risco) + ' text-xs font-medium whitespace-nowrap'}>
                                                {desafio.nivel_risco.charAt(0).toUpperCase() + desafio.nivel_risco.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                <span className="text-lg font-bold text-foreground">
                                                    {desafio.taxaSucesso.toFixed(1)}%
                                                </span>
                                                {desafio.taxaSucesso >= 80 ? (
                                                    <TrendingUpIcon className="w-4 h-4 text-green-600" />
                                                ) : desafio.taxaSucesso >= 60 ? (
                                                    <MinusIcon className="w-4 h-4 text-yellow-600" />
                                                ) : (
                                                    <TrendingDownIcon className="w-4 h-4 text-red-600" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 min-w-[120px] max-w-[180px]">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-600 font-bold">
                                                        {desafio.expedicoesConcluidas}
                                                    </span>
                                                    <span className="text-foreground text-xs">concluídas</span>
                                                    <span className="text-foreground text-xs">/</span>
                                                    <span className="text-foreground text-xs">
                                                        {desafio.totalExpedicoes} total
                                                    </span>
                                                </div>
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