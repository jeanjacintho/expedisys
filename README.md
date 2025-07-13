# ExpediSys - Sistema de Arqueologia

Um sistema SaaS para gerenciamento de expedições arqueológicas.

## Funcionalidades

- ✅ Dashboard com navegação lateral
- ✅ Interface responsiva
- ✅ Banco de dados local completo com todas as entidades
- ✅ Sistema de gerenciamento de expedições

## Banco de Dados

O sistema inclui um banco de dados JSON completo com as seguintes entidades:

### Entidades Principais
- **Especialidades** - Tipos de especialistas (Arqueólogo, Antropólogo, etc.)
- **Pessoas** - Membros das equipes com suas especialidades
- **Equipes** - Grupos de trabalho com líderes
- **Expedições** - Projetos de pesquisa arqueológica
- **Artefatos** - Objetos encontrados nas expedições
- **Ruínas** - Sítios arqueológicos
- **Localizações** - Coordenadas geográficas dos sítios

### Entidades de Suporte
- **Estados de Conservação** - Condição dos artefatos
- **Importâncias Históricas** - Valor histórico dos achados
- **Períodos Históricos** - Épocas históricas
- **Desafios** - Problemas enfrentados nas expedições
- **Instituições** - Organizações financiadoras
- **Financiamentos** - Investimentos nas expedições
- **Contatos de Emergência** - Contatos dos membros

### Dados de Exemplo
O banco inclui dados realistas de:
- **50 Ruínas** (Machu Picchu, Chichen Itza, Pirâmides de Gizé, etc.)
- **50 Expedições** ativas em diferentes períodos
- **340 Pessoas** especialistas
- **50 Equipes** de trabalho
- **50 Artefatos** encontrados
- **100 Localizações** em diferentes países

## Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## Estrutura do Projeto

```
├── app/
│   ├── (home)/           # Dashboard principal
│   ├── artifacts/        # Página de artefatos
│   ├── expedition/       # Página de expedições
│   ├── analytics/        # Página de análises
│   ├── teams/           # Página de equipes
│   └── layout.tsx       # Layout principal
├── components/
│   ├── nav-user.tsx     # Componente de usuário no header
│   ├── app-sidebar.tsx  # Sidebar de navegação
│   └── ui/              # Componentes UI
├── lib/
│   └── api.ts           # Serviço de API para dados
└── data/
    └── db.json          # Banco de dados JSON completo
```

## Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Radix UI** - Componentes acessíveis

## Funcionalidades do Sistema

### Interface
- Header com usuário padrão
- Sidebar responsiva
- Navegação entre páginas
- Design moderno e acessível

### Banco de Dados
- Dados completos de expedições arqueológicas
- Relacionamentos entre entidades
- Dados realistas de sítios históricos
- API service para acesso aos dados

## Uso da API

Para acessar os dados no código:

```typescript
import { ApiService } from '@/lib/api'

// Buscar dados
const expedicoes = await ApiService.getExpedicoes()
const artefatos = await ApiService.getArtefatos()
const pessoas = await ApiService.getPessoas()

// Buscar dados com relacionamentos
const expedicaoDetalhada = await ApiService.getExpedicaoComDetalhes(1)
const artefatoDetalhado = await ApiService.getArtefatoComDetalhes(1)
```

## Desenvolvimento

Para adicionar novos dados, edite o arquivo `data/db.json`:

```json
{
  "Expedicao": [
    {
      "id": 51,
      "nome": "Nova Expedição",
      "data_inicio": "2024-11-01T08:00:00Z",
      "data_fim": "2024-12-31T18:00:00Z",
      "equipe_id": 1,
      "Localizacao_id": 1,
      "Ruina_id": 1
    }
  ]
}
```

## Scripts Disponíveis

- `npm run dev` - Executa o projeto em modo desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Executa o build de produção
- `npm run lint` - Executa o linter
