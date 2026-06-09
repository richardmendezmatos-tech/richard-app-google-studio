import { NextResponse } from 'next/server';
import { checkAdmin } from '@/shared/api/supabase/adminGuard';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export const runtime = 'edge';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const sb = createServerSupabaseClient();

  const { error } = await sb.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
