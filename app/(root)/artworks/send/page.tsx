import SubmitArtworkForm from "@/components/submit-artwork-form";
import Link from "next/link";

const SendArtworkPage = () => {
    return (
        <div className="min-h-screen bg-gray-100 px-6 py-10">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/artworks"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1 mb-6"
                >
                    ← Back to gallery
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">Submit your artwork</h1>
                <p className="text-sm text-gray-600 mb-6">
                    Only artwork created during a live life drawing session is eligible. Your entry
                    will appear in the public gallery once approved by an admin.
                </p>

                <SubmitArtworkForm />
            </div>
        </div>
    );
};

export default SendArtworkPage;
