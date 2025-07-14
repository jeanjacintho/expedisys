import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, MinusIcon, TrendingDownIcon } from "lucide-react";

interface PerformanceBadgeProps {
  taxaSucesso: number;
}

export function PerformanceBadge({ taxaSucesso }: PerformanceBadgeProps) {
  if (taxaSucesso >= 80) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
        <TrendingUpIcon className="w-3 h-3" />
        Excelente
      </Badge>
    );
  } else if (taxaSucesso >= 60) {
    return (
      <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
        <MinusIcon className="w-3 h-3" />
        Bom
      </Badge>
    );
  } else if (taxaSucesso >= 40) {
    return (
      <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 flex items-center gap-1">
        <MinusIcon className="w-3 h-3" />
        Regular
      </Badge>
    );
  } else {
    return (
      <Badge variant="default" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
        <TrendingDownIcon className="w-3 h-3" />
        Baixo
      </Badge>
    );
  }
} 