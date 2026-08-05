"use client";

import { judgeLikeArtwork, verifyArtwork } from "@/lib/actions/artwork.action";
import { useState, useTransition } from "react";

type ArtworkDetailsProps = {
    title: string;
    ownerEmail: string;
    ownerName: string;
    initialJudgeLikes: number;
    initialHasVoted: boolean;
    initialIsVerified: boolean;
};

const ArtworkDetails = ({
    title,
    ownerEmail,
    ownerName,
    initialJudgeLikes,
    initialHasVoted,
    initialIsVerified,
}: ArtworkDetailsProps) => {
    const [judgeLikes, setJudgeLikes] = useState(initialJudgeLikes);
    const [hasVoted, setHasVoted] = useState(initialHasVoted);
    const [isVerified, setIsVerified] = useState(initialIsVerified);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleJudgeLike = () => {
        startTransition(async () => {
            const result = await judgeLikeArtwork({ ownerEmail });

            if (result.success && result.data) {
                setJudgeLikes(result.data.judgeLikes);
                setHasVoted(true);
                setError(null);
            } else {
                setError(result.error?.message ?? "Failed to register your vote");
            }
        });
    };

    const handleVerify = () => {
        startTransition(async () => {
            const result = await verifyArtwork({ ownerEmail });

            if (result.success && result.data) {
                setIsVerified(result.data.isVerified);
                setError(null);
            } else {
                setError(result.error?.message ?? "Failed to update verification");
            }
        });
    };

    return (
        <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${isVerified
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                        }`}
                >
                    {isVerified ? "Verified" : "Pending"}
                </span>
            </div>

            <div className="flex items-center gap-3 mt-6 py-4 border-y border-gray-100">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {ownerName || "Unknown user"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{ownerEmail}</p>
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    type="button"
                    disabled={isPending || hasVoted}
                    onClick={handleJudgeLike}
                    className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${hasVoted
                        ? "bg-amber-50 border-amber-100 text-amber-600"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <span>⭐</span>
                    {hasVoted ? `Voted (${judgeLikes})` : `Judge Like (${judgeLikes})`}
                </button>
                <button
                    type="button"
                    disabled={isPending}
                    onClick={handleVerify}
                    className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isVerified
                        ? "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
                        }`}
                >
                    <span>✓</span>
                    {isVerified ? "Verified" : "Verify"}
                </button>
            </div>

            {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default ArtworkDetails;
