'use client'

import { useEffect, useState } from 'react'
import { getApprovalQueueAction } from '@/entities/jurnal/api/approve-jurnal.action'
import { CheckCircle, Clock, ExternalLink, FileText } from 'lucide-react'
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
        <div
          key={item.id}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a, button')) return
            router.push(`/approval/${item.id}`)
          }}
          className="glass-surface cursor-pointer p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[var(--color-ember-bright)]/30 transition-colors"
        >
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
            <Link
              href={`/approval/${item.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/15 text-white/75 rounded-xl hover:bg-white/5 hover:text-white transition-all text-xs font-bold font-mono uppercase tracking-widest"
            >
              <FileText className="w-4 h-4" /> Review
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
