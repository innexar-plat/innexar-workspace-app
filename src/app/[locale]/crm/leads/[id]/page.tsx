'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, AlertCircle, ArrowLeft, Briefcase } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';
import { WORKSPACE_API_PATHS } from '@/lib/workspace-api-paths';

interface Lead {
  id: number;
  org_id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  origem: string | null;
  status: string;
  score: number | null;
  responsavel_id: number | null;
  contact_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: number;
  tipo: string;
  descricao: string | null;
  data: string;
  usuario_id: number | null;
  lead_id: number | null;
  deal_id: number | null;
}

interface Task {
  id: number;
  titulo: string;
  descricao: string | null;
  data_vencimento: string | null;
  status: string;
  usuario_id: number | null;
  relacionado_tipo: string | null;
  relacionado_id: number | null;
}

interface PipelineWithStages {
  id: number;
  nome: string;
  stages: { id: number; nome: string; ordem: number }[];
}

export default function WorkspaceCrmLeadDetailPage() {
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? parseInt(params.id, 10) : Number(params.id);
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const token = getStaffToken();
    if (!token || Number.isNaN(id)) return;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const [rLead, rAct, rTask] = await Promise.all([
          workspaceFetch(WORKSPACE_API_PATHS.CRM.LEAD_DETAIL(id), { token }),
          workspaceFetch(WORKSPACE_API_PATHS.CRM.ACTIVITIES({ lead_id: id }), { token }),
          workspaceFetch(WORKSPACE_API_PATHS.CRM.TASKS({ relacionado_tipo: 'lead', relacionado_id: id }), { token }),
        ]);
        if (!rLead.ok) {
          setError('Lead não encontrado');
          return;
        }
        const [l, actList, taskList] = await Promise.all([
          rLead.json() as Promise<Lead>,
          rAct.ok ? (rAct.json() as Promise<Activity[]>) : Promise.resolve([]),
          rTask.ok ? (rTask.json() as Promise<Task[]>) : Promise.resolve([]),
        ]);
        setLead(l);
        setActivities(actList);
        setTasks(taskList);
      } catch {
        setError('Falha ao carregar');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleConvertToDeal = async () => {
    const token = getStaffToken();
    if (!token || !lead) return;
    setConverting(true);
    setError('');
    const pipelinesRes = await workspaceFetch(WORKSPACE_API_PATHS.CRM.PIPELINE, { token });
    if (!pipelinesRes.ok) {
      setError('Falha ao carregar pipeline');
      setConverting(false);
      return;
    }
    const pipelines: PipelineWithStages[] = await pipelinesRes.json();
    const pipeline = pipelines[0];
    const firstStageId = pipeline?.stages?.[0]?.id;
    if (!firstStageId) {
      setError('Nenhum pipeline com etapas configurado.');
      setConverting(false);
      return;
    }
    const createRes = await workspaceFetch(WORKSPACE_API_PATHS.CRM.DEALS(), {
      token,
      method: 'POST',
      body: JSON.stringify({
        titulo: `Deal: ${lead.nome}`,
        lead_id: lead.id,
        etapa_id: firstStageId,
      }),
    });
    setConverting(false);
    if (createRes.ok) {
      const deal = await createRes.json();
      router.push(`/${locale}/crm/funil?deal=${deal.id}`);
    } else {
      const data = await createRes.json().catch(() => ({}));
      setError(Array.isArray(data.detail) ? String(data.detail[0]) : (data.detail ?? 'Falha ao criar deal'));
    }
  };

  if (loading || lead === null) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
        <Link href={`/${locale}/crm/leads`} className="text-blue-400 hover:underline">
          Voltar aos leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={`/${locale}/crm/leads`}
          className="flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Leads
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">{lead!.nome}</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-400">Email</dt>
            <dd className="text-white">{lead!.email ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Telefone</dt>
            <dd className="text-white">{lead!.telefone ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Origem</dt>
            <dd className="text-white">{lead!.origem ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Status</dt>
            <dd className="text-white">{lead!.status}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <button
            onClick={handleConvertToDeal}
            disabled={converting || lead!.status === 'convertido'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium"
          >
            {converting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Briefcase className="w-5 h-5" />
            )}
            {lead!.status === 'convertido' ? 'Já convertido' : 'Converter em deal'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Atividades</h3>
          {activities.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhuma atividade.</p>
          ) : (
            <ul className="space-y-2">
              {activities.map((a) => (
                <li key={a.id} className="text-sm border-b border-white/5 pb-2">
                  <span className="text-slate-400">{a.tipo}</span>
                  {a.descricao && <p className="text-white mt-1">{a.descricao}</p>}
                  <p className="text-slate-500 text-xs mt-1">{new Date(a.data).toLocaleString(locale)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Tarefas</h3>
          {tasks.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhuma tarefa.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="text-sm border-b border-white/5 pb-2">
                  <p className="text-white font-medium">{t.titulo}</p>
                  {t.data_vencimento && (
                    <p className="text-slate-500 text-xs">
                      Vencimento: {new Date(t.data_vencimento).toLocaleDateString(locale)}
                    </p>
                  )}
                  <p className="text-slate-400 text-xs">{t.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
