import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type Sentiment = 'positive' | 'negative' | 'mixed' | 'neutral';

export interface ReviewAnalysis {
  isSpoiler: boolean;
  sentiment: Sentiment;
  themes: string[];
  summary: string;
}

const SYSTEM_PROMPT = `You are an AI assistant that analyzes movie, TV, anime, music, and podcast reviews.
Given the rating, tags, and text of a review, you must:
1. Detect whether the review contains a major plot spoiler (e.g. reveals a key twist, the ending, who dies, or any major plot point the reader wouldn't know without having watched/listened).
2. Classify the overall sentiment as one of: "positive", "negative", "mixed", or "neutral".
3. Extract up to 5 key themes as short lowercase keywords/phrases (e.g. "acting", "soundtrack", "pacing", "plot twist", "world-building", "villain").
4. Generate a single-sentence summary (max 120 characters) that captures the reviewer's take without spoiling anything.

Return strictly valid JSON with this exact shape:
{
  "isSpoiler": boolean,
  "sentiment": "positive" | "negative" | "mixed" | "neutral",
  "themes": string[],
  "summary": string
}`;

const FALLBACK: ReviewAnalysis = {
  isSpoiler: false,
  sentiment: 'neutral',
  themes: [],
  summary: '',
};

export async function analyzeReview(input: {
  rating: number;
  tags: string[];
  text?: string | null;
  contentTitle?: string | null;
  contentType?: string;
}): Promise<ReviewAnalysis> {
  // Skip the API call for very short / empty text — no real analysis to do
  const text = (input.text || '').trim();
  if (text.length < 5 && input.tags.length === 0) {
    const ratingSentiment: Sentiment =
      input.rating >= 4 ? 'positive' : input.rating <= 2 ? 'negative' : 'neutral';
    return {
      ...FALLBACK,
      sentiment: ratingSentiment,
      summary:
        input.rating >= 4
          ? 'Loved it.'
          : input.rating <= 2
          ? 'Was not a fan.'
          : 'Mixed feelings.',
    };
  }

  try {
    const userPrompt = [
      `Content type: ${input.contentType || 'unknown'}`,
      input.contentTitle ? `Title: ${input.contentTitle}` : null,
      `Star rating (out of 5): ${input.rating}`,
      input.tags.length ? `Quick tags: ${input.tags.join(', ')}` : null,
      `Review text: ${text || '(no text provided)'}`,
    ]
      .filter(Boolean)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 250,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return FALLBACK;

    const parsed = JSON.parse(raw);

    return {
      isSpoiler: Boolean(parsed.isSpoiler),
      sentiment: (
        ['positive', 'negative', 'mixed', 'neutral'] as Sentiment[]
      ).includes(parsed.sentiment)
        ? parsed.sentiment
        : 'neutral',
      themes: Array.isArray(parsed.themes)
        ? parsed.themes
            .filter((t: unknown) => typeof t === 'string')
            .map((t: string) => t.toString().trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 5)
        : [],
      summary:
        typeof parsed.summary === 'string'
          ? parsed.summary.slice(0, 200)
          : FALLBACK.summary,
    };
  } catch (error) {
    console.error('analyzeReview error:', error);
    return FALLBACK;
  }
}
