import { getArtworkById } from "@/lib/actions/artwork.action";
import { statusLabels, statusStyles } from "@/lib/artwork-status";
import { CircleCheckBig } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArtworkActions from "./artwork-actions";
import ArtworkNotes from "./artwork-notes";
import ArtworkPreview from "./artwork-preview";

const submittedAtFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
});

const ArtworkPage = async (props: PageProps<"/admin/submissions/[id]">) => {
    const { id } = await props.params;
    const { success, data: artwork } = await getArtworkById(id);

    if (!success || !artwork) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-100 px-6 py-10 flex flex-col gap-6">
            <Link href="/admin/submissions" className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1">← Back to submissions</Link>
            <div className="flex flex-row gap-8">
                <div className="w-[50%] min-w-0">
                    <div className="flex flex-col gap-4 pb-4 border-b border-zinc-300">
                        <h1 className="text-2xl font-bold text-zinc-900">Submissions {artwork._id}</h1>
                        <div className="flex flex-row items-center gap-4">
                            <span className={`text-sm px-3 py-1 rounded-md flex gap-2 items-center font-medium ${statusStyles[artwork.status]}`}>{statusLabels[artwork.status]}</span>
                            <p className="text-sm text-zinc-500">Submitted {submittedAtFormatter.format(new Date(artwork.createdAt!))}</p>
                        </div>
                        <ArtworkActions artworkId={artwork._id} status={artwork.status} />
                    </div>
                    <div className="flex flex-col gap-4 py-4 border-b border-zinc-300">
                        <h3 className="text-md font-bold text-zinc-900">Applicant & Artwork Details</h3>
                        <div className="flex gap-4">
                            <div className="w-[50%] min-w-0 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500 inline-flex items-center">Artist name</p>
                                    <p className="text-lg text-zinc-900 inline-flex items-center">{artwork.participant.name}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500 inline-flex items-center">Email</p>
                                    <p className="text-lg text-zinc-900 inline-flex items-center">{artwork.participant.email}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500 inline-flex items-center">State</p>
                                    <p className="text-lg text-zinc-900 inline-flex items-center">{artwork.participant.state}</p>
                                </div>
                            </div>
                            <div className="w-[50%] min-w-0 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500 inline-flex items-center">Artwork title</p>
                                    <p className="text-lg text-zinc-900 inline-flex items-center">{artwork.title}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500 inline-flex items-center">Medium</p>
                                    <p className="text-lg text-zinc-900 inline-flex items-center">{artwork.medium}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500 inline-flex items-center">Dimensions</p>
                                    <p className="text-lg text-zinc-900 inline-flex items-center">{artwork.artworkSize}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500 inline-flex items-center">Date of work</p>
                                    <p className="text-lg text-zinc-900 inline-flex items-center">{submittedAtFormatter.format(new Date(artwork.createdAt!))}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 pt-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm text-gray-500 inline-flex items-center">Reference number</p>
                            <p className="text-lg text-zinc-900 inline-flex items-center">{artwork._id}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm text-gray-500 inline-flex items-center">Agreement</p>
                            <p className="text-lg text-zinc-900 inline-flex items-center flex items-center gap-2"><CircleCheckBig size={12} className="text-green-700" /> {artwork.agreedToRules ? "Artist has agreed to the rules and terms" : "Artist hasn't agreed to the rules and terms"}</p>
                        </div>
                        <ArtworkNotes artworkId={artwork._id} notes={artwork.notes ?? []} />
                    </div>
                </div>
                <div className="w-[50%] min-w-0">
                    <ArtworkPreview title={artwork.title} artworkImage={artwork.artworkImage} proveImage={artwork.proveImage} />
                </div>
            </div>
        </div>
    );
};

export default ArtworkPage;
