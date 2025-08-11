export async function POST(req) {
    try {
        const { features } = await req.json();

        if (!features || features.trim() === "") {
            return new Response(JSON.stringify({ error: "Brak cech produktu" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

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
                    { role: "system", content: "Jesteś kreatywnym copywriterem opisującym produkty w ciekawy sposób." },
                    { role: "user", content: `Podaj profesjonalny opis produktu o następujących cechach: ${features}` },
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();

        if (!data.choices || !data.choices.length) {
            return new Response(JSON.stringify({ error: "Brak odpowiedzi od AI" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ description: data.choices[0].message.content }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Błąd podczas generowania opisu" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
