import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardSkeletonProps {
  icon?: React.ReactNode;
}

export function StatsCardSkeleton({ icon }: StatsCardSkeletonProps) {
  return (
    <Card className="p-4 gap-2">
      <div className="text-sm text-muted-foreground flex justify-between">
        <Skeleton className="h-4 w-24" />
        {icon}
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </Card>
  );
} 