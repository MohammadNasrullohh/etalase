import { Folder } from 'lucide-react'

export default function JurnalSayaPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
        <Folder className="w-8 h-8 text-blue-400" />
      </div>
      <h1 className="text-2xl font-black text-white font-mono uppercase tracking-widest mb-4">Jurnal Saya</h1>
      <p className="text-gray-400 max-w-md">
        Halaman ini sedang dalam pengembangan. Nantinya Anda dapat melihat semua riwayat jurnal yang Anda ajukan beserta status approval-nya di sini.
      </p>
    </div>
  )
}
