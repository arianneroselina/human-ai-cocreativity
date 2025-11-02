"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/shadcn_ui/dialog";
import { Button } from "@/components/shadcn_ui/button";

type ConfirmProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

export default function ConfirmDialog({
                                        open,
                                        onOpenChange,
                                        title = "Are you sure?",
                                        description,
                                        confirmLabel = "Yes",
                                        cancelLabel = "Cancel",
                                        onConfirm,
                                      }: ConfirmProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <DialogFooter className="mt-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onConfirm?.();
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
