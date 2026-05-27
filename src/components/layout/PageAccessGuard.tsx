"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface PageAccessGuardProps {
  children: React.ReactNode;
}

type AccessState = "loading" | "authorized" | "denied";

export default function PageAccessGuard({ children }: PageAccessGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [reason, setReason] = useState<string>("");
  const firstCheckDone = useRef(false);
  const lastCheckedPath = useRef<string | null>(null);

  // Check access whenever pathname changes
  useEffect(() => {
    // Don't check until auth is loaded
    if (authLoading) return;

    // Don't re-check the same path
    if (lastCheckedPath.current === pathname && firstCheckDone.current) return;

    let cancelled = false;

    async function checkAccess() {
      try {
        const res = await fetch(
          `/api/role-access/check?path=${encodeURIComponent(pathname)}`,
        );

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setAccessState(data.authorized ? "authorized" : "denied");
            setReason(data.reason || "");
            lastCheckedPath.current = pathname;
            firstCheckDone.current = true;
          }
        } else {
          // API error - allow access as failsafe
          if (!cancelled) {
            setAccessState("authorized");
            lastCheckedPath.current = pathname;
            firstCheckDone.current = true;
          }
        }
      } catch (error) {
        // Network error - allow access as failsafe
        console.error("Page access check failed:", error);
        if (!cancelled) {
          setAccessState("authorized");
          lastCheckedPath.current = pathname;
          firstCheckDone.current = true;
        }
      }
    }

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname, authLoading]);

  // Show loading state
  if (accessState === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            Checking access permissions...
          </p>
        </div>
      </div>
    );
  }

  // Show denied state
  if (accessState === "denied") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Warning Icon */}
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Not Authorized
          </h2>

          {/* Message */}
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {reason || "You do not have permission to access this page."}
          </p>

          {/* Action Button */}
          {/* <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Dashboard
          </button> */}
        </div>
      </div>
    );
  }

  // Authorized — render children
  return <>{children}</>;
}
