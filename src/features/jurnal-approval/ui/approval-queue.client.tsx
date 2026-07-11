'use client'

import { useEffect, useState } from 'react'
import { getApprovalQueueAction, approveJurnalAction, rejectJurnalAction } from '@/entities/jurnal/api/approve-jurnal.action'
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react'

export function ApprovalQueue() {
  const [queue, setQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    setLoading(true)
    const res = await getApprovalQueueAction()
    if (res.success) {
      setQueue(res.data || [])
    } else {
      setError(res.error || 'Gagal memuat antrean persetujuan')
    }
    setLoading(false)
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const note = prompt(action === 'approve' ? 'Catatan Persetujuan (Opsional):' : 'Alasan Penolakan (Wajib):')
    if (action === 'reject' && !note) return

    setLoading(true)
    const res = action === 'approve' 
      ? await approveJurnalAction(id, note || undefined)
      : await rejectJurnalAction(id, note || undefined)

    if (res.success) {
      await fetchQueue()
    } else {
      alert(res.error || 'Gagal memproses')
      setLoading(false)
    }
  }

  if (loading && queue.length === 0) {
    return (
      <div className="flex justify-center p-12">
        <span className="w-8 h-8 border-2 border-[var(--color-ember-bright)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border-l-2 border-red-500 text-red-400 font-mono text-sm">
        {error}
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="glass-surface p-12 text-center rounded-2xl border border-white/10">
        <CheckCircle className="w-12 h-12 text-[var(--color-ember-bright)] mx-auto mb-4 opacity-50" />
        <p className="text-gray-400 font-mono">Antrean persetujuan kosong. Semua tugas selesai!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {queue.map(item => (
        <div key={item.id} className="glass-surface p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[var(--color-ember-bright)]/30 transition-colors">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" /> Menunggu Persetujuan
              </span>
              <span className="text-[10px] text-gray-500 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            
            <h3 className="text-lg font-bold text-white flex items-start gap-2">
              <FileText className="w-5 h-5 text-[var(--color-ember-bright)] shrink-0 mt-0.5" />
              {item.judul || 'Tanpa Judul'}
            </h3>
            
            <div className="text-xs text-gray-400 font-mono flex gap-4">
              <span>Oleh: {item.submitter?.name || 'Sistem'}</span>
              <span>Divisi: {item.divisi || '-'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleAction(item.id, 'reject')}
              className="px-4 py-2 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10 active:scale-95 transition-all text-xs font-bold font-mono uppercase tracking-widest flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Tolak
            </button>
            <button
              onClick={() => handleAction(item.id, 'approve')}
              className="px-4 py-2 bg-[var(--color-ember-bright)] text-black rounded-xl hover:bg-white active:scale-95 transition-all text-xs font-bold font-mono uppercase tracking-widest flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Setujui
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
