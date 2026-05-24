import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import UsersTab from '../UsersTab';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  Shield: () => <span data-testid="shield-icon" />,
  ShieldCheck: () => <span data-testid="shield-check-icon" />,
  ShieldAlert: () => <span data-testid="shield-alert-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
  Search: () => <span data-testid="search-icon" />,
  Mail: () => <span data-testid="mail-icon" />,
  User: () => <span data-testid="user-icon" />,
}));

const mockUsers = [
  {
    id: '1',
    email: 'admin@richard-automotive.com',
    full_name: 'Admin User',
    avatar_url: null,
    role: 'admin',
    email_verified: true,
    is_blocked: false,
    email_confirmed_at: '2025-01-01T00:00:00Z',
    last_sign_in_at: '2025-05-01T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'user@example.com',
    full_name: 'Test User',
    avatar_url: null,
    role: 'user',
    email_verified: false,
    is_blocked: true,
    email_confirmed_at: null,
    last_sign_in_at: null,
    created_at: '2025-03-15T00:00:00Z',
  },
];

describe('UsersTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should show loading spinner initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any;

    render(<UsersTab />);

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render users after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });

    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    expect(screen.getByText('admin@richard-automotive.com')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('2 registered users')).toBeInTheDocument();
  });

  it('should show empty state when no users', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: [] }),
    });

    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('should filter users by search query', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });

    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'Admin' } });

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('should update user role via select', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: mockUsers }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const roleSelects = screen.getAllByRole('combobox');
    fireEvent.change(roleSelects[1], { target: { value: 'editor' } });

    await waitFor(() => {
      expect(roleSelects[1]).toHaveValue('editor');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '2', role: 'editor' }),
    });
  });

  it('should toggle block status', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: mockUsers }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const blockButtons = screen.getAllByTitle('Block');
    fireEvent.click(blockButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '1', is_blocked: true }),
      });
    });
  });

  it('should show delete confirmation and confirm delete', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });

    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete user');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/users/1', {
        method: 'DELETE',
      });
    });

    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
  });

  it('should cancel delete when Cancel is clicked', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });

    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete user');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Confirm')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('should show Unblock title for blocked users', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });

    render(<UsersTab />);

    await waitFor(() => {
      expect(screen.getByText('Blocked')).toBeInTheDocument();
    });

    expect(screen.getByTitle('Unblock')).toBeInTheDocument();
  });
});
