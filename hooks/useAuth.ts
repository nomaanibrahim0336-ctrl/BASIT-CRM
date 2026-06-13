"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { mapTeamMember } from "@/lib/mappers";
import type { Team } from "@/types/database";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  teamMember: Team | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    teamMember: null,
    loading: true,
  });
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        if (mounted) setState({ user: null, teamMember: null, loading: false });
        return;
      }

      const { data: teamRow } = await supabase
        .from("teams")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single();

      if (mounted) {
        setState({
          user: { id: session.user.id, email: session.user.email ?? "" },
          teamMember: teamRow ? mapTeamMember(teamRow) : null,
          loading: false,
        });
      }
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setState({ user: null, teamMember: null, loading: false });
      } else {
        loadSession();
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return { ...state, signOut };
}
