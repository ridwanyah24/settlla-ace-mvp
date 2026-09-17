"use client";

import { useRef, useCallback } from "react";
import { RestorableModalLayer } from "@/types/modalStack";

export function useRestorableModalStack(
  restoreModalLayer: (layer: RestorableModalLayer) => void
) {
  const stackRef = useRef<RestorableModalLayer[]>([]);

  const pushModalLayer = useCallback((layer: RestorableModalLayer) => {
    stackRef.current.push(layer);
  }, []);

  const clearModalStack = useCallback(() => {
    stackRef.current = [];
  }, []);

  const dismissWithRestore = useCallback(
    (dismiss: () => void) => {
      dismiss();
      const layer = stackRef.current.pop();
      if (layer) {
        restoreModalLayer(layer);
      }
    },
    [restoreModalLayer]
  );

  return {
    pushModalLayer,
    clearModalStack,
    dismissWithRestore,
  };
}
