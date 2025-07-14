"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { AlertTriangleIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, DollarSignIcon } from "lucide-react";

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

interface ChallengeDetailTableProps {
    desafios: Desafio[];
    desafioHasExpedicao: DesafioHasExpedicao[];
    expedicoes: Expedicao[];
}

export function ChallengeDetailTable({ desafios, desafioHasExpedicao, expedicoes }: ChallengeDetailTableProps) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Combinar dados de desafios com expedições
    const detailedData = desafioHasExpedicao.map(dhe => {
        const desafio = desafios.find(d => d.id === dhe.Desafio_id);
        const expedicao = expedicoes.find(e => e.id === dhe.Expedicao_id);
        
        return {
            id: dhe.Desafio_id,
            desafio: desafio,
            expedicao: expedicao,
            despesa_adicional: dhe.despesa_adicional
        };
    }).filter(item => item.desafio && item.expedicao);

    // Ordenar por despesa adicional (maior primeiro)
    const sortedData = detailedData.sort((a, b) => b.despesa_adicional - a.despesa_adicional);

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

    const formatarData = (dataString: string) => {
        try {
            const data = new Date(dataString);
            return data.toLocaleDateString('pt-BR');
        } catch {
            return 'Data inválida';
        }
    };

    return (
        <Card className="p-4 gap-2">
            <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangleIcon className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">Detalhamento dos Desafios</span>
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
                                    <TableHead className="text-foreground font-medium">Expedição</TableHead>
                                    <TableHead className="text-foreground font-medium">Nível de Risco</TableHead>
                                    <TableHead className="text-foreground font-medium">Custo Adicional</TableHead>
                                    <TableHead className="text-foreground font-medium">Status</TableHead>
                                    <TableHead className="text-foreground font-medium">Período</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentData.map((item, index) => (
                                    <TableRow key={`${item.id}-${item.expedicao?.id}-${index}`} className="hover:bg-muted/50">
                                        <TableCell></TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 max-w-[220px]">
                                                <div className="text-foreground font-medium truncate" title={item.desafio?.descricao}>{item.desafio?.descricao}</div>
                                                <div className="text-foreground text-xs truncate" title={`ID: ${item.desafio?.id}`}>ID: {item.desafio?.id}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 max-w-[220px]">
                                                <div className="text-foreground font-medium truncate" title={item.expedicao?.nome}>{item.expedicao?.nome}</div>
                                                <div className="text-foreground text-xs truncate" title={`ID: ${item.expedicao?.id}`}>ID: {item.expedicao?.id}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getRiskColor(item.desafio?.nivel_risco || 'baixo') + ' text-xs font-medium whitespace-nowrap'}>
                                                {(item.desafio?.nivel_risco || 'baixo').charAt(0).toUpperCase() + (item.desafio?.nivel_risco || 'baixo').slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-lg font-bold text-foreground whitespace-nowrap">
                                                {formatarValor(item.despesa_adicional)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                {item.expedicao?.status && <StatusBadge status={item.expedicao.status} />}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-foreground text-xs min-w-[120px] max-w-[180px] truncate">
                                                <div>Início: {formatarData(item.expedicao?.data_inicio || '')}</div>
                                                <div>Fim: {formatarData(item.expedicao?.data_fim || '')}</div>
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