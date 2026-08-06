import { describe, expect, it, vi } from 'vitest'

describe('Login redirect behavior', () => {
  it('routes non-approver users to /jurnal-saya instead of /pengajuan (Lawet Hub redirect)', async () => {
    // Read login-form.client.tsx source code to verify post-login target for non-approvers
    const fs = await import('fs')
    const path = await import('path')
    const content = fs.readFileSync(
      path.join(__dirname, '../src/features/lawet-auth/ui/login-form.client.tsx'),
      'utf-8'
    )
    
    // Non-approvers must be routed to ALAS internal dashboard (/jurnal-saya)
    expect(content).toContain("router.push('/jurnal-saya')")
    expect(content).not.toContain("router.push('/pengajuan')")
  })

  it('routes Menu Jurnal in AuthButton dropdown to /jurnal-saya', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const content = fs.readFileSync(
      path.join(__dirname, '../src/features/lawet-auth/ui/auth-button.client.tsx'),
      'utf-8'
    )
    
    expect(content).toContain('href="/jurnal-saya"')
    expect(content).not.toContain('href="/pengajuan"')
  })
})
