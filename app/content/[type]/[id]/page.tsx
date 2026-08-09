import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ContentPage({
  params: { type, id },
}: {
  params: { type: string; id: string };
}) {
  // In a real app, fetch content from TMDB or your database
  const content = await fetchContent(type, id);
  if (!content) {
    notFound();
  }

  // Set dynamic metadata
  // eslint-disable-next-line @next/next/no-page-meta-in-custom-layout
  // We'll use the export metadata function below
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">{content.title}</h1>
          <p className="text-muted-foreground mt-2">
            {content.type} • {content.year}
          </p>
        </div>

        <div className="space-y-6">
          {/* Poster */}
          <div className="w-72 h-[calc(100%_*1.5)] max-h-[400px] rounded-xl overflow-hidden mb-6">
            {content.posterUrl ? (
              <img
                src={content.posterUrl}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-background-tertiary flex items-center justify-center text-accent-blue/50">
                No Poster
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-accent-blue text-white text-sm font-medium rounded-lg hover:bg-accent-blue/90 transition-colors"
            >
              ��� � � ▶������️ Play Trailer
            </button>
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-accent-gold text-primary text-sm font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
            >
              ���� �� �� 📥 Save to Watchlist
            </button>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <p className="text-text-secondary">
              {content.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {content.genres?.map((genre: string) => (
                <span key={genre} className="px-2 py-0.5 text-xs bg-accent-blue/10 text-accent-blue rounded">
                  {genre}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {content.platforms?.map((platform: string) => (
                <span key={platform} className="flex items-center space-x-1 text-xs text-text-tertiary">
                  {/* Platform logo placeholder */}
                  <div className="w-4 h-4 bg-accent-blue/20 rounded"></div>
                  <span>{platform}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="border-t border-accent-blue/20 pt-6">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Ratings & Reviews
            </h2>
            {/* In a real app, we'd fetch and display reviews */}
            <p className="text-text-tertiary">
              Be the first to review this {content.type.toLowerCase()}!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock fetch function
async function fetchContent(type: string, id: string) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return mock data
  return {
    id,
    type,
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Sample`,
    year: 2024,
    description: `This is a sample ${type} description for demonstration purposes.`,
    posterUrl: `https://via.placeholder.com/300x450?text=${type}+Sample`,
    genres: ['Action', 'Sci-Fi'],
    platforms: ['Netflix', 'Spotify'],
    matchScore: 85,
  };
}

// Export metadata dynamically
export async function generateMetadata({ params }: { params: { type: string; id: string } }) {
  const content = await fetchContent(params.type, params.id);
  if (!content) {
    return notFound();
  }

  return {
    title: `${content.title} (${content.year}) — ${content.matchScore}% Match for You | CineVerse AI`,
    description: `${content.description} Watch trailers, read reviews, and get personalized recommendations.`,
    // Optional: Open Graph image
    openGraph: {
      title: content.title,
      description: content.description,
      images: [
        {
          url: content.posterUrl,
          width: 300,
          height: 450,
          alt: content.title,
        },
      ],
    },
    // Optional: Twitter card
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: [content.posterUrl],
    },
  };
}