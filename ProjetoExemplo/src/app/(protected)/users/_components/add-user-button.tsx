"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { UpsertUserForm } from "./upsert-user-form";
import { upsertUserApi } from "./users-list";

export function AddUserButton() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Novo Usuário</Button>
      </DialogTrigger>
      <DialogContent>
        <UpsertUserForm
          onSuccess={() => setOpen(false)}
          onSubmitUser={upsertUserApi}
        />
      </DialogContent>
    </Dialog>
  );
}
