import type { RowDataPacket } from "mysql2/promise";
import { query } from "@/server/db";
import type { PublicUser, UserRole } from "@/types/user";

interface UserRow extends RowDataPacket {
  id: number;
  login_id: string;
  password_hash: string;
  name: string;
  role: UserRole;
}

export interface UserWithHash extends PublicUser {
  passwordHash: string;
}

function toPublic(row: UserRow): PublicUser {
  return { id: row.id, loginId: row.login_id, name: row.name, role: row.role };
}

export async function findUserByLoginId(loginId: string): Promise<UserWithHash | null> {
  const rows = await query<UserRow>("SELECT * FROM users WHERE login_id = ? LIMIT 1", [loginId.trim().toLowerCase()]);
  const row = rows[0];
  return row ? { ...toPublic(row), passwordHash: row.password_hash } : null;
}

export async function findUserById(id: number): Promise<PublicUser | null> {
  const rows = await query<UserRow>("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] ? toPublic(rows[0]) : null;
}
