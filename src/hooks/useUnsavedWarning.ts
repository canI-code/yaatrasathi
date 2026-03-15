import { useEffect } from "react";

/**
 * Shows a browser "Leave site?" dialog when the user tries to refresh/close
 * the page while there are unsaved AI results.
 * Note: browsers always show their own generic message — custom text is ignored.
 */
export function useUnsavedWarning(hasResults: boolean) {
  useEffect(() => {
    if (!hasResults) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasResults]);
}
