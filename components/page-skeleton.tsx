import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  titleWidth?: string;
  statsCount?: number;
  filtersCount?: number;
  tableRows?: number;
}

export function PageSkeleton({ 
  titleWidth = "w-64", 
  statsCount = 5, 
  filtersCount = 6, 
  tableRows = 10 
}: PageSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center justify-between">
        <Skeleton className={`h-8 ${titleWidth}`} />
      </div>
      
      {/* Skeleton para estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(statsCount)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      
      {/* Skeleton para filtros */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-4">
          {[...Array(filtersCount)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
      </div>
      
      {/* Skeleton para tabela */}
      <div className="space-y-3">
        {[...Array(tableRows)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
} 