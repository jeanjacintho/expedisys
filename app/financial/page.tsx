"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUpIcon, 
  UsersIcon, 
  DollarSignIcon,
  AlertCircleIcon,
  CheckCircleIcon
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

  const desafiosPorRisco = desafioHasExpedicao.reduce((acc, d) => {
    const desafio = desafios.find(des => des.id === d.Desafio_id)
    const risco = desafio?.nivel_risco || 'baixo'
    acc[risco] = (acc[risco] || 0) + d.despesa_adicional
    return acc
  }, {} as Record<string, number>)

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
    <div className="flex flex-col gap-4 md:gap-4">

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="p-4 gap-2">
          <div className="text-sm text-foreground flex justify-between font-medium">
            Total de Despesas
            <DollarSignIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            R$ {totalDespesas.toLocaleString()}
      </div>
          <div className="text-xs text-foreground">
              Total gasto com desafios
          </div>
        </Card>

        <Card className="p-4 gap-2">
          <div className="text-sm text-foreground flex justify-between font-medium">
            Desafios Ativos
            <AlertCircleIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {totalDesafios}
          </div>
          <div className="text-xs text-foreground">
              Desafios enfrentados
          </div>
        </Card>

        <Card className="p-4 gap-2">
          <div className="text-sm text-foreground flex justify-between font-medium">
            Média por Desafio
            <TrendingUpIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            R$ {mediaDespesaPorDesafio.toLocaleString()}
          </div>
          <div className="text-xs text-foreground">
              Custo médio por desafio
          </div>
        </Card>

        <Card className="p-4 gap-2">
          <div className="text-sm text-foreground flex justify-between font-medium">
            Expedições Ativas
            <UsersIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
              {expedicoes.filter(e => e.status === "Em andamento").length}
            </div>
          <div className="text-xs text-foreground">
              Expedições em andamento
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Nível de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(['baixo', 'medio', 'alto', 'critico'] as const).map((risco) => (
                <div key={risco} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {risco}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      R$ {(desafiosPorRisco[risco] || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((desafiosPorRisco[risco] || 0) / totalDespesas * 100).toFixed(1)}% do total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Revisar orçamentos</div>
                  <div className="text-sm text-muted-foreground">
                    Analisar custos das próximas expedições
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <AlertCircleIcon className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium">Otimizar recursos</div>
                  <div className="text-sm text-muted-foreground">
                    Reduzir custos em desafios críticos
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Planejar investimentos</div>
                  <div className="text-sm text-muted-foreground">
                    Estratégias para novos projetos
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 