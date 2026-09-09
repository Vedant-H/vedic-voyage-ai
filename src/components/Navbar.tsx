"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderLock, Heart, LogIn, LogOut, Sparkles, Stars, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl no-print">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
              <Stars className="size-4 text-[var(--gold)]" />
            </div>
            <span className="font-display text-xl font-semibold tracking-wide text-foreground">
              CosmicLens <span className="text-[var(--gold)]">AI</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-xs">
              <Link href="/">
                <Sparkles className="size-3.5 mr-1 text-[var(--gold)]" />
                New Reading
              </Link>
            </Button>

            <Button
              variant={pathname === "/milan" ? "secondary" : "ghost"}
              size="sm"
              asChild
              className="text-xs"
            >
              <Link href="/milan">
                <Heart className="size-3.5 mr-1 fill-[var(--gold)] text-[var(--gold)]" />
                Kundli Milan
              </Link>
            </Button>

            <Button
              variant={pathname === "/vault" ? "secondary" : "ghost"}
              size="sm"
              asChild
              className="text-xs"
            >
              <Link href="/vault">
                <FolderLock className="size-3.5 mr-1 text-primary" />
                Cosmic Vault
              </Link>
            </Button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-border/60">
                <span className="hidden md:inline-block text-xs text-muted-foreground truncate max-w-[140px]">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  title="Sign Out"
                >
                  <LogOut className="size-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setAuthOpen(true)}
                className="h-8 px-3 text-xs shadow-sm"
              >
                <LogIn className="size-3.5 mr-1" />
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
