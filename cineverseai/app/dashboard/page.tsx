import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ContentCard } from '@/components/features/ContentCard';
import { getUser } from '@/lib/auth';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recommendations data
  const [pickedForYou, setPickedForYou] = useState<any[]>([]);
  const [genreRows, setGenreRows] = useState<Record<string, any[]>>({});
  const [trendingNow, setTrendingNow] = useState<any[]>([]);
  const [animeMatches, setAnimeMatches] = useState<any[]>([]);
  const [vibeRows, setVibeRows] = useState<Record<string, any[]>>({});

  // Loading states for each section
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    pickedForYou: true,
    genreRows: true,
    trendingNow: true,
    animeMatches: true,
    vibeRows: true,
  });

  // Scroll refs for infinite scroll
  const scrollRefs = useRef<Record<string, HTMLElement | null>>({});

  // Mood quick-select
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const moods = [
    { id: 'sad', emoji: '😢', label: 'Sad' },
    { id: 'funny', emoji: '😂', label: 'Funny' },
    { id: 'intense', emoji: '💪', label: 'Intense' },
    { id: 'mind-blowing', emoji: '🤔', label: 'Mind-blowing' },
    { id: 'relaxing', emoji: '😌', label: 'Relaxing' },
    { id: 'inspiring', emoji: '🌟', label: 'Inspiring' },
  ];

  // Fetch user data and initial recommendations
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUser();
      if (!userData) {
        // Redirect to login if no user
        window.location.href = '/(auth)/login';
        return;
      }
      setUser(userData);
      await loadRecommendations();
    } catch (err) {
      setError('Failed to load user data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      // In a real app, we would call our API endpoint with user context
      // For now, we'll simulate by calling the recommendation function directly
      // But since we're in a client component, we can't call server functions directly.
      // We'll need to use the API endpoint we built.

      // Fetch data for each section
      await Promise.all([
        fetchPickedForYou(),
        fetchGenreRows(),
        fetchTrendingNow(),
        fetchAnimeMatches(),
        fetchVibeRows(),
      ]);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error(err);
    }
  };

  const fetchPickedForYou = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, pickedForYou: true }));
      // In a real app, we would call: /api/recommendations?userId=${user.id}&limit=10
      // For now, we'll use mock data or simulate with a placeholder
      // Since we don't have a real API endpoint that returns normalized content yet,
      // we'll use placeholder data for UI development.
      const mockData = generateMockRecommendations(10);
      setPickedForYou(mockData);
      setLoadingStates(prev => ({ ...prev, pickedForYou: false }));
    } catch (error) {
      console.error('Error fetching picked for you:', error);
      setLoadingStates(prev => ({ ...prev, pickedForYou: false }));
    }
  };

  const fetchGenreRows = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, genreRows: true }));
      // We'll create a few genre rows based on user's top DNA
      const topGenres = getTopUserGenres(user!);
      const genreData: Record<string, any[]> = {};
      for (const genre of topGenres.slice(0, 3)) {
        genreData[genre] = generateMockRecommendations(8, genre);
      }
      setGenreRows(genreData);
      setLoadingStates(prev => ({ ...prev, genreRows: false }));
    } catch (error) {
      console.error('Error fetching genre rows:', error);
      setLoadingStates(prev => ({ ...prev, genreRows: false }));
    }
  };

  const fetchTrendingNow = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, trendingNow: true }));
      const mockData = generateMockRecommendations(10);
      setTrendingNow(mockData);
      setLoadingStates(prev => ({ ...prev, trendingNow: false }));
    } catch (error) {
      console.error('Error fetching trending now:', error);
      setLoadingStates(prev => ({ ...prev, trendingNow: false }));
    }
  };

  const fetchAnimeMatches = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, animeMatches: true }));
      // Only show if user likes anime
      const animeScore = user?.entertainmentDNA?.anime || 0;
      if (animeScore > 30) {
        const mockData = generateMockRecommendations(8, 'Anime');
        setAnimeMatches(mockData);
      } else {
        setAnimeMatches([]);
      }
      setLoadingStates(prev => ({ ...prev, animeMatches: false }));
    } catch (error) {
      console.error('Error fetching anime matches:', error);
      setLoadingStates(prev => ({ ...prev, animeMatches: false }));
    }
  };

  const fetchVibeRows = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, vibeRows: true }));
      const vibeData: Record<string, any[]> = {};
      for (const mood of moods.slice(0, 3)) {
        vibeData[mood.id] = generateMockRecommendations(6, mood.id);
      }
      setVibeRows(vibeData);
      setLoadingStates(prev => ({ ...prev, vibeRows: false }));
    } catch (error) {
      console.error('Error fetching vibe rows:', error);
      setLoadingStates(prev => ({ ...prev, vibeRows: false }));
    }
  };

  // Infinite scroll handler
  const handleScroll = (sectionKey: string) => {
    const element = scrollRefs.current[sectionKey];
    if (!element) return;

    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 200) {
      // Near bottom, load more
      loadMoreForSection(sectionKey);
    }
  };

  const loadMoreForSection = async (sectionKey: string) => {
    // Implement loading more items for a section
    // For simplicity, we'll just add more mock data
    setLoadingStates(prev => ({ ...prev, [sectionKey]: true }));
    try {
      // In a real app, we would fetch more from API with pagination
      // For now, we'll simulate by adding more mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      
      let currentData: any[] = [];
      switch (sectionKey) {
        case 'pickedForYou':
          currentData = pickedForYou;
          setPickedForYou([...currentData, ...generateMockRecommendations(5)]);
          break;
        case 'trendingNow':
          currentData = trendingNow;
          setTrendingNow([...currentData, ...generateMockRecommendations(5)]);
          break;
        default:
          // For genre and vibe rows, we'd need to know which genre/mood
          // This is simplified - in reality we'd pass more context
          break;
      }
    } catch (error) {
      console.error(`Error loading more for ${sectionKey}:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  // Helper functions
  const getTopUserGenres = (user: any): string[] => {
    const dna = user.entertainmentDNA;
    if (!dna) return [];
    
    // Convert DNA to array and sort by score
    const dnaArray = Object.entries(dna).filter(([, value]) => typeof value === 'number') as [string, number][];
    return dnaArray
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);
  };

  const generateMockRecommendations = (count: number, genreFocus?: string): any[] => {
    const mockData: any[] = [];
    const types = ['movie', 'anime', 'tv', 'music', 'podcast'];
    const genres = ['Action', 'Sci-Fi', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const genre = genreFocus || genres[Math.floor(Math.random() * genres.length)];
      const matchScore = Math.floor(Math.random() * 40) + 60; // 60-100
      
      mockData.push({
        id: `${type}-${Date.now()}-${i}`,
        title: `${genre} ${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
        type,
        posterUrl: `https://via.placeholder.com/300x450?text=${type}+${i+1}`,
        rating: Math.floor(Math.random() * 10) / 1,
        genres: [genre],
        platforms: type === 'movie' ? ['Netflix'] : type === 'anime' ? ['Crunchyroll'] : ['Spotify'],
        streamingUrl: '#',
        description: `A great ${type} in the ${genre} genre that you might enjoy based on your taste.`,
        year: 2020 + Math.floor(Math.random() * 5),
        matchScore,
      });
    }
    return mockData;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-coral/10 rounded-xl p-6 text-accent-coral">
        <p>{error}</p>
        <Link href="/(auth)/login" className="mt-4 inline-block text-accent-blue hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-background-secondary/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <h1 className="font-outfit text-xl text-primary">CineVerse AI</h1>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {/* In a real app, we'd have search, notifications, avatar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 bg-background-tertiary border border-accent-blue/20 rounded-lg text-primary focus:outline-none focus:border-accent-blue w-48"
            />
          </div>
          <div className="relative">
            <button className="p-2 text-accent-blue hover:text-accent-blue/80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158v1.5a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2h1.08A7.52 7.52 0 019 18a7.52 7.52 0 014.22-.91" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <img 
              src="https://via.placeholder.com/40" 
              alt="Avatar" 
              className="w-10 h-10 rounded-full ring-2 ring-accent-blue/20"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="font-outfit text-2xl md:text-3xl text-primary">
            Good evening, {user.name || user.email?.split('@')[0] || 'there'}. Here's what we think you'll love tonight.
          </h2>
        </motion.div>

        {/* Featured Recommendation (Hero) */}
        {pickedForYou.length > 0 && (
          <motion.div
            key="featured"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <ContentCard 
              content={pickedForYou[0]} 
              isFeatured 
              onSave={() => console.log('Saved to watchlist')}
            />
          </motion.div>
        )}

        {/* Mood Quick-Select */}
        <motion.div
          key="mood-selector"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-3">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => {
                  setSelectedMood(selectedMood === mood.id ? null : mood.id);
                  // In a real app, we would refetch recommendations with this mood
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${selectedMood === mood.id 
                  ? 'bg-accent-blue text-white' 
                  : 'bg-background-tertiary hover:bg-accent-blue/10'
                } rounded-lg text-sm font-medium transition-all`}
              >
                <span>{mood.emoji}</span>
                <span>{mood.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Horizontal Scroll Rows */}
        <div className="space-y-8">
          {/* Picked For You */}
          <motion.div
            key="picked-for-you-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-outfit text-xl text-primary">Picked For You</h3>
              <Link href="#" className="text-sm text-accent-blue hover:text-accent-blue/80">
                See all
              </Link>
            </div>
            <div
              ref={(el) => { scrollRefs.current.pickedForYou = el; }}
              onScroll={() => handleScroll('pickedForYou')}
              className="overflow-x-auto space-x-4 pb-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              {loadingStates.pickedForYou ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-24 skeleton-loader"></div>
                ))
              ) : (
                pickedForYou.slice(1).map((content, index) => (
                  <ContentCard 
                    key={content.id || index} 
                    content={content} 
                    onSave={() => console.log('Saved to watchlist')}
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Genre Rows */}
          {Object.keys(genreRows).map((genre) => (
            <motion.div
              key={`genre-row-${genre}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-outfit text-xl text-primary">Because You Love {genre}</h3>
                <Link href="#" className={`
                  text-sm text-accent-blue hover:text-accent-blue/80
                `}>
                  See all
                </Link>
              </div>
              <div
                ref={(el) => { scrollRefs.current[`genre-${genre}`] = el; }}
                onScroll={() => handleScroll(`genre-${genre}`)}
                className="overflow-x-auto space-x-4 pb-2"
                style={{ scrollBehavior: 'smooth' }}
              >
                {loadingStates.genreRows ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-24 skeleton-loader"></div>
                  ))
                ) : (
                  genreRows[genre].map((content, index) => (
                    <ContentCard 
                      key={content.id || `${genre}-${index}`} 
                      content={content} 
                      onSave={() => console.log('Saved to watchlist')}
                    />
                  ))
                )}
              </div>
            </motion.div>
          ))}

          {/* Trending Now */}
          <motion.div
            key="trending-now-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-outfit text-xl text-primary">Trending Now</h3>
              <Link href="#" className="text-sm text-accent-blue hover:text-accent-blue/80">
                See all
              </Link>
            </div>
            <div
              ref={(el) => { scrollRefs.current.trendingNow = el; }}
              onScroll={() => handleScroll('trendingNow')}
              className="overflow-x-auto space-x-4 pb-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              {loadingStates.trendingNow ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-24 skeleton-loader"></div>
                ))
              ) : (
                trendingNow.map((content, index) => (
                  <ContentCard 
                    key={content.id || `trending-${index}`} 
                    content={content} 
                    onSave={() => console.log('Saved to watchlist')}
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Anime Row */}
          {animeMatches.length > 0 && (
            <motion.div
              key="anime-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-outfit text-xl text-primary">Anime That Matches Your DNA</h3>
                <Link href="#" className="text-sm text-accent-blue hover:text-accent-blue/80">
                  See all
                </Link>
              </div>
              <div
                ref={(el) => { scrollRefs.current.anime = el; }}
                onScroll={() => handleScroll('anime')}
                className="overflow-x-auto space-x-4 pb-2"
                style={{ scrollBehavior: 'smooth' }}
              >
                {loadingStates.animeMatches ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-24 skeleton-loader"></div>
                  ))
                ) : (
                  animeMatches.map((content, index) => (
                    <ContentCard 
                      key={content.id || `anime-${index}`} 
                      content={content} 
                      onSave={() => console.log('Saved to watchlist')}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Vibe Rows (Mood-based) */}
          {Object.keys(vibeRows).map((moodId) => {
            const mood = moods.find(m => m.id === moodId);
            if (!mood) return null;
            return (
              <motion.div
                key={`vibe-row-${moodId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-outfit text-xl text-primary">Your Vibe Tonight: {mood.label}</h3>
                  <Link href="#" className="text-sm text-accent-blue hover:text-accent-blue/80">
                    See all
                  </Link>
                </div>
                <div
                  ref={(el) => { scrollRefs.current[`vibe-${moodId}`] = el; }}
                  onScroll={() => handleScroll(`vibe-${moodId}`)}
                  className="overflow-x-auto space-x-4 pb-2"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {loadingStates.vibeRows ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="w-24 skeleton-loader"></div>
                    ))
                  ) : (
                    vibeRows[moodId].map((content, index) => (
                      <ContentCard 
                        key={content.id || `${moodId}-${index}`} 
                        content={content} 
                        onSave={() => console.log('Saved to watchlist')}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}