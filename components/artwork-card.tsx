import { PublicArtwork } from "@/lib/actions/artwork.action";
import Link from "next/link";

const ArtworkCard = ({ artwork }: { artwork: PublicArtwork }) => {
    return (
        <Link
            href={`/artworks/${artwork._id}`}
            className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
            <div className="h-56 overflow-hidden bg-gray-100">
                <img
                    src={artwork.artworkImage}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="p-4">
                <h2 className="text-base font-semibold text-gray-900 truncate">{artwork.title}</h2>
                <p className="text-sm text-gray-500 truncate">
                    {artwork.participant.name} · {artwork.participant.state}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">{artwork.medium}</p>
            </div>
        </Link>
    );
};

export default ArtworkCard;
