import { beforeEach, describe, expect, it, vi } from 'vitest';

let singleData = { data: null as any, error: null as any };
let orderData = { data: null as any, error: null as any };
let terminalEqData = { error: null as any };

const mockQueryBuilder = vi.hoisted(() => ({
  select: vi.fn(() => mockQueryBuilder),
  eq: vi.fn(() => mockQueryBuilder),
  update: vi.fn(() => mockQueryBuilder),
  order: vi.fn(() => mockQueryBuilder),
  limit: vi.fn(() => Promise.resolve(orderData)),
  single: vi.fn(() => Promise.resolve(singleData)),
  then: (resolve: (v: typeof terminalEqData) => void) =>
    Promise.resolve().then(() => resolve(terminalEqData)),
}));

const { getUserMock, fromMock, listUsersMock, deleteUserMock } = vi.hoisted(
  () => ({
    getUserMock: vi.fn(),
    fromMock: vi.fn(() => mockQueryBuilder),
    listUsersMock: vi.fn(),
    deleteUserMock: vi.fn(),
  }),
);

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

vi.mock('@/shared/api/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: getUserMock },
    from: fromMock,
  })),
}));

vi.mock('@/shared/api/supabase/serverClient', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    from: fromMock,
    auth: {
      admin: {
        listUsers: listUsersMock,
        deleteUser: deleteUserMock,
      },
    },
  })),
}));

const { GET, PATCH } = await import('../route');
const { DELETE } = await import('../[id]/route');

const adminUser = { id: 'admin-1', email: 'admin@richard-automotive.com' };

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 403 when not authenticated', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('No autorizado');
  });

  it('should return 403 when user is not admin', async () => {
    getUserMock.mockResolvedValue({ data: { user: adminUser }, error: null });
    singleData = { data: { role: 'user' }, error: null };

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('No autorizado');
  });

  it('should return users list for admin', async () => {
    getUserMock.mockResolvedValue({ data: { user: adminUser }, error: null });
    singleData = { data: { role: 'admin' }, error: null };
    orderData = {
      data: [
        { id: 'admin-1', email: 'admin@richard-automotive.com', role: 'admin' },
        { id: 'user-1', email: 'test@example.com', role: 'user' },
      ],
      error: null,
    };
    listUsersMock.mockResolvedValue({
      data: {
        users: [
          { id: 'admin-1', email_confirmed_at: '2025-01-01', last_sign_in_at: '2025-05-01', phone: null },
          { id: 'user-1', email_confirmed_at: null, last_sign_in_at: null, phone: '7875550100' },
        ],
      },
      error: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.users).toHaveLength(2);
    expect(body.users[0].email).toBe('admin@richard-automotive.com');
    expect(body.users[1].email_confirmed_at).toBeNull();
  });

  it('should return 500 on profiles fetch error', async () => {
    getUserMock.mockResolvedValue({ data: { user: adminUser }, error: null });
    singleData = { data: { role: 'admin' }, error: null };
    orderData = { data: null, error: { message: 'DB error' } };

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('DB error');
  });
});

describe('PATCH /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 403 when not authenticated', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const response = await PATCH(
      new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'user-1', role: 'editor' }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('No autorizado');
  });

  it('should return 400 when id is missing', async () => {
    getUserMock.mockResolvedValue({ data: { user: adminUser }, error: null });
    singleData = { data: { role: 'admin' }, error: null };

    const response = await PATCH(
      new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({ role: 'editor' }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Se requiere el ID del usuario');
  });

  it('should update user role', async () => {
    getUserMock.mockResolvedValue({ data: { user: adminUser }, error: null });
    singleData = { data: { role: 'admin' }, error: null };
    terminalEqData = { error: null };

    const response = await PATCH(
      new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'user-1', role: 'editor' }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(fromMock).toHaveBeenCalledWith('profiles');
  });

  it('should block a user with reason', async () => {
    getUserMock.mockResolvedValue({ data: { user: adminUser }, error: null });
    singleData = { data: { role: 'admin' }, error: null };
    terminalEqData = { error: null };

    const response = await PATCH(
      new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'user-1',
          is_blocked: true,
          blocked_reason: 'Spam',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('should unblock a user', async () => {
    getUserMock.mockResolvedValue({ data: { user: adminUser }, error: null });
    singleData = { data: { role: 'admin' }, error: null };
    terminalEqData = { error: null };

    const response = await PATCH(
      new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'user-1', is_blocked: false }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('should return 500 on update error', async () => {
    getUserMock.mockResolvedValue({ data: { user: adminUser }, error: null });
    singleData = { data: { role: 'admin' }, error: null };
    terminalEqData = { error: { message: 'Update failed' } };

    const response = await PATCH(
      new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'user-1', role: 'editor' }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Update failed');
  });
});

describe('DELETE /api/admin/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 403 when not authenticated', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const response = await DELETE(
      new Request('http://localhost', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'user-1' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('No autorizado');
  });

  it('should delete a user', async () => {
    getUserMock.mockResolvedValue({ data: { user: adminUser }, error: null });
    singleData = { data: { role: 'admin' }, error: null };
    deleteUserMock.mockResolvedValue({ error: null });

    const response = await DELETE(
      new Request('http://localhost', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'user-1' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(deleteUserMock).toHaveBeenCalledWith('user-1');
  });

  it('should return 500 on delete error', async () => {
    getUserMock.mockResolvedValue({ data: { user: adminUser }, error: null });
    singleData = { data: { role: 'admin' }, error: null };
    deleteUserMock.mockResolvedValue({ error: { message: 'Delete failed' } });

    const response = await DELETE(
      new Request('http://localhost', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'user-1' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Delete failed');
  });
});
