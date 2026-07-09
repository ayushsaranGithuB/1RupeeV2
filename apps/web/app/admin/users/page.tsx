"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">User Operations</h1>
        <p className="text-sm text-slate-500">
          Search and view users, inspect wallets, pledges, donations, adjust
          balances, and suspend accounts.
        </p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle>User Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[160px,1fr,160px]">
              <Select
                value={searchType}
                onChange={(e) =>
                  setSearchType(e.target.value as "email" | "name")
                }
              >
                <option value="email">Email</option>
                <option value="name">Name</option>
              </Select>
              <Input
                value={searchTerm}
                placeholder="Search users"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>
            <Button onClick={loadUsers} variant="outline">
              Run Search
            </Button>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500">Loading users...</p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={
                      "w-full rounded-2xl border p-4 text-left transition " +
                      (selectedUserId === user.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:border-slate-300")
                    }
                  >
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm opacity-80">{user.email}</p>
                    <p className="mt-2 text-xs opacity-70">{user.status}</p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!profile ? (
              <p className="text-sm text-slate-500">
                Select a user to inspect their account.
              </p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Wallet
                    </p>
                    <p className="mt-3 text-2xl font-semibold">
                      {formatCurrency(profile.wallet?.cached_balance || 0)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Pledges
                    </p>
                    <p className="mt-3 text-2xl font-semibold">
                      {profile.pledges.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Donations
                    </p>
                    <p className="mt-3 text-2xl font-semibold">
                      {profile.donations.length}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
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

                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <p className="font-medium text-slate-900">
                    Wallet Adjustment
                  </p>
                  <Input
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    placeholder="Amount"
                  />
                  <Textarea
                    value={walletReason}
                    onChange={(e) => setWalletReason(e.target.value)}
                    placeholder="Reason"
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => updateWallet("credit")}
                      disabled={saving}
                    >
                      Credit Wallet
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateWallet("debit")}
                      disabled={saving}
                    >
                      Debit Wallet
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-medium text-slate-900">Pledges</p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      {profile.pledges.map((pledge) => (
                        <div
                          key={pledge.id}
                          className="rounded-xl bg-slate-50 p-3"
                        >
                          <p>{pledge.campaign_title}</p>
                          <p>
                            {pledge.tier_title} ·{" "}
                            {formatCurrency(pledge.daily_amount)}/day
                          </p>
                          <p className="text-xs text-slate-400">
                            {pledge.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-medium text-slate-900">Donations</p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      {profile.donations.map((donation) => (
                        <div
                          key={donation.id}
                          className="rounded-xl bg-slate-50 p-3"
                        >
                          <p>{donation.campaign_title}</p>
                          <p>{formatCurrency(donation.amount)}</p>
                          <p className="text-xs text-slate-400">
                            {formatDate(donation.donated_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
