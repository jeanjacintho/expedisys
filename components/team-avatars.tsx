"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Pessoa {
    id: number;
    nome: string;
    avatar?: string;
}

interface TeamAvatarsProps {
    pessoas: Pessoa[];
    maxVisible?: number;
    size?: "sm" | "md" | "lg";
}



export function TeamAvatars({ pessoas, maxVisible = 4, size = "md" }: TeamAvatarsProps) {
    if (!pessoas || pessoas.length === 0) {
        return <span className="text-muted-foreground text-sm">Sem integrantes</span>;
    }

    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8", 
        lg: "h-10 w-10"
    };

    const textSizes = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-sm"
    };

    const remainingCount = pessoas.length - maxVisible;

    return (
        <div className="flex -space-x-2">
            {pessoas.slice(0, 3).map((pessoa) => (
                <Avatar key={pessoa.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={pessoa.avatar} alt={pessoa.nome} />
                    <AvatarFallback>{pessoa.nome.charAt(0)}</AvatarFallback>
                </Avatar>
            ))}
            {remainingCount > 0 && (
                <div className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center border-2 border-background`}>
                    <span className={`${textSizes[size]} font-medium`}>+{remainingCount}</span>
                </div>
            )}
        </div>
    );
} 