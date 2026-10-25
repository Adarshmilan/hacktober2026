/**
 * Button that copies text to the clipboard and confirms it.
 * Exports: CopyButton.
 * Depends on: react, @/components/ui/Button.
 */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface CopyButtonProps {
  text: string;
  label?: string;
}

type CopyStatus = "idle" | "copied" | "failed";

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  const shown = status === "copied" ? "Copied!" : status === "failed" ? "Copy failed" : label;
  return (
    <Button variant="secondary" onClick={copy}>
      <span aria-live="polite">{shown}</span>
    </Button>
  );
}
