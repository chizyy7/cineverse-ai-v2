import { motion } from 'framer-motion';

interface GenreStepProps {
  selected: string[];
  onChange: (value: string[]) => void;
  contentTypes: string[];
}

export const GenreStep = ({ selected, onChange, contentTypes }: GenreStepProps) => {
  // Define genres for each content type
  const genresMap: Record<string, Array<{id: string; label: string; color: string}>> = {
    movies: [
      { id: 'action', label: 'Action', color: '#EF4444' },
      { id: 'sci-fi', label: 'Sci-Fi', color: '#3B82F6' },
      { id: 'horror', label: 'Horror', color: '#8B5CF6' },
      { id: 'comedy', label: 'Comedy', color: '#FBBF24' },
      { id: 'romance', label: 'Romance', color: '#EC4899' },
      { id: 'crime', label: 'Crime', color: '#6B7280' },
      { id: 'fantasy', label: 'Fantasy', color: '#10B981' },
      { id: 'documentary', label: 'Documentary', color: '#6366F1' },
      { id: 'thriller', label: 'Thriller', color: '#F97316' },
      { id: 'adventure', label: 'Adventure', color: '#059669' }
    ],
    anime: [
      { id: 'shonen', label: 'Shonen', color: '#F97316' },
      { id: 'seinen', label: 'Seinen', color: '#6366F1' },
      { id: 'isekai', label: 'Isekai', color: '#8B5CF6' },
      { id: 'sports', label: 'Sports', color: '#10B981' },
      { id: 'romance', label: 'Romance', color: '#EC4899' },
      { id: 'fantasy', label: 'Fantasy', color: '#059669' },
      { id: 'psychological', label: 'Psychological', color: '#6B7280' },
      { id: 'adventure', label: 'Adventure', color: '#FBBF24' }
    ],
    music: [
      { id: 'hip-hop', label: 'Hip Hop', color: '#6B7280' },
      { id: 'rap', label: 'Rap', color: '#6366F1' },
      { id: 'r-b', label: 'R&B', color: '#EC4899' },
      { id: 'pop', label: 'Pop', color: '#F97316' },
      { id: 'rock', label: 'Rock', color: '#EF4444' },
      { id: 'edm', label: 'EDM', color: '#059669' },
      { id: 'afrobeats', label: 'Afrobeats', color: '#10B981' },
      { id: 'classical', label: 'Classical', color: '#FBBF24' },
      { id: 'lo-fi', label: 'Lo-fi', color: '#8B5CF6' }
    ]
    // Note: TV Shows and Podcasts genres are not specified in the prompt, but we can use movies and music as placeholders or leave empty
    // For simplicity, we'll use the same as movies for TV shows and empty for podcasts in this example.
    // In a real app, you would have more specific genres.
  };

  // Get the genres for the selected content types
  const getGenresForSelectedTypes = () => {
    const genres: Array<{id: string; label: string; color: string; type: string}> = [];
    contentTypes.forEach(type => {
      if (genresMap[type]) {
        genresMap[type].forEach(genre => {
          genres.push({ ...genre, type });
        });
      }
    });
    return genres;
  };

  const genres = getGenresForSelectedTypes();

  const toggleSelection = (genreId: string) => {
    const next = selected.includes(genreId)
      ? selected.filter(id => id !== genreId)
      : [...selected, genreId];
    onChange(next);
  };

  // If no content types are selected, we show a message
  if (contentTypes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="font-outfit text-2xl md:text-3xl mb-4">
          Your favorite genres
        </h2>
        <p className="text-secondary">
          Please select entertainment types in the previous step to see genres.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="font-outfit text-2xl md:text-3xl mb-4">
        Your favorite genres
      </h2>
      <p className="text-secondary mb-6">
        Select the genres you love within your chosen entertainment types.
      </p>
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {genres.map((genre) => (
          <motion.div
            key={genre.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: genres.indexOf(genre) * 0.05 }}
            className={`${selected.includes(genre.id) 
              ? `p-3 border-2 border-${genre.color}/20 text-${genre.color} rounded-lg hover:bg-${genre.color}/10 transition-all duration-300`
              : `p-3 bg-background-tertiary hover:bg-accent-blue/5 rounded-lg transition-all duration-300`}`
            } onClick={() => toggleSelection(genre.id)}>
              <span className="text-xs font-medium">{genre.label}</span>
            </motion.div>
        ))}
      </div>
      
      <div className="mt-4 text-center text-sm text-secondary">
        {selected.length > 0 
          ? `You've selected ${selected.length} ${selected.length === 1 ? 'genre' : 'genres'}` 
          : 'Please select at least one genre'}
      </div>
    </motion.div>
  );
};