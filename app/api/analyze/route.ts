import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: `Estimate body fat percentage (just a number) for this image: ${image}`,
    });

    return Response.json({
      result: response.output_text,
    });
  } catch (error: any) {
    return Response.json({
      error: error.message,
    });
  }
}
