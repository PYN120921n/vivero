import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

const VARIANTS = {
  primary: "bg-forest-700 text-white hover:bg-forest-800 shadow-sm shadow-forest-900/10",
  secondary: "bg-white text-forest-800 border border-stone-300 hover:bg-stone-50",
  ghost: "text-forest-700 hover:bg-forest-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  accent: "bg-clay-500 text-white hover:bg-clay-600",
} as const;

const SIZES = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonClasses({ variant = "primary", size = "md", className }: ButtonBaseProps = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClasses({ variant, size, className })} {...props} />;
}

export function LinkButton({
  variant,
  size,
  className,
  href,
  ...props
}: ButtonBaseProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return <Link href={href} className={buttonClasses({ variant, size, className })} {...props} />;
}
