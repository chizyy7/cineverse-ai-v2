import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/features/hero-section';
import { ProblemSection } from '@/components/features/problem-section';
import { FeaturesSection } from '@/components/features/features-section';
import { HowItWorksSection } from '@/components/features/how-it-works-section';
import { SocialProofSection } from '@/components/features/social-proof-section';
import { PricingSection } from '@/components/features/pricing-section';
import Footer from '@/components/ui/footer';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
      <Footer />
    </>
  );
}