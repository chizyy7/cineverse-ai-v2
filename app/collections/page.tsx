import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { getEnv } from '@/lib/env'
import { createClientBrowser } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'

export default function CollectionsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [collections, setCollections] = useState<any[]>([])

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
            .from('users')
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

  // Load collections
  useEffect(() => {
    if (user) {
      const loadCollections = async () => {
        try {
          const { data } = await supabase
            .from('collections')
            .select('*')
            .eq('userId', user.id)
            .order('createdAt', { ascending: false })
          setCollections(data)
        } catch (err) {
          console.error('Error loading collections:', err)
        }
      }
      loadCollections()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please sign in to access collections</div>
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Your Collections
            <PremiumBadge isPremium={user.isPremium ?? false} className="ml-2" />
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize your favorite content into personalized collections
          </p>
        </div>

        <div className="mb-6">
          <Button
            variant="default"
            className="w-full md:w-auto"
            onClick={() => {
              // TODO: Implement create collection modal
              alert('Create collection modal would open here')
            }}
          >
            + New Collection
          </Button>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-tertiary">
              You haven't created any collections yet. Start by creating your first collection!
            </p>
            <Button variant="outline" className="mt-4">
              Create First Collection
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <h3 className="text-xl font-semibold text-primary">{collection.name}</h3>
                  {collection.description && (
                    <p className="text-text-secondary mt-2">{collection.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 grid-cols-2">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="aspect-w-1 aspect-h-1 overflow-hidden rounded bg-background-secondary/50">
                        {/* Collection item would go here */}
                        <div className="flex h-full w-full items-center justify-center text-text-tertiary text-xs">
                          Item {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-text-tertiary text-sm">
                      {collection.watchlistItems?.length || 0} items
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement view collection
                        alert(`View collection: ${collection.name}`)
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}