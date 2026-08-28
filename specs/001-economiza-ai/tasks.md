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

**âš ï¸ CRITICAL**: No user story work can begin until this phase is complete

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

## Phase 3: User Story 1 - Feed Geoespacial de Melhores PreÃ§os (Priority: P1) ðŸŽ¯ MVP

**Goal**: UsuÃ¡rios podem visualizar um feed de ofertas baseadas em sua geolocalizaÃ§Ã£o e raio de distÃ¢ncia escolhido (1 a 25km).

**Independent Test**: Pode ser testado gerando uma localizaÃ§Ã£o mockada e buscando produtos num raio, verificando se a ordenaÃ§Ã£o por menor preÃ§o ou maior desconto percentual funciona.

### Implementation for User Story 1

- [x] T014 [P] [US1] Implement Feed Service logic (ST_DWithin queries) in `backend/src/services/feed_service.py`
- [x] T015 [P] [US1] Implement "PreÃ§o Recorrente" statistics calculator in `backend/src/services/stats_service.py`
- [x] T016 [US1] Create `GET /api/v1/feed` endpoint in `backend/src/api/feed.py` (depends on T014, T015)
- [x] T017 [P] [US1] Create Feed Screen UI in `mobile/src/screens/FeedScreen.tsx`
- [x] T018 [P] [US1] Create Location Hook (Expo Location) in `mobile/src/hooks/useLocation.ts`
- [x] T019 [US1] Integrate Feed Screen with TanStack Query fetching `GET /api/v1/feed`
- [x] T020 [US1] Implement offline cache resilience for feed data in TanStack Query configuration

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Scanner de CÃ³digo de Barras (Priority: P1)

**Goal**: UsuÃ¡rios podem escanear o EAN-13 de um produto fÃ­sico para encontrar os preÃ§os nos arredores.

**Independent Test**: Pode ser testado fornecendo um mock de imagem da cÃ¢mera (cÃ³digo de barras) e retornando os 3 estabelecimentos mais prÃ³ximos com preÃ§o para o item.

### Implementation for User Story 2

- [x] T021 [P] [US2] Implement Product Price Scanner service in `backend/src/services/product_service.py`
- [x] T022 [US2] Create `GET /api/v1/products/{ean}/prices` endpoint in `backend/src/api/products.py`
- [x] T023 [P] [US2] Create Barcode Scanner UI (Expo Camera) in `mobile/src/screens/ScannerScreen.tsx`
- [x] T024 [US2] Integrate Scanner Screen with `GET /api/v1/products/{ean}/prices` API

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Listas e Cestas TemÃ¡ticas DinÃ¢micas (Priority: P2)

**Goal**: UsuÃ¡rios podem selecionar um template (ex: Churrasco) e informar o nÃºmero de pessoas para obter uma lista de compras calculada automaticamente.

**Independent Test**: Pode ser testado validando o motor de cÃ¡lculo proporcional com base em templates predefinidos.

### Implementation for User Story 3

- [x] T025 [P] [US3] Seed initial templates (e.g., Churrasco) in `backend/scripts/seed_templates.py`
- [x] T026 [P] [US3] Implement Template calculation service (proportional math) in `backend/src/services/template_service.py`
- [x] T027 [US3] Create template endpoints (`GET /api/v1/templates`, `POST /api/v1/templates/{id}/calculate`) in `backend/src/api/templates.py`
- [x] T028 [P] [US3] Create Thematic Lists UI in `mobile/src/screens/TemplatesScreen.tsx`
- [x] T029 [US3] Integrate Thematic Lists UI with Template APIs

**Checkpoint**: At this point, User Story 3 should be independently functional

---

## Phase 6: User Story 4 - Assistente em Linguagem Natural (Priority: P3)

**Goal**: UsuÃ¡rios podem conversar com um assistente para gerar listas de compra por voz/texto ou pedir explicaÃ§Ãµes sobre os preÃ§os.

**Independent Test**: Pode ser testado inserindo prompts textuais e checando se eles sÃ£o mapeados corretamente para os templates do MÃ³dulo 3.

### Implementation for User Story 4

- [x] T030 [P] [US4] Setup LLM integration (LangChain/litellm) in `backend/src/services/llm_service.py`
- [x] T031 [P] [US4] Create natural language parser to map intent to `template_action` in `backend/src/services/intent_service.py`
- [x] T032 [US4] Create `POST /api/v1/assistant/chat` endpoint in `backend/src/api/assistant.py`
- [x] T033 [P] [US4] Create Chat Assistant UI in `mobile/src/screens/AssistantScreen.tsx`
- [x] T034 [US4] Integrate Chat UI with Assistant API

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T035 [P] Write integration tests for API endpoints in `backend/tests/integration/`
- [x] T036 [P] Validate offline capabilities manually (turn off network)
- [x] T037 Refactor UI styling (NativeWind) for consistency across screens
- [x] T038 Review error handling messages shown to the user
- [x] T039 Create `quickstart.md` validation script in `backend/scripts/seed_mock_data.py`

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
