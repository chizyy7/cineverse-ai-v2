'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

const QUICK_TAGS = [
  'Mind-blowing', 'Overrated', 'Hidden gem', 'Cried my eyes out',
  'Watch with friends', 'Late night perfection', 'Binge-worthy', 'Masterpiece',
];

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { rating: number; tags: string[]; text: string }) => void;
  title?: string;
  contentType?: string;
}

export function RatingModal({ isOpen, onClose, onSubmit, title, contentType }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    if (rating === 0) {
      toastError('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      onSubmit?.({ rating, tags: selectedTags, text });
      success(`Rated ${rating}/5 stars!`);
      // Reset
      setRating(0);
      setSelectedTags([]);
      setText('');
      onClose();
    } catch (e) {
      toastError('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
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
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md bg-background-secondary border border-accent-blue/20 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-accent-blue/10">
                <div>
                  <h3 className="font-outfit text-lg text-primary">Rate & Review</h3>
                  {title && (
                    <p className="text-xs text-text-tertiary mt-0.5 truncate max-w-[280px]">{title}</p>
                  )}
                </div>
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

              <div className="p-5 space-y-5">
                {/* Stars */}
                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-3">Your rating</p>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                        aria-label={`${star} star`}
                      >
                        <svg
                          className={`w-10 h-10 transition-colors ${
                            star <= (hover || rating)
                              ? 'text-accent-gold fill-current'
                              : 'text-text-tertiary'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-accent-gold mt-2 font-medium">
                      {rating === 5 ? 'Masterpiece!' : rating === 4 ? 'Loved it' : rating === 3 ? 'Good' : rating === 2 ? 'Meh' : 'Not for me'}
                    </p>
                  )}
                </div>

                {/* Quick Tags */}
                <div>
                  <p className="text-sm text-text-secondary mb-2">Quick tags</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                            : 'bg-background-tertiary border-accent-blue/10 text-text-secondary hover:border-accent-blue/30'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Review */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-text-secondary">Review <span className="text-text-tertiary/60">(optional)</span></p>
                    <p className="text-xs text-text-tertiary">{text.length}/500</p>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 500))}
                    placeholder="What did you think?"
                    rows={3}
                    className="w-full px-3 py-2 bg-background-tertiary border border-accent-blue/20 rounded-lg text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-blue transition-colors resize-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-accent-blue/10 bg-background-primary/30">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-background-tertiary"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="px-4 py-2 bg-accent-blue text-white text-sm font-medium rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
