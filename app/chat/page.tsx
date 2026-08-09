'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { getEnv } from '@/lib/env'
import { createClientBrowser } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'
import { ChatPanel } from '@/components/features/AIAssistant/ChatPanel'

export default function ChatPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClientBrowser()

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Fetch extended user data from our database
          const { data: profile } = await supabase
            .from('User')
            .select('*')
            .eq('id', user.id)
            .single()
          setUser(profile)
        }
      } catch (err) {
        console.error('Error loading user:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please sign in to access AI Chat</div>
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            AI Chat Assistant
            <PremiumBadge isPremium={user.isPremium ?? false} className="ml-2" />
          </h1>
          <p className="text-muted-foreground mt-2">
            Chat with our AI entertainment expert for personalized recommendations and insights
          </p>
        </div>

        <div className="mb-6">
          <Button
            variant="default"
            className="w-full md:w-auto"
            onClick={() => {
              // Chat panel is already loaded in layout, just ensure it's open
              // This is more of a UX enhancement
              alert('AI Chat Assistant is available in the panel on the right')
            }}
          >
            Open AI Chat Assistant
          </Button>
        </div>

        <div className="space-y-6">
          {/* Chat would be displayed here - using the existing ChatPanel from layout */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-semibold text-primary">How to use AI Chat</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 text-accent-blue">���💬</span>
                  <div>
                    <h3 className="font-semibold text-primary">Ask for recommendations</h3>
                    <p className="text-text-tertiary">
                      "Find me movies like Inception" or "I'm in the mood for something funny"
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 text-accent-blue">���🎬</span>
                  <div>
                    <h3 className="font-semibold text-primary">Get content explanations</h3>
                    <p className="text-text-tertiary">
                      "Explain the ending of Interstellar" or "What themes are in Parasite?"
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 text-accent-blue">���📊</span>
                  <div>
                    <h3 className="font-semibold text-primary">Discover insights</h3>
                    <p className="text-text-tertiary">
                      "What does my Entertainment DNA say about me?" or "Show me my taste evolution"
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/*
          The actual chat interface is in the ChatPanel component which is already
          included in the layout.tsx file and will be visible on this page
        */}
      </div>
    </div>
  )
}