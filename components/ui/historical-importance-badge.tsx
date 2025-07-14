import { Badge } from "@/components/ui/badge";
import { StarIcon, AwardIcon, TrophyIcon, CrownIcon, GemIcon } from "lucide-react";

interface HistoricalImportanceBadgeProps {
  descricao: string;
}

export function HistoricalImportanceBadge({ descricao }: HistoricalImportanceBadgeProps) {
  switch (descricao) {
    case "Patrimônio Mundial": 
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex items-center gap-1">
          <div className="bg-purple-500 p-0.5 rounded-full">
            <CrownIcon className="w-2 h-2 text-white" />
          </div>
          Patrimônio Mundial
        </Badge>
      );
    case "Nacional": 
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
          <div className="bg-blue-500 p-0.5 rounded-full">
            <AwardIcon className="w-2 h-2 text-white" />
          </div>
          Nacional
        </Badge>
      );
    case "Regional": 
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
          <div className="bg-green-500 p-0.5 rounded-full">
            <TrophyIcon className="w-2 h-2 text-white" />
          </div>
          Regional
        </Badge>
      );
    case "Local": 
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
          <div className="bg-yellow-500 p-0.5 rounded-full">
            <StarIcon className="w-2 h-2 text-white" />
          </div>
          Local
        </Badge>
      );
    case "Arqueológico": 
      return (
        <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 flex items-center gap-1">
          <div className="bg-orange-500 p-0.5 rounded-full">
            <GemIcon className="w-2 h-2 text-white" />
          </div>
          Arqueológico
        </Badge>
      );
    default: 
      return <Badge variant="outline">{descricao}</Badge>;
  }
} 