export type ChatMessageType = "text" | "input" | "action";
export type InputType = "text" | "select" | "date";
export type ActionType = "approve" | "deny";

export interface ChatAction {
  type: ActionType;
  label: string;
}

export interface ChatMessage {
  id: string;
  type: "text" | "input" | "action";
  content: string;
  continue?: boolean; // Optional: if true, this next message should be sent immediately after this one
  inputType?: "text" | "select" | "date";
  options?: string[];
  validation?: Validation;
  actions?: Action[];
}

export interface Validation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface Action {
  type: "approve" | "deny";
  label: string;
}

export interface ChatService {
  id: string;
  title: string;
  description: string;
  messages: ChatMessage[];
}

export interface ChatHistory {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceDescription: string;
  timestamp: Date;
  answers: Record<string, string>;
  firstInput?: string;
}
