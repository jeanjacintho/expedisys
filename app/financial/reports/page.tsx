"use client";

import { Card } from "@/components/ui/card";
import { BarChart3Icon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-foreground">Relatórios Financeiros</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-foreground font-medium">Relatórios Gerados</h3>
                        <BarChart3Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        0
                    </div>
                    <div className="text-foreground text-xs">
                        relatórios disponíveis
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-foreground font-medium">Receitas</h3>
                        <TrendingUpIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        R$ 0
                    </div>
                    <div className="text-foreground text-xs">
                        total de receitas
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-foreground font-medium">Despesas</h3>
                        <TrendingDownIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        R$ 0
                    </div>
                    <div className="text-foreground text-xs">
                        total de despesas
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                    <BarChart3Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
                    <p className="text-sm">A página de relatórios financeiros está sendo implementada.</p>
                </div>
            </Card>
        </div>
    );
} 