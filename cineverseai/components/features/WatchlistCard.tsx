'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

export interface WatchlistItem {
  id: string;
  contentId: string;
  contentType: string;
  title: string;
  posterUrl: string | null;
  completed: boolean;
  completedAt: string | null;
  collectionId: string | null;
  collection?: { id: string; name: string; emoji: string | null } | null;
  order: number;
}

interface WatchlistCardProps {
  item: WatchlistItem;
  onRemove: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onRate?: (id: string) => void;
  draggable?: boolean;
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  movie: 'bg-accent-blue/20 text-accent-blue',
  anime: 'bg-accent-purple/20 text-accent-purple',
  tv: 'bg-accent-success/20 text-accent-success',
  music: 'bg-accent-gold/20 text-accent-gold',
  podcast: 'bg-accent-coral/20 text-accent-coral',
};

const TYPE_LABELS: Record<string, string> = {
  movie: 'Movie',
  anime: 'Anime',
  tv: 'TV',
  music: 'Music',
  podcast: 'Podcast',
};

export function WatchlistCard({ item, onRemove, onToggleComplete, onRate, draggable = true }: WatchlistCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !draggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const badgeClass = TYPE_BADGE_COLORS[item.contentType] || 'bg-accent-blue/20 text-accent-blue';
  const typeLabel = TYPE_LABELS[item.contentType] || item.contentType;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-background-secondary rounded-xl border border-accent-blue/10 hover:border-accent-blue/30 transition-all overflow-hidden ${
        item.completed ? 'opacity-60' : ''
      }`}
    >
      {/* Drag Handle */}
      {draggable && (
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 p-1.5 bg-background-primary/80 backdrop-blur rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </button>
      )}

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="absolute top-2 right-2 z-10 p-1.5 bg-background-primary/80 backdrop-blur rounded-lg text-accent-coral opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-coral/20"
        aria-label="Remove from watchlist"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-background-tertiary flex items-center justify-center text-text-tertiary text-sm">
            No Poster
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${badgeClass}`}>
            {item.collection?.emoji && <span className="mr-1">{item.collection.emoji}</span>}
            {typeLabel}
          </span>
        </div>

        {/* Completed Overlay */}
        {item.completed && (
          <div className="absolute inset-0 bg-accent-success/20 flex items-center justify-center">
            <div className="bg-accent-success text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Completed
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <h3 className="font-outfit text-sm text-primary line-clamp-2" title={item.title}>
          {item.title}
        </h3>

        <div className="flex items-center gap-1">
          {!item.completed ? (
            <button
              onClick={() => onToggleComplete(item.id, true)}
              className="flex-1 px-2 py-1.5 bg-accent-success/10 hover:bg-accent-success/20 text-accent-success text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Mark Complete
            </button>
          ) : (
            <>
              <button
                onClick={() => onToggleComplete(item.id, false)}
                className="flex-1 px-2 py-1.5 bg-background-tertiary hover:bg-accent-blue/10 text-text-secondary text-xs rounded-lg transition-colors"
              >
                Undo
              </button>
              {onRate && (
                <button
                  onClick={() => onRate(item.id)}
                  className="px-2 py-1.5 bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold text-xs rounded-lg transition-colors flex items-center gap-1"
                  title="Rate & Review"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function WatchlistCardSkeleton() {
  return (
    <div className="bg-background-secondary rounded-xl border border-accent-blue/10 overflow-hidden">
      <div className="aspect-[2/3] bg-background-tertiary animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-background-tertiary rounded animate-pulse" />
        <div className="h-6 bg-background-tertiary rounded animate-pulse" />
      </div>
    </div>
  );
}
