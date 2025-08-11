export async function POST(req) {
    try {
        const { features, generationCount = 1, isRegeneration = false, timestamp } = await req.json();

        if (!features || features.trim() === "") {
            return new Response(JSON.stringify({ error: "Brak cech produktu" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Generuj unikalny seed bazując na różnych czynnikach
        const uniqueSeed = Math.floor(Math.random() * 1000000) + generationCount + (timestamp || Date.now());

        // Różnorodne style opisów z większą pulą
        const styles = [
            "profesjonalny i techniczny",
            "emocjonalny i marketingowy",
            "kreatywny i nietypowy",
            "minimalistyczny i elegancki",
            "dynamiczny i energiczny",
            "luksusowy i ekskluzywny",
            "nowoczesny i innowacyjny",
            "przyjazny i dostępny",
            "ekspercki i szczegółowy",
            "inspirujący i motywujący"
        ];

        // Jeszcze więcej zróżnicowanych promptów
        const promptTemplates = [
            `Napisz {style} opis produktu o cechach: {features}. Użyj unikalnego podejścia i kreatywnych sformułowań. Skup się na tym, co czyni ten produkt wyjątkowym.`,

            `Stwórz {style} opis produktu z następującymi właściwościami: {features}. Podkreśl korzyści dla użytkownika i wartość dodaną.`,

            `Opracuj {style} prezentację produktu charakteryzującego się: {features}. Wykorzystaj storytelling i emocjonalne połączenie z klientem.`,

            `Przedstaw {style} charakterystykę produktu o parametrach: {features}. Pokaż, jak rozwiązuje problemy użytkowników.`,

            `Napisz {style}opis produktu: {features}. Użyj metafor i porównań, które przemawiają do wyobraźni.`,

            `Stwórz {style} opis produktu z cechami: {features}. Skup się na doświadczeniu użytkownika i jego przyszłych korzyściach.`,

            `Opracuj {style} prezentację produktu: {features}. Pokaż jego miejsce na rynku i przewagę konkurencyjną.`,

            `Napisz {style} charakterystykę produktu o właściwościach: {features}. Użyj języka, który budzi zaufanie i przekonuje.`
        ];

        // Wybierz losowy styl i prompt
        const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
        const selectedTemplate = promptTemplates[Math.floor(Math.random() * promptTemplates.length)];

        // Podstaw wartości do szablonu
        const finalPrompt = selectedTemplate
            .replace('{style}', selectedStyle)
            .replace(/\{features\}/g, features);

        // Dodatkowe instrukcje dla regeneracji
        let systemPrompt = `Jesteś kreatywnym copywriterem. Twoje opisy mają być unikatowe, angażujące i różnorodne. Unikaj szablonowych fraz i klisz. Każdy opis powinien być świeży i oryginalny.`;

        if (isRegeneration) {
            systemPrompt += ` WAŻNE: To jest regeneracja opisu dla tych samych cech produktu. Musisz stworzyć CAŁKOWICIE INNY opis niż poprzednie wersje. Użyj innego podejścia, innych słów kluczowych i innej struktury.`;
        }

        systemPrompt += ` Seed dla tej generacji: ${uniqueSeed}`;

        // Dostosuj parametry w zależności od liczby generacji
        const temperature = Math.min(0.9, 0.7 + (generationCount * 0.05)); // Zwiększaj kreatywność
        const frequencyPenalty = Math.min(1.0, 0.6 + (generationCount * 0.1)); // Mocniej penalizuj powtórzenia
        const presencePenalty = Math.min(1.0, 0.4 + (generationCount * 0.1));

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Produkt AI Generator",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    { role: "user", content: finalPrompt },
                ],
                temperature: temperature,
                max_tokens: 300,
                top_p: 0.9,
                frequency_penalty: frequencyPenalty,
                presence_penalty: presencePenalty,
                // Dodaj seed dla większej kontroli (jeśli API go obsługuje)
                seed: uniqueSeed % 999999,
            }),
        });

        const data = await response.json();

        if (!data.choices || !data.choices.length) {
            return new Response(JSON.stringify({ error: "Brak odpowiedzi od AI" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const description = data.choices[0].message.content.trim();

        // Loguj dla debugowania (opcjonalnie)
        console.log(`Generacja #${generationCount}, Styl: ${selectedStyle}, Seed: ${uniqueSeed}`);

        return new Response(JSON.stringify({
            description,
            style: selectedStyle,
            seed: uniqueSeed,
            generationCount: generationCount,
            isRegeneration: isRegeneration,
            temperature: temperature,
            frequencyPenalty: frequencyPenalty
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({
            error: "Błąd podczas generowania opisu",
            details: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}