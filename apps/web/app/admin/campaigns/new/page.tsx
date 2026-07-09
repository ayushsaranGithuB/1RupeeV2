"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminRequest } from "@/lib/admin";
import { cn } from "@/lib/utils";

interface NgoOption {
  id: string;
  name: string;
}

const emptyForm = {
  ngo_id: "",
  title: "",
  slug: "",
  short_description: "",
  description: "",
  hero_image: "",
  goal_amount: "",
  status: "DRAFT",
};

export default function CreateCampaignPage() {
  const router = useRouter();
  const [ngos, setNgos] = useState<NgoOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNgos() {
      setLoading(true);
      setError(null);

      try {
        const ngoData = await adminRequest<NgoOption[]>("/admin/ngos");
        setNgos(ngoData);
        if (ngoData[0]) {
          setForm((current) => ({ ...current, ngo_id: ngoData[0].id }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load NGOs");
      } finally {
        setLoading(false);
      }
    }

    loadNgos();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await adminRequest("/admin/campaigns", {
        method: "POST",
        body: JSON.stringify({
          ngo_id: form.ngo_id,
          title: form.title,
          slug: form.slug,
          short_description: form.short_description,
          description: form.description,
          hero_image: form.hero_image || undefined,
          goal_amount: Number(form.goal_amount),
          status: form.status,
        }),
      });

      router.push("/admin/campaigns");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Create Campaign</h1>
          <p className="text-sm text-slate-500">
            Add a new campaign from this dedicated screen.
          </p>
        </div>
        <Link
          href="/admin/campaigns"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to Campaign List
        </Link>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading NGOs...</p>
          ) : (
            <form className="grid gap-3 xl:grid-cols-2" onSubmit={handleCreate}>
              <div className="xl:col-span-2">
                <Select
                  value={form.ngo_id}
                  onChange={(e) => setForm({ ...form, ngo_id: e.target.value })}
                  disabled={!ngos.length}
                >
                  {ngos.map((ngo) => (
                    <option key={ngo.id} value={ngo.id}>
                      {ngo.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Input
                value={form.title}
                placeholder="Title"
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
                value={form.slug}
                placeholder="Slug"
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
              />
              <div className="xl:col-span-2">
                <Textarea
                  value={form.short_description}
                  placeholder="Short description"
                  onChange={(e) =>
                    setForm({ ...form, short_description: e.target.value })
                  }
                />
              </div>
              <div className="xl:col-span-2">
                <Textarea
                  value={form.description}
                  placeholder="Detailed description"
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <Input
                value={form.hero_image}
                placeholder="Hero image URL"
                onChange={(e) =>
                  setForm({ ...form, hero_image: e.target.value })
                }
              />
              <Input
                value={form.goal_amount}
                placeholder="Goal amount"
                onChange={(e) =>
                  setForm({ ...form, goal_amount: e.target.value })
                }
              />
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
              </Select>
              <div className="xl:col-span-2">
                <Button type="submit" disabled={saving || !ngos.length}>
                  {saving ? "Saving..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
