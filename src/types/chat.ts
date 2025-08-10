// src/types/chat.ts

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
  pattern?: string; // regex source (not /.../)
  errorMessage?: string;
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

/**
 * Runtime representation you actually use in the app.
 * If your JSON stores ISO strings, keep `timestamp: Date` in app state
 * but parse on load (or define a separate persisted type below).
 */
export interface ChatHistory {
  readonly id: string;
  readonly serviceId: string;
  readonly serviceTitle: string;
  readonly serviceDescription: string;
  readonly timestamp: Date;
  readonly answers: Record<string, string>;
  readonly firstInput?: string;
}

/**
 * If you persist to localStorage/JSON, this is the on-disk wire format.
 * Convert to/from ChatHistory when hydrating.
 */
export interface PersistedChatHistory extends Omit<ChatHistory, "timestamp"> {
  readonly timestamp: string; // ISO
}

/** Optional lightweight type for lists/sidebars */
export type ServiceLite = Pick<ChatService, "id" | "title" | "description">;

export interface CurrentChatState {
  serviceId: string;
  current: number;
  answers: Record<string, string>;
  chatStarted: boolean;
}
