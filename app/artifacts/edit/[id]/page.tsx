"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ApiService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2Icon, ArrowLeftIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Artefato {
  id: number;
  nome: string;
  material: string;
  idade_em_anos: number;
  Expedicao_id: number;
  valor_estimado: number;
  Estado_Conservacao_id: number;
  data_encontrado: string;
  Importancia_Historica_id: number;
}

interface EstadoConservacao {
  id: number;
  nivel: string;
}

interface ImportanciaHistorica {
  id: number;
  descricao: string;
}

interface Expedicao {
  id: number;
  nome: string;
  status: string;
}

export default function EditArtifact() {
  const router = useRouter();
  const params = useParams();
  const artefatoId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [artefato, setArtefato] = useState<Artefato | null>(null);
  const [estadosConservacao, setEstadosConservacao] = useState<EstadoConservacao[]>([]);
  const [importanciasHistoricas, setImportanciasHistoricas] = useState<ImportanciaHistorica[]>([]);
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
  
  const [form, setForm] = useState({
    nome: "",
    material: "",
    idade_em_anos: 0,
    valor_estimado: 0,
    estado_conservacao_id: "",
    importancia_historica_id: "",
    expedicao_id: "",
    data_encontrado: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [estadosData, importanciasData, expedicoesData] = await Promise.all([
          ApiService.getEstadosConservacao(),
          ApiService.getImportanciasHistoricas(),
          ApiService.getExpedicoes()
        ]);
        
        setEstadosConservacao(estadosData);
        setImportanciasHistoricas(importanciasData);
        setExpedicoes(expedicoesData);
        
        // Buscar dados do artefato
        const artefatoResponse = await fetch(`/api/artefatos/${artefatoId}`);
        if (!artefatoResponse.ok) {
          throw new Error('Artefato não encontrado');
        }
        const artefatoData = await artefatoResponse.json();
        
        if (artefatoData) {
          setArtefato(artefatoData);
          setForm({
            nome: artefatoData.nome,
            material: artefatoData.material,
            idade_em_anos: artefatoData.idade_em_anos,
            valor_estimado: artefatoData.valor_estimado,
            estado_conservacao_id: String(artefatoData.Estado_Conservacao_id),
            importancia_historica_id: String(artefatoData.Importancia_Historica_id),
            expedicao_id: String(artefatoData.Expedicao_id),
            data_encontrado: artefatoData.data_encontrado
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artefatoId]);

  const handleSave = async () => {
    if (!form.nome || !form.material || form.idade_em_anos <= 0 || form.valor_estimado <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/artefatos/${artefatoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: form.nome,
          material: form.material,
          idade_em_anos: form.idade_em_anos,
          valor_estimado: form.valor_estimado,
          Estado_Conservacao_id: parseInt(form.estado_conservacao_id),
          Importancia_Historica_id: parseInt(form.importancia_historica_id),
          Expedicao_id: parseInt(form.expedicao_id),
          data_encontrado: form.data_encontrado
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar artefato');
      }

      const result = await response.json();
      alert('Artefato atualizado com sucesso!');
      router.push('/artifacts');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar artefato');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <span>Carregando artefato...</span>
        </div>
      </div>
    );
  }

  if (!artefato) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Artefato não encontrado</h2>
          <p className="text-muted-foreground mb-4">O artefato que você está procurando não existe.</p>
          <Button onClick={() => router.push('/artifacts')}>
            Voltar para artefatos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center gap-4">
      <Card className="w-full max-w-xl p-0 gap-0">
        <CardHeader className="border-b border-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/artifacts')}
              className="p-0 h-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-medium">Editar artefato</h1>
          </div>
          <p className="text-sm text-muted-foreground">Modifique os dados do artefato "{artefato.nome}"</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mx-auto max-w-xl space-y-6">
            <form className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nome">Nome do artefato</Label>
                <Input 
                  id="nome" 
                  value={form.nome} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, nome: e.target.value }))} 
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="material">Material</Label>
                <Input 
                  id="material" 
                  value={form.material} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, material: e.target.value }))} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="idade">Idade (anos)</Label>
                  <Input 
                    id="idade" 
                    type="number"
                    value={form.idade_em_anos} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, idade_em_anos: parseInt(e.target.value) || 0 }))} 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="valor">Valor estimado (R$)</Label>
                  <Input 
                    id="valor" 
                    type="number"
                    value={form.valor_estimado} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, valor_estimado: parseFloat(e.target.value) || 0 }))} 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="data_encontrado">Data encontrado</Label>
                <Input 
                  id="data_encontrado" 
                  type="date"
                  value={form.data_encontrado} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, data_encontrado: e.target.value }))} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Estado de conservação</Label>
                  <Select value={form.estado_conservacao_id} onValueChange={(value) => setForm(f => ({ ...f, estado_conservacao_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosConservacao.map((estado) => (
                        <SelectItem key={estado.id} value={String(estado.id)}>
                          {estado.nivel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Importância histórica</Label>
                  <Select value={form.importancia_historica_id} onValueChange={(value) => setForm(f => ({ ...f, importancia_historica_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a importância" />
                    </SelectTrigger>
                    <SelectContent>
                      {importanciasHistoricas.map((importancia) => (
                        <SelectItem key={importancia.id} value={String(importancia.id)}>
                          {importancia.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Expedição relacionada</Label>
                <Select value={form.expedicao_id} onValueChange={(value) => setForm(f => ({ ...f, expedicao_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a expedição" />
                  </SelectTrigger>
                  <SelectContent>
                    {expedicoes.map((expedicao) => (
                      <SelectItem key={expedicao.id} value={String(expedicao.id)}>
                        {expedicao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border p-6">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => router.push('/artifacts')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 