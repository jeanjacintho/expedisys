"use client";

import { useState, useEffect, useMemo } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  FilterIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XIcon,
  MoreVertical,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsUpDownIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ApiService } from "@/lib/api";
import { ExpeditionDetailsModal } from "@/components/expedition-details-modal";

import { PageSkeleton } from "@/components/page-skeleton";
import { TeamAvatars } from "@/components/team-avatars";
import { ImagePreloader } from "@/components/image-preloader";

// Definição do tipo para expedição
interface Expedicao {
    id: number;
    nome: string;
    data_inicio: string;
    data_fim: string;
    ruina: { 
        nome: string;
        descricao: string;
        latitude: number;
        longitude: number;
    };
    localizacao: { pais: string; estado?: string; cidade?: string };
    equipe: { 
        id: number;
        nome: string;
        pessoas?: Array<{
            id: number;
            nome: string;
            avatar?: string;
            especialidade?: string;
            email?: string;
            telefone?: string;
            isLider?: boolean;
        }>;
    };
    status: string;
    descricao?: string;
}

function statusToVariant(status: string): "outline" | "default" | "destructive" | "secondary" {
    if (status === "Concluída") return "outline";
    if (status === "Em planejamento") return "outline";
    if (status === "Em andamento") return "outline";
    if (status === "Cancelada") return "outline";
    return "outline";
}

function statusIcon(status: string) {
    if (status === "Concluída") return <div className="bg-green-500 p-0.5 rounded-full"><CheckCircleIcon className="w-2 h-2 text-white" /></div>;
    if (status === "Em andamento") return <div className="bg-blue-500 p-0.5 rounded-full"><ClockIcon className="w-2 h-2 text-white" /></div>;
    if (status === "Em planejamento") return <div className="bg-yellow-500 p-0.5 rounded-full"><ClockIcon className="w-2 h-2 text-white" /></div>;
    if (status === "Cancelada") return <div className="bg-red-500 p-0.5 rounded-full"><XIcon className="w-2 h-2 text-white" /></div>;
    return null;
}

function calculateProgress(dataInicio: string, dataFim: string): number {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const hoje = new Date();
    
    // Se ainda não começou
    if (hoje < inicio) return 0;
    
    // Se já terminou
    if (hoje > fim) return 100;
    
    // Calcular progresso
    const duracaoTotal = fim.getTime() - inicio.getTime();
    const tempoDecorrido = hoje.getTime() - inicio.getTime();
    
    return Math.round((tempoDecorrido / duracaoTotal) * 100);
}

function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
                {progress}%
            </span>
        </div>
    );
}

const formatarPeriodoData = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from) return "Selecionar período"
    
    if (dateRange.to) {
        const fromDate = format(dateRange.from, "dd/MM", { locale: ptBR })
        const toDate = format(dateRange.to, "dd/MM", { locale: ptBR })
        const fromYear = format(dateRange.from, "yyyy", { locale: ptBR })
        const toYear = format(dateRange.to, "yyyy", { locale: ptBR })
        
        // Se os anos são iguais, mostra apenas uma vez
        if (fromYear === toYear) {
            return `${fromDate} - ${toDate}/${fromYear}`
        } else {
            return `${fromDate}/${fromYear} - ${toDate}/${toYear}`
        }
    } else {
        return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
    }
}

export default function ExpeditionPage() {
    const router = useRouter();
    const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedExpedicao, setSelectedExpedicao] = useState<Expedicao | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Estados para os popovers dos filtros
    const [openPais, setOpenPais] = useState(false);
    const [openEquipe, setOpenEquipe] = useState(false);
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paisFilter, setPaisFilter] = useState<string>("all");
    const [equipeFilter, setEquipeFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [expedicoesRes, equipes, localizacoes, ruinas, pessoas, equipeHasPessoa, especialidades] = await Promise.all([
                fetch('/api/expedicoes').then(res => res.json()),
                ApiService.getEquipes(),
                ApiService.getLocalizacoes(),
                ApiService.getRuinas(),
                ApiService.getPessoas(),
                ApiService.getEquipeHasPessoa(),
                ApiService.getEspecialidades(),
            ]);
            
            // Relacionar pessoas com equipes usando a tabela de relacionamento
            const equipesComPessoas = equipes.map(equipe => ({
                ...equipe,
                pessoas: pessoas.filter(pessoa => 
                    equipeHasPessoa.some(rel => rel.Equipe_id === equipe.id && rel.Pessoa_id === pessoa.id)
                ).map(pessoa => ({
                    ...pessoa,
                    especialidade: especialidades.find(esp => esp.id === pessoa.especialidade_id)?.titulo,
                    email: pessoa.email,
                    telefone: pessoa.telefone,
                    isLider: pessoa.id === equipe.lider_id
                }))
            }));
            
            const expeds = expedicoesRes.map((exp: { id: number; nome: string; data_inicio: string; data_fim: string; equipe_id: number; Localizacao_id: number; Ruina_id: number; status: string }) => ({
                ...exp,
                equipe: equipesComPessoas.find((e: { id: number }) => e.id === exp.equipe_id) || { id: 0, nome: "-", pessoas: [] },
                localizacao: localizacoes.find((l: { id: number }) => l.id === exp.Localizacao_id) || { pais: "-" },
                ruina: ruinas.find((r: { id: number }) => r.id === exp.Ruina_id) || { 
                    nome: "-", 
                    descricao: "-",
                    latitude: 0,
                    longitude: 0
                },
            }));
            setExpedicoes(expeds);
            setLoading(false);
        }
        fetchData();
    }, []);
    
    // Obter valores únicos para os filtros
    const statusOptions = useMemo(() => {
        const statuses = [...new Set(expedicoes.map(e => e.status))];
        return statuses.sort();
    }, [expedicoes]);
    
    const paisOptions = useMemo(() => {
        const paises = [...new Set(expedicoes.map(e => e.localizacao.pais))];
        return paises.sort();
    }, [expedicoes]);
    
    const equipeOptions = useMemo(() => {
        const equipes = [...new Set(expedicoes.map(e => e.equipe.nome))];
        return equipes.sort();
    }, [expedicoes]);
    
    // Aplicar filtros
    const filteredExpedicoes = useMemo(() => {
        return expedicoes.filter(expedicao => {
            const matchesSearch = searchTerm === "" || 
                expedicao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expedicao.ruina.nome.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === "all" || expedicao.status === statusFilter;
            const matchesPais = paisFilter === "all" || expedicao.localizacao.pais === paisFilter;
            const matchesEquipe = equipeFilter === "all" || expedicao.equipe.nome === equipeFilter;
            
            // Filtros de data
            const expedicaoInicio = new Date(expedicao.data_inicio);
            const expedicaoFim = new Date(expedicao.data_fim);
            
            const matchesDateRange = !dateRange?.from || !dateRange?.to || 
                (expedicaoInicio >= dateRange.from && expedicaoFim <= dateRange.to);
            
            return matchesSearch && matchesStatus && matchesPais && matchesEquipe && matchesDateRange;
        });
    }, [expedicoes, searchTerm, statusFilter, paisFilter, equipeFilter, dateRange]);
    
    // Calcular estatísticas
    const estatisticas = useMemo(() => {
        const totalExpedicoes = expedicoes.length;
        const emAndamento = expedicoes.filter(e => e.status === "Em andamento").length;
        const concluidas = expedicoes.filter(e => e.status === "Concluída").length;
        const emPlanejamento = expedicoes.filter(e => e.status === "Em planejamento").length;
        const canceladas = expedicoes.filter(e => e.status === "Cancelada").length;
        
        return {
            totalExpedicoes,
            emAndamento,
            concluidas,
            emPlanejamento,
            canceladas
        };
    }, [expedicoes]);
    
    // Recalcular total de páginas quando rowsPerPage mudar
    const totalPages = Math.ceil(filteredExpedicoes.length / rowsPerPage);
    
    // Resetar para primeira página quando mudar filtros ou rowsPerPage
    React.useEffect(() => {
        setPage(1);
    }, [rowsPerPage, searchTerm, statusFilter, paisFilter, equipeFilter, dateRange]);

    const paginated = filteredExpedicoes.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // Extrair todas as URLs de avatars para pré-carregamento
    const avatarUrls = useMemo(() => {
        const urls: string[] = [];
        expedicoes.forEach(expedicao => {
            expedicao.equipe?.pessoas?.forEach(pessoa => {
                if (pessoa.avatar) {
                    urls.push(pessoa.avatar);
                }
            });
        });
        return [...new Set(urls)]; // Remove duplicatas
    }, [expedicoes]);

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="flex flex-col gap-4 md:gap-4">
            {/* Pré-carregamento de imagens */}
            <ImagePreloader images={avatarUrls} priority={false} />
            
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-foreground">Todas as expedições arqueológicas</h1>
                <Button 
                    onClick={() => router.push('/expedition/new')}
                    className="flex items-center gap-2"
                >
                    <MapPinIcon className="h-4 w-4" />
                    Nova Expedição
                </Button>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Total de Expedições
                        <UsersIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.totalExpedicoes}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        todas as expedições
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Em Andamento
                        <ClockIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.emAndamento}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        expedições ativas
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Concluídas
                        <CheckCircleIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.concluidas}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        expedições finalizadas
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Em Planejamento
                        <ClockIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.emPlanejamento}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        expedições planejadas
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Canceladas
                        <AlertTriangleIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.canceladas}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        expedições canceladas
                    </div>
                </Card>
            </div>

            {/* Card com Filtros e Tabela */}
            <Card className="p-4 gap-2">
                <div className="space-y-4">
                    {/* Filtros */}
                    <div className="flex items-center space-x-2">
                        <FilterIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Filtros:</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <Input
                            placeholder="Buscar expedições..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Popover open={openPais} onOpenChange={setOpenPais}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-48 justify-start text-left font-normal"
                                >
                                    <ChevronsUpDownIcon className="mr-2 h-4 w-4" />
                                    {paisFilter === "all" ? "Todos os países" : paisFilter}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar país..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => {
                                                    setPaisFilter("all");
                                                    setOpenPais(false);
                                                }}
                                            >
                                                Todos os países
                                            </CommandItem>
                                            {paisOptions.map((pais) => (
                                                <CommandItem
                                                    key={pais}
                                                    onSelect={() => {
                                                        setPaisFilter(pais);
                                                        setOpenPais(false);
                                                    }}
                                                >
                                                    {pais}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        
                        <Popover open={openEquipe} onOpenChange={setOpenEquipe}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-48 justify-start text-left font-normal"
                                >
                                    <ChevronsUpDownIcon className="mr-2 h-4 w-4" />
                                    {equipeFilter === "all" ? "Todas as equipes" : equipeFilter}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar equipe..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhuma equipe encontrada.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => {
                                                    setEquipeFilter("all");
                                                    setOpenEquipe(false);
                                                }}
                                            >
                                                Todas as equipes
                                            </CommandItem>
                                            {equipeOptions.map((equipe) => (
                                                <CommandItem
                                                    key={equipe}
                                                    onSelect={() => {
                                                        setEquipeFilter(equipe);
                                                        setOpenEquipe(false);
                                                    }}
                                                >
                                                    {equipe}
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
                        
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setPaisFilter("all");
                                setEquipeFilter("all");
                                setDateRange(undefined);
                            }}
                        >
                            Limpar filtros
                        </Button>
                    </div>
                    
                    {filteredExpedicoes.length !== expedicoes.length && (
                        <div className="text-sm text-muted-foreground">
                            Mostrando {filteredExpedicoes.length} de {expedicoes.length} expedições
                        </div>
                    )}

                    {filteredExpedicoes.length === 0 && !loading && (
                        <div className="text-center text-muted-foreground py-8">
                            Nenhuma expedição encontrada
                        </div>
                    )}
                    
                    {/* Tabela */}
                    <div className="border border-border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="">
                                <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Ruína</TableHead>
                                    <TableHead>País</TableHead>
                                    <TableHead>Equipe</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Início</TableHead>
                                    <TableHead>Fim/Progresso</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.map((expedicao) => (
                                    <TableRow key={expedicao.id}>
                                        <TableCell></TableCell>
                                        <TableCell>{expedicao.nome}</TableCell>
                                        <TableCell>{expedicao.ruina.nome}</TableCell>
                                        <TableCell>{expedicao.localizacao.pais}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium">{expedicao.equipe.nome}</span>
                                                <TeamAvatars pessoas={expedicao.equipe.pessoas || []} size="sm" maxVisible={3} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusToVariant(expedicao.status)}>
                                                {statusIcon(expedicao.status)}
                                                {expedicao.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(expedicao.data_inicio).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {expedicao.status === "Concluída" || expedicao.status === "Cancelada" ? (
                                                new Date(expedicao.data_fim).toLocaleDateString()
                                            ) : (
                                                <ProgressBar progress={calculateProgress(expedicao.data_inicio, expedicao.data_fim)} />
                                            )}
                                        </TableCell>
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
                                                            setSelectedExpedicao(expedicao);
                                                            setDetailsModalOpen(true);
                                                        }}
                                                    >
                                                        Visualizar detalhes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => router.push(`/expedition/edit/${expedicao.id}`)}
                                                    >
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>Duplicar</DropdownMenuItem>
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
                                    Showing {filteredExpedicoes.length > 0 ? ((page - 1) * rowsPerPage) + 1 : 0} to {Math.min(page * rowsPerPage, filteredExpedicoes.length)} of {filteredExpedicoes.length} results
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
            
            {/* ExpeditionDetailsModal */}
            {selectedExpedicao && (
                <ExpeditionDetailsModal 
                    expedicao={selectedExpedicao}
                    open={detailsModalOpen}
                    onOpenChange={setDetailsModalOpen}
                />
            )}
        </div>
    );
}