"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiService } from "@/lib/api"
import { ArrowLeftIcon, SaveIcon } from "lucide-react"

interface Artefato {
  id: number
  nome: string
  material: string
  idade_em_anos: number
  Expedicao_id: number
  valor_estimado: number
  Estado_Conservacao_id: number
  data_encontrado: string
  Importancia_Historica_id: number
}

interface Expedicao {
  id: number
  nome: string
}

interface EstadoConservacao {
  id: number
  nivel: string
}

interface ImportanciaHistorica {
  id: number
  descricao: string
}

export default function EditArtefatoPage({ params }: any) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [artefato, setArtefato] = useState<Artefato | null>(null)
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([])
  const [estadosConservacao, setEstadosConservacao] = useState<EstadoConservacao[]>([])
  const [importanciasHistoricas, setImportanciasHistoricas] = useState<ImportanciaHistorica[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artefatosData, expedicoesData, estadosData, importanciasData] = await Promise.all([
          ApiService.getArtefatos(),
          ApiService.getExpedicoes(),
          ApiService.getEstadosConservacao(),
          ApiService.getImportanciasHistoricas(),
        ])

        const artefatoEncontrado = artefatosData.find(a => a.id === parseInt(params.id))
        if (!artefatoEncontrado) {
          router.push("/artifacts")
          return
        }

        setArtefato(artefatoEncontrado)
        setExpedicoes(expedicoesData)
        setEstadosConservacao(estadosData)
        setImportanciasHistoricas(importanciasData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!artefato) return

    setSaving(true)
    try {
      // Aqui você implementaria a lógica para salvar as alterações
      console.log("Salvando artefato:", artefato)
      
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      router.push("/artifacts")
    } catch (error) {
      console.error("Erro ao salvar:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!artefato) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Artefato não encontrado</h1>
          <p className="text-muted-foreground mb-4">
            O artefato que você está procurando não foi encontrado.
          </p>
          <Button onClick={() => router.push("/artifacts")}>
            Voltar para Artefatos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/artifacts")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Artefato</h1>
          <p className="text-muted-foreground">
            Atualize as informações do artefato &quot;{artefato.nome}&quot;
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Artefato</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Artefato</Label>
                <Input
                  id="nome"
                  value={artefato.nome}
                  onChange={(e) => setArtefato({ ...artefato, nome: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={artefato.material}
                  onChange={(e) => setArtefato({ ...artefato, material: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idade">Idade (anos)</Label>
                <Input
                  id="idade"
                  type="number"
                  value={artefato.idade_em_anos}
                  onChange={(e) => setArtefato({ ...artefato, idade_em_anos: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor Estimado (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  value={artefato.valor_estimado}
                  onChange={(e) => setArtefato({ ...artefato, valor_estimado: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expedicao">Expedição</Label>
                <Select
                  value={artefato.Expedicao_id.toString()}
                  onValueChange={(value) => setArtefato({ ...artefato, Expedicao_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma expedição" />
                  </SelectTrigger>
                  <SelectContent>
                    {expedicoes.map((expedicao) => (
                      <SelectItem key={expedicao.id} value={expedicao.id.toString()}>
                        {expedicao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado de Conservação</Label>
                <Select
                  value={artefato.Estado_Conservacao_id.toString()}
                  onValueChange={(value) => setArtefato({ ...artefato, Estado_Conservacao_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosConservacao.map((estado) => (
                      <SelectItem key={estado.id} value={estado.id.toString()}>
                        {estado.nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="importancia">Importância Histórica</Label>
                <Select
                  value={artefato.Importancia_Historica_id.toString()}
                  onValueChange={(value) => setArtefato({ ...artefato, Importancia_Historica_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a importância" />
                  </SelectTrigger>
                  <SelectContent>
                    {importanciasHistoricas.map((importancia) => (
                      <SelectItem key={importancia.id} value={importancia.id.toString()}>
                        {importancia.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data de Descoberta</Label>
                <Input
                  id="data"
                  type="date"
                  value={artefato.data_encontrado}
                  onChange={(e) => setArtefato({ ...artefato, data_encontrado: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/artifacts")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                <SaveIcon className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 