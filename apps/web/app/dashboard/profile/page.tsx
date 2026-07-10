"use client";

import { useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";

export default function ProfilePage() {
  const { data: session, refetch } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { error } = await authClient.updateUser({ name });
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message || "Could not update your profile." });
      return;
    }
    await refetch?.();
    setMessage({ type: "success", text: "Profile updated." });
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-500">Profile</p>
        <h1 className="text-3xl font-semibold text-slate-900">Your profile</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-4">
          <Avatar name={user.name || user.email} />
          <div>
            <p className="text-sm font-medium text-slate-600">Display name</p>
            <p className="text-lg font-semibold text-slate-900">{user.name || user.email}</p>
          </div>
        </div>
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="text-slate-900">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Phone</dt>
            <dd className="text-slate-900">
              {(user as { phoneNumber?: string | null }).phoneNumber || "-"}
            </dd>
          </div>
        </dl>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <label className="block text-sm font-medium text-slate-700">
          Display name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          />
        </label>

        {message ? (
          <p
            className={
              message.type === "success"
                ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            }
          >
            {message.text}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={saving}
          className="bg-emerald-600 text-white hover:bg-emerald-500"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
