'use client'
import { useState, useEffect } from "react";

export default function Home() {
    const [features, setFeatures] = useState("");
    const [description, setDescription] = useState("");
    const [displayedText, setDisplayedText] = useState("");
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [copied, setCopied] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const [generationCount, setGenerationCount] = useState(0); // Licznik generacji
    const [lastFeatures, setLastFeatures] = useState(""); // Ostatnie cechy

    // Update current time
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('pl-PL'));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Typing animation effect
    useEffect(() => {
        if (description && !loading) {
            setIsTyping(true);
            setDisplayedText("");
            let i = 0;
            const typeTimer = setInterval(() => {
                if (i < description.length) {
                    setDisplayedText(description.slice(0, i + 1));
                    i++;
                } else {
                    setIsTyping(false);
                    clearInterval(typeTimer);
                }
            }, 20);
            return () => clearInterval(typeTimer);
        }
    }, [description, loading]);

    const generateDescription = async () => {
        setLoading(true);
        setDescription("");
        setDisplayedText("");
        setIsTyping(false);

        try {
            // Zwiększ licznik dla różnorodności
            const currentCount = generationCount + 1;
            setGenerationCount(currentCount);

            // Sprawdź czy to te same cechy
            const sameFeatures = features === lastFeatures;
            setLastFeatures(features);

            // Wywołanie prawdziwego API
            const response = await fetch('/api/generate-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    features: features,
                    generationCount: currentCount, // Dodaj licznik
                    isRegeneration: sameFeatures, // Flaga czy to regeneracja
                    timestamp: Date.now() // Timestamp dla unikalności
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Formatuj odpowiedź w stylu terminala
            const formattedDescription = `PRODUKT ZIDENTYFIKOWANY... [GENERACJA #${currentCount}]

=== ANALIZA CECH ===
${features}

=== WYGENEROWANY OPIS ===
${data.description}

${data.style ? `=== UŻYTY STYL: ${data.style.toUpperCase()} ===` : ''}
=== STATUS: KOMPLETNE ===
=== SEED: ${data.seed || 'UNKNOWN'} ===`;

            setDescription(formattedDescription);

        } catch (error) {
            console.error('Error generating description:', error);
            const errorMessage = `BŁĄD SYSTEMU...


=== PRÓBA PONOWNA ===
Sprawdź połączenie i spróbuj ponownie.

=== STATUS: BŁĄD ===`;
            setDescription(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            // Kopiuj tylko czysty opis bez formatowania terminala
            const cleanDescription = description
                .split('=== WYGENEROWANY OPIS ===')[1]
                ?.split('=== UŻYTY STYL:')[0]
                ?.split('=== STATUS:')[0]
                ?.trim();

            await navigator.clipboard.writeText(cleanDescription || description);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="bg-black min-h-screen text-green-400 font-mono overflow-hidden relative">
            {/* Animated background grid */}
            <div className="fixed inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    animation: 'grid-move 20s linear infinite'
                }}></div>
            </div>

            {/* Glitch effect overlay */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-400 opacity-30 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-green-400 opacity-30 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-4xl">
                    {/* Terminal Header */}
                    <div className="bg-gray-900 border-2 border-green-400 rounded-t-lg p-3 flex items-center justify-between shadow-lg shadow-green-400/20">
                        <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            </div>
                            <span className="text-green-300 text-sm ml-4">TERMINAL v2.1.0</span>
                        </div>
                        <div className="text-green-300 text-sm">
                            {currentTime} | STATUS: ACTIVE | GEN: {generationCount}
                        </div>
                    </div>

                    {/* Terminal Body */}
                    <div className="bg-black border-l-2 border-r-2 border-b-2 border-green-400 rounded-b-lg p-6 shadow-lg shadow-green-400/20 min-h-[600px]">
                        {/* Terminal prompt */}
                        <div className="mb-6">
                            <div className="flex items-center mb-2">
                                <span className="text-green-500">root@ai-generator:~$</span>
                                <div className="ml-2 w-2 h-5 bg-green-400 animate-pulse"></div>
                            </div>
                            <div className="text-green-300 text-xl mb-4 flex items-center">
                                <span className="mr-2">💻</span>
                                <span className="animate-pulse">AI PRODUCT DESCRIPTION GENERATOR</span>
                            </div>
                            <div className="text-green-400 text-sm opacity-75 mb-4">
                                {'>'} Inicjalizacja modułu generowania opisów...
                                <span className="animate-pulse ml-2">GOTOWY</span>
                            </div>
                        </div>

                        {/* Input Section */}
                        <div className="mb-6">
                            <label className="block text-green-300 mb-2 flex items-center">
                                <span className="mr-2">►</span>
                                INPUT_FEATURES:
                            </label>
                            <div className="relative">
                                <textarea
                                    value={features}
                                    onChange={(e) => setFeatures(e.target.value)}
                                    placeholder="Wprowadź cechy produktu do analizy..."
                                    className="w-full p-4 bg-gray-900 text-green-400 border-2 border-green-600 rounded-lg focus:border-green-300 focus:outline-none focus:shadow-lg focus:shadow-green-400/20 transition-all duration-300 resize-none"
                                    rows={4}
                                    style={{
                                        boxShadow: '0 0 10px rgba(0,255,0,0.1)',
                                    }}
                                />
                                <div className="absolute bottom-2 right-2 text-green-600 text-xs">
                                    {features.length}/1000
                                </div>
                            </div>
                        </div>

                        {/* Execute Button */}
                        <div className="mb-6">
                            <button
                                onClick={generateDescription}
                                disabled={loading || !features.trim()}
                                className="relative w-full bg-gradient-to-r from-green-600 to-green-500 text-black font-bold p-4 rounded-lg hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
                                style={{
                                    boxShadow: loading ? '0 0 20px rgba(0,255,0,0.5)' : '0 0 10px rgba(0,255,0,0.3)',
                                }}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin mr-3 w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                                        <span>PRZETWARZANIE DANYCH...</span>
                                        <div className="ml-3 flex space-x-1">
                                            <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                    </div>
                                ) : (
                                    <span>{'>'} EXECUTE GENERATION.EXE {generationCount > 0 && `[RETRY #${generationCount}]`}</span>
                                )}
                            </button>
                        </div>

                        {/* Output Section */}
                        {(displayedText || loading) && (
                            <div className="bg-gray-900 border-2 border-green-600 rounded-lg p-4 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-green-300 font-bold flex items-center">
                                        <span className="mr-2">🖥️</span>
                                        OUTPUT_STREAM:
                                    </span>
                                    {isTyping && (
                                        <div className="flex items-center text-green-400">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                                            <span className="text-sm">GENEROWANIE...</span>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <pre className="text-green-400 whitespace-pre-wrap text-sm leading-relaxed min-h-[100px]">
                                        {displayedText}
                                        {isTyping && (
                                            <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
                                        )}
                                    </pre>

                                    {/* Scrolling lines effect during typing */}
                                    {isTyping && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50 animate-pulse"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Copy Button */}
                                {displayedText && !isTyping && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={copyToClipboard}
                                            className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                                                copied
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-green-600 text-black hover:bg-green-500'
                                            }`}
                                            style={{
                                                boxShadow: '0 0 10px rgba(0,255,0,0.3)',
                                            }}
                                        >
                                            {copied ? '✅ SKOPIOWANE!' : '📋 COPY TO CLIPBOARD'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status Bar */}
                        <div className="mt-6 text-green-600 text-xs flex justify-between items-center">
                            <span>SYSTEM STATUS: OPERATIONAL</span>
                            <span className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                                AI MODULE: ACTIVE
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes grid-move {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(20px, 20px); }
                }
            `}</style>
        </div>
    );
}