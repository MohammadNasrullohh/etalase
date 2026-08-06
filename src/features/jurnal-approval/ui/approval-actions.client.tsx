'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { approveJurnalAction, requestRevisionAction } from '@/entities/jurnal/api/approve-jurnal.action'

export function ApprovalActions({ jurnalId }: { jurnalId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [error, setError] = useState('')

  const handleApprove = async () => {
    setLoading(true)
    setError('')
    const res = await approveJurnalAction(jurnalId)
    setLoading(false)
    if (res.success) {
      router.push('/approval')
      router.refresh()
    } else {
      setError(res.error || 'Gagal menyetujui jurnal')
    }
  }

  const handleReject = async () => {
    if (!notes.trim()) {
      setError('Catatan revisi tidak boleh kosong')
      return
    }
    setLoading(true)
    setError('')
    const res = await requestRevisionAction(jurnalId, notes)
    setLoading(false)
    if (res.success) {
      router.push('/approval')
      router.refresh()
    } else {
      setError(res.error || 'Gagal meminta revisi')
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {error && <div className="text-red-400 text-sm font-mono bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}
      
      {!showNotes ? (
        <div className="flex gap-4">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
          <button
            onClick={() => setShowNotes(true)}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
          >
            <X className="w-4 h-4" /> Minta Revisi
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tulis catatan revisi untuk staf..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors h-24 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-xl transition-all text-sm uppercase tracking-wider disabled:opacity-50"
            >
              Kirim Revisi
            </button>
            <button
              onClick={() => setShowNotes(false)}
              disabled={loading}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl transition-all text-sm uppercase tracking-wider disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
