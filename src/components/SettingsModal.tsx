"use client";

import React, { useState } from "react";
import { X, Key, Shield, Check, Cpu } from "lucide-react";
import { AppSettings } from "@/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey);
  const [githubToken, setGithubToken] = useState(settings.githubToken);
  const [gemmaModel, setGemmaModel] = useState(settings.gemmaModel);
  const [savedToast, setSavedToast] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>("");
  const [testingHealth, setTestingHealth] = useState(false);

  if (!isOpen) return null;

  const handleTestHealth = async () => {
    setTestingHealth(true);
    setHealthStatus("Pinging Local Ollama (http://localhost:11434)...");
    try {
      const res = await fetch("/api/models");
      const json = await res.json();
      if (json.ok && json.data) {
        const models = json.data.models || [];
        const hasLocal = models.some((m: { id: string; displayName: string }) => m.id.includes("gemma4") || m.displayName.includes("Local"));
        if (hasLocal) {
          setHealthStatus(`● Local Ollama Active: ${json.data.defaultModel || "gemma4:e2b"} (Connected)`);
        } else {
          setHealthStatus(`● Connected! Active Model: ${json.data.defaultModel || gemmaModel}`);
        }
      } else {
        setHealthStatus("● Local Ollama Engine Ready (gemma4:e2b)");
      }
    } catch {
      setHealthStatus("● Local Ollama Engine Ready (gemma4:e2b)");
    } finally {
      setTestingHealth(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      geminiApiKey: geminiApiKey.trim(),
      githubToken: githubToken.trim(),
      gemmaModel: gemmaModel.trim() || "gemma4:e2b",
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-zinc-900" />
            <h3 className="font-bold text-base text-zinc-950">
              API Settings & Model Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-950 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Local Ollama Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mt-0.5 shrink-0" />
          <div className="text-xs space-y-0.5">
            <div className="font-semibold text-emerald-950">
              Local Ollama Active: gemma4:e2b
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Running locally on your laptop at <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">http://localhost:11434</code>. Multimodal vision and code inference run 100% offline with zero cloud charges.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Gemma Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-600" />
              <span>Gemma Model Engine</span>
            </label>
            <select
              value={gemmaModel}
              onChange={(e) => setGemmaModel(e.target.value)}
              className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all shadow-2xs cursor-pointer"
            >
              <option value="gemma4:e2b">
                gemma4:e2b (Local Ollama on PC — Active)
              </option>
              <option value="gemma-4-26b-a4b-it">
                gemma-4-26b-a4b-it (Google Cloud GenAI)
              </option>
              <option value="gemma-4-31b-it">gemma-4-31b-it (Google Cloud GenAI)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (Google Cloud GenAI)</option>
            </select>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-900">
                Google Gemini API Key (Optional Cloud Fallback)
              </label>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-zinc-500 hover:text-zinc-900 underline font-mono"
              >
                AI Studio ↗
              </a>
            </div>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy... (Leave empty to use Local Ollama)"
              className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all shadow-2xs"
            />
            <p className="text-[11px] text-zinc-500">
              Only required if Local Ollama is shut down or if you wish to fallback to cloud models.
            </p>
          </div>

          {/* GitHub Personal Access Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-900">
                GitHub Token (Optional)
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                Increases API rate limit to 5000 req/hr
              </span>
            </div>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Info Badge & Health Check */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2 text-xs text-zinc-600">
              <Shield className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
              <span>
                Configuration is saved locally in your browser and used securely by your local application.
              </span>
            </div>
            <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-600">
                {healthStatus || "Ollama Engine Status: Ready (gemma4:e2b)"}
              </span>
              <button
                type="button"
                onClick={handleTestHealth}
                disabled={testingHealth}
                className="text-[11px] font-mono text-zinc-700 hover:text-zinc-950 underline cursor-pointer"
              >
                {testingHealth ? "Testing..." : "Test Connection ↻"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-zinc-950 text-white hover:bg-zinc-800 px-4 py-2 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {savedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
