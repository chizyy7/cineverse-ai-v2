import { motion } from 'framer-motion';

interface ContentTypeStepProps {
  selected: string[];
  onChange: (value: string[]) => void;
}

export const ContentTypeStep = ({ selected, onChange }: ContentTypeStepProps) => {
  const contentTypes = [
    { id: 'movies', label: 'Movies', icon: '🎬' },
    { id: 'anime', label: 'Anime', icon: '🎌' },
    { id: 'tvShows', label: 'TV Shows', icon: '📺' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'podcasts', label: 'Podcasts', icon: '🎧' }
  ];

  const toggleSelection = (type: string) => {
    const next = selected.includes(type)
      ? selected.filter(t => t !== type)
      : [...selected, type];
    onChange(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="font-outfit text-2xl md:text-3xl mb-4">
        What do you enjoy?
      </h2>
      <p className="text-secondary mb-6">
        Select the types of entertainment you enjoy. Choose at least one.
      </p>
      
      <div className="grid gap-4 sm:grid-cols-3">
        {contentTypes.map((type) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: selected.indexOf(type.id) * 0.05 }}
            onClick={() => toggleSelection(type.id)}
            className={`${selected.includes(type.id) ? 'glow-border p-6 bg-background-tertiary hover:bg-accent-blue/5 transition-all duration-300' : 'p-6 bg-background-tertiary hover:bg-accent-blue/5 transition-all duration-300 rounded-lg'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-4xl">{type.icon}</div>
                <div>
                  <h3 className="font-outfit text-primary">{type.label}</h3>
                  <p className="text-xs text-secondary">
                    Enjoy {type.label.toLowerCase()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 text-center text-sm text-secondary">
          {selected.length > 0 
            ? `You've selected ${selected.length} ${selected.length === 1 ? 'type' : 'types'}` 
            : 'Please select at least one entertainment type'}
        </div>
      </motion.div>
    );
};