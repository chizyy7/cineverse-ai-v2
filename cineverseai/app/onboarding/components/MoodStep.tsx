import { motion } from 'framer-motion';

interface MoodStepProps {
  selected: string[];
  onChange: (value: string[]) => void;
}

export const MoodStep = ({ selected, onChange }: MoodStepProps) => {
  const moods = [
    { id: 'emotional', label: 'Emotional', emoji: '😢', description: 'Stories that tug at your heartstrings' },
    { id: 'funny', label: 'Funny', emoji: '😂', description: 'Comedies and light-hearted fun' },
    { id: 'inspirational', label: 'Inspirational', emoji: '💪', description: 'Uplifting and motivating content' },
    { id: 'dark', label: 'Dark', emoji: '🌑', description: 'Moody, mysterious, and intense themes' },
    { id: 'mind-blowing', label: 'Mind-blowing', emoji: '🤯', description: 'Plot twists and mind-bending narratives' },
    { id: 'relaxing', label: 'Relaxing', emoji: '😌', description: 'Calm and soothing experiences' },
    { id: 'intense', label: 'Intense', emoji: '🔥', description: 'High-energy and adrenaline-pumping' },
    { id: 'family-friendly', label: 'Family-friendly', emoji: '👨‍👩‍👧‍👦', description: 'Content suitable for all ages' }
  ];

  const toggleSelection = (moodId: string) => {
    onChange(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId) 
        : [...prev, moodId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="font-outfit text-2xl md:text-3xl mb-4">
        Your mood preferences
      </h2>
      <p className="text-secondary mb-6">
        When you're in the mood for something specific, we'll know exactly what to recommend.
      </p>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {moods.map((mood) => (
          <motion.div
            key={mood.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: moods.indexOf(mood) * 0.05 }}
            className={`${selected.includes(mood.id) 
              ? 'glow-border p-6 bg-background-tertiary hover:bg-accent-blue/5 transition-all duration-300'
              : 'p-6 bg-background-tertiary hover:bg-accent-blue/5 transition-all duration-300 rounded-lg'`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="text-3xl">{mood.emoji}</div>
                <h3 className="font-outfit text-primary">{mood.label}</h3>
                <p className="text-xs text-center text-secondary">
                  {mood.description}
                </p>
              </div>
            </motion.div>
          ))}
      </div>
      
      <div className="mt-4 text-center text-sm text-secondary">
        {selected.length > 0 
          ? `You've selected ${selected.length} ${selected.length === 1 ? 'mood' : 'moods'}` 
          : 'Please select at least one mood preference'}
      </div>
    </motion.div>
  );
};