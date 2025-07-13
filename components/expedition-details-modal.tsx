"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  UsersIcon, 
  CalendarIcon, 
  MapPinIcon, 
  TargetIcon,
  CheckCircleIcon,
  ClockIcon,
  XIcon,
  InfoIcon
} from "lucide-react"
import RuinLocationMap from "./ruin-location-map";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
            especialidade_id?: number;
            especialidade?: string;
            email?: string;
            telefone?: string;
            isLider?: boolean;
        }>;
    };
    status: string;
    descricao?: string;
    orcamento?: number;
    prioridade?: string;
    lider_id?: number;
}

function statusIcon(status: string) {
    if (status === "Concluída") return <div className="bg-green-500 p-0.5 rounded-full"><CheckCircleIcon className="w-2 h-2 text-white" /></div>;
    if (status === "Em andamento") return <ClockIcon className="w-3 h-3 animate-spin" />;
    if (status === "Em planejamento") return <ClockIcon className="w-3 h-3" />;
    if (status === "Cancelada") return <div className="bg-red-500 p-0.5 rounded-full"><XIcon className="w-2 h-2 text-white" /></div>;
    return null;
}

function calculateProgress(dataInicio: string, dataFim: string): number {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const hoje = new Date();
    
    if (hoje < inicio) return 0;
    if (hoje > fim) return 100;
    
    const duracaoTotal = fim.getTime() - inicio.getTime();
    const tempoDecorrido = hoje.getTime() - inicio.getTime();
    
    return Math.round((tempoDecorrido / duracaoTotal) * 100);
}

function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-32 h-3 bg-muted rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
                {progress}%
            </span>
        </div>
    );
}

function formatarData(dataString: string) {
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return 'Data inválida';
    }
}

function formatarValor(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function calcularDuracao(dataInicio: string, dataFim: string): string {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 dia';
    if (diffDays < 30) return `${diffDays} dias`;
    if (diffDays < 365) {
        const meses = Math.floor(diffDays / 30);
        return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }
    const anos = Math.floor(diffDays / 365);
    return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
}

interface ExpeditionDetailsModalProps {
    expedicao: Expedicao | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExpeditionDetailsModal({ expedicao, open, onOpenChange }: ExpeditionDetailsModalProps) {
    if (!expedicao) return null;

    const progress = calculateProgress(expedicao.data_inicio, expedicao.data_fim);
    const isActive = expedicao.status === "Em andamento" || expedicao.status === "Em planejamento";
    const duracao = calcularDuracao(expedicao.data_inicio, expedicao.data_fim);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                        <TargetIcon className="w-5 h-5" />
                        Detalhes da Expedição
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col gap-4 md:gap-4">
                    
                    {/* Cards de Estatísticas - Padrão da Home */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <Card className="p-4 gap-2">
                            <div className="text-sm text-muted-foreground flex justify-between">
                                Duração da Expedição
                                <CalendarIcon />
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {duracao}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {formatarData(expedicao.data_inicio)} - {formatarData(expedicao.data_fim)}
                            </div>
                        </Card>

                        <Card className="p-4 gap-2">
                            <div className="text-sm text-muted-foreground flex justify-between">
                                Localização
                                <MapPinIcon />
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {expedicao.localizacao.pais}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {expedicao.localizacao.cidade && `${expedicao.localizacao.cidade}, `}
                                {expedicao.localizacao.estado && `${expedicao.localizacao.estado}`}
                            </div>
                        </Card>

                        {expedicao.orcamento ? (
                            <Card className="p-4 gap-2">
                                <div className="text-sm text-muted-foreground flex justify-between">
                                    Orçamento
                                    <TargetIcon />
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                    {formatarValor(expedicao.orcamento)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    orçamento estimado
                                </div>
                            </Card>
                        ) : (
                            <Card className="p-4 gap-2">
                                <div className="text-sm text-muted-foreground flex justify-between">
                                    Sítio Arqueológico
                                    <TargetIcon />
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                    {expedicao.ruina.nome}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    sítio sendo escavado
                                </div>
                            </Card>
                        )}

                        <Card className="p-4 gap-2">
                            <div className="text-sm text-muted-foreground flex justify-between">
                                Status
                                <TargetIcon />
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {expedicao.status}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                status atual
                            </div>
                        </Card>
                    </div>

                    {/* Informações Principais */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">
                                {expedicao.nome}
                            </h3>
                            <Badge variant="outline" className="gap-1">
                                {statusIcon(expedicao.status)}
                                {expedicao.status}
                            </Badge>
                        </div>
                        
                        {expedicao.descricao && (
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                    <InfoIcon className="w-4 h-4" />
                                    Descrição
                                </h4>
                                <p className="text-sm text-foreground leading-relaxed">
                                    {expedicao.descricao}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Progresso da Expedição */}
                    {isActive && (
                        <Card className="p-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                Progresso da Expedição
                            </h4>
                            <ProgressBar progress={progress} />
                            <div className="mt-2 text-xs text-muted-foreground">
                                {progress === 0 && "Expedição ainda não iniciou"}
                                {progress > 0 && progress < 100 && "Expedição em andamento"}
                                {progress === 100 && "Expedição concluída"}
                            </div>
                        </Card>
                    )}

                    {/* Mapa e Informações do Sítio */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="p-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                Localização no Mapa
                            </h4>
                            <RuinLocationMap 
                                key={`${expedicao.ruina.latitude}-${expedicao.ruina.longitude}-${expedicao.ruina.nome}`}
                                location={{
                                    latitude: expedicao.ruina.latitude,
                                    longitude: expedicao.ruina.longitude,
                                    nome: expedicao.ruina.nome,
                                    pais: expedicao.localizacao.pais
                                }}
                            />
                        </Card>

                        <Card className="p-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                                <TargetIcon className="w-4 h-4" />
                                Sítio Arqueológico
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {expedicao.ruina.nome}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {expedicao.ruina.descricao}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-muted-foreground">Latitude:</span>
                                        <span className="ml-1 font-medium">{expedicao.ruina.latitude}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Longitude:</span>
                                        <span className="ml-1 font-medium">{expedicao.ruina.longitude}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Tabela da Equipe */}
                    <Card className="p-4 w-full overflow-x-auto">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Equipe - {expedicao.equipe.nome}</h3>
                        
                        {expedicao.equipe.pessoas && expedicao.equipe.pessoas.length > 0 ? (
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
                                        {expedicao.equipe.pessoas.map((pessoa) => (
                                            <TableRow key={pessoa.id} className={pessoa.isLider ? "bg-muted/50" : ""}>
                                                <TableCell>
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage 
                                                            src={pessoa.avatar} 
                                                            alt={pessoa.nome} 
                                                        />
                                                        <AvatarFallback className="text-sm">
                                                            {pessoa.nome.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {pessoa.nome}
                                                        {pessoa.isLider && (
                                                            <Badge variant="default" className="text-xs bg-primary">
                                                                Líder
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">
                                                        {pessoa.especialidade || "Não informado"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {pessoa.email || "Não informado"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {pessoa.telefone || "Não informado"}
                                                </TableCell>
                                                <TableCell>
                                                    {pessoa.isLider ? (
                                                        <Badge variant="default" className="text-xs bg-primary">
                                                            Líder da Equipe
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs">
                                                            Membro
                                                        </Badge>
                                                    )}
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

                    {/* Informações Adicionais */}
                    {(expedicao.prioridade || expedicao.lider_id) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {expedicao.prioridade && (
                                <Card className="p-4">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                        Prioridade
                                    </h4>
                                    <Badge 
                                        variant={expedicao.prioridade === "Alta" ? "destructive" : 
                                               expedicao.prioridade === "Média" ? "default" : "secondary"}
                                    >
                                        {expedicao.prioridade}
                                    </Badge>
                                </Card>
                            )}

                            {expedicao.lider_id && (
                                <Card className="p-4">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                        Líder da Expedição
                                    </h4>
                                    <p className="text-sm font-medium">
                                        ID: {expedicao.lider_id}
                                    </p>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 