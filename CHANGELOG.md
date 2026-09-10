# Changelog

Histórico de alterações do ROMScore.

## [Unreleased]

### Backend

* Padronizada a paginação dos endpoints de jogos e ROM Hacks.
* Removido o `list()` customizado do `GameViewSet`.
* Adicionado `StandardResultsSetPagination` com suporte ao parâmetro `limit`.
* Adicionada ordenação determinística utilizando `-id` como critério de desempate.
* Otimizada a rotina de seed utilizando `Set` para verificar `ra_id`s existentes em memória.
* Limitada a ingestão de jogos por execução.
* Adicionado tratamento de erros e intervalo entre requisições da API externa.

### Frontend

* Atualizado o consumo da API para utilizar o envelope paginado `results`, `count` e `next`.
* Ajustada a `CategoryPage` para carregamento incremental de jogos.
* Busca da Home passou a utilizar o total retornado pela API.
* Removida a lógica defensiva para múltiplos formatos de resposta da API.

## [1.0.0] — V1

### Added

* Catálogo de jogos clássicos.
* Busca e filtros por plataforma.
* Catálogo de ROM Hacks.
* Sistema de avaliações e reviews.
* Autenticação JWT.
* Galeria de screenshots.
* Integração com RetroAchievements.
* Interface React responsiva.
* API REST documentada com OpenAPI.
* Ambiente de desenvolvimento com Docker.

### Technical

* Django REST Framework.
* PostgreSQL.
* React + TypeScript.
* Django ORM com agregações e otimização de relacionamentos.
* Paginação REST.
