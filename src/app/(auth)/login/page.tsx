"use client";

import Image from "next/image";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Sun, Moon, Settings } from "lucide-react";

// Floating animation parameters for each profile
const floatParams = Array.from({ length: 8 }, (_, i) => ({
  speedX: 0.2 + Math.random() * 0.2,
  speedY: 0.15 + Math.random() * 0.15,
  amplitudeX: 2 + Math.random() * 3,
  amplitudeY: 2 + Math.random() * 3,
  phaseX: (i / 8) * Math.PI * 2,
  phaseY: (i / 8) * Math.PI * 2 + Math.PI / 3,
  parallaxStrength: 0.008 + Math.random() * 0.012,
}));

type Profile = {
  id: string;
  name: string;
  firstName: string;
  role: string;
  image: string;
  provider: "google";
  loginHint?: string;
  radiusMultiplier?: number;
};

const profiles: Profile[] = [
  {
    id: "andreas-jennische",
    name: "Andreas Jennische",
    firstName: "Andreas",
    role: "Nyhetschef och redaktör",
    image: "/avatars/andreas-jennische.png",
    provider: "google",
    loginHint: "andreas@loop.se",
    radiusMultiplier: 0.75,
  },
  {
    id: "johann-bernovall",
    name: "Johann Bernövall",
    firstName: "Johann",
    role: "Reporter och redaktör",
    image: "/avatars/johann-bernovall.png",
    provider: "google",
    loginHint: "johann@loop.se",
    radiusMultiplier: 0.85,
  },
  {
    id: "jenny-kjellen",
    name: "Jenny Kjellén",
    firstName: "Jenny",
    role: "Reporter",
    image: "/avatars/jenny-kjellen.png",
    provider: "google",
    loginHint: "jenny@loop.se",
    radiusMultiplier: 0.92,
  },
  {
    id: "camilla-bergman",
    name: "Camilla Bergman",
    firstName: "Camilla",
    role: "Chefredaktör och vd",
    image: "/avatars/camilla-bergman.png",
    provider: "google",
    loginHint: "camilla@loop.se",
    radiusMultiplier: 0.85,
  },
  {
    id: "diana-demin",
    name: "Diana Demin",
    firstName: "Diana",
    role: "CMO och Head of Expansion",
    image: "/avatars/diana-demin.png",
    provider: "google",
    loginHint: "diana@loop.se",
    radiusMultiplier: 0.75,
  },
  {
    id: "sandra-norberg",
    name: "Sandra Norberg",
    firstName: "Sandra",
    role: "Kommersiell chef",
    image: "/avatars/sandra-norberg.png",
    provider: "google",
    loginHint: "sandra@loop.se",
    radiusMultiplier: 0.85,
  },
  {
    id: "christian-von-essen",
    name: "Christian von Essen",
    firstName: "Christian",
    role: "Kommersiell redaktör",
    image: "/avatars/christian-von-essen.png",
    provider: "google",
    loginHint: "christian@loop.se",
    radiusMultiplier: 0.92,
  },
  {
    id: "isak-skogstad",
    name: "Isak Skogstad",
    firstName: "Isak",
    role: "Utvecklare",
    image: "/avatars/isak-skogstad.png",
    provider: "google",
    loginHint: "isak.skogstad@me.com",
    radiusMultiplier: 0.85,
  },
];

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return `Godmorgon, ${name}!`;
  if (hour >= 9 && hour < 12) return `God förmiddag, ${name}!`;
  if (hour >= 12 && hour < 14) return `God dag, ${name}!`;
  if (hour >= 14 && hour < 18) return `God eftermiddag, ${name}!`;
  if (hour >= 18 && hour < 22) return `God kväll, ${name}!`;
  return `God natt, ${name}!`;
}

function LoginEntry() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/nyheter";

  const [mounted, setMounted] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginPhase, setLoginPhase] = useState<"idle" | "shrinking" | "loading" | "welcome">("idle");
  const [loadingStep, setLoadingStep] = useState({ text: "Loggar in...", progress: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Mouse tracking for parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [profilePositions, setProfilePositions] = useState<{ x: number; y: number }[]>([]);
  const [tiltAngles, setTiltAngles] = useState<{ [key: string]: { rotateX: number; rotateY: number } }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setMounted(true);
    // Check saved theme
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
    // Set initial window size
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    setIsMobile(window.innerWidth <= 700);
  }, []);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMobile(window.innerWidth <= 700);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calculate radius based on title size (matches HTML prototype)
  const getRadius = useCallback(() => {
    if (!titleRef.current) return 200;
    const titleRect = titleRef.current.getBoundingClientRect();
    const titleDiagonal = Math.sqrt(titleRect.width ** 2 + titleRect.height ** 2);
    const avatarSize = Math.min(Math.max(windowSize.width * 0.105, 83), 125);
    const padding = avatarSize * 0.7;
    const baseRadius = (titleDiagonal / 2) + padding + avatarSize / 2;
    const maxRadius = Math.min(windowSize.width, windowSize.height) * 0.42;
    return Math.min(baseRadius, maxRadius);
  }, [windowSize]);

  // Floating animation (desktop only)
  useEffect(() => {
    if (!mounted || isMobile) return;

    const updatePositions = (time: number) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const radius = getRadius();

      const mouseDeltaX = (mousePos.x - centerX) / centerX;
      const mouseDeltaY = (mousePos.y - centerY) / centerY;

      const newPositions = profiles.map((profile, i) => {
        const angle = (i / profiles.length) * Math.PI * 2 - Math.PI / 2;
        const userRadius = radius * (profile.radiusMultiplier || 1);
        const baseX = centerX + Math.cos(angle) * userRadius;
        const baseY = centerY + Math.sin(angle) * userRadius;

        const params = floatParams[i];
        const floatX = Math.sin(time * 0.001 * params.speedX + params.phaseX) * params.amplitudeX;
        const floatY = Math.cos(time * 0.001 * params.speedY + params.phaseY) * params.amplitudeY;

        const parallaxX = mouseDeltaX * 15 * params.parallaxStrength * (i % 2 === 0 ? 1 : -1);
        const parallaxY = mouseDeltaY * 15 * params.parallaxStrength * (i % 2 === 0 ? 1 : -1);

        return {
          x: baseX + floatX + parallaxX,
          y: baseY + floatY + parallaxY,
        };
      });

      setProfilePositions(newPositions);
      animationFrameRef.current = requestAnimationFrame(updatePositions);
    };

    animationFrameRef.current = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [mounted, mousePos, isMobile, getRadius]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
    setPassword("");
    setError(null);
    setShowPassword(false);
    setTimeout(() => passwordInputRef.current?.focus(), 300);
  };

  const handleAvatarMouseMove = useCallback((e: React.MouseEvent, profileId: string) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / rect.height) * 20;
    const rotateY = (x / rect.width) * 20;
    setTiltAngles(prev => ({ ...prev, [profileId]: { rotateX, rotateY } }));
  }, []);

  const handleAvatarMouseLeave = useCallback((profileId: string) => {
    setTiltAngles(prev => ({ ...prev, [profileId]: { rotateX: 0, rotateY: 0 } }));
  }, []);

  const closeModal = () => {
    setSelectedProfile(null);
    setPassword("");
    setError(null);
    setShowPassword(false);
    setLoginPhase("idle");
    setIsLoggingIn(false);
  };

  const showError = (message: string) => {
    setError(message);
    setPassword("");
    setShowPassword(false);
    // Trigger shake animation via state
    const input = passwordInputRef.current;
    if (input) {
      input.classList.add("animate-shake");
      setTimeout(() => input.classList.remove("animate-shake"), 500);
    }
  };

  const runSuccessAnimation = async () => {
    // Phase 1: Shrink modal
    setLoginPhase("shrinking");

    await new Promise(r => setTimeout(r, 400));

    // Phase 2: Show loading with steps
    setLoginPhase("loading");

    // Step 1: Loggar in (20%)
    setLoadingStep({ text: "Loggar in...", progress: 20 });
    await new Promise(r => setTimeout(r, 400));

    // Step 2: Ansluter (70%)
    setLoadingStep({ text: "Ansluter...", progress: 70 });
    await new Promise(r => setTimeout(r, 1000));

    // Step 3: Öppnar (100%)
    setLoadingStep({ text: "Öppnar...", progress: 100 });
    await new Promise(r => setTimeout(r, 600));

    // Phase 3: Welcome
    setLoginPhase("welcome");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !password || isLoggingIn) return;

    setError(null);
    setIsLoggingIn(true);

    try {
      // Check rate limiting
      const checkRes = await fetch("/api/auth/check-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedProfile.loginHint }),
      });
      const checkData = await checkRes.json();

      if (!checkData.allowed) {
        showError(checkData.message);
        setIsLoggingIn(false);
        return;
      }

      // Attempt login
      const result = await signIn("credentials", {
        email: selectedProfile.loginHint,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        const statusRes = await fetch("/api/auth/check-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedProfile.loginHint }),
        });
        const statusData = await statusRes.json();

        if (!statusData.allowed) {
          showError(statusData.message);
        } else if (statusData.remainingAttempts !== undefined && statusData.remainingAttempts <= 3) {
          showError(`Fel lösenord. ${statusData.remainingAttempts} försök kvar.`);
        } else {
          showError("Fel lösenord");
        }
        setIsLoggingIn(false);
      } else if (result?.url) {
        // Success - run animation then redirect
        await runSuccessAnimation();
        window.location.href = result.url;
      }
    } catch {
      showError("Något gick fel. Försök igen.");
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!selectedProfile) return;
    setIsLoggingIn(true);

    // Show loading indicator immediately
    setLoginPhase("shrinking");
    setLoadingStep({ text: "Ansluter till Google...", progress: 50 });

    // Start OAuth redirect immediately (don't wait for animation)
    signIn("google", {
      callbackUrl,
      ...(selectedProfile.loginHint ? { login_hint: selectedProfile.loginHint } : {}),
    });

    // Animation continues in background while redirect happens
    setTimeout(() => {
      setLoginPhase("loading");
    }, 200);
  };

  if (!mounted) return null;

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 500;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 400;

  return (
    <div className={`relative min-h-screen w-full overflow-hidden bg-background transition-colors duration-500 ${isMobile ? "login-container-mobile" : ""}`}>
      {/* Loading Indicator */}
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[300] flex flex-col items-center gap-6 transition-all duration-500 ${
        loginPhase === "loading" ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${loginPhase === "welcome" ? "-translate-y-[70%]" : ""}`}>
        <p className="text-sm text-muted-foreground font-[family-name:var(--font-space-mono)] tracking-wider">
          {loadingStep.text}
        </p>
        <div className="w-[200px] h-[2px] bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full transition-all duration-400 ease-out"
            style={{ width: `${loadingStep.progress}%` }}
          />
        </div>
      </div>

      {/* Welcome Screen */}
      <div className={`fixed inset-0 z-[250] flex items-center justify-center transition-opacity duration-500 ${
        loginPhase === "welcome" ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}>
        <h2 className={`text-3xl md:text-4xl font-bold tracking-tight font-[family-name:var(--font-space-mono)] transition-all duration-600 ${
          loginPhase === "welcome" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}>
          Välkommen.
        </h2>
      </div>

      {/* Title */}
      <h1
        ref={titleRef}
        className={`login-title text-center font-[family-name:var(--font-space-mono)] font-bold leading-[0.85] tracking-[-0.05em] z-[1] pointer-events-none overflow-hidden whitespace-nowrap transition-all duration-600 ${
          selectedProfile ? "opacity-[0.08] scale-95" : ""
        } ${isMobile ? "title-mobile" : ""}`}
        style={{ fontSize: isMobile ? "clamp(36px, 14vw, 72px)" : "clamp(38px, 9.5vw, 112px)" }}
      >
        <span className="block title-line" style={{ animationDelay: "0.3s" }}>LOOP</span>
        <span className="block title-line" style={{ animationDelay: "0.5s" }}>DESK</span>
      </h1>

      {/* Profiles */}
      <div className={`z-10 ${isMobile ? "profiles-container-mobile" : "absolute inset-0 pointer-events-none"}`}>
        {profiles.map((profile, index) => {
          const pos = profilePositions[index] || { x: centerX, y: centerY };
          const tilt = tiltAngles[profile.id] || { rotateX: 0, rotateY: 0 };
          const delay = isMobile ? 0.3 + index * 0.05 : 0.8 + index * 0.1;

          // Mobile: use grid positioning, Desktop: use absolute positioning
          const mobileStyle = isMobile ? {} : {
            left: pos.x,
            top: pos.y,
            transform: "translate(-50%, -50%)",
          };

          return (
            <button
              key={profile.id}
              onClick={() => handleProfileClick(profile)}
              onMouseMove={(e) => !isMobile && handleAvatarMouseMove(e, profile.id)}
              onMouseLeave={() => !isMobile && handleAvatarMouseLeave(profile.id)}
              className={`flex flex-col items-center gap-3 bg-transparent border-none cursor-pointer group pointer-events-auto ${
                isMobile ? "profile-mobile" : "absolute"
              }`}
              style={{
                ...mobileStyle,
                opacity: 0,
                animation: isMobile
                  ? `fadeInMobile 0.5s ease ${delay}s forwards`
                  : `fadeInProfile 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
                perspective: isMobile ? undefined : "500px",
              }}
            >
              <div
                className={`relative ${isMobile ? "profile-avatar-mobile" : "w-[clamp(83px,10.5vw,125px)] h-[clamp(83px,10.5vw,125px)]"}`}
                style={isMobile ? {} : {
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                  transition: "transform 0.1s ease-out",
                }}
              >
                <Image
                  src={profile.image}
                  alt={profile.name}
                  fill
                  sizes="125px"
                  className="rounded-full object-cover grayscale group-hover:grayscale-0 group-focus:grayscale-0 transition-all duration-500 profile-avatar-shadow"
                  style={{ background: "linear-gradient(135deg, #e5e5e5 0%, #d4d4d4 100%)" }}
                />
              </div>
              {!isMobile && (
                <span className="text-[clamp(9px,1.2vw,11px)] font-[family-name:var(--font-space-mono)] text-muted-foreground opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0 transition-all duration-300">
                  {profile.firstName}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setSettingsOpen(!settingsOpen)}
        className={`fixed bottom-6 right-6 w-10 h-10 flex items-center justify-center z-50 opacity-0 transition-all duration-300 hover:opacity-60 ${
          settingsOpen ? "opacity-80 rotate-45" : ""
        }`}
        style={{ animation: "fadeInSettings 0.6s ease 1.8s forwards" }}
      >
        <Settings className="w-5 h-5 text-foreground" />
      </button>

      {/* Settings Menu */}
      <div className={`fixed bottom-[74px] right-6 flex flex-col gap-2 z-50 transition-all duration-300 ${
        settingsOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}>
        <div className="flex items-center justify-center p-2.5 min-w-[80px] bg-background border border-border/20 rounded-md shadow-sm">
          <button
            onClick={toggleTheme}
            className="relative w-12 h-[26px] bg-muted rounded-full cursor-pointer transition-colors"
          >
            <Sun className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground transition-opacity duration-300" style={{ opacity: isDark ? 0.4 : 1 }} />
            <Moon className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground transition-opacity duration-300" style={{ opacity: isDark ? 1 : 0.4 }} />
            <span
              className="absolute top-[3px] left-[3px] w-5 h-5 bg-background rounded-full shadow-md transition-transform duration-300"
              style={{ transform: isDark ? "translateX(22px)" : "translateX(0)" }}
            />
          </button>
        </div>
        <a
          href="mailto:isak.skogstad@me.com?subject=Support%20för%20LoopDesk"
          className="px-4 py-2.5 min-w-[80px] text-center font-[family-name:var(--font-space-mono)] text-[11px] text-muted-foreground bg-background border border-border/20 rounded-md shadow-sm hover:text-foreground hover:border-border/40 transition-all"
        >
          Support
        </a>
      </div>

      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-400 ${
          selectedProfile ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{
          background: isDark ? "rgba(10, 10, 10, 0.92)" : "rgba(250, 250, 250, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-8 right-8 w-12 h-12 opacity-30 hover:opacity-100 transition-opacity"
        >
          <span className="absolute top-1/2 left-1/2 w-6 h-[1px] bg-foreground -translate-x-1/2 -translate-y-1/2 rotate-45" />
          <span className="absolute top-1/2 left-1/2 w-6 h-[1px] bg-foreground -translate-x-1/2 -translate-y-1/2 -rotate-45" />
        </button>

        {/* Modal Content */}
        <div
          ref={modalRef}
          className={`flex flex-col items-center gap-6 p-5 transition-all duration-600 ${
            loginPhase === "shrinking" || loginPhase === "loading" || loginPhase === "welcome"
              ? "scale-0 opacity-0"
              : "scale-100 opacity-100"
          }`}
        >
          {selectedProfile && (
            <>
              {/* Avatar */}
              <div
                className="w-[clamp(80px,12vw,110px)] h-[clamp(80px,12vw,110px)] relative rounded-full"
                style={{ background: "linear-gradient(135deg, #e5e5e5 0%, #d4d4d4 100%)" }}
              >
                <Image
                  src={selectedProfile.image}
                  alt={selectedProfile.name}
                  fill
                  sizes="110px"
                  className="rounded-full object-cover shadow-xl"
                />
              </div>

              {/* Greeting */}
              <h2 className="text-[clamp(20px,4vw,28px)] font-bold tracking-tight font-[family-name:var(--font-space-mono)]">
                {getGreeting(selectedProfile.firstName)}
              </h2>

              {/* Password Form */}
              <form onSubmit={handleLogin} className="flex flex-col items-center gap-4 w-full max-w-[260px]">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className={`w-full py-4 text-center font-[family-name:var(--font-space-mono)] text-base tracking-[0.3em] bg-transparent border-0 border-b-2 border-[#e5e5e5] dark:border-[#404040] outline-none transition-all duration-300 focus:border-foreground placeholder:text-[#d4d4d4] placeholder:tracking-[0.1em] ${
                    error ? "border-destructive animate-pulse-red" : ""
                  }`}
                  autoComplete="current-password"
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!password || isLoggingIn}
                  className={`px-12 py-3.5 font-[family-name:var(--font-space-mono)] text-[11px] uppercase tracking-[0.15em] bg-foreground text-background border-none cursor-pointer transition-all duration-500 submit-btn ${
                    password
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto hover:-translate-y-0.5 hover:scale-[1.02]"
                      : "opacity-0 translate-y-4 scale-90 pointer-events-none"
                  } disabled:opacity-50`}
                >
                  {isLoggingIn ? "Loggar in..." : "Logga in"}
                </button>

                {/* Error Message */}
                <p className={`text-xs text-destructive transition-all duration-400 ${
                  error ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                }`}>
                  {error || "\u00A0"}
                </p>
              </form>

              {/* Divider */}
              <div className="relative w-full max-w-[260px] flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-[family-name:var(--font-space-mono)]">
                  eller
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="flex items-center justify-center gap-3 w-full max-w-[260px] px-6 py-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground shadow-sm transition-all hover:bg-secondary/60 hover:shadow-md disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Fortsätt med Google
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        /* Title positioning */
        .login-title {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -60%);
        }

        /* Title reveal animation */
        .title-line {
          display: block;
          opacity: 0;
          filter: blur(20px);
          transform: scale(0.9);
          animation: revealLine 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes revealLine {
          to {
            opacity: 1;
            filter: blur(0);
            transform: scale(1);
          }
        }

        @keyframes fadeInProfile {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes fadeInMobile {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes fadeInSettings {
          to { opacity: 0.3; }
        }

        /* Profile avatar shadow and hover glow */
        .profile-avatar-shadow {
          box-shadow:
            0 4px 20px rgba(0,0,0,0.1),
            0 8px 40px rgba(0,0,0,0.08);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      filter 0.5s ease;
        }

        .group:hover .profile-avatar-shadow,
        .group:focus .profile-avatar-shadow {
          box-shadow:
            0 0 40px rgba(120, 120, 120, 0.3),
            0 0 80px rgba(100, 100, 100, 0.15),
            0 12px 40px rgba(0,0,0,0.18);
          transform: scale(1.1);
        }

        /* Submit button styling */
        .submit-btn:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.25);
        }

        :root.dark .submit-btn:hover,
        .dark .submit-btn:hover {
          box-shadow: 0 4px 20px rgba(255,255,255,0.15);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }

        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes pulseRed {
          0% { border-color: var(--destructive); box-shadow: 0 2px 0 0 var(--destructive), 0 0 20px rgba(220, 38, 38, 0.4); }
          100% { border-color: #e5e5e5; box-shadow: none; }
        }

        :root.dark .animate-pulse-red,
        .dark .animate-pulse-red {
          animation: pulseRedDark 1s ease-out forwards;
        }

        @keyframes pulseRedDark {
          0% { border-color: var(--destructive); box-shadow: 0 2px 0 0 var(--destructive), 0 0 20px rgba(220, 38, 38, 0.4); }
          100% { border-color: #404040; box-shadow: none; }
        }

        .animate-pulse-red {
          animation: pulseRed 1s ease-out forwards;
        }

        /* Mobile Layout */
        .login-container-mobile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 15vh;
          gap: 8vh;
        }

        .login-container-mobile .login-title {
          position: relative;
          left: auto;
          top: auto;
          transform: none;
        }

        .login-container-mobile .login-title.opacity-\\[0\\.08\\] {
          opacity: 0.15 !important;
        }

        .profiles-container-mobile {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 0 24px;
          max-width: 400px;
          pointer-events: auto;
        }

        .profile-mobile {
          position: relative !important;
        }

        .profile-avatar-mobile {
          width: clamp(56px, 16vw, 80px);
          height: clamp(56px, 16vw, 80px);
        }

        /* Very small screens: 2 columns */
        @media (max-width: 380px) {
          .profiles-container-mobile {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            max-width: 200px;
          }

          .profile-avatar-mobile {
            width: 70px;
            height: 70px;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginEntry />
    </Suspense>
  );
}
