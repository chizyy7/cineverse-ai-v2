'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { WatchlistCard, WatchlistCardSkeleton, WatchlistItem } from '@/components/features/WatchlistCard';
import { CollectionModal } from '@/components/features/CollectionModal';
import { RatingModal } from '@/components/features/RatingModal';
import { useToast } from '@/components/ui/Toast';

type TabKey = 'all' | 'movies' | 'anime' | 'tv-shows' | 'music' | 'completed';

interface Collection {
  id: string;
  name: string;
  emoji: string | null;
  isPublic: boolean;
  description?: string | null;
  _count?: { watchlistItems: number };
}

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '📋' },
  { key: 'movies', label: 'Movies', emoji: '🎬' },
  { key: 'anime', label: 'Anime', emoji: '🌸' },
  { key: 'tv-shows', label: 'TV Shows', emoji: '📺' },
  { key: 'music', label: 'Music', emoji: '🎵' },
  { key: 'completed', label: 'Completed', emoji: '✅' },
];

const TYPE_TO_CONTENTTYPE: Record<Exclude<TabKey, 'completed' | 'all'>, string> = {
  movies: 'movie',
  anime: 'anime',
  'tv-shows': 'tv',
  music: 'music',
};

const TYPE_BADGE_FILTERS = [
  { key: 'all', label: 'All Types' },
  { key: 'movie', label: 'Movies' },
  { key: 'anime', label: 'Anime' },
  { key: 'tv', label: 'TV' },
  { key: 'music', label: 'Music' },
  { key: 'podcast', label: 'Podcasts' },
];

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingItem, setRatingItem] = useState<WatchlistItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const { success, error: toastError, info } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (activeCollection) {
        params.set('collection', activeCollection);
      } else if (activeTab !== 'all') {
        params.set('type', activeTab);
      }
      const res = await fetch(`/api/watchlist?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to view your watchlist');
          setLoading(false);
          return;
        }
        throw new Error('Failed to load');
      }
      const { items: data } = await res.json();
      setItems(data || []);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load watchlist');
      toastError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  }, [activeCollection, activeTab, toastError]);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/collections');
      if (res.ok) {
        const { collections: data } = await res.json();
        setCollections(data || []);
      }
    } catch (e) {
      // Silent
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const oldIndex = current.findIndex((it) => it.id === active.id);
      const newIndex = current.findIndex((it) => it.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;
      const newItems = arrayMove(current, oldIndex, newIndex);

      // Persist new order
      Promise.all(
        newItems.map((it, idx) =>
          fetch('/api/watchlist', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: it.id, order: idx }),
          })
        )
      ).catch((e) => {
        console.error('Failed to save order', e);
        toastError('Failed to save new order');
      });

      return newItems;
    });
  }

  // Optimistic remove
  async function handleRemove(id: string) {
    const removed = items.find((it) => it.id === id);
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      const res = await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      success(`Removed "${removed?.title || 'item'}"`);
    } catch (e) {
      // Rollback
      if (removed) setItems((prev) => [...prev, removed]);
      toastError('Failed to remove item');
    }
  }

  // Optimistic toggle complete + open rating modal
  async function handleToggleComplete(id: string, completed: boolean) {
    const item = items.find((it) => it.id === id);
    if (!item) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, completed, completedAt: completed ? new Date().toISOString() : null }
          : it
      )
    );

    try {
      const res = await fetch('/api/watchlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed }),
      });
      if (!res.ok) throw new Error('Failed');
      if (completed) {
        success(`Marked "${item.title}" as complete!`);
        // Open rating modal
        setRatingItem(item);
        setRatingModalOpen(true);
      } else {
        info(`Marked "${item.title}" as not complete`);
      }
    } catch (e) {
      // Rollback
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? { ...it, completed: !completed, completedAt: !completed ? new Date().toISOString() : null }
            : it
        )
      );
      toastError('Failed to update');
    }
  }

  function handleSelectCollection(id: string | null) {
    setActiveCollection(id);
    setActiveTab('all');
    setSidebarOpen(false);
  }

  function handleSelectTab(tab: TabKey) {
    setActiveTab(tab);
    setActiveCollection(null);
  }

  function handleNewCollection() {
    setEditingCollection(null);
    setCollectionModalOpen(true);
  }

  function handleEditCollection(c: Collection) {
    setEditingCollection(c);
    setCollectionModalOpen(true);
  }

  async function handleDeleteCollection(id: string) {
    const c = collections.find((x) => x.id === id);
    if (!c) return;
    if (!confirm(`Delete "${c.name}"? Items will move back to your Watchlist.`)) return;
    try {
      const res = await fetch(`/api/collections?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setCollections((prev) => prev.filter((x) => x.id !== id));
      if (activeCollection === id) setActiveCollection(null);
      success(`Deleted "${c.name}"`);
    } catch (e) {
      toastError('Failed to delete collection');
    }
  }

  async function handleCollectionSaved(collection: Collection) {
    setCollections((prev) => {
      const idx = prev.findIndex((c) => c.id === collection.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...collection };
        return next;
      }
      return [collection, ...prev];
    });
  }

  // Filtered items (for additional client-side filters)
  const filteredItems = items.filter((it) => {
    if (typeFilter !== 'all' && it.contentType !== typeFilter) return false;
    return true;
  });

  // Stats
  const totalCount = items.length;
  const completedCount = items.filter((it) => it.completed).length;
  const inProgressCount = totalCount - completedCount;

  // Available genres from items
  const availableGenres = Array.from(
    new Set(items.flatMap((it) => (it as any).genres || []))
  );

  return (
    <div className="min-h-screen">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-6 left-6 z-30 w-12 h-12 bg-accent-blue text-white rounded-full flex items-center justify-center shadow-lg"
        aria-label="Open collections"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || typeof window === 'undefined' || window.innerWidth >= 768) && (
            <CollectionSidebar
              collections={collections}
              activeCollection={activeCollection}
              onSelect={handleSelectCollection}
              onNew={handleNewCollection}
              onEdit={handleEditCollection}
              onDelete={handleDeleteCollection}
              totalCount={totalCount}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-outfit text-3xl md:text-4xl text-primary mb-2">My Watchlist</h1>
            <p className="text-text-secondary text-sm">
              {totalCount > 0 ? (
                <>
                  {inProgressCount} to watch · {completedCount} completed
                </>
              ) : (
                'Start saving content to build your watchlist'
              )}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-4 overflow-x-auto">
            <div className="flex gap-1 bg-background-secondary border border-accent-blue/10 rounded-xl p-1 inline-flex min-w-full md:min-w-0">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key && !activeCollection;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleSelectTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-accent-blue text-white'
                        : 'text-text-secondary hover:text-primary hover:bg-background-tertiary'
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Bar */}
          {totalCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <FilterDropdown
                label="Type"
                value={typeFilter}
                options={TYPE_BADGE_FILTERS}
                onChange={setTypeFilter}
              />
              {availableGenres.length > 0 && (
                <FilterDropdown
                  label="Genre"
                  value={genreFilter}
                  options={[
                    { key: 'all', label: 'All Genres' },
                    ...availableGenres.map((g) => ({ key: g, label: g })),
                  ]}
                  onChange={setGenreFilter}
                />
              )}
              <FilterDropdown
                label="Platform"
                value={platformFilter}
                options={[
                  { key: 'all', label: 'All Platforms' },
                  { key: 'netflix', label: 'Netflix' },
                  { key: 'crunchyroll', label: 'Crunchyroll' },
                  { key: 'spotify', label: 'Spotify' },
                  { key: 'youtube', label: 'YouTube' },
                ]}
                onChange={setPlatformFilter}
              />

              {(typeFilter !== 'all' || genreFilter !== 'all' || platformFilter !== 'all') && (
                <button
                  onClick={() => {
                    setTypeFilter('all');
                    setGenreFilter('all');
                    setPlatformFilter('all');
                  }}
                  className="text-xs text-accent-blue hover:underline"
                >
                  Clear filters
                </button>
              )}

              <div className="ml-auto text-xs text-text-tertiary">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <WatchlistCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-accent-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-primary font-medium mb-1">{error}</p>
              {error.includes('sign in') && (
                <Link
                  href="/(auth)/login"
                  className="inline-block mt-3 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="font-outfit text-xl text-primary mb-2">
                {activeCollection
                  ? 'This collection is empty'
                  : activeTab === 'completed'
                  ? 'No completed items yet'
                  : 'Your watchlist is empty'}
              </h3>
              <p className="text-text-secondary text-sm max-w-md mx-auto mb-4">
                {activeCollection
                  ? 'Add items to this collection from any content page using the save button.'
                  : 'Browse and save content to start building your personal library.'}
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors"
              >
                Discover Content
              </Link>
            </div>
          )}

          {/* Grid with Drag and Drop */}
          {!loading && !error && filteredItems.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredItems.map((it) => it.id)}
                strategy={rectSortingStrategy}
              >
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                >
                  <AnimatePresence>
                    {filteredItems.map((item) => (
                      <WatchlistCard
                        key={item.id}
                        item={item}
                        onRemove={handleRemove}
                        onToggleComplete={handleToggleComplete}
                        onRate={(id) => {
                          setRatingItem(items.find((it) => it.id === id) || null);
                          setRatingModalOpen(true);
                        }}
                        draggable={activeTab !== 'completed' && !activeCollection}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </SortableContext>
            </DndContext>
          )}
        </main>
      </div>

      <CollectionModal
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        onSaved={handleCollectionSaved}
        editingCollection={editingCollection}
      />

      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        title={ratingItem?.title}
        contentType={ratingItem?.contentType}
        onSubmit={async (data) => {
          // Stub: Persist to Review model in Prompt 3.3
          console.log('Rating submitted:', data);
        }}
      />
    </div>
  );
}

function CollectionSidebar({
  collections,
  activeCollection,
  onSelect,
  onNew,
  onEdit,
  onDelete,
  totalCount,
  isOpen,
  onClose,
}: {
  collections: Collection[];
  activeCollection: string | null;
  onSelect: (id: string | null) => void;
  onNew: () => void;
  onEdit: (c: Collection) => void;
  onDelete: (id: string) => void;
  totalCount: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 left-0 z-40 md:z-0 w-72 h-screen bg-background-secondary border-r border-accent-blue/10 transition-transform overflow-y-auto`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-outfit text-primary text-sm font-semibold uppercase tracking-wide">
              Collections
            </h2>
            <button
              onClick={onClose}
              className="md:hidden p-1 text-text-secondary hover:text-primary"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue rounded-lg text-sm font-medium transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Collection
          </button>

          <button
            onClick={() => onSelect(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
              activeCollection === null
                ? 'bg-accent-blue/20 text-primary'
                : 'text-text-secondary hover:bg-background-tertiary hover:text-primary'
            }`}
          >
            <span className="text-lg">📋</span>
            <span className="flex-1">All Items</span>
            <span className="text-xs text-text-tertiary">{totalCount}</span>
          </button>

          <div className="mt-2 space-y-1">
            {collections.length === 0 && (
              <p className="text-xs text-text-tertiary px-3 py-4 text-center">
                No collections yet. Create one to organize your watchlist.
              </p>
            )}
            {collections.map((c) => (
              <CollectionItem
                key={c.id}
                collection={c}
                active={activeCollection === c.id}
                onSelect={() => onSelect(c.id)}
                onEdit={() => onEdit(c)}
                onDelete={() => onDelete(c.id)}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

function CollectionItem({
  collection,
  active,
  onSelect,
  onEdit,
  onDelete,
}: {
  collection: Collection;
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
        active
          ? 'bg-accent-blue/20 text-primary'
          : 'text-text-secondary hover:bg-background-tertiary hover:text-primary'
      }`}
      onClick={onSelect}
    >
      <span className="text-lg flex-shrink-0">{collection.emoji || '📁'}</span>
      <span className="flex-1 truncate" title={collection.name}>{collection.name}</span>
      {collection._count && (
        <span className="text-xs text-text-tertiary">{collection._count.watchlistItems}</span>
      )}

      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-background-tertiary rounded transition-opacity"
          aria-label="Collection options"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
            <div className="absolute right-0 top-full mt-1 w-32 bg-background-tertiary border border-accent-blue/20 rounded-lg shadow-2xl z-20 py-1">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}
                className="w-full px-3 py-1.5 text-left text-sm text-primary hover:bg-background-secondary"
              >
                Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
                className="w-full px-3 py-1.5 text-left text-sm text-accent-coral hover:bg-background-secondary"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { key: string; label: string }[];
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.key === value)?.label || label;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-background-secondary border border-accent-blue/10 hover:border-accent-blue/30 text-text-secondary text-xs rounded-lg transition-colors"
      >
        <span className="text-text-tertiary">{label}:</span>
        <span className="text-primary">{currentLabel}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-1 w-44 bg-background-secondary border border-accent-blue/20 rounded-lg shadow-2xl z-20 py-1 max-h-64 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => { onChange(opt.key); setOpen(false); }}
                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-background-tertiary ${
                  value === opt.key ? 'text-accent-blue' : 'text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
