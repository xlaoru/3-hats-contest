import ArtworkImage from "@/components/artwork-image";
import VoteForm from "@/components/vote-form";
import { getPublicArtworkById } from "@/lib/actions/artwork.action";
import Link from "next/link";
import { notFound } from "next/navigation";

const ArtworkPage = async (props: PageProps<"/artworks/[id]">) => {
    const { id } = await props.params;
    const { success, data: artwork } = await getPublicArtworkById(id);

    if (!success || !artwork) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-10">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/artworks"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1 mb-6"
                >
                    ← Back to gallery
                </Link>

                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <ArtworkImage
                        src={artwork.artworkImage}
                        alt={artwork.title}
                        className="w-full h-80 object-cover bg-gray-100"
                    />

                    <div className="p-6 sm:p-8">
                        <h1 className="text-2xl font-bold text-gray-900">{artwork.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {artwork.participant.name} · {artwork.participant.state} ·{" "}
                            {artwork.medium} · {artwork.artworkSize}
                        </p>

                        <div className="mt-6">
                            <VoteForm artworkId={artwork._id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkPage;
