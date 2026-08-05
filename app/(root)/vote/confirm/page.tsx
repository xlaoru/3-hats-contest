import { confirmPublicVote } from "@/lib/actions/publicVote.action";
import Link from "next/link";

const VoteConfirmPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) => {
    const { token } = await searchParams;

    if (!token) {
        return (
            <StateCard title="Invalid link">
                This vote confirmation link is missing its token.
            </StateCard>
        );
    }

    const result = await confirmPublicVote({ token });

    if (!result.success || !result.data) {
        return (
            <StateCard title="Couldn't confirm your vote">
                {result.error?.message ?? "This link is invalid or has expired."}
            </StateCard>
        );
    }

    return (
        <StateCard title="Vote confirmed 🎉">
            Thanks — your vote for <strong>{result.data.artworkTitle}</strong> has been counted
            in the People&apos;s Choice Award.
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
                href="/"
                className="inline-block mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
                ← Back to home
            </Link>
        </div>
    </div>
);

export default VoteConfirmPage;
