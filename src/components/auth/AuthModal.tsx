"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function AuthModal({
  open,
  onOpenChange,
  onSuccess,
  title = "Access Your Cosmic Vault",
  description = "Save your Vedic birth charts, family profiles, and readings securely.",
}: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate Google sign in");
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-panel border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary mb-2">
            <Sparkles className="size-6 text-[var(--gold)]" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Mail className="size-5" />
            </div>
            <p className="font-medium text-sm text-foreground">Magic Link Sent!</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Check your inbox at <span className="text-foreground">{email}</span>. Click the link to instantly sign in and sync your readings.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSent(false)} className="mt-2">
              Use a different email
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {error && (
              <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-center text-xs text-destructive">
                {error}
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-3 border-border hover:bg-secondary/60"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground">or with magic link</span>
              </div>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-3">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="h-11"
              />
              <Button type="submit" disabled={loading || !email} className="w-full h-11">
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Send Magic Link"}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
