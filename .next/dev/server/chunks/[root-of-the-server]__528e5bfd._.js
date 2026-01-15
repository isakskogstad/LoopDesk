;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="c8437574-799d-0c3a-1ccf-fe6c17b0a4d4")}catch(e){}}();
module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "checkKeywordMatches",
    ()=>checkKeywordMatches,
    "createTitleHash",
    ()=>createTitleHash,
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/CLAUDE/projects/1. Loop Desk/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/@prisma/adapter-pg/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/CLAUDE/projects/1. Loop Desk/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const globalForPrisma = globalThis;
function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }
    // Create pg Pool for Supabase connection pooling
    const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$pg$29$__["Pool"]({
        connectionString
    });
    const adapter = new __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaPg"](pool);
    return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
        adapter,
        log: ("TURBOPACK compile-time truthy", 1) ? [
            "error",
            "warn"
        ] : "TURBOPACK unreachable"
    });
}
// Lazy initialization to avoid errors during build
let prismaInstance = null;
const prisma = new Proxy({}, {
    get (_target, prop) {
        if (!prismaInstance) {
            prismaInstance = globalForPrisma.prisma ?? createPrismaClient();
            if ("TURBOPACK compile-time truthy", 1) {
                globalForPrisma.prisma = prismaInstance;
            }
        }
        return prismaInstance[prop];
    }
});
function createTitleHash(title) {
    // Normalize title for comparison
    const normalized = title.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim().split(" ").slice(0, 6) // First 6 words
    .join(" ");
    // Simple hash function
    let hash = 0;
    for(let i = 0; i < normalized.length; i++){
        const char = normalized.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}
async function checkKeywordMatches(articleId, title, description) {
    const keywords = await prisma.keyword.findMany({
        where: {
            isActive: true
        }
    });
    for (const keyword of keywords){
        const term = keyword.term.toLowerCase();
        const titleLower = title.toLowerCase();
        const descLower = (description || "").toLowerCase();
        let matchedIn = null;
        if (titleLower.includes(term)) {
            matchedIn = "title";
        } else if (descLower.includes(term)) {
            matchedIn = "description";
        }
        if (matchedIn) {
            await prisma.keywordMatch.upsert({
                where: {
                    articleId_keywordId: {
                        articleId,
                        keywordId: keyword.id
                    }
                },
                create: {
                    articleId,
                    keywordId: keyword.id,
                    matchedIn
                },
                update: {}
            });
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/CLAUDE/projects/1. Loop Desk/src/lib/auth/rate-limit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "checkLoginAttempt",
    ()=>checkLoginAttempt,
    "getErrorMessage",
    ()=>getErrorMessage,
    "recordFailedAttempt",
    ()=>recordFailedAttempt,
    "recordSuccessfulLogin",
    ()=>recordSuccessfulLogin
]);
/**
 * Rate limiting and account lockout for authentication
 *
 * Rules:
 * - Max 5 failed attempts per minute (rate limit)
 * - Max 10 total failed attempts before account lockout
 * - Lockout duration: 15 minutes
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// In-memory store for rate limiting (per-minute tracking)
// In production, consider using Redis for distributed systems
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 5;
const MAX_FAILED_ATTEMPTS_BEFORE_LOCKOUT = 10;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
/**
 * Check if a login attempt is allowed based on rate limiting
 */ function checkRateLimit(email) {
    const now = Date.now();
    const key = email.toLowerCase();
    const record = rateLimitStore.get(key);
    if (!record) {
        rateLimitStore.set(key, {
            attempts: 1,
            windowStart: now
        });
        return {
            allowed: true
        };
    }
    // Check if we're in a new window
    if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.set(key, {
            attempts: 1,
            windowStart: now
        });
        return {
            allowed: true
        };
    }
    // Check if rate limit exceeded
    if (record.attempts >= MAX_ATTEMPTS_PER_WINDOW) {
        const retryAfterSeconds = Math.ceil((record.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
        return {
            allowed: false,
            retryAfterSeconds
        };
    }
    // Increment attempts
    record.attempts++;
    return {
        allowed: true
    };
}
/**
 * Reset rate limit for an email (called on successful login)
 */ function resetRateLimit(email) {
    rateLimitStore.delete(email.toLowerCase());
}
async function checkLoginAttempt(email) {
    // First check rate limit
    const rateLimitCheck = checkRateLimit(email);
    if (!rateLimitCheck.allowed) {
        return {
            allowed: false,
            error: "RATE_LIMITED",
            retryAfterSeconds: rateLimitCheck.retryAfterSeconds
        };
    }
    // Check if user exists and if account is locked
    try {
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email: email.toLowerCase()
            },
            select: {
                id: true,
                failedLoginAttempts: true,
                lockedUntil: true
            }
        });
        if (!user) {
            return {
                allowed: true
            }; // Let auth handle "user not found"
        }
        // Check if account is locked
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            const lockoutMinutes = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / (60 * 1000));
            return {
                allowed: false,
                error: "ACCOUNT_LOCKED",
                lockoutMinutes
            };
        }
        // If lock has expired, reset it
        if (user.lockedUntil && new Date(user.lockedUntil) <= new Date()) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
                where: {
                    id: user.id
                },
                data: {
                    failedLoginAttempts: 0,
                    lockedUntil: null
                }
            });
        }
        const remainingAttempts = MAX_FAILED_ATTEMPTS_BEFORE_LOCKOUT - (user.failedLoginAttempts || 0);
        return {
            allowed: true,
            remainingAttempts
        };
    } catch (error) {
        console.error("[RateLimit] Error checking login attempt:", error);
        return {
            allowed: true
        }; // Fail open - allow attempt if DB error
    }
}
async function recordFailedAttempt(email) {
    try {
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email: email.toLowerCase()
            },
            select: {
                id: true,
                failedLoginAttempts: true
            }
        });
        if (!user) {
            return {
                allowed: false,
                error: "ACCOUNT_NOT_FOUND"
            };
        }
        const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
        const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS_BEFORE_LOCKOUT;
        await __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
            where: {
                id: user.id
            },
            data: {
                failedLoginAttempts: newFailedAttempts,
                lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null
            }
        });
        if (shouldLock) {
            return {
                allowed: false,
                error: "ACCOUNT_LOCKED",
                lockoutMinutes: 15
            };
        }
        return {
            allowed: false,
            error: "INVALID_CREDENTIALS",
            remainingAttempts: MAX_FAILED_ATTEMPTS_BEFORE_LOCKOUT - newFailedAttempts
        };
    } catch (error) {
        console.error("[RateLimit] Error recording failed attempt:", error);
        return {
            allowed: false,
            error: "INVALID_CREDENTIALS"
        };
    }
}
async function recordSuccessfulLogin(email) {
    resetRateLimit(email);
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
            where: {
                email: email.toLowerCase()
            },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date()
            }
        });
    } catch (error) {
        console.error("[RateLimit] Error recording successful login:", error);
    }
}
function getErrorMessage(error, details) {
    switch(error){
        case "RATE_LIMITED":
            return `För många försök. Vänta ${details?.retryAfterSeconds || 60} sekunder.`;
        case "ACCOUNT_LOCKED":
            return `Kontot är låst i ${details?.lockoutMinutes || 15} minuter pga för många misslyckade försök.`;
        case "ACCOUNT_NOT_FOUND":
            return "Inget konto hittades med denna e-postadress.";
        case "INVALID_CREDENTIALS":
            if (details?.remainingAttempts !== undefined && details.remainingAttempts <= 3) {
                return `Fel lösenord. ${details.remainingAttempts} försök kvar innan kontot låses.`;
            }
            return "Fel e-postadress eller lösenord.";
        default:
            return "Något gick fel. Försök igen.";
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/CLAUDE/projects/1. Loop Desk/src/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "handlers",
    ()=>handlers,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next-auth/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$auth$2f$prisma$2d$adapter$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/@auth/prisma-adapter/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next-auth/node_modules/@auth/core/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next-auth/providers/google.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next-auth/node_modules/@auth/core/providers/google.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$auth$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/auth/rate-limit.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$auth$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$auth$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
// Whitelist of allowed email addresses
const ALLOWED_EMAILS = [
    "andreas@loop.se",
    "johann@loop.se",
    "jenny@loop.se",
    "camilla@loop.se",
    "diana@loop.se",
    "sandra@loop.se",
    "christian@loop.se",
    "isak.skogstad@me.com"
];
// Map email to avatar image
const EMAIL_TO_AVATAR = {
    "andreas@loop.se": "/avatars/andreas-jennische.png",
    "johann@loop.se": "/avatars/johann-bernovall.png",
    "jenny@loop.se": "/avatars/jenny-kjellen.png",
    "camilla@loop.se": "/avatars/camilla-bergman.png",
    "diana@loop.se": "/avatars/diana-demin.png",
    "sandra@loop.se": "/avatars/sandra-norberg.png",
    "christian@loop.se": "/avatars/christian-von-essen.png",
    "isak.skogstad@me.com": "/avatars/isak-skogstad.png"
};
const { handlers, signIn, signOut, auth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])({
    adapter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$auth$2f$prisma$2d$adapter$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaAdapter"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"]),
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    debug: ("TURBOPACK compile-time value", "development") === "development",
    logger: {
        error (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("CredentialsSignin")) {
                console.warn("[auth][warn] CredentialsSignin");
                return;
            }
            console.error("[auth][error]", error);
        }
    },
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Lösenord",
                    type: "password"
                }
            },
            authorize: async (credentials)=>{
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const email = credentials.email.toLowerCase();
                const password = credentials.password;
                // Check rate limiting and account lockout
                const loginCheck = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$auth$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkLoginAttempt"])(email);
                if (!loginCheck.allowed) {
                    console.warn(`[auth] Login blocked for ${email}: ${loginCheck.error}`);
                    return null;
                }
                const user = await __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                    where: {
                        email
                    }
                });
                if (!user || !user.passwordHash) {
                    // Record failed attempt even for non-existent users (timing attack prevention)
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$auth$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordFailedAttempt"])(email);
                    return null;
                }
                const isValid = await __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, user.passwordHash);
                if (!isValid) {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$auth$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordFailedAttempt"])(email);
                    return null;
                }
                // Successful login - reset counters
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$auth$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordSuccessfulLogin"])(email);
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role
                };
            }
        })
    ],
    callbacks: {
        async signIn ({ user, account }) {
            // Allow credentials login (admin) without email check
            if (account?.provider === "credentials") {
                return true;
            }
            // For OAuth providers, check whitelist
            if (user.email && ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
                // Set custom avatar based on email (no DB call needed)
                const customAvatar = EMAIL_TO_AVATAR[user.email.toLowerCase()];
                if (customAvatar) {
                    user.image = customAvatar;
                }
                return true;
            }
            // Reject if email not in whitelist
            return false;
        },
        async jwt ({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || "user";
                token.picture = user.image;
            }
            return token;
        },
        async session ({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.image = token.picture;
            }
            return session;
        }
    }
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/CLAUDE/projects/1. Loop Desk/src/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/auth.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const { GET, POST } = __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handlers"];
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# debugId=c8437574-799d-0c3a-1ccf-fe6c17b0a4d4
//# sourceMappingURL=%5Broot-of-the-server%5D__528e5bfd._.js.map