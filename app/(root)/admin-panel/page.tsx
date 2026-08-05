import { auth, signOut } from "@/auth";
import { getArtworks } from "@/lib/actions/artwork.action";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const List = async () => {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/")
    }

    const { success, data: artworks } = await getArtworks()

    if (!success || !artworks) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-10">
            <div className="mx-auto max-w-4xl">
                <div className="flex items-end justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Artworks</h1>
                    <span className="text-sm text-gray-500">{artworks.length} total</span>
                </div>
                {artworks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center text-gray-400">
                        No artworks yet
                    </div>
                ) : (
                    <ul className="bg-white rounded-2xl shadow-md divide-y divide-gray-100 overflow-hidden">
                        {artworks.map((artwork, index) => (
                            <li key={index}>
                                <Link
                                    href={`/admin-panel/${encodeURIComponent(artwork.participant.email)}`}
                                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <img
                                        src={artwork.artworkImage}
                                        alt={artwork.title}
                                        className="h-12 w-12 rounded-lg object-cover bg-gray-100 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {artwork.title}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {artwork.participant.email}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500 shrink-0" title="Judge likes">
                                        ⭐ {artwork.judgeLikes}
                                    </span>
                                    <span
                                        className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${artwork.isVerified
                                            ? "bg-green-50 text-green-700"
                                            : "bg-amber-50 text-amber-700"
                                            }`}
                                    >
                                        {artwork.isVerified ? "Verified" : "Pending"}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
                <form
                    action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/sign-in" });
                    }}
                >
                    <button
                        type="submit"
                        className="p-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
                    >
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    );
}

export default List