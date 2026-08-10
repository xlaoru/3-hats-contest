import { auth } from "@/auth";
import { getArtworks } from "@/lib/actions/artwork.action";
import { notFound, redirect } from "next/navigation";
import Table from "./table";

const Artworks = async () => {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/")
    }

    const { success, data: artworks } = await getArtworks()

    if (!success || !artworks) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-100 px-6 py-10 flex flex-col gap-8">
            <div className="w-full flex flex-col gap-4">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold text-zinc-900">Submissions</h1>
                        <p className="text-sm text-zinc-700">Manage and review all competition entries.</p>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <span className="text-sm px-3 py-1 bg-zinc-200 border border-zinc-300 rounded-full flex gap-2 items-center"><span className="size-2 bg-green-600 rounded-full" /> Entries open</span>
                        <p className="text-sm text-zinc-500">Closes {"Dec 7, 2026, at 11:59 PM AEST"}</p>
                    </div>
                </div>
            </div>
            <div className="">
                <Table />
            </div>
        </div>
    );
}

export default Artworks