"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    ClockIcon, 
    AlertTriangleIcon,
    CalendarIcon,
    TrendingUpIcon,
    SearchIcon,
    FilterIcon,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";

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

interface ExpeditionDetailTableProps {
    expedicoes: Expedicao[];
}

export function ExpeditionDetailTable({ expedicoes }: ExpeditionDetailTableProps) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");





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

    // Processar dados das expedições
    const expedicoesComDetalhes = expedicoes.map(exp => ({
        ...exp,
        duracao: exp.data_inicio && exp.data_fim ? calcularDuracao(exp.data_inicio, exp.data_fim) : 0,
        dataInicioFormatada: formatarData(exp.data_inicio),
        dataFimFormatada: exp.data_fim ? formatarData(exp.data_fim) : '-'
    }));

    // Filtrar expedições
    const filteredExpedicoes = expedicoesComDetalhes.filter(exp => {
        const matchesSearch = exp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exp.equipe?.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "" || exp.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Ordenar por data de início (mais recentes primeiro)
    const sortedExpedicoes = filteredExpedicoes.sort((a, b) => 
        new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
    );

    // Calcular paginação
    const totalPages = Math.ceil(sortedExpedicoes.length / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = sortedExpedicoes.slice(startIndex, endIndex);

    // Estatísticas
    const totalExpedicoes = expedicoes.length;
    const expedicoesConcluidas = expedicoes.filter(e => e.status === "Concluída").length;
    const expedicoesCanceladas = expedicoes.filter(e => e.status === "Cancelada").length;
    const duracaoMedia = expedicoesComDetalhes
        .filter(e => e.status === "Concluída" && e.duracao > 0)
        .reduce((acc, exp) => acc + exp.duracao, 0) / 
        expedicoesComDetalhes.filter(e => e.status === "Concluída" && e.duracao > 0).length || 0;

    const getPerformanceIndicator = (status: string) => {
        switch (status) {
            case "Concluída":
                return (
                    <div className="flex items-center gap-1 text-green-600">
                        <TrendingUpIcon className="w-4 h-4" />
                        <span className="text-sm">Sucesso</span>
                    </div>
                );
            case "Cancelada":
                return (
                    <div className="flex items-center gap-1 text-red-600">
                        <XCircleIcon className="w-4 h-4" />
                        <span className="text-sm">Falha</span>
                    </div>
                );
            case "Em andamento":
                return (
                    <div className="flex items-center gap-1 text-blue-600">
                        <ClockIcon className="w-4 h-4" />
                        <span className="text-sm">Em Progresso</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1 text-yellow-600">
                        <AlertTriangleIcon className="w-4 h-4" />
                        <span className="text-sm">Planejamento</span>
                    </div>
                );
        }
    };

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

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Buscar expedição ou equipe..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <FilterIcon className="w-4 h-4 text-primary" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="px-3 py-2 border rounded-md text-sm bg-background"
                        >
                            <option value="">Todos os Status</option>
                            <option value="Concluída">Concluída</option>
                            <option value="Em andamento">Em Andamento</option>
                            <option value="Cancelada">Cancelada</option>
                            <option value="Em planejamento">Em Planejamento</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
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
                                {currentData.map((expedicao) => (
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
                                            {getPerformanceIndicator(expedicao.status)}
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
                                    <SelectItem value="8">8</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="15">15</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-foreground text-sm">
                                Mostrando {sortedExpedicoes.length > 0 ? ((page - 1) * rowsPerPage) + 1 : 0} a {Math.min(page * rowsPerPage, sortedExpedicoes.length)} de {sortedExpedicoes.length} resultados
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