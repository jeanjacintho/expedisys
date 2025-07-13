"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ApiService, Pessoa, Ruina, Especialidade } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Stepper, StepperIndicator, StepperItem, StepperSeparator, StepperTrigger } from "@/components/ui/stepper";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Expedicao {
  id: number;
  nome: string;
  data_inicio: string;
  data_fim: string;
  equipe_id: number;
  Localizacao_id: number;
  Ruina_id: number;
  status: string;
  descricao?: string;
}

export default function EditExpedition() {
  const router = useRouter();
  const params = useParams();
  const expedicaoId = params.id as string;
  
  const [step, setStep] = useState(1);
  const [ruinas, setRuinas] = useState<Ruina[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expedicao, setExpedicao] = useState<Expedicao | null>(null);
  
  const [form, setForm] = useState({
    nome: "",
    data_inicio: undefined as Date | undefined,
    data_fim: undefined as Date | undefined,
    detalhes: "",
    ruina_id: "",
    equipe: [] as number[],
    status: "Em planejamento"
  });
  
  const [openRuina, setOpenRuina] = useState(false);
  const [openEquipe, setOpenEquipe] = useState(false);
  const [liderId, setLiderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ruinasData, pessoasData, especialidadesData] = await Promise.all([
          ApiService.getRuinas(),
          ApiService.getPessoas(),
          ApiService.getEspecialidades()
        ]);
        
        setRuinas(ruinasData);
        setPessoas(pessoasData);
        setEspecialidades(especialidadesData);
        
        // Buscar dados da expedição
        const expedicaoResponse = await fetch(`/api/expedicoes/${expedicaoId}`);
        if (!expedicaoResponse.ok) {
          throw new Error('Expedição não encontrada');
        }
        const expedicaoData = await expedicaoResponse.json();
        
        if (expedicaoData) {
          setExpedicao(expedicaoData);
          setForm({
            nome: expedicaoData.nome,
            data_inicio: new Date(expedicaoData.data_inicio),
            data_fim: new Date(expedicaoData.data_fim),
            detalhes: expedicaoData.descricao || "",
            ruina_id: String(expedicaoData.Ruina_id),
            equipe: [expedicaoData.equipe_id],
            status: expedicaoData.status
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [expedicaoId]);

  const handleSave = async () => {
    if (!form.nome || !form.data_inicio || !form.data_fim || !form.ruina_id || form.equipe.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      // Aqui você implementaria a lógica para salvar as alterações
      // Por enquanto, apenas simular o salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Expedição atualizada com sucesso!');
      router.push('/expedition');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar expedição');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <span>Carregando expedição...</span>
        </div>
      </div>
    );
  }

  if (!expedicao) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Expedição não encontrada</h2>
          <p className="text-muted-foreground mb-4">A expedição que você está procurando não existe.</p>
          <Button onClick={() => router.push('/expedition')}>
            Voltar para expedições
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center gap-4">
      <Card className="w-full max-w-xl p-0 gap-0">
        <CardHeader className="border-b border-border p-6">
          <h1 className="text-xl font-medium">Editar expedição</h1>
          <p className="text-sm text-muted-foreground">Modifique os dados da expedição "{expedicao.nome}"</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mx-auto max-w-xl space-y-8">
            <div className="mb-2 text-sm font-medium text-muted-foreground text-center">
              {step === 1 && "Etapa 1 de 2: Dados da Expedição"}
              {step === 2 && "Etapa 2 de 2: Seleção da Equipe"}
            </div>
            <Stepper value={step} className="mb-6">
              {[1, 2].map((s) => (
                <StepperItem key={s} step={s} className="not-last:flex-1">
                  <StepperTrigger onClick={() => setStep(s)}>
                    <StepperIndicator asChild>{s}</StepperIndicator>
                  </StepperTrigger>
                  {s < 2 && <StepperSeparator />}
                </StepperItem>
              ))}
            </Stepper>
            {step === 1 && (
              <form className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nome">Nome da expedição</Label>
                  <Input 
                    id="nome" 
                    value={form.nome} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, nome: e.target.value }))} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="detalhes">Detalhes da expedição</Label>
                  <textarea
                    id="detalhes"
                    value={form.detalhes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, detalhes: e.target.value }))}
                    className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-2">
                    <Label>Data de início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.data_inicio ? (
                            format(form.data_inicio, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            "Data de início"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.data_inicio}
                          onSelect={date => setForm(f => ({ ...f, data_inicio: date || undefined }))}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    <Label>Data de fim</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.data_fim ? (
                            format(form.data_fim, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            "Data de fim"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.data_fim}
                          onSelect={date => setForm(f => ({ ...f, data_fim: date || undefined }))}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ruina">Ruína</Label>
                  <Popover open={openRuina} onOpenChange={setOpenRuina}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openRuina}
                        className="w-full h-9 px-3 py-1 text-base justify-between"
                      >
                        {form.ruina_id
                          ? ruinas.find(r => String(r.id) === form.ruina_id)?.nome
                          : "Selecione uma ruína"}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full min-w-[250px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar ruína..." />
                        <CommandList>
                          <CommandEmpty>Nenhuma ruína encontrada.</CommandEmpty>
                          <CommandGroup>
                            {ruinas.map(r => (
                              <CommandItem
                                key={r.id}
                                value={r.nome}
                                onSelect={() => {
                                  setForm(f => ({ ...f, ruina_id: String(r.id) }));
                                  setOpenRuina(false);
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    form.ruina_id === String(r.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {r.nome}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm(f => ({ ...f, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Em planejamento">Em planejamento</SelectItem>
                      <SelectItem value="Em andamento">Em andamento</SelectItem>
                      <SelectItem value="Concluída">Concluída</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            )}
            {step === 2 && (
              <form className="space-y-4">
                <Label>Selecione as pessoas para a equipe</Label>
                <Popover open={openEquipe} onOpenChange={setOpenEquipe}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openEquipe}
                      className="w-full h-9 px-3 py-1 text-base justify-between overflow-hidden"
                      title={form.equipe.length > 0 ? pessoas.filter(p => form.equipe.includes(p.id)).map(p => p.nome).join(", ") : undefined}
                    >
                      <span className="truncate block max-w-[70%] align-middle">
                        {form.equipe.length > 0
                          ? pessoas.filter(p => form.equipe.includes(p.id)).map(p => p.nome).join(", ")
                          : "Selecione as pessoas da equipe"}
                      </span>
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full min-w-[250px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar pessoa..." />
                      <CommandList>
                        <CommandEmpty>Nenhuma pessoa encontrada.</CommandEmpty>
                        <CommandGroup>
                          {pessoas.map(p => (
                            <CommandItem
                              key={p.id}
                              value={p.nome}
                              onSelect={() => {
                                setForm(f => ({
                                  ...f,
                                  equipe: f.equipe.includes(p.id)
                                    ? f.equipe.filter(id => id !== p.id)
                                    : [...f.equipe, p.id]
                                }));
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.equipe.includes(p.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {p.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {form.equipe.length > 0 && (
                  <div className="mt-4 border rounded-md overflow-hidden">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Foto</th>
                          <th className="px-4 py-2 text-left font-semibold">Nome</th>
                          <th className="px-4 py-2 text-left font-semibold">Especialidade</th>
                          <th className="px-4 py-2 text-left font-semibold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pessoas
                          .filter(p => form.equipe.includes(p.id))
                          .map(p => (
                            <tr key={p.id} className="border-t">
                              <td className="px-4 py-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={p.avatar} alt={p.nome} />
                                  <AvatarFallback>{p.nome.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </td>
                              <td className="px-4 py-2">{p.nome}</td>
                              <td className="px-4 py-2">
                                {especialidades.find(e => e.id === p.especialidade_id)?.titulo || "N/A"}
                              </td>
                              <td className="px-4 py-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setForm(f => ({
                                      ...f,
                                      equipe: f.equipe.filter(id => id !== p.id)
                                    }));
                                  }}
                                >
                                  Remover
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </form>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-border p-6">
          <div className="flex w-full justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/expedition')}
            >
              Cancelar
            </Button>
            <div className="flex gap-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Anterior
                </Button>
              )}
              {step < 2 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!form.nome || !form.data_inicio || !form.data_fim || !form.ruina_id}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving || form.equipe.length === 0}
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
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 