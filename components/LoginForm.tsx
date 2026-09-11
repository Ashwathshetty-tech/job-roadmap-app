"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (!error) setSent(true);
  };

  if (sent) {
    return (
      <p className="text-textDim text-sm">
        Check your email for a login link.
      </p>
    );
  }

  return (
    <form onSubmit={handleLogin} className="max-w-sm">
      <h1 className="font-serif text-2xl text-text mb-4">Sign in to Forward</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full bg-surface2 border border-border rounded px-3 py-2.5 text-text text-sm outline-none mb-3"
        required
      />
      <button className="bg-accent text-bg font-semibold text-sm rounded px-5 py-2.5 w-full">
        Send login link
      </button>
    </form>
  );
}