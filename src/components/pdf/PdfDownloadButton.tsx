"use client";

import React, { useState } from "react";
import { Download, Loader2, Lock, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { StoredReading } from "@/types/astrology";

interface Props {
  stored: StoredReading;
  onUnlock?: () => void;
}

export function PdfDownloadButton({ stored, onUnlock }: Props) {
  const [generating, setGenerating] = useState(false);

  async function handleDownloadPdf() {
    if (!stored.isUnlocked) {
      toast.info("Unlock the Complete Vedic Dossier to download the 15-page PDF.");
      if (onUnlock) onUnlock();
      return;
    }

    setGenerating(true);
    try {
      // Dynamically import @react-pdf/renderer to keep client bundle lean
      const { pdf } = await import("@react-pdf/renderer");
      const { ReadingPdfDocument } = await import("./ReadingPdfDocument");

      const doc = <ReadingPdfDocument stored={stored} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      // Trigger standard browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = (stored.birth.name || "Explorer").replace(/[^a-zA-Z0-9]/g, "_");
      link.href = url;
      link.download = `CosmicLens_Vedic_Dossier_${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("PDF generation encountered issue, falling back to print dialog:", err);
      window.print();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={handleDownloadPdf}
        disabled={generating}
        size="lg"
        variant={stored.isUnlocked ? "default" : "outline"}
        className={!stored.isUnlocked ? "border-dashed border-[var(--gold)]/50 text-foreground" : ""}
      >
        {generating ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Generating PDF…
          </>
        ) : !stored.isUnlocked ? (
          <>
            <Lock className="size-4 text-[var(--gold)]" aria-hidden="true" />
            Download Dossier (PDF) · Locked
          </>
        ) : (
          <>
            <Download className="size-4" aria-hidden="true" />
            Download Dossier (PDF)
          </>
        )}
      </Button>

      <Button variant="outline" onClick={() => window.print()} size="lg" title="Open print dialog">
        <Printer className="size-4" aria-hidden="true" />
        Print
      </Button>
    </div>
  );
}
