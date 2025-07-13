import dbData from '@/data/db.json'

export interface Especialidade {
  id: number
  titulo: string
}

export interface Localizacao {
  id: number
  pais: string
  latitude: number
  longitude: number
}

export interface Ruina {
  id: number
  nome: string
  descricao: string
}

export interface EstadoConservacao {
  id: number
  nivel: string
}

export interface ImportanciaHistorica {
  id: number
  descricao: string
}

export interface PeriodoHistorico {
  id: number
  nome: string
  ano_inicio: number
  ano_fim: number
}

export interface Desafio {
  id: number
  descricao: string
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico'
}

export interface Instituicao {
  id: number
  nome: string
  cidade: string
  pais: string
}

export interface Pessoa {
  id: number
  nome: string
  documento: string
  telefone: string
  data_nascimento: string
  email: string
  especialidade_id: number
  avatar: string
}

export interface Equipe {
  id: number
  nome: string
  lider_id: number
}

export interface Expedicao {
  id: number
  nome: string
  data_inicio: string
  data_fim: string
  equipe_id: number
  Localizacao_id: number
  Ruina_id: number
  status: string
}

export interface Artefato {
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

export interface ContatoEmergencia {
  id: number
  nome: string
  telefone: string
  email: string
  Pessoa_id: number
}

export interface Financiamento {
  id: number
  investimento: number
  Instituicao_id: number
  Expedicao_id: number
}

export interface DesafioHasExpedicao {
  Desafio_id: number
  Expedicao_id: number
  despesa_adicional: number
}

export interface EquipeHasPessoa {
  Equipe_id: number
  Pessoa_id: number
}

export interface PeriodoHistoricoHasRuina {
  Periodo_Historico_id: number
  Ruina_id: number
}

export class ApiService {
  // Métodos genéricos para acessar dados
  static async getData<T>(endpoint: string): Promise<T[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dbData[endpoint as keyof typeof dbData] as T[])
      }, 200)
    })
  }

  // Métodos específicos para cada entidade
  static async getEspecialidades(): Promise<Especialidade[]> {
    return this.getData<Especialidade>('Especialidade')
  }

  static async getLocalizacoes(): Promise<Localizacao[]> {
    return this.getData<Localizacao>('Localizacao')
  }

  static async getRuinas(): Promise<Ruina[]> {
    return this.getData<Ruina>('Ruina')
  }

  static async getEstadosConservacao(): Promise<EstadoConservacao[]> {
    return this.getData<EstadoConservacao>('Estado_Conservacao')
  }

  static async getImportanciasHistoricas(): Promise<ImportanciaHistorica[]> {
    return this.getData<ImportanciaHistorica>('Importancia_Historica')
  }

  static async getPeriodosHistoricos(): Promise<PeriodoHistorico[]> {
    return this.getData<PeriodoHistorico>('Periodo_Historico')
  }

  static async getDesafios(): Promise<Desafio[]> {
    return this.getData<Desafio>('Desafio')
  }

  static async getInstituicoes(): Promise<Instituicao[]> {
    return this.getData<Instituicao>('Instituicao')
  }

  static async getPessoas(): Promise<Pessoa[]> {
    return this.getData<Pessoa>('Pessoa')
  }

  static async getEquipes(): Promise<Equipe[]> {
    return this.getData<Equipe>('Equipe')
  }

  static async getExpedicoes(): Promise<Expedicao[]> {
    return this.getData<Expedicao>('Expedicao')
  }

  static async getArtefatos(): Promise<Artefato[]> {
    return this.getData<Artefato>('Artefato')
  }

  static async getContatosEmergencia(): Promise<ContatoEmergencia[]> {
    return this.getData<ContatoEmergencia>('Contato_Emergencia')
  }

  static async getFinanciamentos(): Promise<Financiamento[]> {
    return this.getData<Financiamento>('Financiamento')
  }

  static async getDesafioHasExpedicao(): Promise<DesafioHasExpedicao[]> {
    return this.getData<DesafioHasExpedicao>('Desafio_has_Expedicao')
  }

  static async getEquipeHasPessoa(): Promise<EquipeHasPessoa[]> {
    return this.getData<EquipeHasPessoa>('Equipe_has_Pessoa')
  }

  static async getPeriodoHistoricoHasRuina(): Promise<PeriodoHistoricoHasRuina[]> {
    return this.getData<PeriodoHistoricoHasRuina>('Periodo_Historico_has_Ruina')
  }

  // Métodos para buscar dados relacionados
  static async getExpedicaoComDetalhes(id: number) {
    const expedicoes = await this.getExpedicoes()
    const equipes = await this.getEquipes()
    const localizacoes = await this.getLocalizacoes()
    const ruinas = await this.getRuinas()
    const pessoas = await this.getPessoas()
    const especialidades = await this.getEspecialidades()

    const expedicao = expedicoes.find(e => e.id === id)
    if (!expedicao) return null

    const equipe = equipes.find(e => e.id === expedicao.equipe_id)
    const localizacao = localizacoes.find(l => l.id === expedicao.Localizacao_id)
    const ruina = ruinas.find(r => r.id === expedicao.Ruina_id)
    const lider = pessoas.find(p => p.id === equipe?.lider_id)
    const especialidade = especialidades.find(e => e.id === lider?.especialidade_id)

    return {
      ...expedicao,
      equipe: equipe ? { ...equipe, lider: lider ? { ...lider, especialidade } : null } : null,
      localizacao,
      ruina
    }
  }

  static async getArtefatoComDetalhes(id: number) {
    const artefatos = await this.getArtefatos()
    const expedicoes = await this.getExpedicoes()
    const estadosConservacao = await this.getEstadosConservacao()
    const importanciasHistoricas = await this.getImportanciasHistoricas()

    const artefato = artefatos.find(a => a.id === id)
    if (!artefato) return null

    const expedicao = expedicoes.find(e => e.id === artefato.Expedicao_id)
    const estadoConservacao = estadosConservacao.find(e => e.id === artefato.Estado_Conservacao_id)
    const importanciaHistorica = importanciasHistoricas.find(i => i.id === artefato.Importancia_Historica_id)

    return {
      ...artefato,
      expedicao,
      estado_conservacao: estadoConservacao,
      importancia_historica: importanciaHistorica
    }
  }
} 