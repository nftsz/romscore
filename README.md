# 🎮 Ride Analytics — Game ROMs Rating & Discovery Platform

![GitHub top language](https://img.shields.io/github/languages/top/nftsz/star-feedback)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/nftsz/star-feedback/main)

Plataforma web para catalogação, descoberta e avaliação de ROMs de jogos clássicos, com agregação de métricas em tempo real e persistência relacional otimizada em PostgreSQL.

### Tecnologias

* **Backend:** Python, Django, Django ORM
* **Banco de Dados:** PostgreSQL (Ambiente isolado via Docker)
* **Frontend:** Django Templates, HTML5, CSS3, Vanilla JavaScript
* **DevOps / Infra:** Docker, Docker Compose

### Decisões de Arquitetura & Engenharia

* **Agregação Dinâmica de Ratings:** Cálculo de médias ponderadas e volume de avaliações processados diretamente na camada de banco via queries do Django ORM (`annotate` e `aggregate`), evitando processamento redundante em memória na aplicação.
* **Prevenção de N+1 Queries:** Otimização de consultas para rankings (*Top Rated* e *Recent Added*) através de junções eficientes com `select_related` e `prefetch_related`.
* **Persistência Estruturada:** Modelagem relacional em PostgreSQL com regras de integridade referencial entre jogos, avaliações e metadados.
* **Gerenciamento de Mídia:** Estruturação e upload de assets visuais (capas, screenshots e sinopses) segregados por identificador de jogo.
* **Ambiente Containerizado:** Setup completo de desenvolvimento orquestrado via Docker Compose, garantindo paridade de ambiente e provisionamento reproduzível.

### Principais Módulos & Regras de Negócio

* **Dynamic Rating System:** Avaliação por estrelas (escala de 1 a 5) com atualização e renderização visual do score médio em tempo real.
* **Curadoria & Metadados:** Catálogo estruturado por estúdio, plataforma/console, sinopse e galeria de capturas de tela.
* **Rankings Automatizados:** Filtros analíticos dinâmicos para listagem dos títulos mais bem pontuados e das adições mais recentes.


### Como Executar o Projeto

**1. Pré-requisitos:**

* Docker e Docker Compose instalados.

**2. Clonar o repositório:**

```bash
git clone https://github.com/seu-usuario/ride-analytics.git
cd ride-analytics

```
**3. Subir o ambiente:**

```bash
docker compose up --build

```
> O Docker Compose irá provisionar o banco PostgreSQL, aplicar as migrações estruturais e inicializar o servidor de aplicação Django.

**4. Acessar a aplicação:**
> Interface disponível em: `http://localhost:8000/home/`

### Licença

Distribuído sob a licença MIT.

---

### Roadmap Técnico

* [ ] Implementação de camada de autenticação para rastreamento de avaliações únicas por usuário.
* [ ] Exposição de endpoints RESTful para desacoplamento de frontend via Django REST Framework.
* [ ] Cobertura de testes automatizados com `pytest-django` para validar o cálculo das médias e integridade das queries.
* [ ] Cache de consultas frequentes (Top Rated) utilizando Redis.




