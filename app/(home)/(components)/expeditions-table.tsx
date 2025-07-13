"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ApiService } from "@/lib/api"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { type DateRange } from "react-day-picker"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { TeamAvatars } from "@/components/team-avatars"
import { ExpeditionDetailsModal } from "@/components/expedition-details-modal"
import { ImagePreloader } from "@/components/image-preloader"
import { 
  Loader2Icon, 
  ClockIcon, 
  XIcon, 
  CalendarIcon, 
  MoreVertical, 
  ChevronsLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight, 
  ChevronsUpDownIcon, 
  CheckIcon 
} from "lucide-react"

interface Expedicao {
  id: number
  nome: string
  data_inicio: string
  data_fim: string
  equipe_id: number
  Localizacao_id: number
  Ruina_id: number
  status: string
}

interface ExpedicaoComDetalhes extends Expedicao {
  equipe?: {
    id: number
    nome: string
    pessoas?: Array<{
      id: number
      nome: string
      avatar?: string
    }>
  }
  localizacao?: {
    id: number
    pais: string
  }
  ruina?: {
    id: number
    nome: string
    descricao?: string
    latitude?: number
    longitude?: number
  }
  status: string
}

function statusToVariant(status: string): "outline" | "default" | "destructive" | "secondary" {
  if (status === "Concluída") return "outline";
  if (status === "Em planejamento") return "outline";
  if (status === "Em andamento") return "outline";
  if (status === "Cancelada") return "outline";
  return "outline";
}

function statusIcon(status: string) {
  if (status === "Concluída") return <div className="bg-green-500 p-0.5 rounded-full"><CheckIcon className="w-2 h-2 text-white" /></div>;
  if (status === "Em andamento") return <Loader2Icon className="w-3 h-3 animate-spin" />;
  if (status === "Em planejamento") return <ClockIcon className="w-3 h-3" />;
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

// Função para converter ExpedicaoComDetalhes para o tipo esperado pelo modal
function convertToModalExpedicao(expedicao: ExpedicaoComDetalhes) {
  return {
    id: expedicao.id,
    nome: expedicao.nome,
    data_inicio: expedicao.data_inicio,
    data_fim: expedicao.data_fim,
    status: expedicao.status,
    ruina: {
      nome: expedicao.ruina?.nome || "Não informado",
      descricao: expedicao.ruina?.descricao || "Descrição não disponível",
      latitude: expedicao.ruina?.latitude || 0,
      longitude: expedicao.ruina?.longitude || 0,
    },
    localizacao: {
      pais: expedicao.localizacao?.pais || "Não informado",
      estado: undefined,
      cidade: undefined,
    },
    equipe: {
      id: expedicao.equipe?.id || 0,
      nome: expedicao.equipe?.nome || "Não informado",
      pessoas: expedicao.equipe?.pessoas || [],
    },
    descricao: undefined,
    orcamento: undefined,
    prioridade: undefined,
    lider_id: undefined,
  };
}

export function ExpeditionsTable() {
  const router = useRouter()
  const [expedicoes, setExpedicoes] = useState<ExpedicaoComDetalhes[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  
  // Estados para o modal de detalhes
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedExpedicao, setSelectedExpedicao] = useState<ExpedicaoComDetalhes | null>(null)
  
  // Estados para os popovers dos filtros
  const [openPais, setOpenPais] = useState(false)
  const [openEquipe, setOpenEquipe] = useState(false)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paisFilter, setPaisFilter] = useState<string>("all")
  const [equipeFilter, setEquipeFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  useEffect(() => {
    const fetchExpedicoes = async () => {
      try {
        const [expedicoesData, equipes, localizacoes, ruinas, pessoas, equipeHasPessoa] = await Promise.all([
          ApiService.getExpedicoes(),
          ApiService.getEquipes(),
          ApiService.getLocalizacoes(),
          ApiService.getRuinas(),
          ApiService.getPessoas(),
          ApiService.getEquipeHasPessoa(),
        ]);

        // Relacionar pessoas com equipes usando a tabela de relacionamento
        const equipesComPessoas = equipes.map((equipe: { id: number; nome: string; lider_id: number }) => ({
          ...equipe,
          pessoas: pessoas.filter((pessoa: { id: number; nome: string; avatar?: string }) => 
            equipeHasPessoa.some((rel: { Equipe_id: number; Pessoa_id: number }) => rel.Equipe_id === equipe.id && rel.Pessoa_id === pessoa.id)
          )
        }));

        const expedicoesComDetalhes = expedicoesData.map((expedicao: { id: number; nome: string; data_inicio: string; data_fim: string; equipe_id: number; Localizacao_id: number; Ruina_id: number; status: string }) => {
          const equipe = equipesComPessoas.find((e: { id: number }) => e.id === expedicao.equipe_id)
          const localizacao = localizacoes.find((l: { id: number }) => l.id === expedicao.Localizacao_id)
          const ruina = ruinas.find((r: { id: number }) => r.id === expedicao.Ruina_id)

          return {
            ...expedicao,
            equipe,
            localizacao,
            ruina
          }
        })

        // Filtrar apenas expedições em andamento (aceita ambas as variações)
        const expedicoesAtivas = expedicoesComDetalhes.filter((expedicao: { status: string }) => 
          expedicao.status === "Em Andamento" || expedicao.status === "Em andamento"
        )

        setExpedicoes(expedicoesAtivas)
      } catch (error) {
        console.error('Erro ao carregar expedições:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpedicoes()
  }, [])

  // Obter valores únicos para os filtros
  const statusOptions = useMemo(() => {
    const statuses = [...new Set(expedicoes.map(e => e.status))]
    return statuses.sort()
  }, [expedicoes])
  
  const paisOptions = useMemo(() => {
    const paises = [...new Set(expedicoes.map(e => e.localizacao?.pais).filter((pais): pais is string => Boolean(pais)))]
    return paises.sort()
  }, [expedicoes])
  
  const equipeOptions = useMemo(() => {
    const equipes = [...new Set(expedicoes.map(e => e.equipe?.nome).filter((equipe): equipe is string => Boolean(equipe)))]
    return equipes.sort()
  }, [expedicoes])
  
  // Aplicar filtros
  const filteredExpedicoes = useMemo(() => {
    return expedicoes.filter(expedicao => {
      const matchesSearch = searchTerm === "" || 
        expedicao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expedicao.ruina?.nome.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || expedicao.status === statusFilter
      const matchesPais = paisFilter === "all" || expedicao.localizacao?.pais === paisFilter
      const matchesEquipe = equipeFilter === "all" || expedicao.equipe?.nome === equipeFilter
      
      // Filtros de data
      const expedicaoInicio = new Date(expedicao.data_inicio)
      const expedicaoFim = new Date(expedicao.data_fim)
      
      const matchesDateRange = !dateRange?.from || !dateRange?.to || 
        (expedicaoInicio >= dateRange.from && expedicaoFim <= dateRange.to)
      
      return matchesSearch && matchesStatus && matchesPais && matchesEquipe && matchesDateRange
    })
  }, [expedicoes, searchTerm, statusFilter, paisFilter, equipeFilter, dateRange])
  
  // Recalcular total de páginas quando rowsPerPage mudar
  const totalPages = Math.ceil(filteredExpedicoes.length / rowsPerPage)
  
  // Resetar para primeira página quando mudar filtros ou rowsPerPage
  useEffect(() => {
    setPage(1)
  }, [rowsPerPage, searchTerm, statusFilter, paisFilter, equipeFilter, dateRange])

  const paginated = filteredExpedicoes.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString)
      return format(data, 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
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
    return (
      <div className="space-y-4">
        {/* Skeleton para os filtros */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Skeleton para a tabela */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Pré-carregamento de imagens */}
      <ImagePreloader images={avatarUrls} priority={false} />
      
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
                      setPaisFilter("all")
                      setOpenPais(false)
                    }}
                  >
                    Todos os países
                  </CommandItem>
                  {paisOptions.map((pais) => (
                    <CommandItem
                      key={pais}
                      onSelect={() => {
                        setPaisFilter(pais)
                        setOpenPais(false)
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
                      setEquipeFilter("all")
                      setOpenEquipe(false)
                    }}
                  >
                    Todas as equipes
                  </CommandItem>
                  {equipeOptions.map((equipe) => (
                    <CommandItem
                      key={equipe}
                      onSelect={() => {
                        setEquipeFilter(equipe)
                        setOpenEquipe(false)
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
            setSearchTerm("")
            setStatusFilter("all")
            setPaisFilter("all")
            setEquipeFilter("all")
            setDateRange(undefined)
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
      
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Ruína</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim/Progresso</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((expedicao) => (
              <TableRow key={expedicao.id}>
                <TableCell></TableCell>
                <TableCell className="font-medium max-w-[180px] truncate">
                  {expedicao.nome.length > 30 ? `${expedicao.nome.slice(0, 30)}...` : expedicao.nome}
                </TableCell>
                <TableCell>{expedicao.ruina?.nome}</TableCell>
                <TableCell>{expedicao.localizacao?.pais}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{expedicao.equipe?.nome}</span>
                    <TeamAvatars pessoas={expedicao.equipe?.pessoas || []} size="sm" maxVisible={3} />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusToVariant(expedicao.status)}>
                    {statusIcon(expedicao.status)}
                    {expedicao.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatarData(expedicao.data_inicio)}</TableCell>
                <TableCell>
                  {expedicao.status === "Concluída" || expedicao.status === "Cancelada" ? (
                    formatarData(expedicao.data_fim)
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
                        <DropdownMenuContent align="end" className="">
                            <DropdownMenuItem 
                                className=""
                                onClick={() => {
                                    setSelectedExpedicao(expedicao);
                                    setDetailsModalOpen(true);
                                }}
                            >
                                Visualizar detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className=""
                                onClick={() => router.push(`/expedition/edit/${expedicao.id}`)}
                            >
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="">Duplicar</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400">
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
      
      {filteredExpedicoes.length === 0 && (
        <div className="text-center text-muted-foreground">
          Nenhuma expedição encontrada
        </div>
      )}

      {/* Modal de Detalhes da Expedição */}
      <ExpeditionDetailsModal 
        expedicao={selectedExpedicao ? convertToModalExpedicao(selectedExpedicao) : null}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </div>
  )
} 