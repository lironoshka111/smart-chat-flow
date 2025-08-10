import { useUpdateEffect } from "ahooks";
import { useChatStore } from "../../../stores/chatStore";
import { useUserStore } from "../../../stores/userStore";

/**
 * Handles persistence - simplified to access stores directly
 */
export const useChatPersistence = (
  chatState: {
    current: number;
    answers: Record<string, string>;
    chatStarted: boolean;
  },
  setChatState: {
    setCurrent: (current: number) => void;
    setAnswers: (answers: Record<string, string>) => void;
    setChatStarted: (started: boolean) => void;
  },
) => {
  const { user } = useUserStore();
  const {
    currentChatState,
    setCurrentChatState,
    currentServiceId: serviceId,
  } = useChatStore();
  const { current, answers, chatStarted } = chatState;
  const { setCurrent, setAnswers, setChatStarted } = setChatState;

  // Load chat state when user or service changes
  useUpdateEffect(() => {
    if (
      user?.email &&
      !chatStarted &&
      currentChatState?.serviceId === serviceId
    ) {
      setCurrent(currentChatState.current || 0);
      setAnswers(currentChatState.answers || {});
      setChatStarted(currentChatState.chatStarted || false);
    }
  }, [user?.email, serviceId, chatStarted, currentChatState]);

  // Save chat state when it changes
  useUpdateEffect(() => {
    if (user?.email && chatStarted) {
      setCurrentChatState({
        serviceId,
        current,
        answers,
        chatStarted,
        timestamp: new Date().toISOString(),
      });
    }
  }, [
    user?.email,
    serviceId,
    current,
    answers,
    chatStarted,
    setCurrentChatState,
  ]);

  const clearPersistedState = () => setCurrentChatState(null);

  return { clearPersistedState };
};
