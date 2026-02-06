// ── API Response wrapper ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// ── User ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatarInitials: string;
}

// ── Agent ───────────────────────────────────────────────────
export interface AgentMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  tools?: string[];
  engine?: 'n8n' | 'langgraph' | 'bedrock';
  tokenUsage?: number;
  timestamp: string;
}

export interface AgentSession {
  sessionId: string;
  messages: AgentMessage[];
  engine: string;
  createdAt: string;
}

// ── Finance domain ──────────────────────────────────────────
export interface BudgetActual {
  id: number;
  period: string;
  department: string;
  category: string;
  budgetAmount: number;
  actualAmount: number;
  varianceAmount: number;
  variancePct: number;
  commentary?: string;
}

export interface CashPosition {
  id: number;
  asOfDate: string;
  accountName: string;
  bankName: string;
  currency: string;
  openingBalance: number;
  inflows: number;
  outflows: number;
  closingBalance: number;
}

export interface RiskAlert {
  id: number;
  alertType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  sourceTool: string;
  isResolved: boolean;
  createdAt: string;
}
