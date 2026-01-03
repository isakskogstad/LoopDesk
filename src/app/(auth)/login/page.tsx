"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
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
  const [loginLoading, setLoginLoading] = useState<"google" | "email" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Fel email eller lösenord");
      } else if (result?.url) {
        rememberProvider(selectedProfile.id, "google");
        window.location.href = result.url;
      }
    } catch {
      setError("Något gick fel");
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

      {/* Orbit med profiler */}
      {!selectedProfile && (
        <div className="absolute inset-0">
          {profiles.map((profile, index) => {
            const angle = (360 / profiles.length) * index - 90;
            const radius = typeof window !== 'undefined'
              ? Math.min(window.innerWidth, window.innerHeight) * 0.32
              : 300;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            const delay = 0.3 + index * 0.07;

            return (
              <button
                key={profile.id}
                onClick={() => handleProfileClick(profile)}
                className="absolute flex flex-col items-center bg-transparent border-none cursor-pointer transition-transform duration-500 hover:z-10"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  opacity: mounted ? 1 : 0,
                  animation: `fadeInProfile 0.8s ease-out ${delay}s forwards`,
                }}
              >
                <div className="relative w-[140px] h-[140px]">
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    sizes="140px"
                    className="object-contain transition-all duration-500 hover:scale-125"
                    style={{
                      filter: 'grayscale(100%) contrast(1.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'grayscale(0%) contrast(1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'grayscale(100%) contrast(1.05)';
                    }}
                  />
                </div>
                <span className="mt-[10px] font-[family-name:var(--font-space-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-muted-foreground opacity-0 -translate-y-[6px] transition-all duration-300 hover:opacity-100 hover:translate-y-0 hover:text-foreground">
                  {profile.firstName}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Förstorad profil med login-alternativ */}
      {selectedProfile && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#fafafa]/95 backdrop-blur-sm animate-in fade-in duration-500">
          <button
            type="button"
            onClick={handleBack}
            className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-[0.2em]">Tillbaka</span>
          </button>

          <div className="flex flex-col items-center gap-8">
            {/* Förstorad profil */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-40 w-40 overflow-hidden rounded-full bg-secondary shadow-2xl ring-4 ring-gray-200">
                <Image
                  src={selectedProfile.image}
                  alt={selectedProfile.name}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <p className="text-2xl font-medium text-foreground">{selectedProfile.firstName}</p>
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

              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                  {email}
                </div>
                <input
                  type="password"
                  placeholder="Ange ditt lösenord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-ring/40"
                  required
                  autoFocus
                />
                {error && (
                  <p className="text-xs text-red-500 text-center">{error}</p>
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
