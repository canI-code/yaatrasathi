import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { colors, glass } from "../theme";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (password.trim().length === 0) {
      setPasswordError("Password must not be empty or whitespace-only.");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError(null);
    }

    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      // Surface duplicate-email and other server errors inline
      setServerError(error.message);
    } else {
      navigate("/dashboard", { replace: true });
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
          Create account
        </h1>
        <p style={{ fontSize: "0.88rem", color: colors.textMuted, marginBottom: 28 }}>
          Start planning your trips with AI.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<EnvelopeIcon style={{ width: 16, height: 16 }} />}
            error={emailError ?? undefined}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<LockClosedIcon style={{ width: 16, height: 16 }} />}
            error={passwordError ?? undefined}
            hint="At least 8 characters."
            required
            autoComplete="new-password"
          />

          {serverError && (
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
              {serverError}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading} style={{ marginTop: 4 }}>
            Create account
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
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: colors.accentStrong, fontWeight: 600, textDecoration: "none" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
