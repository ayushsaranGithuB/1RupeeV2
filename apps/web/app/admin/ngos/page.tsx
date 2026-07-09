"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminRequest, formatDate } from "@/lib/admin";

interface NgoRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  verification_status: "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  payout_account?: {
    verification_notes?: string;
  } | null;
  created_at?: string;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  logo_url: "",
  website: "",
  email: "",
  phone: "",
  verification_notes: "",
};

export default function NGOManagement() {
  const [ngos, setNgos] = useState<NgoRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const selectedNgo = useMemo(
    () => ngos.find((ngo) => ngo.id === selectedNgoId) || null,
    [ngos, selectedNgoId],
  );

  async function loadNgos() {
    setLoading(true);
    setError(null);

    try {
      const path = search
        ? "/admin/ngos?search=" + encodeURIComponent(search)
        : "/admin/ngos";
      const data = await adminRequest<NgoRecord[]>(path);
      setNgos(data);
      if (!selectedNgoId && data[0]) {
        setSelectedNgoId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load NGOs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNgos();
  }, []);

  useEffect(() => {
    if (!selectedNgo) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: selectedNgo.name,
      slug: selectedNgo.slug,
      description: selectedNgo.description || "",
      logo_url: selectedNgo.logo_url || "",
      website: selectedNgo.website || "",
      email: selectedNgo.email || "",
      phone: selectedNgo.phone || "",
      verification_notes: selectedNgo.payout_account?.verification_notes || "",
    });
  }, [selectedNgo]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await adminRequest("/admin/ngos", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await loadNgos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create NGO");
    } finally {
      setSaving(false);
    }
  }

  async function saveSelectedNgo(status?: NgoRecord["verification_status"]) {
    if (!selectedNgo) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await adminRequest("/admin/ngos/" + selectedNgo.id, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          ...(status ? { verification_status: status } : {}),
        }),
      });
      await loadNgos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update NGO");
    } finally {
      setSaving(false);
    }
  }

  async function archiveSelectedNgo() {
    if (!selectedNgo) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await adminRequest("/admin/ngos/" + selectedNgo.id, {
        method: "PATCH",
        body: JSON.stringify({ archived: true }),
      });
      setSelectedNgoId(null);
      await loadNgos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive NGO");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">NGO Management</h1>
          <p className="text-sm text-slate-500">
            Create, edit, approve, archive, and capture verification notes for NGOs.
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Search NGOs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={loadNgos} variant="outline">
            Search
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add NGO</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={handleCreate}>
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Input
                placeholder="Logo URL"
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              />
              <Input
                placeholder="Website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Verification notes"
                value={form.verification_notes}
                onChange={(e) =>
                  setForm({ ...form, verification_notes: e.target.value })
                }
              />
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create NGO"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review NGOs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[420px] space-y-3 overflow-auto pr-2">
              {loading ? (
                <p className="text-sm text-slate-500">Loading NGOs...</p>
              ) : ngos.length === 0 ? (
                <p className="text-sm text-slate-500">No NGOs found.</p>
              ) : (
                ngos.map((ngo) => (
                  <button
                    key={ngo.id}
                    type="button"
                    onClick={() => setSelectedNgoId(ngo.id)}
                    className={
                      "w-full rounded-2xl border p-4 text-left transition " +
                      (selectedNgoId === ngo.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:border-slate-300")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{ngo.name}</p>
                        <p className="text-xs opacity-70">{ngo.slug}</p>
                      </div>
                      <span className="rounded-full bg-black/10 px-2 py-1 text-xs">
                        {ngo.verification_status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm opacity-80">{ngo.description}</p>
                  </button>
                ))
              )}
            </div>

            {selectedNgo ? (
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{selectedNgo.name}</p>
                    <p className="text-xs text-slate-500">
                      Added {formatDate(selectedNgo.created_at)}
                    </p>
                  </div>
                  <Select
                    value={selectedNgo.verification_status}
                    onChange={(e) =>
                      saveSelectedNgo(
                        e.target.value as NgoRecord["verification_status"],
                      )
                    }
                    className="w-[180px]"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SUSPENDED">Suspended</option>
                  </Select>
                </div>

                <div className="mt-4 grid gap-3">
                  <Input
                    value={form.logo_url}
                    placeholder="Logo URL"
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  />
                  <Textarea
                    value={form.verification_notes}
                    placeholder="Verification notes"
                    onChange={(e) =>
                      setForm({ ...form, verification_notes: e.target.value })
                    }
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => saveSelectedNgo()} disabled={saving}>
                      Save NGO
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => saveSelectedNgo("VERIFIED")}
                      disabled={saving}
                    >
                      Approve NGO
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={archiveSelectedNgo}
                      disabled={saving}
                    >
                      Archive NGO
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}