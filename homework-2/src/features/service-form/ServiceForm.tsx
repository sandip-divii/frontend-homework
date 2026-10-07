"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button/Button";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { CATEGORY_LABEL } from "@/data/categories";
import { useServiceMutations } from "@/hooks/useServiceMutations";
import { formatPrice } from "@/lib/format";
import { SERVICE_CATEGORIES, serviceInputSchema } from "@/lib/validation/service";
import { ApiError } from "@/services/http";
import type { ExpertService, ServiceCategory } from "@/types/service";
import styles from "./ServiceForm.module.scss";

export const THUMBNAIL_OPTIONS = [
  { value: "/images/cover-01.svg", label: "Cover 1 (warm beige)" },
  { value: "/images/cover-02.svg", label: "Cover 2 (grey)" },
  { value: "/images/cover-03.svg", label: "Cover 3 (rose)" },
] as const;

export const FORM_MESSAGES = {
  created: "Service added.",
  updated: "Service updated.",
  network: "Could not reach the server. Your input is kept — please try again.",
} as const;

type FieldName = "category" | "title" | "author" | "price" | "thumbnail" | "description";
type FieldErrors = Partial<Record<FieldName, string>>;

interface ServiceFormProps {
  mode: "create" | "edit";
  /** Required in edit mode; pre-fills the form. */
  initial?: ExpertService;
}

const CATEGORY_OPTIONS = SERVICE_CATEGORIES.map((id) => ({ value: id, label: CATEGORY_LABEL[id] }));

function firstMessages(fields: Record<string, string[] | undefined>): FieldErrors {
  const out: FieldErrors = {};
  for (const [name, messages] of Object.entries(fields)) {
    if (messages?.[0]) out[name as FieldName] = messages[0];
  }
  return out;
}

/**
 * Create / edit form for an expert service.
 * Client validation uses the same zod schema as the API, so both sides agree; the API stays authoritative
 * and its 422 field errors are mapped back onto the fields. On success: toast → back to the list.
 */
export function ServiceForm({ mode, initial }: ServiceFormProps) {
  const router = useRouter();
  const toast = useToast();
  const { create, update, pending } = useServiceMutations();

  const [category, setCategory] = useState<ServiceCategory>(initial?.category ?? "cover");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [thumbnail, setThumbnail] = useState<string>(initial?.thumbnail ?? THUMBNAIL_OPTIONS[0].value);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const priceNumber = Number(price);
  const pricePreview = price.trim() !== "" && Number.isFinite(priceNumber) ? `Shown as ${formatPrice(priceNumber)}` : "KRW, whole number (e.g. 15000)";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const parsed = serviceInputSchema.safeParse({
      category,
      title,
      author,
      price,
      thumbnail,
      description: description.trim() === "" ? null : description,
    });
    if (!parsed.success) {
      setFieldErrors(firstMessages(z.flattenError(parsed.error).fieldErrors));
      return;
    }
    setFieldErrors({});

    try {
      if (mode === "create") {
        await create(parsed.data);
        toast.push(FORM_MESSAGES.created);
      } else if (initial) {
        await update(initial.id, parsed.data);
        toast.push(FORM_MESSAGES.updated);
      }
      router.push("/");
      router.refresh(); // the list re-fetches on mount, so the new row shows without a manual reload
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setFieldErrors(firstMessages(err.fields));
        setFormError(err.message); // the API's own message, kept on screen with the user's input
      } else {
        setFormError(FORM_MESSAGES.network);
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-busy={pending}>
      <div className={styles.card}>
        <SelectField id="service-category" name="category" label="Category" value={category} options={CATEGORY_OPTIONS} onChange={setCategory} error={fieldErrors.category} required />

        <TextField id="service-title" name="title" label="Title" value={title} onChange={setTitle} placeholder="e.g. Cover design" error={fieldErrors.title} required hint="2–120 characters" />

        <TextField id="service-author" name="author" label="Author" value={author} onChange={setAuthor} placeholder="Expert's name" error={fieldErrors.author} required hint="Up to 80 characters" />

        <TextField id="service-price" name="price" label="Price" value={price} onChange={setPrice} placeholder="15000" inputMode="numeric" error={fieldErrors.price} required hint={pricePreview} />

        <div className={styles["thumb-row"]}>
          <SelectField id="service-thumbnail" name="thumbnail" label="Thumbnail" value={thumbnail} options={THUMBNAIL_OPTIONS} onChange={setThumbnail} error={fieldErrors.thumbnail} className={styles["thumb-select"]} />
          <div className={styles["thumb-preview"]} aria-hidden="true">
            <Image src={thumbnail} alt="" fill sizes="200px" unoptimized />
          </div>
        </div>

        <TextAreaField id="service-description" name="description" label="Description" value={description} onChange={setDescription} placeholder="What the expert delivers, turnaround, revisions…" error={fieldErrors.description} maxLength={2000} hint="Optional" />

        {formError ? (
          <p className={styles["form-error"]} role="alert">
            {formError}
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        <Button variant="outline" size="md" href={mode === "edit" && initial ? `/premium-service/${initial.id}` : "/"}>
          Cancel
        </Button>
        <Button type="submit" size="md" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Add service" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
