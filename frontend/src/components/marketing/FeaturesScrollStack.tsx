"use client";

import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";

const CARD_COLORS = [
  { bg: "bg-violet-50 dark:bg-violet-950/40", accent: "bg-violet-500" },
  { bg: "bg-blue-50 dark:bg-blue-950/40", accent: "bg-blue-500" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/40", accent: "bg-emerald-500" },
  { bg: "bg-amber-50 dark:bg-amber-950/40", accent: "bg-amber-500" },
  { bg: "bg-rose-50 dark:bg-rose-950/40", accent: "bg-rose-500" },
  { bg: "bg-cyan-50 dark:bg-cyan-950/40", accent: "bg-cyan-500" },
];

interface Feature {
  title: string;
  body: string;
}

export function FeaturesScrollStack({ features }: { features: Feature[] }) {
  return (
    <ScrollStack
      itemDistance={120}
      itemScale={0.04}
      itemStackDistance={24}
      stackPosition="22%"
      scaleEndPosition="12%"
      baseScale={0.84}
      blurAmount={0}
      rotationAmount={0}
      className="rounded-2xl"
    >
      {features.map((f, i) => {
        const color = CARD_COLORS[i % CARD_COLORS.length];
        return (
          <ScrollStackItem key={f.title} itemClassName={color.bg}>
            <div className="flex flex-col justify-between h-full min-h-[260px] sm:min-h-[220px] p-8 sm:p-10">
              <div>
                <div className={`w-10 h-1 rounded-full ${color.accent} mb-6`} />
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {f.title}
                </h3>
                <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
                  {f.body}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-600 select-none">
                <span className={`inline-block w-2 h-2 rounded-full ${color.accent}`} />
                <span>
                  {i + 1} / {features.length}
                </span>
              </div>
            </div>
          </ScrollStackItem>
        );
      })}
    </ScrollStack>
  );
}
