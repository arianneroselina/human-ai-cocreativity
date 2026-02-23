"use client";

import { useEffect } from "react";

export function usePreventBack(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const push = () => history.pushState(null, "", document.URL);
    push();

    const onPop = (e: PopStateEvent) => {
      e.preventDefault();
      push(); // jump forward again
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // show native dialog
    };

    window.addEventListener("popstate", onPop);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enabled]);
}
