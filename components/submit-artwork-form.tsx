"use client";

import { submitArtwork } from "@/lib/actions/artwork.action";
import { useState, useTransition } from "react";

const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition";

const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

type FormState = {
    name: string;
    email: string;
    state: string;
    title: string;
    medium: string;
    artworkSize: string;
    venue: string;
    dateCreated: string;
    artworkImage: string;
    proveImage: string;
    agreedToRules: boolean;
};

const initialState: FormState = {
    name: "",
    email: "",
    state: "",
    title: "",
    medium: "",
    artworkSize: "",
    venue: "",
    dateCreated: "",
    artworkImage: "",
    proveImage: "",
    agreedToRules: false,
};

const isLikelyUrl = (value: string) => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

const SubmitArtworkForm = () => {
    const [form, setForm] = useState<FormState>(initialState);
    const [error, setError] = useState<string | null>(null);
    const [referenceId, setReferenceId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        startTransition(async () => {
            const result = await submitArtwork({
                ...form,
                dateCreated: new Date(form.dateCreated),
            });

            if (result.success && result.data) {
                setError(null);
                setReferenceId(result.data.artworkId);
            } else {
                setError(result.error?.message ?? "Something went wrong, please try again");
            }
        });
    };

    if (referenceId) {
        return (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Entry received 🎨</h2>
                <p className="text-sm text-gray-600">
                    Reference number: <span className="font-mono">{referenceId}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                    Your entry is waiting for admin approval. Once approved, it will appear in the
                    public gallery.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Name</label>
                    <input
                        className={inputClass}
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>Email</label>
                    <input
                        className={inputClass}
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>State</label>
                    <input
                        className={inputClass}
                        type="text"
                        required
                        value={form.state}
                        onChange={(e) => update("state", e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>Life drawing venue</label>
                    <input
                        className={inputClass}
                        type="text"
                        required
                        value={form.venue}
                        onChange={(e) => update("venue", e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>Artwork title</label>
                    <input
                        className={inputClass}
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => update("title", e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>Medium</label>
                    <input
                        className={inputClass}
                        type="text"
                        required
                        placeholder="e.g. Charcoal, Ink, Oil"
                        value={form.medium}
                        onChange={(e) => update("medium", e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>Artwork size</label>
                    <input
                        className={inputClass}
                        type="text"
                        required
                        placeholder="e.g. 42 x 59 cm"
                        value={form.artworkSize}
                        onChange={(e) => update("artworkSize", e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>Date created</label>
                    <input
                        className={inputClass}
                        type="date"
                        required
                        value={form.dateCreated}
                        onChange={(e) => update("dateCreated", e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Artwork image URL</label>
                <input
                    className={inputClass}
                    type="url"
                    required
                    placeholder="https://…"
                    value={form.artworkImage}
                    onChange={(e) => update("artworkImage", e.target.value)}
                />
                {isLikelyUrl(form.artworkImage) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={form.artworkImage}
                        alt="Artwork preview"
                        className="mt-2 h-32 w-32 object-cover rounded-lg border border-gray-200"
                    />
                )}
            </div>

            <div>
                <label className={labelClass}>Proof photo URL</label>
                <input
                    className={inputClass}
                    type="url"
                    required
                    placeholder="https://…"
                    value={form.proveImage}
                    onChange={(e) => update("proveImage", e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                    Private — only visible to admins and judges.
                </p>
                {isLikelyUrl(form.proveImage) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={form.proveImage}
                        alt="Proof preview"
                        className="mt-2 h-32 w-32 object-cover rounded-lg border border-gray-200"
                    />
                )}
            </div>

            <label className="flex items-start gap-2.5 text-sm text-gray-700">
                <input
                    type="checkbox"
                    required
                    checked={form.agreedToRules}
                    onChange={(e) => update("agreedToRules", e.target.checked)}
                    className="mt-0.5"
                />
                I agree to the competition rules — this artwork was created during a live life
                drawing session, with no studio reworking, AI, or photo copies.
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isPending ? "Submitting…" : "Submit entry"}
            </button>
        </form>
    );
};

export default SubmitArtworkForm;
