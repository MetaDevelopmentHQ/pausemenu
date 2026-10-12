import { useEffect, useRef } from "react";

interface NuiMessage<T> {
  action: string;
  data: T;
}

/** Listens for SendNUIMessage({ action, data }) messages from Lua. */
export function useNuiEvent<T = unknown>(action: string, handler: (data: T) => void) {
  const saved = useRef(handler);
  saved.current = handler;

  useEffect(() => {
    const listener = (event: MessageEvent<NuiMessage<T>>) => {
      if (event.data && event.data.action === action) saved.current(event.data.data);
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [action]);
}
