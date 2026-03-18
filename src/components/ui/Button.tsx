"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: Variant;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base = "inline-flex flex-row items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed";

  const styles = {
    primary: "bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_15px_-3px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_-5px_rgba(139,92,246,0.6)] border border-violet-500/50",
    secondary: "bg-white/[0.03] text-white hover:bg-white/[0.08] border border-white/10 backdrop-blur-md"
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}