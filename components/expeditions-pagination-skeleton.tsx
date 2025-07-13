import { Skeleton } from "@/components/ui/skeleton";

export function ExpeditionsPaginationSkeleton() {
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
            </div>
        </div>
    );
} 