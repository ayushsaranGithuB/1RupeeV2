"use client";

import { useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";

export default function ProfilePage() {
  const { data: session, refetch } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState((user as { phoneNumber?: string | null })?.phoneNumber || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { error } = await authClient.updateUser({
      name,
      email,
      phoneNumber: phone,
    } as any);
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
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Your profile</h1>
      </div>

      <Card className="p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar name={user.name || user.email} />
          <div>
            <p className="text-sm font-medium text-slate-600">Display name</p>
            <p className="text-lg font-semibold text-slate-900">{user.name || user.email}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 text-sm">
          <div className="flex flex-col justify-between gap-1 sm:flex-row">
            <dt className="text-slate-500">Email</dt>
            <dd className="text-slate-900 font-medium">{user.email}</dd>
          </div>
          <div className="flex flex-col justify-between gap-1 sm:flex-row">
            <dt className="text-slate-500">Phone</dt>
            <dd className="text-slate-900 font-medium">
              {(user as { phoneNumber?: string | null }).phoneNumber || "-"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Display name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Phone number</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="\+91\d{10}"
              title="Enter a 10-digit number after +91"
              placeholder="+91 98765 43210"
            />
          </div>

          {message ? (
            <Card
              className={
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 p-3"
                  : "border-red-200 bg-red-50 p-3"
              }
            >
              <p
                className={
                  message.type === "success"
                    ? "text-sm text-emerald-800"
                    : "text-sm text-red-700"
                }
              >
                {message.text}
              </p>
            </Card>
          ) : null}

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-500 sm:w-auto"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
