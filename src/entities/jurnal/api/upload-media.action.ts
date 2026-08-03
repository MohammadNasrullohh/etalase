'use server'

const READ_ONLY_ERROR = 'ALAS hanya menyediakan visibilitas. Unggah media melalui Lawet Hub.'

type MediaActionResult = {
  success: boolean
  error?: string
  data?: { url: string; object_name: string }
}

export async function uploadFotoAction(_formData: FormData): Promise<MediaActionResult> {
  return { success: false, error: READ_ONLY_ERROR }
}

export async function uploadDokumenAction(_formData: FormData): Promise<MediaActionResult> {
  return { success: false, error: READ_ONLY_ERROR }
}
