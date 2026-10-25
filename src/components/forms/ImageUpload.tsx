/**
 * Screenshot picker with a type check, a preview and the privacy note.
 * Exports: ImageUpload.
 * Depends on: react.
 *
 * The browser check is only for quick feedback. The server re-checks size and
 * the real file signature.
 */
"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

interface ImageUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

export function ImageUpload({ file, onChange }: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (selected && !ACCEPTED_TYPES.includes(selected.type)) {
      setError("Please choose a PNG, JPEG or WebP image.");
      onChange(null);
      event.target.value = "";
      return;
    }
    setError(null);
    onChange(selected);
  }

  return (
    <div>
      <label htmlFor="screenshot" className="mb-1 block text-sm font-medium">
        Screenshot
      </label>
      <input
        id="screenshot"
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        aria-describedby="screenshot-note"
        onChange={handleChange}
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
      />
      <p id="screenshot-note" className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        PNG, JPEG or WebP, up to 4 MB by default. Your image is sent to the Gemini API for
        processing and is not stored by this app.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      {previewUrl && (
        // A blob: preview of an unknown size cannot use next/image optimization.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Preview of the selected screenshot"
          className="mt-3 max-h-64 rounded-lg border border-slate-200 dark:border-slate-700"
        />
      )}
    </div>
  );
}
