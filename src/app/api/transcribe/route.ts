import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const shouldTranslate = formData.get('translate') === 'true';

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert the blob to a File object that OpenAI's API can handle
    const file = new File([audioFile], 'audio.wav', { 
      type: audioFile.type || 'audio/wav'
    });

    let transcription;
    
    if (shouldTranslate) {
      // Use translations endpoint for non-English audio
      // This will automatically translate to English
      transcription = await openai.audio.translations.create({
        file: file,
        model: 'whisper-1',
        response_format: 'json'
      });
    } else {
      // Use transcriptions endpoint for English audio
      transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });
    }

    // Process the response to create word timings
    // Note: Word timings are only available for transcriptions, not translations
    const wordTimings = !shouldTranslate ? (transcription as any).words?.map((word: any) => ({
      word: word.word,
      start: word.start,
      end: word.end
    })) : [];

    // Return both the full transcript and word timings
    return NextResponse.json({
      transcript: (transcription as any).text,
      wordTimings: wordTimings,
      isTranslated: shouldTranslate
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 