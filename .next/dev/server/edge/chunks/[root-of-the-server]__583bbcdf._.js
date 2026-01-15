(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__583bbcdf._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
// Routes that are accessible without authentication
const publicPaths = [
    "/login",
    "/register",
    "/person",
    "/bolag",
    "/auth",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
    "/auth/reset-complete"
];
// Routes that logged-in users should be redirected away from
const authPaths = [
    "/login",
    "/register"
];
function middleware(request) {
    const { pathname } = request.nextUrl;
    // Check for session cookie (Auth.js uses these cookie names)
    const sessionCookie = request.cookies.get("authjs.session-token") || request.cookies.get("__Secure-authjs.session-token");
    const isLoggedIn = !!sessionCookie;
    // Always allow auth API routes, health check, and public endpoints
    if (pathname.startsWith("/api/auth") || pathname === "/api/health" || pathname.startsWith("/api/debug") || pathname === "/api/bevakning/seed" || pathname.startsWith("/api/bevakning/enrich") || pathname.startsWith("/api/investors") || pathname === "/api/cron/refresh" || pathname === "/api/feed/global" || pathname === "/api/sources" || pathname === "/api/article" || pathname === "/api/person/names" || pathname.startsWith("/api/person/") || pathname === "/api/bolag/company-names" || pathname.startsWith("/api/bolag/") || pathname.startsWith("/api/media/") || pathname === "/api/chat" || pathname === "/api/config/supabase") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Protect all other API routes
    if (pathname.startsWith("/api")) {
        if (!isLoggedIn) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Check path types
    const isPublicPath = publicPaths.some((path)=>pathname === path || pathname.startsWith(path + "/"));
    const isAuthPath = authPaths.some((path)=>pathname === path || pathname.startsWith(path + "/"));
    // Redirect logged-in users away from auth pages (login/register)
    if (isLoggedIn && isAuthPath) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/nyheter", request.url));
    }
    // Redirect non-logged-in users to login for protected routes
    if (!isLoggedIn && !isPublicPath) {
        const loginUrl = new URL("/login", request.url);
        if (pathname !== "/") {
            loginUrl.searchParams.set("callbackUrl", pathname);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    response.headers.set("X-Middleware-Active", "true");
    return response;
}
const config = {
    matcher: [
        /*
     * Match all request paths except static files
     */ "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|avatars/|logos/).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__583bbcdf._.js.map