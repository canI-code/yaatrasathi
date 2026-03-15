import { BookmarkIcon } from "@heroicons/react/24/outline";
import { colors } from "../../theme";

/**
 * Shown above AI results to remind the user to save before leaving.
 * Only renders when authenticated (SaveToPlanButton handles auth check).
 */
export default function SaveReminderBanner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        background: "rgba(249,115,22,0.07)",
        border: "1px solid rgba(249,115,22,0.25)",
        borderRadius: 12,
        marginBottom: 16,
      }}
    >
      <BookmarkIcon style={{ width: 16, height: 16, color: colors.warning, flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: "0.82rem", color: colors.warning, lineHeight: 1.5 }}>
        These results will be lost if you refresh or leave the page.
        Use the <strong style={{ fontWeight: 700 }}>Save to Plan</strong> button to keep them permanently.
      </p>
    </div>
  );
}
