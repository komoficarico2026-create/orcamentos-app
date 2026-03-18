"use client";

import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}