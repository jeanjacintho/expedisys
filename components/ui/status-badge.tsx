import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon, ClockIcon, Loader2Icon } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "Concluída": 
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
          <div className="bg-green-500 p-0.5 rounded-full">
            <CheckIcon className="w-2 h-2 text-white" />
          </div>
          Concluída
        </Badge>
      );
    case "Em andamento": 
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
          <Loader2Icon className="w-3 h-3 animate-spin" />
          Em Andamento
        </Badge>
      );
    case "Cancelada": 
      return (
        <Badge variant="default" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
          <div className="bg-red-500 p-0.5 rounded-full">
            <XIcon className="w-2 h-2 text-white" />
          </div>
          Cancelada
        </Badge>
      );
    case "Em planejamento": 
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
          <ClockIcon className="w-3 h-3" />
          Planejamento
        </Badge>
      );
    default: 
      return <Badge variant="outline">{status}</Badge>;
  }
} 