"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPinIcon, UsersIcon, CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface Desafio {
  desafio: string;
  expedicao: string;
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  data_inicio: string;
  localizacao?: string;
  equipe?: string;
}

interface RecentChallengesProps {
  desafios: Desafio[];
  loading: boolean;
}

const ITEMS_PER_PAGE = 3;

export function RecentChallenges({ desafios, loading }: RecentChallengesProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Calcular dados de paginação
  const totalPages = Math.ceil(desafios.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDesafios = desafios.slice(startIndex, endIndex);

  // Atualizar página quando os dados mudarem
  if (currentPage >= totalPages && totalPages > 0) {
    setCurrentPage(0);
  }

  // Reset para primeira página quando os dados mudam
  useEffect(() => {
    setCurrentPage(0);
  }, [desafios.length]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const getRiscoStyles = (nivel: string) => {
    switch (nivel) {
      case 'critico':
        return {
          borderClass: 'border-red-500',
          bgClass: 'bg-red-50',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800'
        };
      case 'alto':
        return {
          borderClass: 'border-orange-500',
          bgClass: 'bg-orange-50',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-800'
        };
      case 'medio':
        return {
          borderClass: 'border-yellow-500',
          bgClass: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800'
        };
      default:
        return {
          borderClass: 'border-green-500',
          bgClass: 'bg-green-50',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800'
        };
    }
  };

  const getRiscoBadge = (nivel: string) => {
    const getRiscoIcon = (risco: string) => {
      switch (risco) {
        case 'baixo': return '🟢';
        case 'medio': return '🟡';
        case 'alto': return '🟠';
        case 'critico': return '🔴';
        default: return '⚪';
      }
    };

    return (
      <Badge variant="outline" className="text-xs">
        <span className="mr-1">{getRiscoIcon(nivel)}</span>
        {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
      </Badge>
    );
  };

  const formatarData = (dataString: string) => {
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
  };

  if (loading) {
    return (
      <Card className="p-4 h-full gap-4">
        <Skeleton className="h-6 w-64" />
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (desafios.length === 0) {
    return (
      <Card className="p-4 h-full gap-4">
        <h3 className="text-lg font-semibold text-foreground">Desafios recentes encontrados nas expedições</h3>
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Nenhum desafio encontrado nas expedições ativas.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 h-full gap-4">
      <h3 className="text-lg font-semibold text-foreground">Desafios recentes encontrados nas expedições</h3>
      
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-3">
          {currentDesafios.map((item, idx) => {
            const styles = getRiscoStyles(item.nivel_risco);
            
            return (
              <div key={idx} className={`border rounded-lg p-4 ${styles.bgClass} ${styles.borderClass}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <AlertTriangle className={`w-5 h-5 ${styles.iconColor}`} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium text-sm ${styles.titleColor}`}>
                        {item.expedicao}
                      </h4>
                      {getRiscoBadge(item.nivel_risco)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {item.desafio}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{formatarData(item.data_inicio)}</span>
                      </div>
                      
                      {item.localizacao && (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />
                          <span>{item.localizacao}</span>
                        </div>
                      )}
                      
                      {item.equipe && (
                        <div className="flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" />
                          <span>{item.equipe}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              {startIndex + 1}-{Math.min(endIndex, desafios.length)} de {desafios.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="h-6 w-6 p-0"
              >
                <ChevronLeftIcon className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="h-6 w-6 p-0"
              >
                <ChevronRightIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 