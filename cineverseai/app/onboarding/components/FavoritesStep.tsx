import { FavoriteInput } from './FavoriteInput';
import { motion } from 'framer-motion';

interface FavoritesStepProps {
  favoriteMovies: string[];
  favoriteAnime: string[];
  favoriteArtists: string[];
  favoriteActors: string[];
  onMoviesChange: (value: string[]) => void;
  onAnimeChange: (value: string[]) => void;
  onArtistsChange: (value: string[]) => void;
  onActorsChange: (value: string[]) => void;
}

export const FavoritesStep = ({ 
  favoriteMovies, 
  favoriteAnime, 
  favoriteArtists, 
  favoriteActors,
  onMoviesChange,
  onAnimeChange,
  onArtistsChange,
  onActorsChange
}: FavoritesStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="font-outfit text-2xl md:text-3xl mb-4">
        Your all-time favorites
      </h2>
      <p className="text-secondary mb-6">
        Tell us your favorite movies, anime, artists, and actors. This helps us build your Entertainment DNA.
      </p>
      
      <div className="space-y-6">
        {/* Movies */}
        <FavoriteInput
          label="Favorite Movies"
          placeholder="e.g., Inception, Parasite, Spirited Away"
          max={5}
          value={favoriteMovies}
          onChange={onMoviesChange}
        />
        
        {/* Anime */}
        <FavoriteInput
          label="Favorite Anime"
          placeholder="e.g., Attack on Titan, Death Note, Your Name"
          max={5}
          value={favoriteAnime}
          onChange={onAnimeChange}
        />
        
        {/* Artists (Musicians) */}
        <FavoriteInput
          label="Favorite Artists"
          placeholder="e.g., Kendrick Lamar, Taylor Swift, BTS"
          max={5}
          value={favoriteArtists}
          onChange={onArtistsChange}
        />
        
        {/* Actors */}
        <FavoriteInput
          label="Favorite Actors"
          placeholder="e.g., Leonardo DiCaprio, Meryl Streep, Denzel Washington"
          max={3}
          value={favoriteActors}
          onChange={onActorsChange}
        />
      </div>
    </motion.div>
  );
};