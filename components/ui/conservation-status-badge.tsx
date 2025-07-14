import { Badge } from "@/components/ui/badge";
import { ShieldIcon, AlertTriangleIcon, CheckIcon, XCircleIcon, MinusCircleIcon } from "lucide-react";

interface ConservationStatusBadgeProps {
  nivel: string;
}

export function ConservationStatusBadge({ nivel }: ConservationStatusBadgeProps) {
  switch (nivel) {
    case "Excelente": 
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
          <div className="bg-green-500 p-0.5 rounded-full">
            <CheckIcon className="w-2 h-2 text-white" />
          </div>
          Excelente
        </Badge>
      );
    case "Bom": 
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
          <div className="bg-blue-500 p-0.5 rounded-full">
            <ShieldIcon className="w-2 h-2 text-white" />
          </div>
          Bom
        </Badge>
      );
    case "Regular": 
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
          <div className="bg-yellow-500 p-0.5 rounded-full">
            <AlertTriangleIcon className="w-2 h-2 text-white" />
          </div>
          Regular
        </Badge>
      );
    case "Ruim": 
      return (
        <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 flex items-center gap-1">
          <div className="bg-orange-500 p-0.5 rounded-full">
            <MinusCircleIcon className="w-2 h-2 text-white" />
          </div>
          Ruim
        </Badge>
      );
    case "Crítico": 
      return (
        <Badge variant="default" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
          <div className="bg-red-500 p-0.5 rounded-full">
            <XCircleIcon className="w-2 h-2 text-white" />
          </div>
          Crítico
        </Badge>
      );
    default: 
      return <Badge variant="outline">{nivel}</Badge>;
  }
} 