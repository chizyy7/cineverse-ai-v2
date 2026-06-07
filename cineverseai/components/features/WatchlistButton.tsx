'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

interface Collection {
  id: string;
  name: string;
  emoji: string | null;
  isPublic: boolean;
}

interface WatchlistButtonProps {
  contentId: string;
  contentType: string;
  title: string;
  posterUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full';
  onCreateCollection?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  movie: 'Movie',
  anime: 'Anime',
  tv: 'TV',
  music: 'Music',
  podcast: 'Podcast',
};

export function WatchlistButton({
  contentId,
  contentType,
  title,
  posterUrl,
  size = 'md',
  variant = 'icon',
  onCreateCollection,
}: WatchlistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [savedCollectionId, setSavedCollectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { success, error: toastError } = useToast();

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Check if already saved
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/watchlist');
        if (!res.ok) return;
        const { items } = await res.json();
        if (cancelled) return;
        const existing = items?.find((it: any) => it.contentId === contentId && it.contentType === contentType);
        if (existing) {
          setIsSaved(true);
          setSavedCollectionId(existing.collectionId);
        }
      } catch (e) {
        // Silent
      }
    })();
    return () => { cancelled = true; };
  }, [contentId, contentType]);

  // Load collections on open
  useEffect(() => {
    if (isOpen && collections.length === 0) {
      loadCollections();
    }
  }, [isOpen]);

  async function loadCollections() {
    try {
      const res = await fetch('/api/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } catch (e) {
      // Silent
    }
  }

  async function handleSave(collectionId: string | null) {
    if (loading) return;
    setLoading(true);
    const wasSaved = isSaved;
    const previousCollectionId = savedCollectionId;

    // Optimistic update
    setIsSaved(true);
    setSavedCollectionId(collectionId);

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          contentType,
          title,
          posterUrl,
          collectionId,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      const collectionName = collectionId
        ? collections.find((c) => c.id === collectionId)?.name
        : 'Watchlist';
      const emoji = collectionId
        ? collections.find((c) => c.id === collectionId)?.emoji
        : '📋';
      success(`${emoji} Added to ${collectionName}`);
      setIsOpen(false);
    } catch (e) {
      // Rollback
      setIsSaved(wasSaved);
      setSavedCollectionId(previousCollectionId);
      toastError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    if (loading) return;
    setLoading(true);
    const wasSaved = isSaved;
    setIsSaved(false);
    setSavedCollectionId(null);

    try {
      // Find and delete the item
      const res = await fetch(`/api/watchlist?contentId=${contentId}&contentType=${contentType}`);
      if (res.ok) {
        const { items } = await res.json();
        const item = items?.find((it: any) => it.contentId === contentId && it.contentType === contentType);
        if (item) {
          await fetch(`/api/watchlist?id=${item.id}`, { method: 'DELETE' });
        }
      }
      success('Removed from watchlist');
      setIsOpen(false);
    } catch (e) {
      setIsSaved(wasSaved);
      toastError('Failed to remove');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {variant === 'icon' ? (
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
            isSaved
              ? 'bg-accent-success text-white hover:bg-accent-success/90'
              : 'bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20'
          }`}
          aria-label={isSaved ? 'In watchlist' : 'Add to watchlist'}
          title={isSaved ? 'In watchlist' : 'Add to watchlist'}
        >
          {isSaved ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSaved
              ? 'bg-accent-success/20 text-accent-success hover:bg-accent-success/30'
              : 'bg-accent-blue text-white hover:bg-accent-blue/90'
          }`}
        >
          {isSaved ? '✓ Saved' : '+ Save'}
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-background-secondary border border-accent-blue/20 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-accent-blue/10">
              <p className="text-xs text-text-tertiary px-2 py-1 truncate" title={title}>
                Save "{title.slice(0, 40)}{title.length > 40 ? '…' : ''}"
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {/* Save to default Watchlist */}
              <button
                onClick={() => handleSave(null)}
                disabled={loading}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-background-tertiary transition-colors ${
                  isSaved && !savedCollectionId ? 'bg-accent-blue/10' : ''
                }`}
              >
                <span className="text-lg">📋</span>
                <span className="flex-1 text-primary">Watchlist</span>
                {isSaved && !savedCollectionId && (
                  <svg className="w-4 h-4 text-accent-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => handleSave(collection.id)}
                  disabled={loading}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-background-tertiary transition-colors ${
                    savedCollectionId === collection.id ? 'bg-accent-blue/10' : ''
                  }`}
                >
                  <span className="text-lg">{collection.emoji || '📁'}</span>
                  <span className="flex-1 text-primary truncate">{collection.name}</span>
                  {savedCollectionId === collection.id && (
                    <svg className="w-4 h-4 text-accent-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-accent-blue/10 p-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onCreateCollection?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Collection…</span>
              </button>

              {isSaved && (
                <button
                  onClick={handleRemove}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-accent-coral hover:bg-accent-coral/10 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remove from watchlist</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
