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
  continue?: boolean;
  inputType?: "text" | "select" | "date";
  options?: string[];
  validation?: Validation;
  actions?: Action[];
}

export interface Validation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex source (not /.../)
  type?: "email" | "phone"; // Add support for email and phone validation types
  errorMessage?: string;
  requiredMessage?: string; // Add support for custom required error messages
}

export interface Action {
  type: "approve" | "deny";
  label: string;
}

export interface ChatService {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly messages: ChatMessage[];
}

export interface ChatHistory {
  readonly id: string;
  readonly serviceId: string;
  readonly serviceTitle: string;
  readonly serviceDescription: string;
  readonly timestamp: Date;
  readonly answers: Record<string, string>;
  readonly firstInput?: string;
}

export interface PersistedChatHistory extends Omit<ChatHistory, "timestamp"> {
  readonly timestamp: string; // ISO
}

export type ServiceLite = Pick<ChatService, "id" | "title" | "description">;

export interface CurrentChatState {
  serviceId: string;
  current: number;
  answers: Record<string, string>;
  chatStarted: boolean;
}
