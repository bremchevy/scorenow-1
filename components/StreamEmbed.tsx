"use client";

interface StreamEmbedProps {
    streamUrl: string;
}

export default function StreamEmbed({ streamUrl }: StreamEmbedProps) {
    return (
        <div className="stream-container">
            <iframe
                src={streamUrl}
                className="stream-iframe"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer-when-downgrade"
                title="Live Match Stream"
            />
        </div>
    );
}
