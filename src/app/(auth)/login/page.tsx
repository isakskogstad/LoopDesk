"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2, Settings, X } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  firstName: string;
  role: string;
  image: string;
  provider: "google";
  loginHint?: string;
};

const profiles: Profile[] = [
  {
    id: "camilla-bergman",
    name: "Camilla Bergman",
    firstName: "Camilla",
    role: "Chefredaktör och vd",
    image: "/avatars/camilla-bergman.png",
    provider: "google",
    loginHint: "camilla@loop.se",
  },
  {
    id: "diana-demin",
    name: "Diana Demin",
    firstName: "Diana",
    role: "CMO och Head of Expansion",
    image: "/avatars/diana-demin.png",
    provider: "google",
    loginHint: "diana@loop.se",
  },
  {
    id: "christian-von-essen",
    name: "Christian von Essen",
    firstName: "Christian",
    role: "Kommersiell redaktör",
    image: "/avatars/christian-von-essen.png",
    provider: "google",
    loginHint: "christian@loop.se",
  },
  {
    id: "jenny-kjellen",
    name: "Jenny Kjellén",
    firstName: "Jenny",
    role: "Reporter",
    image: "/avatars/jenny-kjellen.png",
    provider: "google",
    loginHint: "jenny@loop.se",
  },
  {
    id: "andreas-jennische",
    name: "Andreas Jennische",
    firstName: "Andreas",
    role: "Nyhetschef och redaktör",
    image: "/avatars/andreas-jennische.png",
    provider: "google",
    loginHint: "andreas@loop.se",
  },
  {
    id: "johann-bernovall",
    name: "Johann Bernövall",
    firstName: "Johann",
    role: "Reporter och redaktör",
    image: "/avatars/johann-bernovall.png",
    provider: "google",
    loginHint: "johann@loop.se",
  },
  {
    id: "sandra-norberg",
    name: "Sandra Norberg",
    firstName: "Sandra",
    role: "Kommersiell chef",
    image: "/avatars/sandra-norberg.png",
    provider: "google",
    loginHint: "sandra@loop.se",
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
  const variant = searchParams.get("variant") || "1";
  const [isVisible, setIsVisible] = useState(false);
  const [stageReady, setStageReady] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);
  const [lastProfile, setLastProfile] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    const introTimer = setTimeout(() => setStageReady(true), 30);
    const timer = setTimeout(() => setIsVisible(true), 120);
    if (typeof window !== "undefined") {
      setLastProfile(localStorage.getItem("loopdesk-last-profile"));
    }
    return () => {
      clearTimeout(timer);
      clearTimeout(introTimer);
    };
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);
    try {
      const result = await signIn("credentials", {
        email: adminEmail,
        password: adminPassword,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setAdminError("Fel email eller lösenord");
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setAdminError("Något gick fel");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminGoogle = () => {
    setAdminLoading(true);
    signIn("google", { callbackUrl });
  };

  return (
    <div
      className={`mx-auto w-full max-w-6xl px-6 py-16 min-h-screen flex flex-col items-center justify-center gap-12 transition-opacity duration-700 ${
        stageReady ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center">
        <h1
          className={`text-6xl md:text-7xl lg:text-8xl font-semibold font-display text-gray-900 tracking-tight transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="block">LOOP</span>
          <span className="block">DESK</span>
        </h1>
      </div>

      {variant === "2" ? (
        <div className="w-full">
          <div className="hidden md:grid grid-cols-4 gap-8">
            {arrangedProfiles.map((profile, index) => {
              const isActive = profile.id === lastProfile;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleProfileSelect(profile)}
                  className={`flex flex-col items-center gap-4 rounded-3xl border bg-white/80 px-6 py-8 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                    isActive ? "border-gray-400" : "border-gray-200"
                  }`}
                  style={{
                    transitionDelay: `${index * 60}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? `translateY(0) scale(${isActive ? 1.06 : 1})` : "translateY(16px) scale(0.96)",
                  }}
                >
                  <span className="sr-only">{profile.name}</span>
                  <div className={`relative overflow-hidden rounded-full bg-gray-100 transition-all ${isActive ? "h-28 w-28" : "h-24 w-24"}`}>
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes={isActive ? "112px" : "96px"}
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    {profile.firstName}
                  </p>
                  {loadingProfile === profile.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="md:hidden grid grid-cols-2 gap-6">
            {arrangedProfiles.map((profile, index) => {
              const isActive = profile.id === lastProfile;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleProfileSelect(profile)}
                  className={`flex flex-col items-center gap-3 rounded-2xl border bg-white px-4 py-6 text-left shadow-sm transition-all hover:shadow-md ${
                    isActive ? "border-gray-400" : "border-gray-200"
                  }`}
                  style={{
                    transitionDelay: `${index * 60}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(10px)",
                  }}
                >
                  <span className="sr-only">{profile.name}</span>
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    {profile.firstName}
                  </p>
                  {loadingProfile === profile.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : variant === "3" ? (
        <div className="relative w-full max-w-5xl h-[520px]">
          {arrangedProfiles.map((profile, index) => {
            const isActive = profile.id === lastProfile;
            const positions = [
              { top: "8%", left: "18%" },
              { top: "12%", left: "58%" },
              { top: "32%", left: "8%" },
              { top: "38%", left: "68%" },
              { top: "62%", left: "16%" },
              { top: "66%", left: "70%" },
              { top: "78%", left: "42%" },
              { top: "24%", left: "42%" },
            ];
            const position = positions[index % positions.length];

            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleProfileSelect(profile)}
                className={`absolute flex flex-col items-center gap-2 rounded-full border bg-white/85 px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                  isActive ? "border-gray-400" : "border-gray-200"
                } float-slow`}
                style={{
                  top: position.top,
                  left: position.left,
                  transitionDelay: `${index * 80}ms`,
                  animationDelay: `${index * 0.4}s`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? `translateY(0) scale(${isActive ? 1.08 : 1})` : "translateY(14px) scale(0.96)",
                }}
              >
                <span className="sr-only">{profile.name}</span>
                <div className={`relative overflow-hidden rounded-full bg-gray-100 transition-all ${isActive ? "h-24 w-24" : "h-20 w-20"}`}>
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    sizes={isActive ? "96px" : "80px"}
                    className="object-cover"
                  />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  {profile.firstName}
                </p>
                {loadingProfile === profile.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className={`transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="hidden md:block">
            <div className="relative mx-auto h-[560px] w-[560px]">
              {arrangedProfiles.map((profile, index) => {
                const angle = (360 / arrangedProfiles.length) * index - 90;
                const radius = 235;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                const isActive = profile.id === lastProfile;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleProfileSelect(profile)}
                    className={`absolute left-1/2 top-1/2 flex flex-col items-center gap-2 rounded-full border bg-white/95 px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                      isActive
                        ? "border-gray-400"
                        : "border-gray-200"
                    }`}
                    style={{
                      transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                      transitionDelay: `${index * 60}ms`,
                      opacity: isVisible ? 1 : 0,
                      scale: isActive ? "1.08" : "1",
                    }}
                  >
                    <span className="sr-only">{profile.name}</span>
                    <div className={`relative overflow-hidden rounded-full bg-gray-100 transition-all ${isActive ? "h-24 w-24" : "h-20 w-20"}`}>
                      <Image
                        src={profile.image}
                        alt={profile.name}
                        fill
                        sizes={isActive ? "96px" : "80px"}
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      {profile.firstName}
                    </p>
                    {loadingProfile === profile.id && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:hidden grid grid-cols-2 gap-5">
            {arrangedProfiles.map((profile, index) => {
              const isActive = profile.id === lastProfile;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleProfileSelect(profile)}
                  className={`flex flex-col items-center justify-center rounded-2xl border bg-white px-4 py-5 text-left shadow-sm transition-all hover:shadow-md ${
                    isActive ? "border-gray-400" : "border-gray-200"
                  }`}
                  style={{
                    transitionDelay: `${index * 60}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(8px)",
                  }}
                >
                  <span className="sr-only">{profile.name}</span>
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-400">
                    {profile.firstName}
                  </p>
                  {loadingProfile === profile.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-500 shadow-sm transition-all hover:shadow-md hover:text-gray-700"
        aria-label="Admin"
      >
        <Settings className="h-4 w-4" />
      </button>

      {isAdminOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 p-6 md:items-center">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Admin</p>
              <button
                type="button"
                onClick={() => setIsAdminOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Stäng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <button
                type="button"
                onClick={handleAdminGoogle}
                disabled={adminLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {adminLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Logga in med Google
              </button>

              <form onSubmit={handleAdminLogin} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
                  required
                />
                <input
                  type="password"
                  placeholder="Losenord"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
                  required
                />
                {adminError && (
                  <p className="text-xs text-red-500">{adminError}</p>
                )}
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  {adminLoading ? "Loggar in..." : "Logga in"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
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
