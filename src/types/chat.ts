export type ChatMessageType = "text" | "input" | "action";
export type InputType = "text" | "select" | "date";
export type ActionType = "approve" | "deny";

export interface ChatAction {
  type: ActionType;
  label: string;
}

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  continue?: boolean;
  inputType?: InputType;
  options?: string[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    errorMessage?: string;
  };
  actions?: ChatAction[];
}

export interface ChatService {
  id: string;
  title: string;
  description: string;
  messages: ChatMessage[];
}
