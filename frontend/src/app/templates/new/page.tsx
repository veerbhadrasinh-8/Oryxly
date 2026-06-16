"use client";

import Link from "next/link";
import { AuthGuard } from "@/features/auth/AuthGuard";
import { TemplateEditor } from "@/features/templates/TemplateEditor";

function NewTemplateInner() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 font-sans space-y-6">
      <header>
        <Link href="/templates" className="text-sm text-neutral-500 hover:underline">
          ← Templates
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">New template</h1>
      </header>
      <TemplateEditor mode={{ kind: "create" }} />
    </main>
  );
}

export default function NewTemplatePage() {
  return (
    <AuthGuard>
      <NewTemplateInner />
    </AuthGuard>
  );
}
