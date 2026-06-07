'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

interface Collection {
  id: string;
  name: string;
  emoji: string | null;
  isPublic: boolean;
  description?: string | null;
}

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (collection: Collection) => void;
  editingCollection?: Collection | null;
}

const EMOJI_OPTIONS = [
  '📁', '📚', '🎬', '🎵', '📺', '🎮', '⭐', '❤️', '🔥', '💎',
  '🌙', '☕', '🍿', '🎯', '💪', '🧠', '🌈', '🎭', '🚀', '✨',
];

export function CollectionModal({ isOpen, onClose, onSaved, editingCollection }: CollectionModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { success, error: toastError } = useToast();

  // Reset / populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingCollection) {
        setName(editingCollection.name);
        setEmoji(editingCollection.emoji || '📁');
        setDescription(editingCollection.description || '');
        setIsPublic(editingCollection.isPublic);
      } else {
        setName('');
        setEmoji('📁');
        setDescription('');
        setIsPublic(true);
      }
      setShowEmojiPicker(false);
    }
  }, [isOpen, editingCollection]);

  async function handleSave() {
    if (!name.trim()) {
      toastError('Please enter a collection name');
      return;
    }
    setSaving(true);
    try {
      const url = editingCollection ? '/api/collections' : '/api/collections';
      const method = editingCollection ? 'PATCH' : 'POST';
      const body = editingCollection
        ? { id: editingCollection.id, name, emoji, description, isPublic }
        : { name, emoji, description, isPublic };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save');

      const { collection } = await res.json();
      success(editingCollection ? 'Collection updated' : 'Collection created');
      onSaved?.(collection);
      onClose();
    } catch (e) {
      toastError('Failed to save collection');
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
          >
            <div
              className="w-full max-w-md bg-background-secondary border border-accent-blue/20 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-accent-blue/10">
                <h3 className="font-outfit text-lg text-primary">
                  {editingCollection ? 'Edit Collection' : 'New Collection'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-background-tertiary"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Emoji + Name */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-14 h-14 bg-background-tertiary border border-accent-blue/20 rounded-xl flex items-center justify-center text-3xl hover:border-accent-blue/40 transition-colors"
                      aria-label="Choose emoji"
                    >
                      {emoji}
                    </button>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 mt-2 p-2 bg-background-tertiary border border-accent-blue/20 rounded-xl shadow-2xl z-10 grid grid-cols-5 gap-1 w-56"
                      >
                        {EMOJI_OPTIONS.map((e) => (
                          <button
                            key={e}
                            onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl hover:bg-accent-blue/20 transition-colors ${
                              emoji === e ? 'bg-accent-blue/30' : ''
                            }`}
                          >
                            {e}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-text-tertiary mb-1.5">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Weekend Watchlist…"
                      maxLength={50}
                      className="w-full px-3 py-2.5 bg-background-tertiary border border-accent-blue/20 rounded-lg text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-blue transition-colors"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-text-tertiary mb-1.5">
                    Description <span className="text-text-tertiary/60">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this collection for?"
                    maxLength={200}
                    rows={2}
                    className="w-full px-3 py-2 bg-background-tertiary border border-accent-blue/20 rounded-lg text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-blue transition-colors resize-none text-sm"
                  />
                </div>

                {/* Privacy Toggle */}
                <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent-blue/10 rounded-lg flex items-center justify-center">
                      {isPublic ? (
                        <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-primary font-medium">
                        {isPublic ? 'Public' : 'Private'}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {isPublic ? 'Others can see this collection' : 'Only you can see this'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      isPublic ? 'bg-accent-blue' : 'bg-background-secondary'
                    }`}
                    aria-label="Toggle privacy"
                  >
                    <motion.div
                      animate={{ x: isPublic ? 22 : 2 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                    />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-accent-blue/10 bg-background-primary/30">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-background-tertiary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="px-4 py-2 bg-accent-blue text-white text-sm font-medium rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {editingCollection ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
