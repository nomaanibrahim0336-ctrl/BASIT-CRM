import type { Team } from "@/types/database";

// Maps a snake_case `teams` row (as returned by the Supabase client) to the
// camelCase Team interface used throughout the app.
export function mapTeamMember(row: Record<string, any>): Team {
  return {
    id: row.id,
    fullName: row.full_name,
    discordUsername: row.discord_username,
    email: row.email,
    role: row.role,
    status: row.status,
    fixedSalary: row.fixed_salary !== null ? Number(row.fixed_salary) : null,
    commissionRate: row.commission_rate !== null ? Number(row.commission_rate) : null,
    joinedDate: row.joined_date,
    authUserId: row.auth_user_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
