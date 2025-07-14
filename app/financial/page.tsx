"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { PerformanceBadge } from "@/components/ui/performance-badge"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { 
  DollarSignIcon, TrendingUpIcon, AlertCircleIcon, UsersIcon, CheckCircleIcon, AlertTriangleIcon, LineChartIcon, PieChartIcon, LightbulbIcon
} from "lucide-react"
import { ApiService } from "@/lib/api"

interface Expedicao {
  id: number
  nome: string
  status: string
}

interface Desafio {
  id: number
  descricao: string
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico'
}

interface DesafioHasExpedicao {
  Desafio_id: number
  Expedicao_id: number
  despesa_adicional: number
}

export default function FinancialPage() {
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([])
  const [desafios, setDesafios] = useState<Desafio[]>([])
  const [desafioHasExpedicao, setDesafioHasExpedicao] = useState<DesafioHasExpedicao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expedicoesData, desafiosData, desafioHasExpedicaoData] = await Promise.all([
          ApiService.getExpedicoes(),
          ApiService.getDesafios(),
          ApiService.getDesafioHasExpedicao(),
        ])

        setExpedicoes(expedicoesData)
        setDesafios(desafiosData)
        setDesafioHasExpedicao(desafioHasExpedicaoData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calcular estatísticas financeiras
  const totalDespesas = desafioHasExpedicao.reduce((acc, d) => acc + d.despesa_adicional, 0)
  const totalDesafios = desafioHasExpedicao.length
  const mediaDespesaPorDesafio = totalDesafios > 0 ? totalDespesas / totalDesafios : 0
  const expAtivas = expedicoes.filter(e => e.status === "Em andamento").length

  // Despesas por risco
  const desafiosPorRisco = desafioHasExpedicao.reduce((acc, d) => {
    const desafio = desafios.find(des => des.id === d.Desafio_id)
    const risco = desafio?.nivel_risco || 'baixo'
    acc[risco] = (acc[risco] || 0) + d.despesa_adicional
    return acc
  }, {} as Record<string, number>)

  // Tendência mensal (simulação)
  const desafiosComDetalhes = desafioHasExpedicao.map(dhe => {
    const desafio = desafios.find(d => d.id === dhe.Desafio_id)
    return {
      ...dhe,
      desafio: desafio
    }
  }).filter(d => d.desafio)

  const desafiosPorMes = desafiosComDetalhes.reduce((acc, d) => {
    // Simular mês baseado no Desafio_id para demonstração
    const mes = (d.Desafio_id % 12) + 1
    const nomeMes = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ][mes - 1]
    if (!acc[nomeMes]) {
      acc[nomeMes] = { total: 0, count: 0 }
    }
    acc[nomeMes].total += d.despesa_adicional
    acc[nomeMes].count += 1
    return acc
  }, {} as Record<string, { total: number; count: number }>)

  const dadosTendencia = Object.entries(desafiosPorMes).map(([mes, data]) => ({
    mes,
    despesaTotal: data.total,
    quantidade: data.count,
    media: data.count > 0 ? data.total / data.count : 0
  }))

  // Top 5 desafios mais caros
  const desafiosMaisCaros = desafiosComDetalhes
    .sort((a, b) => b.despesa_adicional - a.despesa_adicional)
    .slice(0, 5)
    .map(d => ({
      descricao: d.desafio?.descricao || 'N/A',
      despesa: d.despesa_adicional,
      risco: d.desafio?.nivel_risco || 'baixo'
    }))

  // Insights automáticos
  const insights: string[] = []
  if (totalDespesas > 0) {
    const maiorRisco = Object.entries(desafiosPorRisco).sort(([,a],[,b]) => b-a)[0]?.[0]
    if (maiorRisco) insights.push(`O maior volume de despesas está em desafios de risco ${maiorRisco}.`)
    if (mediaDespesaPorDesafio > 0) insights.push(`O custo médio por desafio é de R$ ${mediaDespesaPorDesafio.toLocaleString()}.`)
    if (expAtivas > 0) insights.push(`Existem ${expAtivas} expedições em andamento impactando o orçamento.`)
  } else {
    insights.push("Ainda não há despesas registradas.")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-2">
            <span className="text-foreground font-medium">Total de Despesas</span>
            <DollarSignIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">R$ {totalDespesas.toLocaleString()}</span>
          </div>
          <div className="text-xs text-foreground mt-2">
            Total gasto com desafios
          </div>
        </Card>
        <Card className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-2">
            <span className="text-foreground font-medium">Desafios Ativos</span>
            <AlertCircleIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{totalDesafios}</span>
          </div>
          <div className="text-xs text-foreground mt-2">
            Desafios enfrentados
          </div>
        </Card>
        <Card className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-2">
            <span className="text-foreground font-medium">Média por Desafio</span>
            <TrendingUpIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">R$ {mediaDespesaPorDesafio.toLocaleString()}</span>
          </div>
          <div className="text-xs text-foreground mt-2">
            Custo médio por desafio
          </div>
        </Card>
        <Card className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-2">
            <span className="text-foreground font-medium">Expedições Ativas</span>
            <UsersIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{expAtivas}</span>
          </div>
          <div className="text-xs text-foreground mt-2">
            Expedições em andamento
          </div>
        </Card>
      </div>

      {/* Gráficos financeiros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col h-full p-4 gap-2">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChartIcon className="w-5 h-5 text-primary" /> Despesas por Nível de Risco
            </CardTitle>
            <CardDescription>Distribuição das despesas por risco dos desafios</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer config={{ baixo: { label: 'Baixo', color: 'var(--primary)' }, medio: { label: 'Médio', color: 'var(--primary)' }, alto: { label: 'Alto', color: 'var(--primary)' }, critico: { label: 'Crítico', color: 'var(--primary)' } }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={['baixo','medio','alto','critico'].map(risco => ({
                  risco,
                  despesa: desafiosPorRisco[risco] || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="risco" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="despesa" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="flex flex-col h-full p-4 gap-2">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChartIcon className="w-5 h-5 text-primary" /> Tendência Mensal de Despesas
            </CardTitle>
            <CardDescription>Evolução das despesas ao longo dos meses</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer config={{ despesaTotal: { label: 'Despesa Total', color: 'var(--primary)' } }}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dadosTendencia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="despesaTotal" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela detalhada de desafios/despesas */}
      <Card className="p-4 gap-2">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSignIcon className="w-5 h-5 text-primary" /> Top 5 Desafios Mais Caros
          </CardTitle>
          <CardDescription>Desafios com maior despesa adicional registrada</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Despesa</TableHead>
                <TableHead>Risco</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {desafiosMaisCaros.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-foreground">{d.descricao}</TableCell>
                  <TableCell className="text-foreground font-bold">R$ {d.despesa.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${d.risco === 'critico' ? 'bg-red-100 text-red-800' : d.risco === 'alto' ? 'bg-orange-100 text-orange-800' : d.risco === 'medio' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{d.risco}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights & Recomendações */}
      <Card className="p-6 flex flex-col gap-2 border bg-card/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <LightbulbIcon className="w-5 h-5 text-primary" />
          <span className="text-foreground font-medium">Insights & Recomendações</span>
        </div>
        <ul className="text-muted-foreground text-sm list-disc pl-4">
          {insights.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      </Card>

      {/* Próximas Ações */}
      <Card className="p-6 flex flex-col gap-4">
        <CardTitle className="text-base mb-2 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-green-600" /> Próximas Ações
        </CardTitle>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <TrendingUpIcon className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">Planejar investimentos</div>
              <div className="text-sm text-muted-foreground">Estratégias para novos projetos</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <AlertTriangleIcon className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-medium">Otimizar recursos</div>
              <div className="text-sm text-muted-foreground">Reduzir custos em desafios críticos</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <DollarSignIcon className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Revisar orçamentos</div>
              <div className="text-sm text-muted-foreground">Analisar custos das próximas expedições</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 