"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PerformanceBadge } from "@/components/ui/performance-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { CalendarIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon, MapPinIcon, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

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
    data_inicio: string;
    data_fim: string;
    equipe?: {
        id: number;
        nome: string;
    };
}

interface LocationPerformanceTableProps {
    localizacoes: Localizacao[];
    expedicoes: Expedicao[];
}

export function LocationPerformanceTable({ localizacoes, expedicoes }: LocationPerformanceTableProps) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Calcular dados de performance para cada localização
    const locationPerformanceData = localizacoes.map(localizacao => {
        const expedicoesLocal = expedicoes.filter(e => {
            // Simular relação entre expedição e localização
            return e.id % localizacoes.length === localizacao.id % localizacoes.length;
        });
        const concluidas = expedicoesLocal.filter(e => e.status === "Concluída").length;
        const emAndamento = expedicoesLocal.filter(e => e.status === "Em andamento").length;
        const canceladas = expedicoesLocal.filter(e => e.status === "Cancelada").length;
        const planejamento = expedicoesLocal.filter(e => e.status === "Em planejamento").length;
        const total = expedicoesLocal.length;
        const taxaSucesso = total > 0 ? (concluidas / total) * 100 : 0;

        return {
            ...localizacao,
            expedicoes: expedicoesLocal,
            concluidas,
            emAndamento,
            canceladas,
            planejamento,
            total,
            taxaSucesso
        };
    });

    // Ordenar por taxa de sucesso (maior primeiro)
    const sortedData = locationPerformanceData.sort((a, b) => b.taxaSucesso - a.taxaSucesso);

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



    const getRegionBadge = (pais: string) => {
        const regions = {
            'Brasil': 'América do Sul',
            'Argentina': 'América do Sul',
            'Chile': 'América do Sul',
            'Peru': 'América do Sul',
            'México': 'América do Norte',
            'Estados Unidos': 'América do Norte',
            'Canadá': 'América do Norte',
            'Egito': 'África',
            'Marrocos': 'África',
            'Tunísia': 'África',
            'Grécia': 'Europa',
            'Itália': 'Europa',
            'Espanha': 'Europa',
            'França': 'Europa',
            'China': 'Ásia',
            'Japão': 'Ásia',
            'Índia': 'Ásia',
            'Tailândia': 'Ásia'
        };
        
        const region = regions[pais as keyof typeof regions] || 'Outros';
        return <Badge variant="outline" className="text-xs">{region}</Badge>;
    };

    return (
        <Card className="p-4 gap-2">
            <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">Performance por Localização</span>
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
                                    <TableHead className="text-foreground font-medium">Localização</TableHead>
                                    <TableHead className="text-foreground font-medium">Taxa de Sucesso</TableHead>
                                    <TableHead className="text-foreground font-medium">Status</TableHead>
                                    <TableHead className="text-foreground font-medium">Expedições</TableHead>
                                    <TableHead className="text-foreground font-medium">Detalhes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentData.map((localizacao) => (
                                    <TableRow key={localizacao.id} className="hover:bg-muted/50">
                                        <TableCell></TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <MapPinIcon className="w-4 h-4 text-primary" />
                                                    <div>
                                                        <div className="text-foreground font-medium">{localizacao.pais}</div>
                                                        <div className="text-foreground text-xs">
                                                            {localizacao.latitude.toFixed(2)}°, {localizacao.longitude.toFixed(2)}°
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    {getRegionBadge(localizacao.pais)}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-foreground">
                                                    {localizacao.taxaSucesso.toFixed(1)}%
                                                </span>
                                                {getTrendIcon(localizacao.taxaSucesso)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <PerformanceBadge taxaSucesso={localizacao.taxaSucesso} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-600 font-bold">
                                                        {localizacao.concluidas}
                                                    </span>
                                                    <span className="text-foreground text-xs">concluídas</span>
                                                    <span className="text-foreground text-xs">/</span>
                                                    <span className="text-foreground text-xs">
                                                        {localizacao.total} total
                                                    </span>
                                                </div>
                                                <div className="text-foreground text-xs">
                                                    {localizacao.canceladas} canceladas, {localizacao.emAndamento} em andamento
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-foreground text-xs">
                                                <div>Em andamento: {localizacao.emAndamento}</div>
                                                <div>Planejamento: {localizacao.planejamento}</div>
                                                <div>ID: {localizacao.id}</div>
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