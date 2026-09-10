# 🎮 ROMScore

Plataforma fullstack para **descoberta, catalogação e avaliação de jogos clássicos e ROM Hacks**.

O projeto integra dados do **RetroAchievements**, disponibiliza uma API REST com Django REST Framework e oferece uma interface React para explorar jogos, consultar ROM Hacks, enviar modificações e avaliar conteúdos da comunidade.

> **Projeto de portfólio técnico e estudo de engenharia de software.**

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

Crie um `.env` na raiz do projeto:

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

Este projeto está disponível sob a licença MIT.
