import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const { message, history } = await req.json();
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: "Act as a mental health advisor. Provide supportive, empathetic responses.",
      },
      ...history.map(m => ({
        role: m.isUser ? "user" : "model",
        parts: m.content
      }))
    ],
  });

  const result = await chat.sendMessage(message);
  return Response.json(await result.response.text());
}