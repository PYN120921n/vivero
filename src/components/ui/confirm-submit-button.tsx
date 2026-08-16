"use client";

import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  confirmMessage: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Botón de submit que confirma con el usuario antes de disparar la Server Action del <form> que lo envuelve. */
export function ConfirmSubmitButton({ confirmMessage, className, variant, size, onClick, ...props }: Props) {
  return (
    <button
      type="submit"
      className={buttonClasses({ variant, size, className })}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
}
