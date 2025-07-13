"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
    FilterIcon, 
    CalendarIcon, 
    MoreVertical, 
    ChevronsLeft, 
    ChevronLeft, 
    ChevronRight, 
    ChevronsRight,
    ChevronsUpDownIcon,
    CheckIcon,
    EyeIcon,
    DollarSignIcon,
    ClockIcon,
    AwardIcon,
    TrendingUpIcon
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { ArtifactDetailsModal } from "@/components/artifact-details-modal";

// Interfaces
interface Artefato {
    id: number;
    nome: string;
    material: string;
    idade_em_anos: number;
    Expedicao_id: number;
    valor_estimado: number;
    Estado_Conservacao_id: number;
    data_encontrado: string;
    Importancia_Historica_id: number;
}

interface ArtefatoComDetalhes extends Artefato {
    expedicao?: {
        id: number;
        nome: string;
        status: string;
    };
    estado_conservacao?: {
        id: number;
        nivel: string;
    };
    importancia_historica?: {
        id: number;
        descricao: string;
    };
}

// Componentes auxiliares
function EstadoConservacaoBadge({ nivel }: { nivel: string }) {
    const getColor = (nivel: string) => {
        switch (nivel) {
            case "Excelente": return "bg-green-500";
            case "Bom": return "bg-blue-500";
            case "Regular": return "bg-yellow-500";
            case "Ruim": return "bg-orange-500";
            case "Crítico": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <Badge variant="outline">
            <div className={`w-2 h-2 rounded-full mr-2 ${getColor(nivel)}`} />
            {nivel}
        </Badge>
    );
}

function ImportanciaHistoricaBadge({ descricao }: { descricao: string }) {
    return (
        <Badge variant="outline">
            {descricao}
        </Badge>
    );
}



// Componente principal
export default function ArtifactsPage() {
    const router = useRouter();
    const [artefatos, setArtefatos] = useState<ArtefatoComDetalhes[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedArtefato, setSelectedArtefato] = useState<ArtefatoComDetalhes | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    
    // Estados para os popovers dos filtros
    const [openMaterial, setOpenMaterial] = useState(false);
    const [openEstado, setOpenEstado] = useState(false);
    const [openImportancia, setOpenImportancia] = useState(false);
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [materialFilter, setMaterialFilter] = useState<string>("all");
    const [estadoFilter, setEstadoFilter] = useState<string>("all");
    const [importanciaFilter, setImportanciaFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [valorMinFilter, setValorMinFilter] = useState<string>("");
    const [valorMaxFilter, setValorMaxFilter] = useState<string>("");

    // Carregar dados
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [artefatosData, expedicoes, estadosConservacao, importanciasHistoricas] = await Promise.all([
                    ApiService.getArtefatos(),
                    ApiService.getExpedicoes(),
                    ApiService.getEstadosConservacao(),
                    ApiService.getImportanciasHistoricas(),
                ]);

                const artefatosComDetalhes = artefatosData.map(artefato => {
                    const expedicao = expedicoes.find(e => e.id === artefato.Expedicao_id);
                    const estadoConservacao = estadosConservacao.find(e => e.id === artefato.Estado_Conservacao_id);
                    const importanciaHistorica = importanciasHistoricas.find(i => i.id === artefato.Importancia_Historica_id);

                    return {
                        ...artefato,
                        expedicao,
                        estado_conservacao: estadoConservacao,
                        importancia_historica: importanciaHistorica
                    };
                });

                setArtefatos(artefatosComDetalhes);
            } catch (error) {
                console.error('Erro ao carregar artefatos:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Obter valores únicos para os filtros
    const materialOptions = useMemo(() => {
        const materials = [...new Set(artefatos.map(a => a.material))];
        return materials.sort();
    }, [artefatos]);

    const estadoOptions = useMemo(() => {
        const estados = [...new Set(artefatos.map(a => a.estado_conservacao?.nivel).filter(Boolean))];
        return estados.sort();
    }, [artefatos]);

    const importanciaOptions = useMemo(() => {
        const importancias = [...new Set(artefatos.map(a => a.importancia_historica?.descricao).filter(Boolean))];
        return importancias.sort();
    }, [artefatos]);

    // Aplicar filtros
    const filteredArtefatos = useMemo(() => {
        return artefatos.filter(artefato => {
            const matchesSearch = searchTerm === "" || 
                artefato.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                artefato.material.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesMaterial = materialFilter === "all" || artefato.material === materialFilter;
            const matchesEstado = estadoFilter === "all" || artefato.estado_conservacao?.nivel === estadoFilter;
            const matchesImportancia = importanciaFilter === "all" || artefato.importancia_historica?.descricao === importanciaFilter;
            
            // Filtros de data
            const artefatoData = new Date(artefato.data_encontrado);
            const matchesDateRange = !dateRange?.from || !dateRange?.to || 
                (artefatoData >= dateRange.from && artefatoData <= dateRange.to);
            
            // Filtros de valor
            const valorMin = valorMinFilter ? parseFloat(valorMinFilter) : 0;
            const valorMax = valorMaxFilter ? parseFloat(valorMaxFilter) : Infinity;
            const matchesValor = artefato.valor_estimado >= valorMin && artefato.valor_estimado <= valorMax;
            
            return matchesSearch && matchesMaterial && matchesEstado && matchesImportancia && matchesDateRange && matchesValor;
        });
    }, [artefatos, searchTerm, materialFilter, estadoFilter, importanciaFilter, dateRange, valorMinFilter, valorMaxFilter]);

    // Estatísticas
    const estatisticas = useMemo(() => {
        const totalValor = artefatos.reduce((sum, a) => sum + a.valor_estimado, 0);
        const totalIdade = artefatos.reduce((sum, a) => sum + a.idade_em_anos, 0);
        const mediaIdade = artefatos.length > 0 ? Math.round(totalIdade / artefatos.length) : 0;
        const artefatosExcelentes = artefatos.filter(a => a.estado_conservacao?.nivel === "Excelente").length;
        const patrimonioMundial = artefatos.filter(a => a.importancia_historica?.descricao === "Patrimônio Mundial").length;

        return {
            totalArtefatos: artefatos.length,
            totalValor,
            mediaIdade,
            artefatosExcelentes,
            patrimonioMundial
        };
    }, [artefatos]);

    // Paginação
    const totalPages = Math.ceil(filteredArtefatos.length / rowsPerPage);
    const paginated = filteredArtefatos.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // Resetar página quando mudar filtros
    useEffect(() => {
        setPage(1);
    }, [searchTerm, materialFilter, estadoFilter, importanciaFilter, dateRange, valorMinFilter, valorMaxFilter]);

    const formatarData = (dataString: string) => {
        try {
            const data = new Date(dataString);
            return format(data, 'dd/MM/yyyy', { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    const formatarValor = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const formatarPeriodoData = (dateRange: DateRange | undefined) => {
        if (!dateRange?.from) return "Selecionar período"
        
        if (dateRange.to) {
            const fromDate = format(dateRange.from, "dd/MM", { locale: ptBR })
            const toDate = format(dateRange.to, "dd/MM", { locale: ptBR })
            const fromYear = format(dateRange.from, "yyyy", { locale: ptBR })
            const toYear = format(dateRange.to, "yyyy", { locale: ptBR })
            
            if (fromYear === toYear) {
                return `${fromDate} - ${toDate}/${fromYear}`
            } else {
                return `${fromDate}/${fromYear} - ${toDate}/${toYear}`
            }
        } else {
            return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-64" />
                </div>
                
                {/* Skeleton para estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                
                {/* Skeleton para filtros */}
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <div className="flex gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-32" />
                        ))}
                    </div>
                </div>
                
                {/* Skeleton para tabela */}
                <div className="space-y-3">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 md:gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Total de Artefatos
                        <AwardIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.totalArtefatos}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {`${estatisticas.totalArtefatos} artefatos catalogados`}
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Valor Total
                        <DollarSignIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {formatarValor(estatisticas.totalValor)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {`Valor total estimado`}
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Idade Média
                        <ClockIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.mediaIdade.toLocaleString()} anos
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {`Idade média dos artefatos`}
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Excelente Estado
                        <TrendingUpIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.artefatosExcelentes}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {`${estatisticas.artefatosExcelentes} em excelente estado`}
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Patrimônio Mundial
                        <AwardIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.patrimonioMundial}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {`${estatisticas.patrimonioMundial} de patrimônio mundial`}
                    </div>
                </Card>
            </div>

            {/* Card com Filtros e Tabela */}
            <Card className="p-4">
                <div className="space-y-4">
                    {/* Filtros */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FilterIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Filtros:</span>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setMaterialFilter("all");
                                setEstadoFilter("all");
                                setImportanciaFilter("all");
                                setDateRange(undefined);
                                setValorMinFilter("");
                                setValorMaxFilter("");
                            }}
                        >
                            Limpar filtros
                        </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 max-w-xl">
                            <Input
                                placeholder="Buscar por nome ou material..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <Popover open={openMaterial} onOpenChange={setOpenMaterial}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-48 justify-start text-left font-normal"
                                >
                                    <ChevronsUpDownIcon className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">
                                        {materialFilter === "all" ? "Todos os materiais" : materialFilter}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar material..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhum material encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => {
                                                    setMaterialFilter("all");
                                                    setOpenMaterial(false);
                                                }}
                                            >
                                                Todos os materiais
                                            </CommandItem>
                                            {materialOptions.map(material => (
                                                <CommandItem
                                                    key={material}
                                                    onSelect={() => {
                                                        setMaterialFilter(material);
                                                        setOpenMaterial(false);
                                                    }}
                                                >
                                                    {material}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <Popover open={openEstado} onOpenChange={setOpenEstado}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-48 justify-start text-left font-normal"
                                >
                                    <ChevronsUpDownIcon className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">
                                        {estadoFilter === "all" ? "Todos os estados" : estadoFilter}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar estado..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => {
                                                    setEstadoFilter("all");
                                                    setOpenEstado(false);
                                                }}
                                            >
                                                Todos os estados
                                            </CommandItem>
                                            {estadoOptions.map(estado => (
                                                <CommandItem
                                                    key={estado}
                                                    onSelect={() => {
                                                        setEstadoFilter(estado || "all");
                                                        setOpenEstado(false);
                                                    }}
                                                >
                                                    {estado}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <Popover open={openImportancia} onOpenChange={setOpenImportancia}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-56 justify-start text-left font-normal"
                                >
                                    <ChevronsUpDownIcon className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">
                                        {importanciaFilter === "all" ? "Todas as importâncias" : importanciaFilter}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar importância..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhuma importância encontrada.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => {
                                                    setImportanciaFilter("all");
                                                    setOpenImportancia(false);
                                                }}
                                            >
                                                Todas as importâncias
                                            </CommandItem>
                                            {importanciaOptions.map(importancia => (
                                                <CommandItem
                                                    key={importancia}
                                                    onSelect={() => {
                                                        setImportanciaFilter(importancia || "all");
                                                        setOpenImportancia(false);
                                                    }}
                                                >
                                                    {importancia}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-48 justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formatarPeriodoData(dateRange)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                    locale={ptBR}
                                    className="rounded-lg border shadow-sm"
                                />
                            </PopoverContent>
                        </Popover>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Valor mínimo"
                                value={valorMinFilter}
                                onChange={(e) => setValorMinFilter(e.target.value)}
                                className="w-32"
                                type="number"
                            />
                            <Input
                                placeholder="Valor máximo"
                                value={valorMaxFilter}
                                onChange={(e) => setValorMaxFilter(e.target.value)}
                                className="w-32"
                                type="number"
                            />
                        </div>
                    </div>

                    {filteredArtefatos.length === 0 && !loading && (
                        <div className="text-center text-muted-foreground py-8">
                            Nenhum artefato encontrado
                        </div>
                    )}

                    {/* Tabela */}
                    <div className="border border-border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Idade</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Importância</TableHead>
                                    <TableHead>Data Encontrado</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.map((artefato) => (
                                    <TableRow key={artefato.id}>
                                        <TableCell></TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate">
                                            {artefato.nome}
                                        </TableCell>
                                        <TableCell>{artefato.material}</TableCell>
                                        <TableCell>{artefato.idade_em_anos.toLocaleString()} anos</TableCell>
                                        <TableCell className="font-medium">
                                            {formatarValor(artefato.valor_estimado)}
                                        </TableCell>
                                        <TableCell>
                                            <EstadoConservacaoBadge nivel={artefato.estado_conservacao?.nivel || "N/A"} />
                                        </TableCell>
                                        <TableCell>
                                            <ImportanciaHistoricaBadge descricao={artefato.importancia_historica?.descricao || "N/A"} />
                                        </TableCell>
                                        <TableCell>{formatarData(artefato.data_encontrado)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            setSelectedArtefato(artefato);
                                                            setDetailsModalOpen(true);
                                                        }}
                                                    >
                                                        <EyeIcon className="mr-2 h-4 w-4" />
                                                        Ver detalhes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            router.push(`/artifacts/edit/${artefato.id}`);
                                                        }}
                                                    >
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginação */}
                    <div className="">
                        <Pagination className="justify-between">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm">Rows per page:</span>
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
                                <span className="text-sm">
                                    Showing {filteredArtefatos.length > 0 ? ((page - 1) * rowsPerPage) + 1 : 0} to {Math.min(page * rowsPerPage, filteredArtefatos.length)} of {filteredArtefatos.length} results
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
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
                                        >
                                            <ChevronsRight className="w-4 h-4" />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </div>
                        </Pagination>
                    </div>
                </div>
            </Card>

            {/* Modal de detalhes */}
            <ArtifactDetailsModal 
                artefato={selectedArtefato}
                open={detailsModalOpen}
                onOpenChange={setDetailsModalOpen}
                router={router}
            />
        </div>
    );
}