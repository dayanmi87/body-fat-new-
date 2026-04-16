export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return Response.json(
        { error: "Missing image" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Estimate male body fat percentage from this image. Return only a number.",
              },
              {
                type: "input_image",
                image_url: image,
                detail: "auto",
              },
            ],
          },
        ],
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      return Response.json(
        {
          error:
            data?.error?.message ||
            `OpenAI request failed with status ${openaiRes.status}`,
        },
        { status: openaiRes.status }
      );
    }

    return Response.json({
      result: data.output_text || "No result returned",
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
