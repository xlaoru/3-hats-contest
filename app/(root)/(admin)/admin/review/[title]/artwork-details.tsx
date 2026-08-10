"use client";

import { verifyArtwork } from "@/lib/actions/artwork.action";
import type { ArtworkStatus } from "@/lib/validations";
import { useState, useTransition } from "react";

type ArtworkDetailsProps = {
    title: string;
    ownerEmail: string;
    ownerName: string;
    initialStatus: ArtworkStatus
};

const ArtworkDetails = ({
    title,
    ownerEmail,
    ownerName,
    initialStatus,
}: ArtworkDetailsProps) => {
    const [status, setStatus] = useState(initialStatus);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleVerify = (status: ArtworkStatus) => {
        startTransition(async () => {
            const result = await verifyArtwork({ ownerEmail, status });

            if (result.success && result.data) {
                setStatus(result.data.status);
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
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 capitalize ${status === "approved"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                        }`}
                >
                    {status}
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
                    disabled={isPending}
                    onClick={() => handleVerify("approved")}
                    className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${status === "approved"
                        ? "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
                        }`}
                >
                    <span>✓</span>
                    {status === "approved" ? "Approved" : "Approve"}
                </button>
            </div>
            {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default ArtworkDetails;
