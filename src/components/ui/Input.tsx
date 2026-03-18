import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Input(props: InputProps) {
  return (
    <input
      className={`w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-black/60 transition-all placeholder:text-white/20 ${props.className || ""}`}
      {...props}
    />
  );
}