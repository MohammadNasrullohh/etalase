'use client'

import { useEffect, useState } from 'react'
import { getApprovalQueueAction } from '@/entities/jurnal/api/approve-jurnal.action'
import { CheckCircle, Clock, FileText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function ApprovalQueue() {
  const router = useRouter()
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

  if (loading && queue.length === 0) {
    return (
      <div className="flex justify-center p-12">
        <span className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border-l-2 border-red-500 text-red-700 font-mono text-sm rounded-r-lg">
        {error}
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="glass-surface p-12 text-center rounded-2xl border border-[var(--glass-border-subtle)] shadow-sm">
        <CheckCircle className="w-12 h-12 text-[var(--color-accent-hover)] mx-auto mb-4 opacity-70" />
        <p className="text-[var(--color-text-muted)] font-mono">Antrean persetujuan kosong. Semua tugas selesai!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {queue.map(item => (
        <div
          key={item.id}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a, button')) return
            router.push(`/approval/${item.id}`)
          }}
          className="glass-surface cursor-pointer p-6 rounded-2xl border border-[var(--glass-border-subtle)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[var(--glass-border-default)] hover:shadow-md transition-all"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500/15 text-amber-800 border border-amber-500/25 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" /> Menunggu Persetujuan
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : (item.tanggal_kegiatan || '-')}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-start gap-2">
              <FileText className="w-5 h-5 text-[var(--color-accent-hover)] shrink-0 mt-0.5" />
              {item.judul || 'Tanpa Judul'}
            </h3>
            
            <div className="text-xs text-[var(--color-text-muted)] font-mono flex gap-4">
              <span>Oleh: {item.submitter?.name || item.created_by || 'Sistem'}</span>
              <span>Divisi: {item.divisi || '-'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/approval/${item.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--glass-border-default)] bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] rounded-xl hover:bg-[var(--color-canvas-raised)] transition-all text-xs font-bold font-mono uppercase tracking-widest shadow-sm"
            >
              <FileText className="w-4 h-4" /> Review
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
