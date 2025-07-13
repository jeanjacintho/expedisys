"use client";

import { useEffect, useState } from "react";
import { ApiService, Pessoa, Ruina, Especialidade } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Stepper, StepperIndicator, StepperItem, StepperSeparator, StepperTrigger } from "@/components/ui/stepper";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";

export default function NewExpedition() {
  const [step, setStep] = useState(1);
  const [ruinas, setRuinas] = useState<Ruina[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [form, setForm] = useState({
    nome: "",
    data_inicio: undefined as Date | undefined,
    data_fim: undefined as Date | undefined,
    detalhes: "",
    ruina_id: "",
    equipe: [] as number[],
  });
  const [openRuina, setOpenRuina] = useState(false);
  const [openEquipe, setOpenEquipe] = useState(false);
  const [liderId, setLiderId] = useState<number | null>(null);

  useEffect(() => {
    ApiService.getRuinas().then(setRuinas);
    ApiService.getPessoas().then(setPessoas);
    ApiService.getEspecialidades().then(setEspecialidades);
  }, []);

    return (
    <div className="flex min-h-[60vh] items-center justify-center gap-4">
      <Card className="w-full max-w-xl p-0 gap-0">
        <CardHeader className="border-b border-border p-6">
          <h1 className="text-lg font-semibold text-foreground">Iniciar nova expedição</h1>
          <p className="text-sm text-muted-foreground">Planeje sua próxima aventura arqueológica</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mx-auto max-w-xl space-y-8">
            <div className="text-sm font-medium text-muted-foreground text-center">
              {step === 1 && "Etapa 1 de 2: Dados da Expedição"}
              {step === 2 && "Etapa 2 de 2: Seleção da Equipe"}
            </div>
            <Stepper value={step} className="">
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
              <form className="space-y-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nome">Nome da expedição</Label>
                  <Input id="nome" value={form.nome} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="detalhes">Detalhes da expedição</Label>
                  <textarea
                    id="detalhes"
                    value={form.detalhes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, detalhes: e.target.value }))}
                    className="w-full min-h-[80px] rounded-md border border-input input-sidebar-bg px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
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
                  {/* Combobox de ruína */}
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
              </form>
            )}
            {step === 2 && (
              <form className="space-y-6">
                <Label>Selecione as pessoas para a equipe</Label>
                {/* Combobox multi-select para equipe */}
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
                {/* Tabela de equipe selecionada */}
                {form.equipe.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Foto</th>
                          <th className="px-4 py-2 text-left font-semibold">Nome</th>
                          <th className="px-4 py-2 text-left font-semibold">Especialidade</th>
                          <th className="px-4 py-2 text-left font-semibold">Líder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.equipe.map(id => {
                          const pessoa = pessoas.find(p => p.id === id);
                          const especialidade = especialidades.find(e => e.id === pessoa?.especialidade_id)?.titulo || "-";
                          return pessoa ? (
                            <tr key={pessoa.id} className="border-t">
                              <td className="px-4 py-2">
                                <Avatar>
                                  <AvatarImage src={pessoa.avatar} alt={pessoa.nome} />
                                  <AvatarFallback>{pessoa.nome[0]}</AvatarFallback>
                                </Avatar>
                              </td>
                              <td className="px-4 py-2">{pessoa.nome}</td>
                              <td className="px-4 py-2">{especialidade}</td>
                              <td className="px-4 py-2">
                                <Toggle
                                  pressed={liderId === pessoa.id}
                                  onPressedChange={on => setLiderId(on ? pessoa.id : null)}
                                  variant={liderId === pessoa.id ? "default" : "outline"}
                                  className={liderId === pessoa.id ? "bg-primary text-primary-foreground" : ""}
                                >
                                  {liderId === pessoa.id ? "Líder" : "Tornar líder"}
                                </Toggle>
                              </td>
                            </tr>
                          ) : null;
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </form>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4 justify-end p-6">
          {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Voltar</Button>}
          {step < 2 && <Button onClick={() => setStep(s => s + 1)}>Próximo passo</Button>}
          {step === 2 && <Button>Concluir</Button>}
        </CardFooter>
        </Card>
    </div>
  );
}