import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClasses =
  "w-full rounded-lg border border-stone-300 bg-white px-3 h-10 text-sm text-forest-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 disabled:bg-stone-100 disabled:text-stone-400";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, "h-auto py-2 min-h-24", className)} {...props} />;
}

export function Select({
  className,
  wrapperClassName,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string }) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <select className={cn(fieldClasses, "appearance-none pr-9 w-full", className)} {...props} />
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
    </div>
  );
}

export function Label({ className, required, children, ...props }: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("block text-sm font-medium text-forest-800 mb-1.5", className)} {...props}>
      {children}
      {required && <span className="text-red-600 ml-0.5">*</span>}
    </label>
  );
}

export function Field({
  label,
  required,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
