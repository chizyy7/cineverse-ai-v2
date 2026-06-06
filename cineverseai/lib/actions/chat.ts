'use server';

import { getUser } from '@/lib/auth';
import { getChatHistory, saveChatMessage } from '@/lib/ai/assistant';

const HISTORY_LIMIT = 50;

export interface ChatHistoryItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: any;
  createdAt: Date;
}

/**
 * Server action: fetch the last N chat messages for the current user.
 * Returns an empty array if the user is not authenticated.
 */
export async function fetchChatHistory(limit: number = HISTORY_LIMIT): Promise<ChatHistoryItem[]> {
  const user = await getUser();
  if (!user) {
    return [];
  }

  try {
    const history = await getChatHistory(user.id, limit);
    return history.map((msg: any) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      metadata: msg.metadata ?? null,
      createdAt: msg.createdAt,
    }));
  } catch (error) {
    console.error('fetchChatHistory error:', error);
    return [];
  }
}

/**
 * Backwards-compatible alias used by the ChatPanel component.
 */
export async function getChatHistoryAction(limit: number = HISTORY_LIMIT): Promise<ChatHistoryItem[]> {
  return fetchChatHistory(limit);
}

/**
 * Server action: persist a single chat message for the current user.
 * Throws if the user is not authenticated.
 */
export async function persistChatMessage(role: 'user' | 'assistant', content: string, metadata?: any) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  await saveChatMessage(user.id, role, content, metadata);
  return { success: true };
}
