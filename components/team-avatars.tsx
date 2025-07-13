"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";
import { useAvatarImage } from "@/hooks/use-optimized-image";

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

// Componente otimizado para avatar individual
function OptimizedAvatar({ pessoa, size }: { pessoa: Pessoa; size: "sm" | "md" | "lg" }) {
    const { isLoaded, hasError, isLoading, imageSrc } = useAvatarImage(pessoa.avatar, pessoa.id);

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

    // Gerar iniciais otimizadas
    const initials = useMemo(() => {
        const names = pessoa.nome.trim().split(' ');
        if (names.length >= 2) {
            return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
        }
        return pessoa.nome.charAt(0).toUpperCase();
    }, [pessoa.nome]);

    return (
        <Avatar className={`${sizeClasses[size]} border-2 border-background relative`}>
            {imageSrc && !hasError && (
                <AvatarImage 
                    src={imageSrc} 
                    alt={pessoa.nome}
                    className={isLoading ? "opacity-0" : "opacity-100"}
                    style={{ transition: "opacity 0.2s ease-in-out" }}
                />
            )}
            <AvatarFallback 
                className={`${textSizes[size]} ${isLoaded ? "opacity-0" : "opacity-100"}`}
                style={{ transition: "opacity 0.2s ease-in-out" }}
            >
                {isLoading ? (
                    <div className="animate-pulse bg-muted-foreground/20 rounded-full w-3 h-3" />
                ) : (
                    initials
                )}
            </AvatarFallback>
        </Avatar>
    );
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

    const visiblePessoas = pessoas.slice(0, maxVisible);
    const remainingCount = pessoas.length - maxVisible;

    return (
        <div className="flex -space-x-2">
            {visiblePessoas.map((pessoa, index) => (
                <OptimizedAvatar 
                    key={pessoa.id} 
                    pessoa={pessoa} 
                    size={size}
                />
            ))}
            {remainingCount > 0 && (
                <div className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center border-2 border-background`}>
                    <span className={`${textSizes[size]} font-medium`}>+{remainingCount}</span>
                </div>
            )}
        </div>
    );
} 