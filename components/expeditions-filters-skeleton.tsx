import { Skeleton } from "@/components/ui/skeleton";
import { FilterIcon } from "lucide-react";

export function ExpeditionsFiltersSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                    <FilterIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Filtros:</span>
                </div>
                
                <div className="flex-1 max-w-xl">
                    <Skeleton className="h-10 w-full" />
                </div>
                
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-35" />
                <Skeleton className="h-10 w-35" />
                <Skeleton className="h-10 w-32" />
            </div>
            
            <Skeleton className="h-4 w-64" />
        </div>
    );
} 