import React from "react";
import { Modal } from "./index";
import Button from "../button/Button";
import { Check, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Setujui",
  cancelText = "Batal",
  isDestructive = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-[400px]">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div
            className={`flex items-center justify-center size-12 rounded-xl text-white ${
              isDestructive ? "bg-error-500" : "bg-brand-500"
            }`}
          >
            {isDestructive ? <AlertTriangle className="size-6" /> : <Check className="size-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-8">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 rounded-xl border-gray-200 dark:border-gray-800"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 rounded-xl text-white shadow-lg ${
              isDestructive
                ? "bg-error-500 hover:bg-error-600 shadow-error-500/20"
                : "bg-brand-500 hover:bg-brand-600 shadow-brand-500/20"
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
