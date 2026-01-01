import Link from "next/link";
import { Newspaper, Building2, Eye, Bell } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
          Redaktionens verktyg
        </p>
        <h1 className="mt-6 text-6xl md:text-7xl font-semibold tracking-tight font-display">
          Loop Desk
        </h1>
        <p className="mt-4 text-base md:text-lg text-gray-500">
          En enkel, modern och relevant arbetsyta for nyhetsredaktionen.
        </p>
      </div>

      <div className="mt-14 w-full max-w-3xl">
        <div className="stagger-fade-in grid gap-3">
          <Link
            href="/nyheter"
            className="group flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white/80 px-6 py-4 transition-all hover:border-gray-300 hover:bg-white hover:shadow-lg dark:border-gray-800/80 dark:bg-gray-900/80 dark:hover:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Nyhetsflode
                </p>
                <p className="text-sm text-gray-500">Kallor, artiklar och prioritering</p>
              </div>
            </div>
            <span className="text-xs uppercase tracking-widest text-gray-400 group-hover:text-gray-600">
              Oppna
            </span>
          </Link>

          <Link
            href="/bolag"
            className="group flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white/80 px-6 py-4 transition-all hover:border-gray-300 hover:bg-white hover:shadow-lg dark:border-gray-800/80 dark:bg-gray-900/80 dark:hover:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Bolagsinfo
                </p>
                <p className="text-sm text-gray-500">Fakta, ekonomi och struktur</p>
              </div>
            </div>
            <span className="text-xs uppercase tracking-widest text-gray-400 group-hover:text-gray-600">
              Oppna
            </span>
          </Link>

          <Link
            href="/bevakning"
            className="group flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white/80 px-6 py-4 transition-all hover:border-gray-300 hover:bg-white hover:shadow-lg dark:border-gray-800/80 dark:bg-gray-900/80 dark:hover:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Bevakaren
                </p>
                <p className="text-sm text-gray-500">Listor, filter och bevakningar</p>
              </div>
            </div>
            <span className="text-xs uppercase tracking-widest text-gray-400 group-hover:text-gray-600">
              Oppna
            </span>
          </Link>

          <Link
            href="/bolaghandelser"
            className="group flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white/80 px-6 py-4 transition-all hover:border-gray-300 hover:bg-white hover:shadow-lg dark:border-gray-800/80 dark:bg-gray-900/80 dark:hover:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Handelser
                </p>
                <p className="text-sm text-gray-500">Kungorelser och signaler</p>
              </div>
            </div>
            <span className="text-xs uppercase tracking-widest text-gray-400 group-hover:text-gray-600">
              Oppna
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
