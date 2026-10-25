/**
 * Local Ollama Provider for Google Gemma 4 (e.g. gemma4:e2b)
 * Enables 100% offline, local GPU/CPU execution with vision and JSON formatting.
 */

export const OLLAMA_DEFAULT_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export interface OllamaModelTag {
  name: string;
  model: string;
  size: number;
  details?: {
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export async function checkOllamaHealth(baseUrl = OLLAMA_DEFAULT_URL): Promise<{
  ok: boolean;
  models: string[];
  defaultLocalModel?: string;
}> {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/tags`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { ok: false, models: [] };
    const data = await res.json();
    const models: string[] = (data.models || []).map((m: OllamaModelTag) => m.name);
    const hasGemma4 = models.find((m) => m.toLowerCase().includes("gemma4") || m.toLowerCase().includes("gemma"));
    return {
      ok: true,
      models,
      defaultLocalModel: hasGemma4 || models[0] || "gemma4:e2b",
    };
  } catch {
    return { ok: false, models: [] };
  }
}

export async function generateWithOllama({
  prompt,
  model = "gemma4:e2b",
  images = [],
  format = "json",
  system,
  baseUrl = OLLAMA_DEFAULT_URL,
}: {
  prompt: string;
  model?: string;
  images?: string[];
  format?: string;
  system?: string;
  baseUrl?: string;
}): Promise<string> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/generate`;

  // Clean base64 strings if necessary
  const cleanImages = images.map((img) => img.replace(/^data:image\/[a-z]+;base64,/, ""));

  const payload: Record<string, any> = {
    model: model.replace(/^models\//, ""),
    prompt,
    stream: false,
    options: {
      temperature: 0.1,
      num_predict: 3500,
    },
  };

  if (format) {
    payload.format = format;
  }
  if (cleanImages.length > 0) {
    payload.images = cleanImages;
  }
  if (system) {
    payload.system = system;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(90_000), // 90 seconds timeout for local inference
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama request failed (${res.status}): ${errText}`);
  }

  const json = await res.json();
  return json.response || "";
}
