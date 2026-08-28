# Interactions API

The Interactions API is our new interface and the most straightforward way
to build with Gemini models and agents. As of June 2026, it is Generally
Available and the recommended interface for all new projects.

While it is now considered legacy, the original
[`generateContent`](/docs/generate-content/text-generation) API
remains fully supported.

## Why use the Interactions API?  {% id="why-interactions" %}

*   **New capabilities out of the box**: Optional server-side conversation
  state using `previous_interaction_id`, observable execution steps for
  debugging and UI rendering, and background execution for long-running
  tasks using `background=true`.

*   **Lower cost with higher cache hit rates**: Server-side state management
  enables more efficient context caching across turns, reducing token costs
  for multi-turn conversations.

*   **Built for frontier models and agents**: Purpose-built for thinking
  models, multi-step tool use, and complex reasoning flows — simplifying
  the process of building, debugging, and orchestrating agentic
  applications.

*   **Single API for models and agents**: One unified interface for calling
  Gemini models and agents directly such as Deep Research and custom
  managed agents — no separate endpoints or patterns to learn.

*   **Where new things launch**: Going forward, new models and capabilities
  beyond the core mainline family, along with new agentic capabilities
  and tools, will launch on the Interactions API.


By default, the Interactions API stores requests so you can leverage
the server-side state management features by using
`previous_interaction_id`. You can opt into stateless behavior by setting
`store=false`. See the [data retention](/docs/interactions-overview#data-storage-retention) section for
details.

## Get started  {% id="get-started" %}

*   **Set up your coding agent**: Connect to the **Gemini Docs MCP** and install
  the `gemini-interactions-api` skill to give your assistant direct access to
  the latest developer docs and best practices.
  [Set up your coding agent →](/docs/coding-agents)

*   **Migrate from `generateContent`**: If you have an existing integration,
  follow the [Migration Guide](/docs/migrate-to-interactions) to
  transition to the Interactions API.

*   **Get started**: Get started in the [Interactions API Get started
  guide](/docs/get-started).


### Feature Guides  {% id="feature-guides" %}

Explore the specific capabilities of the Interactions API through these guides.
You can use the toggle on these pages to switch between generateContent and
Interactions API:

* [Text generation](/docs/text-generation)
* [Image generation](/docs/image-generation)
* [Image understanding](/docs/image-understanding)
* [Audio understanding](/docs/audio)
* [Video understanding](/docs/video-understanding)
* [Document processing](/docs/document-processing)
* [Function calling](/docs/function-calling)
* [Structured output](/docs/structured-output)
* [Deep Research agent](/docs/deep-research)
* [Flex inference](/docs/flex-inference)
* [Priority inference](/docs/priority-inference)

## How the Interactions API works  {% id="how-it-works" %}

The Interactions API centers around a core resource: the [**`Interaction`**](https://ai.google.dev/api/interactions-api#Resource:Interaction). An `Interaction` represents a complete turn in a conversation or task. It acts as a session record, containing the entire history of an interaction as a chronological sequence of **execution steps**. These steps include model thoughts, server-side or client-side tool calls and results (like `function_call` and `function_result`), and the final `model_output`. The stored resource (retrieved via `interactions.get`) also includes `user_input` steps for full context, though the `interactions.create` response only returns model-generated steps.

When you make a call to
[`interactions.create`](https://ai.google.dev/api/interactions-api#CreateInteraction), you are
creating a new `Interaction` resource.

### Server-side state management  {% id="server-side-state" %}

You can use the `id` of a completed interaction in a subsequent call using the
`previous_interaction_id` parameter to continue the conversation. The server
uses this ID to retrieve the conversation history, saving you from having to
resend the entire chat history.

The `previous_interaction_id` parameter preserves only the conversation history
(inputs and outputs) using `previous_interaction_id`. The other parameters are
**interaction-scoped** and apply only to the specific interaction you are
currently generating:

- `tools`
- `system_instruction`
- `generation_config` (including `thinking_level`, `temperature`, etc.)

This means you must re-specify these parameters in each new interaction if you
want them to apply. This server-side state management is optional; you can also
operate in stateless mode by sending the full conversation history in each
request.

### Data storage and retention  {% id="data-storage-retention" %}

By default, the API stores all Interaction objects (`store=true`) in order to
simplify use of server-side state management features (with
`previous_interaction_id`), background execution (using `background=true`) and
observability purposes.

- **Paid Tier**: The system retains interactions for **55 days**.
- **Free Tier**: The system retains interactions for **1 day**.

If you don't want this, you can
set `store=false` in your request. This control is separate from state
management; you can opt out of storage for any interaction. However, note that
`store=false` is incompatible with [background execution](/docs/background-execution) and prevents using
`previous_interaction_id` for subsequent turns.

For Paid Tier projects, you can configure the retention window in
[AI Studio](https://aistudio.google.com/logs) to automatically mark logs for
deletion from project storage after 7, 14, 28, or 55 days. A shorter retention
may affect retrieval of past conversations.

You can delete stored interactions at any time using the [`delete`]
(/api/interactions-api#deleteInteraction) method programmatically, which
requires the interaction ID. You can also view and manage stored interactions
logs, including deletion from project storage, in
[AI Studio](https://aistudio.google.com/logs).

After the retention period expires, your data will be
deleted automatically.

Interactions objects are processed according to the [terms](/docs/terms).

### View interactions in AI Studio  {% id="viewing-interactions-in-ai-studio" %}

The API stores Interactions API requests executed with `store=true` for
projects on the Paid Tier. You can view them directly from the
[Logs page in Google AI Studio](https://aistudio.google.com/logs). See the
[Logs guide](/docs/logs-datasets) for more.

## Best practices  {% id="best-practices" %}

* **Cache hit rate**: Implicit caching is supported in both stateful and
  stateless modes (see
  [Quickstart](/docs/get-started#4_multi-turn_conversations)). Using
  `previous_interaction_id` (stateful) to continue conversations allows the
  system to more easily utilize implicit caching for the conversation
  history, which improves performance and reduces costs.
* **Mixing interactions**: You have the flexibility to mix and match Agent and
  Model interactions within a conversation. For example, you can use a
  specialized agent, like the Deep Research agent, for initial data
  collection, and then use a standard Gemini model for follow-up tasks such as
  summarizing or reformatting, linking these steps with the
  `previous_interaction_id`.

## Supported models & agents  {% id="supported-models-agents" %}

| Model Name | Type | Model ID |
| :--- | :--- | :--- |
| Gemini 3.7 Flash | Model | `gemini-3.7-flash` |
| Gemini 3.6 Flash | Model | `gemini-3.6-flash` |
| Gemini 3.5 Flash | Model | `gemini-3.5-flash` |
| Gemini 3.1 Pro Preview | Model | `gemini-3.1-pro-preview` |
| Gemini 3.5 Flash-Lite | Model | `gemini-3.5-flash-lite` |
| Gemini 3.1 Flash-Lite | Model | `gemini-3.1-flash-lite` |
| Gemini 3 Flash Preview | Model | `gemini-3-flash-preview` |
| Gemini 2.5 Pro | Model | `gemini-2.5-pro` |
| Gemini 2.5 Flash | Model | `gemini-2.5-flash` |
| Gemini 2.5 Flash-lite | Model | `gemini-2.5-flash-lite` |
| Gemini 3 Pro Image | Model | `gemini-3-pro-image` |
| Gemini 3.1 Flash Image | Model | `gemini-3.1-flash-image` |
| Gemini 3.1 Flash TTS Preview | Model | `gemini-3.1-flash-tts-preview` |
| Gemma 4 31B IT | Model | `gemma-4-31b-it` |
| Gemma 4 26B MoE IT | Model | `gemma-4-26b-a4b-it` |
| Lyria 3 Clip Preview | Model | `lyria-3-clip-preview` |
| Lyria 3 Pro Preview | Model | `lyria-3-pro-preview` |
| Deep Research Preview | Agent | `deep-research-preview-04-2026` |
| Deep Research Preview | Agent | `deep-research-max-preview-04-2026` |
| Antigravity Preview | Agent | `antigravity-preview-05-2026` |

## SDKs  {% id="sdk" %}

You can use latest version of the Google GenAI SDKs in order to access
Interactions API.

* On Python, this is `google-genai` package from `2.3.0` version onwards.
* On JavaScript, this is `@google/genai` package from `2.3.0` version
  onwards.

You can learn more about how to install the SDKs on
[Libraries](/docs/libraries) page.

## Limitations  {% id="limitations" %}

* **Remote MCP**: Gemini 3 does not support remote MCP, this is coming soon.
* **Multi-turn model compatibility**: When mixing different models in a
  conversation (either stateful or stateless), subsequent models must support
  the output modalities of the previous models as input. For example, if you
  generate an image using `gemini-3.1-flash-image`, you cannot continue that
  conversation with a model that doesn't accept image inputs (such as a
  text-only model or a music-generation model like Lyria).

The following features are supported by the
[`generateContent`](/docs/generate-content/text-generation) API but are **not yet
available** in the Interactions API:

* **[Video metadata](/docs/video-understanding)**: The `video_metadata` field,
  used to set clipping intervals and custom frame rates for video understanding.
* **[Batch API](/docs/batch-api)**
* **[Automatic function calling (Python)](/docs/function-calling?example=meeting#automatic_function_calling_python_only)**
* **[Explicit caching](/docs/caching)**: Note that server-side implicit caching
  is available in the Interactions API via `previous_interaction_id`.
* **[Safety settings](/docs/safety-settings)**: Custom safety
  settings are not supported in the Interactions API.

## Feedback  {% id="feedback" %}

Your feedback is critical to the development of the Interactions API.
Share your thoughts, report bugs, or request features on our
[Google AI Developer Community Forum](https://discuss.ai.google.dev/c/gemini-api/4).

## What's next  {% id="whats-next" %}

* Try the [Interactions API quickstart notebook](https://colab.sandbox.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Get_started_interactions_api.ipynb).
* Learn more about the [Gemini Deep Research agent](/docs/deep-research).

