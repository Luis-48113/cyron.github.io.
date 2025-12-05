export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>LLaMA 3.1 8B Tester</title>
          <style>
            :root { --primary: #7c3aed; --bg: #f9fafb; --text: #1f2937; }
            body { font-family: system-ui, sans-serif; margin: 0; background: var(--bg); color: var(--text); }
            .container { max-width: 800px; margin: 2rem auto; padding: 1rem; }
            h1 { color: var(--primary); text-align: center; margin-bottom: 2rem; }
            .form-group { margin-bottom: 1rem; }
            label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
            input[type="text"] { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem; }
            button { background-color: var(--primary); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 1rem; }
            button:hover { opacity: 0.9; }
            #output { margin-top: 1.5rem; padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.375rem; min-height: 60px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>💬 LLaMA 3.1 8B Instruct Tester</h1>
            <form id="promptForm">
              <div class="form-group">
                <label for="prompt">Enter your prompt:</label>
                <input type="text" id="prompt" name="prompt" placeholder="Ask me anything..." required />
              </div>
              <button type="submit">Send →</button>
            </form>
            <div id="output">Response will appear here...</div>
          </div>

          <script>
            const form = document.getElementById('promptForm');
            const output = document.getElementById('output');
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              const prompt = form.prompt.value;
              output.textContent = "Thinking...";
              try {
                const res = await fetch(window.location.href, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt })
                });
                const data = await res.json();
                output.textContent = data.output.choices[0].message.content;
              } catch (err) {
                output.textContent = "Error: " + err.message;
              }
            });
          </script>
        </body>
        </html>
      `;
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    } else if (request.method === "POST") {
      try {
        const { prompt } = await request.json();
        const HF_TOKEN = env.HF_TOKEN;
        if (!HF_TOKEN) throw new Error("Hugging Face token not set in environment");

        const response = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${HF_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "meta-llama/Llama-3.1-8B-Instruct",
              messages: [{ role: "user", content: prompt }]
            })
          }
        );

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { error: responseText };
        }

        return new Response(JSON.stringify({ output: data }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response("Method not allowed", { status: 405 });
    }
  }
};   