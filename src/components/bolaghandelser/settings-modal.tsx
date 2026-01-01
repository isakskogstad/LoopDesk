"use client";

import { useEffect, useState } from "react";
import { X, Zap, Scale, Shield } from "lucide-react";

interface SettingsModalProps {
  parallelCount: number;
  onParallelChange: (count: number) => void;
  onClose: () => void;
}

type Preset = "fast" | "balanced" | "safe";

const presets: Record<Preset, { parallel: number; label: string; icon: typeof Zap }> = {
  fast: { parallel: 30, label: "Snabb", icon: Zap },
  balanced: { parallel: 15, label: "Balanserad", icon: Scale },
  safe: { parallel: 5, label: "Säker", icon: Shield },
};

export function SettingsModal({ parallelCount, onParallelChange, onClose }: SettingsModalProps) {
  const [localParallel, setLocalParallel] = useState(parallelCount);
  const [delayMs, setDelayMs] = useState(3000);
  const [captchaStrategy, setCaptchaStrategy] = useState<"local-first" | "2captcha-only" | "local-only">("local-first");
  const [useProxy, setUseProxy] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const applyPreset = (preset: Preset) => {
    setLocalParallel(presets[preset].parallel);
  };

  const handleSave = () => {
    onParallelChange(localParallel);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-xl shadow-2xl border border-[#2a2a2a] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151515] border-b border-[#2a2a2a]">
          <h2 className="text-lg font-semibold">Inställningar</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Presets */}
          <div>
            <label className="block text-sm text-[#888] mb-3">Snabbval</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(presets) as [Preset, typeof presets.fast][]).map(([key, preset]) => {
                const Icon = preset.icon;
                const isActive = localParallel === preset.parallel;
                return (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${
                      isActive
                        ? "bg-[#6366f1]/10 border-[#6366f1] text-[#6366f1]"
                        : "bg-[#0f0f0f] border-[#2a2a2a] hover:bg-[#151515]"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-medium">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parallel searches */}
          <div>
            <label className="block text-sm text-[#888] mb-2">
              Parallella sökningar: {localParallel}
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={localParallel}
              onChange={(e) => setLocalParallel(parseInt(e.target.value))}
              className="w-full accent-[#6366f1]"
            />
            <div className="flex justify-between text-xs text-[#666] mt-1">
              <span>1</span>
              <span>15</span>
              <span>30</span>
            </div>
          </div>

          {/* Delay */}
          <div>
            <label className="block text-sm text-[#888] mb-2">
              Fördröjning mellan sökningar: {delayMs}ms
            </label>
            <input
              type="range"
              min={1000}
              max={10000}
              step={500}
              value={delayMs}
              onChange={(e) => setDelayMs(parseInt(e.target.value))}
              className="w-full accent-[#6366f1]"
            />
            <div className="flex justify-between text-xs text-[#666] mt-1">
              <span>1s</span>
              <span>5s</span>
              <span>10s</span>
            </div>
          </div>

          {/* CAPTCHA strategy */}
          <div>
            <label className="block text-sm text-[#888] mb-2">CAPTCHA-strategi</label>
            <select
              value={captchaStrategy}
              onChange={(e) => setCaptchaStrategy(e.target.value as typeof captchaStrategy)}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm focus:outline-none focus:border-[#6366f1]"
            >
              <option value="local-first">Lokal först, sedan 2captcha</option>
              <option value="2captcha-only">Endast 2captcha</option>
              <option value="local-only">Endast lokal</option>
            </select>
          </div>

          {/* Proxy toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Smart proxy</div>
              <div className="text-xs text-[#666]">Aktiveras automatiskt vid blockering</div>
            </div>
            <button
              onClick={() => setUseProxy(!useProxy)}
              className={`w-12 h-6 rounded-full transition-colors ${
                useProxy ? "bg-[#6366f1]" : "bg-[#2a2a2a]"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  useProxy ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 bg-[#151515] border-t border-[#2a2a2a]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-sm transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] rounded-lg text-sm font-medium transition-colors"
          >
            Spara
          </button>
        </div>
      </div>
    </div>
  );
}
