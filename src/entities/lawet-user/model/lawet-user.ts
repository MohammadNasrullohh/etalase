export type LawetUser = {
  id: string
  name: string
  username: string
  division_id?: string | null
  division?: {
    id?: string
    name: string
  } | null
  role: {
    id: string
    name: string
    level: number
    can_approve?: boolean
    is_superadmin?: boolean
  }
}
