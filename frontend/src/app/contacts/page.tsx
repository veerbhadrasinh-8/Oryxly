"use client";

import { AuthGuard } from "@/features/auth/AuthGuard";
import { ContactListsTable } from "@/features/contacts/ContactListsTable";
import { UploadCard } from "@/features/contacts/UploadCard";

function ContactsInner() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 font-sans space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
        <p className="text-sm text-neutral-500">
          Upload your prospect lists. We validate emails and dedupe automatically.
        </p>
      </header>

      <UploadCard />

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase text-neutral-500">Your lists</h2>
        <ContactListsTable />
      </section>
    </main>
  );
}

export default function ContactsPage() {
  return (
    <AuthGuard>
      <ContactsInner />
    </AuthGuard>
  );
}
