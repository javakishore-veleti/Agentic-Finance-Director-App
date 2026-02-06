# 🤖 Agentic Finance Director — Agent Inventory (Batch 2: AGT-051 → AGT-100)

> **50 Agents | Covering Agent Studio, Risk Intelligence, Monitoring, Admin**

> Part 2 of 4 batches (200 total agents)

---

## Agent Type Distribution (Batch 2)

| Agent Type | Count |
|-----------|-------|
| Learning Agent | 12 |
| Model-Based Reflex Agent | 11 |
| Agentic AI (Goal-Based) | 9 |
| Utility-Based Agent | 8 |
| Goal-Based Agent | 6 |
| Agentic AI (Cognitive/Conversational) | 1 |
| Hierarchical Agent (Multi-Agent System) | 1 |
| Cognitive/Conversational Agent | 1 |
| Agentic AI (Utility-Based) | 1 |

## Module Coverage (Batch 2)

| Module | Agents | Range |
|--------|--------|-------|
| Agent Studio | 18 | AGT-051 → AGT-068 |
| Risk Intelligence | 14 | AGT-069 → AGT-082 |
| Monitoring | 12 | AGT-083 → AGT-094 |
| Admin | 6 | AGT-095 → AGT-100 |

---

## 🔹 Agent Studio

### AGT-051 — Agent Health Monitor

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Agent Dashboard |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Continuously monitors all deployed agents for health degradation, performance regression, error spikes, and resource exhaustion |
| **Trigger** | Continuous (every 60s health check) + On error spike |
| **LLM Model** | Claude Haiku + Prometheus metrics |
| **Orchestrator** | n8n (health loop) + Prometheus Alertmanager |
| **Tools** | Health probe runner, metric aggregator, degradation detector, restart recommender, status dashboard updater |
| **Input** | Agent heartbeats, response times, error rates, memory/CPU usage, queue depths |
| **Output** | Health scorecard per agent, degradation alerts, auto-restart recommendations, trend report |
| **Databases** | Prometheus (metrics), PostgreSQL (agent registry), Redis (health cache) |
| **Guardrails** | No auto-restart without confirmation for critical agents, 3-strike policy for restart loops |
| **Error Handling** | Escalate to ops if agent unresponsive for >5min, circuit-breaker activation |
| **KPIs** | Health check coverage 100%, degradation detection <2min, false alarm <3% |
| **Multi-Agent** | Monitors ALL agents, feeds Agent Dashboard, alerts Ops Agent (AGT-073) |
| **Memory** | Medium-term (agent baseline performance profiles) |
| **MCP Tools** | MCP Agent Registry, MCP Prometheus Bridge |

### AGT-052 — Agent Builder Assistant

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Agent Builder |
| **Agent Type** | Agentic AI (Cognitive/Conversational) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Guides users through agent creation via natural language, suggesting configurations, tools, prompts, and guardrails based on the described use case |
| **Trigger** | User interaction in Agent Builder UI |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (multi-step wizard chain) |
| **Tools** | Template selector, tool recommender, prompt suggester, guardrail generator, config validator, deployment previewer |
| **Input** | User description of desired agent, available tools catalog, existing agent templates |
| **Output** | Complete agent configuration (JSON), suggested prompt, tool bindings, guardrail rules, test cases |
| **Databases** | PostgreSQL (agent configs), MongoDB (templates), pgvector (similar agent search) |
| **Guardrails** | Validate all configs before deployment, mandatory test run, security review for tool access |
| **Error Handling** | Suggest alternatives for invalid configurations, explain constraints clearly |
| **KPIs** | Agent creation time reduction >60%, first-deploy success rate >80%, user satisfaction >4.5/5 |
| **Multi-Agent** | Calls Prompt Optimizer (AGT-055), Test Generator (AGT-057) |
| **Memory** | Short-term (wizard conversation), Long-term (user's past agent designs) |
| **MCP Tools** | MCP Agent Config Server, MCP Tool Catalog |

### AGT-053 — Agent Performance Benchmarker

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Agent Dashboard |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Benchmarks agent performance across versions, comparing accuracy, latency, token cost, and user satisfaction to identify regression or improvement |
| **Trigger** | On new agent version deployment + Weekly batch comparison |
| **LLM Model** | Claude Haiku + statistical analysis |
| **Orchestrator** | n8n (batch benchmarks) |
| **Tools** | A/B test runner, statistical comparator, cost calculator, regression detector, report generator |
| **Input** | Agent run logs (current + prior versions), test suites, cost data, user feedback |
| **Output** | Benchmark report with version comparison, regression flags, cost delta, recommendation (promote/rollback) |
| **Databases** | PostgreSQL (runs), MongoDB (benchmarks), Prometheus (latency metrics) |
| **Guardrails** | Minimum sample size for statistical significance, no auto-promote without review |
| **Error Handling** | Flag insufficient data, extend benchmark period if inconclusive |
| **KPIs** | Regression detection >95%, benchmark turnaround <1hr, cost tracking accuracy >99% |
| **Multi-Agent** | Feeds Agent Health Monitor (AGT-051), notifies Agent Builder users |
| **Memory** | Long-term (historical benchmarks per agent for trend analysis) |
| **MCP Tools** | MCP Benchmark Engine, MCP Cost Tracker |

### AGT-054 — Agent Run Failure Diagnostician

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Run History |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Performs automated root cause analysis on failed agent runs using execution traces, logs, and error patterns to suggest fixes |
| **Trigger** | On agent run failure |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph (diagnostic chain) |
| **Tools** | Trace analyzer, log parser, error classifier, fix recommender, similar failure searcher |
| **Input** | Failed run trace (step-by-step), error messages, agent config, input data, historical failures |
| **Output** | Root cause diagnosis, fix recommendation, similar past failures, suggested config changes |
| **Databases** | PostgreSQL (runs), MongoDB (traces), pgvector (error embeddings for similarity) |
| **Guardrails** | No auto-fix without developer approval, log all diagnostic decisions |
| **Error Handling** | Escalate to human if diagnosis confidence <70%, provide raw trace for manual review |
| **KPIs** | Root cause accuracy >80%, mean time to diagnosis <2min, fix suggestion acceptance >60% |
| **Multi-Agent** | Queries Agent Health Monitor (AGT-051), feeds Run History dashboard |
| **Memory** | Long-term (growing failure pattern library via RAG) |
| **MCP Tools** | MCP Trace Analyzer, MCP Error Pattern Database |

### AGT-055 — Prompt Optimization Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Prompt Library |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive + Reactive |
| **Autonomy** | Medium |
| **Purpose** | Analyzes prompt performance metrics and suggests improvements using meta-prompting, few-shot optimization, and systematic A/B testing |
| **Trigger** | On-demand (user request) + Scheduled (weekly analysis of low-performing prompts) |
| **LLM Model** | Claude Opus (meta-prompting) |
| **Orchestrator** | LangGraph (optimization loop) |
| **Tools** | Prompt analyzer, meta-prompter, A/B test framework, token counter, performance scorer |
| **Input** | Current prompt, performance metrics (accuracy, latency, cost), sample inputs/outputs, failure cases |
| **Output** | Optimized prompt variant, expected improvement estimate, A/B test plan, token count delta |
| **Databases** | PostgreSQL (prompts), MongoDB (test results), pgvector (prompt embeddings) |
| **Guardrails** | Preserve prompt intent, validate on held-out test set, no deployment without developer approval |
| **Error Handling** | Revert to original if optimization degrades performance, alert prompt owner |
| **KPIs** | Average improvement >10% on target metric, optimization time <5min, regression rate <5% |
| **Multi-Agent** | Called by Agent Builder Assistant (AGT-052), feeds Prompt Library |
| **Memory** | Long-term (optimization history, what works per domain) |
| **MCP Tools** | MCP Prompt Engine, MCP Evaluation Framework |

### AGT-056 — Multi-Model Comparison Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Chat Playground |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Runs the same prompt across multiple LLMs (Claude, GPT, Ollama) simultaneously and provides side-by-side comparison with quality scoring |
| **Trigger** | User request in Chat Playground |
| **LLM Model** | Claude Opus + OpenAI GPT + Ollama (local) |
| **Orchestrator** | LangGraph (parallel execution) |
| **Tools** | Multi-model dispatcher, response scorer, latency profiler, cost calculator, diff viewer |
| **Input** | User prompt, model selection, evaluation criteria, temperature/parameter settings |
| **Output** | Side-by-side responses, quality scores per dimension, latency comparison, cost breakdown |
| **Databases** | PostgreSQL (comparison sessions), MongoDB (responses), Redis (streaming cache) |
| **Guardrails** | Token budget limits per comparison, rate limiting per model, no sensitive data to external models without consent |
| **Error Handling** | Show partial results if one model times out, note model availability status |
| **KPIs** | Comparison latency <10s, model coverage >3 models, user decision support score >4/5 |
| **Multi-Agent** | None (standalone comparison tool) |
| **Memory** | Short-term (current comparison session) |
| **MCP Tools** | MCP Model Gateway, MCP Evaluation Framework |

### AGT-057 — Agent Test Case Generator

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Agent Builder |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Auto-generates comprehensive test cases for new agents including edge cases, adversarial inputs, and regression tests based on agent configuration |
| **Trigger** | On agent config save + On-demand |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph |
| **Tools** | Test case generator, edge case synthesizer, adversarial input crafter, expected output estimator |
| **Input** | Agent configuration, tool bindings, prompt template, sample inputs, domain knowledge |
| **Output** | Test suite (JSON) with test cases, expected outputs, edge cases, adversarial inputs, pass criteria |
| **Databases** | PostgreSQL (test suites), MongoDB (test results) |
| **Guardrails** | Minimum 20 test cases per agent, include at least 5 edge cases, 3 adversarial inputs |
| **Error Handling** | Generate basic tests even with limited config info, flag areas needing manual test design |
| **KPIs** | Test coverage >85%, edge case detection >70%, test generation time <3min |
| **Multi-Agent** | Called by Agent Builder Assistant (AGT-052), used by Benchmarker (AGT-053) |
| **Memory** | Long-term (test patterns per agent type, common failure modes) |
| **MCP Tools** | MCP Test Framework, MCP Agent Config Server |

### AGT-058 — Token Cost Attribution Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Run History |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Tracks and attributes LLM token consumption and costs per agent, department, use case, and time period for budget management and optimization |
| **Trigger** | On every agent run completion + Daily aggregation |
| **LLM Model** | Rule engine (no LLM needed for core function) |
| **Orchestrator** | n8n (aggregation pipeline) |
| **Tools** | Token counter, cost calculator, attribution mapper, budget tracker, trend analyzer |
| **Input** | Agent run logs with token counts, model pricing, department mappings, budget allocations |
| **Output** | Cost attribution dashboard data, department cost reports, budget alerts, optimization recommendations |
| **Databases** | PostgreSQL (cost data), Redis (real-time counters), Prometheus (usage metrics) |
| **Guardrails** | Budget ceiling enforcement, alert at 80% budget consumption, no spend beyond allocation without approval |
| **Error Handling** | Estimate cost if token count missing, flag incomplete runs |
| **KPIs** | Cost tracking accuracy >99%, budget alert lead time >1 week, cost allocation completeness 100% |
| **Multi-Agent** | Feeds Agent Dashboard, alerts Admin (AGT-091) for budget management |
| **Memory** | Long-term (cost trends, seasonal usage patterns) |
| **MCP Tools** | MCP Cost Tracker, MCP Budget Server |

### AGT-059 — Hallucination Detection Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Run History |
| **Agent Type** | Learning Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Validates agent outputs against source data and knowledge bases to detect hallucinated facts, fabricated numbers, and unsupported claims |
| **Trigger** | Post-agent-run validation (inline) + Batch audit |
| **LLM Model** | Claude Sonnet (cross-verification) |
| **Orchestrator** | LangGraph (verification chain) |
| **Tools** | Fact checker, number validator, source verifier, claim extractor, confidence scorer |
| **Input** | Agent output, source documents/data used, knowledge base, financial facts database |
| **Output** | Verification report: confirmed/unconfirmed/hallucinated claims, confidence per claim, flagged items |
| **Databases** | PostgreSQL (verification logs), pgvector (knowledge base), MongoDB (fact database) |
| **Guardrails** | Flag any unverifiable financial numbers, block publication of outputs with hallucination score >20% |
| **Error Handling** | Conservative flagging if verification data unavailable, human review queue |
| **KPIs** | Hallucination detection >90%, false positive <8%, verification latency <5s per output |
| **Multi-Agent** | Post-processing for ALL content-generating agents, feeds quality dashboard |
| **Memory** | Long-term (common hallucination patterns, trusted vs untrusted sources) |
| **MCP Tools** | MCP Fact Verification Server, MCP Knowledge Base |

### AGT-060 — Engine Load Balancer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Engine Configuration |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | High |
| **Purpose** | Dynamically routes agent execution requests across available LLM engines (Claude, GPT, Ollama, Bedrock) based on load, cost, latency, and capability |
| **Trigger** | On every agent execution request + Proactive capacity planning |
| **LLM Model** | Rule engine + Claude Haiku (capacity planning) |
| **Orchestrator** | API Gateway + Redis (routing decisions) |
| **Tools** | Load monitor, capability matcher, cost optimizer, latency predictor, failover manager |
| **Input** | Incoming request, engine health status, current load, cost budgets, capability requirements |
| **Output** | Engine routing decision, expected latency, cost estimate, failover plan |
| **Databases** | Redis (load metrics, routing cache), Prometheus (engine health), PostgreSQL (routing policies) |
| **Guardrails** | Respect engine capability requirements, never downgrade model for critical tasks, cost ceiling enforcement |
| **Error Handling** | Automatic failover to secondary engine, queue requests if all engines overloaded |
| **KPIs** | Routing latency <50ms, engine utilization >70%, cost optimization >15% vs static routing |
| **Multi-Agent** | Serves ALL agents as infrastructure layer |
| **Memory** | Short-term (current load state), Medium-term (traffic patterns for pre-scaling) |
| **MCP Tools** | MCP Model Gateway, MCP Load Monitor |

### AGT-061 — Prompt Security Scanner Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Prompt Library |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Scans prompts for injection vulnerabilities, jailbreak patterns, data exfiltration risks, and policy violations before deployment |
| **Trigger** | On prompt save/update + Scheduled scan of all deployed prompts |
| **LLM Model** | Claude Sonnet (adversarial analysis) |
| **Orchestrator** | n8n (scanning pipeline) |
| **Tools** | Injection pattern detector, jailbreak classifier, data leak analyzer, policy compliance checker |
| **Input** | Prompt text, tool bindings, data access permissions, security policy rules |
| **Output** | Security report with vulnerabilities, risk score, remediation suggestions, pass/fail decision |
| **Databases** | PostgreSQL (prompts), MongoDB (vulnerability patterns) |
| **Guardrails** | Block deployment of high-risk prompts, mandatory fix for critical vulnerabilities |
| **Error Handling** | Conservative blocking if scanner uncertain, manual security review option |
| **KPIs** | Vulnerability detection >95%, false positive <5%, scan time <30s per prompt |
| **Multi-Agent** | Gates prompt deployment pipeline, feeds Audit Log Agent (AGT-095) |
| **Memory** | Long-term (evolving vulnerability pattern library) |
| **MCP Tools** | MCP Security Scanner, MCP Policy Engine |

### AGT-062 — Agent Version Manager

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Agent Builder |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Manages agent versioning lifecycle including blue-green deployments, canary releases, A/B testing, and automated rollback on regression |
| **Trigger** | On deployment request + On regression detection |
| **LLM Model** | Rule engine + Claude Haiku (decision support) |
| **Orchestrator** | n8n (deployment pipeline) |
| **Tools** | Version controller, canary deployer, traffic splitter, regression monitor, rollback executor |
| **Input** | Agent versions, deployment config, canary criteria, regression thresholds |
| **Output** | Deployment status, canary results, rollback decisions, version lifecycle report |
| **Databases** | PostgreSQL (versions), MongoDB (deployment history), Redis (canary state) |
| **Guardrails** | Canary minimum duration 1hr, rollback if error rate >2x baseline, no force-deploy without override |
| **Error Handling** | Automatic rollback on regression, alert development team, post-mortem trigger |
| **KPIs** | Zero-downtime deployments 100%, regression detection <5min, rollback time <30s |
| **Multi-Agent** | Works with Benchmarker (AGT-053), Health Monitor (AGT-051) |
| **Memory** | Medium-term (deployment history, regression patterns) |
| **MCP Tools** | MCP Deployment Engine, MCP Agent Registry |

### AGT-063 — Agent Collaboration Coordinator

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Agent Dashboard |
| **Agent Type** | Hierarchical Agent (Multi-Agent System) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Orchestrates multi-agent workflows where multiple specialized agents collaborate on complex tasks, managing data flow, sequencing, and conflict resolution |
| **Trigger** | On complex task requiring >1 agent + Scheduled multi-agent workflows |
| **LLM Model** | Claude Opus (orchestration decisions) |
| **Orchestrator** | LangGraph (DAG orchestrator) + CrewAI |
| **Tools** | Task decomposer, agent selector, data flow manager, conflict resolver, result aggregator |
| **Input** | Complex task description, available agents, their capabilities, dependency graph |
| **Output** | Orchestrated result from multiple agents, execution trace, performance attribution per agent |
| **Databases** | PostgreSQL (workflow configs), MongoDB (execution logs), Redis (inter-agent messaging) |
| **Guardrails** | Deadlock detection, timeout per agent step, human checkpoint for critical decisions |
| **Error Handling** | Retry failed agent steps, substitute alternative agents, partial result delivery |
| **KPIs** | Workflow success rate >92%, orchestration overhead <10% of total time, agent utilization >80% |
| **Multi-Agent** | META-AGENT: orchestrates any combination of agents in the platform |
| **Memory** | Short-term (workflow state), Long-term (successful workflow patterns) |
| **MCP Tools** | MCP Workflow Engine, MCP Agent Registry, MCP Inter-Agent Bus |

### AGT-064 — Prompt Template Parameterizer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Prompt Library |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Converts specific prompts into reusable parameterized templates with variable extraction, type validation, and default value suggestions |
| **Trigger** | On-demand (user requests template creation) |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | Variable extractor, type inferrer, default suggester, template validator, documentation generator |
| **Input** | Specific prompt text, usage context, desired parameters |
| **Output** | Parameterized template with variables, types, defaults, validation rules, usage documentation |
| **Databases** | PostgreSQL (templates), MongoDB (variable catalogs) |
| **Guardrails** | Validate template produces valid output with all default values, test with edge cases |
| **Error Handling** | Flag ambiguous variables for manual definition, suggest alternatives |
| **KPIs** | Template reuse rate >40%, parameterization accuracy >95%, time savings >50% |
| **Multi-Agent** | Feeds Prompt Library, used by Agent Builder Assistant (AGT-052) |
| **Memory** | Long-term (common parameter patterns per domain) |
| **MCP Tools** | MCP Prompt Engine, MCP Template Validator |

### AGT-065 — Agent ROI Calculator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Agent Dashboard |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Calculates ROI for each deployed agent by comparing automation time savings and quality improvements against compute costs and maintenance effort |
| **Trigger** | Monthly (batch calculation) + On-demand |
| **LLM Model** | Claude Haiku + cost modeling |
| **Orchestrator** | n8n (batch job) |
| **Tools** | Time savings estimator, cost aggregator, quality impact scorer, ROI calculator, report generator |
| **Input** | Agent run counts, processing times, manual baseline times, compute costs, maintenance hours |
| **Output** | ROI report per agent, cost-benefit analysis, recommendations for optimization or retirement |
| **Databases** | PostgreSQL (cost/usage data), MongoDB (baseline estimates) |
| **Guardrails** | Use conservative estimates for time savings, require validated baselines |
| **Error Handling** | Flag agents with insufficient baseline data, use industry benchmarks as proxy |
| **KPIs** | ROI calculation coverage 100% of agents, report delivery <1 day, accuracy validation quarterly |
| **Multi-Agent** | Uses Token Cost Agent (AGT-058) data, feeds executive reporting |
| **Memory** | Long-term (ROI trends per agent over time) |
| **MCP Tools** | MCP Cost Tracker, MCP HR Time Server |

### AGT-066 — Playground Conversation Evaluator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Chat Playground |
| **Agent Type** | Learning Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Evaluates agent conversation quality using rubric scoring, semantic similarity to expected outputs, and multi-dimensional quality metrics |
| **Trigger** | On evaluation request in Chat Playground |
| **LLM Model** | Claude Opus (judge model) |
| **Orchestrator** | LangGraph (evaluation chain) |
| **Tools** | Rubric scorer, semantic similarity calculator, factual accuracy checker, tone analyzer, coherence scorer |
| **Input** | Agent conversation, evaluation rubric, expected outputs (if available), quality criteria |
| **Output** | Multi-dimensional quality score, per-turn evaluation, improvement suggestions, comparison vs baseline |
| **Databases** | PostgreSQL (evaluations), MongoDB (rubrics), pgvector (semantic similarity) |
| **Guardrails** | Use multiple evaluation dimensions, flag subjective scores, require calibration samples |
| **Error Handling** | Partial evaluation if some dimensions unavailable, note confidence level |
| **KPIs** | Inter-rater reliability >0.8, evaluation time <10s per conversation, correlation with human judgment >0.85 |
| **Multi-Agent** | Used in Model Comparison (AGT-056), feeds Prompt Optimizer (AGT-055) |
| **Memory** | Long-term (calibration data, quality benchmarks per domain) |
| **MCP Tools** | MCP Evaluation Framework, MCP Semantic Engine |

### AGT-067 — Engine Config Optimizer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Engine Configuration |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Recommends optimal engine configurations (model selection, temperature, max tokens, rate limits) per agent based on task requirements and cost targets |
| **Trigger** | On new agent deployment + Monthly optimization review |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | Config analyzer, cost-quality optimizer, benchmark runner, config recommender |
| **Input** | Agent requirements, available models, cost budgets, quality thresholds, historical performance |
| **Output** | Optimized engine config per agent, expected cost/quality trade-offs, migration plan if model switch needed |
| **Databases** | PostgreSQL (configs), MongoDB (benchmarks), Prometheus (performance data) |
| **Guardrails** | No downgrade for safety-critical agents, validate quality before cost optimization |
| **Error Handling** | Conservative defaults if optimization data insufficient, A/B test before full switch |
| **KPIs** | Cost reduction >15% without quality loss, config coverage 100%, optimization cycle <1hr |
| **Multi-Agent** | Feeds Engine Load Balancer (AGT-060), uses Benchmarker (AGT-053) data |
| **Memory** | Long-term (model performance characteristics, cost-quality Pareto curves) |
| **MCP Tools** | MCP Model Gateway, MCP Config Optimizer |

### AGT-068 — Agent Documentation Generator

| Field | Value |
|-------|-------|
| **Module / Page** | Agent Studio → Agent Builder |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Auto-generates comprehensive documentation for agents including API specs, configuration guides, usage examples, and troubleshooting guides |
| **Trigger** | On agent deployment + On config change |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | Config reader, API spec generator, example crafter, troubleshooting guide builder, Markdown renderer |
| **Input** | Agent configuration, tool bindings, prompt templates, run history, error patterns |
| **Output** | Structured documentation (Markdown/HTML) with API specs, examples, troubleshooting, changelog |
| **Databases** | PostgreSQL (agent configs), MongoDB (docs), S3 (published docs) |
| **Guardrails** | Validate all code examples work, include security notes, version-specific documentation |
| **Error Handling** | Generate partial docs for incomplete configs, flag sections needing manual input |
| **KPIs** | Documentation coverage 100% of deployed agents, freshness <24hrs post-change, developer satisfaction >4/5 |
| **Multi-Agent** | Reads from Agent Registry, Version Manager (AGT-062) |
| **Memory** | Long-term (documentation templates, common patterns) |
| **MCP Tools** | MCP Documentation Engine, MCP Agent Registry |

## 🔹 Risk Intelligence

### AGT-069 — Risk Alert Triage Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Alert Center |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Automatically triages incoming risk alerts by classifying severity, category, affected entities, and routing to appropriate risk owners |
| **Trigger** | Event-driven (new alert from any module) |
| **LLM Model** | Claude Haiku + XGBoost classifier |
| **Orchestrator** | Redis pub/sub + n8n (routing) |
| **Tools** | Severity classifier, category tagger, entity extractor, owner mapper, SLA timer |
| **Input** | Raw alert payload, risk taxonomy, ownership matrix, SLA definitions |
| **Output** | Triaged alert with severity, category, owner assignment, SLA deadline, investigation playbook link |
| **Databases** | PostgreSQL (alerts), Redis (triage queue), MongoDB (playbooks) |
| **Guardrails** | Critical alerts bypass queue and notify immediately, no auto-close without investigation |
| **Error Handling** | Default to high severity if classification uncertain, broadcast to risk team |
| **KPIs** | Triage accuracy >94%, latency <30s, SLA assignment 100% |
| **Multi-Agent** | Feeds Investigation Agent (AGT-070), Alert Dashboard |
| **Memory** | Short-term (current alert context) |
| **MCP Tools** | MCP Alert Intake Server, MCP Risk Taxonomy |

### AGT-070 — Risk Investigation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Alert Center |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Conducts automated investigation of risk alerts by gathering evidence, analyzing context, correlating with other events, and producing investigation reports |
| **Trigger** | On alert triage completion (for P1/P2 alerts) |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (investigation chain) |
| **Tools** | Evidence gatherer, context enricher, event correlator, timeline builder, report generator, root cause analyzer |
| **Input** | Triaged alert, relevant financial data, activity logs, historical similar alerts, external data |
| **Output** | Investigation report with findings, evidence, timeline, root cause hypothesis, recommended actions |
| **Databases** | PostgreSQL (alerts, activity), MongoDB (investigations), pgvector (similar alert search) |
| **Guardrails** | Human review required before action, evidence-backed conclusions only, confidentiality protocols |
| **Error Handling** | Partial investigation if some data unavailable, escalate if >4hr without conclusion |
| **KPIs** | Investigation completion <4hrs for P1, root cause identification >75%, evidence quality >4/5 |
| **Multi-Agent** | Uses Activity Anomaly Agent (AGT-004), GL Health Agent (AGT-045), Fraud Agent (AGT-037) |
| **Memory** | Long-term (investigation patterns, similar case library via RAG) |
| **MCP Tools** | MCP Investigation Engine, MCP Evidence Collector, MCP Timeline Builder |

### AGT-071 — Composite Risk Scorer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Risk Dashboard |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Calculates composite risk scores across all risk categories (financial, operational, compliance, cyber, market) using weighted multi-factor models |
| **Trigger** | Daily + On significant risk event |
| **LLM Model** | Claude Sonnet + ensemble risk models |
| **Orchestrator** | LangGraph (scoring pipeline) |
| **Tools** | Risk factor aggregator, weight calibrator, score calculator, heatmap generator, trend analyzer |
| **Input** | Risk factor data from all modules, risk appetite parameters, historical risk events, external indicators |
| **Output** | Composite risk score (0-100), category scores, risk heatmap, trend direction, top risk drivers |
| **Databases** | PostgreSQL (risk scores), MongoDB (risk factors), Redis (score cache) |
| **Guardrails** | Transparent scoring methodology, weight adjustments require risk committee approval |
| **Error Handling** | Use prior score with staleness warning if data unavailable, flag missing categories |
| **KPIs** | Score calculation <5min, coverage of all risk categories, correlation with actual losses >0.7 |
| **Multi-Agent** | Aggregates from Fraud Agent (AGT-037), Liquidity Agent (AGT-038), Compliance Agent (AGT-097) |
| **Memory** | Long-term (risk score history, model calibration) |
| **MCP Tools** | MCP Risk Scoring Engine, MCP Risk Factor Server |

### AGT-072 — Emerging Risk Detector Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Risk Dashboard |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Scans external data sources (news, regulatory filings, market data) to detect emerging risks that could affect the organization before they materialize |
| **Trigger** | Scheduled (every 2 hours) + On major market event |
| **LLM Model** | Claude Opus + NLP pipeline |
| **Orchestrator** | LangGraph (scanning + analysis chain) |
| **Tools** | News scanner, regulatory monitor, market signal detector, impact assessor, early warning generator |
| **Input** | News feeds, SEC/regulatory filings, market data, industry reports, company watchlist |
| **Output** | Emerging risk report with identified risks, probability assessment, potential impact, recommended monitoring actions |
| **Databases** | PostgreSQL (risk register), pgvector (news embeddings), MongoDB (external data) |
| **Guardrails** | Source credibility scoring, no panic alerts without corroboration, probability qualification |
| **Error Handling** | Skip unreachable data sources, flag reduced coverage, stale data warnings |
| **KPIs** | Emerging risk detection lead time >30 days, false positive <15%, coverage >90% of relevant sources |
| **Multi-Agent** | Feeds Financial News Agent (AGT-011), Composite Risk Scorer (AGT-071) |
| **Memory** | Long-term (evolving risk landscape, entity-risk relationships) |
| **MCP Tools** | MCP News Feed Server, MCP Regulatory Monitor, MCP Market Data Server |

### AGT-073 — Alert Rule Tuning Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Alert Rules |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Analyzes alert rule effectiveness (hit rate, false positive rate, missed events) and recommends threshold adjustments and new rules |
| **Trigger** | Weekly batch analysis + On alert rule performance degradation |
| **LLM Model** | Claude Sonnet + statistical analysis |
| **Orchestrator** | LangGraph (analysis chain) |
| **Tools** | Rule performance analyzer, threshold optimizer, false positive tracker, backtester, recommendation generator |
| **Input** | Alert history, rule configurations, outcome data (true positive, false positive), user feedback |
| **Output** | Rule performance report, threshold adjustment recommendations, new rule suggestions, retirement candidates |
| **Databases** | PostgreSQL (rules, alerts), MongoDB (rule performance history) |
| **Guardrails** | No auto-adjust thresholds without risk team approval, minimum data for statistical significance |
| **Error Handling** | Conservative (tighter) thresholds if analysis inconclusive, alert risk team |
| **KPIs** | False positive reduction >20%, missed event reduction >15%, rule coverage improvement >10% |
| **Multi-Agent** | Feeds Alert Rules UI, uses Alert Triage (AGT-069) outcome data |
| **Memory** | Long-term (rule performance trends, optimal thresholds per risk category) |
| **MCP Tools** | MCP Rule Engine, MCP Alert Analytics Server |

### AGT-074 — Natural Language Rule Creator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Alert Rules |
| **Agent Type** | Cognitive/Conversational Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Translates natural language alert rule descriptions (e.g., 'Alert me if cash drops below $1M in any account') into structured rule configurations |
| **Trigger** | User input in Alert Rules UI |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (NL-to-rule chain) |
| **Tools** | NL rule parser, metric mapper, threshold extractor, rule validator, preview runner |
| **Input** | Natural language rule description, available metrics, existing rules, notification channels |
| **Output** | Structured rule config (JSON), validation results, preview of what the rule would have caught historically |
| **Databases** | PostgreSQL (rules), Redis (metric catalog) |
| **Guardrails** | Always confirm rule interpretation with user, validate against historical data, prevent conflicting rules |
| **Error Handling** | Ask clarifying questions for ambiguous rules, suggest closest valid configuration |
| **KPIs** | Rule extraction accuracy >90%, user confirmation rate >85%, historical preview availability >80% |
| **Multi-Agent** | Output validated by Rule Tuning Agent (AGT-073) |
| **Memory** | Short-term (conversation context for refinement) |
| **MCP Tools** | MCP Rule Engine, MCP Metric Catalog |

### AGT-075 — Risk Trend Analyzer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Alert History |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Analyzes historical alert patterns to identify risk trends, seasonal patterns, escalation patterns, and predict future alert volumes |
| **Trigger** | Weekly batch + Monthly trend report |
| **LLM Model** | Claude Sonnet + time-series analysis |
| **Orchestrator** | n8n (batch analysis) |
| **Tools** | Trend detector, seasonal decomposer, pattern classifier, volume predictor, report generator |
| **Input** | Alert history (12+ months), resolution data, category metadata, external event calendar |
| **Output** | Trend report with charts, seasonal patterns, volume forecast, emerging pattern alerts |
| **Databases** | PostgreSQL (alert history), MongoDB (trend analysis results) |
| **Guardrails** | Statistical significance requirements, distinguish trend from noise |
| **Error Handling** | Flag insufficient data periods, note confidence level per finding |
| **KPIs** | Trend identification lead time >2 weeks, pattern accuracy >80%, report relevance >85% |
| **Multi-Agent** | Feeds Risk Dashboard, Composite Risk Scorer (AGT-071) |
| **Memory** | Long-term (historical trend patterns, seasonal baselines) |
| **MCP Tools** | MCP Alert Analytics Server, MCP Time-Series Engine |

### AGT-076 — Risk Mitigation Tracker Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Risk Dashboard |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Tracks risk mitigation actions through to completion, monitors effectiveness of implemented controls, and alerts on overdue or ineffective mitigations |
| **Trigger** | Daily status check + On mitigation deadline approach |
| **LLM Model** | Claude Haiku |
| **Orchestrator** | n8n (tracking workflow) |
| **Tools** | Action tracker, deadline monitor, effectiveness scorer, escalation alerter, progress reporter |
| **Input** | Mitigation actions, deadlines, owners, risk register, control test results |
| **Output** | Mitigation status dashboard, overdue alerts, effectiveness report, risk residual score updates |
| **Databases** | PostgreSQL (mitigations), MongoDB (effectiveness data) |
| **Guardrails** | Escalation at 80% of deadline, mandatory update from owners weekly, no auto-close |
| **Error Handling** | Escalate to risk committee if owner unresponsive, flag stale mitigations |
| **KPIs** | On-time completion >85%, tracking coverage 100%, escalation lead time >3 days |
| **Multi-Agent** | Updates Composite Risk Scorer (AGT-071), feeds Board reporting |
| **Memory** | Medium-term (mitigation history, effectiveness baselines) |
| **MCP Tools** | MCP Risk Register, MCP Action Tracker |

### AGT-077 — Alert Fatigue Prevention Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Alert Center |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Monitors alert volumes per user, detects alert fatigue indicators, and recommends consolidation, suppression, or digest strategies to maintain alert effectiveness |
| **Trigger** | Daily analysis + On alert volume spike |
| **LLM Model** | Claude Haiku + behavioral analysis |
| **Orchestrator** | n8n |
| **Tools** | Volume analyzer, response time tracker, fatigue indicator detector, consolidation recommender, digest builder |
| **Input** | Alert volumes per user, response times, dismissal rates, click-through rates, user feedback |
| **Output** | Fatigue risk scores per user, consolidation recommendations, digest activation triggers |
| **Databases** | PostgreSQL (alert metrics), Redis (user behavior cache) |
| **Guardrails** | Never suppress critical alerts, maintain minimum visibility for regulatory alerts |
| **Error Handling** | Conservative (show more) if fatigue analysis uncertain |
| **KPIs** | Alert response rate improvement >20%, user satisfaction improvement >15%, critical alert visibility 100% |
| **Multi-Agent** | Feeds Notification Router (AGT-003), Digest Agent (AGT-007) |
| **Memory** | Long-term (per-user alert fatigue profiles) |
| **MCP Tools** | MCP Alert Analytics Server, MCP User Behavior Engine |

### AGT-078 — Risk Report Generator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Risk Dashboard |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Generates comprehensive risk reports for audit committee, board, and regulators with AI-generated narratives, trend analysis, and forward-looking assessments |
| **Trigger** | Quarterly (pre-board meeting) + On-demand |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (multi-agent assembly) |
| **Tools** | Data aggregator, narrative generator, chart builder, PDF/PPTX renderer, compliance formatter |
| **Input** | Risk scores, alert history, mitigation status, emerging risks, regulatory requirements |
| **Output** | Board-ready risk report (PDF/PPTX) with executive summary, heat map, trends, forward look |
| **Databases** | PostgreSQL (risk data), MongoDB (report templates), S3 (published reports) |
| **Guardrails** | CRO review before publication, consistent methodology, regulatory format compliance |
| **Error Handling** | Flag incomplete sections, provide draft with data gap placeholders |
| **KPIs** | Report assembly <45min, CRO revision rounds <2, regulatory compliance 100% |
| **Multi-Agent** | Orchestrates Composite Scorer (AGT-071), Trend Analyzer (AGT-075), Emerging Risk (AGT-072) |
| **Memory** | Long-term (historical report format, board preferences) |
| **MCP Tools** | MCP Report Generator, MCP Risk Data Server |

### AGT-079 — Alert Correlation Engine Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Alert Center |
| **Agent Type** | Agentic AI (Utility-Based) |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | High |
| **Purpose** | Detects correlated alerts across modules and time windows, identifying cascading failures, common root causes, and compound risk events |
| **Trigger** | On new P1/P2 alert + Batch correlation analysis (hourly) |
| **LLM Model** | Claude Sonnet + graph analysis |
| **Orchestrator** | LangGraph (correlation chain) |
| **Tools** | Temporal correlator, cross-module linker, causal graph builder, compound event detector, impact amplifier |
| **Input** | Alert stream from all modules, temporal windows, entity relationships, historical correlations |
| **Output** | Correlated alert clusters, causal hypothesis, compound risk score, unified investigation case |
| **Databases** | PostgreSQL (alerts), MongoDB (correlation patterns), Redis (real-time correlation window) |
| **Guardrails** | Minimum correlation confidence 0.7, human review for compound risk designation |
| **Error Handling** | Log potential correlations below threshold for future analysis, no false correlation claims |
| **KPIs** | Correlation detection >85%, false correlation <10%, cascading failure early warning >5min |
| **Multi-Agent** | Correlates alerts from ALL module agents, feeds Investigation Agent (AGT-070) |
| **Memory** | Long-term (correlation patterns, known cascading failure sequences) |
| **MCP Tools** | MCP Alert Correlation Engine, MCP Graph Analysis Server |

### AGT-080 — Regulatory Compliance Monitor Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Risk Dashboard |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Monitors regulatory changes (SOX, IFRS, SEC, GDPR) and assesses their impact on current operations, flagging compliance gaps and required actions |
| **Trigger** | Daily regulatory scan + On new regulation publication |
| **LLM Model** | Claude Opus + NLP |
| **Orchestrator** | n8n (feed scanning) + LangGraph (impact analysis) |
| **Tools** | Regulatory feed scanner, change detector, impact assessor, gap analyzer, action item generator |
| **Input** | Regulatory feeds, current compliance status, control matrix, policy documents |
| **Output** | Regulatory change alerts, impact assessments, compliance gap analysis, required action items |
| **Databases** | PostgreSQL (compliance), pgvector (regulatory documents), MongoDB (regulations) |
| **Guardrails** | Legal review for material regulatory interpretations, no compliance advice without qualification |
| **Error Handling** | Conservative flagging of potential impacts, escalate uncertain interpretations to legal |
| **KPIs** | Regulatory change detection <48hrs, impact assessment coverage >90%, gap identification >85% |
| **Multi-Agent** | Feeds SOX Evidence Agent (AGT-049), Audit Agent (AGT-095), Risk Scorer (AGT-071) |
| **Memory** | Long-term (regulatory landscape, historical compliance patterns) |
| **MCP Tools** | MCP Regulatory Feed Server, MCP Compliance Framework |

### AGT-081 — False Positive Learner Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Alert History |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Learns from alert dismissals and false positive feedback to continuously improve alert accuracy across all risk categories |
| **Trigger** | On alert dismissal/resolution + Weekly learning cycle |
| **LLM Model** | Claude Haiku + classification model retraining |
| **Orchestrator** | n8n (feedback loop) |
| **Tools** | Feedback collector, false positive classifier, model retrainer, threshold adjuster, improvement tracker |
| **Input** | Dismissed alerts with reasons, false positive flags, user feedback, alert outcomes |
| **Output** | Updated classification models, adjusted thresholds, false positive trend report, improvement metrics |
| **Databases** | PostgreSQL (alert outcomes), MongoDB (model artifacts) |
| **Guardrails** | Minimum sample size for model updates, human review of threshold changes, no regression on true positive rate |
| **Error Handling** | Rollback model update if true positive rate drops, alert risk team |
| **KPIs** | False positive reduction >5% per quarter, true positive rate maintained >90%, learning cycle <1hr |
| **Multi-Agent** | Updates models used by Alert Triage (AGT-069), Rule Tuning (AGT-073) |
| **Memory** | Long-term (evolving false positive patterns, model versions) |
| **MCP Tools** | MCP ML Training Pipeline, MCP Alert Analytics Server |

### AGT-082 — Risk Scenario Stress Tester Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Risk Intelligence → Risk Dashboard |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | Medium |
| **Purpose** | Runs stress test scenarios against current risk posture to model impact of extreme events (market crash, fraud event, system outage, regulatory penalty) |
| **Trigger** | Quarterly scheduled + On-demand + On major risk event |
| **LLM Model** | Claude Opus + Monte Carlo simulation |
| **Orchestrator** | LangGraph (stress test pipeline) |
| **Tools** | Scenario builder, impact simulator, loss estimator, resilience scorer, recovery time modeler |
| **Input** | Current risk posture, stress scenarios, financial data, insurance coverage, BCP plans |
| **Output** | Stress test results with loss estimates, recovery timelines, resilience scores, gap identification |
| **Databases** | PostgreSQL (risk data), MongoDB (stress test results), S3 (scenario library) |
| **Guardrails** | Use established stress scenarios (Basel, custom), document assumptions, board-approved scenarios |
| **Error Handling** | Partial results if some modules unavailable, flag assumptions and limitations |
| **KPIs** | Scenario coverage >10 scenarios, completion <30min per scenario, board-ready format |
| **Multi-Agent** | Uses Scenario Simulation (AGT-017), Composite Risk (AGT-071), Liquidity (AGT-038) |
| **Memory** | Long-term (stress test history, scenario calibration) |
| **MCP Tools** | MCP Stress Test Engine, MCP Simulation Server |

## 🔹 Monitoring

### AGT-083 — Infrastructure Anomaly Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → System Health |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Detects anomalous patterns in infrastructure metrics (CPU, memory, disk, network) using multi-variate anomaly detection before they cause outages |
| **Trigger** | Continuous (every 30s metric ingestion) + Batch analysis (hourly) |
| **LLM Model** | Isolation Forest + LSTM + Claude Haiku (explanation) |
| **Orchestrator** | Prometheus Alertmanager + LangGraph (analysis) |
| **Tools** | Multi-variate anomaly detector, metric correlator, capacity predictor, alert generator, root cause hypothesizer |
| **Input** | Infrastructure metrics (CPU, memory, disk, network), container stats, deployment events |
| **Output** | Anomaly alerts with context, predicted impact, root cause hypothesis, recommended actions |
| **Databases** | Prometheus (metrics), PostgreSQL (incidents), Redis (anomaly state) |
| **Guardrails** | Minimum confidence 0.85 for alerting, suppress during known maintenance windows |
| **Error Handling** | Fall back to static thresholds if ML model unavailable, alert ops for model degradation |
| **KPIs** | Anomaly detection >90%, false positive <5%, prediction lead time >10min before impact |
| **Multi-Agent** | Feeds Service Status Agent (AGT-085), Ops Automation Agent (AGT-087) |
| **Memory** | Long-term (evolving baselines, seasonal infrastructure patterns) |
| **MCP Tools** | MCP Prometheus Bridge, MCP Infrastructure Monitor |

### AGT-084 — Capacity Planning Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → System Health |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Forecasts infrastructure capacity needs based on usage trends, planned agent deployments, and growth projections to prevent resource exhaustion |
| **Trigger** | Weekly forecast + On deployment plan change |
| **LLM Model** | Prophet + Claude Sonnet (recommendations) |
| **Orchestrator** | n8n (forecasting pipeline) |
| **Tools** | Usage trend analyzer, growth modeler, capacity forecaster, cost estimator, scaling recommender |
| **Input** | Historical resource usage (6+ months), deployment plans, agent growth projections, cost data |
| **Output** | Capacity forecast (1/3/6 month), scaling recommendations, cost projections, risk of exhaustion |
| **Databases** | Prometheus (usage history), PostgreSQL (forecasts), MongoDB (deployment plans) |
| **Guardrails** | Safety margin of 20% above predicted peak, cost approval for scaling recommendations |
| **Error Handling** | Conservative estimates if data insufficient, alert if forecast uncertainty high |
| **KPIs** | Forecast accuracy ±15%, lead time >30 days before exhaustion, cost optimization >10% |
| **Multi-Agent** | Feeds Engine Config Optimizer (AGT-067), Infrastructure Agent (AGT-083) |
| **Memory** | Long-term (capacity trends, deployment impact patterns) |
| **MCP Tools** | MCP Capacity Planner, MCP Cost Estimator |

### AGT-085 — Service Dependency Mapper Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → Service Status |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Automatically discovers and maintains service dependency graph, analyzes failure impact paths, and predicts cascading failure scenarios |
| **Trigger** | Daily discovery scan + On service deployment + On failure event |
| **LLM Model** | Graph analysis + Claude Haiku |
| **Orchestrator** | n8n (discovery scan) |
| **Tools** | Service discovery scanner, dependency mapper, impact path analyzer, failure cascade predictor |
| **Input** | Service registry, network traffic patterns, API call graphs, deployment manifests |
| **Output** | Service dependency graph (visual + JSON), impact analysis per service, single points of failure |
| **Databases** | PostgreSQL (service registry), MongoDB (dependency graph), Redis (topology cache) |
| **Guardrails** | Validate discovered dependencies with service owners, flag unmonitored dependencies |
| **Error Handling** | Use last known topology if scan fails, flag stale entries |
| **KPIs** | Dependency coverage >95%, graph freshness <24hrs, impact prediction accuracy >85% |
| **Multi-Agent** | Feeds Incident Correlator (AGT-079), Change Impact Agent (AGT-089) |
| **Memory** | Long-term (evolving service topology, historical failure cascades) |
| **MCP Tools** | MCP Service Discovery, MCP Graph Engine |

### AGT-086 — Service Health Predictor Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → Service Status |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Predicts service health degradation before outage by analyzing leading indicators (error rate trends, latency increases, resource consumption patterns) |
| **Trigger** | Continuous (metric stream analysis) + On leading indicator trigger |
| **LLM Model** | LSTM + Claude Haiku (interpretation) |
| **Orchestrator** | Prometheus + LangGraph |
| **Tools** | Leading indicator detector, health trajectory predictor, outage probability estimator, preemptive alert generator |
| **Input** | Service metrics (latency percentiles, error rates, queue depths, resource usage), historical outages |
| **Output** | Health prediction (green/yellow/red) per service, predicted time to degradation, recommended preventive action |
| **Databases** | Prometheus (metrics), PostgreSQL (predictions), MongoDB (outage history) |
| **Guardrails** | Minimum 30 days of service history, confidence thresholds, no prediction on new services |
| **Error Handling** | Conservative prediction if insufficient data, flag low-confidence predictions |
| **KPIs** | Outage prediction >70% (1hr lead time), false prediction <10%, coverage of all critical services |
| **Multi-Agent** | Feeds Service Dashboard, alerts Ops Agent (AGT-087) |
| **Memory** | Long-term (service degradation patterns, pre-outage signatures) |
| **MCP Tools** | MCP Service Monitor, MCP Prediction Engine |

### AGT-087 — Automated Ops Remediation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → System Health |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Automatically executes pre-approved remediation runbooks for known infrastructure issues (restart containers, scale services, clear caches, rotate logs) |
| **Trigger** | On alert meeting auto-remediation criteria |
| **LLM Model** | Claude Haiku + runbook engine |
| **Orchestrator** | n8n (runbook execution) + LangGraph (decision) |
| **Tools** | Runbook executor, health verifier, rollback manager, notification sender, incident logger |
| **Input** | Alert details, matching runbook, current system state, approval status, remediation history |
| **Output** | Remediation execution log, success/failure status, health verification results, incident update |
| **Databases** | PostgreSQL (incidents), MongoDB (runbooks), Redis (execution state) |
| **Guardrails** | Only execute pre-approved runbooks, max 3 auto-remediations per incident, human escalation after failure |
| **Error Handling** | Rollback on failed remediation, escalate to on-call engineer, preserve system state snapshot |
| **KPIs** | Auto-remediation success rate >85%, MTTR reduction >40%, escalation rate <20% |
| **Multi-Agent** | Triggered by Infrastructure Agent (AGT-083), Health Predictor (AGT-086) |
| **Memory** | Long-term (remediation effectiveness per issue type) |
| **MCP Tools** | MCP Runbook Engine, MCP Infrastructure Controller |

### AGT-088 — API Performance Analyzer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → API Metrics |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Analyzes API performance patterns, detects latency regressions, identifies slow endpoints, and recommends optimization strategies (caching, indexing, pagination) |
| **Trigger** | Continuous monitoring + Daily analysis report |
| **LLM Model** | Claude Sonnet + statistical analysis |
| **Orchestrator** | Prometheus + LangGraph (analysis) |
| **Tools** | Latency profiler, regression detector, bottleneck identifier, optimization recommender, benchmark tracker |
| **Input** | API metrics (latency percentiles, throughput, error rates), endpoint catalog, database query times |
| **Output** | Performance report, regression alerts, optimization recommendations, endpoint ranking |
| **Databases** | Prometheus (API metrics), PostgreSQL (analysis results), Redis (API cache stats) |
| **Guardrails** | Statistical significance for regression claims, baseline validation, no auto-optimization |
| **Error Handling** | Flag endpoints with insufficient data, use global baseline for new endpoints |
| **KPIs** | Regression detection <5min, optimization recommendation accuracy >80%, coverage of all endpoints |
| **Multi-Agent** | Feeds API Metrics dashboard, Engine Load Balancer (AGT-060) |
| **Memory** | Long-term (endpoint performance baselines, seasonal traffic patterns) |
| **MCP Tools** | MCP API Gateway Monitor, MCP Performance Profiler |

### AGT-089 — Token Budget Forecaster Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → API Metrics |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Forecasts LLM token consumption across all agents and teams, predicts budget exhaustion dates, and recommends usage optimization strategies |
| **Trigger** | Daily forecast + On significant usage spike |
| **LLM Model** | Prophet + Claude Haiku |
| **Orchestrator** | n8n (forecasting) + LangGraph (recommendations) |
| **Tools** | Usage trend analyzer, budget tracker, exhaustion predictor, optimization recommender, team allocator |
| **Input** | Token usage by agent/team/model, budgets, growth trends, planned deployments |
| **Output** | Token usage forecast, budget exhaustion prediction, optimization recommendations, allocation suggestions |
| **Databases** | PostgreSQL (usage data), Redis (budget counters), Prometheus (usage metrics) |
| **Guardrails** | Budget alerts at 70%/85%/95%, no spend beyond allocation without override |
| **Error Handling** | Conservative forecast if data insufficient, emergency throttling at 95% budget |
| **KPIs** | Forecast accuracy ±10%, lead time >2 weeks before exhaustion, optimization savings >15% |
| **Multi-Agent** | Feeds Token Cost Agent (AGT-058), Engine Config Optimizer (AGT-067) |
| **Memory** | Medium-term (usage patterns, seasonal trends) |
| **MCP Tools** | MCP Token Counter, MCP Budget Server |

### AGT-090 — Grafana Dashboard Curator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → Grafana Embed |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Automatically curates and recommends Grafana dashboards per user role, creates alert annotations, and generates AI commentary on dashboard metrics |
| **Trigger** | On user dashboard access + Daily commentary update |
| **LLM Model** | Claude Haiku |
| **Orchestrator** | n8n + Grafana API |
| **Tools** | Dashboard recommender, annotation generator, commentary writer, layout optimizer, alert linker |
| **Input** | User role, dashboard catalog, current metrics, alert history, user interaction patterns |
| **Output** | Curated dashboard list, AI annotations on panels, metric commentary, suggested time ranges |
| **Databases** | Grafana (dashboards), Prometheus (metrics), PostgreSQL (user preferences) |
| **Guardrails** | Only recommend dashboards user has permission to view, no modification of shared dashboards |
| **Error Handling** | Default dashboard set if recommendation engine unavailable, stale annotation warning |
| **KPIs** | Dashboard relevance score >80%, annotation helpfulness >4/5, load time <3s |
| **Multi-Agent** | None (standalone curation agent) |
| **Memory** | Long-term (user dashboard preferences, role-based patterns) |
| **MCP Tools** | MCP Grafana API Bridge, MCP User Analytics |

### AGT-091 — Incident Postmortem Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → System Health |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Automatically generates incident postmortem reports by analyzing logs, metrics, traces, and timelines from infrastructure incidents |
| **Trigger** | On incident resolution |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (investigation chain) |
| **Tools** | Log aggregator, metric analyzer, timeline builder, root cause analyzer, action item generator, blameless reporter |
| **Input** | Incident logs, metrics during incident, remediation actions taken, communication logs, impact data |
| **Output** | Blameless postmortem report with timeline, root cause, contributing factors, action items, prevention plan |
| **Databases** | PostgreSQL (incidents), MongoDB (postmortems), Prometheus (metrics), S3 (logs) |
| **Guardrails** | Blameless approach enforcement, fact-based analysis, action items must have owners and deadlines |
| **Error Handling** | Partial report if some data unavailable, flag missing data sources |
| **KPIs** | Postmortem generation <2hrs post-resolution, action item completion >80%, recurrence rate reduction >30% |
| **Multi-Agent** | Uses Infrastructure Agent (AGT-083), Service Mapper (AGT-085), Ops Agent (AGT-087) data |
| **Memory** | Long-term (incident patterns, effective prevention strategies) |
| **MCP Tools** | MCP Incident Engine, MCP Log Aggregator, MCP Timeline Builder |

### AGT-092 — Rate Limit Guardian Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → API Metrics |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | High |
| **Purpose** | Dynamically manages API rate limits across all consumers, predicting spike events and pre-emptively adjusting limits to prevent throttling of critical workflows |
| **Trigger** | Continuous (real-time traffic analysis) + On rate limit approach |
| **LLM Model** | Rule engine + Claude Haiku (prediction) |
| **Orchestrator** | API Gateway + Redis (rate counters) |
| **Tools** | Traffic analyzer, spike predictor, limit adjuster, priority ranker, throttle manager |
| **Input** | API traffic patterns, consumer priorities, rate limit configs, historical spike patterns |
| **Output** | Dynamic rate limit adjustments, spike warnings, throttle decisions, consumer notifications |
| **Databases** | Redis (rate counters), Prometheus (traffic metrics), PostgreSQL (rate policies) |
| **Guardrails** | Critical workflow rate limits never reduced, minimum guaranteed rates per consumer tier |
| **Error Handling** | Fall back to static limits if dynamic engine fails, alert on unusual patterns |
| **KPIs** | Critical workflow throttling 0%, spike prediction accuracy >75%, unnecessary throttling <2% |
| **Multi-Agent** | Feeds Engine Load Balancer (AGT-060), API Performance Agent (AGT-088) |
| **Memory** | Medium-term (traffic patterns, spike calendars) |
| **MCP Tools** | MCP API Gateway, MCP Rate Limit Engine |

### AGT-093 — Database Health Monitor Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → System Health |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Monitors PostgreSQL, MongoDB, Redis health metrics (connections, query performance, replication lag, memory) and predicts database issues |
| **Trigger** | Continuous (every 30s) + On performance threshold breach |
| **LLM Model** | Claude Haiku + statistical analysis |
| **Orchestrator** | Prometheus + n8n (alerting) |
| **Tools** | Connection pool monitor, slow query detector, replication lag tracker, memory analyzer, index health checker |
| **Input** | Database metrics, query logs, connection pools, replication status, storage usage |
| **Output** | Database health scorecard, slow query alerts, replication warnings, optimization suggestions |
| **Databases** | Prometheus (DB metrics), PostgreSQL (query stats), Redis (self-monitoring) |
| **Guardrails** | Alert on connection pool >80%, replication lag >5s, query time >1s |
| **Error Handling** | Emergency connection pool scaling, query killing for runaway queries, failover trigger |
| **KPIs** | Database uptime >99.99%, slow query detection <30s, zero unplanned outages |
| **Multi-Agent** | Feeds Service Health Predictor (AGT-086), Ops Agent (AGT-087) |
| **Memory** | Long-term (database performance baselines, query patterns) |
| **MCP Tools** | MCP Database Monitor, MCP Prometheus Bridge |

### AGT-094 — Change Impact Analyzer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Monitoring → Service Status |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Analyzes the potential impact of planned deployments, configuration changes, and maintenance windows on service health and dependent systems |
| **Trigger** | On change request submission + Pre-deployment check |
| **LLM Model** | Claude Sonnet + graph analysis |
| **Orchestrator** | LangGraph (impact analysis chain) |
| **Tools** | Dependency graph analyzer, impact predictor, risk scorer, rollback plan validator, communication drafter |
| **Input** | Change details, service dependency graph, historical change impacts, current system health |
| **Output** | Impact analysis report with affected services, risk score, recommended deployment window, rollback plan |
| **Databases** | PostgreSQL (changes), MongoDB (dependency graph, change history) |
| **Guardrails** | Block high-risk changes without manager approval, mandatory rollback plan, maintenance window compliance |
| **Error Handling** | Conservative risk assessment if dependency data incomplete, flag unknown dependencies |
| **KPIs** | Impact prediction accuracy >85%, unplanned impact incidents <5%, change success rate >95% |
| **Multi-Agent** | Uses Service Dependency Mapper (AGT-085), feeds Ops Agent (AGT-087) |
| **Memory** | Long-term (historical change impact patterns, risky change indicators) |
| **MCP Tools** | MCP Change Management Server, MCP Dependency Graph Engine |

## 🔹 Admin

### AGT-095 — Audit Log Anomaly Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Admin → Audit Log |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Monitors audit log for anomalous user behaviors indicating insider threats, privilege abuse, data exfiltration, or policy violations |
| **Trigger** | Real-time (every audit event) + Daily batch analysis |
| **LLM Model** | Isolation Forest + Claude Sonnet (investigation) |
| **Orchestrator** | Redis Streams + LangGraph (investigation) |
| **Tools** | Behavioral analyzer, baseline comparator, privilege abuse detector, exfiltration pattern detector, alert generator |
| **Input** | Audit log events, user baselines, access patterns, sensitive data access records |
| **Output** | Anomaly alerts with behavioral deviation details, investigation trigger, risk assessment |
| **Databases** | PostgreSQL (audit log), MongoDB (user baselines), Redis (real-time analysis) |
| **Guardrails** | Minimum confidence 0.8 for alerting, no user identification to non-security personnel, privacy compliance |
| **Error Handling** | Fall back to rule-based detection if ML unavailable, alert security team for system issues |
| **KPIs** | Insider threat detection >85%, false positive <8%, detection latency <5min |
| **Multi-Agent** | Feeds Activity Anomaly Agent (AGT-004), Security Investigation Agent |
| **Memory** | Long-term (evolving user behavioral baselines, threat patterns) |
| **MCP Tools** | MCP Audit Engine, MCP Security Analytics |

### AGT-096 — RBAC Optimizer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Admin → Users & Roles |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Analyzes user access patterns to recommend role simplification, unused permission removal, and segregation of duties improvements |
| **Trigger** | Monthly access review + On role change request |
| **LLM Model** | Claude Sonnet + graph analysis |
| **Orchestrator** | LangGraph (analysis chain) |
| **Tools** | Permission usage analyzer, role miner, SoD conflict detector, access reviewer, recommendation generator |
| **Input** | User-role assignments, permission usage logs, SoD matrix, org structure, compliance requirements |
| **Output** | Access optimization report, unused permissions list, SoD conflicts, role consolidation suggestions |
| **Databases** | PostgreSQL (RBAC), MongoDB (usage analytics) |
| **Guardrails** | No auto-revocation of permissions, require manager approval for changes, SoD exceptions tracked |
| **Error Handling** | Flag ambiguous usage patterns for manual review, conservative (keep permission) if uncertain |
| **KPIs** | Unused permission identification >90%, SoD conflict detection 100%, role reduction >15% |
| **Multi-Agent** | Feeds Settings Agent (AGT-098), Audit Agent (AGT-095) |
| **Memory** | Long-term (access pattern history, role evolution) |
| **MCP Tools** | MCP RBAC Engine, MCP Access Analytics |

### AGT-097 — API Key Lifecycle Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Admin → API Keys |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages complete API key lifecycle: monitors usage, detects abuse, enforces rotation schedules, alerts on expiration, and scans for leaked keys |
| **Trigger** | Continuous monitoring + On rotation schedule + On leak detection |
| **LLM Model** | Claude Haiku + pattern detection |
| **Orchestrator** | n8n (lifecycle management) |
| **Tools** | Usage monitor, abuse detector, rotation scheduler, expiration alerter, leak scanner, scope analyzer |
| **Input** | API key inventory, usage logs, rotation policies, public code repositories (for leak scanning) |
| **Output** | Key health dashboard, rotation alerts, abuse alerts, leak notifications, scope recommendations |
| **Databases** | PostgreSQL (API keys), Redis (usage counters), MongoDB (key history) |
| **Guardrails** | Immediate revocation for confirmed leaks, rotation warning 14 days before expiry |
| **Error Handling** | Emergency key revocation capability, backup key activation, alert on scanning failures |
| **KPIs** | Key rotation compliance >95%, leak detection <1hr, abuse detection >90% |
| **Multi-Agent** | Feeds Audit Log Agent (AGT-095), alerts Security team |
| **Memory** | Long-term (key usage patterns, rotation history) |
| **MCP Tools** | MCP Key Management Server, MCP Security Scanner |

### AGT-098 — Data Connection Health Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Admin → Data Connections |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Monitors all external data connections for health, latency, sync failures, schema changes, and data quality degradation with auto-recovery |
| **Trigger** | Continuous (every 5 min health check) + On sync failure |
| **LLM Model** | Claude Haiku + health rules |
| **Orchestrator** | n8n (health monitoring loop) |
| **Tools** | Connection tester, latency tracker, sync monitor, schema change detector, auto-reconnector, data quality checker |
| **Input** | Connection configs, health metrics, sync status, schema snapshots, data quality rules |
| **Output** | Connection health dashboard, failure alerts, auto-recovery status, schema change warnings |
| **Databases** | PostgreSQL (connections), Redis (health status), MongoDB (sync logs) |
| **Guardrails** | Auto-retry max 5 times with exponential backoff, alert after 3 consecutive failures |
| **Error Handling** | Auto-reconnect for transient failures, escalate for auth/schema changes, fallback to cached data |
| **KPIs** | Connection uptime >99.5%, failure detection <30s, auto-recovery success >80% |
| **Multi-Agent** | Feeds Service Health Predictor (AGT-086), alerts via Notification Router (AGT-003) |
| **Memory** | Long-term (connection reliability history, common failure patterns) |
| **MCP Tools** | MCP Connection Monitor, MCP Data Quality Engine |

### AGT-099 — Compliance Report Generator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Admin → Audit Log |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Generates SOX, SOC2, and GDPR compliance reports from audit logs, access records, and control evidence with AI-generated narratives and gap analysis |
| **Trigger** | Quarterly (pre-audit) + On-demand + On compliance request |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (multi-source assembly) |
| **Tools** | Audit data aggregator, control evidence mapper, gap analyzer, narrative generator, PDF renderer |
| **Input** | Audit logs, access reviews, control test results, evidence inventory, compliance frameworks |
| **Output** | Compliance report (PDF) with evidence, control effectiveness, gaps, remediation timeline |
| **Databases** | PostgreSQL (audit/compliance), MongoDB (evidence), S3 (reports) |
| **Guardrails** | Compliance officer review required, evidence linkage mandatory, no gap suppression |
| **Error Handling** | Flag incomplete evidence areas, provide draft with gaps highlighted |
| **KPIs** | Report assembly <2hrs, evidence coverage >95%, auditor acceptance >90% |
| **Multi-Agent** | Uses SOX Agent (AGT-049), RBAC Agent (AGT-096), Regulatory Agent (AGT-080) |
| **Memory** | Long-term (auditor preferences, prior findings, remediation tracking) |
| **MCP Tools** | MCP Compliance Framework, MCP Report Generator, MCP Evidence Vault |

### AGT-100 — Platform Settings Drift Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Admin → Settings |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Detects configuration drift between environments (dev/staging/prod), unauthorized settings changes, and policy non-compliance in platform configuration |
| **Trigger** | On settings change + Daily environment comparison |
| **LLM Model** | Claude Haiku + diff engine |
| **Orchestrator** | n8n (comparison pipeline) |
| **Tools** | Config snapshot comparator, drift detector, policy compliance checker, change tracker, alert generator |
| **Input** | Platform settings across environments, approved configurations, change log, policies |
| **Output** | Drift report with specific differences, unauthorized change alerts, compliance status |
| **Databases** | PostgreSQL (settings), MongoDB (config snapshots, policies) |
| **Guardrails** | No auto-correction of drift without approval, security-critical drift escalates immediately |
| **Error Handling** | Flag environment access failures, partial comparison if some environments unreachable |
| **KPIs** | Drift detection <1hr, coverage of all config areas, unauthorized change detection 100% |
| **Multi-Agent** | Feeds Audit Log Agent (AGT-095), alerts Admin team |
| **Memory** | Long-term (approved config baselines, drift history) |
| **MCP Tools** | MCP Config Management Server, MCP Policy Engine |

---

*Batch 2 of 4 — Agents 51-100 | Agentic Finance Director App | Feb 6, 2026*
