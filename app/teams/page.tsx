"use client";

import { useState, useEffect, useMemo } from "react";
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
    EyeIcon, 
    PlusIcon, 
    CalendarIcon, 
    MapPinIcon, 
    UsersIcon, 
    MoreVertical,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    ChevronsUpDownIcon,
    UserCheckIcon,
    TrendingUpIcon,
    AwardIcon,
    EditIcon,
    TrashIcon,
    InfoIcon,
    ShovelIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApiService } from "@/lib/api";
import { PageSkeleton } from "@/components/page-skeleton";
import { ImagePreloader } from "@/components/image-preloader";
import { TeamAvatars } from "@/components/team-avatars";

// Interfaces
interface Equipe {
    id: number;
    nome: string;
    lider_id: number;
}

interface EquipeComDetalhes extends Equipe {
    pessoas?: Array<{
        id: number;
        nome: string;
        avatar?: string;
        especialidade?: string;
        email?: string;
        telefone?: string;
        data_nascimento: string;
        isLider?: boolean;
    }>;
    expedicoes?: Array<{
        id: number;
        nome: string;
        status: string;
        data_inicio: string;
        data_fim: string;
    }>;
    lider?: {
        id: number;
        nome: string;
        especialidade?: string;
        avatar?: string;
    };
}

// Componentes auxiliares
function StatusExpedicaoBadge({ status }: { status: string }) {
    const getColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "em andamento": return "bg-blue-500";
            case "concluída": return "bg-green-500";
            case "em planejamento": return "bg-yellow-500";
            case "cancelada": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <Badge variant="outline">
            <div className={`w-2 h-2 rounded-full mr-2 ${getColor(status)}`} />
            {status}
        </Badge>
    );
}

function calcularIdade(dataNascimento: string): number {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
        return idade - 1;
    }
    
    return idade;
}

function formatarData(dataString: string) {
    return format(new Date(dataString), "dd/MM/yyyy", { locale: ptBR });
}

function formatarPeriodoData(dateRange: DateRange | undefined) {
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
}

export default function TeamsPage() {
    const router = useRouter();
    const [equipes, setEquipes] = useState<EquipeComDetalhes[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedEquipe, setSelectedEquipe] = useState<EquipeComDetalhes | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    
    // Estados para os popovers dos filtros
    const [openEspecialidade, setOpenEspecialidade] = useState(false);
    const [openStatus, setOpenStatus] = useState(false);
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [especialidadeFilter, setEspecialidadeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [tamanhoEquipeFilter, setTamanhoEquipeFilter] = useState<string>("all");

    // Carregar dados
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [equipesData, pessoas, especialidades, expedicoes, equipeHasPessoa] = await Promise.all([
                    ApiService.getEquipes(),
                    ApiService.getPessoas(),
                    ApiService.getEspecialidades(),
                    ApiService.getExpedicoes(),
                    ApiService.getEquipeHasPessoa(),
                ]);

                const equipesComDetalhes = equipesData.map(equipe => {
                    // Relacionar pessoas com a equipe
                    const pessoasEquipe = pessoas.filter(pessoa => 
                        equipeHasPessoa.some(rel => rel.Equipe_id === equipe.id && rel.Pessoa_id === pessoa.id)
                    ).map(pessoa => ({
                        ...pessoa,
                        especialidade: especialidades.find(esp => esp.id === pessoa.especialidade_id)?.titulo,
                        isLider: pessoa.id === equipe.lider_id
                    }));

                    // Relacionar expedições com a equipe
                    const expedicoesEquipe = expedicoes.filter(exp => exp.equipe_id === equipe.id);

                    // Encontrar o líder
                    const lider = pessoasEquipe.find(p => p.id === equipe.lider_id);

                    return {
                        ...equipe,
                        pessoas: pessoasEquipe,
                        expedicoes: expedicoesEquipe,
                        lider
                    };
                });

                setEquipes(equipesComDetalhes);
            } catch (error) {
                console.error('Erro ao carregar equipes:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Obter valores únicos para os filtros
    const especialidadeOptions = useMemo(() => {
        const especialidades = [...new Set(
            equipes.flatMap(e => e.pessoas?.map(p => p.especialidade).filter(Boolean) || [])
        )];
        return especialidades.sort();
    }, [equipes]);

    const statusOptions = useMemo(() => {
        const statuses = [...new Set(
            equipes.flatMap(e => e.expedicoes?.map(exp => exp.status).filter(Boolean) || [])
        )];
        return statuses.sort();
    }, [equipes]);

    // Aplicar filtros
    const filteredEquipes = useMemo(() => {
        return equipes.filter(equipe => {
            const matchesSearch = searchTerm === "" || 
                equipe.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipe.lider?.nome.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesEspecialidade = especialidadeFilter === "all" || 
                equipe.pessoas?.some(p => p.especialidade === especialidadeFilter);
            
            const matchesStatus = statusFilter === "all" || 
                equipe.expedicoes?.some(exp => exp.status === statusFilter);
            
            // Filtro de tamanho da equipe
            const tamanhoEquipe = equipe.pessoas?.length || 0;
            const matchesTamanho = tamanhoEquipeFilter === "all" || 
                (tamanhoEquipeFilter === "pequena" && tamanhoEquipe <= 3) ||
                (tamanhoEquipeFilter === "media" && tamanhoEquipe > 3 && tamanhoEquipe <= 6) ||
                (tamanhoEquipeFilter === "grande" && tamanhoEquipe > 6);
            
            // Filtros de data (baseado nas expedições)
            const matchesDateRange = !dateRange?.from || !dateRange?.to || 
                equipe.expedicoes?.some(exp => {
                    const expInicio = new Date(exp.data_inicio);
                    const expFim = new Date(exp.data_fim);
                    return expInicio >= dateRange!.from! && expFim <= dateRange!.to!;
                });
            
            return matchesSearch && matchesEspecialidade && matchesStatus && matchesTamanho && matchesDateRange;
        });
    }, [equipes, searchTerm, especialidadeFilter, statusFilter, tamanhoEquipeFilter, dateRange]);

    // Calcular estatísticas
    const estatisticas = useMemo(() => {
        const totalEquipes = equipes.length;
        const totalPessoas = equipes.reduce((acc, equipe) => acc + (equipe.pessoas?.length || 0), 0);
        const equipesAtivas = equipes.filter(e => 
            e.expedicoes?.some(exp => exp.status.toLowerCase().includes('andamento'))
        ).length;
        const expedicoesAtivas = equipes.reduce((acc, equipe) => 
            acc + (equipe.expedicoes?.filter(exp => exp.status.toLowerCase().includes('andamento')).length || 0), 0
        );
        const mediaIdade = equipes.reduce((acc, equipe) => {
            const idades = equipe.pessoas?.map(p => calcularIdade(p.data_nascimento)) || [];
            return acc + idades.reduce((sum, idade) => sum + idade, 0);
        }, 0) / Math.max(totalPessoas, 1);
        
        return {
            totalEquipes,
            totalPessoas,
            equipesAtivas,
            expedicoesAtivas,
            mediaIdade: Math.round(mediaIdade)
        };
    }, [equipes]);

    // Paginação
    const totalPages = Math.ceil(filteredEquipes.length / rowsPerPage);
    const paginated = filteredEquipes.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // Extrair todas as URLs de avatars para pré-carregamento
    const avatarUrls = useMemo(() => {
        const urls: string[] = [];
        equipes.forEach(equipe => {
            equipe.pessoas?.forEach(pessoa => {
                if (pessoa.avatar) {
                    urls.push(pessoa.avatar);
                }
            });
        });
        return [...new Set(urls)];
    }, [equipes]);

    // Resetar para primeira página quando mudar filtros
    useEffect(() => {
        setPage(1);
    }, [searchTerm, especialidadeFilter, statusFilter, tamanhoEquipeFilter, dateRange]);

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="flex flex-col gap-4 md:gap-4">
            {/* Pré-carregamento de imagens */}
            <ImagePreloader images={avatarUrls} priority={false} />
            
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-foreground">Todas as equipes arqueológicas</h1>
                <Button 
                    onClick={() => router.push('/teams/new')}
                    className="flex items-center gap-2"
                >
                    <PlusIcon className="h-4 w-4" />
                    Nova Equipe
                </Button>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Total de Equipes
                        <UsersIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.totalEquipes}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        equipes cadastradas
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Total de Membros
                        <UserCheckIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.totalPessoas}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        membros ativos
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Equipes Ativas
                        <TrendingUpIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.equipesAtivas}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        em expedições ativas
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Expedições Ativas
                        <MapPinIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.expedicoesAtivas}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        expedições em andamento
                    </div>
                </Card>
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Idade Média
                        <AwardIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.mediaIdade} anos
                    </div>
                    <div className="text-xs text-muted-foreground">
                        idade média dos membros
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
                                setEspecialidadeFilter("all");
                                setStatusFilter("all");
                                setTamanhoEquipeFilter("all");
                                setDateRange(undefined);
                            }}
                        >
                            Limpar filtros
                        </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 max-w-xl">
                            <Input
                                placeholder="Buscar por nome da equipe ou líder..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <Popover open={openEspecialidade} onOpenChange={setOpenEspecialidade}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-48 justify-start text-left font-normal"
                                >
                                    <ChevronsUpDownIcon className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">
                                        {especialidadeFilter === "all" ? "Todas as especialidades" : especialidadeFilter}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar especialidade..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhuma especialidade encontrada.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => {
                                                    setEspecialidadeFilter("all");
                                                    setOpenEspecialidade(false);
                                                }}
                                            >
                                                Todas as especialidades
                                            </CommandItem>
                                            {especialidadeOptions.map(especialidade => (
                                                <CommandItem
                                                    key={especialidade}
                                                    onSelect={() => {
                                                        setEspecialidadeFilter(especialidade || "");
                                                        setOpenEspecialidade(false);
                                                    }}
                                                >
                                                    {especialidade}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <Popover open={openStatus} onOpenChange={setOpenStatus}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-48 justify-start text-left font-normal"
                                >
                                    <ChevronsUpDownIcon className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">
                                        {statusFilter === "all" ? "Todos os status" : statusFilter}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar status..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => {
                                                    setStatusFilter("all");
                                                    setOpenStatus(false);
                                                }}
                                            >
                                                Todos os status
                                            </CommandItem>
                                            {statusOptions.map(status => (
                                                <CommandItem
                                                    key={status}
                                                    onSelect={() => {
                                                        setStatusFilter(status);
                                                        setOpenStatus(false);
                                                    }}
                                                >
                                                    {status}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <Select value={tamanhoEquipeFilter} onValueChange={setTamanhoEquipeFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Tamanho" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os tamanhos</SelectItem>
                                <SelectItem value="pequena">Pequena (≤3)</SelectItem>
                                <SelectItem value="media">Média (4-6)</SelectItem>
                                <SelectItem value="grande">Grande (&gt;6)</SelectItem>
                            </SelectContent>
                        </Select>

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
                    </div>

                    {filteredEquipes.length === 0 && !loading && (
                        <div className="text-center text-muted-foreground py-8">
                            Nenhuma equipe encontrada
                        </div>
                    )}

                    {/* Tabela */}
                    <div className="border border-border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead>Equipe</TableHead>
                                    <TableHead>Líder</TableHead>
                                    <TableHead>Membros</TableHead>
                                    <TableHead>Especialidades</TableHead>
                                    <TableHead>Expedições Ativas</TableHead>
                                    <TableHead>Última Atividade</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.map((equipe) => (
                                    <TableRow key={equipe.id}>
                                        <TableCell></TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">{equipe.nome}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {equipe.pessoas?.length || 0} membros
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={equipe.lider?.avatar} />
                                                    <AvatarFallback>
                                                        {equipe.lider?.nome?.charAt(0) || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{equipe.lider?.nome || "Não definido"}</span>
                                                    <span className="text-xs text-muted-foreground">{equipe.lider?.especialidade}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <TeamAvatars pessoas={equipe.pessoas || []} size="sm" maxVisible={4} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {[...new Set(equipe.pessoas?.map(p => p.especialidade).filter(Boolean))].slice(0, 3).map((esp, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {esp}
                                                    </Badge>
                                                ))}
                                                {equipe.pessoas && [...new Set(equipe.pessoas.map(p => p.especialidade).filter(Boolean))].length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{[...new Set(equipe.pessoas.map(p => p.especialidade).filter(Boolean))].length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {equipe.expedicoes?.filter(exp => exp.status.toLowerCase().includes('andamento')).length || 0}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    expedições ativas
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {equipe.expedicoes && equipe.expedicoes.length > 0 ? (
                                                <span className="text-sm text-muted-foreground">
                                                    {formatarData(equipe.expedicoes[equipe.expedicoes.length - 1].data_inicio)}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Nenhuma expedição</span>
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
                                                            setSelectedEquipe(equipe);
                                                            setDetailsModalOpen(true);
                                                        }}
                                                    >
                                                        <EyeIcon className="mr-2 h-4 w-4" />
                                                        Ver detalhes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => router.push(`/teams/edit/${equipe.id}`)}
                                                    >
                                                        <EditIcon className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">
                                                        <TrashIcon className="mr-2 h-4 w-4" />
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
                                    Showing {filteredEquipes.length > 0 ? ((page - 1) * rowsPerPage) + 1 : 0} to {Math.min(page * rowsPerPage, filteredEquipes.length)} of {filteredEquipes.length} results
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

            {/* Modal de detalhes da equipe */}
            <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
                <DialogContent 
                    className="w-[95vw] max-w-[1400px] min-w-[1200px] max-h-[95vh] overflow-y-auto"
                    style={{ 
                        width: '95vw !important', 
                        maxWidth: '1400px !important',
                        minWidth: '1200px !important'
                    }}
                >
                                    <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        Detalhes da Equipe
                    </DialogTitle>
                </DialogHeader>
                
                                {selectedEquipe && (
                    <div className="flex flex-col gap-4 md:gap-4">
                        
                        {/* Cards de Estatísticas - Padrão da Home */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <Card className="p-4 gap-2">
                                <div className="text-sm text-muted-foreground flex justify-between">
                                    Total de Membros
                                    <UsersIcon />
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                    {selectedEquipe.pessoas?.length || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    membros da equipe
                                </div>
                            </Card>

                            <Card className="p-4 gap-2">
                                <div className="text-sm text-muted-foreground flex justify-between">
                                    Expedições Ativas
                                    <MapPinIcon />
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                    {selectedEquipe.expedicoes?.filter(exp => exp.status.toLowerCase().includes('andamento')).length || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    expedições em andamento
                                </div>
                            </Card>

                            <Card className="p-4 gap-2">
                                <div className="text-sm text-muted-foreground flex justify-between">
                                    Especialidades
                                    <AwardIcon />
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                    {[...new Set(selectedEquipe.pessoas?.map(p => p.especialidade).filter(Boolean) || [])].length}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    especialidades únicas
                                </div>
                            </Card>

                            <Card className="p-4 gap-2">
                                <div className="text-sm text-muted-foreground flex justify-between">
                                    Total de Expedições
                                    <CalendarIcon />
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                    {selectedEquipe.expedicoes?.length || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    expedições realizadas
                                </div>
                            </Card>
                        </div>

                        {/* Informações Principais */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">
                                    {selectedEquipe.nome}
                                </h3>
                                <Badge variant="outline" className="gap-1">
                                    <UsersIcon className="w-4 h-4" />
                                    Equipe Arqueológica
                                </Badge>
                            </div>
                            
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                    <InfoIcon className="w-4 h-4" />
                                    Informações da Equipe
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nome da Equipe</p>
                                        <p className="text-sm font-medium">{selectedEquipe.nome}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Líder</p>
                                        <p className="text-sm font-medium">{selectedEquipe.lider?.nome || "Não definido"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">ID da Equipe</p>
                                        <p className="text-sm font-medium">#{selectedEquipe.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Idade Média</p>
                                        <p className="text-sm font-medium">
                                            {Math.round(selectedEquipe.pessoas?.reduce((acc, p) => acc + calcularIdade(p.data_nascimento), 0) / Math.max(selectedEquipe.pessoas?.length || 1, 1))} anos
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabela de Membros */}
                        <Card className="p-4 w-full overflow-x-auto">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Membros da Equipe</h3>
                            
                            {selectedEquipe.pessoas && selectedEquipe.pessoas.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16">Foto</TableHead>
                                                <TableHead className="min-w-[200px]">Nome</TableHead>
                                                <TableHead className="min-w-[150px]">Especialidade</TableHead>
                                                <TableHead className="min-w-[200px]">Email</TableHead>
                                                <TableHead className="min-w-[150px]">Telefone</TableHead>
                                                <TableHead className="min-w-[100px]">Função</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedEquipe.pessoas.map((pessoa) => (
                                                <TableRow key={pessoa.id} className={pessoa.isLider ? "bg-muted/50" : ""}>
                                                    <TableCell>
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={pessoa.avatar} />
                                                            <AvatarFallback>{pessoa.nome.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{pessoa.nome}</span>
                                                            {pessoa.isLider && (
                                                                <Badge variant="default" className="text-xs">
                                                                    Líder
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{pessoa.especialidade}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">{pessoa.email}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">{pessoa.telefone}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">
                                                            {calcularIdade(pessoa.data_nascimento)} anos
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Nenhum membro da equipe encontrado</p>
                                </div>
                            )}
                        </Card>

                        {/* Expedições da Equipe */}
                        {selectedEquipe.expedicoes && selectedEquipe.expedicoes.length > 0 && (
                            <Card className="p-4">
                                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                                    <ShovelIcon className="w-4 h-4" />
                                    Expedições da Equipe
                                </h4>
                                <div className="space-y-3">
                                    {selectedEquipe.expedicoes.map((expedicao) => (
                                        <div key={expedicao.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <h5 className="text-lg font-semibold text-foreground">
                                                    {expedicao.nome}
                                                </h5>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatarData(expedicao.data_inicio)} - {formatarData(expedicao.data_fim)}
                                                </p>
                                            </div>
                                            <StatusExpedicaoBadge status={expedicao.status} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Informações Adicionais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Especialidades da Equipe
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {[...new Set(selectedEquipe.pessoas?.map(p => p.especialidade).filter(Boolean))].map((especialidade, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {especialidade}
                                        </Badge>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-4">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Estatísticas
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Membros:</span>
                                        <span className="font-medium">{selectedEquipe.pessoas?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Expedições Ativas:</span>
                                        <span className="font-medium">
                                            {selectedEquipe.expedicoes?.filter(exp => exp.status.toLowerCase().includes('andamento')).length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Idade Média:</span>
                                        <span className="font-medium">
                                            {Math.round(selectedEquipe.pessoas?.reduce((acc, p) => acc + calcularIdade(p.data_nascimento), 0) / Math.max(selectedEquipe.pessoas?.length || 1, 1))} anos
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
                </DialogContent>
            </Dialog>
        </div>
    );
}