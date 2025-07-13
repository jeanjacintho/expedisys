import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api';

interface Desafio {
  desafio: string;
  expedicao: string;
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  data_inicio: string;
  localizacao?: string;
  equipe?: string;
}

export function useRecentChallenges() {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesafios = async () => {
      try {
        setLoading(true);
        
        // Buscar todos os dados necessários
        const [expedicoesData, equipes, localizacoes, ruinas, desafiosHasExpedicao, desafios] = await Promise.all([
          ApiService.getExpedicoes(),
          ApiService.getEquipes(),
          ApiService.getLocalizacoes(),
          ApiService.getRuinas(),
          ApiService.getDesafioHasExpedicao(),
          ApiService.getDesafios(),
        ]);

        // Adicionar detalhes às expedições
        const expedicoesComDetalhes = expedicoesData.map(expedicao => {
          const equipe = equipes.find(e => e.id === expedicao.equipe_id);
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
        const expedicoesAtivas = expedicoesComDetalhes.filter(expedicao => {
          const status = expedicao.status?.toLowerCase() || '';
          return status.includes('andamento') || status.includes('em andamento');
        });

        // Obter IDs das expedições ativas
        const idsExpedicoesAtivas = expedicoesAtivas.map(exp => exp.id);

        // Buscar desafios das expedições ativas
        const desafiosRecentes = desafiosHasExpedicao
          .filter(dh => idsExpedicoesAtivas.includes(Number(dh.Expedicao_id)))
          .map(dh => {
            const desafioObj = desafios.find(d => d.id === Number(dh.Desafio_id));
            const expedicaoObj = expedicoesAtivas.find(e => e.id === Number(dh.Expedicao_id));
            
            return desafioObj && expedicaoObj
              ? {
                  desafio: desafioObj.descricao,
                  expedicao: expedicaoObj.nome,
                  nivel_risco: desafioObj.nivel_risco,
                  data_inicio: expedicaoObj.data_inicio,
                  localizacao: expedicaoObj.localizacao?.pais,
                  equipe: expedicaoObj.equipe?.nome
                }
              : null;
          })
          .filter(Boolean) as Desafio[];

        // Ordenar por data de início da expedição (mais recentes primeiro)
        desafiosRecentes.sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());

        // Retornar todos os desafios (a paginação será feita no componente)
        setDesafios(desafiosRecentes);

      } catch (error) {
        console.error('Erro ao carregar desafios:', error);
        setDesafios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDesafios();
  }, []);

  return { desafios, loading };
} 