import { confirmArtworkSubmission } from "@/lib/actions/artwork.action";
import Link from "next/link";

const ConfirmArtworkSubmissionPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) => {
    const { token } = await searchParams;

    if (!token) {
        return (
            <StateCard title="Invalid link">
                This confirmation link is missing its token.
            </StateCard>
        );
    }

    const result = await confirmArtworkSubmission({ token });

    if (!result.success || !result.data) {
        return (
            <StateCard title="Couldn't confirm your entry">
                {result.error?.message ?? "This link is invalid or has expired."}
            </StateCard>
        );
    }

    return (
        <StateCard title="Entry confirmed 🎉">
            Thanks — your entry <strong>{result.data.artworkTitle}</strong> is confirmed and now
            waiting for admin approval.
        </StateCard>
    );
};

const StateCard = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div className="min-h-screen bg-gray-100 px-6 py-10 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-sm text-gray-600">{children}</p>
            <Link
                href="/artworks"
                className="inline-block mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
                ← Back to gallery
            </Link>
        </div>
    </div>
);

export default ConfirmArtworkSubmissionPage;
