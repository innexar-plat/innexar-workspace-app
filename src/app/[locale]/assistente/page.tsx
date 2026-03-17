"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { workspaceFetchStaff } from "@/lib/workspace-api";
import { WORKSPACE_API_PATHS } from "@/lib/workspace-api-paths";

interface OpenClawSession {
  enabled: boolean;
  url: string;
  message?: string;
  expires_in?: number;
}

export default function AssistentePage() {
  const [session, setSession] = useState<OpenClawSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(() => {
    queueMicrotask(() => setLoading(true));
    setError(null);
    workspaceFetchStaff(WORKSPACE_API_PATHS.OPENCLAW.SESSION)
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao obter sessão do assistente");
        return r.json();
      })
      .then((data: OpenClawSession) => setSession(data))
      .catch(() => setError("Não foi possível carregar o Assistente IA. Tente novamente."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    queueMicrotask(() => loadSession());
  }, [loadSession]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-[var(--muted-foreground)]">
        <Loader2 className="h-10 w-10 animate-spin" aria-hidden />
        <p>Carregando interface do assistente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="h-12 w-12 text-destructive" aria-hidden />
        <p className="text-center text-[var(--foreground)]">{error}</p>
        <button
          type="button"
          onClick={loadSession}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!session?.enabled || !session.url) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <Sparkles className="h-14 w-14 text-[var(--muted-foreground)]" aria-hidden />
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Assistente IA (OpenClaw)
        </h2>
        <p className="max-w-md text-[var(--muted-foreground)]">
          {session?.message ?? "O assistente não está configurado. Defina OPENCLAW_GATEWAY_URL no backend para exibir a interface completa (Control UI, WebChat e WhatsApp via QR code)."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-var(--header-height,4rem))] w-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <iframe
          title="Assistente IA - OpenClaw (Control UI, WebChat, WhatsApp)"
          src={session.url}
          className="h-full w-full min-h-0 flex-1 border-0"
          allow="clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
