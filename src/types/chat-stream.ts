export type JsonObject = Record<string, unknown>;

export type ApprovalRequiredPayload = {
  id: string;
  tool: string;
  sourceTool?: string;
  args: JsonObject;
};

export type AskUserPayload = {
  id: string;
  question: string;
  options: string[];
};

export type ToolCall = {
  id: string;
  name: string;
  query: string;
  result: string;
  isError: boolean;
  status: 'loading' | 'done';
};

export type ChatStreamEvent =
  | { type: 'thinking'; text: string }
  | { type: 'text'; text: string }
  | { type: 'tool_call'; id: string; name: string; args: JsonObject; argsText: string }
  | { type: 'tool_result'; id: string; name: string; ok: boolean; result: string }
  | { type: 'approval_required'; approval: ApprovalRequiredPayload }
  | { type: 'ask_user'; ask: AskUserPayload }
  | { type: 'html'; html: string }
  | { type: 'error'; message: string }
  | { type: 'done'; mode?: 'native' | 'emulated'; iterations?: number; completed?: boolean };

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;
  toolCalls?: ToolCall[];
  approval?: ApprovalRequiredPayload;
  askUser?: AskUserPayload;
}
