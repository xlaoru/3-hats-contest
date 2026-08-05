"use client";

import { useEffect, useState } from "react";

type ArtworkImageProps = {
    src: string;
    alt: string;
    className?: string;
};

const ArtworkImage = ({ src, alt, className }: ArtworkImageProps) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="group relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset"
            >
                <img src={src} alt={alt} className={className} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                    <span className="text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        View full size
                    </span>
                </div>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
                    onClick={() => setIsOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close"
                        className="absolute top-5 right-5 text-3xl leading-none text-white/80 hover:text-white"
                    >
                        ×
                    </button>
                    <img
                        src={src}
                        alt={alt}
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
            )}
        </>
    );
};

export default ArtworkImage;
