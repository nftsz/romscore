# 🎮 ROMScore — Game ROM Rating & Discovery Platform

![GitHub top language](https://img.shields.io/github/languages/top/nftsz/romscore)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/nftsz/romscore/main)

Plataforma fullstack para **descoberta, catalogação e avaliação de jogos clássicos e ROM Hacks**.

O projeto integra dados do **RetroAchievements**, disponibiliza uma API REST com Django REST Framework e oferece uma interface React para explorar jogos, consultar ROM Hacks, enviar modificações e avaliar conteúdos da comunidade.

> **Projeto de portfólio técnico e estudo de engenharia de software.**

Este projeto foi desenvolvido com o propósito acadêmico e prático de exercitar a construção de uma **arquitetura orientada a serviços**, explorando desafios reais de desenvolvimento backend, integração com APIs externas, modelagem de dados e otimização de consultas.

## ✨ Funcionalidades

* Catálogo de jogos clássicos
* Busca e filtros por plataforma
* Ordenação por popularidade e atividade da comunidade
* Catálogo de ROM Hacks e traduções
* Avaliação e reviews de ROM Hacks
* Galeria de screenshots
* Autenticação com JWT
* API REST paginada
* Documentação OpenAPI / Swagger
* Ambiente containerizado com Docker

## 🛠️ Stack

**Backend**

* Python
* Django
* Django REST Framework
* SimpleJWT

**Frontend**

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios

**Database & Infrastructure**

* PostgreSQL
* Docker
* Docker Compose

**External API**

* RetroAchievements Web API

## 🧠 Principais decisões técnicas

O projeto foi desenvolvido buscando aplicar conceitos de engenharia de software além da implementação das funcionalidades.

### API REST

A API utiliza ViewSets e paginação nativa do Django REST Framework, mantendo um contrato consistente entre os endpoints:

```json
{
  "count": 120,
  "next": "...",
  "previous": null,
  "results": []
}
```

Isso permite que o frontend trabalhe com uma estrutura previsível independentemente de filtros ou buscas.

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

### Performance e ORM

O Django ORM é utilizado para agregações e otimização de consultas através de:

* `annotate`
* `Count`
* `Avg`
* `Max`
* `select_related`
* `prefetch_related`
* `distinct=True`

A rotina de ingestão também utiliza conjuntos (`Set`) para verificar `ra_id`s existentes em memória, evitando consultas individuais ao banco durante o processo de seed.

### Ingestão de dados

Os dados dos jogos são obtidos através da RetroAchievements Web API e normalizados antes de serem persistidos no PostgreSQL.

O processo de ingestão foi estruturado para reduzir consultas desnecessárias e controlar a frequência das requisições externas.

## 🏗️ Arquitetura

```text
React + TypeScript
        │
        │ HTTP / REST + JWT
        ▼
Django REST Framework
        │
        ├──────────────► RetroAchievements API
        │
        ▼
   PostgreSQL
```

## 🚀 Como executar

### Pré-requisitos

* Docker
* Docker Compose

### Configuração

Copie o arquivo `.env.example` para `.env` na raiz do projeto e configure as credenciais da RetroAchievements Web API e as variáveis do PostgreSQL:

```env
RA_USER=seu_usuario
RA_API_KEY=sua_api_key

SECRET_KEY=django-insecure-key-dev
POSTGRES_DB=romscore_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

### Inicialização

```bash
docker compose up --build -d

docker compose exec web python manage.py migrate

docker compose exec web python manage.py seed_games
```

### Acessos

* Frontend: `http://localhost:5173/`
* API: `http://localhost:8000/api/v1/games/`
* Swagger: `http://localhost:8000/api/docs/`

## 📌 Status

**V1 — funcional**

A primeira versão da aplicação está concluída. Novas funcionalidades, melhorias de UX, performance e cobertura de testes serão adicionadas incrementalmente.

## 📚 Documentação e evolução

Para acompanhar as alterações técnicas e decisões realizadas durante o desenvolvimento, consulte:

* [`CHANGELOG.md`](CHANGELOG.md) — histórico de mudanças
* GitHub Issues — funcionalidades e melhorias planejadas
* Pull Requests — alterações e discussões técnicas

## 📄 Licença

Projeto desenvolvido para fins acadêmicos, estudo e composição de portfólio em engenharia de software.

Licenciado sob a **MIT License**.