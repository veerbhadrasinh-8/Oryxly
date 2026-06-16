"use client";

import Link from "next/link";
import { AuthGuard } from "@/features/auth/AuthGuard";
import { CampaignWizard } from "@/features/campaigns/CampaignWizard";

function NewCampaignInner() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 font-sans space-y-6">
      <header>
        <Link href="/campaigns" className="text-sm text-neutral-500 hover:underline">
          ← Campaigns
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">New campaign</h1>
      </header>
      <CampaignWizard />
    </main>
  );
}

export default function NewCampaignPage() {
  return (
    <AuthGuard>
      <NewCampaignInner />
    </AuthGuard>
  );
}
