import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const sb = createServerSupabaseClient();

  const { data: profiles, error } = await sb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: authUsers } = await sb.auth.admin.listUsers();

  const users = profiles.map((profile: any) => {
    const authUser = authUsers?.users?.find((u: any) => u.id === profile.id);
    return {
      ...profile,
      email_confirmed_at: authUser?.email_confirmed_at || null,
      last_sign_in_at: authUser?.last_sign_in_at || null,
      phone: authUser?.phone || null,
    };
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json();
  const { id, role, is_blocked, blocked_reason } = body;

  if (!id) {
    return NextResponse.json({ error: 'Se requiere el ID del usuario' }, { status: 400 });
  }

  const sb = createServerSupabaseClient();
  const updates: Record<string, any> = {};

  if (role) updates.role = role;
  if (is_blocked !== undefined) {
    updates.is_blocked = is_blocked;
    updates.blocked_at = is_blocked ? new Date().toISOString() : null;
    updates.blocked_reason = is_blocked ? (blocked_reason || null) : null;
  }

  const { error } = await sb.from('profiles').update(updates).eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
