"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Icon } from "@/components/ui/Icon/Icon";
import { TextField } from "@/components/ui/TextField/TextField";
import { useLogin } from "@/hooks/useLogin";
import { LOGIN_MESSAGES } from "@/lib/validation/auth";
import styles from "./LoginForm.module.scss";

interface LoginFormProps {
  /** ID remembered by the "Save ID" checkbox (read from a cookie on the server). */
  defaultId?: string;
  /** Same-origin path to open after a successful login (validated by the page). */
  redirectTo?: string;
}

export function LoginForm({ defaultId = "", redirectTo = "/" }: LoginFormProps) {
  const { submit, pending, error } = useLogin(redirectTo);
  const [id, setId] = useState(defaultId);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveId, setSaveId] = useState(defaultId !== "");
  const [localError, setLocalError] = useState<{ field: "id" | "password"; message: string } | null>(null);

  const shown = localError ?? error;
  const fieldError = (field: "id" | "password") => (shown?.field === field ? shown.message : undefined);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Same rules as the API (lib/validation/auth.ts) for instant feedback; the API stays authoritative.
    if (!id.trim()) return setLocalError({ field: "id", message: LOGIN_MESSAGES.idRequired });
    if (!password) return setLocalError({ field: "password", message: LOGIN_MESSAGES.passwordRequired });
    setLocalError(null);
    void submit({ id: id.trim(), password, saveId });
  };

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate aria-busy={pending}>
      <div className={styles.card}>
        <TextField
          id="login-id"
          name="id"
          label="ID"
          value={id}
          onChange={setId}
          placeholder="Enter your ID"
          autoComplete="username"
          error={fieldError("id")}
          required
        />
        <TextField
          id="login-password"
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={fieldError("password")}
          required
          trailing={
            <button
              type="button"
              className={styles.eye}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              <Icon name={showPassword ? "eye" : "eyeOff"} size={28} />
            </button>
          }
        />
        <Checkbox name="saveId" checked={saveId} onChange={setSaveId}>
          Save ID
        </Checkbox>
        {shown && !shown.field ? (
          <p className={styles["form-error"]} role="alert">
            {shown.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="xl" fullWidth disabled={pending} className={styles.submit}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
