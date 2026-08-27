# **Software Design Document (SDD): Economiza.AI Alagoas**

## **1\. Visão Geral e Contexto do Produto**

* **Contexto:** A dispersão de preços em produtos de consumo recorrente (alimentação, higiene, limpeza e combustíveis) em Alagoas gera ineficiência de gastos para o consumidor final.  
* **Proposta de Valor:** Aplicativo mobile focado em geolocalização e inteligência de dados, consumindo registros fiscais públicos (NFC-e via API SEFAZ-AL) para identificar promoções reais, estabelecimentos com preços consistentemente baixos (recorrência) e listas temáticas prontas para eventos.  
* **Pré-requisito de Viabilidade:** Antes do início da Fase 1, validar junto à API SEFAZ-AL a granularidade real dos dados disponíveis (item a item por NFC-e vs. dado agregado) e limites de taxa de consulta (rate limit). Essa validação define o volume e a frequência de ingestão possíveis e pode impactar o desenho do pipeline assíncrono.  
* **Stack Tecnológica:**  
  * **Mobile:** React Native com Expo (TypeScript), NativeWind e TanStack Query.  
  * **Backend & APIs:** Python com FastAPI.  
  * **Banco de Dados & Busca Geoespacial:** PostgreSQL com PostGIS e pgvector.  
  * **Processamento Assíncrono & Cache:** Redis com Celery / APScheduler.  
  * **Inteligência de Dados (camada determinística):** Normalização textual simples (regex/fuzzy matching) como baseline; migração para Sentence-Transformers (embeddings semânticos, ex.: modelo multilingual leve tipo `e5-small`) somente quando o volume real de duplicatas no catálogo justificar. Modelos de séries temporais/regressão simples (média móvel, z-score) para detecção de outliers e recorrência — deliberadamente estatísticos e explicáveis, não probabilísticos, para preservar a confiança do usuário na classificação de preço.  
  * **Inteligência de Dados (camada de linguagem natural):** LLM (via API, ex.: Claude) usado exclusivamente como camada de UX sobre dados já validados — nunca para decidir preço ou recorrência. Aplicações: geração de explicações em linguagem natural sobre o feed (ex.: "essa loja é historicamente X% mais barata em hortifruti") e montagem de listas temáticas a partir de linguagem natural do usuário (ex.: "churrasco pra 15 pessoas com R$300"), consumindo os templates estruturados do Módulo 3.

## **2\. Objetivos de Negócio e Métricas de Sucesso**

* **Rapidez na Decisão:** Permitir que o usuário encontre o produto com menor preço na sua região em menos de 3 toques.  
* **Índice de Confiança de Preço:** Classificar estabelecimentos com a tag "Preço Recorrente", diferenciando quem mantém preços justos de ações pontuais.  
* **Engajamento com Listas Prontas:** Reduzir o tempo de planejamento de compras domésticas e eventos (ex.: churrasco, feira da semana) através de templates pré-configurados.

## **3\. Especificações Funcionais por Módulo**

### **Módulo 1: Feed Geoespacial de Melhores Preços**

* Obtenção da localização do usuário para cálculo de distâncias em tempo real.  
* Filtros por raio de distância (1 km a 25 km), categoria de produto e ordenação (menor preço absoluto vs. maior desconto percentual sobre a média histórica).  
* Exibição de selos de confiabilidade: *Super Promoção*, *Preço Recorrente* ou *Dentro da Média*.

### **Módulo 2: Scanner e Consulta por Código de Barras**

* Leitura de código de barras físico (EAN-13) diretamente pela câmera do dispositivo.  
* Comparativo imediato do produto escaneado com os preços vigentes nos 3 estabelecimentos mais próximos.

### **Módulo 3: Templates e Cestas Temáticas Dinâmicas**

* Listas pré-montadas para cenários comuns:  
  * **Churrasco:** Carnes (picanha, fraldinha, linguiça), acompanhamentos (carvão, sal grosso, pão de alho) e bebidas.  
  * **Básico da Semana:** Arroz, feijão, café, leite, açúcar, óleo.  
  * **Limpeza Doméstica:** Sabão em pó, amaciante, desinfetante, detergente.  
* Calculadora proporcional por número de pessoas (ex.: cálculo automático de kg de carne para 8 adultos).  
* Otimizador de compra em cenário único (comprar tudo em um lugar) ou dividido (comprar em até 2 locais para maximizar a economia).

### **Módulo 4: Monitoramento e Alertas**

* Marcação de produtos e categorias favoritas.  
* Notificações push quando notas fiscais recentes registrarem valores abaixo do teto definido pelo usuário.

### **Módulo 5: Assistente em Linguagem Natural (Camada LLM)**

* Geração de explicações textuais sobre os selos de confiabilidade do feed (ex.: por que um estabelecimento recebeu a tag "Preço Recorrente"), a partir dos dados já calculados pela camada determinística.  
* Montagem de listas de compra a partir de comandos em linguagem natural (ex.: "quero fazer um churrasco pra 15 pessoas com R$300"), mapeando a intenção para os templates estruturados do Módulo 3 e para o orçamento disponível.  
* Escopo estritamente limitado à interpretação e explicação de dados já validados pela lógica estatística — o LLM não participa do cálculo de preço, recorrência ou detecção de promoção.

## **4\. Regras de Negócio e Lógica de IA**

| Regra | Critério / Implementação |
| :---- | :---- |
| **Janela de Validade da Nota** | Apenas notas emitidas nas últimas 48 horas entram na exibição imediata do feed para evitar falsos estoques em lojas físicas. |
| **Cálculo de Preço Recorrente** | Calculado pelo desvio padrão dos preços emitidos nos últimos 30 dias. Estabelecimentos com baixa variabilidade e valores abaixo da mediana ganham a classificação de consistência. |
| **Normalização Semântica** | Produtos sem código EAN ou com descrições truncadas (ex.: "ARROZ T1 1KG" e "ARR TIO JOAO 1KG") são agrupados via embeddings textuais para evitar duplicações no catálogo canônico. |
| **Detecção de Promoção Real** | Alertas de desconto são validados contra o histórico de 30 a 60 dias do item na mesma macrorregião geográfica, descartando aumentos fictícios prévios. |
| **Separação Determinístico vs. LLM** | Toda decisão que afeta preço, ranking ou classificação de confiabilidade é resolvida por regras estatísticas explicáveis (desvio padrão, médias móveis, matching textual). O LLM atua apenas como camada de explicação e interface em linguagem natural sobre dados já calculados, nunca como fonte de verdade do dado. |

## **5\. Modelagem Conceitual de Dados**

* **establishments:** CNPJ, Razão Social, Nome Fantasia, Localização Geoespacial (Point PostGIS), Endereço e Data de Atualização.  
* **products\_master:** GTIN/EAN, Nome Canônico, Categoria, Vetor de Embeddings (pgvector).  
* **price\_records:** Chave estrangeira para Estabelecimento e Produto Canônico, Descrição Fiscal Bruta, Valor Unitário, Data e Hora de Emissão (Particionamento por data).  
* **templates:** Identificador, Nome, Categoria, Lista de Itens Canônicos Obrigatórios e Opcionais/Substitutos.

## **6\. Fases do Plano de Implementação**

| Fase | Foco Principal | Entregáveis |
| :---- | :---- | :---- |
| **Fase 0: Validação de Viabilidade** | Descoberta técnica | Prova de conceito de consumo da API SEFAZ-AL: validação de granularidade dos dados, rate limits e volume real disponível por região/período. |
| **Fase 1: Ingestão e Infraestrutura** | Backend & Database | Setup do PostgreSQL (PostGIS), FastAPI e pipeline assíncrono de consumo da API SEFAZ-AL. Normalização textual simples (regex/fuzzy matching) como baseline de agrupamento de produtos, sem pgvector/embeddings nesta fase. |
| **Fase 2: Motor de Inteligência** | Normalização & Métricas | Algoritmo de desvio padrão para recorrência e detecção de outliers. Ativação de pgvector e Sentence-Transformers apenas se o volume de duplicatas não resolvidas pelo matching simples justificar o upgrade. |
| **Fase 3: Core Mobile & Listas** | Frontend React Native | Telas de navegação (Home, Feed de Ofertas, Módulo de Templates Temáticos e Lista de Compras). |
| **Fase 4: Recursos Nativos & Câmera** | Integração Mobile | Scanner de código de barras (câmera), busca por raio GPS e gerenciamento de favoritos offline (cache). |
| **Fase 5: Assistente em Linguagem Natural** | Camada LLM | Integração de LLM via API para explicações em linguagem natural do feed e montagem de listas por comando de texto (Módulo 5), consumindo dados já validados pelas Fases 1 e 2. |
| **Fase 6: Testes e Publicação** | QA & Deploy | Testes de integração, build via Expo Application Services (EAS) e publicação na Google Play Store. |

## **7\. Requisitos Não Funcionais e Operacionais**

* **Latência de Consulta:** Resposta das consultas de proximidade abaixo de **500 ms** em conexões móveis.  
* **Resiliência Offline:** O app deve reter a última consulta e lista ativa em cache local caso o usuário perca conexão dentro do estabelecimento.  
* **Conformidade Legal:** Processamento restrito a registros fiscais de consulta pública, sem coleta ou retenção de dados pessoais de compradores das notas.