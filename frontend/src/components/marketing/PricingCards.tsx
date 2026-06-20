import Link from "next/link";
import { PLANS } from "@/lib/site";

/** Renders the three priced plan cards. Reused on the home and pricing pages. */
export function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          className={`relative rounded-2xl border p-8 flex flex-col ${
            plan.popular
              ? "border-neutral-900 dark:border-neutral-100 shadow-lg"
              : "border-neutral-200 dark:border-neutral-800"
          }`}
        >
          {plan.popular && (
            <span className="absolute -top-3 left-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-3 py-1 text-xs font-medium">
              Most popular
            </span>
          )}
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <p className="mt-1 text-sm text-neutral-500">{plan.tagline}</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
            <span className="text-sm text-neutral-500">{plan.period}</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm flex-1">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span aria-hidden className="mt-0.5 text-emerald-500">✓</span>
                <span className="text-neutral-700 dark:text-neutral-300">{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className={`mt-8 rounded-md px-4 py-2.5 text-sm font-medium text-center transition ${
              plan.popular
                ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:opacity-90"
                : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            Get started
          </Link>
        </div>
      ))}
    </div>
  );
}
