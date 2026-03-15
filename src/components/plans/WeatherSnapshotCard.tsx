import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { WeatherSnapshot } from "../../types";
import { colors, glass } from "../../theme";

interface WeatherSnapshotCardProps {
  snapshot: WeatherSnapshot;
}

function WeatherBlock({
  label,
  data,
  failed,
}: {
  label: string;
  data?: WeatherSnapshot["source_data"];
  failed?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 140,
        ...glass.subtle,
        padding: "14px 16px",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: colors.textSubtle,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>

      {failed || !data ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ExclamationTriangleIcon
            style={{ width: 14, height: 14, color: colors.warning, flexShrink: 0 }}
          />
          <p style={{ margin: 0, fontSize: "0.8rem", color: colors.warning }}>
            Weather unavailable
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={`https://openweathermap.org/img/wn/${data.icon}.png`}
              alt={data.description}
              style={{ width: 36, height: 36 }}
            />
            <span
              style={{ fontSize: "1.4rem", fontWeight: 800, color: colors.textMain }}
            >
              {Math.round(data.temperature)}°C
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "0.82rem",
              color: colors.textMuted,
              textTransform: "capitalize",
            }}
          >
            {data.description}
          </p>
          <p style={{ margin: 0, fontSize: "0.78rem", color: colors.textSubtle }}>
            {data.city}, {data.country}
          </p>
          <p style={{ margin: 0, fontSize: "0.75rem", color: colors.textSubtle }}>
            Humidity {data.humidity}% · Wind {data.windSpeed} m/s
          </p>
        </div>
      )}
    </div>
  );
}

export default function WeatherSnapshotCard({ snapshot }: WeatherSnapshotCardProps) {
  const capturedAt = new Date(snapshot.captured_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ margin: 0, fontSize: "0.75rem", color: colors.textSubtle }}>
        Captured {capturedAt}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <WeatherBlock
          label="Origin"
          data={snapshot.source_data}
          failed={!snapshot.source_data}
        />
        <WeatherBlock
          label="Destination"
          data={snapshot.dest_data}
          failed={!snapshot.dest_data}
        />
      </div>
    </div>
  );
}
