"use client";

import Image from "next/image";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

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
  {
    id: "isak-skogstad",
    name: "Isak Skogstad",
    firstName: "Isak",
    role: "Utvecklare",
    image: "/avatars/isak-skogstad.png",
    provider: "google",
    loginHint: "isak.skogstad@me.com",
  },
];

// Pre-fill email when profile is selected
const getProfileEmail = (profile: Profile): string => {
  return profile.loginHint || "";
};

function rememberProvider(profileId: string, provider: Profile["provider"]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`loopdesk-provider:${profileId}`, provider);
  localStorage.setItem("loopdesk-last-profile", profileId);
}

function LoginEntry() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/nyheter";
  const [mounted, setMounted] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loginLoading, setLoginLoading] = useState<"google" | "email" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const profileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedProfile) return; // Don't navigate when profile is selected

    const key = e.key;
    const total = profiles.length;

    if (key === "ArrowRight" || key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % total);
    } else if (key === "ArrowLeft" || key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + total) % total);
    } else if (key === "Enter" || key === " ") {
      e.preventDefault();
      const profile = profiles[focusedIndex];
      if (profile) {
        handleProfileClick(profile);
      }
    } else if (key === "Escape" && selectedProfile) {
      e.preventDefault();
      handleBack();
    }
  }, [selectedProfile, focusedIndex]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus the current profile button
  useEffect(() => {
    if (!selectedProfile && mounted) {
      profileRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, selectedProfile, mounted]);

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
    setEmail(getProfileEmail(profile));
    setError(null);
  };

  const handleBack = () => {
    setSelectedProfile(null);
    setEmail("");
    setPassword("");
    setError(null);
    setRemainingAttempts(null);
  };

  const handleGoogleLogin = () => {
    if (!selectedProfile) return;
    rememberProvider(selectedProfile.id, "google");
    setLoginLoading("google");
    signIn("google", {
      callbackUrl,
      ...(selectedProfile.loginHint ? { login_hint: selectedProfile.loginHint } : {}),
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    setError(null);
    setLoginLoading("email");

    try {
      // First check if login is allowed (rate limiting)
      const checkRes = await fetch("/api/auth/check-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkRes.json();

      if (!checkData.allowed) {
        setError(checkData.message);
        setLoginLoading(null);
        return;
      }

      // Attempt login
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        // Fetch updated status to show remaining attempts
        const statusRes = await fetch("/api/auth/check-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const statusData = await statusRes.json();

        if (!statusData.allowed) {
          setError(statusData.message);
        } else if (statusData.remainingAttempts !== undefined && statusData.remainingAttempts <= 3) {
          setError(`Fel lösenord. ${statusData.remainingAttempts} försök kvar.`);
          setRemainingAttempts(statusData.remainingAttempts);
        } else {
          setError("Fel e-postadress eller lösenord");
        }
      } else if (result?.url) {
        rememberProvider(selectedProfile.id, "google");
        window.location.href = result.url;
      }
    } catch {
      setError("Något gick fel. Försök igen.");
    } finally {
      setLoginLoading(null);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Titel - döljs inte när profil är vald */}
      <h1 className="absolute text-center font-[family-name:var(--font-space-mono)] font-bold leading-[0.9] tracking-[-0.04em] text-foreground pointer-events-none z-10 transition-all duration-700"
          style={{
            fontSize: 'clamp(48px, 12vw, 120px)',
            opacity: selectedProfile ? 0.2 : 1,
            transform: selectedProfile ? 'scale(0.8)' : 'scale(1)'
          }}>
        <span className="block">LOOP</span>
        <span className="block">DESK</span>
      </h1>

      {/* Keyboard hint */}
      {!selectedProfile && mounted && (
        <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 font-[family-name:var(--font-space-mono)] tracking-wider animate-in fade-in duration-1000 delay-1000">
          <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded border border-border/50 text-[10px]">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-secondary/50 rounded border border-border/50 text-[10px] mx-1">→</kbd>
          för att välja
        </p>
      )}

      {/* Orbit med profiler */}
      {!selectedProfile && (
        <div
          className="absolute inset-0"
          role="listbox"
          aria-label="Välj användare för inloggning"
          aria-activedescendant={`profile-${profiles[focusedIndex]?.id}`}
        >
          {profiles.map((profile, index) => {
            const angle = (360 / profiles.length) * index - 90;
            const radius = typeof window !== 'undefined'
              ? Math.min(window.innerWidth, window.innerHeight) * 0.32
              : 300;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            const delay = 0.3 + index * 0.07;
            const isFocused = focusedIndex === index;

            return (
              <button
                key={profile.id}
                id={`profile-${profile.id}`}
                ref={(el) => { profileRefs.current[index] = el; }}
                onClick={() => handleProfileClick(profile)}
                onFocus={() => setFocusedIndex(index)}
                role="option"
                aria-selected={isFocused}
                aria-label={`${profile.name}, ${profile.role}`}
                className={`absolute flex flex-col items-center bg-transparent border-none cursor-pointer transition-transform duration-500 hover:z-10 focus:z-10 focus:outline-none ${isFocused ? 'z-10' : ''}`}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  opacity: mounted ? 1 : 0,
                  animation: `fadeInProfile 0.8s ease-out ${delay}s forwards`,
                }}
              >
                <div className={`relative w-[140px] h-[140px] rounded-full transition-all duration-300 ${isFocused ? 'ring-4 ring-primary/50' : ''}`}>
                  <Image
                    src={profile.image}
                    alt=""
                    fill
                    sizes="140px"
                    className={`object-contain transition-all duration-500 hover:scale-125 ${isFocused ? 'scale-110' : ''}`}
                    style={{
                      filter: isFocused ? 'grayscale(0%) contrast(1)' : 'grayscale(100%) contrast(1.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'grayscale(0%) contrast(1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isFocused) {
                        e.currentTarget.style.filter = 'grayscale(100%) contrast(1.05)';
                      }
                    }}
                  />
                </div>
                <span className={`mt-[10px] font-[family-name:var(--font-space-mono)] text-[10px] font-normal uppercase tracking-[0.2em] transition-all duration-300 ${isFocused ? 'opacity-100 translate-y-0 text-foreground' : 'text-muted-foreground opacity-0 -translate-y-[6px] hover:opacity-100 hover:translate-y-0 hover:text-foreground'}`}>
                  {profile.firstName}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Förstorad profil med login-alternativ */}
      {selectedProfile && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#fafafa]/95 backdrop-blur-sm animate-in fade-in duration-500"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-dialog-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              handleBack();
            }
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            aria-label="Tillbaka till profilval"
            className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-[0.2em]">Tillbaka</span>
          </button>

          <div className="flex flex-col items-center gap-8">
            {/* Förstorad profil */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-40 w-40 overflow-hidden rounded-full bg-secondary shadow-2xl ring-4 ring-gray-200">
                <Image
                  src={selectedProfile.image}
                  alt={`Profilbild för ${selectedProfile.name}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <h2 id="login-dialog-title" className="text-2xl font-medium text-foreground">{selectedProfile.firstName}</h2>
                <p className="text-sm text-muted-foreground font-[family-name:var(--font-space-mono)] tracking-wide">{selectedProfile.role}</p>
              </div>
            </div>

            {/* Login-alternativ */}
            <div className="w-full max-w-sm space-y-3 px-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loginLoading === "google"}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-secondary/60 hover:shadow-md disabled:opacity-50"
              >
                {loginLoading === "google" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                Fortsätt med Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#fafafa] px-2 text-muted-foreground font-[family-name:var(--font-space-mono)] uppercase tracking-widest">eller</span>
                </div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3" aria-label="Inloggningsformulär">
                <div
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground"
                  aria-label={`E-postadress: ${email}`}
                >
                  {email}
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Lösenord</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Ange ditt lösenord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-ring/40"
                    required
                    autoFocus
                    aria-describedby={error ? "login-error" : undefined}
                    aria-invalid={error ? "true" : undefined}
                  />
                </div>
                {error && (
                  <p id="login-error" role="alert" className="text-xs text-red-500 text-center">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loginLoading === "email"}
                  className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50"
                >
                  {loginLoading === "email" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loggar in...
                    </span>
                  ) : (
                    "Logga in"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInProfile {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Suspense fallback={null}>
        <LoginEntry />
      </Suspense>
    </main>
  );
}
