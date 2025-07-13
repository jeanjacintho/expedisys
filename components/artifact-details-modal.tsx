"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  UsersIcon, 
  DollarSignIcon,
  AwardIcon,
  CheckCircleIcon
} from "lucide-react"
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ArtefatoComDetalhes {
    id: number;
    nome: string;
    material: string;
    idade_em_anos: number;
    Expedicao_id: number;
    valor_estimado: number;
    Estado_Conservacao_id: number;
    data_encontrado: string;
    Importancia_Historica_id: number;
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

function formatarData(dataString: string) {
    try {
        const data = new Date(dataString);
        return format(data, 'dd/MM/yyyy', { locale: ptBR });
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

function calcularIdadeEmPeriodo(idadeEmAnos: number): string {
    if (idadeEmAnos < 100) {
        return `${idadeEmAnos} anos`;
    } else if (idadeEmAnos < 1000) {
        return `${Math.floor(idadeEmAnos / 100)} séculos`;
    } else if (idadeEmAnos < 10000) {
        return `${Math.floor(idadeEmAnos / 1000)} milênios`;
    } else {
        return `${Math.floor(idadeEmAnos / 1000)} milênios`;
    }
}

interface ArtifactDetailsModalProps {
    artefato: ArtefatoComDetalhes | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    router: {
        push: (path: string) => void;
    };
}

export function ArtifactDetailsModal({ artefato, open, onOpenChange, router }: ArtifactDetailsModalProps) {
    if (!artefato) return null;

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
                        <UsersIcon className="w-5 h-5" />
                        Detalhes do Artefato
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col gap-4 md:gap-4">
                    
                    {/* Cards de Estatísticas - Padrão da Home */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <Card className="p-4 gap-2">
                            <div className="text-sm text-muted-foreground flex justify-between">
                                Idade do Artefato
                                <UsersIcon />
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {calcularIdadeEmPeriodo(artefato.idade_em_anos)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {artefato.idade_em_anos.toLocaleString()} anos
                            </div>
                        </Card>

                        <Card className="p-4 gap-2">
                            <div className="text-sm text-muted-foreground flex justify-between">
                                Valor Estimado
                                <DollarSignIcon />
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {formatarValor(artefato.valor_estimado)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                valor estimado
                            </div>
                        </Card>

                        <Card className="p-4 gap-2">
                            <div className="text-sm text-muted-foreground flex justify-between">
                                Estado de Conservação
                                <CheckCircleIcon />
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {artefato.estado_conservacao?.nivel || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                estado atual
                            </div>
                        </Card>

                        <Card className="p-4 gap-2">
                            <div className="text-sm text-muted-foreground flex justify-between">
                                Importância Histórica
                                <AwardIcon />
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {artefato.importancia_historica?.descricao || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                classificação histórica
                            </div>
                        </Card>
                    </div>

                    {/* Informações Principais */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">
                                {artefato.nome}
                            </h3>
                            <Badge variant="outline" className="gap-1">
                                <UsersIcon className="w-4 h-4" />
                                Artefato Arqueológico
                            </Badge>
                        </div>
                        
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <UsersIcon className="w-4 h-4" />
                                Informações Básicas
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Material</p>
                                    <p className="text-sm font-medium">{artefato.material}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Data de Descoberta</p>
                                    <p className="text-sm font-medium">{formatarData(artefato.data_encontrado)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">ID do Artefato</p>
                                    <p className="text-sm font-medium">#{artefato.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Expedição</p>
                                    <p className="text-sm font-medium">{artefato.Expedicao_id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estado de Conservação e Importância */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="p-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                Estado de Conservação
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <EstadoConservacaoBadge nivel={artefato.estado_conservacao?.nivel || "N/A"} />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>O artefato está em estado {artefato.estado_conservacao?.nivel?.toLowerCase() || "não informado"}.</p>
                                    <p className="mt-1">Este estado determina as necessidades de conservação e manutenção.</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                                <AwardIcon className="w-4 h-4" />
                                Importância Histórica
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <ImportanciaHistoricaBadge descricao={artefato.importancia_historica?.descricao || "N/A"} />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>Classificado como {artefato.importancia_historica?.descricao?.toLowerCase() || "não informado"}.</p>
                                    <p className="mt-1">Esta classificação determina o valor histórico e cultural do artefato.</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Expedição Relacionada */}
                    {artefato.expedicao && (
                        <Card className="p-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                                <UsersIcon className="w-4 h-4" />
                                Expedição de Descoberta
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h5 className="text-lg font-semibold text-foreground">
                                            {artefato.expedicao.nome}
                                        </h5>
                                        <p className="text-sm text-muted-foreground">
                                            Expedição ID: {artefato.expedicao.id}
                                        </p>
                                    </div>
                                    <Badge 
                                        variant={artefato.expedicao.status === "Concluída" ? "outline" : 
                                               artefato.expedicao.status === "Em andamento" ? "default" : "secondary"}
                                    >
                                        {artefato.expedicao.status}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>Este artefato foi descoberto durante esta expedição arqueológica.</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Foto do Artefato */}
                    <Card className="p-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                            <UsersIcon className="w-4 h-4" />
                            Imagem do Artefato
                        </h4>
                        <div className="flex justify-center">
                            <div className="w-64 h-64 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    <div className="text-6xl mb-4">🏺</div>
                                    <div className="text-sm">Foto do Artefato</div>
                                    <div className="text-xs mt-1">Imagem não disponível</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Informações Adicionais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                Valor de Mercado
                            </h4>
                            <div className="space-y-2">
                                <div className="text-2xl font-bold text-foreground">
                                    {formatarValor(artefato.valor_estimado)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Valor estimado baseado em análise de mercado e raridade
                                </p>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                Contexto Histórico
                            </h4>
                            <div className="space-y-2">
                                <div className="text-sm">
                                    <p>Artefato de {artefato.material.toLowerCase()} com {artefato.idade_em_anos.toLocaleString()} anos de idade.</p>
                                    <p className="mt-1">Descoberto em {formatarData(artefato.data_encontrado)}.</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Card className="p-4 flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                        Ações
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        Gerenciar artefato
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                                        onClick={() => {
                                            router.push(`/artifacts/edit/${artefato.id}`);
                                        }}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                                        onClick={() => {
                                            console.log('Deletar artefato:', artefato.id);
                                        }}
                                    >
                                        Deletar
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 