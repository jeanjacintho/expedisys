"use client";

import { Card } from "@/components/ui/card";
import { ReceiptIcon, TrendingUpIcon, AlertTriangleIcon } from "lucide-react";

export default function BudgetsPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-foreground">Orçamentos</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Total de Orçamentos
                        <ReceiptIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        0
                    </div>
                    <div className="text-xs text-muted-foreground">
                        orçamentos cadastrados
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Valor Total
                        <TrendingUpIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        R$ 0
                    </div>
                    <div className="text-xs text-muted-foreground">
                        valor total orçado
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Pendentes
                        <AlertTriangleIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        0
                    </div>
                    <div className="text-xs text-muted-foreground">
                        orçamentos pendentes
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                    <ReceiptIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
                    <p className="text-sm">A página de orçamentos está sendo implementada.</p>
                </div>
            </Card>
        </div>
    );
} 