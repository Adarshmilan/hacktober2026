/**
 * React hook that tracks one API call's loading, success and error state.
 * Exports: useApiRequest().
 * Depends on: react, @/types.
 */
import { useCallback, useRef, useState } from "react";
import type { ApiResponse, RequestState } from "@/types";

export function useApiRequest<T>() {
  const [state, setState] = useState<RequestState<T>>({ status: "idle" });
  // Ignores replies from older requests if the user submits again.
  const latestCall = useRef(0);

  const run = useCallback(async (call: () => Promise<ApiResponse<T>>) => {
    const callId = ++latestCall.current;
    setState({ status: "loading" });
    const response = await call();
    if (callId !== latestCall.current) return;
    setState(
      response.ok
        ? { status: "success", data: response.data }
        : { status: "error", error: response.error },
    );
  }, []);

  return { state, run };
}
