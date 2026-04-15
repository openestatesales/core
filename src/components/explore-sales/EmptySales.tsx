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
    title = "We're just getting started! 🚀",
    subtitle = "We're building the best estate sale marketplace in your area. Be the first to discover amazing deals and unique finds!",
    showTips = true,
    extraActions,
    footer,
    className = '',
}: EmptySalesProps) {
    return (
        <div className={`max-w-4xl mx-auto text-center ${className}`}>
            {/* Illustration */}
            <div className="mb-8">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-indigo-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
            </div>

            {/* Copy */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {subtitle}
            </p>

            {/* Next steps tips (optional) */}
            {showTips && (
                <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
                    <TipCard
                        icon={
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        }
                        title="Follow Sellers"
                        body="Follow favorite companies to get early access to fresh sales."
                        tone={'indigo'}
                    />
                    <TipCard
                        icon={
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        }
                        title="Get Notified"
                        body="Turn on alerts for your city, categories, and distance."
                        tone="emerald"
                    />
                    <TipCard
                        icon={
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        }
                        title="Spread the Word"
                        body="Know a seller? Invite them to list and grow the marketplace."
                        tone="purple"
                    />
                </div>
            )}

            {/* Primary + extra actions */}
            <div className="space-y-4">
                {/* Optional secondary/extra actions */}
                {extraActions}

                {/* Optional small footer */}
                {footer ?? (
                    <div className="text-xs sm:text-sm text-gray-500">
                        🎉 Early adopters get special benefits and support!
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
    tone = 'indigo',
}: {
    icon: ReactNode;
    title: string;
    body: string;
    tone?: 'indigo' | 'emerald' | 'purple';
}) {
    const toneClasses: Record<string, string> = {
        indigo: 'bg-indigo-100 text-indigo-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        purple: 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-5 sm:p-6 border border-white/20">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${toneClasses[tone]} rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                {icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{body}</p>
        </div>
    );
}