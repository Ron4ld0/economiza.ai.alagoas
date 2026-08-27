# Feature Specification: Economiza.AI Alagoas

**Feature Branch**: `[001-economiza-ai]`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "/speckit-specify quero criar o seguinte sistema: @[# Software Design Document (SDD): Economiza.AI Alagoas]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Feed Geoespacial de Melhores Preços (Priority: P1)

Usuários podem visualizar um feed de ofertas baseadas em sua geolocalização e raio de distância escolhido (1 a 25km).

**Why this priority**: É o valor principal do app, permitindo descobrir onde produtos estão mais baratos de forma rápida.

**Independent Test**: Pode ser testado gerando uma localização mockada e buscando produtos num raio, verificando se a ordenação por menor preço ou maior desconto percentual funciona.

**Acceptance Scenarios**:

1. **Given** um usuário na localização X com o app aberto, **When** ele define um filtro de raio de 5km e categoria "Alimentação", **Then** o app exibe uma lista de produtos ordenados por menor preço absoluto ou maior desconto.
2. **Given** um produto exibido no feed, **When** ele possui baixa variabilidade e preços abaixo da mediana nos últimos 30 dias, **Then** o app exibe o selo "Preço Recorrente".

---

### User Story 2 - Scanner de Código de Barras (Priority: P1)

Usuários podem escanear o EAN-13 de um produto físico para encontrar os preços nos arredores.

**Why this priority**: Ajuda o usuário a tomar decisões rápidas enquanto já está fisicamente dentro de um supermercado, evitando pagar mais caro se o vizinho estiver vendendo mais barato.

**Independent Test**: Pode ser testado fornecendo um mock de imagem da câmera (código de barras) e retornando os 3 estabelecimentos mais próximos com preço para o item.

**Acceptance Scenarios**:

1. **Given** o usuário na tela de scanner, **When** ele aponta a câmera para um código EAN-13 válido, **Then** o app exibe um comparativo imediato do preço daquele produto nos 3 estabelecimentos mais próximos.

---

### User Story 3 - Listas e Cestas Temáticas Dinâmicas (Priority: P2)

Usuários podem selecionar um template (ex: Churrasco) e informar o número de pessoas para obter uma lista de compras calculada automaticamente.

**Why this priority**: Reduz o tempo de planejamento doméstico e incentiva o uso contínuo do app antes mesmo de sair de casa.

**Independent Test**: Pode ser testado validando o motor de cálculo proporcional com base em templates predefinidos.

**Acceptance Scenarios**:

1. **Given** o usuário seleciona o template "Churrasco", **When** ele informa que é para 8 pessoas, **Then** a calculadora gera proporcionalmente as quantidades de carnes, carvão e bebidas necessárias.
2. **Given** uma lista preenchida, **When** o usuário solicita otimização, **Then** o app sugere compras unificadas em até 2 locais para maximizar a economia geral.

---

### User Story 4 - Assistente em Linguagem Natural (Priority: P3)

Usuários podem conversar com um assistente para gerar listas de compra por voz/texto ou pedir explicações sobre os preços.

**Why this priority**: É um diferencial de mercado forte, porém depende de toda a arquitetura determinística estar pronta para evitar alucinações de LLMs.

**Independent Test**: Pode ser testado inserindo prompts textuais e checando se eles são mapeados corretamente para os templates do Módulo 3.

**Acceptance Scenarios**:

1. **Given** o chat do assistente, **When** o usuário digita "quero fazer um churrasco pra 15 pessoas com R$300", **Then** o app mapeia a intenção para o template de Churrasco, ajusta quantidades e foca num limite orçamentário.
2. **Given** um selo "Preço Recorrente" em um item, **When** o usuário pergunta "por que esse item tem esse selo?", **Then** o LLM explica usando apenas os dados estatísticos reais (desvio padrão/médias móveis).

### Edge Cases

- What happens when a scanned EAN-13 barcode has no price records in the last 48 hours?
- How does system handle loss of connection when the user is inside a store? (App MUST retain the active query and list in local cache).
- What happens when the SEFAZ-AL API is unavailable, rate-limited, or returns aggregate data without item granularity?
- How does the system resolve completely distinct raw descriptions from different stores that refer to the same product (before vector embeddings)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST consumir registros fiscais de NFC-e da SEFAZ-AL e considerar válidas para o feed imediato apenas notas emitidas nas últimas 48 horas.
- **FR-002**: O sistema MUST calcular selos de "Preço Recorrente" baseados no desvio padrão dos preços emitidos nos últimos 30 dias.
- **FR-003**: O sistema MUST validar alertas de descontos ("Promoção Real") contra o histórico de 30 a 60 dias do item na macrorregião, ignorando aumentos fictícios recentes.
- **FR-004**: O sistema MUST permitir a busca de produtos por geolocalização filtrando num raio de 1 km a 25 km do usuário.
- **FR-005**: O sistema MUST agrupar produtos idênticos através de um motor de inteligência textual, começando por regex/fuzzy (Fase 1) e podendo escalar para embeddings (pgvector/Sentence-Transformers) se necessário (Fase 2).
- **FR-006**: O sistema MUST isolar a camada de decisão estatística da camada LLM. O LLM MUST atuar apenas como interface UX de leitura/explicação, e nunca como decisor de preço ou fonte da verdade.
- **FR-007**: O aplicativo MUST possuir resiliência offline, armazenando listas ativas e a última busca realizada em cache local do dispositivo móvel.

### Key Entities *(include if feature involves data)*

- **Establishments**: CNPJ, Razão Social, Nome Fantasia, Localização Geoespacial (Point PostGIS), Endereço, Data Atualização.
- **Products_Master**: GTIN/EAN, Nome Canônico, Categoria, Vetor de Embeddings (pgvector).
- **Price_Records**: Relacionado a Establishments e Products_Master, contém Descrição Fiscal Bruta, Valor Unitário, Data e Hora de Emissão.
- **Templates**: Identificador, Nome, Categoria, Lista de Itens Canônicos Obrigatórios e Opcionais/Substitutos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Consultas de proximidade e feed de preços devem retornar respostas em menos de 500 ms em conexões móveis médias (3G/4G).
- **SC-002**: O usuário deve conseguir encontrar o menor preço de um produto específico em sua região em menos de 3 toques a partir da Home.
- **SC-003**: 100% das métricas de preço e "Preço Recorrente" devem ser rastreáveis estatisticamente sem envolvimento algorítmico do LLM.

## Assumptions

- A API da SEFAZ-AL permite ingestão granular de dados (item a item por nota) e suporta limites de requisições compatíveis com a proposta.
- Não há armazenamento de dados sensíveis de compradores das NFC-es, mantendo total conformidade legal e de privacidade.
- Aparelhos celulares dos usuários contêm receptores GPS e câmeras operacionais mínimas para ler EAN-13.
- Usuários conectarão o aplicativo ativamente à internet antes de iniciar a jornada de compras no estabelecimento.
