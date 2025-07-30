// app/api/mental-health/route.ts
import { NextResponse } from 'next/server';
import { getMentalHealthResponse } from '@/services/mentalHealthApi';

export async function POST(req: Request) {
  const { question, context } = await req.json();
  
  try {
    const response = await getMentalHealthResponse(question, context);
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}