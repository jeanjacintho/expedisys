"use client";

import { Card } from "@/components/ui/card";
import { ArtifactsChart } from "@/components/artifacts-chart";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api";
import { MapPinnedIcon, ShovelIcon, UsersRoundIcon, TentIcon } from "lucide-react";
import { ExpeditionsTable } from "./(components)/expeditions-table";
import { LastArtefactsFound } from "@/app/(home)/(components)/last-artifacts-found";
import { RecentChallenges } from "@/components/recent-challenges";
import { useRecentChallenges } from "@/hooks/use-recent-challenges";
import { MapSkeleton } from "@/components/map-skeleton";
import { ExpeditionsTableSkeleton } from "@/components/expeditions-table-skeleton";
import { PageSkeleton } from "@/components/page-skeleton";

const LazyMap = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface Expedicao {
  id: number;
  nome: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  localizacao?: {
    id: number;
    pais: string;
    latitude: number;
    longitude: number;
  };
  ruina?: {
    id: number;
    nome: string;
  };
  equipe?: {
    id: number;
    nome: string;
    pessoas?: Array<{
      id: number;
      nome: string;
      avatar?: string;
    }>;
  };
}

interface Artefato {
  id: number;
  nome: string;
  Expedicao_id: number;
  valor_estimado: number;
  data_encontrado: string;
}

export default function HomePage() {
  const [expedicoesAtivas, setExpedicoesAtivas] = useState<Expedicao[]>([]);
  const [artefatos, setArtefatos] = useState<Artefato[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExpedicoes: 0,
    totalArtefatos: 0,
    totalEquipes: 0,
    totalSitios: 0,
    totalPaises: 0
  });

  // Usar o hook para buscar desafios recentes
  const { desafios: desafiosAtivos, loading: desafiosLoading } = useRecentChallenges();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expedicoesData, equipes, localizacoes, ruinas, artefatosData, pessoas, equipeHasPessoa] = await Promise.all([
          ApiService.getExpedicoes(),
          ApiService.getEquipes(),
          ApiService.getLocalizacoes(),
          ApiService.getRuinas(),
          ApiService.getArtefatos(),
          ApiService.getPessoas(),
          ApiService.getEquipeHasPessoa(),
        ]);

        // Relacionar pessoas com equipes usando a tabela de relacionamento
        const equipesComPessoas = equipes.map(equipe => ({
          ...equipe,
          pessoas: pessoas.filter(pessoa => 
            equipeHasPessoa.some(rel => rel.Equipe_id === equipe.id && rel.Pessoa_id === pessoa.id)
          )
        }));

        const expedicoesComDetalhes = expedicoesData.map(expedicao => {
          const equipe = equipesComPessoas.find(e => e.id === expedicao.equipe_id);
          const localizacao = localizacoes.find(l => l.id === expedicao.Localizacao_id);
          const ruina = ruinas.find(r => r.id === expedicao.Ruina_id);

          return {
            ...expedicao,
            equipe,
            localizacao,
            ruina
          };
        });

        // Filtrar apenas expedições em andamento
        const ativas = expedicoesComDetalhes.filter(expedicao => {
          const status = expedicao.status?.toLowerCase() || '';
          return status.includes('andamento') || status.includes('em andamento');
        });

        setExpedicoesAtivas(ativas);
        setArtefatos(artefatosData);

        // Calcular estatísticas
        const idsExpedicoesAtivas = ativas.map(exp => exp.id);
        const artefatosEncontrados = artefatosData.filter(artefato => 
          idsExpedicoesAtivas.includes(artefato.Expedicao_id)
        );
        
        const equipesUnicas = new Set(ativas.map(exp => exp.equipe?.id).filter(Boolean));
        const sitiosUnicos = new Set(ativas.map(exp => exp.ruina?.id).filter(Boolean));
        const paisesUnicos = new Set(ativas.map(exp => exp.localizacao?.pais).filter(Boolean));

        setStats({
          totalExpedicoes: ativas.length,
          totalArtefatos: artefatosEncontrados.length,
          totalEquipes: equipesUnicas.size,
          totalSitios: sitiosUnicos.size,
          totalPaises: paisesUnicos.size
        });

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <PageSkeleton statsCount={4} filtersCount={0} tableRows={1} titleWidth="w-80" />;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="p-4 gap-2">
          <div className="text-sm text-muted-foreground flex justify-between">Expedições Ativas
            <MapPinnedIcon />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalExpedicoes}
          </div>
          <div className="text-xs text-muted-foreground">
            {`${stats.totalExpedicoes} expedições em andamento`}
          </div>
        </Card>
        <Card className="p-4 gap-2">
          <div className="text-sm text-muted-foreground flex justify-between">Artefatos Encontrados<ShovelIcon /></div>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalArtefatos}
          </div>
          <div className="text-xs text-muted-foreground">
            {`${stats.totalArtefatos} artefatos descobertos`}
          </div>
        </Card>
        <Card className="p-4 gap-2">
          <div className="text-sm text-muted-foreground flex justify-between">Equipes Ativas<UsersRoundIcon /></div>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalEquipes}
          </div>
          <div className="text-xs text-muted-foreground">
            {`${stats.totalEquipes} equipes trabalhando`}
          </div>
        </Card>
        <Card className="p-4 gap-2">
          <div className="text-sm text-muted-foreground flex justify-between">Sítios Arqueológicos<TentIcon /></div>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalSitios}
          </div>
          <div className="text-xs text-muted-foreground">
            {`${stats.totalSitios} sítios sendo escavados`}
          </div>
        </Card>
      </div>

        {/* Main Content Grid - Challenges and Map */}
        <div className="grid grid-cols-3 gap-4">
          {/* Challenges - Takes 1 column */}
          <div className="col-span-1">
            <RecentChallenges desafios={desafiosAtivos} loading={desafiosLoading} />
          </div>

          {/* Map - Takes 2 columns */}
          <div className="col-span-2">
            <Card className="p-0 flex flex-col w-full h-full">
              <LazyMap key={`map-${expedicoesAtivas.length}`} expedicoes={expedicoesAtivas} />
            </Card>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <ArtifactsChart
              expedicoesAtivas={expedicoesAtivas}
              artefatos={artefatos}
              loading={loading}
            />
          </div>
                      <div className="col-span-1">
              <LastArtefactsFound 
                expedicoesAtivas={expedicoesAtivas}
                artefatos={artefatos}
                loading={loading}
              />
            </div>
        </div>
        

        {/* Bottom Section - Expeditions Table */}
        {loading ? (
          <ExpeditionsTableSkeleton />
        ) : (
          <Card className="p-4 w-full overflow-x-auto">
            <h3 className="text-lg font-semibold text-foreground">Expedições Ativas</h3>
            <ExpeditionsTable />
          </Card>
        )}
    </div>
  );
}
