"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { CalendarIcon, MapPinIcon, ShovelIcon, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Artefato {
  id: number;
  nome: string;
  Expedicao_id: number;
  valor_estimado: number;
  data_encontrado: string;
}

interface Expedicao {
  id: number;
  nome: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  localizacao?: {
    id: number;
    pais: string;
    latitude: number;
    longitude: number;
  };
  ruina?: {
    id: number;
    nome: string;
  };
  equipe?: {
    id: number;
    nome: string;
  };
}

interface LastArtefactsFoundProps {
  expedicoesAtivas?: Expedicao[];
  artefatos?: Artefato[];
  loading?: boolean;
}

export function LastArtefactsFound({ expedicoesAtivas = [], artefatos = [], loading = false }: LastArtefactsFoundProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  // Filtrar artefatos das expedições ativas e ordenar por data de descoberta
  const artefatosRecentes = (() => {
    if (loading || !expedicoesAtivas.length || !artefatos.length) {
      return [];
    }

    const idsExpedicoesAtivas = expedicoesAtivas.map(exp => exp.id);
    const artefatosDasAtivas = artefatos.filter(artefato => 
      idsExpedicoesAtivas.includes(artefato.Expedicao_id)
    );

    // Ordenar por data de descoberta (mais recente primeiro)
    return artefatosDasAtivas
      .sort((a, b) => new Date(b.data_encontrado).getTime() - new Date(a.data_encontrado).getTime());
  })();

  // Calcular dados de paginação
  const totalPages = Math.ceil(artefatosRecentes.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentArtefatos = artefatosRecentes.slice(startIndex, endIndex);

  // Resetar página quando os dados mudarem
  useEffect(() => {
    setPage(1);
  }, [artefatosRecentes.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getExpedicaoNome = (expedicaoId: number) => {
    const expedicao = expedicoesAtivas.find(exp => exp.id === expedicaoId);
    return expedicao?.nome || 'Expedição não encontrada';
  };

  const getLocalizacao = (expedicaoId: number) => {
    const expedicao = expedicoesAtivas.find(exp => exp.id === expedicaoId);
    return expedicao?.localizacao?.pais || expedicao?.ruina?.nome || 'Localização não disponível';
  };



  return (
    <Card className="p-4 h-full gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">Últimos Artefatos Encontrados</h3>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border-l-4 border-primary pl-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : artefatosRecentes.length > 0 ? (
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-3">
            {currentArtefatos.map((artefato) => (
              <div key={artefato.id} className="border-l-4 border-primary pl-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">
                      {artefato.nome}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {getExpedicaoNome(artefato.Expedicao_id)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(artefato.data_encontrado)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {getLocalizacao(artefato.Expedicao_id)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {formatValue(artefato.valor_estimado)}
                  </Badge>
                </div>
              </div>
            ))}
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
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
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
      ) : (
        <div className="text-center text-muted-foreground">
          <ShovelIcon className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm">Nenhum artefato encontrado recentemente</p>
        </div>
      )}
    </Card>
  );
} 