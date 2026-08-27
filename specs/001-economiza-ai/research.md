# Phase 0: Outline & Research

## Unknown 1: SEFAZ-AL API Rate Limits e Payload
- **Decision**: Implementar um sistema de filas assíncronas (Celery) com controle no backend.
- **Rationale**: O manual da API "Economiza Alagoas" versão 1.0 informa explicitamente que *não existe restrição em relação à quantidade de solicitações feitas*, mas recomenda-se uma infraestrutura intermediária própria para não sobrecarregar a rede pública. A ingestão assíncrona absorve instabilidades da SEFAZ sem afetar a UX do usuário final, que sempre consome o banco de dados interno (PostgreSQL) garantindo alta performance (< 500ms).
- **Alternatives considered**: Scraping direto no mobile (rejeitado por alto risco de bloqueio, fragmentação da base e sobrecarga nos servidores públicos da SEFAZ, violando as boas práticas recomendadas).

## Unknown 2: Estratégia de Cache Offline (Mobile)
- **Decision**: Utilizar TanStack Query (React Query) acoplado com persistência local (AsyncStorage) para cache agressivo de consultas de listas temáticas e resultados da última busca.
- **Rationale**: O TanStack Query já gerencia perfeitamente os estados de requisição (loading, error) e tem plugins oficiais de persistência, sendo ideal para o requisito de resiliência offline em ambientes com baixa conectividade (ex: dentro de supermercados com paredes grossas).
- **Alternatives considered**: Redux Persist (rejeitado por boilerplate alto), SQLite local (complexo demais apenas para cache temporário de sessão).

## Unknown 3: Integração Segura com LLM (Módulo 5)
- **Decision**: Utilizar a API de LLM via LangChain/litellm unicamente no backend. O prompt será fortemente tipado com as regras do negócio e o LLM receberá os dados calculados estatisticamente (ex: média, desvio padrão), formatando-os para texto e chamando *Tools/Functions* estruturadas quando for gerar listas.
- **Rationale**: Impede que o LLM "alucine" promoções inexistentes ou faça cálculos incorretos de preço. O LLM atua estritamente como uma camada inteligente de roteamento e explicação conversacional, preservando a lógica da aplicação no código determinístico.
- **Alternatives considered**: Agent com RAG completo consultando banco (rejeitado por lentidão inaceitável para mobile e dificuldade em validar matematicamente as recomendações).
