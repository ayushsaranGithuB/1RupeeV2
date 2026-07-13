"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";

interface ImagesSectionProps {
  logoUrl: string;
  mobileHeroImage: string;
  desktopHeroImage: string;
  onLogoChange: (url: string) => void;
  onMobileHeroChange: (url: string) => void;
  onDesktopHeroChange: (url: string) => void;
}

export function ImagesSection({
  logoUrl,
  mobileHeroImage,
  desktopHeroImage,
  onLogoChange,
  onMobileHeroChange,
  onDesktopHeroChange,
}: ImagesSectionProps) {
  return (
    <section className="border-t py-6 space-y-24">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Images</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload or link your campaign branding and hero images
        </p>
      </div>

      {/* Logo */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div>
          <label className="text-base font-semibold text-slate-900 block mb-3">
            Campaign Logo
          </label>
          <p className="text-xs text-slate-400 mb-3">
            Square (1:1) • Min 500px
          </p>
          <Input
            value={logoUrl}
            onChange={(e) => onLogoChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
        {logoUrl && (
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={logoUrl}
                alt="Logo preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Hero Image */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div>
          <label
            htmlFor="mobile-hero"
            className="text-base font-semibold text-slate-900 block mb-3"
          >
            Mobile Hero Image
          </label>
          <p className="text-xs text-slate-400 mb-3">
            Portrait (3:4) • JPEG/PNG
          </p>
          <Input
            id="mobile-hero"
            value={mobileHeroImage}
            onChange={(e) => onMobileHeroChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
        {mobileHeroImage && (
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={mobileHeroImage}
                alt="Mobile hero preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Hero Image */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div>
          <label
            htmlFor="desktop-hero"
            className="text-base font-semibold text-slate-900 block mb-3"
          >
            Desktop Hero Image
          </label>
          <p className="text-xs text-slate-400 mb-3">
            Landscape (4:3) • JPEG/PNG
          </p>
          <Input
            id="desktop-hero"
            value={desktopHeroImage}
            onChange={(e) => onDesktopHeroChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
        {desktopHeroImage && (
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={desktopHeroImage}
                alt="Desktop hero preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
