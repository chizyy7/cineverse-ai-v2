import { NextRequest } from 'next/server';
import { getUser } from '@/lib/auth';
import {
  ChatMessage,
  AIAssistantContext,
  processAssistantMessage,
  saveChatMessage,
  sseEvent,
} from '@/lib/ai/assistant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  userId?: string;
}

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return new Response(
      sseEvent({ error: 'Invalid JSON body' }, 'error'),
      {
        status: 400,
        headers: sseHeaders(),
      }
    );
  }

  const { messages, userId } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      sseEvent({ error: 'messages array is required' }, 'error'),
      {
        status: 400,
        headers: sseHeaders(),
      }
    );
  }

  // Verify the caller is authenticated and that the userId matches the session.
  const sessionUser = await getUser();
  if (!sessionUser) {
    return new Response(
      sseEvent({ error: 'Unauthorized' }, 'error'),
      {
        status: 401,
        headers: sseHeaders(),
      }
    );
  }

  if (userId && userId !== sessionUser.id) {
    return new Response(
      sseEvent({ error: 'Forbidden' }, 'error'),
      {
        status: 403,
        headers: sseHeaders(),
      }
    );
  }

  const normalized: ChatMessage[] = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant' || m.role === 'system'))
    .map((m) => ({ role: m.role, content: String(m.content ?? '') }));

  const context: AIAssistantContext = { userId: sessionUser.id };

  // Persist the last user message (the prompt being sent right now).
  const lastUserMessage = [...normalized].reverse().find((m) => m.role === 'user');
  if (lastUserMessage) {
    // Fire-and-forget; persistence failures should not break the stream.
    saveChatMessage(sessionUser.id, 'user', lastUserMessage.content).catch((err) =>
      console.error('Failed to persist user message:', err)
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: unknown, event = 'message') => {
        controller.enqueue(encoder.encode(sseEvent(data, event)));
      };

      try {
        send({ status: 'thinking' }, 'status');

        const response = await processAssistantMessage(normalized, context);
        const fullText = response.message || '';

        // Stream the final text in small chunks for a typewriter feel.
        const chunkSize = 12;
        for (let i = 0; i < fullText.length; i += chunkSize) {
          send({ delta: fullText.slice(i, i + chunkSize) }, 'delta');
          await new Promise((resolve) => setTimeout(resolve, 18));
        }

        // Persist the assistant reply.
        try {
          await saveChatMessage(
            sessionUser.id,
            'assistant',
            fullText,
            response.toolCalls ? { toolCalls: response.toolCalls } : undefined
          );
        } catch (err) {
          console.error('Failed to persist assistant message:', err);
        }

        send(
          {
            done: true,
            toolCalls: response.toolCalls ?? [],
            recommendations: response.recommendations ?? [],
          },
          'done'
        );

        controller.close();
      } catch (error) {
        console.error('Chat stream error:', error);
        const message =
          error instanceof Error ? error.message : 'Failed to generate response';
        send({ error: message }, 'error');
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: sseHeaders(),
  });
}

function sseHeaders(): HeadersInit {
  return {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  };
}
