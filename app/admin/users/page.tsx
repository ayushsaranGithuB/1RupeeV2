"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  adminRequest,
  formatCurrency,
  formatDate,
  toQueryString,
} from "@/lib/admin";

interface UserRecord {
  id: string;
  email: string;
  name: string;
  status: string;
  created_at?: string;
}

interface SearchResponse {
  users: UserRecord[];
  total: number;
}

interface UserProfile {
  user: UserRecord;
  wallet: { cached_balance: number } | null;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    created_at: string;
  }>;
  pledges: Array<{
    id: string;
    status: string;
    campaign_title: string;
    tier_title: string;
    daily_amount: number;
  }>;
  donations: Array<{
    id: string;
    amount: number;
    campaign_title: string;
    donated_at: string;
  }>;
}

export default function UserManagement() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<"email" | "name">("email");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [walletReason, setWalletReason] = useState("Manual adjustment");
  const [walletAmount, setWalletAmount] = useState("100");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedUserId(null);
    setProfile(null);
  }

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      const query = toQueryString({
        [searchType]: searchTerm || undefined,
        status: statusFilter || undefined,
        limit: 25,
        offset: 0,
      });
      const data = await adminRequest<SearchResponse>(
        `/admin/users/search${query}`,
      );
      setUsers(data.users);
      if (!selectedUserId && data.users[0]) {
        setSelectedUserId(data.users[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile(userId: string) {
    try {
      const data = await adminRequest<UserProfile>(
        `/admin/users/${userId}/profile`,
      );
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadProfile(selectedUserId);
    }
  }, [selectedUserId]);

  async function updateWallet(type: "credit" | "debit") {
    if (!selectedUserId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminRequest<UserProfile>(
        `/admin/users/${selectedUserId}/wallet-adjustments`,
        {
          method: "POST",
          body: JSON.stringify({
            type,
            amount: Number(walletAmount),
            reason: walletReason,
          }),
        },
      );
      setProfile(updated);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update wallet");
    } finally {
      setSaving(false);
    }
  }

  async function impersonate() {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const { error } = await adminAuth.impersonateUser({
        userId: profile.user.id,
      });
      if (error) {
        throw new Error(error.message || "Could not start impersonation");
      }
      // Now signed in as the user; view their dashboard.
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to log in as user",
      );
      setSaving(false);
    }
  }

  async function toggleSuspension() {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminRequest<UserRecord>(
        `/admin/users/${profile.user.id}/suspend`,
        {
          method: "POST",
          body: JSON.stringify({
            suspended: profile.user.status !== "suspended",
            reason:
              profile.user.status === "suspended"
                ? "Reactivating account"
                : "Policy review hold",
          }),
        },
      );
      setProfile((current) =>
        current ? { ...current, user: updated } : current,
      );
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update user status",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-500">Admin / Users</p>
        <h1 className="text-[30px] font-semibold">User Operations</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-3 ">
        <div className="flex flex-wrap justify-start gap-2 ">
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "email" | "name")}
            className="w-full sm:w-[160px] bg-neutral-50 text-slate-500"
          >
            <option value="email">Email</option>
            <option value="name">Name</option>
          </Select>
          <Input
            value={searchTerm}
            placeholder="Search users"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[220px] bg-neutral-50 text-slate-500"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-[180px] bg-neutral-50 text-slate-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
          <Button
            onClick={loadUsers}
            className="bg-emerald-600 text-white hover:bg-emerald-500 ml-auto"
          >
            Run Search
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          Users
        </div>
        <div className="p-2">
          {loading ? (
            <p className="px-2 py-3 text-sm text-slate-500">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setDrawerOpen(true);
                    }}
                  >
                    <TableCell className="font-medium text-slate-900">
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {drawerOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20"
            onClick={closeDrawer}
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[620px] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">User Drawer</p>
                <h2 className="text-[22px] font-semibold text-slate-900">
                  {profile?.user.name || "User Details"}
                </h2>
              </div>
              <Button variant="outline" onClick={closeDrawer}>
                Close
              </Button>
            </div>

            {!profile ? (
              <p className="text-sm text-slate-500">Loading user details...</p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 px-3 py-3">
                    <p className="text-xs text-slate-500">Wallet</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatCurrency(profile.wallet?.cached_balance || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-3">
                    <p className="text-xs text-slate-500">Pledges</p>
                    <p className="mt-1 text-sm font-semibold">
                      {profile.pledges.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-3">
                    <p className="text-xs text-slate-500">Donations</p>
                    <p className="mt-1 text-sm font-semibold">
                      {profile.donations.length}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {profile.user.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {profile.user.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Joined {formatDate(profile.user.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={impersonate}
                        disabled={saving}
                        title="Start an audited impersonation session and view this user's dashboard"
                      >
                        Log in as user
                      </Button>
                      <Button
                        variant={
                          profile.user.status === "suspended"
                            ? "outline"
                            : "destructive"
                        }
                        onClick={toggleSuspension}
                        disabled={saving}
                      >
                        {profile.user.status === "suspended"
                          ? "Reactivate User"
                          : "Suspend User"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <p className="text-sm font-medium text-slate-900">
                    Wallet Adjustment
                  </p>
                  <Input
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    placeholder="Amount (₹)"
                  />
                  <Textarea
                    value={walletReason}
                    onChange={(e) => setWalletReason(e.target.value)}
                    placeholder="Reason"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => updateWallet("credit")}
                      disabled={saving}
                    >
                      Credit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateWallet("debit")}
                      disabled={saving}
                    >
                      Debit
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="mb-2 text-sm font-medium text-slate-900">
                    Pledges
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Daily</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profile.pledges.map((pledge) => (
                        <TableRow key={pledge.id}>
                          <TableCell>{pledge.campaign_title}</TableCell>
                          <TableCell>{pledge.tier_title}</TableCell>
                          <TableCell>
                            {formatCurrency(pledge.daily_amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="mb-2 text-sm font-medium text-slate-900">
                    Donations
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profile.donations.map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell>{donation.campaign_title}</TableCell>
                          <TableCell>
                            {formatCurrency(donation.amount)}
                          </TableCell>
                          <TableCell>
                            {formatDate(donation.donated_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </aside>
        </>
      ) : null}
    </div>
  );
}
