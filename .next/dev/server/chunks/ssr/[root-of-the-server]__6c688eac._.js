;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="fbcfc0b6-7bb8-65b0-05c4-c859216046bd")}catch(e){}}();
module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

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
"[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "formatAmount",
    ()=>formatAmount,
    "formatDate",
    ()=>formatDate,
    "formatMSEK",
    ()=>formatMSEK,
    "formatOrgNr",
    ()=>formatOrgNr,
    "formatPublicationTime",
    ()=>formatPublicationTime,
    "formatRelativeTime",
    ()=>formatRelativeTime,
    "parseDate",
    ()=>parseDate,
    "stripHtml",
    ()=>stripHtml
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function formatRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just nu";
    if (diffMins < 60) return `${diffMins} min sedan`;
    if (diffHours < 24) return `${diffHours} tim sedan`;
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    return then.toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "short",
        year: diffDays > 365 ? "numeric" : undefined
    });
}
function formatPublicationTime(date) {
    const now = new Date();
    const then = new Date(date);
    // Check if valid date
    if (isNaN(then.getTime())) {
        return "";
    }
    const isToday = then.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === then.toDateString();
    const timeStr = then.toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit"
    });
    if (isToday) {
        return timeStr;
    }
    if (isYesterday) {
        return `Igår ${timeStr}`;
    }
    // Within last 7 days - show weekday + time
    const diffDays = Math.floor((now.getTime() - then.getTime()) / 86400000);
    if (diffDays < 7) {
        const weekday = then.toLocaleDateString("sv-SE", {
            weekday: "short"
        });
        return `${weekday} ${timeStr}`;
    }
    // Older - show date + time
    return then.toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "short"
    }) + ` ${timeStr}`;
}
function formatOrgNr(orgNr) {
    const clean = orgNr.replace(/\D/g, "");
    if (clean.length === 10) return `${clean.slice(0, 6)}-${clean.slice(6)}`;
    return orgNr;
}
function formatAmount(value) {
    if (value === undefined || value === null || value === "") return "-";
    const strValue = String(value);
    const isNegative = strValue.startsWith("-") || strValue.includes("−");
    const numStr = strValue.replace(/[^\d]/g, "");
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return strValue;
    const sign = isNegative ? "-" : "";
    if (num >= 1000) {
        return `${sign}${(num / 1000).toFixed(0)} MSEK`;
    }
    return `${sign}${num} TSEK`;
}
function formatMSEK(value, decimals = 1) {
    if (value === undefined || value === null) return "-";
    return `${(value / 1_000_000).toFixed(decimals)} MSEK`;
}
function stripHtml(value) {
    if (!value) return "";
    return value.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
function parseDate(dateStr) {
    if (!dateStr) return null;
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;
    const parts = dateStr.split(/[.\-\/]/);
    if (parts.length === 3) {
        if (parts[0].length === 4) {
            date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
            date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        if (!isNaN(date.getTime())) return date;
    }
    return null;
}
function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = parseDate(dateStr);
    if (!date) return dateStr;
    return date.toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
            destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "border border-border bg-transparent hover:bg-secondary hover:text-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
            ghost: "hover:bg-secondary hover:text-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-10 px-4 py-2 has-[>svg]:px-3",
            sm: "h-9 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-11 rounded-lg px-6 has-[>svg]:px-4",
            icon: "size-9",
            "icon-sm": "size-8",
            "icon-lg": "size-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button({ className, variant = "default", size = "default", asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        "data-variant": variant,
        "data-size": size,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/button.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/switch.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Switch",
    ()=>Switch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/@radix-ui/react-switch/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const Switch = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
        ...props,
        ref: ref,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Thumb"], {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0")
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/switch.tsx",
            lineNumber: 20,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/switch.tsx",
        lineNumber: 12,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
Switch.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"].displayName;
;
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DropdownMenu",
    ()=>DropdownMenu,
    "DropdownMenuCheckboxItem",
    ()=>DropdownMenuCheckboxItem,
    "DropdownMenuContent",
    ()=>DropdownMenuContent,
    "DropdownMenuGroup",
    ()=>DropdownMenuGroup,
    "DropdownMenuItem",
    ()=>DropdownMenuItem,
    "DropdownMenuLabel",
    ()=>DropdownMenuLabel,
    "DropdownMenuPortal",
    ()=>DropdownMenuPortal,
    "DropdownMenuRadioGroup",
    ()=>DropdownMenuRadioGroup,
    "DropdownMenuRadioItem",
    ()=>DropdownMenuRadioItem,
    "DropdownMenuSeparator",
    ()=>DropdownMenuSeparator,
    "DropdownMenuShortcut",
    ()=>DropdownMenuShortcut,
    "DropdownMenuSub",
    ()=>DropdownMenuSub,
    "DropdownMenuSubContent",
    ()=>DropdownMenuSubContent,
    "DropdownMenuSubTrigger",
    ()=>DropdownMenuSubTrigger,
    "DropdownMenuTrigger",
    ()=>DropdownMenuTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as CheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRightIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleIcon$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/circle.js [app-ssr] (ecmascript) <export default as CircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function DropdownMenu({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "dropdown-menu",
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
function DropdownMenuPortal({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Portal"], {
        "data-slot": "dropdown-menu-portal",
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
function DropdownMenuTrigger({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "dropdown-menu-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
function DropdownMenuContent({ className, sideOffset = 4, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Content"], {
            "data-slot": "dropdown-menu-content",
            sideOffset: sideOffset,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
            lineNumber: 41,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
function DropdownMenuGroup({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"], {
        "data-slot": "dropdown-menu-group",
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
function DropdownMenuItem({ className, inset, variant = "default", ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Item"], {
        "data-slot": "dropdown-menu-item",
        "data-inset": inset,
        "data-variant": variant,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
function DropdownMenuCheckboxItem({ className, children, checked, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CheckboxItem"], {
        "data-slot": "dropdown-menu-checkbox-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        checked: checked,
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__["CheckIcon"], {
                        className: "size-4"
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
                        lineNumber: 103,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
                    lineNumber: 102,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
function DropdownMenuRadioGroup({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RadioGroup"], {
        "data-slot": "dropdown-menu-radio-group",
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 115,
        columnNumber: 5
    }, this);
}
function DropdownMenuRadioItem({ className, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RadioItem"], {
        "data-slot": "dropdown-menu-radio-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleIcon$3e$__["CircleIcon"], {
                        className: "size-2 fill-current"
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 128,
        columnNumber: 5
    }, this);
}
function DropdownMenuLabel({ className, inset, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
        "data-slot": "dropdown-menu-label",
        "data-inset": inset,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 154,
        columnNumber: 5
    }, this);
}
function DropdownMenuSeparator({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Separator"], {
        "data-slot": "dropdown-menu-separator",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("bg-border -mx-1 my-1 h-px", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
function DropdownMenuShortcut({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "data-slot": "dropdown-menu-shortcut",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground ml-auto text-xs tracking-widest", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 184,
        columnNumber: 5
    }, this);
}
function DropdownMenuSub({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Sub"], {
        "data-slot": "dropdown-menu-sub",
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 198,
        columnNumber: 10
    }, this);
}
function DropdownMenuSubTrigger({ className, inset, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubTrigger"], {
        "data-slot": "dropdown-menu-sub-trigger",
        "data-inset": inset,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__["ChevronRightIcon"], {
                className: "ml-auto size-4"
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
                lineNumber: 220,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 210,
        columnNumber: 5
    }, this);
}
function DropdownMenuSubContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubContent"], {
        "data-slot": "dropdown-menu-sub-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx",
        lineNumber: 230,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/lib/hooks/use-dark-mode.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDarkMode",
    ()=>useDarkMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const STORAGE_KEY = "darkMode";
// Helper function - defined outside component
function applyDarkMode(value) {
    if (typeof document === "undefined") return;
    if (value) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}
function useDarkMode() {
    const [isDark, setIsDark] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const hasSyncedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Initialize from localStorage on mount (client-side only)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, []);
    // Sync with database when user is logged in
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoaded || hasSyncedRef.current) return;
        const syncWithDatabase = async ()=>{
            try {
                const res = await fetch("/api/konto/settings");
                if (res.ok) {
                    const settings = await res.json();
                    if (settings.darkMode !== undefined) {
                        setIsDark(settings.darkMode);
                        applyDarkMode(settings.darkMode);
                        localStorage.setItem(STORAGE_KEY, String(settings.darkMode));
                        hasSyncedRef.current = true;
                    }
                }
            } catch  {
            // User might not be logged in, use localStorage value
            }
        };
        syncWithDatabase();
    }, [
        isLoaded
    ]);
    const saveToDatabase = async (value)=>{
        try {
            await fetch("/api/konto/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    darkMode: value
                })
            });
        } catch  {
        // Ignore errors - localStorage is the fallback
        }
    };
    const toggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, []);
    const setDarkMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((value)=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, []);
    return {
        isDark,
        toggle,
        setDarkMode,
        isLoaded
    };
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Navigation",
    ()=>Navigation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next-auth/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$newspaper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Newspaper$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/newspaper.js [app-ssr] (ecmascript) <export default as Newspaper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/building-2.js [app-ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/log-in.js [app-ssr] (ecmascript) <export default as LogIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/sun.js [app-ssr] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/moon.js [app-ssr] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Key$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/key.js [app-ssr] (ecmascript) <export default as Key>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/switch.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$hooks$2f$use$2d$dark$2d$mode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/hooks/use-dark-mode.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
const navItems = [
    {
        href: "/nyheter",
        label: "Nyheter",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$newspaper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Newspaper$3e$__["Newspaper"]
    },
    {
        href: "/bolag",
        label: "Bolag",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"]
    },
    {
        href: "/bevakning",
        label: "Investerar-databaser",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"]
    },
    {
        href: "/bolaghandelser",
        label: "Bolagshändelser",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"]
    }
];
function getUserInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}
function Navigation() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const { data: session, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const { isDark, toggle, isLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$hooks$2f$use$2d$dark$2d$mode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDarkMode"])();
    const [isScrolled, setIsScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Track scroll position for header blur effect
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleScroll = ()=>{
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll, {
            passive: true
        });
        handleScroll(); // Check initial position
        return ()=>window.removeEventListener("scroll", handleScroll);
    }, []);
    // Close mobile menu on route change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setIsMobileMenuOpen(false);
    }, [
        pathname
    ]);
    // Prevent body scroll when mobile menu is open
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return ()=>{
            document.body.style.overflow = '';
        };
    }, [
        isMobileMenuOpen
    ]);
    // Don't show nav on auth pages
    if (pathname === "/login" || pathname === "/register") {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("sticky top-0 z-50 border-b transition-all duration-300", isScrolled ? "border-border/50 bg-background/80 backdrop-blur-xl shadow-sm" : "border-transparent bg-background/95 backdrop-blur-sm"),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-[1200px] mx-auto px-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-14 sm:h-16 items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                className: "flex items-center gap-2 sm:gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "nav-logo-icon",
                                        children: "LD"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 103,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden sm:inline font-display font-bold tracking-tight",
                                        children: "LoopDesk"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 104,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                lineNumber: 102,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden md:flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: navItems.map((item)=>{
                                            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: item.href,
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("h-4 w-4 transition-transform duration-200", isActive && "scale-110 text-[hsl(355,82%,56%)]")
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 127,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: item.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 131,
                                                        columnNumber: 21
                                                    }, this),
                                                    isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "absolute bottom-0 left-3 right-3 h-0.5 bg-[hsl(355,82%,56%)] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-200"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 134,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, item.href, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                lineNumber: 117,
                                                columnNumber: 19
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 110,
                                        columnNumber: 13
                                    }, this),
                                    isLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: toggle,
                                        className: "theme-toggle-btn",
                                        "aria-label": "Växla tema",
                                        children: isDark ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {}, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 148,
                                            columnNumber: 27
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {}, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 148,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 143,
                                        columnNumber: 15
                                    }, this),
                                    status === "loading" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "user-avatar-lg animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 154,
                                        columnNumber: 15
                                    }, this) : session ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                                asChild: true,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "user-avatar-lg ring-2 ring-transparent hover:ring-border transition-all duration-200",
                                                    children: session.user?.image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: session.user.image,
                                                        alt: session.user.name || ""
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 160,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: getUserInitials(session.user?.name)
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 165,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                lineNumber: 157,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                                align: "end",
                                                className: "w-64 glass shadow-xl animate-in fade-in slide-in-from-top-2 duration-200",
                                                sideOffset: 8,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "px-3 py-3 border-b border-border/50",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden",
                                                                    children: session.user?.image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: session.user.image,
                                                                        alt: "",
                                                                        className: "w-full h-full object-cover"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                        lineNumber: 179,
                                                                        columnNumber: 27
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-sm font-medium",
                                                                        children: getUserInitials(session.user?.name)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                        lineNumber: 181,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                    lineNumber: 177,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex-1 min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-sm font-semibold truncate",
                                                                            children: session.user?.name || "Användare"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                            lineNumber: 185,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs text-muted-foreground truncate",
                                                                            children: session.user?.email
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                            lineNumber: 186,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                    lineNumber: 184,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                            lineNumber: 176,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 175,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "py-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                                asChild: true,
                                                                className: "cursor-pointer gap-2 px-3 py-2",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    href: "/konto",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                            lineNumber: 197,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "Kontoinställningar"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                    lineNumber: 196,
                                                                    columnNumber: 23
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                lineNumber: 195,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                                asChild: true,
                                                                className: "cursor-pointer gap-2 px-3 py-2",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    href: "/konto/losenord",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Key$3e$__["Key"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                            lineNumber: 203,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "Byt lösenord"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                    lineNumber: 202,
                                                                    columnNumber: 23
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                lineNumber: 201,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 194,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuSeparator"], {
                                                        className: "bg-border/50"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 209,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "px-3 py-2",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [
                                                                        isDark ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                            lineNumber: 215,
                                                                            columnNumber: 35
                                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                            lineNumber: 215,
                                                                            columnNumber: 66
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-sm",
                                                                            children: "Mörkt läge"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                            lineNumber: 216,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                    lineNumber: 214,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Switch"], {
                                                                    checked: isDark,
                                                                    onCheckedChange: toggle,
                                                                    "aria-label": "Växla mörkt läge"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                    lineNumber: 218,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                            lineNumber: 213,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 212,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuSeparator"], {
                                                        className: "bg-border/50"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 226,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "py-1",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                            onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])({
                                                                    callbackUrl: "/login"
                                                                }),
                                                            className: "cursor-pointer gap-2 px-3 py-2 text-destructive focus:text-destructive",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                                    lineNumber: 234,
                                                                    columnNumber: 23
                                                                }, this),
                                                                "Logga ut"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                            lineNumber: 230,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 229,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                lineNumber: 169,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 156,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/login",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            size: "sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                                                    className: "mr-2 h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 243,
                                                    columnNumber: 19
                                                }, this),
                                                "Logga in"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 242,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 241,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex md:hidden items-center gap-2",
                                children: [
                                    isLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: toggle,
                                        className: "theme-toggle-btn w-9 h-9",
                                        "aria-label": "Växla tema",
                                        children: isDark ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 259,
                                            columnNumber: 27
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 259,
                                            columnNumber: 57
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 254,
                                        columnNumber: 15
                                    }, this),
                                    status !== "loading" && session && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/konto",
                                        className: "user-avatar-sm",
                                        children: session.user?.image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: session.user.image,
                                            alt: session.user.name || ""
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 267,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs",
                                            children: getUserInitials(session.user?.name)
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 269,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 265,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsMobileMenuOpen(!isMobileMenuOpen),
                                        className: "p-2 rounded-lg text-foreground hover:bg-secondary transition-colors",
                                        "aria-label": isMobileMenuOpen ? "Stäng meny" : "Öppna meny",
                                        "aria-expanded": isMobileMenuOpen,
                                        children: isMobileMenuOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 282,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 284,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 275,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                lineNumber: 251,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                    lineNumber: 99,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                lineNumber: 93,
                columnNumber: 5
            }, this),
            isMobileMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-40 md:hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200",
                        onClick: ()=>setIsMobileMenuOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                        lineNumber: 296,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-14 left-0 right-0 bottom-0 bg-background border-t border-border overflow-y-auto animate-in slide-in-from-top-2 duration-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 space-y-2",
                                children: navItems.map((item)=>{
                                    const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: item.href,
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200", isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"),
                                        onClick: ()=>setIsMobileMenuOpen(false),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("h-5 w-5", isActive && "text-foreground")
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                lineNumber: 321,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: item.label
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                lineNumber: 325,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, item.href, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                        lineNumber: 310,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                lineNumber: 303,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-px bg-border mx-4 my-2"
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                lineNumber: 332,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 space-y-2",
                                children: session ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden",
                                                    children: session.user?.image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: session.user.image,
                                                        alt: "",
                                                        className: "w-full h-full object-cover"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 342,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-medium",
                                                        children: getUserInitials(session.user?.name)
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                        lineNumber: 344,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 340,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-semibold truncate",
                                                            children: session.user?.name || "Användare"
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                            lineNumber: 348,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-muted-foreground truncate",
                                                            children: session.user?.email
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                            lineNumber: 349,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 347,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 339,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/konto",
                                            className: "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all",
                                            onClick: ()=>setIsMobileMenuOpen(false),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 358,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Kontoinställningar"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 359,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 353,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/konto/losenord",
                                            className: "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all",
                                            onClick: ()=>setIsMobileMenuOpen(false),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Key$3e$__["Key"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 367,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Byt lösenord"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 368,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 362,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/30",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3",
                                                    children: [
                                                        isDark ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                                            className: "h-5 w-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                            lineNumber: 374,
                                                            columnNumber: 31
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                                            className: "h-5 w-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                            lineNumber: 374,
                                                            columnNumber: 62
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-base font-medium",
                                                            children: "Mörkt läge"
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                            lineNumber: 375,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 373,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Switch"], {
                                                    checked: isDark,
                                                    onCheckedChange: toggle,
                                                    "aria-label": "Växla mörkt läge"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 377,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 372,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setIsMobileMenuOpen(false);
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])({
                                                    callbackUrl: "/login"
                                                });
                                            },
                                            className: "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-all w-full",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 391,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Logga ut"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                                    lineNumber: 392,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 384,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/login",
                                    className: "flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-foreground text-background text-base font-medium transition-all",
                                    onClick: ()=>setIsMobileMenuOpen(false),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 401,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Logga in"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                            lineNumber: 402,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                    lineNumber: 396,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                                lineNumber: 335,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                        lineNumber: 302,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/navigation.tsx",
                lineNumber: 294,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/providers/session-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SessionProvider",
    ()=>SessionProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next-auth/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function SessionProvider({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SessionProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/providers/session-provider.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/page-transition.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FadeIn",
    ()=>FadeIn,
    "PageTransition",
    ()=>PageTransition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const pageVariants = {
    initial: {
        opacity: 0,
        y: 12
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [
                0.25,
                0.1,
                0.25,
                1
            ]
        }
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.25,
            ease: [
                0.25,
                0.1,
                0.25,
                1
            ]
        }
    }
};
function PageTransition({ children, className }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        mode: "wait",
        initial: false,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: "initial",
            animate: "animate",
            exit: "exit",
            variants: pageVariants,
            className: className,
            children: children
        }, pathname, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/page-transition.tsx",
            lineNumber: 40,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/page-transition.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
function FadeIn({ children, className, delay = 0, duration = 0.4 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 8
        },
        animate: {
            opacity: 1,
            y: 0
        },
        transition: {
            duration,
            delay,
            ease: [
                0.25,
                0.1,
                0.25,
                1
            ]
        },
        className: className,
        children: children
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/page-transition.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/ToolProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToolProvider",
    ()=>ToolProvider,
    "useTools",
    ()=>useTools
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const ToolContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function ToolProvider({ children }) {
    const [activeTool, setActiveTool] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const openTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((tool)=>{
        setActiveTool(tool);
    }, []);
    const closeTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setActiveTool(null);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ToolContext.Provider, {
        value: {
            activeTool,
            openTool,
            closeTool
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/ToolProvider.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
function useTools() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ToolContext);
    if (!context) {
        throw new Error("useTools must be used within a ToolProvider");
    }
    return context;
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TOOL_CONFIGS",
    ()=>TOOL_CONFIGS
]);
const TOOL_CONFIGS = {
    allabolag: {
        id: "allabolag",
        name: "Allabolag",
        description: "Scrapa bolagsdata",
        shortcut: "A"
    },
    bolagsverket: {
        id: "bolagsverket",
        name: "Bolagsverket",
        description: "Officiell bolagsinfo",
        shortcut: "B"
    },
    vinnova: {
        id: "vinnova",
        name: "Vinnova",
        description: "Projektfinansiering",
        shortcut: "V"
    },
    kungorelser: {
        id: "kungorelser",
        name: "Kungörelser",
        description: "Konkurs & likvidation",
        shortcut: "K"
    },
    rss: {
        id: "rss",
        name: "RSS-hanterare",
        description: "Hantera nyhetsflöden",
        shortcut: "R"
    }
};
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToolPanel",
    ()=>ToolPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function ToolPanel({ tool, title, icon, isOpen, onClose, children, className }) {
    // Close on Escape key
    const handleKeyDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (e.key === "Escape") {
            onClose();
        }
    }, [
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return ()=>{
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [
        isOpen,
        handleKeyDown
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tool-panel-backdrop",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("tool-panel", className),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "tool-header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "tool-header-title",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "tool-header-icon",
                                        "data-tool": tool,
                                        children: icon
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx",
                                        lineNumber: 60,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: title
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx",
                                        lineNumber: 63,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "btn-ghost p-2 rounded-lg",
                                "aria-label": "Stäng",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx",
                                    lineNumber: 70,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    children
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolTabs.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToolTabs",
    ()=>ToolTabs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
function ToolTabs({ tool, tabs, activeTab, onTabChange, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("tool-tabs", className),
        children: tabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "tool-tab",
                "data-tool": tool,
                "data-active": activeTab === tab.id,
                onClick: ()=>onTabChange(tab.id),
                children: [
                    tab.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "mr-1.5",
                        children: tab.icon
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolTabs.tsx",
                        lineNumber: 31,
                        columnNumber: 24
                    }, this),
                    tab.label
                ]
            }, tab.id, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolTabs.tsx",
                lineNumber: 24,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolTabs.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LogPanel",
    ()=>LogPanel,
    "useLogEntries",
    ()=>useLogEntries
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function formatTime(date) {
    return date.toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}
function LogPanel({ entries, maxHeight = 200, autoScroll = true, className }) {
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auto-scroll to bottom on new entries
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [
        entries,
        autoScroll
    ]);
    if (entries.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("tool-log", className),
            style: {
                maxHeight
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tool-log-entry",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "tool-log-message text-muted-foreground",
                    children: "Ingen aktivitet än..."
                }, void 0, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx",
                    lineNumber: 44,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx",
                lineNumber: 43,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx",
            lineNumber: 39,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: scrollRef,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("tool-log dark-scrollbar", className),
        style: {
            maxHeight
        },
        children: entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tool-log-entry",
                "data-type": entry.type,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "tool-log-time",
                        children: formatTime(entry.timestamp)
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx",
                        lineNumber: 60,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "tool-log-message",
                        children: entry.message
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this)
                ]
            }, entry.id, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx",
                lineNumber: 59,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
function useLogEntries(maxEntries = 100) {
    const [entries, setEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const idRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const addEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message, type = "info")=>{
        const entry = {
            id: `log-${++idRef.current}`,
            timestamp: new Date(),
            message,
            type
        };
        setEntries((prev)=>[
                ...prev.slice(-maxEntries + 1),
                entry
            ]);
        return entry;
    }, [
        maxEntries
    ]);
    const clearEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setEntries([]);
    }, []);
    return {
        entries,
        addEntry,
        clearEntries,
        log: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message)=>addEntry(message, "info"), [
            addEntry
        ]),
        success: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message)=>addEntry(message, "success"), [
            addEntry
        ]),
        warning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message)=>addEntry(message, "warning"), [
            addEntry
        ]),
        error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message)=>addEntry(message, "error"), [
            addEntry
        ])
    };
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProgressBar",
    ()=>ProgressBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
function ProgressBar({ tool, progress, showLabel = false, className }) {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("space-y-1", className),
        children: [
            showLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between text-xs text-muted-foreground",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "Framsteg"
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-mono",
                        children: [
                            Math.round(clampedProgress),
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx",
                lineNumber: 24,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tool-progress",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "tool-progress-bar",
                    "data-tool": tool,
                    style: {
                        width: `${clampedProgress}%`
                    }
                }, void 0, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/StatusBadge.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusBadge",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
const STATUS_LABELS = {
    idle: "Vilande",
    running: "Kör",
    success: "Klar",
    error: "Fel"
};
function StatusBadge({ status, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("tool-status", className),
        "data-status": status,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "tool-status-dot"
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/StatusBadge.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: STATUS_LABELS[status]
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/StatusBadge.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/StatusBadge.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToolMenu",
    ()=>ToolMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/building-2.js [app-ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSearch$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/file-search.js [app-ssr] (ecmascript) <export default as FileSearch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/lightbulb.js [app-ssr] (ecmascript) <export default as Lightbulb>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/scroll-text.js [app-ssr] (ecmascript) <export default as ScrollText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rss$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rss$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/rss.js [app-ssr] (ecmascript) <export default as Rss>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/dropdown-menu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/settings-2.js [app-ssr] (ecmascript) <export default as Settings2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/types.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const TOOL_ICONS = {
    allabolag: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
        className: "w-4 h-4"
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
        lineNumber: 24,
        columnNumber: 14
    }, ("TURBOPACK compile-time value", void 0)),
    bolagsverket: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSearch$3e$__["FileSearch"], {
        className: "w-4 h-4"
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
        lineNumber: 25,
        columnNumber: 17
    }, ("TURBOPACK compile-time value", void 0)),
    vinnova: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__["Lightbulb"], {
        className: "w-4 h-4"
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
        lineNumber: 26,
        columnNumber: 12
    }, ("TURBOPACK compile-time value", void 0)),
    kungorelser: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__["ScrollText"], {
        className: "w-4 h-4"
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
        lineNumber: 27,
        columnNumber: 16
    }, ("TURBOPACK compile-time value", void 0)),
    rss: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rss$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rss$3e$__["Rss"], {
        className: "w-4 h-4"
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
        lineNumber: 28,
        columnNumber: 8
    }, ("TURBOPACK compile-time value", void 0))
};
const TOOL_ORDER = [
    "allabolag",
    "bolagsverket",
    "kungorelser",
    "vinnova",
    "rss"
];
function ToolMenu({ onSelectTool }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenu"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "ghost",
                    size: "sm",
                    className: "gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "hidden sm:inline",
                            children: "Verktyg"
                        }, void 0, false, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                align: "end",
                className: "glass shadow-xl animate-in fade-in slide-in-from-top-2 duration-200",
                sideOffset: 8,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "tool-menu",
                    children: TOOL_ORDER.map((toolId)=>{
                        const config = __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_CONFIGS"][toolId];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "tool-menu-item",
                            onClick: ()=>onSelectTool(toolId),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "tool-menu-icon",
                                    "data-tool": toolId,
                                    children: TOOL_ICONS[toolId]
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                                    lineNumber: 62,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "tool-menu-label",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-medium",
                                            children: config.name
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                                            lineNumber: 66,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-muted-foreground",
                                            children: config.description
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                                            lineNumber: 67,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                                    lineNumber: 65,
                                    columnNumber: 17
                                }, this),
                                config.shortcut && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "tool-menu-shortcut",
                                    children: [
                                        "\u2318",
                                        config.shortcut
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                                    lineNumber: 72,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, toolId, true, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                            lineNumber: 57,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolTabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/StatusBadge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolMenu.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AllabolagTool",
    ()=>AllabolagTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/building-2.js [app-ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolTabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/StatusBadge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const TABS = [
    {
        id: "search",
        label: "Sök",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
            lineNumber: 40,
            columnNumber: 39
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "history",
        label: "Historik",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
            lineNumber: 41,
            columnNumber: 45
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "status",
        label: "Status",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
            lineNumber: 42,
            columnNumber: 42
        }, ("TURBOPACK compile-time value", void 0))
    }
];
function AllabolagTool({ onClose }) {
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("search");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [searchResults, setSearchResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedCompany, setSelectedCompany] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchHistory, setSearchHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const logIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const addLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message, type = "info")=>{
        const entry = {
            id: `log-${++logIdRef.current}`,
            timestamp: new Date(),
            message,
            type
        };
        setLogs((prev)=>[
                ...prev.slice(-99),
                entry
            ]);
        return entry;
    }, []);
    const handleSearch = async ()=>{
        if (!query.trim() || query.trim().length < 2) return;
        setStatus("running");
        setProgress(10);
        setSearchResults([]);
        setSelectedCompany(null);
        addLog(`Söker efter "${query}"...`, "info");
        try {
            setProgress(30);
            const response = await fetch(`/api/bolag/search?q=${encodeURIComponent(query.trim())}`);
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            const data = await response.json();
            setProgress(80);
            if (data.results && data.results.length > 0) {
                setSearchResults(data.results);
                addLog(`Hittade ${data.results.length} företag`, "success");
            } else {
                addLog("Inga resultat hittades", "warning");
            }
            setProgress(100);
            setStatus("success");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
            setStatus("error");
        }
        setTimeout(()=>setProgress(0), 1000);
    };
    const handleSelectCompany = async (result)=>{
        setStatus("running");
        setProgress(20);
        addLog(`Hämtar detaljer för ${result.name}...`, "info");
        // Add to history
        setSearchHistory((prev)=>{
            const exists = prev.find((r)=>r.orgnr === result.orgnr);
            if (exists) return prev;
            return [
                result,
                ...prev.slice(0, 9)
            ];
        });
        try {
            setProgress(50);
            const response = await fetch(`/api/bolag/company/${result.orgnr}`);
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            const data = await response.json();
            setProgress(90);
            setSelectedCompany(data);
            addLog(`Hämtade data för ${result.name}`, "success");
            setProgress(100);
            setStatus("success");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
            setStatus("error");
        }
        setTimeout(()=>setProgress(0), 1000);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToolPanel"], {
        tool: "allabolag",
        title: "Allabolag Scraper",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
            lineNumber: 142,
            columnNumber: 13
        }, void 0),
        isOpen: true,
        onClose: onClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToolTabs"], {
                tool: "allabolag",
                tabs: TABS,
                activeTab: activeTab,
                onTabChange: setActiveTab
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tool-content space-y-4",
                children: [
                    activeTab === "search" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: "Sök bolag"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 158,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Org.nummer eller bolagsnamn...",
                                                value: query,
                                                onChange: (e)=>setQuery(e.target.value),
                                                onKeyDown: (e)=>e.key === "Enter" && handleSearch(),
                                                className: "flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 160,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleSearch,
                                                disabled: status === "running",
                                                className: "btn-primary px-4",
                                                children: status === "running" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-4 h-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                    lineNumber: 176,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 168,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 159,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                        status: status
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 184,
                                        columnNumber: 15
                                    }, this),
                                    progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground font-mono",
                                        children: [
                                            progress,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 186,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                lineNumber: 183,
                                columnNumber: 13
                            }, this),
                            progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProgressBar"], {
                                tool: "allabolag",
                                progress: progress
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                lineNumber: 193,
                                columnNumber: 15
                            }, this),
                            searchResults.length > 0 && !selectedCompany && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: [
                                            "Sökresultat (",
                                            searchResults.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 199,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1 max-h-64 overflow-y-auto",
                                        children: searchResults.map((result)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleSelectCompany(result),
                                                className: "w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-medium text-sm",
                                                        children: result.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                        lineNumber: 207,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 text-xs text-muted-foreground mt-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-mono",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(result.orgnr)
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                                lineNumber: 209,
                                                                columnNumber: 25
                                                            }, this),
                                                            result.companyType && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "•"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                                        lineNumber: 212,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: result.companyType
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                                        lineNumber: 213,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true),
                                                            result.location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "•"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                                        lineNumber: 218,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: result.location
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                                        lineNumber: 219,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                        lineNumber: 208,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, result.orgnr, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 202,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 200,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                lineNumber: 198,
                                columnNumber: 15
                            }, this),
                            selectedCompany && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-label",
                                                children: "Bolagsdetaljer"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 233,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSelectedCompany(null),
                                                className: "text-xs text-muted-foreground hover:text-foreground",
                                                children: "Tillbaka"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 234,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 232,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4 rounded-lg border border-border bg-secondary/50 space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-semibold",
                                                        children: selectedCompany.basic.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                        lineNumber: 243,
                                                        columnNumber: 21
                                                    }, this),
                                                    selectedCompany.basic.legalName && selectedCompany.basic.legalName !== selectedCompany.basic.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-muted-foreground",
                                                        children: selectedCompany.basic.legalName
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                        lineNumber: 245,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 242,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-2 text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-muted-foreground",
                                                                children: "Org.nr:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                                lineNumber: 250,
                                                                columnNumber: 23
                                                            }, this),
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-mono",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(selectedCompany.basic.orgNr)
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                                lineNumber: 251,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 21
                                                    }, this),
                                                    selectedCompany.basic.companyType && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-muted-foreground",
                                                                children: "Typ:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                                lineNumber: 255,
                                                                columnNumber: 25
                                                            }, this),
                                                            " ",
                                                            selectedCompany.basic.companyType.name
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                        lineNumber: 254,
                                                        columnNumber: 23
                                                    }, this),
                                                    selectedCompany.financials?.revenue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-muted-foreground",
                                                                children: "Omsättning:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                                lineNumber: 261,
                                                                columnNumber: 25
                                                            }, this),
                                                            " ",
                                                            selectedCompany.financials.revenue
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                        lineNumber: 260,
                                                        columnNumber: 23
                                                    }, this),
                                                    selectedCompany.financials?.employees && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-muted-foreground",
                                                                children: "Anställda:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                                lineNumber: 267,
                                                                columnNumber: 25
                                                            }, this),
                                                            " ",
                                                            selectedCompany.financials.employees
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                        lineNumber: 266,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 248,
                                                columnNumber: 19
                                            }, this),
                                            selectedCompany.basic.status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm ${selectedCompany.basic.status.active ? "text-green-500" : "text-red-500"}`,
                                                children: [
                                                    "Status: ",
                                                    selectedCompany.basic.status.status
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 273,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: `https://www.allabolag.se/${selectedCompany.basic.orgNr.replace("-", "")}`,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                        className: "w-3.5 h-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                        lineNumber: 283,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Öppna på Allabolag"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 277,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 241,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                lineNumber: 231,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    activeTab === "history" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-label",
                                children: "Senaste sökningar"
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                lineNumber: 294,
                                columnNumber: 13
                            }, this),
                            searchHistory.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "empty-state py-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        className: "empty-state-icon w-10 h-10"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 297,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "empty-state-title text-sm",
                                        children: "Ingen historik"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 298,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "empty-state-description text-xs",
                                        children: "Dina senaste sökningar visas här."
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 299,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                lineNumber: 296,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: searchHistory.map((result)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setActiveTab("search");
                                            handleSelectCompany(result);
                                        },
                                        className: "w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium text-sm",
                                                children: result.name
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 314,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-muted-foreground font-mono mt-1",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(result.orgnr)
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                                lineNumber: 315,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, result.orgnr, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 306,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                lineNumber: 304,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                        lineNumber: 293,
                        columnNumber: 11
                    }, this),
                    activeTab === "status" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium",
                                        children: "Aktivitetslogg"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 328,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                        status: status
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                        lineNumber: 329,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                lineNumber: 327,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LogPanel"], {
                                entries: logs,
                                maxHeight: 300
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                                lineNumber: 331,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                        lineNumber: 326,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
                lineNumber: 153,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BolagsverketTool",
    ()=>BolagsverketTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSearch$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/file-search.js [app-ssr] (ecmascript) <export default as FileSearch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/download.js [app-ssr] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/building-2.js [app-ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolTabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/StatusBadge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const TABS = [
    {
        id: "search",
        label: "Sök",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
            lineNumber: 46,
            columnNumber: 39
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "reports",
        label: "Årsredovisningar",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
            lineNumber: 47,
            columnNumber: 53
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "status",
        label: "Status",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
            lineNumber: 48,
            columnNumber: 42
        }, ("TURBOPACK compile-time value", void 0))
    }
];
function BolagsverketTool({ onClose }) {
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("search");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [orgNr, setOrgNr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [companyData, setCompanyData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [reports, setReports] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searchHistory, setSearchHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isSearching, setIsSearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoadingReports, setIsLoadingReports] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const logIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const addLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message, type = "info")=>{
        const entry = {
            id: `log-${++logIdRef.current}`,
            timestamp: new Date(),
            message,
            type
        };
        setLogs((prev)=>[
                ...prev.slice(-99),
                entry
            ]);
        return entry;
    }, []);
    const cleanOrgNr = (input)=>{
        return input.replace(/[^0-9]/g, "");
    };
    const handleSearch = async ()=>{
        const cleaned = cleanOrgNr(orgNr);
        if (cleaned.length < 10) {
            addLog("Ange ett giltigt organisationsnummer (10 siffror)", "warning");
            return;
        }
        setIsSearching(true);
        setStatus("running");
        setProgress(10);
        setCompanyData(null);
        setReports([]);
        addLog(`Söker i Bolagsverket för ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(cleaned)}...`, "info");
        try {
            setProgress(30);
            const response = await fetch(`/api/bolag/company/${cleaned}`);
            setProgress(60);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Företaget hittades inte");
                }
                throw new Error(`API returned ${response.status}`);
            }
            const data = await response.json();
            setProgress(90);
            if (data.basic) {
                setCompanyData(data);
                addLog(`Hittade: ${data.basic.name}`, "success");
                // Add to search history
                setSearchHistory((prev)=>{
                    const exists = prev.find((h)=>h.orgNr === cleaned);
                    if (exists) return prev;
                    return [
                        {
                            orgNr: cleaned,
                            name: data.basic.name
                        },
                        ...prev.slice(0, 9)
                    ];
                });
                // Check data source
                if (data.sources?.bolagsverket) {
                    addLog("Data från Bolagsverkets officiella API", "info");
                }
            } else {
                addLog("Företaget hittades inte", "warning");
            }
            setProgress(100);
            setStatus("success");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
            setStatus("error");
        }
        setIsSearching(false);
        setTimeout(()=>setProgress(0), 1000);
    };
    const loadAnnualReports = async ()=>{
        if (!companyData?.basic.orgNr) {
            addLog("Sök efter ett företag först", "warning");
            return;
        }
        setIsLoadingReports(true);
        setStatus("running");
        setProgress(20);
        addLog(`Hämtar årsredovisningar för ${companyData.basic.name}...`, "info");
        try {
            setProgress(50);
            const response = await fetch(`/api/bolag/annual-reports?orgNr=${companyData.basic.orgNr}`);
            setProgress(80);
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            const data = await response.json();
            setProgress(95);
            if (data.reports && data.reports.length > 0) {
                setReports(data.reports);
                addLog(`Hittade ${data.reports.length} årsredovisningar`, "success");
            } else {
                addLog("Inga årsredovisningar hittades", "warning");
            }
            setProgress(100);
            setStatus("success");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
            setStatus("error");
        }
        setIsLoadingReports(false);
        setTimeout(()=>setProgress(0), 1000);
    };
    const downloadReport = async (report)=>{
        addLog(`Laddar ner årsredovisning ${report.year || report.period}...`, "info");
        try {
            const response = await fetch(`/api/bolag/annual-reports/${report.dokumentId}`);
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `arsredovisning-${companyData?.basic.orgNr}-${report.year || report.period}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addLog(`Nedladdning startad för ${report.year || report.period}`, "success");
        } catch (error) {
            addLog(`Fel vid nedladdning: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
        }
    };
    const formatDate = (dateStr)=>{
        if (!dateStr) return "-";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("sv-SE");
        } catch  {
            return dateStr;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToolPanel"], {
        tool: "bolagsverket",
        title: "Bolagsverket API",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSearch$3e$__["FileSearch"], {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
            lineNumber: 219,
            columnNumber: 13
        }, void 0),
        isOpen: true,
        onClose: onClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToolTabs"], {
                tool: "bolagsverket",
                tabs: TABS,
                activeTab: activeTab,
                onTabChange: setActiveTab
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                lineNumber: 223,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tool-content space-y-4",
                children: [
                    activeTab === "search" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: "Organisationsnummer"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 235,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "XXXXXX-XXXX",
                                                value: orgNr,
                                                onChange: (e)=>setOrgNr(e.target.value),
                                                onKeyDown: (e)=>e.key === "Enter" && handleSearch(),
                                                className: "flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 237,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleSearch,
                                                disabled: isSearching,
                                                className: "btn-primary px-4",
                                                children: isSearching ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-4 h-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                    lineNumber: 251,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 245,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 236,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground",
                                        children: "Hämtar officiella uppgifter från Bolagsverkets API."
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 257,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                lineNumber: 234,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                        status: status
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 264,
                                        columnNumber: 15
                                    }, this),
                                    progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground font-mono",
                                        children: [
                                            progress,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 266,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                lineNumber: 263,
                                columnNumber: 13
                            }, this),
                            progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProgressBar"], {
                                tool: "bolagsverket",
                                progress: progress
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                lineNumber: 273,
                                columnNumber: 15
                            }, this),
                            companyData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: "Bolagsuppgifter"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 279,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4 rounded-lg border border-border bg-secondary/50 space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-2 rounded-lg bg-green-500/20",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                            className: "w-5 h-5 text-green-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                            lineNumber: 284,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 283,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-semibold",
                                                                children: companyData.basic.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                lineNumber: 287,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-muted-foreground font-mono",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(companyData.basic.orgNr)
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                lineNumber: 288,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 286,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 282,
                                                columnNumber: 19
                                            }, this),
                                            companyData.basic.status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm ${companyData.basic.status.active ? "text-green-500" : "text-red-500"}`,
                                                children: [
                                                    companyData.basic.status.status,
                                                    companyData.basic.status.statusDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-muted-foreground ml-2",
                                                        children: [
                                                            "(",
                                                            formatDate(companyData.basic.status.statusDate),
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 303,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 296,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-3 text-sm",
                                                children: [
                                                    companyData.basic.companyType && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-muted-foreground",
                                                                children: "Bolagsform:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                lineNumber: 314,
                                                                columnNumber: 25
                                                            }, this),
                                                            " ",
                                                            companyData.basic.companyType.name
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 313,
                                                        columnNumber: 23
                                                    }, this),
                                                    companyData.basic.registrationDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-muted-foreground",
                                                                children: "Registrerat:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                lineNumber: 320,
                                                                columnNumber: 25
                                                            }, this),
                                                            " ",
                                                            formatDate(companyData.basic.registrationDate)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 319,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 311,
                                                columnNumber: 19
                                            }, this),
                                            companyData.basic.purpose && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-muted-foreground mb-1",
                                                        children: "Verksamhetsbeskrivning"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 329,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm line-clamp-3",
                                                        children: companyData.basic.purpose
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 330,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 328,
                                                columnNumber: 21
                                            }, this),
                                            companyData.postalAddress && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-muted-foreground mb-1",
                                                        children: "Adress"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 337,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm",
                                                        children: [
                                                            companyData.postalAddress.street && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: companyData.postalAddress.street
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                lineNumber: 340,
                                                                columnNumber: 27
                                                            }, this),
                                                            companyData.postalAddress.coAddress && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    "c/o ",
                                                                    companyData.postalAddress.coAddress
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                lineNumber: 343,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    companyData.postalAddress.zipCode,
                                                                    " ",
                                                                    companyData.postalAddress.city
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                lineNumber: 345,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 338,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 336,
                                                columnNumber: 21
                                            }, this),
                                            companyData.industries && companyData.industries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-muted-foreground mb-1",
                                                        children: "Näringsgrenar (SNI)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 355,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1",
                                                        children: [
                                                            companyData.industries.slice(0, 3).map((ind, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-sm flex items-baseline gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "font-mono text-xs text-muted-foreground",
                                                                            children: ind.code
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                            lineNumber: 361,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: ind.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                            lineNumber: 364,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, i, true, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                    lineNumber: 360,
                                                                    columnNumber: 27
                                                                }, this)),
                                                            companyData.industries.length > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-muted-foreground",
                                                                children: [
                                                                    "+",
                                                                    companyData.industries.length - 3,
                                                                    " fler..."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                lineNumber: 368,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 358,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 354,
                                                columnNumber: 21
                                            }, this),
                                            companyData.flags?.marketingProtection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-amber-500",
                                                children: "Reklamsparr aktiverad"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 378,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 pt-2 border-t border-border",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            setActiveTab("reports");
                                                            loadAnnualReports();
                                                        },
                                                        className: "btn-secondary text-xs gap-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                lineNumber: 392,
                                                                columnNumber: 23
                                                            }, this),
                                                            "Årsredovisningar"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 385,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: `https://bolagsverket.se/foretag/sok-foretag-registrerade-hos-bolagsverket`,
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        className: "btn-secondary text-xs gap-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                lineNumber: 401,
                                                                columnNumber: 23
                                                            }, this),
                                                            "Bolagsverket.se"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 395,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 384,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 280,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                lineNumber: 278,
                                columnNumber: 15
                            }, this),
                            searchHistory.length > 0 && !companyData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label text-xs",
                                        children: "Senaste sökningar"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 412,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1",
                                        children: searchHistory.map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    setOrgNr(h.orgNr);
                                                },
                                                className: "w-full text-left px-2 py-1.5 text-xs bg-secondary rounded hover:bg-secondary/80 flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate",
                                                        children: h.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 422,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-muted-foreground",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(h.orgNr)
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                        lineNumber: 423,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, i, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                lineNumber: 415,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 413,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                lineNumber: 411,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    activeTab === "reports" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: companyData ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-medium",
                                                    children: companyData.basic.name
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                    lineNumber: 440,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-muted-foreground font-mono",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(companyData.basic.orgNr)
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                    lineNumber: 441,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                            lineNumber: 439,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: loadAnnualReports,
                                            disabled: isLoadingReports,
                                            className: "btn-secondary text-xs gap-1.5",
                                            children: [
                                                isLoadingReports ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-3.5 h-3.5 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                    lineNumber: 451,
                                                    columnNumber: 23
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                    className: "w-3.5 h-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                    lineNumber: 453,
                                                    columnNumber: 23
                                                }, this),
                                                "Hämta"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                            lineNumber: 445,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                    lineNumber: 438,
                                    columnNumber: 17
                                }, this),
                                progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProgressBar"], {
                                    tool: "bolagsverket",
                                    progress: progress
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                    lineNumber: 460,
                                    columnNumber: 19
                                }, this),
                                reports.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-label",
                                            children: [
                                                "Årsredovisningar (",
                                                reports.length,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                            lineNumber: 465,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2 max-h-72 overflow-y-auto",
                                            children: reports.map((report)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 rounded-lg border border-border bg-secondary/50 flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "font-medium text-sm",
                                                                    children: report.year ? `År ${report.year}` : report.period
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                    lineNumber: 473,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-xs text-muted-foreground",
                                                                    children: [
                                                                        "Registrerad: ",
                                                                        formatDate(report.date)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                    lineNumber: 476,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                            lineNumber: 472,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>downloadReport(report),
                                                            className: "btn-secondary text-xs gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                                    className: "w-3.5 h-3.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                                    lineNumber: 484,
                                                                    columnNumber: 29
                                                                }, this),
                                                                "Ladda ner"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                            lineNumber: 480,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, report.dokumentId, true, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                                    lineNumber: 468,
                                                    columnNumber: 25
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                            lineNumber: 466,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground",
                                            children: "Årsredovisningar laddas ned som ZIP-filer med iXBRL-format."
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                            lineNumber: 490,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                    lineNumber: 464,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "empty-state py-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                            className: "empty-state-icon w-10 h-10"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                            lineNumber: 496,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "empty-state-title text-sm",
                                            children: "Inga årsredovisningar"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                            lineNumber: 497,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "empty-state-description text-xs",
                                            children: 'Klicka på "Hämta" för att ladda årsredovisningar.'
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                            lineNumber: 498,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                    lineNumber: 495,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                            lineNumber: 437,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "empty-state py-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                    className: "empty-state-icon w-10 h-10"
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                    lineNumber: 506,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "empty-state-title text-sm",
                                    children: "Inget företag valt"
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                    lineNumber: 507,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "empty-state-description text-xs",
                                    children: "Sök efter ett företag först för att se årsredovisningar."
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                    lineNumber: 508,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("search"),
                                    className: "btn-primary text-xs mt-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                            className: "w-3.5 h-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                            lineNumber: 515,
                                            columnNumber: 19
                                        }, this),
                                        "Gå till sök"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                    lineNumber: 511,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                            lineNumber: 505,
                            columnNumber: 15
                        }, this)
                    }, void 0, false),
                    activeTab === "status" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium",
                                        children: "Aktivitetslogg"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 526,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                        status: status
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                        lineNumber: 527,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                lineNumber: 525,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LogPanel"], {
                                entries: logs,
                                maxHeight: 300
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                                lineNumber: 529,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                        lineNumber: 524,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
                lineNumber: 230,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx",
        lineNumber: 216,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VinnovaTool",
    ()=>VinnovaTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/lightbulb.js [app-ssr] (ecmascript) <export default as Lightbulb>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/coins.js [app-ssr] (ecmascript) <export default as Coins>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolTabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/StatusBadge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const TABS = [
    {
        id: "search",
        label: "Sök",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
            lineNumber: 39,
            columnNumber: 39
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "status",
        label: "Status",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
            lineNumber: 40,
            columnNumber: 42
        }, ("TURBOPACK compile-time value", void 0))
    }
];
function VinnovaTool({ onClose }) {
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("search");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [orgNr, setOrgNr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [searchResult, setSearchResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedProject, setSelectedProject] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchHistory, setSearchHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isSearching, setIsSearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const logIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const addLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message, type = "info")=>{
        const entry = {
            id: `log-${++logIdRef.current}`,
            timestamp: new Date(),
            message,
            type
        };
        setLogs((prev)=>[
                ...prev.slice(-99),
                entry
            ]);
        return entry;
    }, []);
    const handleSearch = async ()=>{
        if (!query.trim() && !orgNr.trim()) return;
        setIsSearching(true);
        setStatus("running");
        setProgress(10);
        setSearchResult(null);
        setSelectedProject(null);
        addLog(`Söker Vinnova-projekt för "${query || orgNr}"...`, "info");
        // Add to search history
        setSearchHistory((prev)=>{
            const exists = prev.find((h)=>h.name === query && h.orgNr === orgNr);
            if (exists) return prev;
            return [
                {
                    name: query,
                    orgNr: orgNr || undefined
                },
                ...prev.slice(0, 9)
            ];
        });
        try {
            setProgress(30);
            const params = new URLSearchParams();
            if (query.trim()) params.set("company", query.trim());
            if (orgNr.trim()) params.set("orgNr", orgNr.trim().replace(/-/g, ""));
            addLog("Anropar Vinnova API...", "info");
            const response = await fetch(`/api/bolag/vinnova?${params.toString()}`);
            setProgress(70);
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                throw new Error(errorData.error || `API returned ${response.status}`);
            }
            const data = await response.json();
            setProgress(90);
            if (data.projects && data.projects.length > 0) {
                setSearchResult({
                    companyName: query || orgNr,
                    orgNr: orgNr || undefined,
                    projects: data.projects
                });
                addLog(`Hittade ${data.projects.length} Vinnova-projekt`, "success");
            } else {
                addLog("Inga Vinnova-projekt hittades", "warning");
            }
            setProgress(100);
            setStatus("success");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
            setStatus("error");
        }
        setIsSearching(false);
        setTimeout(()=>setProgress(0), 1000);
    };
    const formatCurrency = (amount)=>{
        if (!amount) return "-";
        return new Intl.NumberFormat("sv-SE", {
            style: "currency",
            currency: "SEK",
            maximumFractionDigits: 0
        }).format(amount);
    };
    const formatDate = (dateStr)=>{
        if (!dateStr) return "-";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("sv-SE");
        } catch  {
            return dateStr;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToolPanel"], {
        tool: "vinnova",
        title: "Vinnova Projekt",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__["Lightbulb"], {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
            lineNumber: 147,
            columnNumber: 13
        }, void 0),
        isOpen: true,
        onClose: onClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToolTabs"], {
                tool: "vinnova",
                tabs: TABS,
                activeTab: activeTab,
                onTabChange: setActiveTab
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tool-content space-y-4",
                children: [
                    activeTab === "search" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: "Sök Vinnova-projekt"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 163,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Bolagsnamn...",
                                        value: query,
                                        onChange: (e)=>setQuery(e.target.value),
                                        onKeyDown: (e)=>e.key === "Enter" && handleSearch(),
                                        className: "w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 164,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Org.nummer (valfritt)...",
                                                value: orgNr,
                                                onChange: (e)=>setOrgNr(e.target.value),
                                                onKeyDown: (e)=>e.key === "Enter" && handleSearch(),
                                                className: "flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 173,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleSearch,
                                                disabled: isSearching,
                                                className: "btn-primary px-4",
                                                children: isSearching ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-4 h-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                    lineNumber: 187,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                    lineNumber: 189,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 181,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 172,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                lineNumber: 162,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                        status: status
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 197,
                                        columnNumber: 15
                                    }, this),
                                    progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground font-mono",
                                        children: [
                                            progress,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 199,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                lineNumber: 196,
                                columnNumber: 13
                            }, this),
                            progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProgressBar"], {
                                tool: "vinnova",
                                progress: progress
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                lineNumber: 206,
                                columnNumber: 15
                            }, this),
                            searchResult && !selectedProject && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: [
                                            "Projekt (",
                                            searchResult.projects.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 212,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2 max-h-72 overflow-y-auto",
                                        children: searchResult.projects.map((project)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSelectedProject(project),
                                                className: "w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-medium text-sm line-clamp-2",
                                                        children: project.titel
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 222,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 text-xs text-muted-foreground mt-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-mono",
                                                                children: project.diarienummer
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 224,
                                                                columnNumber: 25
                                                            }, this),
                                                            project.programnamn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "•"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                        lineNumber: 227,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "truncate",
                                                                        children: project.programnamn
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                        lineNumber: 228,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 223,
                                                        columnNumber: 23
                                                    }, this),
                                                    project.vinnovaBidrag && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-emerald-500 mt-1",
                                                        children: [
                                                            "Bidrag: ",
                                                            formatCurrency(project.vinnovaBidrag)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 233,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, project.id || project.diarienummer, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 217,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 215,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                lineNumber: 211,
                                columnNumber: 15
                            }, this),
                            selectedProject && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-label",
                                                children: "Projektdetaljer"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 247,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSelectedProject(null),
                                                className: "text-xs text-muted-foreground hover:text-foreground",
                                                children: "Tillbaka"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 248,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 246,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4 rounded-lg border border-border bg-secondary/50 space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-semibold",
                                                        children: selectedProject.titel
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 257,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-muted-foreground font-mono mt-1",
                                                        children: selectedProject.diarienummer
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 258,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 256,
                                                columnNumber: 19
                                            }, this),
                                            selectedProject.programnamn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-muted-foreground",
                                                        children: "Program:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 265,
                                                        columnNumber: 23
                                                    }, this),
                                                    " ",
                                                    selectedProject.programnamn
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 264,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-3 text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                                className: "w-3.5 h-3.5 text-muted-foreground"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 272,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-muted-foreground",
                                                                children: "Start:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 273,
                                                                columnNumber: 23
                                                            }, this),
                                                            " ",
                                                            formatDate(selectedProject.startdatum)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 271,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                                className: "w-3.5 h-3.5 text-muted-foreground"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 277,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-muted-foreground",
                                                                children: "Slut:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 278,
                                                                columnNumber: 23
                                                            }, this),
                                                            " ",
                                                            formatDate(selectedProject.slutdatum)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 276,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                                                className: "w-3.5 h-3.5 text-muted-foreground"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 282,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-muted-foreground",
                                                                children: "Budget:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 283,
                                                                columnNumber: 23
                                                            }, this),
                                                            " ",
                                                            formatCurrency(selectedProject.totalbudget)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 281,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                                                className: "w-3.5 h-3.5 text-emerald-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 287,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-muted-foreground",
                                                                children: "Bidrag:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 288,
                                                                columnNumber: 23
                                                            }, this),
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-emerald-500",
                                                                children: formatCurrency(selectedProject.vinnovaBidrag)
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 289,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 286,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 270,
                                                columnNumber: 19
                                            }, this),
                                            selectedProject.koordinator && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-muted-foreground mb-1",
                                                        children: "Koordinator"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 297,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm",
                                                        children: selectedProject.koordinator
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 298,
                                                        columnNumber: 23
                                                    }, this),
                                                    selectedProject.koordinatorOrgNr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-muted-foreground font-mono",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(selectedProject.koordinatorOrgNr)
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 300,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 296,
                                                columnNumber: 21
                                            }, this),
                                            selectedProject.deltagare && selectedProject.deltagare.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1 text-xs text-muted-foreground mb-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 310,
                                                                columnNumber: 25
                                                            }, this),
                                                            "Deltagare (",
                                                            selectedProject.deltagare.length,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 309,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1",
                                                        children: [
                                                            selectedProject.deltagare.slice(0, 5).map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-sm flex items-center justify-between",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: d.namn
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                            lineNumber: 316,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        d.orgNr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs text-muted-foreground font-mono",
                                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(d.orgNr)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                            lineNumber: 318,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, i, true, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                    lineNumber: 315,
                                                                    columnNumber: 27
                                                                }, this)),
                                                            selectedProject.deltagare.length > 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-muted-foreground",
                                                                children: [
                                                                    "+",
                                                                    selectedProject.deltagare.length - 5,
                                                                    " fler..."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                                lineNumber: 325,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 313,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 308,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: `https://www.vinnova.se/sok/?q=${encodeURIComponent(selectedProject.diarienummer)}`,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                        className: "w-3.5 h-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                        lineNumber: 339,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Öppna på Vinnova"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 333,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 255,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                lineNumber: 245,
                                columnNumber: 15
                            }, this),
                            searchHistory.length > 0 && !searchResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label text-xs",
                                        children: "Senaste sökningar"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 349,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-1",
                                        children: searchHistory.map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    setQuery(h.name);
                                                    setOrgNr(h.orgNr || "");
                                                },
                                                className: "px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80",
                                                children: h.name || h.orgNr
                                            }, i, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                                lineNumber: 352,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 350,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                lineNumber: 348,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    activeTab === "status" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium",
                                        children: "Aktivitetslogg"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 372,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                        status: status
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                        lineNumber: 373,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                lineNumber: 371,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LogPanel"], {
                                entries: logs,
                                maxHeight: 300
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                                lineNumber: 375,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                        lineNumber: 370,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx",
        lineNumber: 144,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KungorelserTool",
    ()=>KungorelserTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/scroll-text.js [app-ssr] (ecmascript) <export default as ScrollText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/funnel.js [app-ssr] (ecmascript) <export default as Filter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolTabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/StatusBadge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const TABS = [
    {
        id: "search",
        label: "Sök",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
            lineNumber: 29,
            columnNumber: 39
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "browse",
        label: "Bläddra",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__["ScrollText"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
            lineNumber: 30,
            columnNumber: 43
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "status",
        label: "Status",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
            lineNumber: 31,
            columnNumber: 42
        }, ("TURBOPACK compile-time value", void 0))
    }
];
const ANNOUNCEMENT_TYPES = [
    {
        id: "all",
        label: "Alla"
    },
    {
        id: "Konkurs",
        label: "Konkurser"
    },
    {
        id: "Konkursavslut",
        label: "Konkursavslut"
    },
    {
        id: "Likvidation",
        label: "Likvidationer"
    },
    {
        id: "Företagsrekonstruktion",
        label: "Rekonstruktion"
    }
];
function KungorelserTool({ onClose }) {
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("search");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedType, setSelectedType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("all");
    const [announcements, setAnnouncements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [browseAnnouncements, setBrowseAnnouncements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [types, setTypes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searchHistory, setSearchHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isSearching, setIsSearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isBrowsing, setIsBrowsing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const logIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const addLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message, type = "info")=>{
        const entry = {
            id: `log-${++logIdRef.current}`,
            timestamp: new Date(),
            message,
            type
        };
        setLogs((prev)=>[
                ...prev.slice(-99),
                entry
            ]);
        return entry;
    }, []);
    // Search for new announcements (triggers scraper)
    const handleSearch = async ()=>{
        if (!query.trim() || query.trim().length < 2) return;
        setIsSearching(true);
        setStatus("running");
        setProgress(10);
        setAnnouncements([]);
        addLog(`Söker kungörelser för "${query}"...`, "info");
        // Add to search history
        setSearchHistory((prev)=>{
            const exists = prev.find((q)=>q.toLowerCase() === query.toLowerCase());
            if (exists) return prev;
            return [
                query,
                ...prev.slice(0, 9)
            ];
        });
        try {
            setProgress(30);
            addLog("Anropar Bolagsverket POIT (kan ta en stund)...", "info");
            const response = await fetch("/api/kungorelser/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: query.trim(),
                    skipDetails: false,
                    detailLimit: 10
                })
            });
            setProgress(70);
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                throw new Error(errorData.error || `API returned ${response.status}`);
            }
            const data = await response.json();
            setProgress(90);
            if (data.announcements && data.announcements.length > 0) {
                setAnnouncements(data.announcements);
                addLog(`Hittade ${data.announcements.length} kungörelser`, "success");
            } else {
                addLog("Inga kungörelser hittades", "warning");
            }
            setProgress(100);
            setStatus("success");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
            setStatus("error");
        }
        setIsSearching(false);
        setTimeout(()=>setProgress(0), 1000);
    };
    // Browse existing announcements in database
    const loadBrowseAnnouncements = async ()=>{
        setIsBrowsing(true);
        setStatus("running");
        setProgress(20);
        addLog("Laddar sparade kungörelser...", "info");
        try {
            const params = new URLSearchParams({
                limit: "50"
            });
            if (selectedType !== "all") {
                params.set("type", selectedType);
            }
            const response = await fetch(`/api/kungorelser?${params.toString()}`);
            setProgress(60);
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            const data = await response.json();
            setProgress(90);
            setBrowseAnnouncements(data.announcements || []);
            setTypes(data.types || []);
            addLog(`Laddat ${data.announcements?.length || 0} kungörelser`, "success");
            setProgress(100);
            setStatus("success");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
            setStatus("error");
        }
        setIsBrowsing(false);
        setTimeout(()=>setProgress(0), 1000);
    };
    const formatDate = (dateStr)=>{
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("sv-SE");
        } catch  {
            return dateStr;
        }
    };
    const getTypeColor = (type)=>{
        const colors = {
            Konkurs: "text-red-500",
            Konkursavslut: "text-orange-500",
            Likvidation: "text-yellow-500",
            Företagsrekonstruktion: "text-blue-500"
        };
        return colors[type] || "text-muted-foreground";
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToolPanel"], {
        tool: "kungorelser",
        title: "Kungörelser",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__["ScrollText"], {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
            lineNumber: 190,
            columnNumber: 13
        }, void 0),
        isOpen: true,
        onClose: onClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToolTabs"], {
                tool: "kungorelser",
                tabs: TABS,
                activeTab: activeTab,
                onTabChange: setActiveTab
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                lineNumber: 194,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tool-content space-y-4",
                children: [
                    activeTab === "search" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: "Sök nya kungörelser"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 206,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Bolagsnamn eller org.nummer...",
                                                value: query,
                                                onChange: (e)=>setQuery(e.target.value),
                                                onKeyDown: (e)=>e.key === "Enter" && handleSearch(),
                                                className: "flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                lineNumber: 208,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleSearch,
                                                disabled: isSearching,
                                                className: "btn-primary px-4",
                                                children: isSearching ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-4 h-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                    lineNumber: 222,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                    lineNumber: 224,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                lineNumber: 216,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 207,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground",
                                        children: "Söker direkt mot Bolagsverket POIT. Kan ta upp till 30 sekunder."
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 228,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 205,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                        status: status
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 235,
                                        columnNumber: 15
                                    }, this),
                                    progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground font-mono",
                                        children: [
                                            progress,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 237,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 234,
                                columnNumber: 13
                            }, this),
                            progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProgressBar"], {
                                tool: "kungorelser",
                                progress: progress
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 244,
                                columnNumber: 15
                            }, this),
                            announcements.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: [
                                            "Resultat (",
                                            announcements.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 250,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2 max-h-80 overflow-y-auto",
                                        children: announcements.map((ann)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 rounded-lg border border-border bg-secondary/50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-start justify-between gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-medium text-sm",
                                                                children: ann.companyName
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                lineNumber: 258,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-xs font-medium ${getTypeColor(ann.type)}`,
                                                                children: ann.type
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                lineNumber: 259,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                        lineNumber: 257,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 text-xs text-muted-foreground mt-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-mono",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(ann.orgNumber)
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                lineNumber: 264,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "•"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                lineNumber: 265,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: formatDate(ann.date)
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                lineNumber: 266,
                                                                columnNumber: 25
                                                            }, this),
                                                            ann.caseNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "•"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                        lineNumber: 269,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: [
                                                                            "Mål: ",
                                                                            ann.caseNumber
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                        lineNumber: 270,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                        lineNumber: 263,
                                                        columnNumber: 23
                                                    }, this),
                                                    ann.detailText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground mt-2 line-clamp-2",
                                                        children: ann.detailText
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                        lineNumber: 275,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, ann.id, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                lineNumber: 253,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 251,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 249,
                                columnNumber: 15
                            }, this),
                            searchHistory.length > 0 && announcements.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label text-xs",
                                        children: "Senaste sökningar"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 288,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-1",
                                        children: searchHistory.map((q, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setQuery(q),
                                                className: "px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80",
                                                children: q
                                            }, i, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                lineNumber: 291,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 289,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 287,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    activeTab === "browse" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__["Filter"], {
                                                className: "w-3.5 h-3.5 text-muted-foreground"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                lineNumber: 310,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-medium",
                                                children: "Filtrera typ"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                lineNumber: 311,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 309,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: loadBrowseAnnouncements,
                                        disabled: isBrowsing,
                                        className: "btn-secondary text-xs gap-1.5",
                                        children: [
                                            isBrowsing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "w-3.5 h-3.5 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                lineNumber: 319,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                className: "w-3.5 h-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                lineNumber: 321,
                                                columnNumber: 19
                                            }, this),
                                            "Ladda"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 313,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 308,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 flex-wrap",
                                children: ANNOUNCEMENT_TYPES.map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelectedType(type.id),
                                        className: `filter-chip ${selectedType === type.id ? "active" : ""}`,
                                        children: type.label
                                    }, type.id, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 330,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 328,
                                columnNumber: 13
                            }, this),
                            progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProgressBar"], {
                                tool: "kungorelser",
                                progress: progress
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 341,
                                columnNumber: 15
                            }, this),
                            browseAnnouncements.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: [
                                            "Sparade kungörelser (",
                                            browseAnnouncements.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 347,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2 max-h-80 overflow-y-auto",
                                        children: browseAnnouncements.map((ann)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 rounded-lg border border-border bg-secondary/50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-start justify-between gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-medium text-sm",
                                                                children: ann.companyName
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                lineNumber: 355,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-xs font-medium ${getTypeColor(ann.type)}`,
                                                                children: ann.type
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                lineNumber: 356,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                        lineNumber: 354,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 text-xs text-muted-foreground mt-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-mono",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatOrgNr"])(ann.orgNumber)
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                lineNumber: 361,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "•"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                lineNumber: 362,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: formatDate(ann.date)
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                                lineNumber: 363,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                        lineNumber: 360,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, ann.id, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                lineNumber: 350,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 348,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 346,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "empty-state py-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__["ScrollText"], {
                                        className: "empty-state-icon w-10 h-10"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 371,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "empty-state-title text-sm",
                                        children: "Inga kungörelser"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 372,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "empty-state-description text-xs",
                                        children: 'Klicka på "Ladda" för att hämta sparade kungörelser.'
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 373,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 370,
                                columnNumber: 15
                            }, this),
                            types.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label text-xs",
                                        children: "Statistik"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 382,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-2",
                                        children: types.slice(0, 4).map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2 bg-secondary/50 rounded text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: getTypeColor(t.type),
                                                        children: t.type
                                                    }, void 0, false, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                        lineNumber: 386,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-muted-foreground ml-2",
                                                        children: [
                                                            t.count,
                                                            " st"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                        lineNumber: 387,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, t.type, true, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                                lineNumber: 385,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 383,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 381,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    activeTab === "status" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium",
                                        children: "Aktivitetslogg"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 399,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                        status: status
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                        lineNumber: 400,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 398,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LogPanel"], {
                                entries: logs,
                                maxHeight: 300
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                                lineNumber: 402,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                        lineNumber: 397,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx",
        lineNumber: 187,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RssTool",
    ()=>RssTool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rss$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rss$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/rss.js [app-ssr] (ecmascript) <export default as Rss>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/list.js [app-ssr] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ToolTabs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/LogPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/ProgressBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/shared/StatusBadge.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const TABS = [
    {
        id: "sources",
        label: "Källor",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
            lineNumber: 35,
            columnNumber: 43
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "add",
        label: "Lägg till",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
            lineNumber: 36,
            columnNumber: 42
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "status",
        label: "Status",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
            className: "w-3.5 h-3.5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
            lineNumber: 37,
            columnNumber: 42
        }, ("TURBOPACK compile-time value", void 0))
    }
];
const RSSHUB_TEMPLATES = [
    {
        id: "twitter",
        name: "Twitter/X",
        template: "https://rsshub.rssforever.com/twitter/user/{username}",
        placeholder: "Användarnamn (utan @)",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-4 h-4",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
            lineNumber: 47,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "youtube",
        name: "YouTube-kanal",
        template: "https://rsshub.rssforever.com/youtube/channel/{channelId}",
        placeholder: "Kanal-ID eller @handle",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-4 h-4",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                lineNumber: 59,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
            lineNumber: 58,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        id: "linkedin",
        name: "LinkedIn Company",
        template: "https://rsshub.rssforever.com/linkedin/company/{companyName}",
        placeholder: "Företagsnamn (URL-slug)",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-4 h-4",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
            lineNumber: 69,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }
];
function RssTool({ onClose }) {
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("sources");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [feeds, setFeeds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newFeedUrl, setNewFeedUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [newFeedName, setNewFeedName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [validation, setValidation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isValidating, setIsValidating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAdding, setIsAdding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedTemplate, setSelectedTemplate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [templateInput, setTemplateInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const logIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const addLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message, type = "info")=>{
        const entry = {
            id: `log-${++logIdRef.current}`,
            timestamp: new Date(),
            message,
            type
        };
        setLogs((prev)=>[
                ...prev.slice(-99),
                entry
            ]);
        return entry;
    }, []);
    // Load feeds on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        loadFeeds();
    }, []);
    const loadFeeds = async ()=>{
        setIsLoading(true);
        setStatus("running");
        setProgress(20);
        addLog("Laddar RSS-källor...", "info");
        try {
            const response = await fetch("/api/feeds");
            setProgress(60);
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            const data = await response.json();
            setProgress(90);
            setFeeds(data.feeds || []);
            addLog(`Laddat ${data.feeds?.length || 0} RSS-källor`, "success");
            setStatus("success");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
            setStatus("error");
        }
        setIsLoading(false);
        setProgress(100);
        setTimeout(()=>setProgress(0), 1000);
    };
    const validateUrl = async (url)=>{
        if (!url.trim()) return;
        setIsValidating(true);
        setValidation(null);
        addLog(`Validerar: ${url}`, "info");
        try {
            const response = await fetch("/api/feeds/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: url.trim()
                })
            });
            const data = await response.json();
            setValidation(data);
            if (data.valid) {
                addLog(`Giltig RSS-källa: ${data.feed?.title || url}`, "success");
                if (data.feed?.title && !newFeedName) {
                    setNewFeedName(data.feed.title);
                }
            } else {
                addLog(`Ogiltig källa: ${data.error || "Okänt fel"}`, "warning");
            }
        } catch (error) {
            addLog(`Valideringsfel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
            setValidation({
                valid: false,
                error: "Kunde inte validera"
            });
        }
        setIsValidating(false);
    };
    const addFeed = async ()=>{
        if (!newFeedUrl.trim() || !validation?.valid) return;
        setIsAdding(true);
        setStatus("running");
        setProgress(30);
        addLog(`Lägger till: ${newFeedName || newFeedUrl}`, "info");
        try {
            const response = await fetch("/api/feeds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: newFeedUrl.trim(),
                    name: newFeedName.trim() || undefined
                })
            });
            setProgress(70);
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                throw new Error(errorData.error || `API returned ${response.status}`);
            }
            const data = await response.json();
            setProgress(90);
            if (data.feed) {
                setFeeds((prev)=>[
                        data.feed,
                        ...prev
                    ]);
                addLog(`Lade till: ${data.feed.name}`, "success");
                setNewFeedUrl("");
                setNewFeedName("");
                setValidation(null);
                setActiveTab("sources");
            }
            setStatus("success");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
            setStatus("error");
        }
        setIsAdding(false);
        setProgress(100);
        setTimeout(()=>setProgress(0), 1000);
    };
    const deleteFeed = async (feed)=>{
        addLog(`Tar bort: ${feed.name}`, "info");
        try {
            const response = await fetch(`/api/feeds/${feed.id}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            setFeeds((prev)=>prev.filter((f)=>f.id !== feed.id));
            addLog(`Tog bort: ${feed.name}`, "success");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
        }
    };
    const toggleFeed = async (feed)=>{
        try {
            const response = await fetch(`/api/feeds/${feed.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    enabled: !feed.enabled
                })
            });
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            setFeeds((prev)=>prev.map((f)=>f.id === feed.id ? {
                        ...f,
                        enabled: !f.enabled
                    } : f));
            addLog(`${feed.enabled ? "Inaktiverade" : "Aktiverade"}: ${feed.name}`, "info");
        } catch (error) {
            addLog(`Fel: ${error instanceof Error ? error.message : "Okänt fel"}`, "error");
        }
    };
    const applyTemplate = (templateId)=>{
        const template = RSSHUB_TEMPLATES.find((t)=>t.id === templateId);
        if (template && templateInput.trim()) {
            const url = template.template.replace("{username}", templateInput.trim()).replace("{channelId}", templateInput.trim()).replace("{companyName}", templateInput.trim());
            setNewFeedUrl(url);
            setSelectedTemplate(null);
            setTemplateInput("");
            validateUrl(url);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToolPanel"], {
        tool: "rss",
        title: "RSS-hanterare",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rss$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rss$3e$__["Rss"], {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
            lineNumber: 275,
            columnNumber: 13
        }, void 0),
        isOpen: true,
        onClose: onClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ToolTabs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToolTabs"], {
                tool: "rss",
                tabs: TABS,
                activeTab: activeTab,
                onTabChange: setActiveTab
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                lineNumber: 279,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tool-content space-y-4",
                children: [
                    activeTab === "sources" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium",
                                        children: [
                                            "Dina RSS-källor (",
                                            feeds.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 290,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: loadFeeds,
                                        disabled: isLoading,
                                        className: "btn-secondary text-xs gap-1.5",
                                        children: [
                                            isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "w-3.5 h-3.5 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                lineNumber: 297,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                className: "w-3.5 h-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                lineNumber: 299,
                                                columnNumber: 19
                                            }, this),
                                            "Uppdatera"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 291,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 289,
                                columnNumber: 13
                            }, this),
                            progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$ProgressBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProgressBar"], {
                                tool: "rss",
                                progress: progress
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 306,
                                columnNumber: 15
                            }, this),
                            feeds.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2 max-h-80 overflow-y-auto",
                                children: feeds.map((feed)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `p-3 rounded-lg border border-border transition-colors ${feed.enabled ? "bg-secondary/50" : "bg-secondary/20 opacity-60"}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-medium text-sm truncate",
                                                            children: feed.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                            lineNumber: 320,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-muted-foreground truncate mt-0.5",
                                                            children: feed.url
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                            lineNumber: 321,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2 mt-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `text-xs px-1.5 py-0.5 rounded ${feed.enabled ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}`,
                                                                    children: feed.enabled ? "Aktiv" : "Inaktiv"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                    lineNumber: 325,
                                                                    columnNumber: 27
                                                                }, this),
                                                                feed.type && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs text-muted-foreground",
                                                                    children: feed.type
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                    lineNumber: 333,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                            lineNumber: 324,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                    lineNumber: 319,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>toggleFeed(feed),
                                                            className: "p-1.5 rounded hover:bg-secondary transition-colors",
                                                            title: feed.enabled ? "Inaktivera" : "Aktivera",
                                                            children: feed.enabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                className: "w-3.5 h-3.5 text-green-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                lineNumber: 346,
                                                                columnNumber: 29
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "w-3.5 h-3.5 text-muted-foreground"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                lineNumber: 348,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                            lineNumber: 340,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: feed.url,
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            className: "p-1.5 rounded hover:bg-secondary transition-colors",
                                                            title: "Öppna URL",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                                className: "w-3.5 h-3.5 text-muted-foreground"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                lineNumber: 358,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                            lineNumber: 351,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>deleteFeed(feed),
                                                            className: "p-1.5 rounded hover:bg-secondary transition-colors text-red-500",
                                                            title: "Ta bort",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                lineNumber: 365,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                            lineNumber: 360,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                            lineNumber: 318,
                                            columnNumber: 21
                                        }, this)
                                    }, feed.id, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 312,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 310,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "empty-state py-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rss$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rss$3e$__["Rss"], {
                                        className: "empty-state-icon w-10 h-10"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 374,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "empty-state-title text-sm",
                                        children: "Inga RSS-källor"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 375,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "empty-state-description text-xs",
                                        children: "Lägg till RSS-flöden för att hålla koll på nyheter."
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 376,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab("add"),
                                        className: "btn-primary text-xs mt-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                className: "w-3.5 h-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                lineNumber: 383,
                                                columnNumber: 19
                                            }, this),
                                            "Lägg till källa"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 379,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 373,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    activeTab === "add" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: "RSS/Atom URL"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 395,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "url",
                                                placeholder: "https://example.com/feed.xml",
                                                value: newFeedUrl,
                                                onChange: (e)=>{
                                                    setNewFeedUrl(e.target.value);
                                                    setValidation(null);
                                                },
                                                className: "flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                lineNumber: 397,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>validateUrl(newFeedUrl),
                                                disabled: isValidating || !newFeedUrl.trim(),
                                                className: "btn-secondary px-3",
                                                children: isValidating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-4 h-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                    lineNumber: 413,
                                                    columnNumber: 21
                                                }, this) : "Validera"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                lineNumber: 407,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 396,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 394,
                                columnNumber: 13
                            }, this),
                            validation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `p-3 rounded-lg border ${validation.valid ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`,
                                children: validation.valid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 text-green-500",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                    lineNumber: 431,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium",
                                                    children: "Giltig RSS-källa"
                                                }, void 0, false, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                    lineNumber: 432,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                            lineNumber: 430,
                                            columnNumber: 21
                                        }, this),
                                        validation.feed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-muted-foreground space-y-1",
                                            children: [
                                                validation.feed.title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "Titel: ",
                                                        validation.feed.title
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                    lineNumber: 436,
                                                    columnNumber: 51
                                                }, this),
                                                validation.feed.itemCount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "Artiklar: ",
                                                        validation.feed.itemCount
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                    lineNumber: 437,
                                                    columnNumber: 55
                                                }, this),
                                                validation.feed.type && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "Typ: ",
                                                        validation.feed.type
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                    lineNumber: 438,
                                                    columnNumber: 50
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                            lineNumber: 435,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                    lineNumber: 429,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-red-500",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                            lineNumber: 444,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm",
                                            children: validation.error || "Ogiltig källa"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                            lineNumber: 445,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                    lineNumber: 443,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 423,
                                columnNumber: 15
                            }, this),
                            validation?.valid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: "Namn (valfritt)"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 454,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Ange ett namn för källan...",
                                        value: newFeedName,
                                        onChange: (e)=>setNewFeedName(e.target.value),
                                        className: "w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 455,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 453,
                                columnNumber: 15
                            }, this),
                            validation?.valid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: addFeed,
                                disabled: isAdding,
                                className: "btn-primary w-full",
                                children: isAdding ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "w-4 h-4 animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                    lineNumber: 473,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                            lineNumber: 476,
                                            columnNumber: 21
                                        }, this),
                                        "Lägg till källa"
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 467,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3 pt-4 border-t border-border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-label",
                                        children: "RSSHub-mallar"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 485,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground",
                                        children: "Generera RSS-flöden från webbplatser utan inbyggt stöd."
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 486,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid gap-2",
                                        children: RSSHUB_TEMPLATES.map((template)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: selectedTemplate === template.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 rounded-lg border border-border bg-secondary space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                template.icon,
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-sm font-medium",
                                                                    children: template.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                    lineNumber: 497,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                            lineNumber: 495,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "text",
                                                                    placeholder: template.placeholder,
                                                                    value: templateInput,
                                                                    onChange: (e)=>setTemplateInput(e.target.value),
                                                                    onKeyDown: (e)=>e.key === "Enter" && applyTemplate(template.id),
                                                                    className: "flex-1 px-2 py-1.5 bg-background border border-border rounded text-sm",
                                                                    autoFocus: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                    lineNumber: 500,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>applyTemplate(template.id),
                                                                    disabled: !templateInput.trim(),
                                                                    className: "btn-primary px-3 py-1.5 text-xs",
                                                                    children: "Använd"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                    lineNumber: 509,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>{
                                                                        setSelectedTemplate(null);
                                                                        setTemplateInput("");
                                                                    },
                                                                    className: "btn-secondary px-2 py-1.5",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                        className: "w-3.5 h-3.5"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                        lineNumber: 523,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                                    lineNumber: 516,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                            lineNumber: 499,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                    lineNumber: 494,
                                                    columnNumber: 23
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setSelectedTemplate(template.id),
                                                    className: "w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors text-left",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "tool-menu-icon",
                                                            "data-tool": "rss",
                                                            children: template.icon
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                            lineNumber: 532,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm",
                                                            children: template.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                            lineNumber: 535,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                    lineNumber: 528,
                                                    columnNumber: 23
                                                }, this)
                                            }, template.id, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                                lineNumber: 492,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 490,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 484,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true),
                    activeTab === "status" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium",
                                        children: "Aktivitetslogg"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 548,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$StatusBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                        status: status
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                        lineNumber: 549,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 547,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$shared$2f$LogPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LogPanel"], {
                                entries: logs,
                                maxHeight: 300
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                                lineNumber: 551,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                        lineNumber: 546,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
                lineNumber: 286,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx",
        lineNumber: 272,
        columnNumber: 5
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/ToolHost.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToolHost",
    ()=>ToolHost
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$ToolProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/ToolProvider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$allabolag$2f$AllabolagTool$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/allabolag/AllabolagTool.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$bolagsverket$2f$BolagsverketTool$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/bolagsverket/BolagsverketTool.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$vinnova$2f$VinnovaTool$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/vinnova/VinnovaTool.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$kungorelser$2f$KungorelserTool$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/kungorelser/KungorelserTool.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$rss$2f$RssTool$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/rss/RssTool.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function ToolHost() {
    const { activeTool, closeTool } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$ToolProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTools"])();
    if (!activeTool) return null;
    const toolComponents = {
        allabolag: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$allabolag$2f$AllabolagTool$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AllabolagTool"],
        bolagsverket: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$bolagsverket$2f$BolagsverketTool$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BolagsverketTool"],
        vinnova: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$vinnova$2f$VinnovaTool$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VinnovaTool"],
        kungorelser: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$kungorelser$2f$KungorelserTool$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KungorelserTool"],
        rss: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$components$2f$tools$2f$rss$2f$RssTool$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RssTool"]
    };
    const ToolComponent = toolComponents[activeTool];
    if (!ToolComponent) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ToolComponent, {
        onClose: closeTool
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/tools/ToolHost.tsx",
        lineNumber: 27,
        columnNumber: 10
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/person-linker.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LinkedPersonText",
    ()=>LinkedPersonText,
    "PersonLink",
    ()=>PersonLink,
    "PersonLinkerProvider",
    ()=>PersonLinkerProvider,
    "usePersonLinker",
    ()=>usePersonLinker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const PersonLinkerContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    persons: {},
    isLoading: true
});
function PersonLinkerProvider({ children }) {
    const [persons, setPersons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function fetchPersons() {
            try {
                const res = await fetch("/api/person/names");
                if (res.ok) {
                    const data = await res.json();
                    setPersons(data.persons || {});
                }
            } catch (error) {
                console.error("Failed to fetch person names:", error);
            } finally{
                setIsLoading(false);
            }
        }
        fetchPersons();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PersonLinkerContext.Provider, {
        value: {
            persons,
            isLoading
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/person-linker.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
function usePersonLinker() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PersonLinkerContext);
}
function PersonLink({ name, className, personId, allabolagId }) {
    const { persons, isLoading } = usePersonLinker();
    // If we have a personId prop (internal DB ID), use it directly
    if (personId) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            href: `/person/${personId}`,
            className: className || "text-primary hover:underline font-medium",
            children: name
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/person-linker.tsx",
            lineNumber: 75,
            columnNumber: 7
        }, this);
    }
    // Wait for context to load before deciding
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: className,
            children: name
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/person-linker.tsx",
            lineNumber: 86,
            columnNumber: 12
        }, this);
    }
    // Priority 1: Look up by name in context (person exists in our DB)
    const personInfo = persons[name];
    if (personInfo) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            href: `/person/${personInfo.id}`,
            className: className || "text-primary hover:underline font-medium",
            children: name
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/person-linker.tsx",
            lineNumber: 93,
            columnNumber: 7
        }, this);
    }
    // Priority 2: If we have an allabolagId, link to the allabolag-based page (fallback)
    if (allabolagId) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            href: `/bolag/person/${allabolagId}?name=${encodeURIComponent(name)}`,
            className: className || "text-primary hover:underline font-medium",
            children: name
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/person-linker.tsx",
            lineNumber: 105,
            columnNumber: 7
        }, this);
    }
    // No match found - render as plain text
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: className,
        children: name
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/person-linker.tsx",
        lineNumber: 115,
        columnNumber: 10
    }, this);
}
function LinkedPersonText({ text, className }) {
    const { persons, isLoading } = usePersonLinker();
    const linkedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (isLoading || !text || Object.keys(persons).length === 0) {
            return text;
        }
        // Sort person names by length (longest first) to avoid partial matches
        const sortedNames = Object.keys(persons).sort((a, b)=>b.length - a.length);
        // Build regex pattern - escape special chars and join with OR
        const escapedNames = sortedNames.map((name)=>name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        if (escapedNames.length === 0) return text;
        const pattern = new RegExp(`(${escapedNames.join('|')})`, 'gi');
        const parts = text.split(pattern);
        return parts.map((part, index)=>{
            // Check if this part matches a person name (case-insensitive)
            const matchedName = sortedNames.find((name)=>name.toLowerCase() === part.toLowerCase());
            if (matchedName) {
                const personInfo = persons[matchedName];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: `/person/${personInfo.id}`,
                    className: "text-primary hover:underline font-medium",
                    children: part
                }, index, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/person-linker.tsx",
                    lineNumber: 157,
                    columnNumber: 11
                }, this);
            }
            return part;
        });
    }, [
        text,
        persons,
        isLoading
    ]);
    if (typeof linkedContent === "string") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: className,
            children: linkedContent
        }, void 0, false, {
            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/person-linker.tsx",
            lineNumber: 172,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: className,
        children: linkedContent
    }, void 0, false, {
        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/person-linker.tsx",
        lineNumber: 175,
        columnNumber: 10
    }, this);
}
}),
"[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatPanel",
    ()=>ChatPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-ssr] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/send.js [app-ssr] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/database.js [app-ssr] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/globe.js [app-ssr] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/node_modules/lucide-react/dist/esm/icons/building-2.js [app-ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/CLAUDE/projects/1. Loop Desk/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
// Tool name to Swedish label mapping
const TOOL_LABELS = {
    search_companies: {
        label: "Söker företag",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"]
    },
    get_company_details: {
        label: "Hämtar företagsinfo",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"]
    },
    search_announcements: {
        label: "Söker kungörelser",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"]
    },
    get_news: {
        label: "Hämtar nyheter",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"]
    },
    get_investors: {
        label: "Söker investerare",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"]
    },
    search_persons: {
        label: "Söker personer",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"]
    },
    compare_companies: {
        label: "Jämför företag",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"]
    },
    analyze_industry: {
        label: "Analyserar bransch",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"]
    },
    search_protocols: {
        label: "Söker protokoll",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"]
    },
    match_investors: {
        label: "Matchar investerare",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"]
    },
    manage_watchlist: {
        label: "Bevakningslistan",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"]
    },
    web_search: {
        label: "Söker på webben",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"]
    },
    web_search_20250305: {
        label: "Söker på webben",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"]
    }
};
function ChatPanel() {
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activeTool, setActiveTool] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const panelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Scroll to bottom when messages change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [
        messages,
        activeTool
    ]);
    // Focus input when panel opens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen) {
            setTimeout(()=>inputRef.current?.focus(), 300);
        }
    }, [
        isOpen
    ]);
    // Close panel when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleClickOutside(event) {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return ()=>document.removeEventListener("mousedown", handleClickOutside);
    }, [
        isOpen
    ]);
    // Close on Escape key
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleEscape(event) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return ()=>document.removeEventListener("keydown", handleEscape);
    }, [
        isOpen
    ]);
    const sendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!input.trim() || isLoading) return;
        const userMessage = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim()
        };
        const assistantMessageId = (Date.now() + 1).toString();
        const toolsUsed = [];
        setMessages((prev)=>[
                ...prev,
                userMessage
            ]);
        setInput("");
        setIsLoading(true);
        setActiveTool(null);
        // Add empty assistant message that will be streamed into
        setMessages((prev)=>[
                ...prev,
                {
                    id: assistantMessageId,
                    role: "assistant",
                    content: "",
                    toolsUsed: []
                }
            ]);
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [
                        ...messages,
                        userMessage
                    ].map((m)=>({
                            role: m.role,
                            content: m.content
                        }))
                })
            });
            if (!response.ok) {
                throw new Error("Failed to send message");
            }
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) {
                throw new Error("No response body");
            }
            // Read the stream
            let buffer = "";
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {
                    stream: true
                });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines){
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        if (data === "[DONE]") {
                            setActiveTool(null);
                            continue;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.tool) {
                                // Tool is being executed
                                setActiveTool(parsed.tool);
                                if (!toolsUsed.includes(parsed.tool)) {
                                    toolsUsed.push(parsed.tool);
                                    // Update the message with tools used
                                    setMessages((prev)=>prev.map((msg)=>msg.id === assistantMessageId ? {
                                                ...msg,
                                                toolsUsed: [
                                                    ...toolsUsed
                                                ]
                                            } : msg));
                                }
                            } else if (parsed.text) {
                                setActiveTool(null);
                                // Update the assistant message with the new text chunk
                                setMessages((prev)=>prev.map((msg)=>msg.id === assistantMessageId ? {
                                            ...msg,
                                            content: msg.content + parsed.text
                                        } : msg));
                            } else if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                        } catch  {
                        // Ignore parse errors for incomplete chunks
                        }
                    }
                }
            }
        } catch  {
            // Update the assistant message with error
            setMessages((prev)=>prev.map((msg)=>msg.id === assistantMessageId ? {
                        ...msg,
                        content: msg.content || "Något gick fel. Försök igen senare."
                    } : msg));
        } finally{
            setIsLoading(false);
            setActiveTool(null);
        }
    }, [
        input,
        isLoading,
        messages
    ]);
    const handleKeyDown = (e)=>{
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    // Simple markdown-like formatting
    const formatContent = (content)=>{
        // Split by double newlines for paragraphs
        const paragraphs = content.split(/\n\n+/);
        return paragraphs.map((paragraph, pIndex)=>{
            // Check for bullet points
            if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
                const items = paragraph.split("\n").filter(Boolean);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    className: "list-disc pl-4 space-y-1 my-2",
                    children: items.map((item, iIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: item.replace(/^- /, "")
                        }, iIndex, false, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                            lineNumber: 220,
                            columnNumber: 15
                        }, this))
                }, pIndex, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                    lineNumber: 218,
                    columnNumber: 11
                }, this);
            }
            // Check for numbered lists
            if (/^\d+\. /.test(paragraph)) {
                const items = paragraph.split("\n").filter(Boolean);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                    className: "list-decimal pl-4 space-y-1 my-2",
                    children: items.map((item, iIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: item.replace(/^\d+\. /, "")
                        }, iIndex, false, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                            lineNumber: 232,
                            columnNumber: 15
                        }, this))
                }, pIndex, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                    lineNumber: 230,
                    columnNumber: 11
                }, this);
            }
            // Check for headers (** at start)
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-semibold mt-3 mb-1",
                    children: paragraph.slice(2, -2)
                }, pIndex, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                    lineNumber: 241,
                    columnNumber: 11
                }, this);
            }
            // Regular paragraph with bold text support
            const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "my-1",
                children: parts.map((part, partIndex)=>{
                    if (part.startsWith("**") && part.endsWith("**")) {
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: part.slice(2, -2)
                        }, partIndex, false, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                            lineNumber: 253,
                            columnNumber: 22
                        }, this);
                    }
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: part
                    }, partIndex, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                        lineNumber: 255,
                        columnNumber: 20
                    }, this);
                })
            }, pIndex, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                lineNumber: 250,
                columnNumber: 9
            }, this);
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(true),
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("fixed bottom-6 right-6 z-50 flex items-center justify-center", "w-14 h-14 rounded-full bg-primary text-primary-foreground", "shadow-lg hover:shadow-xl transition-all duration-200", "hover:scale-105 active:scale-95", isOpen && "opacity-0 pointer-events-none"),
                "aria-label": "Öppna chat",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                    className: "w-6 h-6"
                }, void 0, false, {
                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                    lineNumber: 276,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                lineNumber: 265,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 pointer-events-none"),
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                lineNumber: 280,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: panelRef,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] max-w-full", "bg-background border-l border-border shadow-2xl", "flex flex-col transition-transform duration-300 ease-out", isOpen ? "translate-x-0" : "translate-x-full"),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-5 py-4 border-b border-border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                            className: "w-4 h-4 text-primary"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                            lineNumber: 302,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                        lineNumber: 301,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "font-medium text-sm",
                                                children: "LoopDesk Assistant"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                                lineNumber: 305,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "AI med databasåtkomst"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                                lineNumber: 306,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                        lineNumber: 304,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                lineNumber: 300,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setIsOpen(false),
                                className: "p-2 rounded-lg hover:bg-secondary transition-colors",
                                "aria-label": "Stäng chat",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-5 h-5 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                    lineNumber: 314,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                lineNumber: 309,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                        lineNumber: 299,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto p-4 space-y-4",
                        children: [
                            messages.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                            className: "w-6 h-6 text-primary"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                            lineNumber: 323,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                        lineNumber: 322,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-medium mb-2",
                                        children: "Hej!"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                        lineNumber: 325,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-muted-foreground max-w-[280px] mx-auto mb-4",
                                        children: "Jag kan hjälpa dig med företagsinfo, nyheter, kungörelser och investerare."
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                        lineNumber: 326,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap justify-center gap-2 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setInput("Vilka cleantech-bolag finns i Stockholm?"),
                                                className: "px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors",
                                                children: "Cleantech i Stockholm"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                                lineNumber: 330,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setInput("Visa senaste kungörelserna"),
                                                className: "px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors",
                                                children: "Senaste kungörelser"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                                lineNumber: 336,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setInput("Vilka VC:s investerar i impact?"),
                                                className: "px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors",
                                                children: "Impact-investerare"
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                                lineNumber: 342,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                        lineNumber: 329,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                lineNumber: 321,
                                columnNumber: 13
                            }, this),
                            messages.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex", message.role === "user" ? "justify-end" : "justify-start"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("max-w-[90%] rounded-2xl px-4 py-2.5 text-sm", message.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"),
                                        children: [
                                            message.role === "assistant" && message.toolsUsed && message.toolsUsed.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-1.5 mb-2 pb-2 border-b border-border/50",
                                                children: message.toolsUsed.map((tool)=>{
                                                    const toolInfo = TOOL_LABELS[tool] || {
                                                        label: tool,
                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"]
                                                    };
                                                    const Icon = toolInfo.icon;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/50 text-xs text-muted-foreground",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                className: "w-3 h-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                                                lineNumber: 379,
                                                                columnNumber: 27
                                                            }, this),
                                                            toolInfo.label
                                                        ]
                                                    }, tool, true, {
                                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                                        lineNumber: 375,
                                                        columnNumber: 25
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                                lineNumber: 370,
                                                columnNumber: 19
                                            }, this),
                                            message.role === "user" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "whitespace-pre-wrap",
                                                children: message.content
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                                lineNumber: 388,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "prose prose-sm dark:prose-invert max-w-none",
                                                children: formatContent(message.content)
                                            }, void 0, false, {
                                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                                lineNumber: 390,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                        lineNumber: 360,
                                        columnNumber: 15
                                    }, this)
                                }, message.id, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                    lineNumber: 353,
                                    columnNumber: 13
                                }, this)),
                            activeTool && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-start",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            className: "w-4 h-4 animate-spin text-primary"
                                        }, void 0, false, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                            lineNumber: 402,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-muted-foreground",
                                            children: [
                                                TOOL_LABELS[activeTool]?.label || activeTool,
                                                "..."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                            lineNumber: 403,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                    lineNumber: 401,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                lineNumber: 400,
                                columnNumber: 13
                            }, this),
                            isLoading && !activeTool && messages[messages.length - 1]?.content === "" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-start",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-secondary rounded-2xl rounded-bl-md px-4 py-3",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "w-4 h-4 animate-spin text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                        lineNumber: 414,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                    lineNumber: 413,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                lineNumber: 412,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ref: messagesEndRef
                            }, void 0, false, {
                                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                lineNumber: 419,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                        lineNumber: 319,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-t border-border",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-end gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    ref: inputRef,
                                    value: input,
                                    onChange: (e)=>setInput(e.target.value),
                                    onKeyDown: handleKeyDown,
                                    placeholder: "Fråga om företag, nyheter, investerare...",
                                    rows: 1,
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex-1 resize-none rounded-xl border border-border bg-secondary/50", "px-4 py-3 text-sm placeholder:text-muted-foreground", "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary", "max-h-32 min-h-[48px]"),
                                    style: {
                                        height: "auto",
                                        minHeight: "48px"
                                    },
                                    onInput: (e)=>{
                                        const target = e.target;
                                        target.style.height = "auto";
                                        target.style.height = Math.min(target.scrollHeight, 128) + "px";
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                    lineNumber: 425,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: sendMessage,
                                    disabled: !input.trim() || isLoading,
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center justify-center w-12 h-12 rounded-xl", "bg-primary text-primary-foreground", "hover:bg-primary/90 transition-colors", "disabled:opacity-50 disabled:cursor-not-allowed"),
                                    "aria-label": "Skicka meddelande",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$CLAUDE$2f$projects$2f$1$2e$__Loop__Desk$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                        lineNumber: 459,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                                    lineNumber: 448,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                            lineNumber: 424,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                        lineNumber: 423,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/CLAUDE/projects/1. Loop Desk/src/components/chat/ChatPanel.tsx",
                lineNumber: 289,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# debugId=fbcfc0b6-7bb8-65b0-05c4-c859216046bd
//# sourceMappingURL=%5Broot-of-the-server%5D__6c688eac._.js.map