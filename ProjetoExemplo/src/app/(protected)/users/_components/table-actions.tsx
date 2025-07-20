"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { UpsertUserForm } from "./upsert-user-form";
import { upsertUserApi } from "./users-list";

export function TableActions({
  user,
  onDelete,
  onEdit,
}: {
  user: any;
  onDelete: (id: string) => void;
  onEdit: (data: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    await onDelete(user.id);
    setLoading(false);
  };
  const handleEdit = async (data: any) => {
    setLoading(true);
    await onEdit(data);
    setLoading(false);
  };
  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Editar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <UpsertUserForm
            defaultValues={user}
            onSuccess={async (formData) => {
              await handleEdit(formData);
              setOpen(false);
            }}
            onSubmitUser={upsertUserApi}
          />
        </DialogContent>
      </Dialog>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        Excluir
      </Button>
    </div>
  );
}
