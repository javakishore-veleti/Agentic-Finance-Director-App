# 🤖 Agentic Finance Director — Agent Inventory (Batch 1: AGT-001 → AGT-050)

> **50 Agents | 8 Modules | Comprehensive AI Architecture**

> Part 1 of 4 batches (200 total agents)

---

## Agent Type Distribution (Batch 1)

| Agent Type | Count |
|-----------|-------|
| Learning Agent | 13 |
| Agentic AI (Goal-Based) | 9 |
| Model-Based Reflex Agent | 7 |
| Goal-Based Agent | 6 |
| Utility-Based Agent | 5 |
| Cognitive/Conversational Agent | 4 |
| Agentic AI (Cognitive/Conversational) | 2 |
| Agentic AI (Utility-Based) | 2 |
| Hierarchical Agent | 2 |

## Module Coverage (Batch 1)

| Module | Agents |
|--------|--------|
| Command Center | 12 |
| FP&A | 13 |
| Treasury | 13 |
| Accounting | 12 |

---

## 🔹 Command Center

### AGT-001 — Executive Briefing Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Dashboard |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Generates daily AI-powered executive financial briefings with KPI summaries, anomalies, and recommended actions |
| **Trigger** | Scheduled (6 AM daily) + On-demand |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph |
| **Tools** | SQL query tool, chart generator, email sender, PDF renderer |
| **Input** | KPI tables, GL balances, cash positions, budget vs actual |
| **Output** | Structured briefing document (HTML/PDF) with charts and action items |
| **Databases** | PostgreSQL (financials), Redis (KPI cache) |
| **Guardrails** | RAG grounding, fact-check against source data, human review flag for >$1M variances |
| **Error Handling** | Retry 3x, fallback to template-based briefing, alert ops team |
| **KPIs** | Briefing accuracy >95%, delivery by 6:30 AM, user satisfaction >4.5/5 |
| **Multi-Agent** | Calls Variance Agent, Cash Forecast Agent as sub-agents |
| **Memory** | Short-term (conversation), Long-term (user preferences via Mem0) |
| **MCP Tools** | MCP Financial Data Server, MCP Report Generator |

### AGT-002 — Financial Q&A Chat Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → AI Chat |
| **Agent Type** | Agentic AI (Cognitive/Conversational) |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | High |
| **Purpose** | Natural language interface for querying financial data using Text-to-SQL, RAG, and multi-turn conversation with tool use |
| **Trigger** | User chat message (real-time) |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (ReAct pattern) |
| **Tools** | Text-to-SQL, chart generator, document retriever, calculator, data export |
| **Input** | User natural language query, conversation history, financial schema |
| **Output** | Natural language response with embedded charts, tables, citations, follow-up suggestions |
| **Databases** | PostgreSQL + pgvector (embeddings), Redis (session), MongoDB (chat history) |
| **Guardrails** | SQL injection prevention, query cost limits, hallucination detection via RAG grounding, PII redaction |
| **Error Handling** | Clarification prompts, graceful degradation to keyword search, error logging |
| **KPIs** | Response accuracy >92%, latency <3s, user satisfaction >4.3/5 |
| **Multi-Agent** | Orchestrates SQL Agent, Chart Agent, Document Agent as tool-use sub-agents |
| **Memory** | Short-term (multi-turn context), Long-term (user query patterns via pgvector) |
| **MCP Tools** | MCP PostgreSQL Server, MCP Vector Search, MCP Chart Renderer |

### AGT-003 — Smart Notification Router Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Notifications |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Classifies, prioritizes, and routes incoming notifications to appropriate users based on content, urgency, and user preferences |
| **Trigger** | Event-driven (new notification created) |
| **LLM Model** | Claude Haiku |
| **Orchestrator** | n8n + Redis pub/sub |
| **Tools** | Classification model, user preference lookup, escalation rules engine |
| **Input** | Raw notification payload, user roles, notification preferences, escalation matrix |
| **Output** | Prioritized notification with routing decision, suppression if duplicate |
| **Databases** | PostgreSQL (notifications), Redis (routing rules, user prefs) |
| **Guardrails** | Priority ceiling for non-critical items, rate limiting per user, duplicate detection window |
| **Error Handling** | Default to broadcast if routing fails, dead letter queue for undeliverable |
| **KPIs** | Routing accuracy >97%, false positive suppression <2%, latency <500ms |
| **Multi-Agent** | None (standalone reactive agent) |
| **Memory** | Short-term (recent notification state for dedup) |
| **MCP Tools** | MCP Notification Gateway |

### AGT-004 — Activity Anomaly Detection Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Activity Feed |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Monitors platform activity feed for anomalous user behavior, unusual access patterns, and potential security incidents |
| **Trigger** | Streaming (every activity event) + Batch (hourly summary) |
| **LLM Model** | Claude Haiku + scikit-learn ensemble |
| **Orchestrator** | n8n (streaming) + LangGraph (investigation) |
| **Tools** | Anomaly scoring model, user baseline comparator, security alert creator |
| **Input** | Activity stream events, user behavioral baselines, access patterns |
| **Output** | Anomaly score per event, security alert if threshold exceeded, investigation summary |
| **Databases** | PostgreSQL (events), Redis (streaming), MongoDB (baselines) |
| **Guardrails** | Minimum confidence threshold 0.85, human review for high-severity, no auto-lockout without approval |
| **Error Handling** | Graceful degradation to rule-based detection, alert on model drift |
| **KPIs** | Detection rate >90%, false positive <5%, alert latency <2min |
| **Multi-Agent** | Escalates to Security Investigation Agent (AGT-185) |
| **Memory** | Long-term (evolving user baselines, seasonal patterns) |
| **MCP Tools** | MCP Activity Stream, MCP Security Gateway |

### AGT-005 — KPI Insight Generator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Dashboard |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Analyzes real-time KPI data to detect trends, breakpoints, and correlations, then generates plain-English insight cards for the dashboard |
| **Trigger** | Scheduled (every 4 hours) + On KPI threshold breach |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | Time-series analyzer, statistical tests, NLG text generator, chart annotator |
| **Input** | KPI time-series data (30/60/90 day), thresholds, peer benchmarks |
| **Output** | Insight cards with trend narrative, severity badge, recommended action, supporting chart |
| **Databases** | PostgreSQL (KPIs), Redis (cache) |
| **Guardrails** | Statistical significance p<0.05, no speculative claims without data backing |
| **Error Handling** | Skip insight if data insufficient, log and retry next cycle |
| **KPIs** | Insight relevance >88%, user click-through >40%, freshness <4hrs |
| **Multi-Agent** | Feeds insights to Executive Briefing Agent (AGT-001) |
| **Memory** | Medium-term (prior insights to avoid repetition) |
| **MCP Tools** | MCP Time-Series Analyzer, MCP Financial Data Server |

### AGT-006 — Cross-Module Correlation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Dashboard |
| **Agent Type** | Agentic AI (Utility-Based) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Discovers hidden correlations between metrics across different modules (e.g., FX exposure spike correlating with margin drop in FP&A) |
| **Trigger** | Scheduled (daily) + On major metric change |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (multi-step reasoning chain) |
| **Tools** | Correlation engine, Granger causality test, cross-module data fetcher, narrative generator |
| **Input** | Metrics from all 8 modules, historical correlation matrix |
| **Output** | Correlation report with causal hypotheses, impact scores, and suggested investigations |
| **Databases** | PostgreSQL (all modules), MongoDB (correlation history) |
| **Guardrails** | Minimum correlation coefficient 0.6, causal claims require Granger test, human review for recommendations |
| **Error Handling** | Partial analysis if some modules unavailable, flag data gaps |
| **KPIs** | Actionable correlations >3/week, investigation conversion >30% |
| **Multi-Agent** | Queries data from FP&A Agent, Treasury Agent, Risk Agent |
| **Memory** | Long-term (historical correlation patterns, false positive tracking) |
| **MCP Tools** | MCP Cross-Module Data Lake, MCP Statistical Engine |

### AGT-007 — Notification Digest Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Notifications |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Aggregates unread notifications into intelligent daily/weekly digest emails grouped by theme, priority, and required action |
| **Trigger** | Scheduled (end of day, end of week) |
| **LLM Model** | Claude Haiku |
| **Orchestrator** | n8n |
| **Tools** | Notification aggregator, theme clusterer, email template renderer, calendar checker |
| **Input** | Unread notifications, user preferences, action item status |
| **Output** | Formatted digest email with grouped notifications, action summary, and links |
| **Databases** | PostgreSQL (notifications), Redis (user prefs) |
| **Guardrails** | Respect user quiet hours, max 1 digest per period, unsubscribe option |
| **Error Handling** | Skip digest if no unread items, fallback to plain-text if template fails |
| **KPIs** | Open rate >60%, action completion from digest >25% |
| **Multi-Agent** | None (standalone) |
| **Memory** | Short-term (notification batch for current cycle) |
| **MCP Tools** | MCP Email Gateway |

### AGT-008 — Natural Language Activity Search Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Activity Feed |
| **Agent Type** | Cognitive/Conversational Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Translates natural language queries about platform activity into structured searches (e.g., 'Show all JE posts by Sarah this week') |
| **Trigger** | User search input (real-time) |
| **LLM Model** | Claude Haiku |
| **Orchestrator** | Direct API call |
| **Tools** | NL-to-query parser, activity search API, result formatter |
| **Input** | User natural language query, activity schema, user directory |
| **Output** | Filtered activity list matching the query, with facet suggestions |
| **Databases** | PostgreSQL (activity log), Redis (search cache) |
| **Guardrails** | Query scoping to user's permission level, max result limit 500 |
| **Error Handling** | Suggest reformulation if zero results, fallback to keyword search |
| **KPIs** | Search accuracy >90%, latency <1s, reformulation rate <15% |
| **Multi-Agent** | None |
| **Memory** | Short-term (recent queries for refinement) |
| **MCP Tools** | MCP Activity Search Server |

### AGT-009 — Dashboard Widget Recommender Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Dashboard |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Learns user dashboard interaction patterns to recommend widget arrangement, new widgets, and optimal data views per role |
| **Trigger** | On user login + Weekly retraining |
| **LLM Model** | Collaborative filtering + Claude Haiku |
| **Orchestrator** | n8n (retraining), Direct API (serving) |
| **Tools** | Clickstream analyzer, widget usage scorer, layout optimizer, A/B test framework |
| **Input** | User interaction logs, role definitions, widget catalog, peer usage patterns |
| **Output** | Personalized widget arrangement, new widget suggestions with explanation |
| **Databases** | PostgreSQL (usage data), MongoDB (user profiles), Redis (recommendations cache) |
| **Guardrails** | Minimum interaction data before recommending, opt-out option, no removal of mandatory widgets |
| **Error Handling** | Default layout if insufficient data, cold-start with role-based templates |
| **KPIs** | Widget adoption rate >20%, user retention +5%, layout change acceptance >35% |
| **Multi-Agent** | None |
| **Memory** | Long-term (evolving user preference model) |
| **MCP Tools** | MCP User Analytics Server |

### AGT-010 — Real-Time Alert Prioritization Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Dashboard |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Scores and ranks incoming alerts in real-time based on financial impact, urgency, user context, and organizational priority |
| **Trigger** | Event-driven (new alert) |
| **LLM Model** | Claude Haiku + XGBoost scoring model |
| **Orchestrator** | Redis pub/sub + n8n |
| **Tools** | Impact estimator, urgency classifier, context enricher, priority ranker |
| **Input** | Alert payload, financial context, user role, historical alert outcomes |
| **Output** | Priority score (0-100), urgency tier (P1-P4), recommended response time |
| **Databases** | PostgreSQL (alerts), Redis (scoring cache) |
| **Guardrails** | P1 alerts always surface immediately, no auto-suppression of financial alerts |
| **Error Handling** | Default to high priority if scoring fails, manual override capability |
| **KPIs** | Priority accuracy >93%, P1 alert latency <10s, false P1 rate <3% |
| **Multi-Agent** | Feeds into Smart Notification Router (AGT-003) |
| **Memory** | Short-term (current alert context) |
| **MCP Tools** | MCP Alert Scoring Engine |

### AGT-011 — Financial News Sentiment Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Dashboard |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Monitors financial news feeds for mentions of company, competitors, and macro events, generating sentiment scores and impact assessments |
| **Trigger** | Scheduled (every 30 min) + Breaking news webhook |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | n8n (feed ingestion) + LangGraph (analysis) |
| **Tools** | RSS/API feed reader, NLP sentiment analyzer, entity extractor, impact scorer |
| **Input** | News feeds (Reuters, Bloomberg, SEC filings), company entity list, watchlist |
| **Output** | Sentiment score per entity, impact assessment, trending topics, dashboard alert if negative |
| **Databases** | PostgreSQL (news events), pgvector (article embeddings), Redis (sentiment cache) |
| **Guardrails** | Source credibility scoring, no trading recommendations, fact-check against multiple sources |
| **Error Handling** | Skip unreachable feeds, stale data warning if >2hr old |
| **KPIs** | Sentiment accuracy >85%, coverage >90% of relevant news, latency <5min |
| **Multi-Agent** | Feeds into Risk Scoring Agent (AGT-041), Executive Briefing Agent (AGT-001) |
| **Memory** | Medium-term (entity sentiment history for trend detection) |
| **MCP Tools** | MCP News Feed Server, MCP NLP Pipeline |

### AGT-012 — Activity Report Generator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Command Center → Activity Feed |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Generates structured activity reports summarizing platform usage, agent runs, user actions, and system events for a given period |
| **Trigger** | Scheduled (weekly) + On-demand |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | Activity aggregator, chart generator, PDF/XLSX renderer, email sender |
| **Input** | Activity log, agent run history, user session data, time period selection |
| **Output** | Formatted report (PDF/XLSX) with activity summaries, charts, top users, agent performance |
| **Databases** | PostgreSQL (activity), MongoDB (agent runs), S3 (report storage) |
| **Guardrails** | PII masking in reports, role-based content filtering, data retention compliance |
| **Error Handling** | Partial report if some data unavailable, notification of incomplete sections |
| **KPIs** | Report generation <2min, completeness >95%, stakeholder satisfaction >4/5 |
| **Multi-Agent** | Queries Agent Dashboard Agent (AGT-037) for agent metrics |
| **Memory** | Short-term (report generation context) |
| **MCP Tools** | MCP Report Generator, MCP Activity Data Server |

## 🔹 FP&A

### AGT-013 — Revenue Forecasting Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Forecasting |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Multi-model ensemble revenue forecasting using ARIMA, Prophet, and LSTM with automatic model selection and confidence intervals |
| **Trigger** | Scheduled (weekly) + On-demand + On actuals refresh |
| **LLM Model** | Claude Sonnet + Prophet + LSTM |
| **Orchestrator** | LangGraph (forecast pipeline) |
| **Tools** | Prophet, statsmodels ARIMA, TensorFlow LSTM, model selector, confidence band calculator |
| **Input** | Historical revenue (36+ months), seasonality indices, pipeline data, macro indicators |
| **Output** | 13-week + 12-month forecast with confidence intervals, model comparison, driver analysis |
| **Databases** | PostgreSQL (revenue data), MongoDB (model artifacts), S3 (training data) |
| **Guardrails** | Forecast deviation alert if >15% from prior, model performance validation before serving |
| **Error Handling** | Fallback to naive forecast if all models fail, alert data science team |
| **KPIs** | MAPE <8%, forecast bias <2%, model refresh latency <5min |
| **Multi-Agent** | Part of FP&A Forecast Ensemble with OPEX Agent (AGT-014), Cash Agent (AGT-028) |
| **Memory** | Long-term (model weights, feature importance evolution) |
| **MCP Tools** | MCP Time-Series Engine, MCP Financial Data Server |

### AGT-014 — OPEX Forecasting Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Forecasting |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Forecasts operating expenses by category and department using driver-based models with headcount, contract, and seasonal adjustments |
| **Trigger** | Scheduled (weekly) + On budget update |
| **LLM Model** | Claude Sonnet + gradient boosting |
| **Orchestrator** | LangGraph |
| **Tools** | Driver-based model, headcount projector, contract analyzer, seasonal adjuster |
| **Input** | Historical OPEX (24+ months), headcount plan, vendor contracts, seasonal patterns |
| **Output** | Department-level OPEX forecast, driver contribution breakdown, variance from budget |
| **Databases** | PostgreSQL (OPEX data), MongoDB (model configs) |
| **Guardrails** | Department-level validation against budget, flag one-time items separately |
| **Error Handling** | Use prior period run-rate if model fails, notify FP&A team |
| **KPIs** | MAPE <10%, department-level accuracy >85%, refresh <3min |
| **Multi-Agent** | Ensemble member with Revenue Agent (AGT-013) |
| **Memory** | Long-term (OPEX patterns, contract renewal dates) |
| **MCP Tools** | MCP Financial Data Server, MCP HR Data Connector |

### AGT-015 — Variance Root Cause Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Variance Analysis |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Performs automated root cause analysis on budget-vs-actual variances using multi-dimensional drill-down and generates management narratives |
| **Trigger** | Post-close (when actuals finalized) + On-demand |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (multi-step investigation chain) |
| **Tools** | Variance decomposer, drill-down navigator, narrative generator, waterfall chart builder |
| **Input** | Budget, actuals, prior period, GL detail, department metadata |
| **Output** | Root cause report with materiality scores, waterfall charts, MD&A-style narratives per line item |
| **Databases** | PostgreSQL (financials), pgvector (historical narratives for RAG) |
| **Guardrails** | Materiality threshold ($10K or 5%), cite source GL entries, flag assumptions |
| **Error Handling** | Partial analysis if GL data incomplete, mark confidence level per finding |
| **KPIs** | Root cause identification accuracy >85%, narrative quality score >4/5, report delivery <30min |
| **Multi-Agent** | Calls GL Explorer Agent (AGT-036) for drill-down, feeds Executive Briefing Agent (AGT-001) |
| **Memory** | Long-term (historical variance patterns, recurring explanations via RAG) |
| **MCP Tools** | MCP Financial Data Server, MCP Narrative Engine |

### AGT-016 — Budget Optimization Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Budgets |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Recommends optimal budget allocations across departments using constraint optimization, historical efficiency, and strategic priorities |
| **Trigger** | On-demand (budget season) + Quarterly review |
| **LLM Model** | Claude Opus + scipy.optimize |
| **Orchestrator** | LangGraph |
| **Tools** | Linear/quadratic optimizer, constraint solver, scenario simulator, allocation recommender |
| **Input** | Historical spend efficiency, strategic priorities, department requests, constraints (headcount, capex limits) |
| **Output** | Optimized allocation matrix, trade-off analysis, sensitivity to key constraints |
| **Databases** | PostgreSQL (budgets), MongoDB (optimization results) |
| **Guardrails** | Respect minimum allocations, strategic priority weights from CFO, human approval required |
| **Error Handling** | Infeasible solution alert with relaxed constraints suggestion |
| **KPIs** | Optimization improvement >5% vs naive allocation, CFO acceptance >70% |
| **Multi-Agent** | Receives forecasts from Revenue Agent (AGT-013), OPEX Agent (AGT-014) |
| **Memory** | Medium-term (prior optimization outcomes for calibration) |
| **MCP Tools** | MCP Optimization Engine, MCP Financial Data Server |

### AGT-017 — Scenario Simulation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Scenario Modeling |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | High |
| **Purpose** | Runs Monte Carlo simulations and sensitivity analyses on financial scenarios with configurable distributions and correlation structures |
| **Trigger** | On-demand + Scheduled stress tests (quarterly) |
| **LLM Model** | Claude Opus + NumPy/SciPy |
| **Orchestrator** | LangGraph (simulation pipeline) |
| **Tools** | Monte Carlo engine, distribution fitter, correlation matrix builder, tornado chart generator |
| **Input** | Scenario parameters, probability distributions, variable correlations, financial model |
| **Output** | Probability distributions of outcomes, VaR, sensitivity rankings, tornado charts, narrative |
| **Databases** | PostgreSQL (scenarios), MongoDB (simulation results), S3 (large datasets) |
| **Guardrails** | Minimum 10K iterations, convergence check, parameter boundary validation |
| **Error Handling** | Reduce iterations if timeout, partial results with confidence warning |
| **KPIs** | Simulation completion <5min for 50K iterations, convergence >99% |
| **Multi-Agent** | Uses Revenue (AGT-013) and OPEX (AGT-014) model outputs as inputs |
| **Memory** | Medium-term (prior simulation results for comparison) |
| **MCP Tools** | MCP Simulation Engine, MCP Financial Model Server |

### AGT-018 — Budget Burn-Rate Monitor Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Budgets |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Continuously tracks budget consumption velocity per department, predicts exhaustion dates, and triggers early warnings |
| **Trigger** | Daily (overnight batch) + On large transaction posting |
| **LLM Model** | Claude Haiku + linear regression |
| **Orchestrator** | n8n (monitoring) + LangGraph (alerting) |
| **Tools** | Burn-rate calculator, exhaustion date predictor, trend visualizer, alert generator |
| **Input** | Budget allocations, YTD actuals, daily transaction feed, seasonal patterns |
| **Output** | Burn-rate dashboard data, exhaustion date forecasts, early warning alerts |
| **Databases** | PostgreSQL (budgets/actuals), Redis (burn-rate cache) |
| **Guardrails** | Alert thresholds at 75%, 90%, 100% of budget, exclude pre-approved overages |
| **Error Handling** | Use linear extrapolation if model fails, alert FP&A on data gaps |
| **KPIs** | Prediction accuracy ±5 days for exhaustion date, alert lead time >2 weeks |
| **Multi-Agent** | Feeds alerts to Notification Router (AGT-003) |
| **Memory** | Short-term (current burn trajectory) |
| **MCP Tools** | MCP Budget Data Server |

### AGT-019 — FP&A Commentary Generator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → FP&A Dashboard |
| **Agent Type** | Agentic AI (Cognitive/Conversational) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Auto-generates MD&A-style financial commentary for dashboards, reports, and board packages based on period-over-period data changes |
| **Trigger** | Post-close + On dashboard refresh |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph |
| **Tools** | Data change detector, narrative template engine, tone adjuster, chart integrator |
| **Input** | Current period financials, prior period, budget, peer data, management preferences |
| **Output** | Paragraph-length commentary per section, formatted for dashboard widgets or board decks |
| **Databases** | PostgreSQL (financials), pgvector (historical commentaries for style matching) |
| **Guardrails** | No forward-looking claims without 'projected' qualifier, consistent tone with prior reports |
| **Error Handling** | Placeholder text if data unavailable, flag sections needing human review |
| **KPIs** | Commentary relevance >90%, CFO edit rate <20%, generation time <2min |
| **Multi-Agent** | Uses outputs from Variance Agent (AGT-015), Revenue Agent (AGT-013) |
| **Memory** | Long-term (historical commentary style, CFO feedback for fine-tuning) |
| **MCP Tools** | MCP Narrative Engine, MCP Financial Data Server |

### AGT-020 — Seasonality Pattern Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Forecasting |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Detects and quantifies seasonal patterns across all financial metrics using decomposition and provides seasonality indices for other agents |
| **Trigger** | Monthly (after close) + On data refresh |
| **LLM Model** | statsmodels STL + Claude Haiku |
| **Orchestrator** | n8n (batch job) |
| **Tools** | STL decomposer, Fourier analysis, holiday calendar, index calculator |
| **Input** | 24+ months of financial time-series, holiday calendar, industry events |
| **Output** | Seasonality indices per metric, decomposition charts, anomaly-adjusted baselines |
| **Databases** | PostgreSQL (time-series), MongoDB (seasonality indices) |
| **Guardrails** | Minimum 24 months of data required, flag structural breaks |
| **Error Handling** | Default to flat seasonality if insufficient data, alert if pattern shift detected |
| **KPIs** | Seasonality capture accuracy >90%, index stability month-over-month |
| **Multi-Agent** | Provides indices to Revenue Agent (AGT-013), OPEX Agent (AGT-014), Budget Agent (AGT-016) |
| **Memory** | Long-term (evolving seasonality patterns) |
| **MCP Tools** | MCP Time-Series Engine |

### AGT-021 — Scenario Natural Language Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Scenario Modeling |
| **Agent Type** | Cognitive/Conversational Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Accepts natural language scenario descriptions ('Model a 15% revenue drop with flat costs') and translates them into simulation parameters |
| **Trigger** | User input (real-time) |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (parameter extraction chain) |
| **Tools** | NL parameter extractor, validation engine, scenario builder API, preview generator |
| **Input** | User natural language description, available scenario variables, constraints |
| **Output** | Structured scenario parameters, validation results, preview of key metric impacts |
| **Databases** | PostgreSQL (scenario templates), Redis (session cache) |
| **Guardrails** | Confirm extracted parameters with user before running, boundary validation |
| **Error Handling** | Ask clarifying questions for ambiguous inputs, suggest closest valid scenario |
| **KPIs** | Parameter extraction accuracy >92%, user confirmation rate >80%, latency <2s |
| **Multi-Agent** | Passes parameters to Scenario Simulation Agent (AGT-017) |
| **Memory** | Short-term (conversation context for multi-turn refinement) |
| **MCP Tools** | MCP Scenario Builder API |

### AGT-022 — Benchmark Comparison Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → FP&A Dashboard |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Compares company financial metrics against industry peers and public benchmarks, highlighting areas of outperformance and concern |
| **Trigger** | Monthly (post-close) + On-demand |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | Benchmark data fetcher, percentile calculator, gap analyzer, report generator |
| **Input** | Company financials, industry benchmark databases, peer company data (public filings) |
| **Output** | Benchmark scorecard, percentile rankings, gap analysis narrative, improvement suggestions |
| **Databases** | PostgreSQL (company data), MongoDB (benchmark data), S3 (public filings) |
| **Guardrails** | Use only public/licensed benchmark data, note data vintage, size-adjusted comparisons |
| **Error Handling** | Partial comparison if some benchmarks unavailable, flag stale benchmark data |
| **KPIs** | Benchmark coverage >80% of KPIs, relevance score >85% |
| **Multi-Agent** | Feeds into FP&A Commentary Agent (AGT-019) |
| **Memory** | Long-term (historical ranking trends) |
| **MCP Tools** | MCP Benchmark Data Server, MCP Public Filings Server |

### AGT-023 — Budget Approval Workflow Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Budgets |
| **Agent Type** | Hierarchical Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Manages multi-level budget approval workflows with AI risk scoring, auto-approval for low-risk items, and escalation for exceptions |
| **Trigger** | On budget submission |
| **LLM Model** | Claude Haiku |
| **Orchestrator** | n8n (workflow engine) |
| **Tools** | Risk scorer, approval router, SLA tracker, reminder sender, audit logger |
| **Input** | Budget submission, approval hierarchy, risk thresholds, historical approval patterns |
| **Output** | Approval routing decision, risk score, SLA timeline, approval/rejection with comments |
| **Databases** | PostgreSQL (budgets/approvals), Redis (workflow state) |
| **Guardrails** | Auto-approve only if risk<20 AND amount<$50K, mandatory CFO review for >$500K |
| **Error Handling** | Escalate to next approver if timeout, dead-end alert after 72hrs |
| **KPIs** | Avg approval cycle <48hrs, auto-approval rate >40%, SLA compliance >95% |
| **Multi-Agent** | Queries Budget Optimization Agent (AGT-016) for risk assessment |
| **Memory** | Short-term (workflow state) |
| **MCP Tools** | MCP Workflow Engine, MCP Notification Gateway |

### AGT-024 — Variance Trend Pattern Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Variance Analysis |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Identifies recurring variance patterns across periods (e.g., 'Marketing always overspends in Q4') and predicts future variances before they occur |
| **Trigger** | Monthly (post-close) + Continuous learning |
| **LLM Model** | Claude Sonnet + pattern mining |
| **Orchestrator** | LangGraph |
| **Tools** | Pattern miner, recurrence detector, prediction model, preventive action recommender |
| **Input** | 12+ months of variance data, root cause annotations, department metadata |
| **Output** | Recurring pattern catalog, predicted future variances, preventive recommendations |
| **Databases** | PostgreSQL (variance history), MongoDB (pattern catalog) |
| **Guardrails** | Minimum 3 occurrences to declare pattern, confidence scoring per prediction |
| **Error Handling** | Low-confidence predictions flagged as tentative, quarterly pattern review |
| **KPIs** | Pattern detection recall >80%, prediction accuracy >70%, false positive <10% |
| **Multi-Agent** | Feeds patterns to Budget Burn-Rate Agent (AGT-018), Variance Root Cause Agent (AGT-015) |
| **Memory** | Long-term (growing pattern library) |
| **MCP Tools** | MCP Pattern Mining Engine |

### AGT-025 — Board Package Generator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | FP&A → Scenario Modeling |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Assembles comprehensive board-ready financial packages combining forecasts, scenarios, variances, and commentary into formatted presentations |
| **Trigger** | On-demand (pre-board meeting) + Scheduled (quarterly) |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (multi-agent assembly) |
| **Tools** | Data aggregator, PPTX/PDF generator, chart builder, narrative weaver, compliance checker |
| **Input** | All FP&A outputs (forecasts, budgets, variance, scenarios), executive preferences |
| **Output** | Board package (PPTX + PDF) with executive summary, financials, scenarios, appendix |
| **Databases** | PostgreSQL (all financials), MongoDB (templates), S3 (packages) |
| **Guardrails** | Compliance review checklist, consistent formatting, CFO final sign-off required |
| **Error Handling** | Flag incomplete sections, provide draft with missing data placeholders |
| **KPIs** | Package assembly <30min, CFO revision rounds <2, board satisfaction >4.5/5 |
| **Multi-Agent** | Orchestrates Revenue (AGT-013), Variance (AGT-015), Scenario (AGT-017), Commentary (AGT-019) agents |
| **Memory** | Long-term (board preferences, historical package formats) |
| **MCP Tools** | MCP Report Generator, MCP Presentation Builder |

## 🔹 Treasury

### AGT-026 — Daily Cash Position Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → Cash Position |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Aggregates real-time bank balances across all accounts and entities, normalizes currencies, and produces consolidated cash position report |
| **Trigger** | Scheduled (every 15 min during business hours) + On bank feed update |
| **LLM Model** | Claude Haiku |
| **Orchestrator** | n8n (feed aggregation) + LangGraph (analysis) |
| **Tools** | Bank API connector (Plaid), FX rate fetcher, balance aggregator, position formatter |
| **Input** | Bank feeds (all accounts), FX rates, entity structure, cash pooling rules |
| **Output** | Consolidated cash position by entity, currency, bank; net position after pooling |
| **Databases** | PostgreSQL (positions), Redis (real-time balances, rates) |
| **Guardrails** | Stale data flag if feed >1hr old, reconciliation check vs prior position |
| **Error Handling** | Use last known balance if feed unavailable, alert treasury team for >4hr outage |
| **KPIs** | Position accuracy >99.5%, feed latency <5min, update frequency 15min |
| **Multi-Agent** | Feeds Cash Forecast Agent (AGT-028), Treasury Dashboard (AGT-027) |
| **Memory** | Short-term (intraday position changes) |
| **MCP Tools** | MCP Bank Feed Server (Plaid), MCP FX Rate Server |

### AGT-027 — Treasury Morning Briefing Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → Treasury Dashboard |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Generates daily treasury morning briefing with cash positions, FX movements, investment maturities, and market conditions for the treasurer |
| **Trigger** | Scheduled (7 AM daily) |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | Cash position fetcher, market data API, FX movement analyzer, maturity calendar, email renderer |
| **Input** | Cash positions, overnight FX moves, investment maturity schedule, market news |
| **Output** | Formatted morning briefing email with key metrics, alerts, action items |
| **Databases** | PostgreSQL (treasury data), Redis (market cache) |
| **Guardrails** | No investment recommendations (advisory only), fact-check market data |
| **Error Handling** | Send partial briefing with data availability note, retry failed sections |
| **KPIs** | Delivery by 7:15 AM, content relevance >90%, treasurer satisfaction >4.5/5 |
| **Multi-Agent** | Queries Cash Position Agent (AGT-026), FX Agent (AGT-031), Investment Agent (AGT-033) |
| **Memory** | Short-term (daily context), Medium-term (treasurer preferences) |
| **MCP Tools** | MCP Treasury Data Server, MCP Email Gateway |

### AGT-028 — 13-Week Cash Forecast Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → Cash Position |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Produces rolling 13-week cash flow forecasts at daily granularity using historical patterns, AR/AP aging, and payment behavior prediction |
| **Trigger** | Daily (overnight) + On major transaction |
| **LLM Model** | Claude Sonnet + Prophet + XGBoost |
| **Orchestrator** | LangGraph (forecast pipeline) |
| **Tools** | Prophet, payment predictor, AR aging analyzer, AP scheduler, confidence calculator |
| **Input** | Historical cash flows (52+ weeks), AR aging, AP schedule, recurring payments, payroll calendar |
| **Output** | Daily cash forecast for 13 weeks, confidence bands, liquidity risk flags, variance from prior forecast |
| **Databases** | PostgreSQL (cash flow data), MongoDB (model artifacts), Redis (forecast cache) |
| **Guardrails** | Backtest on rolling 4-week window, alert if forecast error >10% |
| **Error Handling** | Fallback to run-rate model if ML models fail, manual override capability |
| **KPIs** | MAPE <7% at 1-week horizon, <12% at 4-week, refresh time <10min |
| **Multi-Agent** | Part of Treasury Ensemble: feeds Cash Position (AGT-026), Investment Agent (AGT-033) |
| **Memory** | Long-term (payment behavior models, seasonal cash patterns) |
| **MCP Tools** | MCP Cash Flow Engine, MCP AR/AP Data Server |

### AGT-029 — Bank Transaction Categorizer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → Bank Accounts |
| **Agent Type** | Learning Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Automatically categorizes incoming bank transactions using NLP on descriptions, historical patterns, and vendor matching |
| **Trigger** | Event-driven (new transaction from bank feed) |
| **LLM Model** | Claude Haiku + fine-tuned classification model |
| **Orchestrator** | n8n (stream processing) |
| **Tools** | NLP text classifier, vendor matcher, GL account mapper, confidence scorer |
| **Input** | Bank transaction (description, amount, date, counterparty), GL chart of accounts, vendor master |
| **Output** | Categorized transaction with GL account, vendor match, confidence score, review flag if <80% |
| **Databases** | PostgreSQL (transactions), MongoDB (classification model), Redis (vendor cache) |
| **Guardrails** | Human review required for confidence <80%, new vendor triggers review, amount >$100K needs approval |
| **Error Handling** | Queue uncategorized transactions for manual review, learn from corrections |
| **KPIs** | Auto-categorization rate >85%, accuracy >95% for auto-categorized, latency <2s |
| **Multi-Agent** | Feeds Reconciliation Agent (AGT-034), GL posting pipeline |
| **Memory** | Long-term (improving classification from corrections, vendor patterns) |
| **MCP Tools** | MCP Bank Feed Server, MCP GL Mapping Engine |

### AGT-030 — Bank Fee Optimizer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → Bank Accounts |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Analyzes bank fees across all accounts, identifies overcharges, compares against contractual rates, and recommends optimization strategies |
| **Trigger** | Monthly (after bank statement processing) |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | Fee extractor, contract rate comparator, benchmark database, savings calculator, report generator |
| **Input** | Bank fee statements (AFP codes), contractual rates, industry benchmarks, transaction volumes |
| **Output** | Fee analysis report with overcharges, savings opportunities, negotiation recommendations |
| **Databases** | PostgreSQL (fees), MongoDB (contracts, benchmarks) |
| **Guardrails** | Use verified contractual rates only, flag estimates, no direct bank communication |
| **Error Handling** | Flag fees that don't match known AFP codes, partial analysis for missing statements |
| **KPIs** | Fee coverage >95% of accounts, identified savings >$10K/year, report delivery <1 day post-statement |
| **Multi-Agent** | None (standalone analysis agent) |
| **Memory** | Long-term (fee trend history, negotiation outcomes) |
| **MCP Tools** | MCP Bank Statement Parser, MCP Contract Database |

### AGT-031 — FX Exposure Calculator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → FX Exposure |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Calculates real-time FX exposure across all entities, netting inter-company positions, and mapping against existing hedges |
| **Trigger** | Daily + On rate movement >1% + On new FX transaction |
| **LLM Model** | Claude Haiku |
| **Orchestrator** | n8n + LangGraph |
| **Tools** | Exposure aggregator, netting engine, hedge mapper, rate fetcher, position calculator |
| **Input** | All FX-denominated assets/liabilities, inter-company positions, hedge instruments, live rates |
| **Output** | Net FX exposure by currency pair, hedge coverage ratio, unhedged exposure, VaR |
| **Databases** | PostgreSQL (FX positions), Redis (live rates), MongoDB (hedge documents) |
| **Guardrails** | Dual-source rate validation, reconciliation with prior calculation, alert on >10% exposure change |
| **Error Handling** | Use prior day rates if feed unavailable, flag stale data in report |
| **KPIs** | Exposure accuracy >99%, calculation latency <30s, coverage of all currency pairs |
| **Multi-Agent** | Feeds FX Hedging Advisor (AGT-032), Treasury Dashboard (AGT-027) |
| **Memory** | Short-term (intraday exposure changes) |
| **MCP Tools** | MCP FX Rate Server, MCP Position Aggregator |

### AGT-032 — FX Hedging Advisor Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → FX Exposure |
| **Agent Type** | Agentic AI (Utility-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Recommends optimal hedging strategies (forwards, options, collars) based on exposure, risk appetite, market conditions, and cost constraints |
| **Trigger** | On exposure change + Weekly strategy review + On-demand |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (multi-step analysis) |
| **Tools** | Option pricer, forward calculator, strategy optimizer, cost-benefit analyzer, scenario runner |
| **Input** | Current exposure (from AGT-031), market rates, volatility surface, hedging policy, cost budget |
| **Output** | Hedging recommendation with instrument type, notional, tenor, expected cost, risk reduction % |
| **Databases** | PostgreSQL (hedges), MongoDB (strategies), Redis (market data) |
| **Guardrails** | Comply with hedging policy limits, no speculative positions, require treasury approval |
| **Error Handling** | Conservative recommendation if market data stale, defer to manual if model uncertain |
| **KPIs** | Hedge effectiveness >80%, cost within budget, recommendation acceptance >60% |
| **Multi-Agent** | Receives exposure from AGT-031, market data from AGT-011 |
| **Memory** | Long-term (strategy effectiveness history, market regime patterns) |
| **MCP Tools** | MCP FX Pricing Engine, MCP Market Data Server |

### AGT-033 — Investment Portfolio Optimizer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → Investments |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Optimizes short-term investment allocation using mean-variance optimization, considering liquidity needs, credit limits, and yield targets |
| **Trigger** | Daily (cash surplus detection) + On maturity event |
| **LLM Model** | Claude Sonnet + scipy.optimize |
| **Orchestrator** | LangGraph |
| **Tools** | Mean-variance optimizer, liquidity need estimator, credit limit checker, yield curve analyzer |
| **Input** | Available cash surplus, investment policy, credit limits, yield curves, maturity schedule |
| **Output** | Optimal allocation matrix by instrument type, expected yield, risk metrics, rebalancing trades |
| **Databases** | PostgreSQL (portfolio), Redis (market rates), MongoDB (policy docs) |
| **Guardrails** | Investment policy compliance check, single-issuer concentration <10%, minimum liquidity buffer |
| **Error Handling** | Sweep to overnight repo if optimizer fails, alert portfolio manager |
| **KPIs** | Yield improvement >10bps vs naive, policy compliance 100%, rebalancing cost <5bps |
| **Multi-Agent** | Uses Cash Forecast (AGT-028) for liquidity needs, Market Rates from AGT-031 |
| **Memory** | Medium-term (portfolio performance history, yield spread patterns) |
| **MCP Tools** | MCP Portfolio Engine, MCP Market Data Server |

### AGT-034 — Bank Reconciliation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → Bank Accounts |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Automatically matches bank transactions to GL entries using fuzzy matching, pattern recognition, and learns from historical match corrections |
| **Trigger** | On bank feed update (every 15 min) + Daily batch |
| **LLM Model** | Claude Haiku + fuzzy matching ML |
| **Orchestrator** | LangGraph (matching pipeline) |
| **Tools** | Fuzzy matcher, amount comparator, date proximity scorer, vendor name normalizer, exception handler |
| **Input** | Bank transactions, GL entries, historical match patterns, matching rules |
| **Output** | Matched pairs with confidence, unmatched exceptions list, auto-reconciliation report |
| **Databases** | PostgreSQL (recon data), MongoDB (match patterns), Redis (matching queue) |
| **Guardrails** | Auto-match only if confidence >95%, human review for >$50K mismatches, audit trail |
| **Error Handling** | Queue low-confidence matches for review, alert if unmatched rate >15% |
| **KPIs** | Auto-match rate >80%, match accuracy >99%, processing time <5min per batch |
| **Multi-Agent** | Uses Transaction Categorizer (AGT-029) output, feeds Close Checklist Agent (AGT-035) |
| **Memory** | Long-term (improving match patterns from corrections) |
| **MCP Tools** | MCP Reconciliation Engine, MCP Bank Feed Server |

### AGT-035 — Payment Timing Prediction Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → Cash Position |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Predicts when customers will pay invoices and when vendor payments will clear, improving daily cash flow forecast accuracy |
| **Trigger** | Daily (overnight) + On new invoice/payment |
| **LLM Model** | XGBoost + Claude Haiku (narrative) |
| **Orchestrator** | n8n (batch prediction) + LangGraph (analysis) |
| **Tools** | Payment behavior model, customer scoring, aging analyzer, clearing time estimator |
| **Input** | AR aging, customer payment history, invoice metadata, banking clearing times |
| **Output** | Predicted payment dates per invoice, probability distribution, late payment risk flags |
| **Databases** | PostgreSQL (AR/AP), MongoDB (prediction models) |
| **Guardrails** | Minimum 6 months of customer history for individual prediction, group-level otherwise |
| **Error Handling** | Use industry-average DSO if insufficient customer data, flag low-confidence predictions |
| **KPIs** | Payment date accuracy ±3 days for 80% of invoices, late payment detection >85% |
| **Multi-Agent** | Critical input to Cash Forecast Agent (AGT-028) |
| **Memory** | Long-term (evolving customer payment behavior profiles) |
| **MCP Tools** | MCP AR/AP Data Server, MCP Prediction Engine |

### AGT-036 — FX Rate Forecast Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → FX Exposure |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Forecasts short-term FX rate movements using LSTM neural networks, macro indicators, and central bank policy signals for hedging timing decisions |
| **Trigger** | Hourly during market hours + On major macro event |
| **LLM Model** | LSTM neural network + Claude Sonnet (interpretation) |
| **Orchestrator** | n8n (model inference) + LangGraph (interpretation) |
| **Tools** | LSTM rate model, macro indicator fetcher, central bank calendar, confidence estimator |
| **Input** | Historical FX rates (5+ years), macro indicators (CPI, rates, GDP), central bank communications |
| **Output** | Rate forecasts (1d, 1w, 1m) with confidence intervals, directional bias, macro factor attribution |
| **Databases** | PostgreSQL (rate history), MongoDB (model artifacts), Redis (live forecasts) |
| **Guardrails** | No point estimates without confidence bands, model accuracy tracking, disclosure of model limitations |
| **Error Handling** | Fallback to random walk if model performance degrades, alert on regime change detection |
| **KPIs** | Directional accuracy >55% (1-week), outperform random walk by >2%, latency <30s |
| **Multi-Agent** | Feeds FX Hedging Advisor (AGT-032) for timing decisions |
| **Memory** | Long-term (model weights, market regime state) |
| **MCP Tools** | MCP FX Rate Server, MCP Macro Data Server |

### AGT-037 — Fraud Detection Agent (Treasury)

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → Bank Accounts |
| **Agent Type** | Learning Agent |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | High |
| **Purpose** | Detects potentially fraudulent transactions in real-time using behavioral analysis, velocity checks, and anomaly scoring across all bank accounts |
| **Trigger** | Real-time (every transaction) + Daily batch review |
| **LLM Model** | Isolation Forest + Claude Haiku (investigation) |
| **Orchestrator** | Redis Streams + LangGraph (investigation) |
| **Tools** | Anomaly scorer, velocity checker, beneficiary validator, geographic risk mapper, investigation tracker |
| **Input** | Transaction stream, historical patterns, beneficiary whitelist, velocity thresholds, geo-risk database |
| **Output** | Fraud risk score per transaction, hold/release decision, investigation case creation for high-risk |
| **Databases** | PostgreSQL (transactions), Redis (velocity counters), MongoDB (fraud cases) |
| **Guardrails** | No auto-block without human confirmation for >$10K, immediate alert for >$100K anomaly |
| **Error Handling** | Default to queue for review if scoring fails, alert fraud team for system issues |
| **KPIs** | Detection rate >95%, false positive <3%, alert latency <10s for real-time |
| **Multi-Agent** | Escalates to Security Investigation Agent (AGT-185), feeds Activity Anomaly Agent (AGT-004) |
| **Memory** | Long-term (evolving fraud patterns, false positive corrections) |
| **MCP Tools** | MCP Bank Feed Server, MCP Fraud Database |

### AGT-038 — Liquidity Risk Monitor Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Treasury → Treasury Dashboard |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Continuously monitors liquidity ratios, cash runway, and covenant compliance with predictive early warnings for liquidity stress events |
| **Trigger** | Hourly + On major cash movement + On covenant metric update |
| **LLM Model** | Claude Haiku + rule engine |
| **Orchestrator** | n8n (monitoring) + LangGraph (alerting) |
| **Tools** | Ratio calculator, covenant tracker, runway estimator, stress tester, alert generator |
| **Input** | Cash positions, debt facilities, covenant terms, cash forecasts, committed facilities |
| **Output** | Liquidity dashboard data, covenant compliance status, runway estimate, early warning alerts |
| **Databases** | PostgreSQL (treasury), Redis (liquidity metrics) |
| **Guardrails** | Multiple buffer layers (green/amber/red), no auto-drawdown on facilities |
| **Error Handling** | Conservative estimate if data missing, escalate immediately for red zone |
| **KPIs** | Monitoring uptime >99.9%, covenant breach prediction >30 days lead time |
| **Multi-Agent** | Uses Cash Forecast (AGT-028), feeds Executive Briefing (AGT-001), Risk Dashboard (AGT-041) |
| **Memory** | Short-term (intraday liquidity state) |
| **MCP Tools** | MCP Treasury Data Server, MCP Covenant Tracker |

## 🔹 Accounting

### AGT-039 — Close Progress Predictor Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → Accounting Dashboard |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Predicts month-end close completion date based on current task velocity, identifies bottlenecks, and recommends task reassignments |
| **Trigger** | Continuous during close period (every 30 min) + On task status change |
| **LLM Model** | Claude Sonnet + process mining |
| **Orchestrator** | LangGraph |
| **Tools** | Task velocity analyzer, critical path calculator, bottleneck detector, prediction model, reassignment recommender |
| **Input** | Close task list with statuses, task dependencies, historical close timelines, assignee capacity |
| **Output** | Predicted completion date, confidence interval, bottleneck list, reassignment suggestions |
| **Databases** | PostgreSQL (close tasks), MongoDB (close history) |
| **Guardrails** | Account for known delays, holiday calendar awareness, no auto-reassignment without manager approval |
| **Error Handling** | Use historical average if prediction model uncertain, flag to controller |
| **KPIs** | Prediction accuracy ±1 day, bottleneck detection >90%, close cycle improvement >10% |
| **Multi-Agent** | Feeds Close Checklist Agent (AGT-040), Dashboard metrics |
| **Memory** | Long-term (close cycle patterns, seasonal complexity factors) |
| **MCP Tools** | MCP Close Management Server, MCP Task Engine |

### AGT-040 — Close Task Automation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → Close Checklist |
| **Agent Type** | Hierarchical Agent |
| **Behavior** | Proactive + Reactive |
| **Autonomy** | High |
| **Purpose** | Auto-completes routine close tasks (account roll-forwards, standard reconciliations, recurring JEs) and manages task dependency orchestration |
| **Trigger** | On dependency met (predecessor task complete) + Scheduled |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph (DAG execution) + n8n (scheduling) |
| **Tools** | Roll-forward calculator, template JE executor, reconciliation runner, evidence collector, sign-off requester |
| **Input** | Close checklist, task templates, prior period data, reconciliation rules, evidence requirements |
| **Output** | Completed tasks with evidence, draft items for review, updated checklist status |
| **Databases** | PostgreSQL (close tasks), MongoDB (evidence), S3 (attachments) |
| **Guardrails** | Auto-complete only pre-approved routine tasks, human review checkpoints, full audit trail |
| **Error Handling** | Flag task as blocked with error description, attempt alternative approach, escalate after 2 retries |
| **KPIs** | Auto-completion rate >50% of routine tasks, accuracy >99%, close cycle reduction >2 days |
| **Multi-Agent** | Orchestrates JE Agent (AGT-043), Reconciliation Agent (AGT-044), calls Close Predictor (AGT-039) |
| **Memory** | Medium-term (task completion patterns, error patterns for improvement) |
| **MCP Tools** | MCP Close Management Server, MCP Evidence Vault |

### AGT-041 — Accrual Calculation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → Journal Entries |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Automatically calculates and generates accrual journal entries for recurring items (insurance, rent, subscriptions, payroll) based on contracts and schedules |
| **Trigger** | Close period start + On contract change |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | Accrual calculator, contract parser, schedule builder, JE generator, reversal scheduler |
| **Input** | Active contracts, accrual schedules, GL balances, payment calendars |
| **Output** | Draft accrual JEs with supporting calculations, auto-reversal entries for next period |
| **Databases** | PostgreSQL (GL, contracts), MongoDB (accrual schedules) |
| **Guardrails** | Reconcile to prior period accruals, materiality check, manager approval for new accruals |
| **Error Handling** | Flag contracts with ambiguous terms for manual calculation, use prior period amount as fallback |
| **KPIs** | Accrual accuracy >98%, auto-generation rate >80%, processing time <10min |
| **Multi-Agent** | Feeds into Close Task Agent (AGT-040), JE approval workflow (AGT-023) |
| **Memory** | Long-term (contract terms, historical accrual amounts) |
| **MCP Tools** | MCP Contract Parser, MCP JE Generator |

### AGT-042 — Journal Entry Anomaly Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → Journal Entries |
| **Agent Type** | Learning Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Screens all journal entries for anomalies (unusual amounts, accounts, timing, round-number patterns, user behavior) before posting |
| **Trigger** | On JE submission (pre-posting validation) |
| **LLM Model** | Claude Haiku + Isolation Forest |
| **Orchestrator** | Event-driven (API middleware) |
| **Tools** | Anomaly scorer, Benford's law checker, user behavior profiler, amount pattern detector, round-number flagger |
| **Input** | Submitted JE, historical JE patterns, user posting history, account norms |
| **Output** | Risk score (0-100), anomaly flags with explanations, approval routing decision |
| **Databases** | PostgreSQL (JE data), MongoDB (user behavior models) |
| **Guardrails** | No auto-block for score <80, required review for score >80, immediate escalation for score >95 |
| **Error Handling** | Default to manual review if scoring fails, log all scoring decisions |
| **KPIs** | Anomaly detection >90%, false positive <8%, processing latency <1s |
| **Multi-Agent** | Gates JE posting pipeline, escalates to Audit Agent (AGT-049) for high-risk |
| **Memory** | Long-term (evolving anomaly baselines per account, user) |
| **MCP Tools** | MCP JE Validation Engine, MCP Anomaly Detection Server |

### AGT-043 — Natural Language JE Creator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → Journal Entries |
| **Agent Type** | Cognitive/Conversational Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Creates journal entries from natural language descriptions (e.g., 'Accrue $24K for Q1 insurance, split across 3 departments evenly') |
| **Trigger** | User input (real-time) |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (entity extraction + JE construction) |
| **Tools** | NL parser, account suggester, amount calculator, department allocator, JE previewer |
| **Input** | User natural language description, chart of accounts, department list, allocation rules |
| **Output** | Structured JE with debits/credits, accounts, amounts, memo; preview for user confirmation |
| **Databases** | PostgreSQL (GL schema), Redis (account suggestions cache) |
| **Guardrails** | Always require user confirmation before posting, validate debits=credits, check account validity |
| **Error Handling** | Ask clarifying questions for ambiguous descriptions, suggest corrections for invalid accounts |
| **KPIs** | First-attempt accuracy >85%, user confirmation rate >90%, time savings >60% vs manual entry |
| **Multi-Agent** | Output flows through JE Anomaly Agent (AGT-042) for validation |
| **Memory** | Short-term (conversation context), Long-term (user posting preferences) |
| **MCP Tools** | MCP GL Schema Server, MCP JE Generator |

### AGT-044 — Auto-Reconciliation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → Reconciliation |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Performs multi-way reconciliation (bank↔GL↔subledger) using AI matching, automatically resolving simple exceptions and flagging complex ones |
| **Trigger** | On bank feed update + Daily batch + Close period |
| **LLM Model** | Claude Haiku + fuzzy matching ensemble |
| **Orchestrator** | LangGraph (matching + resolution pipeline) |
| **Tools** | Multi-way matcher, fuzzy scorer, exception classifier, auto-resolver, evidence linker |
| **Input** | Bank statements, GL entries, subledger details, matching rules, historical resolutions |
| **Output** | Reconciliation status per account, matched/unmatched items, auto-resolved items with evidence |
| **Databases** | PostgreSQL (recon data), MongoDB (match history, resolutions), S3 (bank statements) |
| **Guardrails** | Auto-resolve only known exception types (timing, rounding), human review for >$5K exceptions |
| **Error Handling** | Queue unresolvable items with context for manual review, alert if exception rate >10% |
| **KPIs** | Auto-match rate >85%, auto-resolution rate >40% of exceptions, accuracy >99.5% |
| **Multi-Agent** | Uses Bank Reconciliation Agent (AGT-034) output, feeds Close Task Agent (AGT-040) |
| **Memory** | Long-term (exception resolution patterns, improving match algorithms) |
| **MCP Tools** | MCP Reconciliation Engine, MCP Evidence Vault |

### AGT-045 — GL Account Health Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → GL Explorer |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Monitors GL account balances for unusual patterns, stale balances, unexpected sign changes, and potential misclassifications |
| **Trigger** | Daily (overnight) + On significant posting |
| **LLM Model** | Claude Haiku + statistical tests |
| **Orchestrator** | n8n (monitoring) + LangGraph (analysis) |
| **Tools** | Balance analyzer, sign checker, staleness detector, misclassification scorer, trend monitor |
| **Input** | GL trial balance, account metadata, historical balance patterns, posting activity |
| **Output** | Account health scorecard, flagged accounts with issues, recommended actions |
| **Databases** | PostgreSQL (GL), Redis (health cache) |
| **Guardrails** | Context-aware thresholds per account type, no auto-reclassification |
| **Error Handling** | Skip analysis for accounts with insufficient history, flag for manual review |
| **KPIs** | Issue detection >85%, false positive <10%, coverage of all active accounts |
| **Multi-Agent** | Feeds Close Checklist Agent (AGT-040), alerts to Notification Router (AGT-003) |
| **Memory** | Long-term (evolving account baselines) |
| **MCP Tools** | MCP GL Data Server, MCP Account Health Monitor |

### AGT-046 — Intercompany Elimination Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → Journal Entries |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Identifies and generates intercompany elimination entries for consolidated reporting, matching IC balances and flagging discrepancies |
| **Trigger** | Close period (after entity-level close) + On-demand |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | IC balance matcher, elimination JE generator, discrepancy reporter, consolidation validator |
| **Input** | Entity-level trial balances, IC account mappings, elimination rules, prior period eliminations |
| **Output** | Elimination JEs, IC discrepancy report, consolidated trial balance impact |
| **Databases** | PostgreSQL (multi-entity GL), MongoDB (IC mappings) |
| **Guardrails** | Tolerance threshold for IC differences ($100), reconciliation before elimination, controller approval |
| **Error Handling** | Flag unresolved IC differences, use prior period approach if matching fails |
| **KPIs** | IC match rate >95%, elimination accuracy >99%, processing time <15min |
| **Multi-Agent** | Feeds Close Task Agent (AGT-040), Board Package Agent (AGT-025) |
| **Memory** | Medium-term (IC relationship patterns, recurring discrepancy sources) |
| **MCP Tools** | MCP Consolidation Engine, MCP IC Reconciliation Server |

### AGT-047 — GL Search & Exploration Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → GL Explorer |
| **Agent Type** | Cognitive/Conversational Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Enables natural language search and exploration of the general ledger (e.g., 'Show all marketing expenses over $10K in Q4') |
| **Trigger** | User query (real-time) |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (query planning + execution) |
| **Tools** | NL-to-GL query translator, faceted search, drill-down navigator, result formatter, export tool |
| **Input** | User query, GL schema, chart of accounts hierarchy, period data |
| **Output** | Formatted GL results with drill-down options, summary statistics, export capability |
| **Databases** | PostgreSQL (GL), pgvector (semantic search), Redis (query cache) |
| **Guardrails** | Permission-based data scoping, query complexity limits, PII redaction |
| **Error Handling** | Suggest query reformulation for zero results, show closest matches |
| **KPIs** | Query accuracy >90%, latency <2s, user satisfaction >4.3/5 |
| **Multi-Agent** | None (standalone conversational agent) |
| **Memory** | Short-term (query refinement context) |
| **MCP Tools** | MCP GL Data Server, MCP Semantic Search Engine |

### AGT-048 — Reconciliation Exception Prioritizer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → Reconciliation |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Prioritizes unresolved reconciliation exceptions by impact, age, complexity, and close deadline proximity to optimize accountant workflow |
| **Trigger** | On new exception + Daily reranking |
| **LLM Model** | Claude Haiku + scoring model |
| **Orchestrator** | n8n |
| **Tools** | Impact estimator, complexity scorer, age calculator, deadline proximity tracker, assignment optimizer |
| **Input** | Open exceptions, account risk ratings, close deadline, accountant workload, historical resolution times |
| **Output** | Prioritized exception queue per accountant, estimated resolution time, suggested approach |
| **Databases** | PostgreSQL (recon exceptions), Redis (priority queue) |
| **Guardrails** | No deprioritization of >$50K items, close-critical items always top priority |
| **Error Handling** | Default to FIFO if scoring unavailable, alert manager if queue exceeds capacity |
| **KPIs** | Priority accuracy >88%, close-critical resolution rate >98%, workload balance across team |
| **Multi-Agent** | Feeds Auto-Reconciliation Agent (AGT-044) exception handling |
| **Memory** | Short-term (current exception queue state) |
| **MCP Tools** | MCP Reconciliation Engine, MCP Workload Manager |

### AGT-049 — SOX Compliance Evidence Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → Close Checklist |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Automatically collects, organizes, and links SOX control evidence to close tasks, identifies gaps, and generates compliance documentation |
| **Trigger** | On task completion (evidence collection) + Close period end (gap analysis) |
| **LLM Model** | Claude Sonnet |
| **Orchestrator** | LangGraph |
| **Tools** | Evidence collector, control mapper, gap analyzer, documentation generator, reviewer notifier |
| **Input** | Close tasks, SOX control matrix, evidence requirements, collected evidence inventory |
| **Output** | Evidence linkage report, gap analysis, compliance documentation, reviewer assignments |
| **Databases** | PostgreSQL (controls), MongoDB (evidence), S3 (evidence files) |
| **Guardrails** | Mandatory evidence for all key controls, no gap bypass without controller approval |
| **Error Handling** | Flag missing evidence immediately, suggest alternative evidence sources |
| **KPIs** | Evidence coverage >98%, gap detection within 24hrs, audit preparation time reduction >50% |
| **Multi-Agent** | Works with Close Task Agent (AGT-040), feeds Audit Agent |
| **Memory** | Long-term (control-to-evidence mapping patterns, auditor feedback) |
| **MCP Tools** | MCP Evidence Vault, MCP Compliance Framework Server |

### AGT-050 — Financial Statement Footnote Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Accounting → GL Explorer |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Auto-generates financial statement footnotes and disclosures based on GL data changes, new transactions, and accounting policy requirements |
| **Trigger** | Close period end + On significant transaction |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph |
| **Tools** | Disclosure rule engine, data change detector, narrative generator, prior period comparator, compliance checker |
| **Input** | GL data, accounting policies, disclosure requirements (GAAP/IFRS), prior period footnotes |
| **Output** | Draft footnotes and disclosures, change summary vs prior period, compliance checklist |
| **Databases** | PostgreSQL (GL), pgvector (prior footnotes for style matching), MongoDB (disclosure rules) |
| **Guardrails** | GAAP/IFRS compliance validation, consistency with prior period language, controller review required |
| **Error Handling** | Flag areas requiring judgment, provide template with data gaps highlighted |
| **KPIs** | Disclosure coverage >95%, controller edit rate <25%, generation time <30min |
| **Multi-Agent** | Queries GL Health Agent (AGT-045), Variance Agent (AGT-015) for supporting data |
| **Memory** | Long-term (evolving disclosure language, auditor feedback, policy changes) |
| **MCP Tools** | MCP Narrative Engine, MCP Compliance Framework Server |

---

*Batch 1 of 4 — Agents 1-50 | Agentic Finance Director App | Feb 6, 2026*
