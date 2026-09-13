"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Compass,
  Crown,
  FolderLock,
  Heart,
  Loader2,
  Lock,
  LogIn,
  MapPin,
  Moon,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { KundliMilanModal } from "@/components/milan/KundliMilanModal";
import { createClient } from "@/lib/supabase/client";
import {
  saveReading,
  getLocalVaultCharts,
  removeLocalVaultChart,
  isAccountOrProfileUnlocked,
} from "@/lib/reading-store";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { emptyAstrologyData, type StoredReading } from "@/types/astrology";

export interface VaultChartItem {
  id: string;
  name: string;
  relationship: string;
  date_of_birth: string;
  time_of_birth: string;
  city: string;
  chart_data: StoredReading["vedicChart"];
  reading_data?: StoredReading["reading"];
  isUnlocked?: boolean;
  created_at: string;
}

const RELATIONSHIP_TAGS = ["All", "Self", "Partner", "Family", "Friend"];

function deduplicateCharts(items: VaultChartItem[]): VaultChartItem[] {
  const seen = new Set<string>();
  const result: VaultChartItem[] = [];

  for (const item of items) {
    const key = `${(item.name || "").trim().toLowerCase()}_${(item.date_of_birth || "").trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

function getChartSummary(chart: VaultChartItem) {
  const cd = chart.chart_data;

  const asc =
    cd?.ascendant?.signName ||
    cd?.ascendant?.sign ||
    cd?.ascendantSign ||
    "Unknown";

  const moon =
    cd?.planets?.["Moon"]?.signName ||
    cd?.planets?.Moon?.signName ||
    cd?.planets?.["Moon"]?.sign ||
    cd?.moonSign ||
    "Unknown";

  const nakshatra =
    cd?.planets?.["Moon"]?.nakshatra?.name ||
    cd?.planets?.Moon?.nakshatra?.name ||
    cd?.nakshatra?.name ||
    cd?.nakshatra ||
    "Unknown";

  const dasha =
    cd?.dasha?.current?.mahadasha ||
    cd?.dasha?.currentMahadasha?.planet ||
    cd?.dasha?.balanceAtBirth?.lord ||
    "N/A";

  return { asc, moon, nakshatra, dasha };
}

export default function VaultPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState<VaultChartItem[]>([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [milanOpen, setMilanOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Immediately display any locally generated charts
    const local = getLocalVaultCharts();
    if (local.length > 0) {
      setCharts(deduplicateCharts(local));
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      fetchCombinedCharts(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      fetchCombinedCharts(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function fetchCombinedCharts(currentUser: SupabaseUser | null) {
    setLoading(true);
    const localCharts = getLocalVaultCharts();

    if (!currentUser) {
      setCharts(deduplicateCharts(localCharts));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/vault");
      let cloudCharts: VaultChartItem[] = [];
      if (res.ok) {
        const data = await res.json();
        cloudCharts = data.charts || [];
      }

      // Combine cloud and local charts
      const merged = deduplicateCharts([...cloudCharts, ...localCharts]);
      setCharts(merged);

      // In background, sync any unsynced local charts to cloud
      for (const lc of localCharts) {
        const alreadyInCloud = cloudCharts.some(
          (cc) =>
            (cc.name || "").toLowerCase() === (lc.name || "").toLowerCase() &&
            cc.date_of_birth === lc.date_of_birth &&
            cc.time_of_birth === lc.time_of_birth
        );
        if (!alreadyInCloud) {
          fetch("/api/vault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: lc.name,
              relationship: lc.relationship || "Self",
              date_of_birth: lc.date_of_birth,
              time_of_birth: lc.time_of_birth,
              city: lc.city,
              chart_data: lc.chart_data,
              reading_data: lc.reading_data,
            }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Cloud vault fetch error, displaying local cache:", err);
      setCharts(deduplicateCharts(localCharts));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this chart from your vault?")) return;
    setDeletingId(id);
    try {
      removeLocalVaultChart(id);
      if (user) {
        await fetch(`/api/vault?id=${id}`, { method: "DELETE" }).catch(() => {});
      }
      setCharts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete chart:", err);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleOpenReading(chart: VaultChartItem) {
    let readingData = chart.reading_data;
    let chartData = chart.chart_data;

    // Ensure chart is computed if missing
    if (!chartData && chart.date_of_birth && chart.time_of_birth) {
      try {
        const { calculateVedicChart } = await import("@/lib/vedic");
        chartData = calculateVedicChart({
          dateOfBirth: chart.date_of_birth,
          timeOfBirth: chart.time_of_birth,
          latitude: 16.8433,
          longitude: 74.6465,
          timezoneOffsetHours: 5.5,
          cityName: chart.city,
        });
      } catch {}
    }

    if (!readingData) {
      readingData = {
        summary: { headline: `${chart.name}'s Vedic Chart`, overview: "Personal Janma Kundli profile." },
        personality: { title: "Personality", content: "Vedic chart recorded in your Cosmic Vault." },
        strengths: [],
        challenges: [],
        planetaryInsights: [],
        houseInsights: [],
        career: { title: "Career & Purpose", content: "" },
        finance: { title: "Wealth & Finance", content: "" },
        relationships: { title: "Relationships", content: "" },
        education: { title: "Learning", content: "" },
        spirituality: { title: "Spiritual Path", content: "" },
        currentFocus: { title: "Current Focus", content: "" },
        guidance: [],
        disclaimer: "Vedic calculation.",
      };
    }

    const storedReading: StoredReading = {
      birth: {
        name: chart.name,
        dateOfBirth: chart.date_of_birth,
        timeOfBirth: chart.time_of_birth,
        birthCity: chart.city,
        birthState: "",
        birthCountry: "",
        gender: "Prefer not to say",
        interests: [],
      },
      reading: readingData,
      astrologyData: emptyAstrologyData,
      vedicChart: chartData,
      isUnlocked: isAccountOrProfileUnlocked({
        name: chart.name,
        dateOfBirth: chart.date_of_birth,
      }),
      generatedAt: chart.created_at,
    };

    saveReading(storedReading);
    router.push("/reading");
  }

  function handleShare(chart: VaultChartItem) {
    const { asc, moon, nakshatra, dasha } = getChartSummary(chart);

    const url = `${window.location.origin}/api/og?name=${encodeURIComponent(
      chart.name
    )}&ascendant=${encodeURIComponent(asc)}&moon=${encodeURIComponent(
      moon
    )}&nakshatra=${encodeURIComponent(nakshatra)}&dasha=${encodeURIComponent(dasha)}`;

    if (navigator.share) {
      navigator
        .share({
          title: `${chart.name}'s Vedic Janma Kundli`,
          text: `Vedic astrological blueprint for ${chart.name}. Lagna: ${asc}, Moon: ${moon}, Nakshatra: ${nakshatra}.`,
          url: window.location.origin,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("Social share card link copied to clipboard!");
    }
  }

  const filteredCharts = charts.filter((c) => {
    if (selectedTag === "All") return true;
    return (c.relationship || "").toLowerCase() === selectedTag.toLowerCase();
  });

  return (
    <main className="starfield min-h-screen bg-background">
      <div className="cosmic-bg">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary font-medium">
                <FolderLock className="size-3.5 text-[var(--gold)]" />
                Cosmic Vault
              </div>
              <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                Your Saved Janma Kundlis
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Manage personal, partner, and family charts with instant astrological recalculation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {charts.length >= 2 && (
                <Button
                  variant="outline"
                  onClick={() => setMilanOpen(true)}
                  className="border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/10 font-medium"
                >
                  <Heart className="size-4 mr-1.5 fill-[var(--gold)]" />
                  Kundli Milan (Matching)
                </Button>
              )}
              <Button asChild size="default" className="shadow-lg">
                <Link href="/">
                  <Plus className="size-4 mr-1.5" />
                  New Birth Chart
                </Link>
              </Button>
            </div>
          </div>

          {!user ? (
            <div className="mt-16 text-center max-w-md mx-auto glass-panel p-8 rounded-3xl border border-border/60">
              <div className="mx-auto size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 mb-4">
                <FolderLock className="size-6 text-[var(--gold)]" />
              </div>
              <h2 className="font-display text-2xl font-semibold">Sign in to access your vault</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your vault is completely confidential and encrypted. Sign in to save, sync, and access your Kundlis securely.
              </p>
              <Button onClick={() => setAuthOpen(true)} className="mt-6 w-full">
                <LogIn className="size-4 mr-2" />
                Sign In with Google or Email
              </Button>
            </div>
          ) : loading ? (
            <div className="py-24 text-center">
              <Loader2 className="size-8 animate-spin mx-auto text-[var(--gold)]" />
              <p className="mt-3 text-sm text-muted-foreground">Retrieving your sacred charts from your vault...</p>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {/* Category filter pills */}
              {charts.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {RELATIONSHIP_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedTag === tag
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {filteredCharts.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-3xl border border-dashed border-border/70 p-8">
                  <Sparkles className="size-10 mx-auto text-[var(--gold)]/60 mb-3" />
                  <h3 className="font-display text-xl font-medium">
                    {charts.length === 0 ? "No charts in your vault yet" : "No charts in this category"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    Generate a reading on the home page and click &quot;Save to Vault&quot; to permanently store your chart and interpretations.
                  </p>
                  <Button asChild className="mt-6" variant="outline">
                    <Link href="/">
                      <Plus className="size-4 mr-1.5" />
                      Create a Chart Now
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCharts.map((chart) => {
                    const { asc, moon, nakshatra, dasha } = getChartSummary(chart);
                    const isUnlocked = isAccountOrProfileUnlocked({
                      name: chart.name,
                      dateOfBirth: chart.date_of_birth,
                    });

                    return (
                      <div
                        key={chart.id}
                        className="glass-panel group relative rounded-2xl border border-border/60 p-5 transition-all hover:border-[var(--gold)]/40 hover:shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary text-primary border border-primary/20">
                                  {chart.relationship || "Self"}
                                </span>
                                {isUnlocked ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <Crown className="size-3" /> Master Dossier
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary/80 text-muted-foreground border border-border/50">
                                    <Lock className="size-3" /> Free Preview
                                  </span>
                                )}
                              </div>
                              <h3 className="mt-2 font-display text-2xl font-semibold tracking-wide text-foreground">
                                {chart.name || "Nameless Chart"}
                              </h3>
                            </div>

                            <button
                              onClick={() => handleDelete(chart.id)}
                              disabled={deletingId === chart.id}
                              className="text-muted-foreground/60 hover:text-red-400 p-1 transition-colors"
                              title="Delete chart"
                            >
                              {deletingId === chart.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </button>
                          </div>

                          {/* Birth metadata */}
                          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-3.5 text-[var(--gold)] shrink-0" />
                              <span>{chart.date_of_birth} · {chart.time_of_birth}</span>
                            </div>
                            {chart.city && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="size-3.5 text-primary shrink-0" />
                                <span className="truncate">{chart.city}</span>
                              </div>
                            )}
                          </div>

                          {/* Vedic Astro Grid */}
                          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-background/60 p-3 border border-border/40 text-xs">
                            <div>
                              <span className="text-[10px] uppercase text-muted-foreground block">Ascendant</span>
                              <span className="font-semibold text-[var(--gold)]">{asc}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-muted-foreground block">Moon (Rashi)</span>
                              <span className="font-semibold text-foreground">{moon}</span>
                            </div>
                            <div className="mt-1">
                              <span className="text-[10px] uppercase text-muted-foreground block">Nakshatra</span>
                              <span className="font-medium text-foreground">{nakshatra}</span>
                            </div>
                            <div className="mt-1">
                              <span className="text-[10px] uppercase text-muted-foreground block">Active Dasha</span>
                              <span className="font-medium text-primary">{dasha}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                          <Button
                            variant={isUnlocked ? "secondary" : "outline"}
                            size="sm"
                            className={`text-xs flex-1 ${!isUnlocked ? "border-[var(--gold)]/40 hover:bg-[var(--gold)]/10 text-foreground" : ""}`}
                            onClick={() => handleOpenReading(chart)}
                          >
                            <Sparkles className="size-3.5 mr-1 text-[var(--gold)]" />
                            {isUnlocked ? "View Reading" : "Preview Reading"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => handleShare(chart)}
                            title="Share Blueprint"
                          >
                            <Share2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <KundliMilanModal
        open={milanOpen}
        onOpenChange={setMilanOpen}
        vaultCharts={charts}
      />
    </main>
  );
}
