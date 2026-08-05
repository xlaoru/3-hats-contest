import { getArtworkByOwnerEmail } from "@/lib/actions/artwork.action";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArtworkDetails from "./artwork-details";
import ArtworkGallery from "./artwork-gallery";

const ArtworkPage = async (props: PageProps<"/[email]">) => {
    const { email } = await props.params;
    const { success, data: artwork } = await getArtworkByOwnerEmail(
        decodeURIComponent(email)
    );

    if (!success || !artwork) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-10">
            <div className="mx-auto max-w-3xl">
                <Link
                    href="/"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1 mb-6"
                >
                    ← Back to artworks
                </Link>

                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <ArtworkGallery
                        images={[
                            {
                                src: artwork.artworkImage,
                                alt: artwork.title,
                                label: "Artwork",
                            },
                            {
                                src: artwork.proveImage,
                                alt: `${artwork.title} — proof`,
                                label: "Proof",
                            },
                        ]}
                    />

                    <ArtworkDetails
                        title={artwork.title}
                        ownerEmail={artwork.participant.email}
                        ownerName={artwork.participant.name}
                        initialJudgeLikes={artwork.judgeLikes}
                        initialHasVoted={artwork.hasVoted ?? false}
                        initialIsVerified={artwork.isVerified}
                    />
                </div>
            </div>
        </div>
    );
};

export default ArtworkPage;
