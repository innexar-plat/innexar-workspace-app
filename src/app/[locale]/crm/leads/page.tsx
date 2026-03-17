'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, Pencil, Trash2, Eye } from 'lucide-react';
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

export default function WorkspaceCrmLeadsPage() {
  const locale = useLocale();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterOrigem, setFilterOrigem] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formOrigem, setFormOrigem] = useState('');
  const [formStatus, setFormStatus] = useState('novo');
  const [saving, setSaving] = useState(false);

  const load = () => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    const params: { status?: string; origem?: string } = {};
    if (filterStatus) params.status = filterStatus;
    if (filterOrigem) params.origem = filterOrigem;
    const url = WORKSPACE_API_PATHS.CRM.LEADS(params);
    workspaceFetch(url, { token })
      .then((r) => (r.ok ? r.json() : []))
      .then(setLeads)
      .catch(() => setError('Falha ao carregar leads'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterStatus, filterOrigem]);

  const openCreate = () => {
    setEditingId(null);
    setFormNome('');
    setFormEmail('');
    setFormTelefone('');
    setFormOrigem('');
    setFormStatus('novo');
    setModalOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setFormNome(lead.nome);
    setFormEmail(lead.email ?? '');
    setFormTelefone(lead.telefone ?? '');
    setFormOrigem(lead.origem ?? '');
    setFormStatus(lead.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStaffToken();
    if (!token) return;
    setSaving(true);
    setError('');
    const body = {
      nome: formNome,
      email: formEmail || null,
      telefone: formTelefone || null,
      origem: formOrigem || null,
      status: formStatus,
    };
    const url = editingId
      ? WORKSPACE_API_PATHS.CRM.LEAD_DETAIL(editingId)
      : WORKSPACE_API_PATHS.CRM.LEADS();
    const method = editingId ? 'PATCH' : 'POST';
    const res = await workspaceFetch(url, { token, method, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) {
      setModalOpen(false);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(Array.isArray(data.detail) ? String(data.detail[0]) : (data.detail ?? 'Falha ao salvar'));
    }
  };

  const handleDelete = async (id: number) => {
    const token = getStaffToken();
    if (!token) return;
    setDeletingId(id);
    const res = await workspaceFetch(WORKSPACE_API_PATHS.CRM.LEAD_DETAIL(id), {
      token,
      method: 'DELETE',
    });
    setDeletingId(null);
    if (res.ok) load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Leads</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo lead
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
          >
            <option value="">Todos</option>
            <option value="novo">Novo</option>
            <option value="qualificado">Qualificado</option>
            <option value="convertido">Convertido</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Origem</label>
          <input
            type="text"
            value={filterOrigem}
            onChange={(e) => setFilterOrigem(e.target.value)}
            placeholder="Ex: site, campanha"
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm w-40"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Nome</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Email</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Telefone</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Origem</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-right py-4 px-4 text-slate-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{lead.nome}</td>
                    <td className="py-3 px-4 text-slate-300">{lead.email ?? '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{lead.telefone ?? '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{lead.origem ?? '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{lead.status}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/${locale}/crm/leads/${lead.id}`}
                        className="inline-flex p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/5 mr-2"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEdit(lead)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/5 mr-2"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        disabled={deletingId === lead.id}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === lead.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leads.length === 0 && (
            <p className="py-12 text-center text-slate-400">Nenhum lead.</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingId ? 'Editar lead' : 'Novo lead'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Telefone</label>
                <input
                  type="text"
                  value={formTelefone}
                  onChange={(e) => setFormTelefone(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Origem</label>
                <input
                  type="text"
                  value={formOrigem}
                  onChange={(e) => setFormOrigem(e.target.value)}
                  placeholder="Ex: site, campanha"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              {editingId && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                  >
                    <option value="novo">Novo</option>
                    <option value="qualificado">Qualificado</option>
                    <option value="convertido">Convertido</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
