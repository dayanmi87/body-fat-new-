import OpenAI from "openai";

export async function POST(req: Request) {
  const { image } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: "Estimate body fat percentage for a male from this image. Return only a number." },
          {
            type: "input_image",
            image_url: image,
          },
        ],
      },
    ],
  });

  return Response.json({
    result: response.output_text,
  });
}
