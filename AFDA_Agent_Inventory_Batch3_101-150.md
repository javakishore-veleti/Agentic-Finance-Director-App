# 🤖 Agentic Finance Director — Agent Inventory (Batch 3: AGT-101 → AGT-150)

> **50 Agents | Cross-Cutting, RAG Infrastructure, Data Pipeline, Multi-Agent Orchestration, Advanced Analytics**

> Part 3 of 4 batches (200 total agents)

---

## Agent Type Distribution (Batch 3)

| Agent Type | Count |
|-----------|-------|
| Goal-Based Agent | 11 |
| Learning Agent | 8 |
| Model-Based Reflex Agent | 7 |
| Hierarchical Agent (Multi-Agent System) | 6 |
| Agentic AI (Goal-Based) | 4 |
| Utility-Based Agent | 4 |
| Agentic AI (Cognitive/Conversational) | 3 |
| Hierarchical Agent | 2 |
| Cognitive/Conversational Agent | 2 |
| Reactive Agent | 1 |
| Agentic AI (Hierarchical) | 1 |
| Simple Reflex Agent | 1 |

## Module Coverage (Batch 3)

| Module | Agents | Range |
|--------|--------|-------|
| Cross-Cutting | 18 | AGT-101 → AGT-118 |
| RAG Infrastructure | 10 | AGT-119 → AGT-128 |
| Data Pipeline | 10 | AGT-129 → AGT-138 |
| Multi-Agent Orchestration | 6 | AGT-139 → AGT-144 |
| Advanced Analytics | 6 | AGT-145 → AGT-150 |

---

## 🔹 Cross-Cutting

### AGT-101 — Universal Data Export Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Handles all data export requests across modules, supporting CSV, XLSX, PDF, JSON formats with dynamic column selection, filtering, and access-controlled data masking |
| **Trigger** | User export request from any page |
| **LLM Model** | Claude Haiku |
| **Orchestrator** | n8n (export pipeline) |
| **Tools** | Query builder, format converter (CSV/XLSX/PDF/JSON), PII masker, column selector, async job manager |
| **Input** | Export request (filters, columns, format), user permissions, data source |
| **Output** | Formatted export file with appropriate PII masking, download link, audit log entry |
| **Databases** | PostgreSQL (source data), Redis (export job queue), S3 (export files) |
| **Guardrails** | Row limits per export (100K), PII masking based on role, audit trail for all exports |
| **Error Handling** | Async processing for large exports, partial export with error count, retry for timeouts |
| **KPIs** | Export success rate >99%, processing time <30s for <10K rows, format accuracy 100% |
| **Multi-Agent** | Available to ALL module agents as shared capability |
| **Memory** | Short-term (export job state) |
| **MCP Tools** | MCP Export Engine, MCP Data Access Layer |

### AGT-102 — Universal Search Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Agentic AI (Cognitive/Conversational) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Provides unified natural language search across all platform data (GL, treasury, budgets, agents, settings) using semantic search and federated queries |
| **Trigger** | User search input from global search bar |
| **LLM Model** | Claude Opus + pgvector embeddings |
| **Orchestrator** | LangGraph (federated search chain) |
| **Tools** | Semantic search engine, federated query dispatcher, result ranker, snippet generator, facet builder |
| **Input** | User natural language query, search scope, user permissions |
| **Output** | Ranked search results with snippets, facets, entity types, deep links to source pages |
| **Databases** | pgvector (semantic index), PostgreSQL (structured search), Redis (search cache) |
| **Guardrails** | Permission-scoped results, no cross-tenant data leakage, query complexity limits |
| **Error Handling** | Fallback to keyword search if semantic fails, partial results with module availability flags |
| **KPIs** | Search relevance (nDCG) >0.85, latency <1.5s, zero-result rate <5% |
| **Multi-Agent** | Queries data from all module databases, uses embedding indexes |
| **Memory** | Short-term (search session for refinement), Long-term (query popularity for ranking) |
| **MCP Tools** | MCP Semantic Search, MCP Federated Query Engine |

### AGT-103 — Document Intelligence Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Processes uploaded documents (invoices, contracts, statements, reports) using OCR, NLP extraction, and classification for automated data entry across all modules |
| **Trigger** | On document upload from any module |
| **LLM Model** | Claude Opus (vision) + Tesseract OCR |
| **Orchestrator** | LangGraph (document processing pipeline) |
| **Tools** | OCR engine, document classifier, entity extractor, table parser, confidence scorer, data mapper |
| **Input** | Uploaded document (PDF/image/DOCX), target schema, extraction templates |
| **Output** | Structured data extraction with confidence scores, document classification, preview for user confirmation |
| **Databases** | PostgreSQL (extracted data), MongoDB (documents), S3 (document storage), pgvector (doc embeddings) |
| **Guardrails** | Human confirmation for confidence <85%, no auto-posting of extracted financials, audit trail |
| **Error Handling** | Multi-pass OCR for low-quality scans, manual extraction queue for failures |
| **KPIs** | Extraction accuracy >92%, document processing time <30s, auto-classification accuracy >95% |
| **Multi-Agent** | Feeds Bank Categorizer (AGT-029), JE Creator (AGT-043), Contract Parser (AGT-041) |
| **Memory** | Long-term (document layout patterns, vendor-specific templates) |
| **MCP Tools** | MCP OCR Engine, MCP Document Processor, MCP Vision API |

### AGT-104 — Email Parsing & Routing Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Parses incoming financial emails (bank alerts, vendor invoices, approval requests) and routes extracted data to appropriate modules and workflows |
| **Trigger** | On email receipt (via configured mailbox integration) |
| **LLM Model** | Claude Haiku + NLP classifier |
| **Orchestrator** | n8n (email processing pipeline) |
| **Tools** | Email parser, intent classifier, data extractor, attachment handler, routing engine, action creator |
| **Input** | Incoming email (subject, body, attachments), routing rules, module endpoints |
| **Output** | Parsed data routed to appropriate module, created action items, extracted attachments processed |
| **Databases** | PostgreSQL (emails), MongoDB (routing rules), Redis (processing queue) |
| **Guardrails** | Spam/phishing detection, no auto-processing of unknown senders, human review for financial actions |
| **Error Handling** | Queue unparseable emails for manual review, retry attachment processing, alert on routing failures |
| **KPIs** | Parsing accuracy >90%, routing accuracy >95%, processing time <15s, spam detection >99% |
| **Multi-Agent** | Routes to Treasury (AGT-026), Accounting (AGT-043), AP/AR agents |
| **Memory** | Long-term (sender patterns, email template recognition) |
| **MCP Tools** | MCP Email Gateway, MCP NLP Pipeline |

### AGT-105 — Scheduled Report Orchestrator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Hierarchical Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages all scheduled reporting across modules: triggers data collection, orchestrates report generation agents, handles distribution, and tracks delivery |
| **Trigger** | Cron schedule (daily/weekly/monthly) + On-demand |
| **LLM Model** | Claude Haiku (scheduling decisions) |
| **Orchestrator** | n8n (scheduler) + LangGraph (orchestration) |
| **Tools** | Schedule manager, dependency resolver, report aggregator, distribution engine, delivery tracker |
| **Input** | Report schedules, recipient lists, data dependencies, delivery channels (email, S3, dashboard) |
| **Output** | Generated and distributed reports, delivery confirmations, failure notifications |
| **Databases** | PostgreSQL (schedules), MongoDB (report configs), S3 (report storage), Redis (job queue) |
| **Guardrails** | Dependency validation before generation, delivery confirmation required, retry policy |
| **Error Handling** | Retry failed reports 3x, partial delivery with missing section notes, alert report owners |
| **KPIs** | On-time delivery >98%, report quality score >4/5, zero missed scheduled reports |
| **Multi-Agent** | Orchestrates ALL report-generating agents: Board Package (AGT-025), Risk Report (AGT-078), Activity Report (AGT-012) |
| **Memory** | Medium-term (delivery patterns, report dependencies) |
| **MCP Tools** | MCP Scheduler, MCP Report Distribution Engine |

### AGT-106 — Data Quality Watchdog Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Continuously monitors data quality across all platform databases for completeness, accuracy, consistency, timeliness, and validity with auto-remediation |
| **Trigger** | Continuous (streaming) + Daily batch profiling |
| **LLM Model** | Claude Haiku + Great Expectations framework |
| **Orchestrator** | n8n (profiling pipeline) + LangGraph (remediation) |
| **Tools** | Data profiler, completeness checker, consistency validator, freshness monitor, duplicate detector, quality scorer |
| **Input** | All platform data tables, quality rules, historical profiles, data lineage |
| **Output** | Data quality scorecard per table, issue alerts, auto-remediation results, trend report |
| **Databases** | PostgreSQL (all data), MongoDB (quality rules, profiles), Redis (quality scores) |
| **Guardrails** | No auto-correction of financial data, quarantine suspected bad data, alert data owners |
| **Error Handling** | Quarantine failed records, alert data engineering, provide quality override mechanism |
| **KPIs** | Data quality score >95%, issue detection <1hr, auto-remediation success >70% |
| **Multi-Agent** | Feeds ALL module agents with quality status, alerts Data Connection Agent (AGT-098) |
| **Memory** | Long-term (quality baselines, recurring issue patterns, data drift detection) |
| **MCP Tools** | MCP Data Quality Engine, MCP Data Profiler |

### AGT-107 — Multi-Language Translation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Reactive Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Provides real-time translation of platform content, reports, and AI-generated narratives into supported languages while preserving financial terminology accuracy |
| **Trigger** | On language switch + On content generation in non-default language |
| **LLM Model** | Claude Sonnet (financial-aware translation) |
| **Orchestrator** | Direct API call |
| **Tools** | Financial glossary matcher, translation engine, terminology validator, format adapter, currency/date localizer |
| **Input** | Source content, target language, financial glossary, localization rules |
| **Output** | Translated content with preserved financial terms, localized formats (dates, currencies, numbers) |
| **Databases** | PostgreSQL (translations cache), MongoDB (glossaries) |
| **Guardrails** | Financial term accuracy validation, no machine-only translation of legal/compliance content |
| **Error Handling** | Fallback to English with translation unavailable notice, highlight uncertain translations |
| **KPIs** | Translation accuracy >95% (financial terms >99%), latency <2s, language coverage >10 languages |
| **Multi-Agent** | Available to ALL content-generating agents |
| **Memory** | Long-term (translation memory, glossary improvements) |
| **MCP Tools** | MCP Translation Engine, MCP Financial Glossary |

### AGT-108 — Accessibility Compliance Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Ensures all AI-generated content meets WCAG 2.1 AA accessibility standards with alt-text, color contrast, and screen reader compatibility |
| **Trigger** | On content generation + Weekly accessibility audit |
| **LLM Model** | Claude Haiku |
| **Orchestrator** | n8n (audit pipeline) |
| **Tools** | Alt-text generator, contrast checker, ARIA validator, screen reader simulator, report generator |
| **Input** | Generated content (HTML, charts, PDFs), WCAG guidelines, accessibility rules |
| **Output** | Accessibility-enhanced content, compliance report, issue list with remediation suggestions |
| **Databases** | PostgreSQL (accessibility scores), MongoDB (WCAG rules) |
| **Guardrails** | Block publication of content failing critical WCAG criteria, alt-text mandatory for all images |
| **Error Handling** | Generate basic alt-text if detailed generation fails, flag for manual accessibility review |
| **KPIs** | WCAG AA compliance >95%, alt-text coverage 100%, zero critical accessibility failures |
| **Multi-Agent** | Post-processes output from ALL content-generating agents |
| **Memory** | Long-term (accessibility patterns, common issues per content type) |
| **MCP Tools** | MCP Accessibility Engine, MCP Content Validator |

### AGT-109 — User Onboarding Assistant Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Cognitive/Conversational Agent |
| **Behavior** | Proactive + Reactive |
| **Autonomy** | Low |
| **Purpose** | Guides new users through platform features with interactive tours, contextual help, and personalized learning paths based on role and experience level |
| **Trigger** | On first login + On-demand help request + On feature discovery |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph (adaptive tour engine) |
| **Tools** | Tour builder, feature explainer, progress tracker, quiz generator, tip recommender |
| **Input** | User role, experience level, completed features, common questions, usage patterns |
| **Output** | Interactive tours, contextual tooltips, personalized feature recommendations, progress dashboard |
| **Databases** | PostgreSQL (user progress), MongoDB (tour content), Redis (session state) |
| **Guardrails** | Non-intrusive (dismissible), respect user's pace, don't block workflows |
| **Error Handling** | Skip unavailable features in tour, offer alternative help paths |
| **KPIs** | Feature adoption +25%, time-to-productivity -40%, onboarding completion >80% |
| **Multi-Agent** | None (standalone with access to all module docs) |
| **Memory** | Long-term (user learning progress, effective tour patterns per role) |
| **MCP Tools** | MCP Tour Engine, MCP Documentation Server |

### AGT-110 — Feedback Collection & Analysis Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Learning Agent |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | Low |
| **Purpose** | Collects user feedback (thumbs up/down, comments, surveys) on AI outputs and analyzes patterns to identify improvement areas across all agents |
| **Trigger** | On feedback submission + Weekly analysis batch |
| **LLM Model** | Claude Sonnet (sentiment + theme analysis) |
| **Orchestrator** | n8n (collection) + LangGraph (analysis) |
| **Tools** | Feedback collector, sentiment analyzer, theme clusterer, agent performance correlator, report generator |
| **Input** | User feedback (ratings, comments), agent run IDs, feature context, user demographics |
| **Output** | Feedback dashboard, theme analysis, agent improvement recommendations, satisfaction trends |
| **Databases** | PostgreSQL (feedback), MongoDB (analysis results), pgvector (comment embeddings) |
| **Guardrails** | Anonymize feedback for analysis, no individual user targeting, comply with privacy policies |
| **Error Handling** | Queue feedback if analysis service unavailable, ensure no feedback loss |
| **KPIs** | Feedback collection rate >15% of interactions, analysis turnaround <24hrs, actionable insights >5/month |
| **Multi-Agent** | Feeds Prompt Optimizer (AGT-055), Agent ROI Calculator (AGT-065), False Positive Learner (AGT-081) |
| **Memory** | Long-term (feedback trends, improvement tracking) |
| **MCP Tools** | MCP Feedback Engine, MCP Survey Builder |

### AGT-111 — PII Detection & Redaction Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Scans all AI inputs and outputs for personally identifiable information and applies context-appropriate redaction to ensure GDPR/CCPA compliance |
| **Trigger** | Inline (every AI input/output) + Batch scan |
| **LLM Model** | NER model + Claude Haiku (context verification) |
| **Orchestrator** | API middleware (inline) + n8n (batch) |
| **Tools** | NER scanner, PII classifier, context evaluator, redaction engine, compliance logger |
| **Input** | Text content, data classification rules, PII patterns, context metadata |
| **Output** | Redacted content, PII detection report, compliance log entry |
| **Databases** | PostgreSQL (PII logs), MongoDB (patterns), Redis (classification cache) |
| **Guardrails** | Over-detect rather than under-detect, no PII in logs or exports without authorization |
| **Error Handling** | Block content if scanner fails (fail-safe), alert privacy team |
| **KPIs** | PII detection >99%, false positive <5%, processing latency <100ms (inline) |
| **Multi-Agent** | Inline middleware for ALL agents processing text data |
| **Memory** | Long-term (PII pattern evolution, organization-specific entities) |
| **MCP Tools** | MCP PII Scanner, MCP Compliance Engine |

### AGT-112 — Workflow Automation Suggester Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Observes repetitive user actions across the platform and suggests workflow automations that could save time using existing agents and tools |
| **Trigger** | Continuous observation + Weekly pattern analysis |
| **LLM Model** | Claude Sonnet + process mining |
| **Orchestrator** | n8n (observation) + LangGraph (suggestion generation) |
| **Tools** | Action logger, pattern miner, workflow designer, time savings estimator, suggestion presenter |
| **Input** | User action sequences, frequency patterns, existing automation catalog, time data |
| **Output** | Automation suggestions with estimated time savings, one-click setup, before/after comparison |
| **Databases** | PostgreSQL (action logs), MongoDB (patterns), Redis (observation state) |
| **Guardrails** | Privacy-respecting observation (aggregate patterns only), opt-out capability, no forced automation |
| **Error Handling** | Skip suggestion if pattern confidence low, verify automation before activating |
| **KPIs** | Suggestion acceptance >30%, time savings per accepted automation >2hrs/week, coverage of all modules |
| **Multi-Agent** | Connects to Agent Builder (AGT-052) for automation creation |
| **Memory** | Long-term (organizational workflow patterns, accepted/rejected suggestions) |
| **MCP Tools** | MCP Process Mining Engine, MCP Workflow Builder |

### AGT-113 — Data Lineage Tracker Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Tracks data lineage across the entire platform: where data originates, how it transforms, which agents process it, and what outputs depend on it |
| **Trigger** | On data transformation + On-demand lineage query + Daily lineage refresh |
| **LLM Model** | Graph analysis + Claude Haiku |
| **Orchestrator** | n8n (lineage capture) |
| **Tools** | Lineage graph builder, transformation tracker, impact analyzer, visualization renderer, dependency mapper |
| **Input** | Data transformation events, ETL logs, agent processing logs, database schema |
| **Output** | Data lineage graph (visual + JSON), impact analysis per data source, freshness tracking |
| **Databases** | MongoDB (lineage graph), PostgreSQL (transformation logs), Redis (lineage cache) |
| **Guardrails** | Complete lineage required for financial reporting data, flag gaps in lineage |
| **Error Handling** | Infer lineage from logs if capture missed, flag incomplete lineage chains |
| **KPIs** | Lineage coverage >95% of financial data, lineage freshness <24hrs, impact analysis accuracy >90% |
| **Multi-Agent** | Tracks ALL agents and their data transformations |
| **Memory** | Long-term (complete data lineage history) |
| **MCP Tools** | MCP Lineage Graph Engine, MCP Data Catalog |

### AGT-114 — Contextual Help Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Cognitive/Conversational Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Provides context-aware help and documentation for the current page, feature, or workflow using RAG over platform documentation and FAQs |
| **Trigger** | User help request (? icon) + Error encountered |
| **LLM Model** | Claude Sonnet + RAG |
| **Orchestrator** | LangGraph (retrieval chain) |
| **Tools** | Documentation retriever, context detector, FAQ matcher, tutorial linker, feedback collector |
| **Input** | Current page context, user query, documentation corpus, FAQ database, user role |
| **Output** | Contextual help response with documentation links, step-by-step guides, related tutorials |
| **Databases** | pgvector (documentation embeddings), PostgreSQL (FAQs), MongoDB (tutorials) |
| **Guardrails** | Only reference verified documentation, flag outdated content, no speculative answers |
| **Error Handling** | Suggest contacting support if no relevant documentation found, log unanswered questions |
| **KPIs** | Self-service resolution >70%, relevance score >85%, response time <2s |
| **Multi-Agent** | Accesses documentation from ALL modules |
| **Memory** | Short-term (help session context), Long-term (common questions for FAQ improvement) |
| **MCP Tools** | MCP Documentation Server, MCP RAG Pipeline |

### AGT-115 — Bulk Import Validator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Validates bulk data imports (CSV/XLSX uploads) against schema, business rules, and referential integrity before committing to the database |
| **Trigger** | On bulk file upload from any module |
| **LLM Model** | Claude Haiku + validation engine |
| **Orchestrator** | n8n (validation pipeline) |
| **Tools** | Schema validator, business rule checker, referential integrity verifier, duplicate detector, error reporter |
| **Input** | Upload file, target schema, business rules, existing data for dedup check |
| **Output** | Validation report with row-level errors, warnings, auto-corrections, import preview |
| **Databases** | PostgreSQL (target tables), Redis (validation state), MongoDB (validation rules) |
| **Guardrails** | Block import if critical errors >0, warn for non-critical issues, preview before commit |
| **Error Handling** | Partial import with error rows quarantined, detailed error export for correction |
| **KPIs** | Validation accuracy >99%, processing time <1min per 10K rows, error detection completeness >98% |
| **Multi-Agent** | Used by Treasury (bank data), Accounting (JEs), FP&A (budget uploads) |
| **Memory** | Long-term (common import errors, auto-correction patterns) |
| **MCP Tools** | MCP Import Validator, MCP Schema Registry |

### AGT-116 — Anomaly Explanation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Agentic AI (Cognitive/Conversational) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | When any agent flags an anomaly, this agent generates human-readable explanations of what was detected, why it matters, and what action to take |
| **Trigger** | On anomaly flag from any agent |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (explanation chain) |
| **Tools** | Anomaly context gatherer, impact assessor, explanation generator, action recommender, severity adjuster |
| **Input** | Anomaly details, context data, historical similar anomalies, business impact factors |
| **Output** | Human-readable anomaly explanation, business impact statement, recommended actions, confidence level |
| **Databases** | PostgreSQL (anomalies), pgvector (similar anomaly search), MongoDB (explanations) |
| **Guardrails** | Evidence-based explanations only, calibrated confidence, no speculative causes |
| **Error Handling** | Provide raw anomaly data if explanation generation fails, flag for manual review |
| **KPIs** | Explanation clarity >4.5/5, action recommendation acceptance >60%, explanation latency <5s |
| **Multi-Agent** | Post-processor for ALL anomaly-detecting agents |
| **Memory** | Long-term (effective explanation patterns, user comprehension feedback) |
| **MCP Tools** | MCP Explanation Engine, MCP Anomaly Database |

### AGT-117 — Consent & Privacy Manager Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages user data consent preferences, enforces GDPR/CCPA rights (access, deletion, portability), and audits data usage against consent records |
| **Trigger** | On consent change + On data subject request + Monthly compliance audit |
| **LLM Model** | Claude Haiku + rule engine |
| **Orchestrator** | n8n (request processing) + LangGraph (compliance audit) |
| **Tools** | Consent tracker, data inventory scanner, deletion executor, portability exporter, audit reporter |
| **Input** | Consent records, data subject requests, data inventory, processing activities |
| **Output** | Consent status dashboard, data subject request fulfillment, compliance audit report |
| **Databases** | PostgreSQL (consent records), MongoDB (data inventory), Redis (consent cache) |
| **Guardrails** | Mandatory response within regulatory timelines (30 days GDPR), complete data inventory coverage |
| **Error Handling** | Escalate to DPO for complex requests, conservative data handling if consent status unclear |
| **KPIs** | Request fulfillment within SLA >99%, consent accuracy 100%, audit coverage >95% |
| **Multi-Agent** | Enforces consent across ALL data-processing agents |
| **Memory** | Long-term (consent history, regulatory requirement updates) |
| **MCP Tools** | MCP Consent Manager, MCP Data Inventory Server |

### AGT-118 — Smart Caching Optimizer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Cross-Cutting → All Modules |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Dynamically optimizes Redis caching strategies across the platform by analyzing access patterns, cache hit rates, and TTL effectiveness to minimize latency and cost |
| **Trigger** | Continuous (cache metrics) + Hourly optimization cycle |
| **LLM Model** | Rule engine + statistical analysis |
| **Orchestrator** | n8n (optimization loop) |
| **Tools** | Cache hit analyzer, TTL optimizer, eviction strategy tuner, prewarming scheduler, memory budgeter |
| **Input** | Cache metrics (hit/miss rates, latency), access patterns, memory usage, data freshness requirements |
| **Output** | Optimized TTL policies, prewarming schedules, eviction strategy adjustments, cache health report |
| **Databases** | Redis (cache infrastructure), Prometheus (cache metrics), PostgreSQL (optimization configs) |
| **Guardrails** | Minimum freshness guarantees for financial data, no caching of sensitive data without encryption |
| **Error Handling** | Fall back to conservative TTLs if analysis fails, alert on cache health degradation |
| **KPIs** | Cache hit rate >90%, latency improvement >30%, memory utilization >70% <95% |
| **Multi-Agent** | Infrastructure agent serving ALL modules |
| **Memory** | Long-term (access pattern evolution, optimal TTL history) |
| **MCP Tools** | MCP Cache Manager, MCP Metrics Analyzer |

## 🔹 RAG Infrastructure

### AGT-119 — Document Chunking Agent

| Field | Value |
|-------|-------|
| **Module / Page** | RAG Infrastructure → Agent Studio |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Intelligently chunks documents for RAG ingestion using semantic boundary detection, preserving context windows, tables, and cross-references |
| **Trigger** | On document ingestion to knowledge base |
| **LLM Model** | Claude Haiku (boundary detection) |
| **Orchestrator** | n8n (ingestion pipeline) |
| **Tools** | Semantic chunker, table extractor, header detector, cross-reference linker, metadata tagger |
| **Input** | Raw document (PDF/DOCX/HTML), chunking strategy config, metadata schema |
| **Output** | Document chunks with metadata, semantic boundaries, preserved tables, cross-reference links |
| **Databases** | pgvector (chunk embeddings), PostgreSQL (chunk metadata), S3 (original docs) |
| **Guardrails** | Minimum chunk size 100 tokens, maximum 1000 tokens, overlap 10-20%, table preservation |
| **Error Handling** | Fallback to fixed-size chunking if semantic fails, flag poorly structured documents |
| **KPIs** | Retrieval relevance improvement >15% vs fixed chunking, processing time <10s/page |
| **Multi-Agent** | Feeds Embedding Generator (AGT-120), Document Intelligence (AGT-103) |
| **Memory** | Long-term (optimal chunking strategies per document type) |
| **MCP Tools** | MCP Document Processor, MCP Chunk Engine |

### AGT-120 — Embedding Generator & Indexer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | RAG Infrastructure → Agent Studio |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | Medium |
| **Purpose** | Generates high-quality embeddings for document chunks and maintains vector indexes with automatic reindexing, quality monitoring, and index optimization |
| **Trigger** | On new chunks + Scheduled reindexing (weekly) + On model update |
| **LLM Model** | Embedding model (text-embedding-3-large / local) |
| **Orchestrator** | n8n (embedding pipeline) |
| **Tools** | Embedding generator, index builder, quality checker, deduplication detector, index optimizer |
| **Input** | Document chunks, embedding model config, index parameters, quality thresholds |
| **Output** | Indexed embeddings in pgvector, quality metrics, index health report, dedup results |
| **Databases** | pgvector (vector index), PostgreSQL (metadata), Redis (embedding cache) |
| **Guardrails** | Embedding quality checks (cosine similarity distribution), index health monitoring |
| **Error Handling** | Retry failed embeddings, fallback to secondary embedding model, partial index update |
| **KPIs** | Embedding quality >0.85 coherence, index latency <50ms, reindexing time <1hr for 100K docs |
| **Multi-Agent** | Feeds ALL RAG-dependent agents, Retrieval Agent (AGT-121) |
| **Memory** | Long-term (embedding model performance, index optimization parameters) |
| **MCP Tools** | MCP Embedding Engine, MCP Vector Index Manager |

### AGT-121 — Hybrid Retrieval Agent

| Field | Value |
|-------|-------|
| **Module / Page** | RAG Infrastructure → Agent Studio |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Performs hybrid retrieval combining dense vector search, sparse keyword search (BM25), and metadata filtering with automatic reranking for optimal relevance |
| **Trigger** | On retrieval request from any RAG-dependent agent |
| **LLM Model** | Reranking model + Claude Haiku (query expansion) |
| **Orchestrator** | LangGraph (retrieval chain) |
| **Tools** | Vector searcher, BM25 searcher, metadata filter, query expander, result reranker, citation linker |
| **Input** | Query (text + filters), retrieval config, knowledge base scope, reranking preferences |
| **Output** | Ranked document chunks with relevance scores, source citations, metadata, diversity guarantee |
| **Databases** | pgvector (vectors), PostgreSQL (BM25 + metadata), Redis (retrieval cache) |
| **Guardrails** | Minimum relevance threshold 0.6, result diversity enforcement, permission-scoped retrieval |
| **Error Handling** | Fallback to keyword-only if vector search fails, empty result handling with suggestions |
| **KPIs** | Retrieval relevance (nDCG@10) >0.82, latency <200ms, recall >85% |
| **Multi-Agent** | Core retrieval service for Financial Q&A (AGT-002), Contextual Help (AGT-114), all RAG agents |
| **Memory** | Short-term (query session for multi-step retrieval) |
| **MCP Tools** | MCP Vector Search, MCP BM25 Engine, MCP Reranker |

### AGT-122 — Knowledge Base Curator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | RAG Infrastructure → Agent Studio |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Maintains knowledge base quality by detecting stale content, duplicate entries, conflicting information, and recommending additions based on query gaps |
| **Trigger** | Weekly curation cycle + On content staleness detection |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph (curation pipeline) |
| **Tools** | Staleness detector, duplicate finder, conflict identifier, gap analyzer, content recommender |
| **Input** | Knowledge base content, query logs (successful/failed), document freshness dates, source metadata |
| **Output** | Curation report: stale content list, duplicates, conflicts, recommended additions, freshness scores |
| **Databases** | pgvector (KB), PostgreSQL (metadata, query logs), MongoDB (curation history) |
| **Guardrails** | No auto-deletion of content, require owner approval for staleness removal, archive before removal |
| **Error Handling** | Flag uncertain staleness determinations, conservative retention policy |
| **KPIs** | KB freshness >90%, duplicate rate <2%, query gap coverage improvement >10%/quarter |
| **Multi-Agent** | Maintains KB used by ALL RAG-dependent agents |
| **Memory** | Long-term (KB evolution history, content lifecycle patterns) |
| **MCP Tools** | MCP Knowledge Base Manager, MCP Content Quality Engine |

### AGT-123 — Retrieval Evaluation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | RAG Infrastructure → Agent Studio |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Continuously evaluates RAG pipeline quality using automated metrics (RAGAS, faithfulness, relevance) and human-in-the-loop feedback to detect degradation |
| **Trigger** | Sampling (5% of all retrievals) + Weekly comprehensive evaluation |
| **LLM Model** | Claude Opus (judge model) |
| **Orchestrator** | n8n (evaluation pipeline) |
| **Tools** | RAGAS scorer, faithfulness checker, relevance evaluator, answer correctness verifier, regression detector |
| **Input** | Retrieval queries, retrieved chunks, generated answers, ground truth (when available), user feedback |
| **Output** | RAG quality dashboard, dimension scores (faithfulness, relevance, noise), regression alerts |
| **Databases** | PostgreSQL (evaluations), MongoDB (test sets), Redis (scoring cache) |
| **Guardrails** | Statistically significant sample sizes, human calibration quarterly, no gaming metrics |
| **Error Handling** | Conservative scoring if evaluation uncertain, alert on sustained quality drop |
| **KPIs** | Faithfulness >0.90, context relevance >0.85, answer correctness >0.88, evaluation latency <30s |
| **Multi-Agent** | Monitors Hybrid Retrieval (AGT-121), feeds Embedding Agent (AGT-120) for reindexing decisions |
| **Memory** | Long-term (quality trends, evaluation calibration data) |
| **MCP Tools** | MCP Evaluation Framework, MCP RAG Quality Monitor |

### AGT-124 — Query Decomposition Agent

| Field | Value |
|-------|-------|
| **Module / Page** | RAG Infrastructure → Agent Studio |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Decomposes complex user queries into sub-queries for multi-step retrieval, enabling RAG systems to handle multi-hop reasoning and comparison questions |
| **Trigger** | On complex query detection (from any RAG agent) |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (decomposition chain) |
| **Tools** | Complexity detector, query decomposer, sub-query planner, result synthesizer, citation merger |
| **Input** | Complex user query, query type classification, available knowledge bases |
| **Output** | Decomposed sub-queries, execution plan, synthesized final answer with merged citations |
| **Databases** | Redis (decomposition cache), PostgreSQL (query logs) |
| **Guardrails** | Max decomposition depth 5, timeout per sub-query, coherence check on synthesis |
| **Error Handling** | Attempt direct retrieval if decomposition fails, explain partial answers |
| **KPIs** | Complex query success rate >80%, decomposition accuracy >85%, total latency <10s |
| **Multi-Agent** | Called by Financial Q&A (AGT-002), GL Search (AGT-047), Universal Search (AGT-102) |
| **Memory** | Short-term (decomposition context for multi-step execution) |
| **MCP Tools** | MCP Query Planner, MCP Result Synthesizer |

### AGT-125 — Financial Document Embedder Agent

| Field | Value |
|-------|-------|
| **Module / Page** | RAG Infrastructure → Agent Studio |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Specialized embedding agent for financial documents (10-K, 10-Q, earnings calls, analyst reports) with domain-specific preprocessing and entity linking |
| **Trigger** | On financial document ingestion |
| **LLM Model** | Financial domain embedding model + Claude Haiku |
| **Orchestrator** | n8n (processing pipeline) |
| **Tools** | Financial NER, table extractor, XBRL parser, entity linker, domain-specific chunker, metadata enricher |
| **Input** | Financial documents (SEC filings, earnings transcripts, analyst reports), entity database |
| **Output** | Domain-enriched embeddings with financial entity tags, table embeddings, cross-linked entities |
| **Databases** | pgvector (financial embeddings), PostgreSQL (entity database), S3 (documents) |
| **Guardrails** | Preserve numerical precision, maintain table relationships, entity disambiguation |
| **Error Handling** | Fallback to generic embedding if domain model fails, flag low-quality extractions |
| **KPIs** | Financial query relevance >90%, entity linking accuracy >85%, processing time <30s/document |
| **Multi-Agent** | Feeds Financial Q&A (AGT-002), Benchmark Agent (AGT-022), Compliance Agent (AGT-080) |
| **Memory** | Long-term (entity relationship graph, financial terminology evolution) |
| **MCP Tools** | MCP Financial NLP Engine, MCP Entity Linker, MCP XBRL Parser |

### AGT-126 — Agentic RAG Planner Agent

| Field | Value |
|-------|-------|
| **Module / Page** | RAG Infrastructure → Agent Studio |
| **Agent Type** | Agentic AI (Hierarchical) |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Plans and executes multi-step RAG workflows that combine retrieval, tool use, computation, and reasoning to answer complex financial questions |
| **Trigger** | On complex financial query requiring multi-source data |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (ReAct agent with retrieval tools) |
| **Tools** | Retrieval tool, SQL query tool, calculator, chart tool, document fetcher, web search (if enabled) |
| **Input** | Complex query, available tools, knowledge bases, financial databases |
| **Output** | Comprehensive answer with retrieval evidence, calculations, charts, and citations from multiple sources |
| **Databases** | All platform databases via tools |
| **Guardrails** | Max 10 tool calls per query, cost ceiling per query, reasoning trace for auditability |
| **Error Handling** | Graceful degradation (fewer tool calls), explain what information is missing |
| **KPIs** | Complex query success >85%, answer quality >4.3/5, avg tool calls <5, latency <15s |
| **Multi-Agent** | Orchestrates Retrieval (AGT-121), Query Decomposition (AGT-124), Financial Q&A tools |
| **Memory** | Short-term (reasoning trace, retrieved context) |
| **MCP Tools** | MCP RAG Pipeline, MCP Tool Executor, MCP Financial Data Server |

### AGT-127 — Citation & Source Verification Agent

| Field | Value |
|-------|-------|
| **Module / Page** | RAG Infrastructure → Agent Studio |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Verifies that all RAG-generated citations are accurate, that quoted content matches sources, and that no fabricated references exist in AI outputs |
| **Trigger** | Post-RAG-generation validation (inline) |
| **LLM Model** | Claude Haiku (verification) |
| **Orchestrator** | API middleware |
| **Tools** | Citation extractor, source matcher, content verifier, fabrication detector, accuracy scorer |
| **Input** | Generated response with citations, source documents, retrieved chunks |
| **Output** | Citation verification report: verified/unverified/fabricated per citation, overall accuracy score |
| **Databases** | pgvector (source verification), PostgreSQL (verification logs) |
| **Guardrails** | Block responses with >10% fabricated citations, flag unverifiable citations |
| **Error Handling** | Remove unverifiable citations, add caveat if verification service unavailable |
| **KPIs** | Citation accuracy >98%, fabrication detection >99%, verification latency <2s |
| **Multi-Agent** | Post-processor for ALL RAG-generating agents, works with Hallucination Agent (AGT-059) |
| **Memory** | Long-term (citation accuracy patterns, common fabrication types) |
| **MCP Tools** | MCP Citation Verifier, MCP Source Matcher |

### AGT-128 — Conversational Memory Agent

| Field | Value |
|-------|-------|
| **Module / Page** | RAG Infrastructure → Agent Studio |
| **Agent Type** | Learning Agent |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages conversational memory across chat sessions using summarization, entity tracking, and preference extraction for personalized long-running interactions |
| **Trigger** | On every chat interaction + Session end summarization |
| **LLM Model** | Claude Haiku (summarization) + Mem0 |
| **Orchestrator** | LangGraph (memory management chain) |
| **Tools** | Conversation summarizer, entity tracker, preference extractor, memory retriever, context window optimizer |
| **Input** | Chat messages, prior summaries, user entities, preferences, conversation metadata |
| **Output** | Updated memory state, retrieved relevant context for current query, preference-adjusted responses |
| **Databases** | MongoDB (conversation history), pgvector (memory embeddings), Redis (session state) |
| **Guardrails** | Memory retention limits, user consent for persistent memory, no PII in summaries |
| **Error Handling** | Graceful degradation to current session only, clear memory on user request |
| **KPIs** | Context continuity score >85%, memory retrieval relevance >80%, latency overhead <200ms |
| **Multi-Agent** | Serves Financial Q&A (AGT-002), Chat Playground (AGT-056), all conversational agents |
| **Memory** | Long-term (user preferences, entity tracking, conversation summaries via Mem0) |
| **MCP Tools** | MCP Memory Manager (Mem0), MCP Conversation Store |

## 🔹 Data Pipeline

### AGT-129 — ETL Orchestration Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Data Pipeline → Admin |
| **Agent Type** | Hierarchical Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Orchestrates all ETL/ELT pipelines across the platform with intelligent scheduling, dependency management, failure recovery, and SLA monitoring |
| **Trigger** | Scheduled (cron-based) + Event-driven (data arrival) + Dependency chain |
| **LLM Model** | Rule engine + Claude Haiku (anomaly detection) |
| **Orchestrator** | n8n (pipeline orchestration) + Airflow patterns |
| **Tools** | DAG manager, dependency resolver, SLA tracker, retry engine, data arrival monitor, quality gate |
| **Input** | Pipeline configs, schedule definitions, dependency graphs, SLA requirements, data sources |
| **Output** | Pipeline execution status, SLA reports, failure alerts, data freshness dashboard |
| **Databases** | PostgreSQL (pipeline metadata), MongoDB (execution logs), Redis (state management) |
| **Guardrails** | SLA enforcement, data quality gates between stages, no downstream processing on failed upstream |
| **Error Handling** | Automatic retry with backoff, alternative data source fallback, ops team escalation |
| **KPIs** | Pipeline success rate >99%, SLA compliance >98%, mean recovery time <15min |
| **Multi-Agent** | Orchestrates Data Quality (AGT-106), Lineage (AGT-113), Connection Health (AGT-098) |
| **Memory** | Long-term (pipeline performance history, optimal scheduling patterns) |
| **MCP Tools** | MCP Pipeline Orchestrator, MCP Data Arrival Monitor |

### AGT-130 — Schema Evolution Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Data Pipeline → Admin |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Manages database schema changes with AI-assisted impact analysis, migration script generation, backward compatibility checks, and rollback planning |
| **Trigger** | On schema change request + On external schema change detection |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph (impact analysis chain) |
| **Tools** | Schema comparator, impact analyzer, migration generator, compatibility checker, rollback planner |
| **Input** | Current schema, proposed changes, dependent queries/views, application code references |
| **Output** | Impact analysis report, migration scripts, backward compatibility assessment, rollback plan |
| **Databases** | PostgreSQL (all schemas), MongoDB (schema history) |
| **Guardrails** | Require DBA approval for production changes, backward compatibility mandatory, test migration first |
| **Error Handling** | Block migration on incompatible changes, provide alternative schema designs |
| **KPIs** | Zero-downtime migrations >95%, impact analysis accuracy >90%, rollback success 100% |
| **Multi-Agent** | Feeds Data Lineage (AGT-113), Service Mapper (AGT-085) |
| **Memory** | Long-term (schema evolution history, migration patterns) |
| **MCP Tools** | MCP Schema Manager, MCP Migration Engine |

### AGT-131 — Real-Time Stream Processor Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Data Pipeline → Monitoring |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Processes real-time data streams (bank feeds, market data, transaction events) with windowed aggregation, pattern detection, and event-driven triggering |
| **Trigger** | Continuous (stream processing) |
| **LLM Model** | Rule engine + pattern matching |
| **Orchestrator** | Redis Streams + n8n (event handlers) |
| **Tools** | Stream processor, window aggregator, pattern matcher, event router, backpressure manager |
| **Input** | Real-time data streams from bank feeds, market data, platform events |
| **Output** | Processed events, aggregated metrics, pattern match alerts, triggered downstream actions |
| **Databases** | Redis (streams, aggregations), PostgreSQL (persisted events), Prometheus (stream metrics) |
| **Guardrails** | Exactly-once processing guarantee, ordering preservation, backpressure handling |
| **Error Handling** | Dead letter queue for failed events, replay capability, automatic recovery from consumer failure |
| **KPIs** | Processing latency <500ms, exactly-once delivery >99.99%, throughput >10K events/sec |
| **Multi-Agent** | Feeds ALL real-time agents: Cash Position (AGT-026), Fraud (AGT-037), Alert Triage (AGT-069) |
| **Memory** | Short-term (stream window state) |
| **MCP Tools** | MCP Stream Processor, MCP Event Router |

### AGT-132 — Data Archival Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Data Pipeline → Admin |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages data lifecycle with intelligent archival decisions based on access frequency, regulatory retention requirements, and storage cost optimization |
| **Trigger** | Monthly archival cycle + On storage threshold breach |
| **LLM Model** | Claude Haiku + access pattern analysis |
| **Orchestrator** | n8n (archival pipeline) |
| **Tools** | Access frequency analyzer, retention rule engine, tier migrator (hot/warm/cold), compliance checker |
| **Input** | Table access patterns, retention policies, storage metrics, regulatory requirements |
| **Output** | Archival recommendations, executed migrations, storage savings report, compliance status |
| **Databases** | PostgreSQL (hot), S3 (cold/archive), MongoDB (archival logs) |
| **Guardrails** | Regulatory retention compliance mandatory, no archival of active financial data, restore capability test |
| **Error Handling** | Verify restore before archiving, rollback on failed migration, alert on retention violations |
| **KPIs** | Storage cost reduction >20%, retention compliance 100%, restore time <30min |
| **Multi-Agent** | Works with Data Lineage (AGT-113), Compliance Agent (AGT-099) |
| **Memory** | Long-term (access patterns, optimal archival timing) |
| **MCP Tools** | MCP Storage Manager, MCP Retention Engine |

### AGT-133 — CDC (Change Data Capture) Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Data Pipeline → Admin |
| **Agent Type** | Simple Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Captures database changes in real-time using CDC and routes change events to interested subscribers (agents, caches, search indexes, analytics) |
| **Trigger** | Continuous (database WAL/oplog listening) |
| **LLM Model** | None (pure event processing) |
| **Orchestrator** | Debezium + Redis Streams |
| **Tools** | WAL reader, change parser, event router, subscriber manager, lag monitor |
| **Input** | Database transaction logs (PostgreSQL WAL, MongoDB oplog), subscriber registrations |
| **Output** | Change events (insert/update/delete) routed to registered subscribers |
| **Databases** | PostgreSQL (source), Redis (event bus), MongoDB (change logs) |
| **Guardrails** | Event ordering guarantee, no event loss, subscriber health monitoring |
| **Error Handling** | Event replay from checkpoint on failure, dead letter queue for undeliverable, lag alerting |
| **KPIs** | Event latency <1s, zero event loss, subscriber delivery >99.99% |
| **Multi-Agent** | Infrastructure agent feeding ALL real-time agents with data changes |
| **Memory** | Short-term (checkpoint state, subscriber positions) |
| **MCP Tools** | MCP CDC Engine, MCP Event Bus |

### AGT-134 — Data Masking Agent (Non-Production)

| Field | Value |
|-------|-------|
| **Module / Page** | Data Pipeline → Admin |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Creates production-realistic but anonymized datasets for development and testing environments with referential integrity preservation and statistical consistency |
| **Trigger** | On environment refresh request + Scheduled (monthly) |
| **LLM Model** | Claude Haiku (masking strategy selection) |
| **Orchestrator** | n8n (masking pipeline) |
| **Tools** | Data classifier, masking strategy selector, referential integrity preserver, statistical validator, environment deployer |
| **Input** | Production data schema, PII classifications, referential integrity constraints, statistical distributions |
| **Output** | Masked dataset with preserved relationships, statistical validation report, deployment status |
| **Databases** | PostgreSQL (source/target), MongoDB (masking rules) |
| **Guardrails** | No real PII in non-production, verify masking completeness, referential integrity check |
| **Error Handling** | Block deployment if masking incomplete, alert on PII leakage detection |
| **KPIs** | PII elimination 100%, referential integrity preservation >99%, statistical consistency >90% |
| **Multi-Agent** | Works with PII Detection (AGT-111), Consent Manager (AGT-117) |
| **Memory** | Long-term (masking strategies per data type, validation history) |
| **MCP Tools** | MCP Data Masking Engine, MCP Environment Manager |

### AGT-135 — ERP Sync Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Data Pipeline → Admin |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages bidirectional data synchronization with ERP systems (SAP, NetSuite, Oracle) including conflict resolution, field mapping, and transformation |
| **Trigger** | Scheduled sync (configurable frequency) + On ERP webhook + On-demand |
| **LLM Model** | Claude Haiku (conflict resolution advice) |
| **Orchestrator** | n8n (sync pipeline) |
| **Tools** | ERP connector, field mapper, conflict resolver, transformation engine, sync monitor, rollback capability |
| **Input** | ERP data, local data, field mappings, conflict rules, sync schedule |
| **Output** | Synchronized data, conflict resolution log, sync status dashboard, error report |
| **Databases** | PostgreSQL (local data), Redis (sync state), MongoDB (mapping configs) |
| **Guardrails** | Conflict resolution rules (ERP wins/local wins/manual), no data loss, audit trail of all syncs |
| **Error Handling** | Retry with backoff, partial sync for available entities, escalate unresolvable conflicts |
| **KPIs** | Sync success rate >99%, conflict auto-resolution >80%, data latency <15min |
| **Multi-Agent** | Feeds ALL module agents with ERP data, works with Schema Evolution (AGT-130) |
| **Memory** | Long-term (sync patterns, common conflict types per entity) |
| **MCP Tools** | MCP ERP Connector (SAP/NetSuite/Oracle), MCP Sync Engine |

### AGT-136 — Incremental Refresh Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Data Pipeline → Monitoring |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Optimizes data refresh strategies by detecting which materialized views, caches, and aggregations need updating based on upstream changes vs full refresh |
| **Trigger** | On upstream data change (via CDC) + Scheduled optimization review |
| **LLM Model** | Rule engine + dependency analysis |
| **Orchestrator** | n8n (refresh pipeline) |
| **Tools** | Change impact analyzer, dependency mapper, incremental refresher, cost comparator, freshness monitor |
| **Input** | Upstream change events, materialized view definitions, refresh costs, freshness requirements |
| **Output** | Optimal refresh decisions (incremental vs full), refresh execution, freshness dashboard |
| **Databases** | PostgreSQL (materialized views), Redis (change tracking), Prometheus (refresh metrics) |
| **Guardrails** | Minimum freshness guarantees per view, cost ceiling per refresh cycle |
| **Error Handling** | Fallback to full refresh if incremental fails, alert on sustained freshness violations |
| **KPIs** | Incremental refresh rate >80%, compute savings >50% vs full refresh, freshness SLA compliance >99% |
| **Multi-Agent** | Triggered by CDC Agent (AGT-133), serves ALL dashboard and reporting agents |
| **Memory** | Long-term (refresh cost history, optimal strategies per view) |
| **MCP Tools** | MCP Refresh Manager, MCP Cost Optimizer |

### AGT-137 — Plaid Integration Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Data Pipeline → Admin |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Manages complete Plaid bank integration lifecycle: link management, transaction sync, balance updates, webhook handling, and connection health monitoring |
| **Trigger** | Continuous (webhook events) + Scheduled polling + On link events |
| **LLM Model** | Rule engine + Claude Haiku (error classification) |
| **Orchestrator** | n8n (webhook handler + polling) |
| **Tools** | Plaid API client, webhook handler, transaction mapper, balance reconciler, link health monitor |
| **Input** | Plaid webhooks, bank account configs, transaction data, balance snapshots |
| **Output** | Synced bank transactions, real-time balances, connection health status, error alerts |
| **Databases** | PostgreSQL (transactions, balances), Redis (webhook queue), MongoDB (Plaid configs) |
| **Guardrails** | Token encryption, rate limit compliance, PCI-DSS data handling, retry with backoff |
| **Error Handling** | Auto-relink for expired connections, retry on transient errors, alert for institution-level outages |
| **KPIs** | Sync latency <5min, connection uptime >99%, transaction completeness 100% |
| **Multi-Agent** | Critical data source for Cash Position (AGT-026), Bank Recon (AGT-034), Categorizer (AGT-029) |
| **Memory** | Long-term (institution reliability history, error patterns) |
| **MCP Tools** | MCP Plaid Connector, MCP Bank Feed Server |

### AGT-138 — Backup & Recovery Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Data Pipeline → Admin |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Manages automated backup schedules, monitors backup integrity, performs recovery testing, and executes disaster recovery procedures for all platform data |
| **Trigger** | Scheduled (hourly incremental, daily full) + On-demand + On disaster event |
| **LLM Model** | Rule engine + Claude Haiku (recovery planning) |
| **Orchestrator** | n8n (backup pipeline) |
| **Tools** | Backup executor, integrity checker, recovery tester, DR failover manager, RPO/RTO monitor |
| **Input** | Database states, backup policies, recovery plans, integrity checksums, RTO/RPO requirements |
| **Output** | Backup status dashboard, integrity verification, recovery test results, DR readiness score |
| **Databases** | PostgreSQL (backup metadata), S3 (backup storage), MongoDB (recovery plans) |
| **Guardrails** | Encryption at rest for backups, geographic redundancy, monthly recovery test mandatory |
| **Error Handling** | Immediate alert on backup failure, alternative backup path, emergency DR activation |
| **KPIs** | Backup success rate 100%, RPO <1hr, RTO <4hrs, recovery test pass rate >99% |
| **Multi-Agent** | Infrastructure agent protecting ALL platform data |
| **Memory** | Long-term (backup patterns, recovery time actuals) |
| **MCP Tools** | MCP Backup Engine, MCP DR Manager |

## 🔹 Multi-Agent Orchestration

### AGT-139 — Month-End Close Orchestrator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Multi-Agent Orchestration → Accounting |
| **Agent Type** | Hierarchical Agent (Multi-Agent System) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Master orchestrator for the entire month-end close process, coordinating 15+ agents across Accounting, FP&A, and Treasury with dependency management and progress tracking |
| **Trigger** | Close period initiation + Continuous during close |
| **LLM Model** | Claude Opus (decision-making) + rule engine |
| **Orchestrator** | LangGraph (DAG orchestrator) + n8n (task runner) |
| **Tools** | Close DAG manager, agent coordinator, progress tracker, bottleneck resolver, timeline optimizer |
| **Input** | Close checklist, agent statuses, dependency graph, deadline, prior close metrics |
| **Output** | Close progress dashboard, agent coordination commands, bottleneck alerts, predicted completion |
| **Databases** | PostgreSQL (close tasks), Redis (agent states), MongoDB (coordination logs) |
| **Guardrails** | Human checkpoints at critical gates, no skip of mandatory tasks, audit trail |
| **Error Handling** | Dynamic replanning on delays, escalation to controller, parallel path activation |
| **KPIs** | Close cycle reduction >2 days, zero missed tasks, bottleneck prediction >90% |
| **Multi-Agent** | MASTER ORCHESTRATOR: coordinates Close Task (AGT-040), Accrual (AGT-041), Recon (AGT-044), IC (AGT-046), SOX (AGT-049), Variance (AGT-015), Commentary (AGT-019) |
| **Memory** | Long-term (close process optimization history, seasonal complexity patterns) |
| **MCP Tools** | MCP Close Orchestrator, MCP Agent Coordinator, MCP Timeline Engine |

### AGT-140 — Daily Treasury Operations Orchestrator

| Field | Value |
|-------|-------|
| **Module / Page** | Multi-Agent Orchestration → Treasury |
| **Agent Type** | Hierarchical Agent (Multi-Agent System) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Orchestrates daily treasury operations sequence: bank feeds → cash position → forecast → investment decisions → FX exposure → hedging recommendations |
| **Trigger** | Daily (6 AM start) + On major cash event |
| **LLM Model** | Claude Sonnet + rule engine |
| **Orchestrator** | LangGraph (treasury DAG) + n8n |
| **Tools** | Sequence manager, dependency tracker, agent invoker, status aggregator, exception handler |
| **Input** | Treasury agent statuses, bank feed availability, market data, deadline requirements |
| **Output** | Daily treasury operations status, consolidated treasury dashboard update, exception alerts |
| **Databases** | PostgreSQL (treasury), Redis (agent coordination state) |
| **Guardrails** | Must complete core position by 8 AM, no investment decisions without cash position confirmation |
| **Error Handling** | Skip optional steps if behind schedule, alert treasurer for critical failures |
| **KPIs** | Morning completion by 8 AM >95%, all positions accurate >99.5%, zero missed operations |
| **Multi-Agent** | Orchestrates: Plaid (AGT-137), Cash Position (AGT-026), Cash Forecast (AGT-028), FX Exposure (AGT-031), Hedging (AGT-032), Investment (AGT-033), Treasury Briefing (AGT-027) |
| **Memory** | Long-term (operational timing optimization, failure recovery patterns) |
| **MCP Tools** | MCP Treasury Orchestrator, MCP Agent Coordinator |

### AGT-141 — Risk Assessment Cascade Orchestrator

| Field | Value |
|-------|-------|
| **Module / Page** | Multi-Agent Orchestration → Risk Intelligence |
| **Agent Type** | Hierarchical Agent (Multi-Agent System) |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | High |
| **Purpose** | Orchestrates cascading risk assessment when a major risk event is detected, coordinating multiple risk agents for comprehensive impact analysis and response |
| **Trigger** | On P1 risk alert + On major market event + Quarterly comprehensive assessment |
| **LLM Model** | Claude Opus (assessment coordination) |
| **Orchestrator** | LangGraph (cascade orchestrator) |
| **Tools** | Cascade initiator, parallel agent dispatcher, result aggregator, impact synthesizer, response planner |
| **Input** | Triggering risk event, available risk agents, assessment scope, urgency level |
| **Output** | Comprehensive risk assessment, cascading impact analysis, coordinated response plan, executive summary |
| **Databases** | PostgreSQL (risk data), MongoDB (assessments), Redis (cascade state) |
| **Guardrails** | Timeout per assessment stage, mandatory human review for response actions, completeness check |
| **Error Handling** | Partial assessment if some agents unavailable, flag gaps, expedited path for critical events |
| **KPIs** | Assessment completion <2hrs for P1, comprehensiveness >90%, response plan quality >4/5 |
| **Multi-Agent** | Orchestrates: Risk Scorer (AGT-071), Investigation (AGT-070), Emerging Risk (AGT-072), Stress Test (AGT-082), Compliance (AGT-080), Correlation (AGT-079), Mitigation (AGT-076) |
| **Memory** | Long-term (cascade assessment patterns, effective response strategies) |
| **MCP Tools** | MCP Risk Orchestrator, MCP Agent Coordinator, MCP Impact Synthesizer |

### AGT-142 — Board Reporting Orchestrator

| Field | Value |
|-------|-------|
| **Module / Page** | Multi-Agent Orchestration → FP&A |
| **Agent Type** | Hierarchical Agent (Multi-Agent System) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Orchestrates the complete board reporting workflow: data collection → analysis → narrative generation → package assembly → review → distribution |
| **Trigger** | T-5 days before board meeting + On-demand |
| **LLM Model** | Claude Opus (coordination + quality review) |
| **Orchestrator** | LangGraph (reporting DAG) |
| **Tools** | Data readiness checker, agent sequencer, quality reviewer, package assembler, distribution manager |
| **Input** | Board calendar, report requirements, data availability, stakeholder preferences |
| **Output** | Board-ready package, review status, distribution confirmation, feedback collection |
| **Databases** | PostgreSQL (all financial), MongoDB (report templates), S3 (packages) |
| **Guardrails** | CFO sign-off required, completeness check, compliance review, version control |
| **Error Handling** | Highlight incomplete sections, parallel preparation of alternatives, deadline awareness |
| **KPIs** | On-time delivery >98%, revision rounds <2, board satisfaction >4.5/5 |
| **Multi-Agent** | Orchestrates: Board Package (AGT-025), Revenue (AGT-013), Variance (AGT-015), Scenario (AGT-017), Commentary (AGT-019), Risk Report (AGT-078), Benchmark (AGT-022) |
| **Memory** | Long-term (board preferences, effective report formats, feedback history) |
| **MCP Tools** | MCP Report Orchestrator, MCP Distribution Engine |

### AGT-143 — Incident Response Orchestrator

| Field | Value |
|-------|-------|
| **Module / Page** | Multi-Agent Orchestration → Monitoring |
| **Agent Type** | Hierarchical Agent (Multi-Agent System) |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Coordinates automated incident response across infrastructure, application, and security incidents by orchestrating detection, diagnosis, remediation, and communication agents |
| **Trigger** | On P1/P2 incident declaration |
| **LLM Model** | Claude Sonnet (incident coordination) |
| **Orchestrator** | LangGraph (incident response DAG) |
| **Tools** | Incident commander, war room creator, agent dispatcher, status updater, communication broadcaster |
| **Input** | Incident details, severity, affected services, available remediation agents, stakeholder list |
| **Output** | Coordinated incident response, status updates, communication logs, postmortem trigger |
| **Databases** | PostgreSQL (incidents), Redis (incident state), MongoDB (communication logs) |
| **Guardrails** | Human incident commander for P1, escalation timelines, stakeholder communication SLA |
| **Error Handling** | Fallback to manual coordination if orchestrator fails, preserve all incident data |
| **KPIs** | Incident MTTR reduction >40%, communication SLA >95%, zero data loss during incidents |
| **Multi-Agent** | Orchestrates: Infrastructure (AGT-083), Ops Remediation (AGT-087), Service Health (AGT-086), Dependency Mapper (AGT-085), Postmortem (AGT-091), Alert Correlation (AGT-079) |
| **Memory** | Long-term (incident playbooks, effective response sequences, MTTR optimization) |
| **MCP Tools** | MCP Incident Commander, MCP Communication Engine, MCP War Room Manager |

### AGT-144 — FP&A Forecast Ensemble Orchestrator

| Field | Value |
|-------|-------|
| **Module / Page** | Multi-Agent Orchestration → FP&A |
| **Agent Type** | Hierarchical Agent (Multi-Agent System) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Orchestrates the complete forecasting ensemble: runs revenue, OPEX, and cash models in parallel, synthesizes results, resolves conflicts, and produces unified forecast |
| **Trigger** | Weekly forecast cycle + On-demand + On data refresh |
| **LLM Model** | Claude Sonnet (synthesis + conflict resolution) |
| **Orchestrator** | LangGraph (ensemble orchestrator) |
| **Tools** | Parallel executor, model conflict resolver, forecast synthesizer, confidence aggregator, report assembler |
| **Input** | Data readiness signals, model configurations, forecast horizons, quality thresholds |
| **Output** | Unified P&L forecast, balance sheet forecast, cash flow forecast, confidence bands, model agreement scores |
| **Databases** | PostgreSQL (forecasts), MongoDB (model outputs), Redis (execution state) |
| **Guardrails** | All models must converge within tolerance, outlier detection on individual models |
| **Error Handling** | Exclude failed models from ensemble with degradation warning, run backup models |
| **KPIs** | Ensemble MAPE improvement >10% vs individual models, forecast delivery <30min, model coverage 100% |
| **Multi-Agent** | Orchestrates: Revenue (AGT-013), OPEX (AGT-014), Cash Forecast (AGT-028), Seasonality (AGT-020), Scenario (AGT-017) |
| **Memory** | Long-term (ensemble weight optimization, model performance history) |
| **MCP Tools** | MCP Forecast Orchestrator, MCP Model Manager, MCP Ensemble Engine |

## 🔹 Advanced Analytics

### AGT-145 — Predictive Cash Collections Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Advanced Analytics → Treasury |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Uses ML to predict which invoices will be paid on time, late, or default, enabling proactive collections outreach and accurate cash flow forecasting |
| **Trigger** | Daily batch prediction + On new invoice creation |
| **LLM Model** | XGBoost + Claude Haiku (action suggestions) |
| **Orchestrator** | n8n (batch scoring) + LangGraph (action planning) |
| **Tools** | Payment predictor, risk scorer, collections prioritizer, outreach recommender, aging analyzer |
| **Input** | Invoice data, customer payment history, credit scores, industry benchmarks, seasonal patterns |
| **Output** | Payment probability per invoice, risk-ranked collections queue, suggested outreach actions, cash impact forecast |
| **Databases** | PostgreSQL (AR), MongoDB (prediction models), Redis (scoring cache) |
| **Guardrails** | Minimum data for customer-level prediction, no automated collections actions without approval |
| **Error Handling** | Use segment-level prediction for new customers, flag low-confidence predictions |
| **KPIs** | Payment prediction accuracy >85%, collections recovery improvement >15%, DSO reduction >5 days |
| **Multi-Agent** | Feeds Cash Forecast (AGT-028), Payment Timing (AGT-035) |
| **Memory** | Long-term (customer payment behavior models, economic cycle adjustments) |
| **MCP Tools** | MCP Collections Engine, MCP Credit Scoring Server |

### AGT-146 — Working Capital Optimizer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Advanced Analytics → Treasury |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Optimizes working capital by analyzing DPO/DSO/DIO trade-offs, recommending payment timing strategies, and modeling supply chain financing opportunities |
| **Trigger** | Weekly analysis + On significant working capital change |
| **LLM Model** | Claude Opus + optimization models |
| **Orchestrator** | LangGraph (optimization pipeline) |
| **Tools** | DPO/DSO/DIO calculator, trade-off analyzer, payment timing optimizer, financing evaluator, scenario modeler |
| **Input** | AP/AR aging, inventory levels, vendor terms, early payment discounts, financing rates |
| **Output** | Working capital optimization plan, payment timing recommendations, financing opportunity analysis, projected cash impact |
| **Databases** | PostgreSQL (AP/AR/Inventory), MongoDB (optimization results) |
| **Guardrails** | Maintain vendor relationship scores, respect contractual terms, CFO approval for strategy changes |
| **Error Handling** | Conservative recommendations if data incomplete, flag assumptions |
| **KPIs** | Working capital improvement >5%, early payment discount capture >80%, cash conversion cycle reduction |
| **Multi-Agent** | Uses Payment Timing (AGT-035), Cash Forecast (AGT-028), Budget Burn (AGT-018) |
| **Memory** | Long-term (vendor behavior, seasonal working capital patterns) |
| **MCP Tools** | MCP Working Capital Engine, MCP Financing Evaluator |

### AGT-147 — Revenue Attribution Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Advanced Analytics → FP&A |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Attributes revenue changes to specific drivers (volume, price, mix, FX, new customers, churn) using multi-factor decomposition and AI-powered narrative |
| **Trigger** | Monthly (post-close) + On-demand |
| **LLM Model** | Claude Opus + statistical decomposition |
| **Orchestrator** | LangGraph (decomposition chain) |
| **Tools** | Revenue decomposer, driver quantifier, bridge chart builder, narrative generator, trend tracker |
| **Input** | Revenue data by product/region/customer, pricing changes, volume data, FX rates, customer cohorts |
| **Output** | Revenue bridge (waterfall chart), driver attribution with confidence, narrative explanation, trend analysis |
| **Databases** | PostgreSQL (revenue data), MongoDB (attribution results) |
| **Guardrails** | Attribution must sum to total variance, confidence intervals per driver, methodology disclosure |
| **Error Handling** | 'Unexplained' residual category for unattributable amounts, flag data gaps |
| **KPIs** | Attribution coverage >95% of variance, narrative quality >4/5, processing time <10min |
| **Multi-Agent** | Feeds Variance Agent (AGT-015), Board Package (AGT-025), Executive Briefing (AGT-001) |
| **Memory** | Long-term (driver importance evolution, seasonal attribution patterns) |
| **MCP Tools** | MCP Attribution Engine, MCP Revenue Data Server |

### AGT-148 — Cost Anomaly Deep-Dive Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Advanced Analytics → FP&A |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Performs autonomous deep-dive investigation of cost anomalies by drilling through GL hierarchy, analyzing vendor patterns, and identifying root causes without human guidance |
| **Trigger** | On cost anomaly flag (from any agent) + Scheduled scan |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (autonomous investigation chain) |
| **Tools** | GL drill-down navigator, vendor analyzer, contract comparer, trend detector, narrative generator |
| **Input** | Anomalous cost line item, GL hierarchy, vendor data, contracts, historical patterns |
| **Output** | Deep-dive report with root cause, drill-down path, vendor analysis, recommended actions |
| **Databases** | PostgreSQL (GL, AP), MongoDB (investigation results), pgvector (similar anomaly search) |
| **Guardrails** | Max drill-down depth 8 levels, evidence requirement per finding, no auto-correction |
| **Error Handling** | Report partial findings if drill-down blocked, flag data access limitations |
| **KPIs** | Root cause identification >80%, investigation time <10min (vs 2hrs manual), finding quality >4/5 |
| **Multi-Agent** | Triggered by Variance Agent (AGT-015), GL Health (AGT-045), JE Anomaly (AGT-042) |
| **Memory** | Long-term (investigation patterns, common cost anomaly causes) |
| **MCP Tools** | MCP GL Navigation Engine, MCP Vendor Analytics, MCP Investigation Engine |

### AGT-149 — Cohort Analysis Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Advanced Analytics → FP&A |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Performs customer and vendor cohort analysis to identify behavioral patterns, predict churn/growth, and support strategic planning with AI-generated insights |
| **Trigger** | Monthly (post-close) + On-demand |
| **LLM Model** | Claude Sonnet + statistical models |
| **Orchestrator** | LangGraph (analysis pipeline) |
| **Tools** | Cohort builder, retention analyzer, LTV calculator, churn predictor, growth segmenter, insight generator |
| **Input** | Customer transaction history, vendor spending, cohort definitions, KPI targets |
| **Output** | Cohort analysis report with retention curves, LTV estimates, churn predictions, growth segments |
| **Databases** | PostgreSQL (transaction data), MongoDB (cohort analysis results) |
| **Guardrails** | Minimum cohort size 30, statistical significance tests, no individual-level predictions for small cohorts |
| **Error Handling** | Merge small cohorts with similar profiles, flag insufficient data periods |
| **KPIs** | Churn prediction accuracy >75%, LTV estimate accuracy ±15%, insight actionability >4/5 |
| **Multi-Agent** | Feeds Revenue Forecasting (AGT-013), Board Package (AGT-025), Benchmark (AGT-022) |
| **Memory** | Long-term (cohort evolution history, predictive model improvements) |
| **MCP Tools** | MCP Cohort Engine, MCP Customer Analytics Server |

### AGT-150 — Financial Modeling Copilot Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Advanced Analytics → FP&A |
| **Agent Type** | Agentic AI (Cognitive/Conversational) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Interactive AI copilot for building financial models via natural language, supporting formula creation, assumption management, sensitivity analysis, and model auditing |
| **Trigger** | User interaction in modeling workspace |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (modeling chain) |
| **Tools** | Model builder, formula generator, assumption manager, sensitivity runner, model auditor, output formatter |
| **Input** | User instructions, existing model state, financial data, assumptions library |
| **Output** | Updated financial model, formula explanations, sensitivity outputs, audit findings, model documentation |
| **Databases** | PostgreSQL (model data), MongoDB (model versions), Redis (session state) |
| **Guardrails** | Formula validation before application, assumption documentation mandatory, version control |
| **Error Handling** | Undo capability for model changes, flag circular references, validate model integrity |
| **KPIs** | Model creation time reduction >50%, formula accuracy >98%, user satisfaction >4.5/5 |
| **Multi-Agent** | Uses Scenario Agent (AGT-017), Forecast Ensemble (AGT-144), Revenue Attribution (AGT-147) |
| **Memory** | Short-term (modeling session), Long-term (modeling patterns, user preferences) |
| **MCP Tools** | MCP Modeling Engine, MCP Formula Library, MCP Assumption Manager |

---
*Batch 3 of 4 — Agents 101-150 | Agentic Finance Director App | Feb 6, 2026*
