export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (new URL(request.url).pathname === '/api') {
      try {
        const { prompt, history } = await request.json();
        const HF_TOKEN = env.HF_TOKEN;
        if (!HF_TOKEN) throw new Error("Hugging Face token not set");

        const messages = [...history, { role: "user", content: prompt }];

        const response = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ model: "meta-llama/Llama-3.1-8B-Instruct", messages }),
          }
        );

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}   