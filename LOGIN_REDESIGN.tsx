"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

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
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const pendingRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const max = 18;
      const dx = (event.clientX - window.innerWidth / 2) / window.innerWidth;
      const dy = (event.clientY - window.innerHeight / 2) / window.innerHeight;
      pendingRef.current = { x: dx * max, y: dy * max };
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        setParallax(pendingRef.current);
        rafRef.current = null;
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const orbitStyle = useMemo(
    () =>
      ({
        ["--px" as string]: `${parallax.x}px`,
        ["--py" as string]: `${parallax.y}px`,
      }) as React.CSSProperties,
    [parallax],
  );

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
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

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
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
    <div className="login-stage">
      <div className="login-atmosphere" aria-hidden="true" />

      <h1
        className="login-title"
        style={{
          opacity: selectedProfile ? 0.15 : 1,
          transform: selectedProfile ? "scale(0.88)" : "scale(1)",
        }}
      >
        <span className="block">LOOP</span>
        <span className="block">DESK</span>
      </h1>

      {!selectedProfile && (
        <div className="orbit-shell" style={orbitStyle}>
          <div className="orbit-rotator">
            {profiles.map((profile, index) => {
              const angle = (360 / profiles.length) * index - 90;
              const radius = typeof window !== "undefined"
                ? Math.min(window.innerWidth, window.innerHeight) * 0.33
                : 320;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              const delay = 0.3 + index * 0.08;

              return (
                <button
                  key={profile.id}
                  onClick={() => handleProfileClick(profile)}
                  className="profile-orbit"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <div className="profile-orbit-ring" aria-hidden="true" />
                  <div className="profile-image">
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes="140px"
                      className="object-contain"
                    />
                  </div>
                  <span className="profile-label">{profile.firstName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedProfile && (
        <div className="login-overlay">
          <button
            type="button"
            onClick={handleBack}
            className="login-back"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="login-back-label">Tillbaka</span>
          </button>

          <div className="login-modal">
            <div className="login-profile">
              <div className="login-avatar">
                <Image
                  src={selectedProfile.image}
                  alt={selectedProfile.name}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <p className="text-2xl font-medium text-gray-900">
                  {selectedProfile.firstName}
                </p>
                <p className="login-role">{selectedProfile.role}</p>
              </div>
            </div>

            <div className="login-actions">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loginLoading === "google"}
                className="login-button login-button-google"
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

              <div className="login-divider">
                <span>eller</span>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  required
                />
                <input
                  type="password"
                  placeholder="Lösenord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  required
                />
                {error && (
                  <p className="text-xs text-red-500 text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loginLoading === "email"}
                  className="login-button login-button-primary"
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
        :root {
          --login-bg: #f6f3ef;
          --login-accent: #f9735b;
          --login-ink: #121212;
        }

        .login-stage {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          background: var(--login-bg);
          font-family: var(--font-dm-sans), -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-atmosphere {
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 20% 20%, rgba(255, 210, 186, 0.65), transparent 55%),
            radial-gradient(circle at 80% 30%, rgba(210, 220, 255, 0.6), transparent 58%),
            radial-gradient(circle at 40% 80%, rgba(255, 240, 210, 0.55), transparent 60%),
            linear-gradient(120deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0));
          filter: blur(10px);
          opacity: 0.9;
          pointer-events: none;
        }

        .login-stage::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E");
          opacity: 0.2;
          pointer-events: none;
          mix-blend-mode: multiply;
        }

        .login-title {
          position: absolute;
          text-align: center;
          font-family: var(--font-display), var(--font-geist-sans), serif;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 0.9;
          color: var(--login-ink);
          font-size: clamp(48px, 11vw, 120px);
          pointer-events: none;
          z-index: 2;
          transition: opacity 0.6s ease, transform 0.7s ease;
        }

        .orbit-shell {
          position: absolute;
          inset: 0;
          z-index: 3;
          transform: translate3d(var(--px), var(--py), 0);
          transition: transform 0.2s ease-out;
        }

        .orbit-rotator {
          position: absolute;
          inset: 0;
          animation: orbitFloat 18s ease-in-out infinite;
        }

        .profile-orbit {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          border: none;
          cursor: pointer;
          opacity: 0;
          animation: profileIn 0.9s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        .profile-orbit-ring {
          position: absolute;
          width: 168px;
          height: 168px;
          border-radius: 999px;
          border: 1px solid rgba(18, 18, 18, 0.08);
          box-shadow: 0 0 0 1px rgba(249, 115, 91, 0.2);
          opacity: 0;
          transition: opacity 0.4s ease, transform 0.4s ease;
          transform: scale(0.96);
        }

        .profile-orbit:hover .profile-orbit-ring {
          opacity: 1;
          transform: scale(1.02);
        }

        .profile-image {
          position: relative;
          width: 132px;
          height: 132px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 18px 35px rgba(18, 18, 18, 0.12);
          transition: transform 0.5s ease, box-shadow 0.5s ease;
          filter: grayscale(65%) contrast(1.05);
        }

        .profile-orbit:hover .profile-image {
          transform: scale(1.08);
          filter: grayscale(0%) contrast(1);
          box-shadow: 0 22px 45px rgba(18, 18, 18, 0.2);
        }

        .profile-label {
          margin-top: 12px;
          font-family: var(--font-space-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(18, 18, 18, 0.5);
          opacity: 0;
          transform: translateY(-8px);
          transition: opacity 0.3s ease, transform 0.3s ease, color 0.3s ease;
        }

        .profile-orbit:hover .profile-label {
          opacity: 1;
          transform: translateY(0);
          color: rgba(18, 18, 18, 0.85);
        }

        .login-overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(18px);
          background: rgba(247, 244, 240, 0.78);
          animation: overlayFade 0.35s ease forwards;
        }

        .login-back {
          position: absolute;
          top: 24px;
          left: 24px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(18, 18, 18, 0.6);
          transition: color 0.2s ease;
        }

        .login-back:hover {
          color: rgba(18, 18, 18, 0.9);
        }

        .login-back-label {
          font-family: var(--font-space-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .login-modal {
          width: min(420px, 90vw);
          padding: 36px 32px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow:
            0 35px 80px rgba(18, 18, 18, 0.18),
            inset 0 0 0 1px rgba(255, 255, 255, 0.6),
            0 0 30px rgba(249, 115, 91, 0.15);
          backdrop-filter: blur(24px);
          display: flex;
          flex-direction: column;
          gap: 28px;
          animation: modalPop 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .login-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .login-avatar {
          position: relative;
          height: 156px;
          width: 156px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0 24px 40px rgba(18, 18, 18, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .login-role {
          font-family: var(--font-space-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(18, 18, 18, 0.6);
        }

        .login-actions {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .login-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 16px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 600;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .login-button-google {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(18, 18, 18, 0.08);
          color: rgba(18, 18, 18, 0.8);
          box-shadow: 0 12px 24px rgba(18, 18, 18, 0.08);
        }

        .login-button-google:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 30px rgba(18, 18, 18, 0.12);
        }

        .login-button-primary {
          background: linear-gradient(135deg, #111111, #2a2a2a);
          color: #fff;
          box-shadow: 0 16px 30px rgba(18, 18, 18, 0.25);
        }

        .login-button-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 20px 40px rgba(18, 18, 18, 0.28);
        }

        .login-divider {
          position: relative;
          text-align: center;
          font-family: var(--font-space-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(18, 18, 18, 0.45);
        }

        .login-divider::before,
        .login-divider::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: rgba(18, 18, 18, 0.1);
        }

        .login-divider::before {
          left: 0;
        }

        .login-divider::after {
          right: 0;
        }

        .login-divider span {
          background: rgba(246, 243, 239, 0.9);
          padding: 0 10px;
        }

        .login-input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(18, 18, 18, 0.12);
          background: rgba(255, 255, 255, 0.85);
          padding: 12px 16px;
          font-size: 14px;
          color: rgba(18, 18, 18, 0.75);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
          transition: border 0.2s ease, box-shadow 0.2s ease;
        }

        .login-input:focus {
          outline: none;
          border-color: rgba(249, 115, 91, 0.45);
          box-shadow: 0 0 0 3px rgba(249, 115, 91, 0.15);
        }

        @keyframes profileIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.85);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes orbitFloat {
          0% {
            transform: scale(0.98);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(0.98);
          }
        }

        @keyframes overlayFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalPop {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.94);
          }
          60% {
            opacity: 1;
            transform: translateY(-4px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .login-title {
            font-size: clamp(42px, 18vw, 90px);
          }

          .profile-image {
            width: 110px;
            height: 110px;
          }

          .profile-orbit-ring {
            width: 140px;
            height: 140px;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginRedesignPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <LoginEntry />
      </Suspense>
    </main>
  );
}
