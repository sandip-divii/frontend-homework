"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { useDeleteService } from "@/hooks/API/services/useServiceMutations";
import { ApiError } from "@/services/http";
import type { ExpertService } from "@/types/service";
import styles from "./ServiceActions.module.scss";

interface ServiceActionsProps {
  service: ExpertService;
}

/** Edit / Delete for managers. Delete asks for confirmation, then returns to the (invalidated) list. */
export function ServiceActions({ service }: ServiceActionsProps) {
  const router = useRouter();
  const toast = useToast();
  const deleteMutation = useDeleteService();
  const [confirming, setConfirming] = useState(false);

  const onDelete = async () => {
    try {
      await deleteMutation.mutateAsync(service.id);
      setConfirming(false);
      toast.push(`"${service.title}" was deleted.`);
      router.push("/");
    } catch (err) {
      setConfirming(false);
      toast.push(err instanceof ApiError ? err.message : "Could not delete the service. Please try again.", "error");
    }
  };

  return (
    <div className={styles.actions}>
      <Button href={`/premium-service/${service.id}/edit`} variant="outline" size="md">
        Edit
      </Button>
      <Button variant="outline" size="md" onClick={() => setConfirming(true)} className={styles.danger}>
        Delete
      </Button>
      <ConfirmDialog
        open={confirming}
        title="Delete this service?"
        description={`"${service.title}" by ${service.author} will be removed permanently.`}
        confirmLabel="Delete"
        pending={deleteMutation.isPending}
        pendingLabel="Deleting…"
        onConfirm={onDelete}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
