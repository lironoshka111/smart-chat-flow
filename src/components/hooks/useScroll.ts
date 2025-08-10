import { useRef, useCallback } from "react";

/**
 * Simple scroll hook - useCallback needed since function is used in effect dependencies
 */
export const useScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []); // Empty deps - function logic never changes

  return {
    containerRef,
    scrollToBottom,
  };
};
