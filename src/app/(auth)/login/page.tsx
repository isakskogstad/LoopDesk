"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  role: string;
  image: string;
  provider: "google";
  loginHint?: string;
};

const profiles: Profile[] = [
  {
    id: "camilla-bergman",
    name: "Camilla Bergman",
    role: "Redaktion",
    image: "/avatars/camilla-bergman.png",
    provider: "google",
  },
  {
    id: "diana-demin",
    name: "Diana Demin",
    role: "Redaktion",
    image: "/avatars/diana-demin.png",
    provider: "google",
  },
  {
    id: "christian-von-essen",
    name: "Christian von Essen",
    role: "Redaktion",
    image: "/avatars/christian-von-essen.png",
    provider: "google",
  },
  {
    id: "jenny-kjellen",
    name: "Jenny Kjellen",
    role: "Redaktion",
    image: "/avatars/jenny-kjellen.png",
    provider: "google",
  },
  {
    id: "andreas-jennische",
    name: "Andreas Jennische",
    role: "Redaktion",
    image: "/avatars/andreas-jennische.png",
    provider: "google",
  },
  {
    id: "johann-bernovall",
    name: "Johann Bernovall",
    role: "Redaktion",
    image: "/avatars/johann-bernovall.png",
    provider: "google",
  },
  {
    id: "sandra-norberg",
    name: "Sandra Norberg",
    role: "Redaktion",
    image: "/avatars/sandra-norberg.png",
    provider: "google",
  },
  {
    id: "admin",
    name: "Admin",
    role: "Admin",
    image: "/brand/loopdesk-logo.png",
    provider: "google",
  },
];

function getPreferredProvider(profileId: string, fallback: Profile["provider"]) {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(`loopdesk-provider:${profileId}`);
  if (stored === "google") return "google";
  return fallback;
}

function rememberProvider(profileId: string, provider: Profile["provider"]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`loopdesk-provider:${profileId}`, provider);
  localStorage.setItem("loopdesk-last-profile", profileId);
}

function LoginEntry() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/nyheter";
  const [isVisible, setIsVisible] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);
  const [lastProfile, setLastProfile] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 80);
    if (typeof window !== "undefined") {
      setLastProfile(localStorage.getItem("loopdesk-last-profile"));
    }
    return () => clearTimeout(timer);
  }, []);

  const arrangedProfiles = useMemo(() => profiles, []);

  const handleProfileSelect = (profile: Profile) => {
    const provider = getPreferredProvider(profile.id, profile.provider);
    rememberProvider(profile.id, provider);
    setLoadingProfile(profile.id);
    signIn(provider, {
      callbackUrl,
      ...(profile.loginHint ? { login_hint: profile.loginHint } : {}),
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="text-center">
        <p
          className={`text-xs uppercase tracking-[0.4em] text-gray-400 transition-all duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Loop Desk
        </p>
        <h1
          className={`mt-4 text-5xl md:text-6xl font-semibold font-display text-gray-900 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Valj profil
        </h1>
        <p
          className={`mt-4 text-base text-gray-500 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          En privat arbetsyta for redaktionen. Valj din plats for att fortsatta.
        </p>
      </div>

      <div
        className={`mt-12 transition-all duration-700 delay-200 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="hidden md:block">
          <div className="relative mx-auto h-[420px] w-[420px]">
            <div className="absolute inset-0 rounded-full border border-gray-200/70 bg-white/70 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.3)]" />
            {arrangedProfiles.map((profile, index) => {
              const angle = (360 / arrangedProfiles.length) * index - 90;
              const radius = 175;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              const isActive = profile.id === lastProfile;

              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleProfileSelect(profile)}
                  className={`absolute left-1/2 top-1/2 flex items-center gap-3 rounded-full border bg-white/95 px-3 py-2 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    isActive
                      ? "border-gray-400"
                      : "border-gray-200"
                  }`}
                  style={{
                    transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                    transitionDelay: `${index * 60}ms`,
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.name}
                    </p>
                    <p className="text-xs text-gray-400">{profile.role}</p>
                  </div>
                  {loadingProfile === profile.id && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </button>
              );
            })}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="mx-auto h-16 w-16 rounded-full border border-gray-200 bg-white shadow-sm">
                <div className="relative h-full w-full">
                  <Image
                    src="/brand/loopdesk-logo.png"
                    alt="Loop Desk"
                    fill
                    sizes="64px"
                    className="object-cover rounded-full"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gray-400">
                Redaktion
              </p>
            </div>
          </div>
        </div>

        <div className="md:hidden grid grid-cols-2 gap-4">
          {arrangedProfiles.map((profile, index) => {
            const isActive = profile.id === lastProfile;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleProfileSelect(profile)}
                className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition-all hover:shadow-md ${
                  isActive ? "border-gray-400" : "border-gray-200"
                }`}
                style={{
                  transitionDelay: `${index * 60}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {profile.name}
                  </p>
                  <p className="text-xs text-gray-400">{profile.role}</p>
                </div>
                {loadingProfile === profile.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f3] text-gray-900">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),transparent_40%)]" />
      </div>
      <div className="relative z-10">
        <Suspense fallback={null}>
          <LoginEntry />
        </Suspense>
      </div>
    </main>
  );
}
