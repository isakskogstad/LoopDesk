;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="a4019f5b-99ea-014f-90f0-fd94a4a64c63")}catch(e){}}();
(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next-auth/react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/moon.js [app-client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
// Stable floating animation parameters (generated once)
const floatParams = [
    {
        speedX: 0.22,
        speedY: 0.18,
        amplitudeX: 3,
        amplitudeY: 4,
        phaseX: 0,
        phaseY: 1.05
    },
    {
        speedX: 0.28,
        speedY: 0.20,
        amplitudeX: 4,
        amplitudeY: 3,
        phaseX: 0.79,
        phaseY: 1.83
    },
    {
        speedX: 0.25,
        speedY: 0.16,
        amplitudeX: 3.5,
        amplitudeY: 4.5,
        phaseX: 1.57,
        phaseY: 2.62
    },
    {
        speedX: 0.30,
        speedY: 0.22,
        amplitudeX: 2.5,
        amplitudeY: 3.5,
        phaseX: 2.36,
        phaseY: 3.40
    },
    {
        speedX: 0.24,
        speedY: 0.19,
        amplitudeX: 4,
        amplitudeY: 3,
        phaseX: 3.14,
        phaseY: 4.19
    },
    {
        speedX: 0.26,
        speedY: 0.17,
        amplitudeX: 3,
        amplitudeY: 4,
        phaseX: 3.93,
        phaseY: 4.97
    },
    {
        speedX: 0.23,
        speedY: 0.21,
        amplitudeX: 3.5,
        amplitudeY: 3.5,
        phaseX: 4.71,
        phaseY: 5.76
    },
    {
        speedX: 0.27,
        speedY: 0.18,
        amplitudeX: 4,
        amplitudeY: 4,
        phaseX: 5.50,
        phaseY: 0.52
    }
];
const profiles = [
    {
        id: "andreas-jennische",
        name: "Andreas Jennische",
        firstName: "Andreas",
        role: "Nyhetschef och redaktör",
        image: "/avatars/andreas-jennische.png",
        provider: "google",
        loginHint: "andreas@loop.se"
    },
    {
        id: "johann-bernovall",
        name: "Johann Bernövall",
        firstName: "Johann",
        role: "Reporter och redaktör",
        image: "/avatars/johann-bernovall.png",
        provider: "google",
        loginHint: "johann@loop.se"
    },
    {
        id: "jenny-kjellen",
        name: "Jenny Kjellén",
        firstName: "Jenny",
        role: "Reporter",
        image: "/avatars/jenny-kjellen.png",
        provider: "google",
        loginHint: "jenny@loop.se"
    },
    {
        id: "camilla-bergman",
        name: "Camilla Bergman",
        firstName: "Camilla",
        role: "Chefredaktör och vd",
        image: "/avatars/camilla-bergman.png",
        provider: "google",
        loginHint: "camilla@loop.se"
    },
    {
        id: "diana-demin",
        name: "Diana Demin",
        firstName: "Diana",
        role: "CMO och Head of Expansion",
        image: "/avatars/diana-demin.png",
        provider: "google",
        loginHint: "diana@loop.se"
    },
    {
        id: "sandra-norberg",
        name: "Sandra Norberg",
        firstName: "Sandra",
        role: "Kommersiell chef",
        image: "/avatars/sandra-norberg.png",
        provider: "google",
        loginHint: "sandra@loop.se"
    },
    {
        id: "christian-von-essen",
        name: "Christian von Essen",
        firstName: "Christian",
        role: "Kommersiell redaktör",
        image: "/avatars/christian-von-essen.png",
        provider: "google",
        loginHint: "christian@loop.se"
    },
    {
        id: "isak-skogstad",
        name: "Isak Skogstad",
        firstName: "Isak",
        role: "Utvecklare",
        image: "/avatars/isak-skogstad.png",
        provider: "google",
        loginHint: "isak.skogstad@me.com"
    }
];
function getGreeting(name) {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) return `Godmorgon, ${name}!`;
    if (hour >= 9 && hour < 12) return `God förmiddag, ${name}!`;
    if (hour >= 12 && hour < 14) return `God dag, ${name}!`;
    if (hour >= 14 && hour < 18) return `God eftermiddag, ${name}!`;
    if (hour >= 18 && hour < 22) return `God kväll, ${name}!`;
    return `God natt, ${name}!`;
}
function LoginEntry() {
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedProfile, setSelectedProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoggingIn, setIsLoggingIn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loginPhase, setLoginPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [loadingStep, setLoadingStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        text: "Loggar in...",
        progress: 0
    });
    const [settingsOpen, setSettingsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDark, setIsDark] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const passwordInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const titleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const animationFrameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    // Layout state
    const [windowSize, setWindowSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        width: 0,
        height: 0
    });
    const [titleRect, setTitleRect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        width: 0,
        height: 0
    });
    const [mousePos, setMousePos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const [profilePositions, setProfilePositions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tiltAngles, setTiltAngles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [layoutReady, setLayoutReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Responsive breakpoints
    const isMobile = windowSize.width > 0 && windowSize.width <= 640;
    const isTablet = windowSize.width > 640 && windowSize.width <= 1024;
    // Dynamic avatar size based on viewport
    const avatarSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LoginEntry.useMemo[avatarSize]": ()=>{
            if (isMobile) return Math.min(Math.max(windowSize.width * 0.18, 56), 72);
            if (isTablet) return Math.min(Math.max(windowSize.width * 0.10, 70), 100);
            return Math.min(Math.max(windowSize.width * 0.08, 80), 120);
        }
    }["LoginEntry.useMemo[avatarSize]"], [
        windowSize.width,
        isMobile,
        isTablet
    ]);
    // Calculate orbit radius based on title size
    const orbitRadius = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LoginEntry.useMemo[orbitRadius]": ()=>{
            if (!titleRect.width || !titleRect.height) return 200;
            // Calculate diagonal of title bounding box
            const diagonal = Math.sqrt(titleRect.width ** 2 + titleRect.height ** 2);
            // Add padding between title and avatars
            const padding = avatarSize * 0.8;
            const baseRadius = diagonal / 2 + padding + avatarSize / 2;
            // Constrain to viewport
            const maxRadius = Math.min(windowSize.width, windowSize.height) * 0.42;
            const minRadius = avatarSize * 2.5;
            return Math.max(minRadius, Math.min(baseRadius, maxRadius));
        }
    }["LoginEntry.useMemo[orbitRadius]"], [
        titleRect,
        avatarSize,
        windowSize
    ]);
    // Initialize
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LoginEntry.useEffect": ()=>{
            setMounted(true);
            const saved = localStorage.getItem("theme");
            if (saved === "dark" || !saved && window.matchMedia("(prefers-color-scheme: dark)").matches) {
                setIsDark(true);
                document.documentElement.classList.add("dark");
            }
        }
    }["LoginEntry.useEffect"], []);
    // Handle window resize and title measurement
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LoginEntry.useEffect": ()=>{
            const updateLayout = {
                "LoginEntry.useEffect.updateLayout": ()=>{
                    setWindowSize({
                        width: window.innerWidth,
                        height: window.innerHeight
                    });
                    if (titleRef.current) {
                        const rect = titleRef.current.getBoundingClientRect();
                        setTitleRect({
                            width: rect.width,
                            height: rect.height
                        });
                    }
                }
            }["LoginEntry.useEffect.updateLayout"];
            updateLayout();
            // Delay to ensure fonts are loaded
            const timer = setTimeout({
                "LoginEntry.useEffect.timer": ()=>{
                    updateLayout();
                    setLayoutReady(true);
                }
            }["LoginEntry.useEffect.timer"], 100);
            window.addEventListener("resize", updateLayout);
            return ({
                "LoginEntry.useEffect": ()=>{
                    window.removeEventListener("resize", updateLayout);
                    clearTimeout(timer);
                }
            })["LoginEntry.useEffect"];
        }
    }["LoginEntry.useEffect"], [
        mounted
    ]);
    // Mouse tracking for parallax (desktop only)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LoginEntry.useEffect": ()=>{
            if (isMobile) return;
            const handleMouseMove = {
                "LoginEntry.useEffect.handleMouseMove": (e)=>{
                    setMousePos({
                        x: e.clientX,
                        y: e.clientY
                    });
                }
            }["LoginEntry.useEffect.handleMouseMove"];
            window.addEventListener("mousemove", handleMouseMove);
            return ({
                "LoginEntry.useEffect": ()=>window.removeEventListener("mousemove", handleMouseMove)
            })["LoginEntry.useEffect"];
        }
    }["LoginEntry.useEffect"], [
        isMobile
    ]);
    // Floating animation loop (desktop only)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LoginEntry.useEffect": ()=>{
            if (!mounted || !layoutReady || isMobile) {
                // Set static positions for mobile
                if (isMobile && layoutReady) {
                    setProfilePositions(profiles.map({
                        "LoginEntry.useEffect": ()=>({
                                x: 0,
                                y: 0
                            })
                    }["LoginEntry.useEffect"]));
                }
                return;
            }
            const centerX = windowSize.width / 2;
            const centerY = windowSize.height / 2;
            const updatePositions = {
                "LoginEntry.useEffect.updatePositions": (time)=>{
                    const mouseDeltaX = centerX > 0 ? (mousePos.x - centerX) / centerX : 0;
                    const mouseDeltaY = centerY > 0 ? (mousePos.y - centerY) / centerY : 0;
                    const newPositions = profiles.map({
                        "LoginEntry.useEffect.updatePositions.newPositions": (_, i)=>{
                            // Distribute evenly around circle, starting from top
                            const angle = i / profiles.length * Math.PI * 2 - Math.PI / 2;
                            // Base position on orbit
                            const baseX = centerX + Math.cos(angle) * orbitRadius;
                            const baseY = centerY + Math.sin(angle) * orbitRadius;
                            // Floating animation
                            const params = floatParams[i];
                            const floatX = Math.sin(time * 0.001 * params.speedX + params.phaseX) * params.amplitudeX;
                            const floatY = Math.cos(time * 0.001 * params.speedY + params.phaseY) * params.amplitudeY;
                            // Subtle parallax effect
                            const parallaxStrength = 12;
                            const parallaxX = mouseDeltaX * parallaxStrength * (i % 2 === 0 ? 1 : -0.5);
                            const parallaxY = mouseDeltaY * parallaxStrength * (i % 2 === 0 ? -0.5 : 1);
                            return {
                                x: baseX + floatX + parallaxX,
                                y: baseY + floatY + parallaxY
                            };
                        }
                    }["LoginEntry.useEffect.updatePositions.newPositions"]);
                    setProfilePositions(newPositions);
                    animationFrameRef.current = requestAnimationFrame(updatePositions);
                }
            }["LoginEntry.useEffect.updatePositions"];
            animationFrameRef.current = requestAnimationFrame(updatePositions);
            return ({
                "LoginEntry.useEffect": ()=>cancelAnimationFrame(animationFrameRef.current)
            })["LoginEntry.useEffect"];
        }
    }["LoginEntry.useEffect"], [
        mounted,
        layoutReady,
        mousePos,
        orbitRadius,
        windowSize,
        isMobile
    ]);
    const toggleTheme = ()=>{
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        document.documentElement.classList.toggle("dark", newIsDark);
        localStorage.setItem("theme", newIsDark ? "dark" : "light");
    };
    const handleProfileClick = (profile)=>{
        setSelectedProfile(profile);
        setPassword("");
        setError(null);
        setTimeout(()=>passwordInputRef.current?.focus(), 150);
    };
    const handleAvatarMouseMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LoginEntry.useCallback[handleAvatarMouseMove]": (e, profileId)=>{
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            setTiltAngles({
                "LoginEntry.useCallback[handleAvatarMouseMove]": (prev)=>({
                        ...prev,
                        [profileId]: {
                            rotateX: -(y / rect.height) * 15,
                            rotateY: x / rect.width * 15
                        }
                    })
            }["LoginEntry.useCallback[handleAvatarMouseMove]"]);
        }
    }["LoginEntry.useCallback[handleAvatarMouseMove]"], []);
    const handleAvatarMouseLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LoginEntry.useCallback[handleAvatarMouseLeave]": (profileId)=>{
            setTiltAngles({
                "LoginEntry.useCallback[handleAvatarMouseLeave]": (prev)=>({
                        ...prev,
                        [profileId]: {
                            rotateX: 0,
                            rotateY: 0
                        }
                    })
            }["LoginEntry.useCallback[handleAvatarMouseLeave]"]);
        }
    }["LoginEntry.useCallback[handleAvatarMouseLeave]"], []);
    const closeModal = ()=>{
        setSelectedProfile(null);
        setPassword("");
        setError(null);
        setLoginPhase("idle");
        setIsLoggingIn(false);
    };
    const showError = (message)=>{
        setError(message);
        setPassword("");
        passwordInputRef.current?.classList.add("animate-shake");
        setTimeout(()=>passwordInputRef.current?.classList.remove("animate-shake"), 500);
    };
    const runSuccessAnimation = async ()=>{
        setLoginPhase("shrinking");
        await new Promise((r)=>setTimeout(r, 300));
        setLoginPhase("loading");
        setLoadingStep({
            text: "Loggar in...",
            progress: 20
        });
        await new Promise((r)=>setTimeout(r, 400));
        setLoadingStep({
            text: "Ansluter...",
            progress: 70
        });
        await new Promise((r)=>setTimeout(r, 800));
        setLoadingStep({
            text: "Öppnar...",
            progress: 100
        });
        await new Promise((r)=>setTimeout(r, 400));
        setLoginPhase("welcome");
    };
    const handleLogin = async (e)=>{
        e.preventDefault();
        if (!selectedProfile || !password || isLoggingIn) return;
        setError(null);
        setIsLoggingIn(true);
        try {
            const checkRes = await fetch("/api/auth/check-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: selectedProfile.loginHint
                })
            });
            const checkData = await checkRes.json();
            if (!checkData.allowed) {
                showError(checkData.message);
                setIsLoggingIn(false);
                return;
            }
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signIn"])("credentials", {
                email: selectedProfile.loginHint,
                password,
                redirect: false,
                callbackUrl
            });
            if (result?.error) {
                const statusRes = await fetch("/api/auth/check-login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: selectedProfile.loginHint
                    })
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
                await runSuccessAnimation();
                window.location.assign(result.url);
            }
        } catch  {
            showError("Något gick fel. Försök igen.");
            setIsLoggingIn(false);
        }
    };
    const handleGoogleLogin = async ()=>{
        if (!selectedProfile) return;
        setIsLoggingIn(true);
        setLoginPhase("shrinking");
        await new Promise((r)=>setTimeout(r, 200));
        setLoginPhase("loading");
        setLoadingStep({
            text: "Förbereder...",
            progress: 30
        });
        await new Promise((r)=>setTimeout(r, 300));
        setLoadingStep({
            text: "Ansluter till Google...",
            progress: 70
        });
        await new Promise((r)=>setTimeout(r, 200));
        setLoadingStep({
            text: "Omdirigerar...",
            progress: 95
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signIn"])("google", {
            callbackUrl,
            ...selectedProfile.loginHint ? {
                login_hint: selectedProfile.loginHint
            } : {}
        });
    };
    if (!mounted) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative min-h-screen w-full overflow-hidden bg-background",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed inset-0 z-[300] flex items-center justify-center bg-background transition-opacity duration-300 ${loginPhase === "loading" || loginPhase === "welcome" ? "opacity-100" : "opacity-0 pointer-events-none"}`,
                children: [
                    loginPhase === "loading" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground font-mono tracking-wider",
                                children: loadingStep.text
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                lineNumber: 354,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-48 h-0.5 bg-border rounded-full overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-full bg-foreground rounded-full transition-all duration-300 ease-out",
                                    style: {
                                        width: `${loadingStep.progress}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 358,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                lineNumber: 357,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                        lineNumber: 353,
                        columnNumber: 11
                    }, this),
                    loginPhase === "welcome" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-3xl md:text-4xl font-bold tracking-tight font-mono animate-fade-in",
                        children: "Välkommen."
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                        lineNumber: 366,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                lineNumber: 349,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative min-h-screen flex items-center justify-center transition-opacity duration-300 ${loginPhase !== "idle" && loginPhase !== "shrinking" ? "opacity-0" : "opacity-100"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        ref: titleRef,
                        className: `absolute text-center font-mono font-bold leading-[0.85] tracking-[-0.04em] z-10 pointer-events-none select-none transition-all duration-300 ${selectedProfile ? "opacity-5 scale-95" : "opacity-100"}`,
                        style: {
                            fontSize: isMobile ? "clamp(48px, 18vw, 80px)" : isTablet ? "clamp(60px, 12vw, 100px)" : "clamp(80px, 10vw, 140px)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block animate-title-reveal",
                                style: {
                                    animationDelay: "0.2s"
                                },
                                children: "LOOP"
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                lineNumber: 391,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block animate-title-reveal",
                                style: {
                                    animationDelay: "0.4s"
                                },
                                children: "DESK"
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                lineNumber: 392,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                        lineNumber: 378,
                        columnNumber: 9
                    }, this),
                    !isMobile && layoutReady && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 z-20",
                        children: profiles.map((profile, index)=>{
                            const pos = profilePositions[index];
                            if (!pos) return null;
                            const tilt = tiltAngles[profile.id] || {
                                rotateX: 0,
                                rotateY: 0
                            };
                            const animDelay = 0.6 + index * 0.08;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleProfileClick(profile),
                                onMouseMove: (e)=>handleAvatarMouseMove(e, profile.id),
                                onMouseLeave: ()=>handleAvatarMouseLeave(profile.id),
                                className: "absolute flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer group animate-profile-enter",
                                style: {
                                    left: pos.x,
                                    top: pos.y,
                                    transform: "translate(-50%, -50%)",
                                    animationDelay: `${animDelay}s`,
                                    width: avatarSize
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative w-full aspect-square",
                                        style: {
                                            transformStyle: "preserve-3d",
                                            transform: `perspective(500px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                                            transition: "transform 0.15s ease-out"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: profile.image,
                                            alt: profile.name,
                                            fill: true,
                                            sizes: `${avatarSize}px`,
                                            className: "rounded-full object-cover grayscale group-hover:grayscale-0 group-focus:grayscale-0 transition-all duration-300 shadow-avatar group-hover:shadow-avatar-hover group-hover:scale-110",
                                            priority: index < 4
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                            lineNumber: 428,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                        lineNumber: 420,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-mono text-muted-foreground opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap",
                                        children: profile.firstName
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                        lineNumber: 437,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, profile.id, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                lineNumber: 406,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                        lineNumber: 397,
                        columnNumber: 11
                    }, this),
                    isMobile && layoutReady && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-[15vh] left-0 right-0 z-20 px-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-4 gap-4 max-w-sm mx-auto",
                            children: profiles.map((profile, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleProfileClick(profile),
                                    className: "flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer group animate-profile-enter",
                                    style: {
                                        animationDelay: `${0.4 + index * 0.05}s`
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative w-full aspect-square",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: profile.image,
                                                alt: profile.name,
                                                fill: true,
                                                sizes: "80px",
                                                className: "rounded-full object-cover grayscale active:grayscale-0 transition-all duration-300 shadow-avatar active:scale-95",
                                                priority: index < 4
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                                lineNumber: 458,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                            lineNumber: 457,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] font-mono text-muted-foreground truncate w-full text-center",
                                            children: profile.firstName
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                            lineNumber: 467,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, profile.id, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 451,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                            lineNumber: 449,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                        lineNumber: 448,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                lineNumber: 373,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setSettingsOpen(!settingsOpen),
                className: `fixed bottom-6 right-6 w-10 h-10 flex items-center justify-center z-50 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/50 transition-all duration-200 hover:bg-secondary ${settingsOpen ? "rotate-45" : ""}`,
                "aria-label": "Inställningar",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                    className: "w-4 h-4 text-muted-foreground"
                }, void 0, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                    lineNumber: 485,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                lineNumber: 478,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed bottom-20 right-6 flex flex-col gap-2 z-50 transition-all duration-200 ${settingsOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center p-2 bg-card border border-border rounded-lg shadow-lg",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: toggleTheme,
                            className: "relative w-12 h-7 bg-secondary rounded-full transition-colors",
                            "aria-label": "Växla tema",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                    className: "absolute left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground transition-opacity",
                                    style: {
                                        opacity: isDark ? 0.4 : 1
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 498,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                    className: "absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground transition-opacity",
                                    style: {
                                        opacity: isDark ? 1 : 0.4
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 499,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "absolute top-1 left-1 w-5 h-5 bg-card rounded-full shadow-sm transition-transform duration-200",
                                    style: {
                                        transform: isDark ? "translateX(20px)" : "translateX(0)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 500,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                            lineNumber: 493,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                        lineNumber: 492,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "mailto:isak.skogstad@me.com?subject=Support%20för%20LoopDesk",
                        className: "px-4 py-2 text-center font-mono text-xs text-muted-foreground bg-card border border-border rounded-lg shadow-lg hover:text-foreground transition-colors",
                        children: "Support"
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                        lineNumber: 506,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                lineNumber: 489,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${selectedProfile ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`,
                style: {
                    background: "var(--modal-backdrop)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)"
                },
                onClick: (e)=>e.target === e.currentTarget && closeModal(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: closeModal,
                        className: "absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors",
                        "aria-label": "Stäng",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "16",
                            height: "16",
                            viewBox: "0 0 16 16",
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: "2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M4 4L12 12M12 4L4 12"
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                lineNumber: 533,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                            lineNumber: 532,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                        lineNumber: 527,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex flex-col items-center gap-6 p-6 max-w-sm w-full mx-4 transition-all duration-300 ${loginPhase === "shrinking" ? "scale-90 opacity-0" : "scale-100 opacity-100"}`,
                        children: selectedProfile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative w-24 h-24 md:w-28 md:h-28",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: selectedProfile.image,
                                        alt: selectedProfile.name,
                                        fill: true,
                                        sizes: "112px",
                                        className: "rounded-full object-cover shadow-xl",
                                        priority: true
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                        lineNumber: 547,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 546,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl md:text-3xl font-bold tracking-tight font-mono text-center",
                                    children: getGreeting(selectedProfile.firstName)
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 558,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    onSubmit: handleLogin,
                                    className: "flex flex-col items-center gap-4 w-full",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative w-full",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                ref: passwordInputRef,
                                                type: "password",
                                                value: password,
                                                onChange: (e)=>{
                                                    setPassword(e.target.value);
                                                    setError(null);
                                                },
                                                placeholder: "••••••••",
                                                className: `w-full py-4 text-center font-mono text-lg tracking-[0.25em] bg-transparent border-b-2 border-border outline-none transition-all duration-200 focus:border-foreground placeholder:text-muted-foreground/30 ${error ? "border-destructive" : ""}`,
                                                autoComplete: "current-password"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                                lineNumber: 565,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                            lineNumber: 564,
                                            columnNumber: 17
                                        }, this),
                                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 text-sm text-destructive animate-fade-in",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                    className: "w-4 h-4 flex-shrink-0"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                                    lineNumber: 584,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: error
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                                    lineNumber: 585,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                            lineNumber: 583,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            disabled: !password || isLoggingIn,
                                            className: `w-full py-3.5 font-mono text-sm uppercase tracking-widest bg-foreground text-background rounded-lg transition-all duration-200 ${password && !isLoggingIn ? "opacity-100 hover:opacity-90 hover:shadow-lg active:scale-[0.98]" : "opacity-0 pointer-events-none"}`,
                                            children: isLoggingIn ? "Loggar in..." : "Logga in"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                            lineNumber: 590,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 563,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/forgot-password",
                                    className: "text-xs text-muted-foreground hover:text-foreground font-mono transition-colors",
                                    children: "Glömt lösenord?"
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 604,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative w-full flex items-center gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 h-px bg-border"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                            lineNumber: 613,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs uppercase tracking-widest text-muted-foreground font-mono",
                                            children: "eller"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                            lineNumber: 614,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 h-px bg-border"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                            lineNumber: 617,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 612,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: handleGoogleLogin,
                                    disabled: isLoggingIn,
                                    className: "flex items-center justify-center gap-3 w-full py-3 rounded-lg border border-border bg-card text-sm font-medium transition-all hover:bg-secondary hover:shadow-md active:scale-[0.98] disabled:opacity-50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "h-5 w-5",
                                            viewBox: "0 0 24 24",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z",
                                                    fill: "#4285F4"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                                    lineNumber: 628,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
                                                    fill: "#34A853"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                                    lineNumber: 629,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",
                                                    fill: "#FBBC05"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                                    lineNumber: 630,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
                                                    fill: "#EA4335"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                                    lineNumber: 631,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                            lineNumber: 627,
                                            columnNumber: 17
                                        }, this),
                                        "Fortsätt med Google"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                                    lineNumber: 621,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                        lineNumber: 538,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
                lineNumber: 515,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
        lineNumber: 344,
        columnNumber: 5
    }, this);
}
_s(LoginEntry, "GQt92Omg/Zj3jEed6lzS6MCCbos=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = LoginEntry;
function LoginPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: null,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoginEntry, {}, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
            lineNumber: 646,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/app/(auth)/login/page.tsx",
        lineNumber: 645,
        columnNumber: 5
    }, this);
}
_c1 = LoginPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "LoginEntry");
__turbopack_context__.k.register(_c1, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# debugId=a4019f5b-99ea-014f-90f0-fd94a4a64c63
//# sourceMappingURL=CLAUDE_projects_1_%20Loop%20Desk_src_app_%28auth%29_login_page_tsx_397b8959._.js.map