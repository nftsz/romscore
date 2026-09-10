# 🎮 Ride Analytics — Game ROM Rating & Discovery Platform

![GitHub top language](https://img.shields.io/github/languages/top/nftsz/star-feedback)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/nftsz/star-feedback/main)

Plataforma web para **catalogação, descoberta e avaliação de jogos clássicos e ROM Hacks**, com integração a dados externos, agregação de métricas e persistência relacional em PostgreSQL.

> **Projeto de Portfólio Técnico / Estudo de Engenharia de Software**
>
> Aplicação fullstack containerizada com **Django REST Framework**, **PostgreSQL** e **React (TypeScript)**, desenvolvida para catalogação, avaliação e descoberta de jogos retrô e modificações da comunidade (*ROM Hacks* e traduções).

## 📌 Contexto & Objetivos de Aprendizado

Este projeto foi desenvolvido com o propósito acadêmico e prático de exercitar a construção de uma **arquitetura orientada a serviços**, explorando desafios reais de desenvolvimento backend, integração com APIs externas, modelagem de dados e otimização de consultas.

Os principais objetivos foram:

* **Modelagem Relacional:** Estruturação de entidades, relacionamentos N:M, agregações de avaliações e integridade referencial utilizando Django ORM.
* **Integração e Tratamento de APIs Externas:** Desenvolvimento de um pipeline de ingestão desacoplado para consumo e normalização dos dados da **RetroAchievements Web API**.
* **Performance de Consultas:** Redução de consultas redundantes e do problema clássico de *N+1 queries* por meio de `annotate`, `prefetch_related` e estratégias de indexação.
* **Autenticação Stateless:** Implementação de autenticação baseada em JSON Web Tokens (JWT).
* **Infraestrutura e Containerização:** Criação de um ambiente reprodutível utilizando Docker e Docker Compose.
* **Desenvolvimento Fullstack:** Integração entre uma API REST e uma aplicação React com TypeScript, incluindo filtros, busca, paginação e gerenciamento de estado.

## 🧠 Arquitetura do Sistema & Decisões de Engenharia

```text
  ┌──────────────────────────────────────────────────────────┐
  │                    React + TypeScript                    │
  │              (Tailwind CSS / Single Page App)            │
  └────────────────────────────┬─────────────────────────────┘
                               │ HTTP / REST API
                               ▼
  ┌──────────────────────────────────────────────────────────┐
  │                 Django REST Framework                    │
  │   ┌──────────────────────┐    ┌──────────────────────┐   │
  │   │  API Controllers     │    │  ETL Seed Service    │   │
  │   │  (ViewSets/Routers)  │    │  (RA API Ingestor)   │   │
  │   └──────────┬───────────┘    └──────────┬───────────┘   │
  └──────────────┼───────────────────────────┼───────────────┘
                 │ Django ORM                │ API_GetGameExtended
                 ▼                           ▼
  ┌──────────────────────────┐    ┌──────────────────────────┐
  │   PostgreSQL Database    │    │ RetroAchievements API    │
  │   (Docker Environment)   │    │  (Metadata & Assets)     │
  └──────────────────────────┘    └──────────────────────────┘
```

### 1. Evolução da Fonte de Dados

Inicialmente, o projeto foi planejado utilizando a API da RAWG. Durante o desenvolvimento, foram identificadas inconsistências na classificação de plataformas para parte do catálogo retrô, especialmente em títulos associados a diferentes gerações de consoles.

**Solução:** a arquitetura foi adaptada para utilizar diretamente a **RetroAchievements Web API**, com foco no endpoint `API_GetGameExtended.php`.

**Resultado:** maior consistência nos metadados dos jogos, acesso às URLs oficiais de BoxArt e utilização da métrica `NumDistinctPlayers`, que representa a quantidade de jogadores distintos registrados para cada título na plataforma.

Essa métrica passou a ser utilizada como um dos critérios para determinar a relevância e popularidade dos jogos no catálogo.

### 2. Otimização de Queries no Django ORM

Para suportar filtros e ordenações dinâmicas na API, como `popular`, `most_hacked` e `recent_hacks`, a camada de consulta utiliza agregações diretamente no PostgreSQL e estratégias de pré-carregamento de relacionamentos.

Exemplo:

```python
# Trecho da implementação em core/api/v1/viewsets.py
queryset = Game.objects.annotate(
    total_hacks=Count('hacks', distinct=True),
    latest_hack_date=Max('hacks__created_at')
).prefetch_related('hacks__ratings__user')
```

Essa abordagem reduz consultas desnecessárias ao banco e evita o problema de **N+1 queries** durante a serialização dos relacionamentos.

## ⚙️ Tecnologias & Bibliotecas

* **Backend:** Python 3.11, Django, Django REST Framework (DRF), SimpleJWT.
* **Banco de Dados:** PostgreSQL 15, Django ORM.
* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router DOM.
* **Documentação da API:** Swagger / OpenAPI com `drf-spectacular`.
* **Infraestrutura:** Docker, Docker Compose.
* **Integração externa:** RetroAchievements Web API.

## 🔌 Endpoints RESTful

| Método | Rota HTTP                  | Descrição / Regra de Negócio                                               | Autenticação |
| ------ | -------------------------- | -------------------------------------------------------------------------- | ------------ |
| `GET`  | `/api/v1/games/`           | Listagem paginada de jogos. Suporta `?platform=`, `?filter=` e `?search=`. | Pública      |
| `GET`  | `/api/v1/games/{id}/`      | Detalhes do jogo, imagens oficiais e lista de ROM Hacks associadas.        | Pública      |
| `POST` | `/api/v1/hacks/`           | Submissão de novo patch/tradução e galeria de screenshots.                 | JWT          |
| `GET`  | `/api/v1/hacks/my_hacks/`  | Lista apenas as modificações submetidas pelo usuário autenticado.          | JWT          |
| `POST` | `/api/v1/hacks/{id}/rate/` | Cria ou atualiza uma avaliação de 1 a 5 estrelas e uma review da hack.     | JWT          |
| `POST` | `/api/v1/auth/login/`      | Autenticação do usuário e emissão de tokens JWT.                           | Pública      |
| `POST` | `/api/v1/auth/register/`   | Cadastro de uma nova conta na plataforma.                                  | Pública      |

## 🚀 Como Executar o Ambiente Local

### Pré-requisitos

* Docker Engine (>= 20.10)
* Docker Compose (>= 2.0)

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` na raiz do projeto e configure as credenciais da RetroAchievements Web API e as variáveis do PostgreSQL:

```env
RA_USER=seu_usuario_retroachievements
RA_API_KEY=sua_web_api_key

SECRET_KEY=django-insecure-key-dev-environment

POSTGRES_DB=ride_analytics_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

> **Importante:** nunca versione o arquivo `.env` ou exponha sua API Key. Utilize o `.env.example` apenas como referência para as variáveis necessárias.

### 2. Inicializar os Containers

Construa as imagens e inicialize os serviços:

```bash
docker compose up --build -d
```

### 3. Executar as Migrações e o Ingestor de Dados

Aplique as migrações do Django e popule o catálogo utilizando os dados da RetroAchievements:

```bash
# Executa as migrações do banco de dados
docker compose exec web python manage.py migrate

# Executa o processo de ingestão dos jogos
docker compose exec web python manage.py seed_games
```

### 4. Acessar a Aplicação

* **Interface Web (React):** `http://localhost:5173/`
* **API Backend (Django REST Framework):** `http://localhost:8000/api/v1/games/`
* **Documentação Interativa (Swagger):** `http://localhost:8000/api/docs/`

## 📌 Principais Aprendizados

1. **Integração com APIs externas:** tratamento de limites de requisições (*rate limits*), falhas de comunicação e normalização de dados provenientes de serviços externos.
2. **Modelagem e consistência de dados:** adaptação de contratos externos aos modelos internos do Django ORM sem propagar inconsistências para o frontend.
3. **Otimização de consultas:** utilização de agregações, `prefetch_related`, `select_related` e indexação para reduzir consultas desnecessárias ao banco.
4. **Arquitetura REST:** organização de recursos, ViewSets, serializers, autenticação e regras de negócio em uma API versionada.
5. **Desenvolvimento React:** construção de componentes reutilizáveis, gerenciamento de estado, debounce em buscas textuais e paginação.
6. **Containerização:** configuração de um ambiente de desenvolvimento reproduzível utilizando Docker Compose.
7. **Integração Fullstack:** desenvolvimento da comunicação entre frontend e backend utilizando HTTP/REST, Axios e autenticação JWT.

## 📄 Licença

Projeto desenvolvido para fins acadêmicos, estudo e composição de portfólio em engenharia de software.

Licenciado sob a **MIT License**.
