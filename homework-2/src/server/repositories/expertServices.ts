import type { RowDataPacket } from "mysql2/promise";
import { execute, query, toIso, type SqlParam } from "@/server/db";
import type { ServiceInput } from "@/lib/validation/service";
import type { ExpertService, PagedResult, ServiceCategory, ServiceQuery, SortOption } from "@/types/service";

interface ServiceRow extends RowDataPacket {
  id: number;
  category: ServiceCategory;
  title: string;
  author: string;
  description: string | null;
  price: number;
  likes: number;
  rating: string | number; // DECIMAL arrives as a string
  review_count: number;
  thumbnail: string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

const SORT_SQL: Record<SortOption, string> = {
  recommended: "s.id ASC",
  newest: "s.created_at DESC, s.id DESC",
  priceAsc: "s.price ASC, s.id ASC",
  priceDesc: "s.price DESC, s.id ASC",
  rating: "s.rating DESC, s.review_count DESC, s.id ASC",
};

function toService(row: ServiceRow): ExpertService {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    author: row.author,
    description: row.description,
    price: row.price,
    likes: row.likes,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    thumbnail: row.thumbnail,
    createdBy: row.created_by,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export async function listServices(q: ServiceQuery): Promise<PagedResult<ExpertService>> {
  const where: string[] = [];
  const params: SqlParam[] = [];

  if (q.category !== "all") {
    where.push("s.category = ?");
    params.push(q.category);
  }
  const keyword = q.keyword.trim();
  if (keyword) {
    where.push("(s.title LIKE ? OR s.author LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [{ total }] = await query<CountRow>(`SELECT COUNT(*) AS total FROM expert_services s ${whereSql}`, params);
  const totalPages = Math.max(1, Math.ceil(total / q.pageSize));
  const page = Math.min(Math.max(1, q.page), totalPages);

  const rows = await query<ServiceRow>(
    `SELECT s.* FROM expert_services s ${whereSql} ORDER BY ${SORT_SQL[q.sort]} LIMIT ? OFFSET ?`,
    [...params, q.pageSize, (page - 1) * q.pageSize],
  );

  return { items: rows.map(toService), total, page, pageSize: q.pageSize, totalPages };
}

export async function getServiceById(id: number): Promise<ExpertService | null> {
  const rows = await query<ServiceRow>("SELECT s.* FROM expert_services s WHERE s.id = ? LIMIT 1", [id]);
  return rows[0] ? toService(rows[0]) : null;
}

export async function createService(input: ServiceInput, createdBy: number | null): Promise<ExpertService> {
  const result = await execute(
    `INSERT INTO expert_services (category, title, author, description, price, thumbnail, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [input.category, input.title, input.author, input.description ?? null, input.price, input.thumbnail ?? "/images/cover-01.svg", createdBy],
  );
  const created = await getServiceById(result.insertId);
  if (!created) throw new Error("Insert succeeded but the row could not be read back.");
  return created;
}

export async function updateService(id: number, input: ServiceInput): Promise<ExpertService | null> {
  const result = await execute(
    `UPDATE expert_services
        SET category = ?, title = ?, author = ?, description = ?, price = ?, thumbnail = COALESCE(?, thumbnail)
      WHERE id = ?`,
    [input.category, input.title, input.author, input.description ?? null, input.price, input.thumbnail ?? null, id],
  );
  if (result.affectedRows === 0) return null;
  return getServiceById(id);
}

export async function deleteService(id: number): Promise<boolean> {
  const result = await execute("DELETE FROM expert_services WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
