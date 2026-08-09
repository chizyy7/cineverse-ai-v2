'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { ArrowRightIcon } from 'lucide-react'
import { ClipboardList, MessageSquare, BarChart3, BrainCog, Sparkles } from 'lucide-react'


export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-primary mb-8">
          Choose Your Plan
        </h1>
        <p className="text-center text-secondary max-w-2xl mb-12 mx-auto">
          Unlock the full potential of CineVerse AI with our Premium plan
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Free Plan */}
          <Card className="border-border/50 hover:border-border/75 transition-border">
            <CardHeader className="pb-6">
              <h2 className="text-2xl font-semibold text-primary">
                Free <span className="text-xs font-normal">$0/month</span>
              </h2>
              <p className="text-muted-foreground mt-2">
                Get started with basic entertainment discovery
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <ClipboardList className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                <span>Basic AI recommendations</span>
              </div>
              <div className="flex items-start space-x-3">
                <ClipboardList className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                <span>Watchlists (up to 3 collections)</span>
              </div>
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                <span>Ratings &amp; reviews</span>
              </div>
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                <span>Basic analytics</span>
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/">Get Started Free</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card
            className="border-border/0 hover:border-border/0 shadow-lg transition-all
                       border-accent-gold/20 hover:border-accent-gold/40
                       bg-background/50 backdrop-blur-sm"
          >
            <CardHeader className="pb-6">
              <div className="flex items-baseline space-x-2 mb-4">
                <h2 className="text-2xl font-semibold text-primary">
                  Premium
                </h2>
                <Badge variant="secondary">Most Popular</Badge>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-accent-gold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mt-2">
                Save 20% with annual billing: $79.99/year (2 months free)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <BrainCog className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                <span>Advanced AI recommendations (more personalized, cross-domain)</span>
              </div>
              <div className="flex items-start space-x-3">
                <ClipboardList className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                <span>Unlimited collections</span>
              </div>
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                <span>AI Chat Assistant (unlimited messages)</span>
              </div>
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                <span>Deep analytics + monthly reports</span>
              </div>
              <div className="flex items-start space-x-3">
                <BrainCog className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                <span>Entertainment DNA insights</span>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="h-4 w-4 text-accent-blue mt-1 flex-shrink-0" />
                <span>Early access to new features</span>
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <Button
                variant="default"
                className="w-full bg-accent-gold text-primary hover:bg-accent-gold/90"
                onClick={() => {
                  // TODO: Implement Stripe checkout
                  alert('Redirecting to Stripe checkout...')
                }}
              >
                Upgrade to Premium
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center text-muted-foreground">
          <p>
            All plans include access to our core features. Cancel anytime.
          </p>
          <p className="mt-2">
            Need help? <a href="#" className="text-accent-blue underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  )
}