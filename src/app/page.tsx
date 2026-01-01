import Link from "next/link";
import { Newspaper, Building2, Eye } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16">
      {/* Title */}
      <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-16">
        LoopDesk
      </h1>

      {/* Navigation Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
        {/* Nyhetsflöde */}
        <Link href="/nyheter" className="group">
          <div className="h-full p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all hover:shadow-xl hover:border-blue-500/50 hover:scale-[1.02]">
            <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Newspaper className="h-7 w-7 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
              Nyhetsflöde
            </h2>
          </div>
        </Link>

        {/* Bevakningslista */}
        <Link href="/bevakning" className="group">
          <div className="h-full p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all hover:shadow-xl hover:border-emerald-500/50 hover:scale-[1.02]">
            <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <Eye className="h-7 w-7 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              Bevakningslista
            </h2>
          </div>
        </Link>

        {/* Bolagsinformation */}
        <Link href="/bolag" className="group">
          <div className="h-full p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all hover:shadow-xl hover:border-violet-500/50 hover:scale-[1.02]">
            <div className="h-14 w-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6">
              <Building2 className="h-7 w-7 text-violet-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-violet-500 transition-colors">
              Bolagsinformation
            </h2>
          </div>
        </Link>
      </div>
    </div>
  );
}
