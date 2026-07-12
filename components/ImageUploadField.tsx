"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  minSize?: number;
  aspectRatio?: "square" | "any";
}

export function ImageUploadField({
  label,
  value,
  onChange,
  minSize = 500,
  aspectRatio = "square",
}: ImageUploadFieldProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  async function validateImageUrl(url: string) {
    if (!url) {
      setValidationError(null);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      return new Promise<void>((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          setValidationError("Image took too long to load");
          setIsValidating(false);
          resolve();
        }, 5000);

        img.onload = () => {
          clearTimeout(timeout);

          const { width, height } = img;

          if (width < minSize || height < minSize) {
            setValidationError(
              `Image must be at least ${minSize}x${minSize}px (current: ${width}x${height}px)`
            );
          } else if (aspectRatio === "square" && width !== height) {
            setValidationError(
              `Image must be square (current: ${width}x${height}px)`
            );
          }

          setIsValidating(false);
          resolve();
        };

        img.onerror = () => {
          clearTimeout(timeout);
          setValidationError("Failed to load image from URL");
          setIsValidating(false);
          resolve();
        };

        img.src = url;
      });
    } catch (error) {
      setValidationError("Failed to validate image");
      setIsValidating(false);
    }
  }

  async function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = e.target.value;
    onChange(url);
    if (url) {
      await validateImageUrl(url);
    } else {
      setValidationError(null);
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <div className="space-y-2">
        <Input
          value={value}
          onChange={handleUrlChange}
          placeholder="https://example.com/logo.jpg"
          disabled={isValidating}
          className={validationError ? "border-red-200" : ""}
        />

        {value && (
          <div className="inline-block rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
            <img
              src={value}
              alt="Preview"
              className="h-32 w-32 object-cover"
              onError={() => setValidationError("Image failed to load")}
            />
          </div>
        )}

        {validationError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {validationError}
          </div>
        )}

        {isValidating && (
          <div className="text-xs text-slate-500">Validating image...</div>
        )}

        <p className="text-xs text-slate-500">
          {aspectRatio === "square"
            ? `Square image, minimum ${minSize}x${minSize}px`
            : `Minimum dimensions: ${minSize}x${minSize}px`}
        </p>
      </div>
    </div>
  );
}
