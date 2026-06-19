'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export const FeaturesSection = () => {
  const features = [
    {
      title: "Entertainment DNA",
      description: "Your unique taste profile across movies, anime, TV, music, and podcasts.",
      icon: "🧬",
      bgColor: "bg-accent-blue/10",
      borderColor: "border-accent-blue/20"
    },
    {
      title: "Mood Discovery",
      description: "Find content that matches how you feel right now.",
      icon: "😊",
      bgColor: "bg-accent-blue/10",
      borderColor: "border-accent-blue/20"
    },
    {
      title: "AI Match Score",
      description: "See exactly why we recommend something with % match scores.",
      icon: "🎯",
      bgColor: "bg-accent-blue/10",
      borderColor: "border-accent-blue/20"
    },
    {
      title: "Cross-Domain Recs",
      description: "Get recommendations that connect across different media types.",
      icon: "🔗",
      bgColor: "bg-accent-blue/10",
      borderColor: "border-accent-blue/20"
    },
    {
      title: "AI Assistant",
      description: "Chat with our AI for personalized recommendations.",
      icon: "🤖",
      bgColor: "bg-accent-blue/10",
      borderColor: "border-accent-blue/20"
    },
    {
      title: "Social Features",
      description: "Follow friends, share lists, and see what others are watching.",
      icon: "👥",
      bgColor: "bg-accent-blue/10",
      borderColor: "border-accent-blue/20"
    }
  ];

  return (
    <section className="py-20 bg-background-primary">
      <div className="container mx-auto px-6">
        <h2 className="text-center font-outfit text-3xl md:text-4xl mb-16">
          How CineVerse AI Works
        </h2>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${feature.bgColor} rounded-2xl p-8 ${feature.borderColor} hover:border-accent-blue/40 transition-all duration-300`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-outfit text-xl mb-3">{feature.title}</h3>
              <p className="text-secondary">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};