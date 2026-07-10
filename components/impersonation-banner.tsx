"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, adminAuth } from "@/lib/auth-client";

// Sticky banner shown while an admin is impersonating a user ("log in as
// user"). Better Auth sets `session.impersonatedBy` on impersonation sessions.
export function ImpersonationBanner() {
  const { data } = useSession();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const impersonatedBy = (data?.session as { impersonatedBy?: string | null } | undefined)
    ?.impersonatedBy;

  if (!impersonatedBy) {
    return null;
  }

  const label = data?.user?.name || data?.user?.email || "this user";

  async function exitImpersonation() {
    setLeaving(true);
    await adminAuth.stopImpersonating();
    router.push("/admin/users");
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <Eye size={16} />
      <span>
        Viewing as <strong>{label}</strong> — admin impersonation session
      </span>
      <Button
        size="sm"
        onClick={exitImpersonation}
        disabled={leaving}
        className="bg-amber-950 text-amber-50 hover:bg-amber-900"
      >
        {leaving ? "Exiting…" : "Exit"}
      </Button>
    </div>
  );
}
