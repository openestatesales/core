'use client';

import { ReactNode } from 'react';

type EmptySalesProps = {
    /** Page context, tweaks copy/CTAs */
    /** Big headline */
    title?: string;
    /** Subheadline */
    subtitle?: string;
    /** Show the three small “what to do next” cards */
    showTips?: boolean;
    /** Optional extra actions (e.g., “Turn on notifications”) */
    extraActions?: ReactNode;
    /** Optional footer below CTAs */
    footer?: ReactNode;
    /** Optional className overrides */
    className?: string;
};

export default function EmptySales({
    title = "No sales yet",
    subtitle = "We’re building a free, open directory of estate sales. Check back soon — or help seed the map by inviting local operators.",
    showTips = true,
    extraActions,
    footer,
    className = '',
}: EmptySalesProps) {
    return (
        <div className={`max-w-4xl mx-auto text-center ${className}`}>
            {/* Illustration */}
            <div className="mb-8">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-white/80 shadow-sm sm:h-28 sm:w-28 dark:border-zinc-800 dark:bg-zinc-950/40">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                        <span className="text-accent font-bold">+</span>
                    </div>
                </div>
            </div>

            {/* Copy */}
            <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
                {title}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {subtitle}
            </p>

            {/* Next steps tips (optional) */}
            {showTips && (
                <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
                    <TipCard
                        icon={<span className="text-accent font-bold">+</span>}
                        title="Invite operators"
                        body="Know a local sale company? Send them the link to post."
                        tone={'accent'}
                    />
                    <TipCard
                        icon={<span className="text-accent font-bold">◎</span>}
                        title="Get Notified"
                        body="Turn on alerts for your city and distance."
                        tone="neutral"
                    />
                    <TipCard
                        icon={<span className="text-accent font-bold">↗</span>}
                        title="Spread the Word"
                        body="Star the repo and share the project."
                        tone="neutral"
                    />
                </div>
            )}

            {/* Primary + extra actions */}
            <div className="space-y-4">
                {/* Optional secondary/extra actions */}
                {extraActions}

                {/* Optional small footer */}
                {footer ?? (
                    <div className="text-xs text-muted-foreground sm:text-sm">
                        Open source. Community built. AGPL-3.0.
                    </div>
                )}
            </div>
        </div>
    );
}

function TipCard({
    icon,
    title,
    body,
    tone = 'neutral',
}: {
    icon: ReactNode;
    title: string;
    body: string;
    tone?: 'neutral' | 'accent';
}) {
    const toneClasses: Record<string, string> = {
        neutral:
            "border border-zinc-200 bg-zinc-100/90 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200",
        accent: "border border-accent/30 bg-accent/15 text-accent",
    };

    return (
        <div className="rounded-xl border border-border bg-white/70 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40 sm:p-6">
            <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg sm:mb-4 sm:h-12 sm:w-12 ${toneClasses[tone]}`}>
                {icon}
            </div>
            <h3 className="mb-1 font-semibold text-foreground sm:mb-2">{title}</h3>
            <p className="text-xs text-muted-foreground sm:text-sm">{body}</p>
        </div>
    );
}