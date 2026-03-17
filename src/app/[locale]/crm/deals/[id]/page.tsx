'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';
import { WORKSPACE_API_PATHS } from '@/lib/workspace-api-paths';

interface Deal {
  id: number;
  org_id: string;
  titulo: string;
  valor: number | string | null;
  etapa_id: number | null;
  responsavel_id: number | null;
  contato_id: number | null;
  lead_id: number | null;
  data_fechamento: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function WorkspaceCrmDealDetailPage() {
  const locale = useLocale();
  const params = useParams();
  const id = typeof params.id === 'string' ? parseInt(params.id, 10) : Number(params.id);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getStaffToken();
    if (!token || Number.isNaN(id)) return;
    queueMicrotask(() => setLoading(true));
    workspaceFetch(WORKSPACE_API_PATHS.CRM.DEAL_DETAIL(id), { token })
      .then((r) => {
        if (!r.ok) {
          setError('Deal não encontrado');
          return null;
        }
        return r.json();
      })
      .then(setDeal)
      .catch(() => setError('Falha ao carregar'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
        <Link href={`/${locale}/crm/funil`} className="text-blue-400 hover:underline">
          Voltar ao funil
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={`/${locale}/crm/funil`}
          className="flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Funil
        </Link>
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">{deal!.titulo}</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-400">Valor</dt>
            <dd className="text-white">
              {deal!.valor != null ? `R$ ${Number(deal!.valor).toLocaleString('pt-BR')}` : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Status</dt>
            <dd className="text-white">{deal!.status}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Data fechamento</dt>
            <dd className="text-white">
              {deal!.data_fechamento
                ? new Date(deal!.data_fechamento).toLocaleDateString(locale)
                : '-'}
            </dd>
          </div>
          {deal!.lead_id && (
            <div>
              <dt className="text-slate-400">Lead</dt>
              <dd>
                <Link
                  href={`/${locale}/crm/leads/${deal!.lead_id}`}
                  className="text-blue-400 hover:underline"
                >
                  Ver lead #{deal!.lead_id}
                </Link>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
