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

interface Expedicao {
  id: number
  nome: string
  data_inicio: string
  data_fim: string
  equipe_id: number
  Localizacao_id: number
  Ruina_id: number
  status: string
}

interface Equipe {
  id: number
  nome: string
  lider_id: number
}

interface Localizacao {
  id: number
  pais: string
  latitude: number
  longitude: number
}

interface Ruina {
  id: number
  nome: string
  descricao: string
}

export default function EditExpedicaoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expedicao, setExpedicao] = useState<Expedicao | null>(null)
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([])
  const [ruinas, setRuinas] = useState<Ruina[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expedicoesData, equipesData, localizacoesData, ruinasData] = await Promise.all([
          ApiService.getExpedicoes(),
          ApiService.getEquipes(),
          ApiService.getLocalizacoes(),
          ApiService.getRuinas(),
        ])

        const expedicaoEncontrada = expedicoesData.find(e => e.id === parseInt(params.id))
        if (!expedicaoEncontrada) {
          router.push("/expedition")
          return
        }

        setExpedicao(expedicaoEncontrada)
        setEquipes(equipesData)
        setLocalizacoes(localizacoesData)
        setRuinas(ruinasData)
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
    if (!expedicao) return

    setSaving(true)
    try {
      // Aqui você implementaria a lógica para salvar as alterações
      console.log("Salvando expedição:", expedicao)
      
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      router.push("/expedition")
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

  if (!expedicao) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Expedição não encontrada</h1>
          <p className="text-muted-foreground mb-4">
            A expedição que você está procurando não foi encontrada.
          </p>
          <Button onClick={() => router.push("/expedition")}>
            Voltar para Expedições
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
          onClick={() => router.push("/expedition")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Expedição</h1>
          <p className="text-muted-foreground">
            Atualize as informações da expedição &quot;{expedicao.nome}&quot;
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Expedição</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Expedição</Label>
                  <Input 
                    id="nome" 
                  value={expedicao.nome}
                  onChange={(e) => setExpedicao({ ...expedicao, nome: e.target.value })}
                  required
                />
                  </div>
                  
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={expedicao.status}
                  onValueChange={(value) => setExpedicao({ ...expedicao, status: value })}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Em planejamento">Em planejamento</SelectItem>
                      <SelectItem value="Em andamento">Em andamento</SelectItem>
                      <SelectItem value="Concluída">Concluída</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={expedicao.data_inicio}
                  onChange={(e) => setExpedicao({ ...expedicao, data_inicio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={expedicao.data_fim}
                  onChange={(e) => setExpedicao({ ...expedicao, data_fim: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipe">Equipe</Label>
                <Select
                  value={expedicao.equipe_id.toString()}
                  onValueChange={(value) => setExpedicao({ ...expedicao, equipe_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipes.map((equipe) => (
                      <SelectItem key={equipe.id} value={equipe.id.toString()}>
                        {equipe.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Select
                  value={expedicao.Localizacao_id.toString()}
                  onValueChange={(value) => setExpedicao({ ...expedicao, Localizacao_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma localização" />
                  </SelectTrigger>
                  <SelectContent>
                    {localizacoes.map((localizacao) => (
                      <SelectItem key={localizacao.id} value={localizacao.id.toString()}>
                        {localizacao.pais}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruina">Ruína</Label>
                <Select
                  value={expedicao.Ruina_id.toString()}
                  onValueChange={(value) => setExpedicao({ ...expedicao, Ruina_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma ruína" />
                  </SelectTrigger>
                  <SelectContent>
                    {ruinas.map((ruina) => (
                      <SelectItem key={ruina.id} value={ruina.id.toString()}>
                        {ruina.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                  </div>
          </div>

            <div className="flex justify-end gap-4 pt-4">
            <Button
                type="button"
              variant="outline"
                onClick={() => router.push("/expedition")}
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