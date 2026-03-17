"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useWorkspaceApi } from "@/lib/workspace-api";
import WorkspaceLayout from "@/components/workspace-layout";

const STAFF_TOKEN_KEY = "staff_token";

export default function WorkspaceLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const isWorkspaceApi = useWorkspaceApi();
  const [loading, setLoading] = useState(true);

  const isPublicAuthPage =
    pathname?.includes("/login") ||
    pathname?.includes("/forgot-password") ||
    pathname?.includes("/reset-password");

  useEffect(() => {
    if (!isWorkspaceApi) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    if (isPublicAuthPage) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    const token =
      typeof window !== "undefined" ? localStorage.getItem(STAFF_TOKEN_KEY) : null;
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }
    queueMicrotask(() => setLoading(false));
  }, [router, locale, isPublicAuthPage, isWorkspaceApi]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--cyan-500)", borderTopColor: "transparent" }}
          aria-hidden="true"
        />
      </div>
    );
  }

  if (!isWorkspaceApi) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
        <p style={{ color: "var(--foreground-muted)" }}>
          Workspace is not configured. Set NEXT_PUBLIC_USE_WORKSPACE_API and
          NEXT_PUBLIC_WORKSPACE_API_URL.
        </p>
      </div>
    );
  }

  if (isPublicAuthPage) {
    return <>{children}</>;
  }

  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
