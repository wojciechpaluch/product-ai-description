'use client'
import { useState } from "react";

export default function Home() {
    const [features, setFeatures] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const generateDescription = async () => {
        setLoading(true);
        setDescription("");

        const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ features })
        });

        const data = await res.json();
        setLoading(false);

        if (data.description) {
            setDescription(data.description);
        } else {
            setDescription("Błąd: " + data.error);
        }
    };

    return (
        <div className="bg-black text-green-500 min-h-screen flex items-center justify-center">
            <div className="max-w-2xl w-full p-6 font-mono border border-green-500 rounded-lg shadow-lg">
                <h1 className="text-lg mb-4">💻 Generator Opisów Produktów (AI)</h1>

                <textarea
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="Wpisz cechy produktu..."
                    className="w-full p-2 bg-black text-green-500 border border-green-500 rounded"
                    rows={4}
                />

                <button
                    onClick={generateDescription}
                    disabled={loading}
                    className="mt-4 w-full bg-green-500 text-black p-2 rounded hover:bg-green-400"
                >
                    {loading ? "Generowanie..." : "Generuj opis"}
                </button>

                {description && (
                    <div className="mt-4 p-2 bg-black border border-green-500 rounded">
                        <pre>{description}</pre>
                        <button
                            onClick={() => navigator.clipboard.writeText(description)}
                            className="mt-2 bg-green-500 text-black px-4 py-1 rounded hover:bg-green-400"
                        >
                            Kopiuj
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
