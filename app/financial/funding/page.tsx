"use client";

import { Card } from "@/components/ui/card";
import { DollarSignIcon, TrendingUpIcon, CreditCardIcon } from "lucide-react";

export default function FundingPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-foreground">Financiamentos</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-foreground font-medium">Total de Financiamentos</h3>
                        <DollarSignIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        0
                    </div>
                    <div className="text-foreground text-xs">
                        financiamentos cadastrados
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-foreground font-medium">Valor Total</h3>
                        <TrendingUpIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        R$ 0
                    </div>
                    <div className="text-foreground text-xs">
                        valor total captado
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-foreground font-medium">Instituições</h3>
                        <CreditCardIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        0
                    </div>
                    <div className="text-foreground text-xs">
                        instituições parceiras
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                    <DollarSignIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
                    <p className="text-sm">A página de financiamentos está sendo implementada.</p>
                </div>
            </Card>
        </div>
    );
} 