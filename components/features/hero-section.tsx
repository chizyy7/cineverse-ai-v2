import Link from 'next/link';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] bg-[url('https://via.placeholder.com/1920x1080')] bg-cover bg-center flex items-center">
      {/* Background floating posters (placeholder) */}
      <div className="absolute inset-0 bg-[url('https://via.placeholder.com/300x450')] bg-repeat bg-[size:300px_450px] opacity-10 animate-[float_3s_ease-in-out_infinite]"></div>
      <div className="absolute inset-0 bg-[url('https://via.placeholder.com/300x450')] bg-repeat bg-[size:300px_450px] opacity-10 animate-[float_3s_ease-in-out_infinite] delay-150" style={{ left: '20%', top: '10%' }}></div>
      <div className="absolute inset-0 bg-[url('https://via.placeholder.com/300x450')] bg-repeat bg-[size:300px_450px] opacity-10 animate-[float_3s_ease-in-out_infinite] delay-300" style={{ left: '60%', top: '50%' }}></div>
      
      <div className="relative z-10 container mx-auto px-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-primary"
        >
          <h1 className="font-outfit text-5xl md:text-6xl mb-6">
            Your Entertainment, Finally Understood.
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto mb-8">
            CineVerse AI builds your unique Entertainment DNA and recommends movies, anime, TV shows, music, and podcasts using advanced AI. Discover content you'll love across all platforms.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/(auth)/signup" className="flex items-center px-8 py-4 bg-accent-blue text-white rounded-lg font-medium transition-all hover:bg-accent-blue/90">
              Get Started Free
            </Link>
            <Link href="#how-it-works" className="flex items-center px-8 py-4 border border-accent-blue text-accent-blue rounded-lg font-medium transition-all hover:bg-accent-blue/10">
              See How It Works
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Keyframes for floating animation (we'll add to globals.css later, but for now we'll use inline style)
/*
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}
*/