"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Crown,
  FileDown,
  HelpCircle,
  IndianRupee,
  Loader2,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlockSuccess: () => void;
}

const INCLUDED_FEATURES = [
  "Comprehensive 12-House Vedic Deconstruction (BPHS Canonical)",
  "120-Year Vimshottari Mahadasha & Antardasha Life Timeline",
  "Planetary Conjunctions & Rare Yogas Analysis",
  "Classical Non-Commercial Remedies (Mantras, Gemstones, Fasting, Daan)",
  "High-Resolution 15+ Page Vector PDF Download",
  "Unlimited AI Vedic Astrologer Follow-Up Consultations",
  "Lifetime Storage in your Encrypted Cosmic Vault",
];

export function UnlockModal({ open, onOpenChange, onUnlockSuccess }: Props) {
  const [currency, setCurrency] = useState<"USD" | "INR">("INR");
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);

  async function handleStripeCheckout() {
    setLoadingStripe(true);
    try {
      const res = await fetch("/api/checkout/stripe", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        if (data.isMock) {
          onUnlockSuccess();
          onOpenChange(false);
        } else {
          window.location.href = data.url;
        }
      } else {
        alert(data.error || "Stripe checkout failed");
      }
    } catch (err: any) {
      alert(`Stripe error: ${err.message}`);
    } finally {
      setLoadingStripe(false);
    }
  }

  async function handleRazorpayCheckout() {
    setLoadingRazorpay(true);
    try {
      const res = await fetch("/api/checkout/razorpay", { method: "POST" });
      const data = await res.json();

      if (data.isMock) {
        // Instant simulated verification for test environments
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isMock: true, razorpay_order_id: data.orderId }),
        });
        if (verifyRes.ok) {
          onUnlockSuccess();
          onOpenChange(false);
        }
        return;
      }

      // Check if window.Razorpay SDK is loaded, otherwise load dynamically
      if (!(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => triggerRazorpayModal(data);
        document.body.appendChild(script);
      } else {
        triggerRazorpayModal(data);
      }
    } catch (err: any) {
      alert(`Razorpay error: ${err.message}`);
    } finally {
      setLoadingRazorpay(false);
    }
  }

  function triggerRazorpayModal(data: any) {
    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "CosmicLens AI",
      description: "Vedic Master Astrology Dossier",
      order_id: data.orderId,
      theme: { color: "#e0b35a" },
      handler: async function (response: any) {
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
        if (verifyRes.ok) {
          onUnlockSuccess();
          onOpenChange(false);
        } else {
          alert("Payment signature verification failed.");
        }
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  function handleTestUnlock() {
    setLoadingTest(true);
    setTimeout(() => {
      onUnlockSuccess();
      onOpenChange(false);
      setLoadingTest(false);
    }, 600);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-border/80 bg-background/95 backdrop-blur-2xl p-6 sm:p-8">
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-xs text-[var(--gold)] font-medium">
            <Crown className="size-3.5 text-[var(--gold)]" />
            Complete Vedic Master Dossier
          </div>
          <DialogTitle className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Unlock Your Full Destiny Blueprint
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Transcend high-level horoscopes. Gain classical Parashari clarity on your lifespan, karma, and remedial path.
          </DialogDescription>
        </DialogHeader>

        {/* Currency & Price Selector */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary/30 p-3 border border-border/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrency("INR")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currency === "INR"
                  ? "bg-[var(--gold)] text-black shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ₹ INR (UPI / India)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currency === "USD"
                  ? "bg-[var(--gold)] text-black shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              $ USD (International)
            </button>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold font-display text-foreground">
              {currency === "INR" ? "₹1,499" : "$19"}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              One-time unlock
            </div>
          </div>
        </div>

        {/* Included deliverables */}
        <div className="mt-4 space-y-2 rounded-2xl bg-background/60 p-4 border border-border/40 text-xs">
          <span className="font-semibold text-foreground uppercase text-[11px] tracking-wider block mb-2">
            Included in this dossier:
          </span>
          {INCLUDED_FEATURES.map((feat, i) => (
            <div key={i} className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-[var(--gold)] mt-0.5 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          {currency === "INR" ? (
            <Button
              size="lg"
              className="w-full bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 font-semibold text-sm shadow-lg"
              onClick={handleRazorpayCheckout}
              disabled={loadingRazorpay}
            >
              {loadingRazorpay ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <IndianRupee className="size-4 mr-2" />
              )}
              Unlock with UPI / GPay / NetBanking (₹1,499)
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 font-semibold text-sm shadow-lg"
              onClick={handleStripeCheckout}
              disabled={loadingStripe}
            >
              {loadingStripe ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="size-4 mr-2" />
              )}
              Unlock with Card / Apple Pay ($19)
            </Button>
          )}

          {/* Developer / Demo Instant Unlock Button */}
          <div className="pt-2 border-t border-border/40 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              256-Bit SSL Encrypted
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestUnlock}
              disabled={loadingTest}
              className="text-[11px] text-muted-foreground hover:text-foreground h-7 px-2"
              title="Demo test mode for reviewers and testing"
            >
              {loadingTest ? (
                <Loader2 className="size-3 animate-spin mr-1" />
              ) : (
                <Zap className="size-3 mr-1 text-[var(--gold)]" />
              )}
              Demo Instant Unlock
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
