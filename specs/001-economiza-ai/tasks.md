# Tasks: Economiza.AI Alagoas

**Input**: Design documents from `/specs/001-economiza-ai/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure (`backend/`, `mobile/`)
- [x] T002 [P] Initialize Python backend with FastAPI and SQLAlchemy in `backend/`
- [x] T003 [P] Initialize React Native (Expo) mobile app with NativeWind in `mobile/`
- [x] T004 [P] Configure Docker Compose for PostgreSQL (PostGIS+pgvector) and Redis in `docker-compose.yml`
- [x] T005 [P] Setup Celery configuration in `backend/src/core/celery_app.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Setup database migrations (Alembic) in `backend/alembic/`
- [x] T007 [P] Create `establishments` model (PostGIS) in `backend/src/models/establishments.py`
- [x] T008 [P] Create `products_master` model (pgvector) in `backend/src/models/products_master.py`
- [x] T009 Create `price_records` model with foreign keys in `backend/src/models/price_records.py`
- [x] T010 Create `templates` model in `backend/src/models/templates.py`
- [x] T011 [P] Setup base API routing and error handling in `backend/src/main.py`
- [x] T012 [P] Setup TanStack Query and AsyncStorage in `mobile/src/hooks/queryClient.ts`
- [x] T013 Setup base navigation structure (React Navigation) in `mobile/src/navigation/AppNavigator.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Feed Geoespacial de Melhores Preços (Priority: P1) 🎯 MVP

**Goal**: Usuários podem visualizar um feed de ofertas baseadas em sua geolocalização e raio de distância escolhido (1 a 25km).

**Independent Test**: Pode ser testado gerando uma localização mockada e buscando produtos num raio, verificando se a ordenação por menor preço ou maior desconto percentual funciona.

### Implementation for User Story 1

- [ ] T014 [P] [US1] Implement Feed Service logic (ST_DWithin queries) in `backend/src/services/feed_service.py`
- [ ] T015 [P] [US1] Implement "Preço Recorrente" statistics calculator in `backend/src/services/stats_service.py`
- [ ] T016 [US1] Create `GET /api/v1/feed` endpoint in `backend/src/api/feed.py` (depends on T014, T015)
- [ ] T017 [P] [US1] Create Feed Screen UI in `mobile/src/screens/FeedScreen.tsx`
- [ ] T018 [P] [US1] Create Location Hook (Expo Location) in `mobile/src/hooks/useLocation.ts`
- [ ] T019 [US1] Integrate Feed Screen with TanStack Query fetching `GET /api/v1/feed`
- [ ] T020 [US1] Implement offline cache resilience for feed data in TanStack Query configuration

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Scanner de Código de Barras (Priority: P1)

**Goal**: Usuários podem escanear o EAN-13 de um produto físico para encontrar os preços nos arredores.

**Independent Test**: Pode ser testado fornecendo um mock de imagem da câmera (código de barras) e retornando os 3 estabelecimentos mais próximos com preço para o item.

### Implementation for User Story 2

- [ ] T021 [P] [US2] Implement Product Price Scanner service in `backend/src/services/product_service.py`
- [ ] T022 [US2] Create `GET /api/v1/products/{ean}/prices` endpoint in `backend/src/api/products.py`
- [ ] T023 [P] [US2] Create Barcode Scanner UI (Expo Camera) in `mobile/src/screens/ScannerScreen.tsx`
- [ ] T024 [US2] Integrate Scanner Screen with `GET /api/v1/products/{ean}/prices` API

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Listas e Cestas Temáticas Dinâmicas (Priority: P2)

**Goal**: Usuários podem selecionar um template (ex: Churrasco) e informar o número de pessoas para obter uma lista de compras calculada automaticamente.

**Independent Test**: Pode ser testado validando o motor de cálculo proporcional com base em templates predefinidos.

### Implementation for User Story 3

- [ ] T025 [P] [US3] Seed initial templates (e.g., Churrasco) in `backend/scripts/seed_templates.py`
- [ ] T026 [P] [US3] Implement Template calculation service (proportional math) in `backend/src/services/template_service.py`
- [ ] T027 [US3] Create template endpoints (`GET /api/v1/templates`, `POST /api/v1/templates/{id}/calculate`) in `backend/src/api/templates.py`
- [ ] T028 [P] [US3] Create Thematic Lists UI in `mobile/src/screens/TemplatesScreen.tsx`
- [ ] T029 [US3] Integrate Thematic Lists UI with Template APIs

**Checkpoint**: At this point, User Story 3 should be independently functional

---

## Phase 6: User Story 4 - Assistente em Linguagem Natural (Priority: P3)

**Goal**: Usuários podem conversar com um assistente para gerar listas de compra por voz/texto ou pedir explicações sobre os preços.

**Independent Test**: Pode ser testado inserindo prompts textuais e checando se eles são mapeados corretamente para os templates do Módulo 3.

### Implementation for User Story 4

- [ ] T030 [P] [US4] Setup LLM integration (LangChain/litellm) in `backend/src/services/llm_service.py`
- [ ] T031 [P] [US4] Create natural language parser to map intent to `template_action` in `backend/src/services/intent_service.py`
- [ ] T032 [US4] Create `POST /api/v1/assistant/chat` endpoint in `backend/src/api/assistant.py`
- [ ] T033 [P] [US4] Create Chat Assistant UI in `mobile/src/screens/AssistantScreen.tsx`
- [ ] T034 [US4] Integrate Chat UI with Assistant API

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T035 [P] Write integration tests for API endpoints in `backend/tests/integration/`
- [ ] T036 [P] Validate offline capabilities manually (turn off network)
- [ ] T037 Refactor UI styling (NativeWind) for consistency across screens
- [ ] T038 Review error handling messages shown to the user
- [ ] T039 Create `quickstart.md` validation script in `backend/scripts/seed_mock_data.py`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Mobile UI and Backend Services marked [P] can be worked on concurrently by frontend/backend devs

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready
