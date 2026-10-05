"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Icon } from "@/components/ui/Icon/Icon";
import { TextField } from "@/components/ui/TextField/TextField";
import { login } from "./actions";
import { INITIAL_LOGIN_STATE } from "./loginState";
import styles from "./LoginForm.module.scss";

interface LoginFormProps {
  /** ID remembered by the "Save ID" checkbox (read from a cookie on the server). */
  defaultId?: string;
}

export function LoginForm({ defaultId = "" }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, INITIAL_LOGIN_STATE);
  const [id, setId] = useState(defaultId);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveId, setSaveId] = useState(defaultId !== "");

  const fieldError = (field: "id" | "password") => (state.error?.field === field ? state.error.message : undefined);

  return (
    <form action={formAction} className={styles.form} noValidate aria-busy={pending}>
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
      </div>

      <Button type="submit" size="xl" fullWidth disabled={pending} className={styles.submit}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
