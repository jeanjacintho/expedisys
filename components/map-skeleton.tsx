import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MapSkeleton() {
  return (
    <Card className="p-0 flex flex-col w-full h-full">
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </Card>
  );
} 