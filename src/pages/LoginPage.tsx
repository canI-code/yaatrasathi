import { useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { colors, glass } from "../theme";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    setLoading(false);

    if (authError) {
      setError(authError.message);
      // email field value is retained (controlled state)
    } else {
      navigate(redirect, { replace: true });
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 16px 40px",
        background: colors.background,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          ...glass.card,
          padding: "40px 36px",
        }}
      >
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: colors.textMain,
            marginBottom: 6,
            letterSpacing: "-0.03em",
          }}
        >
          Welcome back
        </h1>
        <p style={{ fontSize: "0.88rem", color: colors.textMuted, marginBottom: 28 }}>
          Sign in to access your travel plans.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<EnvelopeIcon style={{ width: 16, height: 16 }} />}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<LockClosedIcon style={{ width: 16, height: 16 }} />}
            required
            autoComplete="current-password"
          />

          {error && (
            <p
              style={{
                fontSize: "0.82rem",
                color: colors.error,
                background: colors.errorSoft,
                borderRadius: 10,
                padding: "10px 14px",
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading} style={{ marginTop: 4 }}>
            Sign in
          </Button>
        </form>

        <p
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: "0.85rem",
            color: colors.textMuted,
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{ color: colors.accentStrong, fontWeight: 600, textDecoration: "none" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
