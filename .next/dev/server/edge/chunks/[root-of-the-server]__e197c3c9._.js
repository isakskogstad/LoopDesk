(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__e197c3c9._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[project]/CLAUDE/projects/1. Loop Desk/sentry.edge.config.ts [instrumentation-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$edge$2f$index$2e$js__$5b$instrumentation$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/@sentry/nextjs/build/esm/edge/index.js [instrumentation-edge] (ecmascript) <locals>");
;
__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$sentry$2f$nextjs$2f$build$2f$esm$2f$edge$2f$index$2e$js__$5b$instrumentation$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["init"]({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // Adjust for production (e.g., 0.1 = 10% of transactions)
    tracesSampleRate: 0.1,
    // Filter out noisy errors
    ignoreErrors: [
        // Network errors
        'Network request failed',
        'Failed to fetch',
        'NetworkError'
    ]
});
}),
"[project]/CLAUDE/projects/1. Loop Desk/instrumentation.ts [instrumentation-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "register",
    ()=>register
]);
globalThis["_sentryNextJsVersion"] = "16.1.1";
async function register() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ("TURBOPACK compile-time truthy", 1) {
        await Promise.resolve().then(()=>__turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/sentry.edge.config.ts [instrumentation-edge] (ecmascript)"));
    }
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__e197c3c9._.js.map