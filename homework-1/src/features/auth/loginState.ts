export type LoginField = "id" | "password";

export interface LoginState {
  error: { field: LoginField; message: string } | null;
}

export const INITIAL_LOGIN_STATE: LoginState = { error: null };

// Copy mirrors the Figma frame: "존재하지 않는 아이디입니다." / "아이디와 비밀번호가 일치하지 않습니다."
export const LOGIN_MESSAGES = {
  idRequired: "Please enter your ID.",
  passwordRequired: "Please enter your password.",
  idUnknown: "This ID does not exist.",
  mismatch: "The ID and password do not match.",
} as const;
