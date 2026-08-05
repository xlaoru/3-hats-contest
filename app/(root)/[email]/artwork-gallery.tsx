"use client";

import { useEffect, useState } from "react";

type GalleryImage = {
    src: string;
    alt: string;
    label: string;
};

const ArtworkGallery = ({ images }: { images: GalleryImage[] }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        if (openIndex === null) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpenIndex(null);
        };

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [openIndex]);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-gray-200">
                {images.map((image, index) => (
                    <button
                        key={image.label}
                        type="button"
                        onClick={() => setOpenIndex(index)}
                        className="group relative h-64 sm:h-80 overflow-hidden bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset"
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                            <span className="text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                                View full size
                            </span>
                        </div>
                        <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                            {image.label}
                        </span>
                    </button>
                ))}
            </div>

            {openIndex !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
                    onClick={() => setOpenIndex(null)}
                >
                    <button
                        type="button"
                        onClick={() => setOpenIndex(null)}
                        aria-label="Close"
                        className="absolute top-5 right-5 text-3xl leading-none text-white/80 hover:text-white"
                    >
                        ×
                    </button>
                    <span className="absolute top-6 left-6 text-sm font-medium text-white/80">
                        {images[openIndex].label}
                    </span>
                    <img
                        src={images[openIndex].src}
                        alt={images[openIndex].alt}
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
            )}
        </>
    );
};

export default ArtworkGallery;
