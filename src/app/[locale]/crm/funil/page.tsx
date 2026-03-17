'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Briefcase } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';
import { WORKSPACE_API_PATHS } from '@/lib/workspace-api-paths';

interface PipelineStage {
  id: number;
  pipeline_id: number;
  nome: string;
  ordem: number;
  probabilidade: number | null;
}

interface PipelineWithStages {
  id: number;
  org_id: string;
  nome: string;
  stages: PipelineStage[];
}

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

export default function WorkspaceCrmFunilPage() {
  const locale = useLocale();
  const [pipelines, setPipelines] = useState<PipelineWithStages[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);

  useEffect(() => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    Promise.all([
      workspaceFetch(WORKSPACE_API_PATHS.CRM.PIPELINE, { token }).then((r) =>
        r.ok ? r.json() : []
      ),
      workspaceFetch(WORKSPACE_API_PATHS.CRM.DEALS(), { token }).then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([list, dealList]: [PipelineWithStages[], Deal[]]) => {
        setPipelines(list);
        setDeals(dealList);
        if (list.length > 0) {
          setSelectedPipelineId((prev) => (prev === null ? list[0].id : prev));
        }
      })
      .catch(() => setError('Falha ao carregar'))
      .finally(() => setLoading(false));
  }, []);

  const currentPipeline = useMemo(
    () => pipelines.find((p) => p.id === selectedPipelineId) ?? pipelines[0],
    [pipelines, selectedPipelineId]
  );

  const dealsByStage = useMemo(() => {
    const map: Record<number, Deal[]> = {};
    if (!currentPipeline?.stages) return map;
    for (const s of currentPipeline.stages) {
      map[s.id] = [];
    }
    for (const d of deals) {
      if (d.etapa_id != null && map[d.etapa_id]) {
        map[d.etapa_id].push(d);
      } else if (d.etapa_id == null && currentPipeline.stages.length > 0) {
        const firstId = currentPipeline.stages[0].id;
        if (!map[firstId]) map[firstId] = [];
        map[firstId].push(d);
      }
    }
    return map;
  }, [deals, currentPipeline]);

  const updateDealStage = useCallback(async (dealId: number, etapaId: number) => {
    const token = getStaffToken();
    if (!token) return;
    const res = await workspaceFetch(WORKSPACE_API_PATHS.CRM.DEAL_MOVE(dealId), {
      token,
      method: 'PATCH',
      body: JSON.stringify({ etapa_id: etapaId }),
    });
    if (res.ok) {
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, etapa_id: etapaId } : d))
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  const stages = currentPipeline?.stages ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Funil de vendas</h2>
        {pipelines.length > 1 && (
          <select
            value={selectedPipelineId ?? ''}
            onChange={(e) => setSelectedPipelineId(Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
          >
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {stages.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Briefcase className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <p>Nenhum pipeline com etapas. Configure em CRM / Pipeline.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 w-72 bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"
            >
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                {stage.nome} ({(dealsByStage[stage.id] ?? []).length})
              </h3>
              <div className="space-y-2 min-h-[120px]">
                {(dealsByStage[stage.id] ?? []).map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <Link
                      href={`/${locale}/crm/deals/${d.id}`}
                      className="block"
                    >
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white text-sm truncate">{d.titulo}</p>
                          <p className="text-xs text-slate-500">
                            {d.valor != null ? `R$ ${Number(d.valor).toLocaleString('pt-BR')}` : '-'}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <label className="sr-only" htmlFor={`stage-${d.id}`}>
                        Mover para etapa
                      </label>
                      <select
                        id={`stage-${d.id}`}
                        value={d.etapa_id ?? stage.id}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDealStage(d.id, Number(e.target.value));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-xs rounded bg-white/10 text-slate-300 border border-white/10 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {stages.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {deals.length === 0 && stages.length > 0 && (
        <div className="text-center py-12 text-slate-400">
          <Briefcase className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <p>Nenhum deal. Converta um lead em deal na página do lead.</p>
        </div>
      )}
    </div>
  );
}
