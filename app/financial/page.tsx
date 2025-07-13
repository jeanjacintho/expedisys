"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService, Financiamento, Instituicao, Expedicao, Desafio, DesafioHasExpedicao } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { 
    DollarSignIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    CreditCardIcon,
    ReceiptIcon,
    BarChart3Icon,
    CalendarIcon,
    AlertTriangleIcon
} from "lucide-react";

export default function FinancialPage() {
    const router = useRouter();
    const [financiamentos, setFinanciamentos] = useState<Financiamento[]>([]);
    const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
    const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
    const [desafios, setDesafios] = useState<Desafio[]>([]);
    const [desafioHasExpedicao, setDesafioHasExpedicao] = useState<DesafioHasExpedicao[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [financiamentosData, instituicoesData, expedicoesData, desafiosData, desafioHasExpedicaoData] = await Promise.all([
                    ApiService.getFinanciamentos(),
                    ApiService.getInstituicoes(),
                    ApiService.getExpedicoes(),
                    ApiService.getDesafios(),
                    ApiService.getDesafioHasExpedicao(),
                ]);

                setFinanciamentos(financiamentosData);
                setInstituicoes(instituicoesData);
                setExpedicoes(expedicoesData);
                setDesafios(desafiosData);
                setDesafioHasExpedicao(desafioHasExpedicaoData);
            } catch (error) {
                console.error('Erro ao carregar dados financeiros:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Calcular estatísticas
    const estatisticas = useMemo(() => {
        const totalFinanciamentos = financiamentos.length;
        const totalValor = financiamentos.reduce((acc, f) => acc + f.investimento, 0);
        // Como não temos status nos financiamentos, vamos considerar todos como ativos
        const financiamentosAtivos = financiamentos.length;
        const valorAtivo = financiamentos.reduce((acc, f) => acc + f.investimento, 0);
        // Como não temos orçamento nas expedições, vamos usar um valor estimado
        const orcamentoTotal = expedicoes.length * 50000; // Estimativa de R$ 50k por expedição
        
        // Calcular despesas baseadas nos desafios
        const totalDespesas = desafioHasExpedicao.reduce((acc, d) => acc + d.despesa_adicional, 0);
        const totalDesafios = desafioHasExpedicao.length;
        
        return {
            totalFinanciamentos,
            totalValor,
            financiamentosAtivos,
            valorAtivo,
            orcamentoTotal,
            totalDespesas,
            totalDesafios,
            saldo: valorAtivo - orcamentoTotal - totalDespesas
        };
    }, [financiamentos, expedicoes, desafioHasExpedicao]);

    if (loading) {
        return (
            <div className="flex flex-col gap-4 md:gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="p-4 animate-pulse">
                            <div className="h-4 bg-muted rounded mb-2"></div>
                            <div className="h-8 bg-muted rounded mb-2"></div>
                            <div className="h-3 bg-muted rounded"></div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 md:gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Total de Financiamentos
                        <DollarSignIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.totalFinanciamentos}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        financiamentos cadastrados
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Valor Total
                        <TrendingUpIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        R$ {estatisticas.totalValor.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        valor total captado
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Financiamentos Ativos
                        <CreditCardIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.financiamentosAtivos}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        financiamentos ativos
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Orçamento Total
                        <ReceiptIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        R$ {estatisticas.orcamentoTotal.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        orçamento das expedições
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Valor Disponível
                        <TrendingUpIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        R$ {estatisticas.valorAtivo.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        valor disponível para uso
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Saldo
                        <BarChart3Icon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        R$ {estatisticas.saldo.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {estatisticas.saldo >= 0 ? 'saldo positivo' : 'saldo negativo'}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Orçamentos
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
                        Despesas
                        <TrendingDownIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        R$ {estatisticas.totalDespesas.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {estatisticas.totalDesafios} desafios enfrentados
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Financiamentos
                        <DollarSignIcon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {estatisticas.totalFinanciamentos}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        financiamentos ativos
                    </div>
                </Card>

                <Card className="p-4 gap-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                        Relatórios
                        <BarChart3Icon />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        0
                    </div>
                    <div className="text-xs text-muted-foreground">
                        relatórios gerados
                    </div>
                </Card>
            </div>
        </div>
    );
} 