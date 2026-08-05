import ArtworkCard from "@/components/artwork-card";
import { getPublicArtworks } from "@/lib/actions/artwork.action";

const ArtworksPage = async () => {
    const { success, data: artworks } = await getPublicArtworks();

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-10">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-end justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
                    {success && artworks && (
                        <span className="text-sm text-gray-500">{artworks.length} entries</span>
                    )}
                </div>

                {!success && (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center text-gray-400">
                        Something went wrong loading the gallery. Please try again shortly.
                    </div>
                )}

                {success && artworks && artworks.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center text-gray-400">
                        No approved entries yet — check back soon.
                    </div>
                )}

                {success && artworks && artworks.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {artworks.map((artwork) => (
                            <ArtworkCard key={artwork._id} artwork={artwork} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtworksPage;
