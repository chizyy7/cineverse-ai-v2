import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { saveDNA } from '@/lib/actions/dna';
import { ContentTypeStep } from './components/ContentTypeStep';
import { GenreStep } from './components/GenreStep';
import { FavoritesStep } from './components/FavoritesStep';
import { MoodStep } from './components/MoodStep';
import { ResultsStep } from './components/ResultsStep';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    contentTypes: [] as string[],
    genres: [] as string[],
    favoriteMovies: [] as string[],
    favoriteAnime: [] as string[],
    favoriteArtists: [] as string[],
    favoriteActors: [] as string[],
    moodPreferences: [] as string[],
  });

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveDNA(formData);
      // Redirect to dashboard after saving
      // In a real app, you'd use router.push('/dashboard')
      alert('Your Entertainment DNA has been saved! Redirecting to dashboard...');
    } catch (err: any) {
      alert(`Error saving DNA: ${err.message}`);
    }
  };

  // Validate current step before allowing progression
  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.contentTypes.length > 0;
      case 2:
        return formData.genres.length > 0;
      case 3:
        return true; // No validation required for favorites
      case 4:
        return formData.moodPreferences.length > 0;
      default:
        return true;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[100vh] flex items-center justify-center bg-background-secondary"
    >
      {/* Background animation */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-[url('https://via.placeholder.com/1920x1080')] bg-cover bg-center blur-3xl"></div>
      </div>
      
      <div className="relative z-10 glass-card w-full max-w-2xl p-6 mx-4">
        <div className="space-y-8">
          {/* Progress Bar */}
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center space-x-4 mb-4"
          >
            <div className="flex-1 space-x-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0.2, scale: 0.8 }}
                  animate={{ 
                    opacity: s <= step ? 1 : 0.2, 
                    scale: s <= step ? 1 : 0.8 
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-3 h-3 bg-accent-blue rounded-full transition-all"
                />
              ))}
            </div>
            <p className="text-xs text-secondary">Step {step} of 5</p>
          </motion.div>
          
          {/* Step Content */}
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {step === 1 && <ContentTypeStep 
              selected={formData.contentTypes} 
              onChange={(value) => setFormData(prev => ({ ...prev, contentTypes: value }))} 
            />}
            {step === 2 && <GenreStep 
              selected={formData.genres} 
              onChange={(value) => setFormData(prev => ({ ...prev, genres: value }))}
              contentTypes={formData.contentTypes}
            />}
            {step === 3 && <FavoritesStep 
              favoriteMovies={formData.favoriteMovies}
              favoriteAnime={formData.favoriteAnime}
              favoriteArtists={formData.favoriteArtists}
              favoriteActors={formData.favoriteActors}
              onMoviesChange={(value) => setFormData(prev => ({ ...prev, favoriteMovies: value }))}
              onAnimeChange={(value) => setFormData(prev => ({ ...prev, favoriteAnime: value }))}
              onArtistsChange={(value) => setFormData(prev => ({ ...prev, favoriteArtists: value }))}
              onActorsChange={(value) => setFormData(prev => ({ ...prev, favoriteActors: value }))}
            />}
            {step === 4 && <MoodStep 
              selected={formData.moodPreferences} 
              onChange={(value) => setFormData(prev => ({ ...prev, moodPreferences: value }))} 
            />}
            {step === 5 && <ResultsStep 
              dnaData={formData}
              onSubmit={handleSubmit}
            />}
          </motion.div>
          
          {/* Navigation Buttons */}
          {step < 5 && (
            <motion.div
              key="nav-buttons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex justify-between pt-4 border-t border-accent-blue/10"
            >
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="px-4 py-2 bg-transparent border border-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/10 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                disabled={!isStepValid() || step === 5}
                className="px-6 py-3 bg-accent-blue text-white font-medium rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
              >
                {step === 4 ? 'See Results' : 'Next'}
              </button>
            </motion.div>
          )}
          
          {step === 5 && (
            <motion.div
              key="final-button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="pt-4 border-t border-accent-blue/10"
            >
              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center px-6 py-3 bg-accent-gold text-white font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
              >
                Start Discovering →
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}