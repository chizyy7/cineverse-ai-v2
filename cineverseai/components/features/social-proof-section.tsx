import { motion } from 'framer-motion';

export const SocialProofSection = () => {
  const testimonials = [
    {
      name: "Alex Rivera",
      avatar: "https://via.placeholder.com/40",
      rating: 5,
      text: "CineVerse AI found me the perfect anime that matched my Interstellar obsession. Never would have discovered it on my own!",
    },
    {
      name: "Sam Chen",
      avatar: "https://via.placeholder.com/40",
      rating: 5,
      text: "Finally, an app that understands my mood. When I'm feeling down, it knows exactly what to recommend.",
    },
    {
      name: "Jordan Lee",
      avatar: "https://via.placeholder.com/40",
      rating: 5,
      text: "The cross-domain recommendations are genius. Loved how it connected my favorite sci-fi movies to space-themed podcasts.",
    }
  ];

  return (
    <section className="py-20 bg-background-primary">
      <div className="container mx-auto px-6">
        <h2 className="text-center font-outfit text-3xl md:text-4xl mb-12">
          What Users Are Saying
        </h2>
        
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-outfit text-primary">{testimonial.name}</h3>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 text-accent-gold ${star <= testimonial.rating ? 'fill-current' : 'text-accent-blue/20'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.218 4.324a1 1 0 001.518.602l-3.766-2.274a1 1 0 00-1.048-.06l-3.766 2.274a1 1 0 00-1.518-.602l1.218-4.324a1 1 0 00-.363-1.118L2.031 7.601c-.783-.57-1.386-1.81-.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-secondary italic">
                "{testimonial.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};