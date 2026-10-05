import { z } from "zod";

// Copy mirrors the Figma login frame: "존재하지 않는 아이디입니다." / "아이디와 비밀번호가 일치하지 않습니다."
export const LOGIN_MESSAGES = {
  idRequired: "Please enter your ID.",
  passwordRequired: "Please enter your password.",
  idUnknown: "This ID does not exist.",
  mismatch: "The ID and password do not match.",
  network: "Could not reach the server. Please try again.",
} as const;

export const loginSchema = z.object({
  id: z.string().trim().min(1, LOGIN_MESSAGES.idRequired).max(50),
  password: z.string().min(1, LOGIN_MESSAGES.passwordRequired).max(200),
  saveId: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
