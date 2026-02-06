# 🤖 Agentic Finance Director — Agent Inventory (Batch 4: AGT-151 → AGT-200)

> **50 Agents | Security & Compliance, ML Ops, Domain Expert, Specialized Finance, Integration, Platform Intelligence**

> Part 4 of 4 batches (200 total agents) — FINAL BATCH

---

## Agent Type Distribution (Batch 4)

| Agent Type | Count |
|-----------|-------|
| Goal-Based Agent | 15 |
| Agentic AI (Goal-Based) | 9 |
| Model-Based Reflex Agent | 8 |
| Learning Agent | 7 |
| Agentic AI (Cognitive/Conversational) | 4 |
| Utility-Based Agent | 3 |
| Hierarchical Agent | 2 |
| Cognitive/Conversational Agent | 1 |
| Agentic AI (Hierarchical Multi-Agent) | 1 |

## Module Coverage (Batch 4)

| Module | Agents | Range |
|--------|--------|-------|
| Security & Compliance | 12 | AGT-151 → AGT-162 |
| ML Ops | 10 | AGT-163 → AGT-172 |
| Domain Expert | 12 | AGT-173 → AGT-184 |
| Specialized Finance | 10 | AGT-185 → AGT-194 |
| Integration | 4 | AGT-195 → AGT-198 |
| Platform Intelligence | 2 | AGT-199 → AGT-200 |

---

## 🔹 Security & Compliance

### AGT-151 — Zero-Trust Access Validator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Admin |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Validates every data access request against zero-trust principles: verifying user identity, device posture, location context, and behavioral risk score before granting access |
| **Trigger** | On every data access request (inline middleware) |
| **LLM Model** | Rule engine + Claude Haiku (risk scoring) |
| **Orchestrator** | API Gateway middleware |
| **Tools** | Identity verifier, device posture checker, location validator, behavioral risk scorer, session manager |
| **Input** | Access request, user identity token, device fingerprint, IP geolocation, behavioral baseline |
| **Output** | Access decision (allow/deny/step-up), risk score, session constraints, audit log entry |
| **Databases** | Redis (session state, risk cache), PostgreSQL (policies), MongoDB (device registry) |
| **Guardrails** | Default deny, step-up authentication for high-risk access, no silent failures |
| **Error Handling** | Deny access if validator unavailable (fail-closed), alert security team, allow cached decisions for 5min |
| **KPIs** | Access decision latency <50ms, false denial <0.1%, threat detection >95% |
| **Multi-Agent** | Gates ALL agent data access, feeds Audit Log Agent (AGT-095) |
| **Memory** | Short-term (session risk), Long-term (user behavioral baselines) |
| **MCP Tools** | MCP Identity Provider, MCP Device Trust Engine |

### AGT-152 — Encryption Key Rotation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Admin |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Manages automated encryption key rotation for all data-at-rest and data-in-transit keys, ensuring compliance with key lifecycle policies and zero-downtime rotation |
| **Trigger** | Scheduled rotation (per policy) + On key compromise detection |
| **LLM Model** | Rule engine |
| **Orchestrator** | n8n (rotation pipeline) |
| **Tools** | Key generator, rotation executor, re-encryption manager, compliance checker, rollback capability |
| **Input** | Key inventory, rotation policies, encryption schemas, compliance requirements |
| **Output** | Rotation status dashboard, compliance report, re-encryption progress, rollback availability |
| **Databases** | PostgreSQL (key metadata), Redis (active keys), MongoDB (rotation logs) |
| **Guardrails** | Zero-downtime rotation, dual-key overlap period, FIPS 140-2 compliance, HSM-backed keys |
| **Error Handling** | Maintain old key until new key verified, emergency key recovery, alert on rotation failure |
| **KPIs** | Rotation compliance 100%, zero-downtime 100%, key age compliance >99% |
| **Multi-Agent** | Infrastructure security for ALL agents handling encrypted data |
| **Memory** | Long-term (rotation schedules, compliance history) |
| **MCP Tools** | MCP Key Management Server, MCP HSM Bridge |

### AGT-153 — Threat Intelligence Feed Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Risk Intelligence |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Ingests and correlates external threat intelligence feeds (CVEs, IOCs, TTPs) with internal systems to identify exposure and recommend mitigations |
| **Trigger** | Continuous (feed ingestion) + On new CVE/advisory |
| **LLM Model** | Claude Sonnet + threat classification model |
| **Orchestrator** | n8n (feed ingestion) + LangGraph (analysis) |
| **Tools** | Feed parser, CVE matcher, IOC scanner, exposure analyzer, mitigation recommender |
| **Input** | Threat feeds (STIX/TAXII), CVE databases, internal asset inventory, system configurations |
| **Output** | Threat briefing, exposure assessment, prioritized vulnerability list, mitigation recommendations |
| **Databases** | PostgreSQL (asset inventory), MongoDB (threat data), pgvector (threat intelligence embeddings) |
| **Guardrails** | Verified sources only, no action on unconfirmed threats, severity calibration |
| **Error Handling** | Continue with available feeds if some unavailable, flag reduced coverage |
| **KPIs** | Threat detection lead time >24hrs, CVE assessment coverage >95%, false positive <10% |
| **Multi-Agent** | Feeds Emerging Risk (AGT-072), Infrastructure Agent (AGT-083), Alert Triage (AGT-069) |
| **Memory** | Long-term (threat landscape evolution, organizational exposure history) |
| **MCP Tools** | MCP Threat Feed Server, MCP Vulnerability Scanner |

### AGT-154 — Session Anomaly Detection Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Admin |
| **Agent Type** | Learning Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Detects anomalous user session behavior in real-time: impossible travel, unusual hours, abnormal data access volumes, concurrent sessions from different locations |
| **Trigger** | Continuous (per-session monitoring) |
| **LLM Model** | Isolation Forest + Claude Haiku |
| **Orchestrator** | Redis Streams + n8n |
| **Tools** | Behavioral analyzer, impossible travel detector, volume monitor, concurrency checker, alert generator |
| **Input** | Session events, user behavioral baselines, geolocation data, access volumes |
| **Output** | Session risk score, anomaly alerts, forced re-authentication triggers, investigation recommendations |
| **Databases** | Redis (session data), PostgreSQL (baselines), MongoDB (anomaly logs) |
| **Guardrails** | Confidence threshold 0.85, no session termination without step-up auth option |
| **Error Handling** | Conservative alerting (alert but don't block) for borderline cases, escalate patterns |
| **KPIs** | Anomaly detection >90%, false positive <5%, detection latency <10s |
| **Multi-Agent** | Feeds Zero-Trust Agent (AGT-151), Audit Log Agent (AGT-095) |
| **Memory** | Long-term (per-user behavioral evolution, seasonal access patterns) |
| **MCP Tools** | MCP Session Monitor, MCP Behavioral Analytics |

### AGT-155 — SOX Control Testing Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Accounting |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Performs automated SOX control testing by executing test scripts, sampling transactions, validating control evidence, and generating testing workpapers |
| **Trigger** | Quarterly testing cycle + Continuous monitoring for key controls |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (testing workflow) |
| **Tools** | Test executor, sample selector, evidence validator, workpaper generator, exception tracker |
| **Input** | Control matrix, test scripts, transaction populations, prior year findings, risk assessments |
| **Output** | Testing workpapers, control effectiveness ratings, exceptions, remediation requirements |
| **Databases** | PostgreSQL (control data), MongoDB (workpapers), S3 (evidence) |
| **Guardrails** | Statistical sampling requirements, independent testing principle, complete documentation |
| **Error Handling** | Flag untestable controls, manual testing fallback, incomplete evidence tracking |
| **KPIs** | Testing coverage 100% of key controls, workpaper quality >4/5 (auditor rating), testing time reduction >50% |
| **Multi-Agent** | Uses SOX Evidence Agent (AGT-049), Compliance Report (AGT-099), Audit Log (AGT-095) |
| **Memory** | Long-term (testing patterns, common exceptions, auditor feedback) |
| **MCP Tools** | MCP SOX Testing Engine, MCP Evidence Vault, MCP Sampling Engine |

### AGT-156 — Data Classification Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Admin |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Automatically classifies data across all platform databases by sensitivity level (public, internal, confidential, restricted) using content analysis and metadata patterns |
| **Trigger** | On new data ingestion + Monthly classification review |
| **LLM Model** | Claude Haiku + NLP classifier |
| **Orchestrator** | n8n (classification pipeline) |
| **Tools** | Content analyzer, pattern matcher, sensitivity scorer, metadata tagger, classification propagator |
| **Input** | Database content samples, metadata, existing classifications, data governance policies |
| **Output** | Data classification labels per table/column, classification report, policy compliance status |
| **Databases** | PostgreSQL (classifications), MongoDB (policies), Redis (classification cache) |
| **Guardrails** | Conservative classification (upward), human review for boundary cases, no declassification without approval |
| **Error Handling** | Default to highest sensitivity if uncertain, flag for manual review |
| **KPIs** | Classification accuracy >92%, coverage >98% of data assets, reclassification rate <5% |
| **Multi-Agent** | Feeds PII Agent (AGT-111), Data Masking (AGT-134), Access Validator (AGT-151) |
| **Memory** | Long-term (classification patterns per data domain, policy evolution) |
| **MCP Tools** | MCP Data Classification Engine, MCP Governance Framework |

### AGT-157 — Segregation of Duties Enforcer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Admin |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | High |
| **Purpose** | Enforces segregation of duties (SoD) policies in real-time, blocking conflicting actions and monitoring for SoD violations across all financial workflows |
| **Trigger** | On role assignment + On transaction execution + Weekly SoD audit |
| **LLM Model** | Rule engine + Claude Haiku (exception analysis) |
| **Orchestrator** | API middleware + n8n (audit) |
| **Tools** | SoD rule engine, conflict detector, exception manager, violation logger, remediation recommender |
| **Input** | User roles, transaction details, SoD matrix, exception approvals, historical violations |
| **Output** | SoD enforcement decisions (block/allow/exception), violation alerts, audit report |
| **Databases** | PostgreSQL (roles, SoD matrix), Redis (enforcement cache), MongoDB (violation logs) |
| **Guardrails** | Hard blocks for critical SoD violations, exception approval required from compliance officer |
| **Error Handling** | Fail-closed (block action) if SoD engine unavailable, emergency override with dual approval |
| **KPIs** | SoD violation prevention 100%, exception processing <5min, audit coverage 100% |
| **Multi-Agent** | Enforces across ALL financial workflow agents, feeds RBAC Optimizer (AGT-096) |
| **Memory** | Long-term (violation patterns, exception history, role conflict map) |
| **MCP Tools** | MCP SoD Engine, MCP RBAC Enforcer |

### AGT-158 — Penetration Test Simulator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Admin |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Performs automated security testing against platform APIs and agents by simulating common attack vectors (injection, privilege escalation, data exfiltration) in sandbox |
| **Trigger** | Weekly automated scan + On new deployment + On-demand |
| **LLM Model** | Claude Sonnet (attack planning) |
| **Orchestrator** | LangGraph (attack simulation chain) |
| **Tools** | API fuzzer, injection tester, privilege escalation prober, data exfiltration simulator, report generator |
| **Input** | API endpoints, agent configs, authentication mechanisms, known vulnerability patterns |
| **Output** | Security assessment report, vulnerabilities found, severity ratings, remediation recommendations |
| **Databases** | PostgreSQL (findings), MongoDB (attack patterns), Redis (scan state) |
| **Guardrails** | Sandbox-only testing, no production impact, rate-limited attacks, authorized scanning only |
| **Error Handling** | Abort on unexpected system impact, report partial findings, alert security team |
| **KPIs** | Vulnerability detection >85%, zero production impact, scan completion <2hrs |
| **Multi-Agent** | Tests ALL platform agents and APIs, feeds Prompt Security (AGT-061) |
| **Memory** | Long-term (evolving attack patterns, vulnerability recurrence) |
| **MCP Tools** | MCP Security Scanner, MCP Sandbox Manager |

### AGT-159 — GDPR Data Subject Request Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Admin |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Automates GDPR/CCPA data subject requests (access, rectification, erasure, portability) by scanning all data stores and executing approved actions within regulatory timelines |
| **Trigger** | On data subject request submission |
| **LLM Model** | Claude Haiku + rule engine |
| **Orchestrator** | n8n (request pipeline) + LangGraph (data discovery) |
| **Tools** | Data discovery scanner, cross-system searcher, erasure executor, export packager, compliance tracker |
| **Input** | Data subject request, identity verification, data inventory, retention policies |
| **Output** | Request fulfillment report, exported data package (portability), erasure confirmation, compliance timeline |
| **Databases** | PostgreSQL (all), MongoDB (all), pgvector (all), S3 (all), Redis (request state) |
| **Guardrails** | Identity verification mandatory, legal review for complex requests, retention override rules |
| **Error Handling** | Escalate to DPO for blocked data stores, partial fulfillment with gap documentation |
| **KPIs** | Request fulfillment within 30 days 100%, data discovery coverage >99%, accuracy 100% |
| **Multi-Agent** | Uses Consent Manager (AGT-117), PII Agent (AGT-111), Data Lineage (AGT-113) |
| **Memory** | Long-term (request patterns, data location mapping) |
| **MCP Tools** | MCP Privacy Engine, MCP Data Discovery Scanner |

### AGT-160 — Security Incident Forensics Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Admin |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Performs automated digital forensics on security incidents: timeline reconstruction, evidence preservation, chain-of-custody management, and forensic report generation |
| **Trigger** | On confirmed security incident (P1/P2) |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (forensic investigation chain) |
| **Tools** | Timeline reconstructor, evidence collector, log correlator, chain-of-custody tracker, forensic reporter |
| **Input** | Incident alert, system logs, network logs, audit trail, user activity, database query logs |
| **Output** | Forensic report with timeline, evidence inventory, chain of custody, root cause, impact assessment |
| **Databases** | PostgreSQL (incidents), MongoDB (evidence), S3 (forensic images) |
| **Guardrails** | Evidence preservation (write-once), chain of custody documentation, legal hold compliance |
| **Error Handling** | Preserve whatever evidence available, flag inaccessible logs, parallel manual investigation |
| **KPIs** | Evidence preservation 100%, timeline accuracy >95%, report delivery <24hrs for P1 |
| **Multi-Agent** | Uses Audit Log (AGT-095), Session Anomaly (AGT-154), Infrastructure (AGT-083) |
| **Memory** | Long-term (forensic playbooks, evidence requirements per incident type) |
| **MCP Tools** | MCP Forensics Engine, MCP Evidence Vault, MCP Log Aggregator |

### AGT-161 — Vendor Security Assessment Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Admin |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Automates third-party vendor security assessments by analyzing SOC2 reports, security questionnaire responses, and public vulnerability data for risk scoring |
| **Trigger** | On new vendor onboarding + Annual reassessment + On vendor breach notification |
| **LLM Model** | Claude Opus + NLP |
| **Orchestrator** | LangGraph (assessment chain) |
| **Tools** | SOC2 report analyzer, questionnaire scorer, CVE scanner, risk scorer, recommendation generator |
| **Input** | Vendor SOC2/ISO reports, security questionnaires, CVE databases, contract terms, data sharing scope |
| **Output** | Vendor risk score, security assessment report, gap analysis, risk acceptance recommendation |
| **Databases** | PostgreSQL (vendor registry), MongoDB (assessments), pgvector (report embeddings) |
| **Guardrails** | Minimum security requirements enforced, no approval for critical-risk vendors without CISO sign-off |
| **Error Handling** | Flag incomplete vendor data, use industry baseline for missing information |
| **KPIs** | Assessment turnaround <5 days (vs 3 weeks manual), risk scoring accuracy >85%, coverage 100% |
| **Multi-Agent** | Feeds Emerging Risk (AGT-072), Composite Risk Scorer (AGT-071) |
| **Memory** | Long-term (vendor risk history, industry benchmark evolution) |
| **MCP Tools** | MCP Vendor Risk Engine, MCP Security Assessment Framework |

### AGT-162 — Compliance Calendar Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Security & Compliance → Admin |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Manages regulatory compliance deadlines across all jurisdictions: SEC filings, tax deadlines, audit schedules, certification renewals with automated reminders and preparation triggers |
| **Trigger** | Daily deadline check + On regulatory change |
| **LLM Model** | Claude Haiku + rule engine |
| **Orchestrator** | n8n (calendar management) |
| **Tools** | Deadline tracker, reminder generator, preparation trigger, dependency mapper, filing status tracker |
| **Input** | Regulatory calendars, jurisdiction rules, filing history, preparation workflows, team assignments |
| **Output** | Compliance calendar dashboard, upcoming deadline alerts, preparation kickoff triggers, filing status |
| **Databases** | PostgreSQL (deadlines), MongoDB (regulatory rules), Redis (reminder queue) |
| **Guardrails** | Minimum 30-day advance warning, escalation chain for approaching deadlines, no silent misses |
| **Error Handling** | Redundant reminders across channels, escalate overdue items daily, regulatory change monitoring |
| **KPIs** | Zero missed deadlines, preparation lead time >30 days, filing on-time rate 100% |
| **Multi-Agent** | Triggers Board Reporting (AGT-142), Compliance Report (AGT-099), SOX Testing (AGT-155) |
| **Memory** | Long-term (regulatory calendar patterns, historical preparation timelines) |
| **MCP Tools** | MCP Compliance Calendar, MCP Regulatory Feed Server |

## 🔹 ML Ops

### AGT-163 — Model Registry Agent

| Field | Value |
|-------|-------|
| **Module / Page** | ML Ops → Agent Studio |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Manages the complete ML model lifecycle registry: versioning, staging, promotion, retirement, lineage tracking, and artifact storage for all platform ML models |
| **Trigger** | On model registration + On promotion request + On retirement trigger |
| **LLM Model** | Rule engine + Claude Haiku |
| **Orchestrator** | n8n (lifecycle pipeline) |
| **Tools** | Model versioner, artifact storer, lineage tracker, promotion manager, retirement scheduler |
| **Input** | Model artifacts, metadata, performance metrics, lineage info, deployment targets |
| **Output** | Model registry dashboard, version history, lineage graph, deployment status |
| **Databases** | PostgreSQL (registry), MongoDB (artifacts), S3 (model files) |
| **Guardrails** | Mandatory metadata, performance baseline required for promotion, rollback capability |
| **Error Handling** | Block promotion on missing metrics, archive rather than delete retired models |
| **KPIs** | Model traceability 100%, promotion compliance 100%, registry freshness <1hr |
| **Multi-Agent** | Serves ALL ML-using agents, feeds Benchmarker (AGT-053) |
| **Memory** | Long-term (model genealogy, performance evolution) |
| **MCP Tools** | MCP Model Registry, MCP Artifact Store |

### AGT-164 — Feature Store Agent

| Field | Value |
|-------|-------|
| **Module / Page** | ML Ops → Agent Studio |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages a centralized feature store for all ML models: feature computation, versioning, serving (online/offline), consistency between training and inference |
| **Trigger** | On feature registration + On serving request + Scheduled feature refresh |
| **LLM Model** | Rule engine + Claude Haiku |
| **Orchestrator** | n8n (feature pipeline) |
| **Tools** | Feature computer, version manager, online server, offline batch exporter, consistency checker |
| **Input** | Raw data sources, feature definitions, computation logic, freshness requirements |
| **Output** | Computed features (online + offline), feature catalog, freshness dashboard, consistency report |
| **Databases** | Redis (online features), PostgreSQL (feature metadata), S3 (offline features) |
| **Guardrails** | Training-serving consistency validation, feature freshness guarantees, schema versioning |
| **Error Handling** | Serve stale features with freshness warning, fallback to default values, alert on computation failure |
| **KPIs** | Serving latency <10ms (online), training-serving skew <1%, feature freshness >99% |
| **Multi-Agent** | Serves ALL ML-dependent agents: forecasting, classification, anomaly detection agents |
| **Memory** | Long-term (feature importance tracking, usage patterns) |
| **MCP Tools** | MCP Feature Store, MCP Feature Server |

### AGT-165 — Model Training Pipeline Agent

| Field | Value |
|-------|-------|
| **Module / Page** | ML Ops → Agent Studio |
| **Agent Type** | Hierarchical Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Orchestrates end-to-end ML model training pipelines: data preparation, feature engineering, model training, hyperparameter tuning, evaluation, and artifact packaging |
| **Trigger** | Scheduled retraining + On data drift detection + On-demand |
| **LLM Model** | Training framework (scikit-learn, XGBoost, PyTorch) |
| **Orchestrator** | n8n (training DAG) |
| **Tools** | Data preparer, feature engineer, trainer, hyperparameter tuner, evaluator, artifact packager |
| **Input** | Training data, feature definitions, model configs, hyperparameter search space, evaluation criteria |
| **Output** | Trained model artifact, evaluation report, hyperparameter selection, training logs |
| **Databases** | PostgreSQL (training metadata), MongoDB (experiments), S3 (artifacts, data) |
| **Guardrails** | Data validation before training, overfitting checks, minimum evaluation thresholds |
| **Error Handling** | Retry failed training runs, alert on resource exhaustion, archive failed experiments |
| **KPIs** | Training success rate >95%, model quality improvement per cycle, training time optimization |
| **Multi-Agent** | Uses Feature Store (AGT-164), outputs to Model Registry (AGT-163) |
| **Memory** | Long-term (training history, optimal hyperparameters per model type) |
| **MCP Tools** | MCP Training Pipeline, MCP Experiment Tracker |

### AGT-166 — Model Drift Detection Agent

| Field | Value |
|-------|-------|
| **Module / Page** | ML Ops → Agent Studio |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Monitors all deployed ML models for data drift, concept drift, and prediction drift using statistical tests and triggers retraining when degradation is detected |
| **Trigger** | Continuous (prediction monitoring) + Daily drift analysis |
| **LLM Model** | Statistical tests + Claude Haiku (drift explanation) |
| **Orchestrator** | n8n (monitoring loop) |
| **Tools** | Distribution comparator, PSI calculator, KS test runner, concept drift detector, alert generator |
| **Input** | Incoming prediction data, training data distributions, model predictions, ground truth (delayed) |
| **Output** | Drift scores per model, drift type classification, retraining recommendations, drift explanations |
| **Databases** | Prometheus (drift metrics), PostgreSQL (drift history), MongoDB (distributions) |
| **Guardrails** | Statistical significance thresholds, minimum observation window, no premature retraining |
| **Error Handling** | Conservative (flag but don't retrain) if ground truth unavailable, partial monitoring if some features missing |
| **KPIs** | Drift detection >90%, false alarm <10%, detection lead time >7 days before impact |
| **Multi-Agent** | Triggers Training Pipeline (AGT-165), alerts Model Registry (AGT-163) |
| **Memory** | Long-term (drift patterns, seasonal data shifts) |
| **MCP Tools** | MCP Drift Monitor, MCP Distribution Analyzer |

### AGT-167 — Model Explainability Agent

| Field | Value |
|-------|-------|
| **Module / Page** | ML Ops → Agent Studio |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Generates human-interpretable explanations for ML model predictions using SHAP, LIME, and attention analysis, enabling auditability and trust in AI decisions |
| **Trigger** | On prediction request (for explainable models) + On-demand investigation |
| **LLM Model** | SHAP + LIME + Claude Sonnet (narrative) |
| **Orchestrator** | LangGraph (explanation chain) |
| **Tools** | SHAP explainer, LIME explainer, feature importance ranker, counterfactual generator, narrative writer |
| **Input** | Model prediction, input features, model artifact, explanation request type |
| **Output** | Feature importance ranking, SHAP waterfall, counterfactual examples, plain-English explanation |
| **Databases** | PostgreSQL (explanations), MongoDB (explanation templates), Redis (explanation cache) |
| **Guardrails** | Explanation consistency with prediction, no misleading simplifications, confidence disclosure |
| **Error Handling** | Provide feature importance even if full SHAP unavailable, flag approximate explanations |
| **KPIs** | Explanation generation <5s, user comprehension >85%, explanation consistency >95% |
| **Multi-Agent** | Post-processor for ALL ML prediction agents (fraud, forecasting, anomaly) |
| **Memory** | Long-term (effective explanation patterns per model type, user comprehension data) |
| **MCP Tools** | MCP Explainability Engine, MCP Narrative Generator |

### AGT-168 — A/B Testing Framework Agent

| Field | Value |
|-------|-------|
| **Module / Page** | ML Ops → Agent Studio |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages A/B tests for model versions and agent configurations: traffic splitting, statistical analysis, early stopping, and automated winner selection |
| **Trigger** | On A/B test creation + Continuous monitoring during test |
| **LLM Model** | Bayesian statistics + Claude Haiku |
| **Orchestrator** | n8n (test management) |
| **Tools** | Traffic splitter, metric collector, Bayesian analyzer, early stopper, winner selector, report generator |
| **Input** | Test config, variant definitions, success metrics, significance requirements, traffic allocation |
| **Output** | Test results with statistical significance, winner recommendation, confidence intervals, report |
| **Databases** | PostgreSQL (test configs), MongoDB (test results), Redis (traffic routing) |
| **Guardrails** | Minimum sample size enforcement, maximum test duration, no peeking (sequential testing) |
| **Error Handling** | Abort test on degradation >threshold, partial results on early termination |
| **KPIs** | Statistical power >80%, test validity >95%, average test duration optimization |
| **Multi-Agent** | Tests for Prompt Optimizer (AGT-055), Model Registry (AGT-163), Agent Version Manager (AGT-062) |
| **Memory** | Long-term (test result history, optimal sample sizes per metric) |
| **MCP Tools** | MCP A/B Test Engine, MCP Statistical Analyzer |

### AGT-169 — Model Fairness & Bias Agent

| Field | Value |
|-------|-------|
| **Module / Page** | ML Ops → Agent Studio |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Evaluates ML models for fairness and bias across protected attributes (demographics, geography, company size) and recommends debiasing strategies |
| **Trigger** | Pre-deployment evaluation + Monthly bias audit |
| **LLM Model** | Fairness metrics + Claude Sonnet (report) |
| **Orchestrator** | LangGraph (bias evaluation chain) |
| **Tools** | Demographic parity checker, equalized odds tester, disparate impact analyzer, debiasing recommender |
| **Input** | Model predictions, protected attributes, fairness criteria, regulatory requirements |
| **Output** | Fairness report with bias metrics, disparate impact ratios, debiasing recommendations, compliance status |
| **Databases** | PostgreSQL (fairness evaluations), MongoDB (bias reports) |
| **Guardrails** | Block deployment if fairness thresholds violated, mandatory bias review for customer-facing models |
| **Error Handling** | Flag insufficient demographic data, provide partial analysis with caveats |
| **KPIs** | Fairness evaluation coverage 100% of ML models, bias detection accuracy >90%, remediation success >80% |
| **Multi-Agent** | Gates Model Registry (AGT-163) promotion, feeds Compliance Report (AGT-099) |
| **Memory** | Long-term (bias patterns, effective debiasing strategies) |
| **MCP Tools** | MCP Fairness Engine, MCP Bias Analyzer |

### AGT-170 — GPU/Compute Resource Manager Agent

| Field | Value |
|-------|-------|
| **Module / Page** | ML Ops → Agent Studio |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Optimizes allocation of GPU and compute resources across training, inference, and batch processing workloads with dynamic scaling and cost optimization |
| **Trigger** | Continuous resource monitoring + On workload submission |
| **LLM Model** | Rule engine + Claude Haiku (optimization) |
| **Orchestrator** | n8n + Kubernetes scheduler |
| **Tools** | Resource allocator, workload scheduler, auto-scaler, cost optimizer, queue manager |
| **Input** | Workload queue, resource availability, cost budgets, priority levels, SLA requirements |
| **Output** | Resource allocation decisions, scaling actions, cost reports, queue status |
| **Databases** | Prometheus (resource metrics), PostgreSQL (allocations), Redis (queue state) |
| **Guardrails** | Priority-based allocation, cost ceiling enforcement, minimum resources for production inference |
| **Error Handling** | Queue overflow management, preemption of low-priority workloads, alert on resource exhaustion |
| **KPIs** | Resource utilization >75%, inference SLA compliance >99%, cost per prediction optimization >20% |
| **Multi-Agent** | Infrastructure for ALL ML training and inference agents |
| **Memory** | Long-term (workload patterns, optimal resource configurations) |
| **MCP Tools** | MCP Resource Manager, MCP Kubernetes Bridge |

### AGT-171 — Experiment Tracking Agent

| Field | Value |
|-------|-------|
| **Module / Page** | ML Ops → Agent Studio |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Tracks all ML experiments with full reproducibility: parameters, code versions, data snapshots, metrics, and artifacts with comparison and visualization tools |
| **Trigger** | On experiment start + On experiment completion |
| **LLM Model** | Rule engine |
| **Orchestrator** | n8n (tracking pipeline) |
| **Tools** | Parameter logger, metric recorder, artifact saver, experiment comparator, visualization builder |
| **Input** | Experiment parameters, code commit, data snapshot reference, metrics, artifacts |
| **Output** | Experiment log, comparison dashboard, best experiment recommendation, reproducibility package |
| **Databases** | PostgreSQL (experiments), MongoDB (parameters, metrics), S3 (artifacts, snapshots) |
| **Guardrails** | Mandatory parameter logging, code version requirement, data provenance tracking |
| **Error Handling** | Partial logging if some metadata unavailable, flag non-reproducible experiments |
| **KPIs** | Experiment logging completeness 100%, reproducibility rate >95%, comparison accuracy 100% |
| **Multi-Agent** | Feeds Training Pipeline (AGT-165), Model Registry (AGT-163) |
| **Memory** | Long-term (experiment history, parameter-performance correlations) |
| **MCP Tools** | MCP Experiment Tracker, MCP Artifact Store |

### AGT-172 — Model Serving Gateway Agent

| Field | Value |
|-------|-------|
| **Module / Page** | ML Ops → Agent Studio |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Manages model serving infrastructure: load balancing across model instances, canary deployments, request batching, caching, and graceful model swaps |
| **Trigger** | On prediction request + On model deployment |
| **LLM Model** | None (serving infrastructure) |
| **Orchestrator** | API Gateway + Redis |
| **Tools** | Request router, batch optimizer, response cacher, canary manager, health checker, latency monitor |
| **Input** | Prediction requests, model endpoints, deployment configs, health status |
| **Output** | Predictions with latency guarantees, serving metrics, deployment status |
| **Databases** | Redis (prediction cache, routing), Prometheus (serving metrics), PostgreSQL (deployment configs) |
| **Guardrails** | Latency SLA enforcement, graceful degradation, zero-downtime deployment |
| **Error Handling** | Fallback to previous model version, request queueing during deployment, circuit breaker |
| **KPIs** | P99 latency <200ms, availability >99.99%, zero-downtime deployments 100% |
| **Multi-Agent** | Serves ALL ML inference requests from platform agents |
| **Memory** | Short-term (request patterns for batching optimization) |
| **MCP Tools** | MCP Model Server, MCP Serving Gateway |

## 🔹 Domain Expert

### AGT-173 — GAAP/IFRS Standards Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → Accounting |
| **Agent Type** | Agentic AI (Cognitive/Conversational) |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Expert agent on US GAAP and IFRS accounting standards, providing guidance on treatment of specific transactions, policy elections, and standard interpretations via RAG |
| **Trigger** | User query about accounting standards + On new transaction type |
| **LLM Model** | Claude Opus + RAG (standards corpus) |
| **Orchestrator** | LangGraph (retrieval + reasoning) |
| **Tools** | Standards retriever, ASC/IFRS searcher, treatment advisor, example finder, comparison tool |
| **Input** | User query, transaction details, current accounting policies, applicable standards |
| **Output** | Standards guidance with citations, treatment options, implementation examples, comparison (GAAP vs IFRS) |
| **Databases** | pgvector (standards embeddings), PostgreSQL (policy database), MongoDB (examples) |
| **Guardrails** | Always cite specific ASC/IFRS paragraphs, no authoritative advice (suggest CPA review), version-aware |
| **Error Handling** | Flag ambiguous areas, suggest professional consultation, note pending standard changes |
| **KPIs** | Citation accuracy >98%, user satisfaction >4.5/5, standards coverage >95% |
| **Multi-Agent** | Supports JE Creator (AGT-043), Footnote Agent (AGT-050), Accrual Agent (AGT-041) |
| **Memory** | Long-term (frequently asked questions, organizational policy elections) |
| **MCP Tools** | MCP Standards Library, MCP Accounting Knowledge Base |

### AGT-174 — Tax Implications Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → FP&A |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | Low |
| **Purpose** | Analyzes tax implications of financial decisions, transactions, and scenarios across jurisdictions, providing preliminary tax impact estimates and planning considerations |
| **Trigger** | On-demand (user query) + On scenario with tax impact + Quarterly tax planning |
| **LLM Model** | Claude Opus + RAG (tax code) |
| **Orchestrator** | LangGraph (tax analysis chain) |
| **Tools** | Tax code searcher, jurisdiction mapper, impact calculator, planning suggester, withholding analyzer |
| **Input** | Transaction details, entity structure, jurisdictions involved, tax elections, scenario parameters |
| **Output** | Tax impact estimate, jurisdiction analysis, planning considerations, withholding requirements |
| **Databases** | pgvector (tax code embeddings), PostgreSQL (entity/tax data), MongoDB (tax rates) |
| **Guardrails** | Disclaimer: not tax advice, suggest CPA/tax attorney review, estimate ranges not precise figures |
| **Error Handling** | Flag unknown jurisdictions, conservative estimates, note assumptions |
| **KPIs** | Estimate accuracy ±10% for routine items, jurisdiction coverage >80%, response time <30s |
| **Multi-Agent** | Supports Scenario Agent (AGT-017), Working Capital (AGT-146), IC Elimination (AGT-046) |
| **Memory** | Long-term (tax code updates, organizational tax positions) |
| **MCP Tools** | MCP Tax Library, MCP Jurisdiction Database |

### AGT-175 — Treasury Regulation Expert Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → Treasury |
| **Agent Type** | Agentic AI (Cognitive/Conversational) |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Expert agent on treasury regulations (Dodd-Frank, Basel, EMIR, MiFID) providing guidance on compliance requirements, hedging rules, and reporting obligations |
| **Trigger** | User query about treasury regulations + On new instrument type |
| **LLM Model** | Claude Opus + RAG (regulatory corpus) |
| **Orchestrator** | LangGraph (retrieval + reasoning) |
| **Tools** | Regulation retriever, requirement mapper, compliance checker, reporting guide, instrument classifier |
| **Input** | User query, instrument details, jurisdiction, counterparty type |
| **Output** | Regulatory guidance with citations, compliance requirements, reporting obligations, practical examples |
| **Databases** | pgvector (regulatory embeddings), PostgreSQL (compliance data), MongoDB (regulations) |
| **Guardrails** | Cite specific regulations, no legal advice disclaimer, jurisdiction-aware, currency regulation aware |
| **Error Handling** | Flag regulatory uncertainty, suggest legal counsel, note pending regulatory changes |
| **KPIs** | Citation accuracy >95%, regulatory coverage >85%, user satisfaction >4.3/5 |
| **Multi-Agent** | Supports Hedging Agent (AGT-032), FX Agent (AGT-031), Compliance Monitor (AGT-080) |
| **Memory** | Long-term (regulatory landscape, organizational compliance positions) |
| **MCP Tools** | MCP Regulatory Library, MCP Treasury Compliance KB |

### AGT-176 — Industry Benchmark Expert Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → FP&A |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Maintains deep knowledge of industry-specific financial benchmarks, KPIs, and peer comparisons sourced from public filings, industry reports, and market data |
| **Trigger** | On benchmark query + Quarterly benchmark refresh + On peer filing |
| **LLM Model** | Claude Sonnet + RAG |
| **Orchestrator** | LangGraph (retrieval + analysis) |
| **Tools** | Benchmark database searcher, peer set builder, metric calculator, trend analyzer, insight generator |
| **Input** | Industry classification, company size, geography, requested metrics, peer set criteria |
| **Output** | Benchmark comparisons, percentile rankings, peer analysis, trend insights, industry outlook |
| **Databases** | pgvector (benchmark embeddings), PostgreSQL (benchmark data), MongoDB (peer filings) |
| **Guardrails** | Source attribution, data recency disclosure, sample size requirements, no proprietary data usage |
| **Error Handling** | Flag insufficient peer data, use broader industry if specific segment unavailable |
| **KPIs** | Benchmark freshness <90 days, peer set relevance >85%, metric coverage >50 KPIs |
| **Multi-Agent** | Feeds Benchmark Comparison (AGT-022), Board Package (AGT-025), Budget Optimization (AGT-016) |
| **Memory** | Long-term (benchmark evolution, industry cycle patterns) |
| **MCP Tools** | MCP Benchmark Database, MCP Financial Data Server |

### AGT-177 — Financial Instrument Valuation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → Treasury |
| **Agent Type** | Utility-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Performs fair value calculations for financial instruments (derivatives, bonds, options, swaps) using standard pricing models with market data inputs |
| **Trigger** | On valuation request + Daily mark-to-market + Monthly portfolio valuation |
| **LLM Model** | Pricing models (Black-Scholes, Monte Carlo) + Claude Sonnet |
| **Orchestrator** | LangGraph (valuation chain) |
| **Tools** | Pricing engine, yield curve builder, volatility surface constructor, Greeks calculator, valuation reporter |
| **Input** | Instrument terms, market data (rates, FX, volatility), valuation date, pricing model selection |
| **Output** | Fair value with methodology, Greeks, P&L attribution, sensitivity analysis, valuation adjustments |
| **Databases** | PostgreSQL (instruments, valuations), MongoDB (market data), Redis (market data cache) |
| **Guardrails** | Model validation requirements, independent price verification for material items, ASC 820 compliance |
| **Error Handling** | Use fallback models for exotic instruments, flag stale market data, manual override option |
| **KPIs** | Valuation accuracy within market bid-ask, processing time <10s per instrument, model coverage >95% |
| **Multi-Agent** | Feeds Investment Portfolio (AGT-033), FX Hedging (AGT-032), Financial Statements (AGT-050) |
| **Memory** | Long-term (model calibration history, market data quality patterns) |
| **MCP Tools** | MCP Pricing Engine, MCP Market Data Server, MCP Yield Curve Builder |

### AGT-178 — Contract Analysis Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → Cross-Cutting |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Analyzes financial contracts (leases, loans, vendor agreements) extracting key terms, obligations, financial impacts, and flagging risks or unusual clauses |
| **Trigger** | On contract upload + On-demand analysis + Renewal reminders |
| **LLM Model** | Claude Opus (vision + NLP) |
| **Orchestrator** | LangGraph (analysis chain) |
| **Tools** | Contract parser, term extractor, obligation mapper, risk flagger, financial impact calculator |
| **Input** | Contract document (PDF/DOCX), contract type, relevant standards, comparison templates |
| **Output** | Contract summary, key terms extraction, financial impact analysis, risk flags, obligation timeline |
| **Databases** | PostgreSQL (contracts), MongoDB (extracted terms), pgvector (contract embeddings), S3 (documents) |
| **Guardrails** | Not legal advice disclaimer, flag unusual terms, highlight deviation from templates |
| **Error Handling** | Partial extraction for poor quality documents, flag uncertain extractions |
| **KPIs** | Term extraction accuracy >90%, risk flag precision >85%, processing time <2min per contract |
| **Multi-Agent** | Feeds Accrual Agent (AGT-041), Lease accounting, Working Capital (AGT-146) |
| **Memory** | Long-term (contract templates, common risk patterns per vendor/type) |
| **MCP Tools** | MCP Contract Parser, MCP Legal Knowledge Base |

### AGT-179 — Internal Controls Advisor Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → Accounting |
| **Agent Type** | Agentic AI (Cognitive/Conversational) |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Expert agent on internal control design and evaluation, providing guidance on control frameworks (COSO), control testing strategies, and deficiency remediation |
| **Trigger** | User query + On new process/workflow + Control design review |
| **LLM Model** | Claude Opus + RAG (COSO/controls KB) |
| **Orchestrator** | LangGraph (advisory chain) |
| **Tools** | Control framework searcher, deficiency classifier, remediation advisor, control mapper, gap analyzer |
| **Input** | Process description, current controls, identified deficiencies, framework requirements |
| **Output** | Control design recommendations, deficiency remediation plans, framework mapping, gap analysis |
| **Databases** | pgvector (controls KB), PostgreSQL (control inventory), MongoDB (COSO framework) |
| **Guardrails** | Framework-based recommendations, professional judgment required disclaimer, risk-based prioritization |
| **Error Handling** | Flag complex control design for specialist review, provide framework guidance if specific answer unavailable |
| **KPIs** | Recommendation acceptance >80%, control gap identification >90%, user satisfaction >4.3/5 |
| **Multi-Agent** | Supports SOX Testing (AGT-155), SOX Evidence (AGT-049), Close Orchestrator (AGT-139) |
| **Memory** | Long-term (organizational control environment, common deficiency patterns) |
| **MCP Tools** | MCP Controls Library, MCP COSO Framework Engine |

### AGT-180 — Currency Risk Expert Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → Treasury |
| **Agent Type** | Agentic AI (Cognitive/Conversational) |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | Low |
| **Purpose** | Provides expert guidance on currency risk management strategies, hedging instrument selection, and hedge accounting requirements (ASC 815/IFRS 9) |
| **Trigger** | User query + On new FX exposure + On hedge accounting question |
| **LLM Model** | Claude Opus + RAG (FX/hedging KB) |
| **Orchestrator** | LangGraph (advisory chain) |
| **Tools** | Strategy advisor, instrument selector, hedge accounting guide, effectiveness tester, documentation helper |
| **Input** | FX exposure details, risk appetite, available instruments, accounting framework, current hedges |
| **Output** | Hedging strategy recommendation, instrument comparison, hedge accounting guidance, documentation templates |
| **Databases** | pgvector (hedging KB), PostgreSQL (exposure data), MongoDB (strategy library) |
| **Guardrails** | Not investment advice, risk disclosure, hedge accounting qualification requirements |
| **Error Handling** | Flag complex exposures for treasury specialist review, conservative recommendations |
| **KPIs** | Strategy recommendation quality >4/5, hedge accounting guidance accuracy >95% |
| **Multi-Agent** | Supports FX Hedging (AGT-032), FX Exposure (AGT-031), Financial Statements (AGT-050) |
| **Memory** | Long-term (hedging strategy effectiveness, market regime patterns) |
| **MCP Tools** | MCP FX Strategy Engine, MCP Hedge Accounting KB |

### AGT-181 — Cash Management Best Practices Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → Treasury |
| **Agent Type** | Cognitive/Conversational Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Expert agent on cash management best practices: bank relationship management, payment optimization, cash pooling strategies, and working capital techniques |
| **Trigger** | User query + On cash management review |
| **LLM Model** | Claude Sonnet + RAG |
| **Orchestrator** | LangGraph (advisory chain) |
| **Tools** | Best practice retriever, strategy recommender, benchmark comparer, implementation guide builder |
| **Input** | Current cash management setup, bank relationships, payment volumes, working capital metrics |
| **Output** | Best practice recommendations, implementation roadmap, benchmark comparison, ROI estimates |
| **Databases** | pgvector (cash management KB), PostgreSQL (treasury data) |
| **Guardrails** | Recommendations based on company size/complexity, implementation feasibility consideration |
| **Error Handling** | General best practices if specific data insufficient, flag areas needing treasury consultant |
| **KPIs** | Recommendation relevance >4/5, implementation success >70%, user satisfaction >4.3/5 |
| **Multi-Agent** | Supports Working Capital (AGT-146), Cash Forecast (AGT-028), Bank Fee (AGT-030) |
| **Memory** | Long-term (implementation outcomes, organizational cash management maturity) |
| **MCP Tools** | MCP Treasury KB, MCP Cash Management Library |

### AGT-182 — Audit Preparation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → Accounting |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Prepares for external audits by anticipating auditor requests, pre-assembling evidence packages, generating PBC (Prepared by Client) schedules, and tracking audit requests |
| **Trigger** | T-30 days before audit + On audit request receipt |
| **LLM Model** | Claude Opus |
| **Orchestrator** | LangGraph (preparation chain) |
| **Tools** | Request anticipator, PBC generator, evidence assembler, request tracker, readiness scorer |
| **Input** | Prior year audit requests, current year financials, control changes, new standards, risk areas |
| **Output** | Pre-assembled PBC package, anticipated request list, readiness score, gap identification |
| **Databases** | PostgreSQL (financial data), MongoDB (audit history), S3 (evidence packages) |
| **Guardrails** | Complete evidence trail, consistency with financial statements, materiality-driven prioritization |
| **Error Handling** | Flag missing evidence early, substitute supporting documents, escalate to controller |
| **KPIs** | PBC pre-assembly coverage >80%, audit request turnaround <2 days, auditor satisfaction >4/5 |
| **Multi-Agent** | Uses SOX Evidence (AGT-049), Compliance Report (AGT-099), Financial Statements (AGT-050) |
| **Memory** | Long-term (auditor preferences, historical request patterns, common findings) |
| **MCP Tools** | MCP Audit Preparation Engine, MCP Evidence Vault |

### AGT-183 — Lease Accounting Agent (ASC 842)

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → Accounting |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages lease accounting under ASC 842/IFRS 16: lease classification, ROU asset/liability calculation, modification processing, and disclosure generation |
| **Trigger** | On new lease + On modification + Monthly amortization + Quarterly disclosure |
| **LLM Model** | Claude Sonnet + calculation engine |
| **Orchestrator** | LangGraph (lease processing chain) |
| **Tools** | Lease classifier, ROU calculator, amortization scheduler, modification processor, disclosure generator |
| **Input** | Lease contracts, payment schedules, discount rates, modification details, existing lease portfolio |
| **Output** | Lease classification, JE entries (initial + ongoing), amortization schedule, disclosure tables |
| **Databases** | PostgreSQL (lease data), MongoDB (contracts) |
| **Guardrails** | ASC 842 compliance validation, discount rate justification, remeasurement triggers |
| **Error Handling** | Flag ambiguous lease terms for accountant review, conservative classification |
| **KPIs** | Calculation accuracy >99.9%, classification accuracy >95%, disclosure completeness 100% |
| **Multi-Agent** | Feeds JE Creator (AGT-043), Financial Statements (AGT-050), Contract Analysis (AGT-178) |
| **Memory** | Long-term (lease portfolio, rate environment, modification patterns) |
| **MCP Tools** | MCP Lease Engine, MCP Calculation Server |

### AGT-184 — Revenue Recognition Agent (ASC 606)

| Field | Value |
|-------|-------|
| **Module / Page** | Domain Expert → Accounting |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages revenue recognition under ASC 606/IFRS 15: performance obligation identification, transaction price allocation, recognition timing, and variable consideration estimates |
| **Trigger** | On new contract + On modification + Monthly rev rec processing |
| **LLM Model** | Claude Opus + calculation engine |
| **Orchestrator** | LangGraph (rev rec processing chain) |
| **Tools** | Obligation identifier, price allocator, recognition timer, variable consideration estimator, disclosure builder |
| **Input** | Customer contracts, deliverables, pricing, performance metrics, historical patterns |
| **Output** | Rev rec schedule, JE entries, SSP analysis, variable consideration estimates, disclosure tables |
| **Databases** | PostgreSQL (revenue data), MongoDB (contracts, SSP data) |
| **Guardrails** | ASC 606 5-step model compliance, SSP evidence requirements, constraint on variable consideration |
| **Error Handling** | Conservative recognition for ambiguous arrangements, flag for controller review |
| **KPIs** | Recognition accuracy >99%, SSP documentation completeness 100%, disclosure compliance 100% |
| **Multi-Agent** | Feeds JE Creator (AGT-043), Revenue Forecasting (AGT-013), Financial Statements (AGT-050) |
| **Memory** | Long-term (SSP data, revenue patterns, arrangement types) |
| **MCP Tools** | MCP Rev Rec Engine, MCP SSP Calculator |

## 🔹 Specialized Finance

### AGT-185 — AP Invoice Processing Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Specialized Finance → Accounting |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | End-to-end AP invoice processing: OCR extraction, PO matching, 3-way match validation, approval routing, and payment scheduling with exception handling |
| **Trigger** | On invoice receipt (email/upload/EDI) |
| **LLM Model** | Claude Opus (vision) + matching rules |
| **Orchestrator** | LangGraph (AP processing chain) + n8n |
| **Tools** | Invoice OCR, PO matcher, 3-way match validator, approval router, payment scheduler, exception handler |
| **Input** | Invoice document, PO database, receiving records, vendor master, approval matrix |
| **Output** | Processed invoice with match results, approval request, payment schedule, exception flags |
| **Databases** | PostgreSQL (AP), MongoDB (documents), S3 (invoice images), Redis (processing queue) |
| **Guardrails** | 3-way match mandatory for PO invoices, dual approval above threshold, duplicate detection |
| **Error Handling** | Queue exceptions for manual review, auto-learn from corrections, escalate aged exceptions |
| **KPIs** | Straight-through processing >70%, match accuracy >98%, processing time <5min, duplicate detection >99% |
| **Multi-Agent** | Feeds Cash Forecast (AGT-028), Working Capital (AGT-146), Accrual Agent (AGT-041) |
| **Memory** | Long-term (vendor invoice patterns, common exceptions, learned matches) |
| **MCP Tools** | MCP AP Engine, MCP Document Processor, MCP Matching Engine |

### AGT-186 — AR Collections Intelligence Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Specialized Finance → Treasury |
| **Agent Type** | Agentic AI (Goal-Based) |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages intelligent AR collections with customer risk profiling, optimal contact timing, escalation strategies, and dispute resolution workflow automation |
| **Trigger** | Daily collections queue refresh + On overdue trigger + On dispute submission |
| **LLM Model** | Claude Sonnet + ML scoring |
| **Orchestrator** | LangGraph (collections workflow) |
| **Tools** | Customer risk profiler, contact optimizer, escalation planner, dispute resolver, communication drafter |
| **Input** | AR aging, customer profiles, payment history, communication history, dispute records |
| **Output** | Prioritized collections queue, personalized outreach plans, dispute resolution recommendations |
| **Databases** | PostgreSQL (AR), MongoDB (communications), Redis (priority queue) |
| **Guardrails** | Communication frequency limits, regulatory compliance (FDCPA-style), escalation thresholds |
| **Error Handling** | Fallback to standard collection cadence, escalate unresponsive accounts, dispute timeout alerts |
| **KPIs** | Collections effectiveness improvement >20%, DSO reduction >5 days, dispute resolution <15 days |
| **Multi-Agent** | Uses Predictive Collections (AGT-145), feeds Cash Forecast (AGT-028) |
| **Memory** | Long-term (customer payment behavior, effective communication strategies) |
| **MCP Tools** | MCP Collections Engine, MCP Communication Manager |

### AGT-187 — Fixed Asset Management Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Specialized Finance → Accounting |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages fixed asset lifecycle: capitalization decisions, depreciation calculations (multiple methods), impairment testing, disposal processing, and asset register maintenance |
| **Trigger** | On asset acquisition + Monthly depreciation + Annual impairment + On disposal |
| **LLM Model** | Claude Sonnet + calculation engine |
| **Orchestrator** | n8n (asset lifecycle) + LangGraph |
| **Tools** | Capitalization advisor, depreciation calculator, impairment tester, disposal processor, register maintainer |
| **Input** | Asset details, acquisition cost, useful life, residual value, impairment indicators, disposal terms |
| **Output** | Asset register updates, depreciation JEs, impairment charges, disposal gain/loss, disclosure data |
| **Databases** | PostgreSQL (asset register), MongoDB (asset documents) |
| **Guardrails** | Capitalization threshold enforcement, depreciation method consistency, impairment trigger monitoring |
| **Error Handling** | Flag ambiguous capitalization decisions, conservative useful life estimates |
| **KPIs** | Depreciation accuracy 100%, capitalization decision accuracy >95%, register completeness 100% |
| **Multi-Agent** | Feeds JE Creator (AGT-043), Financial Statements (AGT-050), Tax Agent (AGT-174) |
| **Memory** | Long-term (asset lifecycle patterns, useful life actuals vs estimates) |
| **MCP Tools** | MCP Asset Engine, MCP Depreciation Calculator |

### AGT-188 — Payroll Journal Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Specialized Finance → Accounting |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Processes payroll data from HRIS/payroll providers into GL journal entries with department allocation, benefit accruals, and tax liability postings |
| **Trigger** | On payroll cycle completion (bi-weekly/monthly) |
| **LLM Model** | Rule engine + Claude Haiku |
| **Orchestrator** | n8n (payroll processing pipeline) |
| **Tools** | Payroll data mapper, department allocator, benefit accrual calculator, tax liability poster, reconciler |
| **Input** | Payroll register, department mapping, benefit rates, tax tables, GL account mapping |
| **Output** | Payroll journal entries, department allocation, benefit accruals, tax liabilities, reconciliation |
| **Databases** | PostgreSQL (GL, payroll), MongoDB (mapping rules) |
| **Guardrails** | Balancing validation (debits = credits), variance check vs prior period, segregation from HR |
| **Error Handling** | Hold posting on imbalance, flag unusual variances, reconciliation exceptions |
| **KPIs** | JE accuracy 100%, posting within 1 business day, reconciliation match rate >99% |
| **Multi-Agent** | Feeds Close Task Agent (AGT-040), Variance Agent (AGT-015) |
| **Memory** | Long-term (payroll patterns, seasonal adjustments) |
| **MCP Tools** | MCP Payroll Connector, MCP GL Posting Engine |

### AGT-189 — Inventory Valuation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Specialized Finance → Accounting |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Manages inventory valuation across methods (FIFO, LIFO, weighted average), performs lower-of-cost-or-NRV testing, and generates inventory-related journal entries |
| **Trigger** | Monthly (period-end) + On significant inventory event |
| **LLM Model** | Claude Sonnet + calculation engine |
| **Orchestrator** | LangGraph (valuation chain) |
| **Tools** | Cost flow calculator, NRV tester, reserve estimator, obsolescence analyzer, disclosure builder |
| **Input** | Inventory transactions, cost data, market prices, aging data, sales forecasts |
| **Output** | Inventory valuation, LCNRV adjustments, obsolescence reserve, JEs, disclosure data |
| **Databases** | PostgreSQL (inventory), MongoDB (market data) |
| **Guardrails** | Method consistency, NRV documentation, reserve methodology documentation |
| **Error Handling** | Conservative valuation for uncertain NRV, flag aged inventory for manual review |
| **KPIs** | Valuation accuracy >99.5%, LCNRV testing coverage 100%, reserve adequacy within 5% |
| **Multi-Agent** | Feeds JE Creator (AGT-043), Working Capital (AGT-146), Financial Statements (AGT-050) |
| **Memory** | Long-term (obsolescence patterns, market price trends) |
| **MCP Tools** | MCP Inventory Engine, MCP Valuation Calculator |

### AGT-190 — Multi-Entity Consolidation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Specialized Finance → Accounting |
| **Agent Type** | Hierarchical Agent |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | Performs multi-entity financial consolidation: trial balance aggregation, currency translation, minority interest, IC elimination, and consolidated statement generation |
| **Trigger** | Monthly (post entity close) + On-demand |
| **LLM Model** | Claude Opus + consolidation engine |
| **Orchestrator** | LangGraph (consolidation DAG) |
| **Tools** | TB aggregator, currency translator, minority interest calculator, IC eliminator, statement generator |
| **Input** | Entity trial balances, ownership structures, FX rates, IC transaction data, consolidation rules |
| **Output** | Consolidated trial balance, currency translation adjustments, IC eliminations, consolidated statements |
| **Databases** | PostgreSQL (all entity GL), MongoDB (consolidation rules) |
| **Guardrails** | Entity close verification before consolidation, IC imbalance resolution, currency rounding rules |
| **Error Handling** | Partial consolidation with missing entity flagged, IC imbalance tolerance (auto-resolve <$100) |
| **KPIs** | Consolidation accuracy 100%, processing time <30min for 20 entities, IC elimination match >99% |
| **Multi-Agent** | Orchestrates IC Elimination (AGT-046), uses FX rates, feeds Financial Statements (AGT-050) |
| **Memory** | Long-term (consolidation patterns, recurring adjustments) |
| **MCP Tools** | MCP Consolidation Engine, MCP Currency Translation Server |

### AGT-191 — Debt Covenant Monitoring Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Specialized Finance → Treasury |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Continuously monitors financial covenant compliance across all debt agreements, forecasts potential breaches, and alerts treasury/legal teams with recommended actions |
| **Trigger** | Monthly (post-close) + Weekly forecast check + On material event |
| **LLM Model** | Claude Sonnet + rule engine |
| **Orchestrator** | n8n (monitoring) + LangGraph (analysis) |
| **Tools** | Covenant calculator, threshold monitor, breach predictor, headroom analyzer, action recommender |
| **Input** | Debt agreements, financial metrics, forecast data, covenant definitions, historical compliance |
| **Output** | Covenant compliance dashboard, headroom analysis, breach prediction, action recommendations |
| **Databases** | PostgreSQL (debt, financial data), MongoDB (agreements) |
| **Guardrails** | Alert at 90% of threshold, mandatory reporting to CFO at 95%, legal notification at breach |
| **Error Handling** | Conservative calculation (worst case), flag missing data, manual override with documentation |
| **KPIs** | Zero surprise breaches, prediction accuracy >90% (3 months forward), monitoring coverage 100% |
| **Multi-Agent** | Uses forecast data from Revenue (AGT-013), OPEX (AGT-014), Cash Forecast (AGT-028) |
| **Memory** | Long-term (covenant compliance history, headroom trends) |
| **MCP Tools** | MCP Covenant Engine, MCP Debt Manager |

### AGT-192 — Insurance Coverage Analyzer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Specialized Finance → Risk Intelligence |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Analyzes insurance coverage across the organization, identifies gaps, compares against risk exposure, and recommends coverage optimization strategies |
| **Trigger** | Annual renewal cycle + On risk event + On asset change |
| **LLM Model** | Claude Opus + RAG |
| **Orchestrator** | LangGraph (analysis chain) |
| **Tools** | Coverage mapper, gap analyzer, risk-coverage matcher, premium optimizer, benchmark comparer |
| **Input** | Insurance policies, asset inventory, risk register, claims history, industry benchmarks |
| **Output** | Coverage gap analysis, optimization recommendations, premium benchmarking, renewal strategy |
| **Databases** | PostgreSQL (policies, assets), MongoDB (claims, benchmarks) |
| **Guardrails** | No coverage reduction without risk committee approval, regulatory minimum compliance |
| **Error Handling** | Flag unknown risk categories, conservative gap assessment |
| **KPIs** | Coverage gap identification >95%, premium optimization savings >10%, renewal preparation >60 days |
| **Multi-Agent** | Feeds Risk Scorer (AGT-071), Stress Tester (AGT-082) |
| **Memory** | Long-term (claims patterns, coverage evolution, market rates) |
| **MCP Tools** | MCP Insurance Engine, MCP Risk Coverage Mapper |

### AGT-193 — Transfer Pricing Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Specialized Finance → FP&A |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Manages intercompany transfer pricing documentation, arm's length testing, and benchmarking analysis to ensure compliance with OECD guidelines and local regulations |
| **Trigger** | Annual documentation + On new IC transaction type + On regulatory change |
| **LLM Model** | Claude Opus + RAG (OECD/tax KB) |
| **Orchestrator** | LangGraph (TP analysis chain) |
| **Tools** | Benchmark searcher, arm's length tester, documentation generator, method selector, contemporaneous documenter |
| **Input** | IC transactions, entity functional analysis, comparable data, OECD guidelines, local regulations |
| **Output** | TP documentation, arm's length test results, benchmark analysis, method selection justification |
| **Databases** | PostgreSQL (IC transactions), pgvector (TP knowledge base), MongoDB (benchmarks) |
| **Guardrails** | OECD method hierarchy, contemporaneous documentation requirement, local law compliance |
| **Error Handling** | Flag transactions without comparable data, conservative pricing until documented |
| **KPIs** | Documentation completeness 100%, arm's length compliance >95%, documentation timeliness within deadline |
| **Multi-Agent** | Uses IC Elimination (AGT-046), Tax Agent (AGT-174), Consolidation (AGT-190) |
| **Memory** | Long-term (comparable data, TP method effectiveness, regulatory changes) |
| **MCP Tools** | MCP Transfer Pricing Engine, MCP Benchmark Database |

### AGT-194 — Financial Close Checklist Optimizer Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Specialized Finance → Accounting |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Medium |
| **Purpose** | Continuously optimizes the month-end close checklist by analyzing task completion patterns, identifying parallelization opportunities, and eliminating unnecessary steps |
| **Trigger** | Post-close analysis (monthly) + Pre-close optimization |
| **LLM Model** | Claude Sonnet + process mining |
| **Orchestrator** | LangGraph (optimization chain) |
| **Tools** | Process miner, dependency analyzer, parallelization finder, bottleneck identifier, checklist optimizer |
| **Input** | Close task history (timings, dependencies, completions), error patterns, resource availability |
| **Output** | Optimized close checklist, parallelization recommendations, bottleneck alerts, estimated time savings |
| **Databases** | PostgreSQL (close tasks), MongoDB (optimization history) |
| **Guardrails** | No removal of regulatory/compliance tasks, dependency validation, controller approval for changes |
| **Error Handling** | Conservative (keep existing sequence) if optimization uncertain, A/B test changes |
| **KPIs** | Close cycle reduction >1 day per quarter, task optimization >10%, bottleneck prediction >85% |
| **Multi-Agent** | Feeds Close Orchestrator (AGT-139), Close Progress Predictor (AGT-039) |
| **Memory** | Long-term (close optimization history, seasonal patterns, effective parallelization) |
| **MCP Tools** | MCP Process Mining Engine, MCP Close Optimizer |

## 🔹 Integration

### AGT-195 — Slack/Teams Notification Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Integration → Admin |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | Low |
| **Purpose** | Delivers AI-generated alerts, reports, and summaries to Slack/Teams channels with interactive buttons for quick actions (approve, dismiss, investigate) |
| **Trigger** | On notification from any agent + Scheduled digest |
| **LLM Model** | Claude Haiku (message formatting) |
| **Orchestrator** | n8n (delivery pipeline) |
| **Tools** | Message formatter, channel router, interactive button builder, thread manager, delivery tracker |
| **Input** | Notification payload, channel mapping, user preferences, interactive action definitions |
| **Output** | Formatted Slack/Teams messages with interactive elements, delivery confirmations |
| **Databases** | PostgreSQL (channel configs), Redis (delivery queue), MongoDB (message templates) |
| **Guardrails** | Rate limiting per channel, quiet hours respect, critical-only for DMs |
| **Error Handling** | Retry delivery, fallback to email if messaging fails, queue during outages |
| **KPIs** | Delivery success >99.5%, formatting quality >4.5/5, action response rate >40% |
| **Multi-Agent** | Delivery channel for ALL alerting agents |
| **Memory** | Long-term (channel activity patterns, effective message formats) |
| **MCP Tools** | MCP Slack Connector, MCP Teams Connector |

### AGT-196 — Webhook Management Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Integration → Admin |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive + Proactive |
| **Autonomy** | High |
| **Purpose** | Manages all inbound and outbound webhooks: endpoint registration, payload validation, retry management, health monitoring, and security verification |
| **Trigger** | On webhook event (inbound/outbound) + Health check cycle |
| **LLM Model** | Rule engine |
| **Orchestrator** | n8n (webhook router) |
| **Tools** | Endpoint manager, payload validator, retry engine, health monitor, signature verifier, rate limiter |
| **Input** | Webhook events, endpoint configs, security keys, retry policies, health thresholds |
| **Output** | Processed webhook events, delivery status, health dashboard, security alerts |
| **Databases** | PostgreSQL (webhook configs), Redis (event queue), MongoDB (delivery logs) |
| **Guardrails** | HMAC signature verification, payload size limits, rate limiting, IP allowlisting |
| **Error Handling** | Exponential backoff retry (5 attempts), dead letter queue, health degradation alerting |
| **KPIs** | Delivery success >99.9%, processing latency <500ms, security verification 100% |
| **Multi-Agent** | Infrastructure for ALL external integration agents |
| **Memory** | Long-term (endpoint reliability history, common failure patterns) |
| **MCP Tools** | MCP Webhook Engine, MCP Security Verifier |

### AGT-197 — ERP Journal Poster Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Integration → Admin |
| **Agent Type** | Goal-Based Agent |
| **Behavior** | Reactive |
| **Autonomy** | Medium |
| **Purpose** | Posts approved journal entries from the platform back to the ERP system (SAP, NetSuite, Oracle) with validation, mapping, error handling, and reconciliation |
| **Trigger** | On JE approval + Batch posting schedule |
| **LLM Model** | Rule engine + Claude Haiku (error classification) |
| **Orchestrator** | n8n (posting pipeline) |
| **Tools** | ERP API client, JE mapper, validation checker, posting executor, reconciliation verifier, error handler |
| **Input** | Approved journal entries, ERP field mappings, validation rules, posting schedule |
| **Output** | Posting confirmations, reconciliation report, error log, sync status |
| **Databases** | PostgreSQL (JEs), Redis (posting queue), MongoDB (mapping configs) |
| **Guardrails** | Dual posting prevention, balance validation pre-post, reconciliation mandatory post-posting |
| **Error Handling** | Queue failed postings, retry with mapped corrections, escalate persistent failures |
| **KPIs** | Posting success rate >99%, reconciliation match 100%, posting latency <5min |
| **Multi-Agent** | Receives from JE Creator (AGT-043), Close Task (AGT-040), feeds ERP Sync (AGT-135) |
| **Memory** | Long-term (posting patterns, common ERP errors) |
| **MCP Tools** | MCP ERP Connector, MCP GL Posting Engine |

### AGT-198 — SSO & Identity Federation Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Integration → Admin |
| **Agent Type** | Model-Based Reflex Agent |
| **Behavior** | Reactive |
| **Autonomy** | High |
| **Purpose** | Manages SSO integration with enterprise identity providers (Okta, Azure AD, Google), handling SAML/OIDC flows, JIT provisioning, and role synchronization |
| **Trigger** | On authentication event + On identity provider change + Scheduled sync |
| **LLM Model** | Rule engine |
| **Orchestrator** | n8n (identity pipeline) |
| **Tools** | SAML/OIDC handler, JIT provisioner, role synchronizer, session manager, audit logger |
| **Input** | Identity provider events, SAML assertions, OIDC tokens, role mapping rules |
| **Output** | Authenticated sessions, provisioned users, synchronized roles, audit log entries |
| **Databases** | PostgreSQL (users, roles), Redis (sessions), MongoDB (IdP configs) |
| **Guardrails** | MFA enforcement, session timeout policies, failed login lockout, IP-based restrictions |
| **Error Handling** | Graceful IdP failover, local authentication fallback (if enabled), session recovery |
| **KPIs** | Authentication success >99.9%, JIT provisioning <3s, role sync accuracy 100% |
| **Multi-Agent** | Gates ALL agent access, feeds Zero-Trust Agent (AGT-151) |
| **Memory** | Long-term (authentication patterns, IdP reliability) |
| **MCP Tools** | MCP Identity Provider Bridge, MCP Session Manager |

## 🔹 Platform Intelligence

### AGT-199 — Platform Usage Analytics Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Platform Intelligence → Admin |
| **Agent Type** | Learning Agent |
| **Behavior** | Proactive |
| **Autonomy** | Low |
| **Purpose** | Analyzes platform-wide usage patterns to identify adoption trends, feature utilization, user engagement, and ROI metrics for executive reporting and product decisions |
| **Trigger** | Weekly analysis + Monthly executive report |
| **LLM Model** | Claude Sonnet + analytics models |
| **Orchestrator** | LangGraph (analytics pipeline) |
| **Tools** | Usage tracker, adoption analyzer, engagement scorer, ROI calculator, churn predictor, report generator |
| **Input** | User activity logs, feature usage, session data, agent run counts, cost data |
| **Output** | Usage analytics dashboard, adoption report, feature utilization matrix, ROI analysis, recommendations |
| **Databases** | PostgreSQL (usage data), MongoDB (analytics), Redis (event stream) |
| **Guardrails** | Anonymized analytics, no individual surveillance, aggregate-only reporting |
| **Error Handling** | Partial analytics if some data unavailable, note data gaps in reports |
| **KPIs** | Analytics coverage >95% of features, report delivery on-time 100%, insight actionability >4/5 |
| **Multi-Agent** | Aggregates data from ALL agents, feeds Agent ROI (AGT-065), Feedback (AGT-110) |
| **Memory** | Long-term (usage trends, feature lifecycle patterns) |
| **MCP Tools** | MCP Analytics Engine, MCP Usage Tracker |

### AGT-200 — Platform Self-Healing Orchestrator Agent

| Field | Value |
|-------|-------|
| **Module / Page** | Platform Intelligence → Monitoring |
| **Agent Type** | Agentic AI (Hierarchical Multi-Agent) |
| **Behavior** | Proactive |
| **Autonomy** | High |
| **Purpose** | The ultimate meta-agent: monitors overall platform health, detects systemic issues, orchestrates self-healing workflows across all 199 other agents, and ensures platform resilience |
| **Trigger** | Continuous (platform health monitoring) + On systemic anomaly |
| **LLM Model** | Claude Opus (strategic reasoning) |
| **Orchestrator** | LangGraph (meta-orchestration) + n8n |
| **Tools** | Platform health aggregator, systemic anomaly detector, self-healing orchestrator, agent dependency resolver, resilience scorer |
| **Input** | Health data from ALL agents, infrastructure metrics, error rates, latency data, agent dependency graph |
| **Output** | Platform health score, systemic issue detection, self-healing actions, resilience report, capacity forecast |
| **Databases** | PostgreSQL (platform state), Prometheus (all metrics), Redis (health cache), MongoDB (healing logs) |
| **Guardrails** | Human approval for major self-healing actions, cascading failure prevention, minimum agent availability |
| **Error Handling** | Graceful degradation plan, priority-based agent recovery, manual override capability |
| **KPIs** | Platform availability >99.95%, self-healing success >85%, MTTR improvement >50%, systemic issue prediction >80% |
| **Multi-Agent** | META-ORCHESTRATOR: monitors and coordinates ALL 199 agents, the brain of the entire platform |
| **Memory** | Long-term (platform health patterns, effective healing strategies, capacity planning data) |
| **MCP Tools** | MCP Platform Orchestrator, MCP Health Aggregator, MCP Self-Healing Engine, MCP Agent Dependency Graph |

---

## 🎯 Complete Agent Inventory Summary (All 200 Agents)

| Batch | Range | Modules Covered |
|-------|-------|----------------|
| Batch 1 | AGT-001 → AGT-050 | Command Center, FP&A, Treasury, Accounting |
| Batch 2 | AGT-051 → AGT-100 | Agent Studio, Risk Intelligence, Monitoring, Admin |
| Batch 3 | AGT-101 → AGT-150 | Cross-Cutting, RAG Infrastructure, Data Pipeline, Multi-Agent Orchestration, Advanced Analytics |
| Batch 4 | AGT-151 → AGT-200 | Security & Compliance, ML Ops, Domain Expert, Specialized Finance, Integration, Platform Intelligence |
| **TOTAL** | **AGT-001 → AGT-200** | **16 Modules** |

*Batch 4 of 4 (FINAL) — Agents 151-200 | Agentic Finance Director App | Feb 6, 2026*
