import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  children: ReactNode;
};

export function Button({ variant = "default", className = "", children, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
  const styles =
    variant === "outline"
      ? "border border-[var(--border)] bg-[var(--surface)] text-[var(--primary-ink)] hover:border-[var(--strong-border)]"
      : "bg-[var(--authority-sage)] text-[var(--surface)] hover:bg-[var(--dark-sage)]";

  return (
    <button className={`${base} ${styles} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
