;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="2118cd0e-cbac-d324-1dd9-b6f3da95a21d")}catch(e){}}();
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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

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
"[project]/CLAUDE/projects/1. Loop Desk/src/app/api/person/names/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const dynamic = "force-dynamic";
const revalidate = 300; // Cache for 5 minutes
async function GET() {
    try {
        const persons = await __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].person.findMany({
            select: {
                id: true,
                name: true,
                allabolagId: true
            },
            orderBy: {
                name: "asc"
            }
        });
        // Build a map: name -> { id, allabolagId }
        const personMap = {};
        for (const person of persons){
            // Use the full name as key
            personMap[person.name] = {
                id: person.id,
                allabolagId: person.allabolagId
            };
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            persons: personMap,
            count: persons.length
        });
    } catch (error) {
        console.error("Error fetching person names:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch person names"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# debugId=2118cd0e-cbac-d324-1dd9-b6f3da95a21d
//# sourceMappingURL=%5Broot-of-the-server%5D__98ffa8f5._.js.map