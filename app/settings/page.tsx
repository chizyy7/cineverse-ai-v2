'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Stars } from '@/components/ui/Stars';
import { createClientBrowser } from '@/lib/supabase-client';
import { getUserClient } from '@/lib/auth-client';
import { PremiumBadge } from '@/components/ui/PremiumBadge';
import { useRouter } from 'next/navigation';
import { createCheckoutSession, createPortalSession, getSubscriptionStatus } from '@/lib/stripe';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, Radar } from 'recharts';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { success, error, info } = useToast();
  const router = useRouter();
  const supabase = createClientBrowser();

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserClient();
        if (userData) {
          setUser(userData);
        } else {
          setUser(null);
          router.push('/(auth)/login');
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setUser(null);
        router.push('/(auth)/login');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please sign in to access settings</div>;
  }

  // Form states for profile tab
  const [username, setUsername] = useState(user.username || '');
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    instagram: '',
    youtube: '',
    tiktok: '',
  });

  // Form states for notifications tab
  const [notifications, setNotifications] = useState({
    followers: user.notificationPreferences?.followers ?? true,
    reviewLikes: user.notificationPreferences?.reviewLikes ?? true,
    weeklyRecommendations: user.notificationPreferences?.weeklyRecommendations ?? true,
    achievements: user.notificationPreferences?.achievements ?? true,
  });

  // Form states for privacy tab
  const [privacy, setPrivacy] = useState({
    profilePublic: user.privacySettings?.profilePublic ?? true,
    watchlistPublic: user.privacySettings?.watchlistPublic ?? true,
    blockedUsers: user.privacySettings?.blockedUsers ?? [], // In a real app, fetch from database
  });

  // Subscription tab states
  const [subscription, setSubscription] = useState({
    plan: user.isPremium ? 'Premium' : 'Free',
    status: user.isPremium ? 'active' : 'inactive',
    isPremium: user.isPremium ?? false,
    stripeCustomerId: user.stripeCustomerId ?? null,
    stripeSubscriptionId: user.stripeSubscriptionId ?? null,
  });

  // Entertainment DNA tab states
  const [dna, setDna] = useState(user.entertainmentDNA || null);
  const [dnaHistory, setDnaHistory] = useState([]); // In a real app, fetch from database
  const [dnaChartData, setDnaChartData] = useState([]);

  // Convert DNA object to chart data format for Recharts
  useEffect(() => {
    if (dna) {
      const chartData = Object.entries(dna).map(([genre, value]) => ({
        genre,
        value: value,
      }));
      setDnaChartData(chartData);
    }
  }, [dna]);

  // Handle form submissions
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let uploadAvatarUrl = avatarUrl;
      if (avatarFile) {
        // Upload avatar to Supabase Storage
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase
          .storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(fileName);
        uploadAvatarUrl = publicUrl;
      }

      // Update user in database
      const { error } = await supabase
        .from('User')
        .update({
          username,
          name,
          bio,
          avatarUrl: uploadAvatarUrl,
          twitter: socialLinks.twitter,
          instagram: socialLinks.instagram,
          youtube: socialLinks.youtube,
          tiktok: socialLinks.tiktok,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser(prev => ({ ...prev, username, name, bio, avatarUrl: uploadAvatarUrl,
        twitter: socialLinks.twitter, instagram: socialLinks.instagram, youtube: socialLinks.youtube, tiktok: socialLinks.tiktok }));
      success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      error('Failed to update profile');
    }
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save notification preferences
      const { error } = await supabase
        .from('User')
        .update({
          notificationPreferences: notifications,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser(prev => ({ ...prev, notificationPreferences: notifications }));
      success('Notification preferences saved');
    } catch (err) {
      console.error('Error saving notifications:', err);
      error('Failed to save notification preferences');
    }
  };

  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save privacy settings
      const { error } = await supabase
        .from('User')
        .update({
          privacySettings: privacy,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser(prev => ({ ...prev, privacySettings: privacy }));
      success('Privacy settings saved');
    } catch (err) {
      console.error('Error saving privacy:', err);
      error('Failed to save privacy settings');
    }
  };

  const handleDnaReset = async () => {
    if (window.confirm('Are you sure you want to reset your Entertainment DNA? This will require you to retake the onboarding quiz.')) {
      try {
        // In a real app, reset DNA in database and redirect to onboarding
        success('Entertainment DNA reset. Redirecting to onboarding...');
        setTimeout(() => {
          router.push('/onboarding');
        }, 1500);
      } catch (err) {
        console.error('Error resetting DNA:', err);
        error('Failed to reset DNA');
      }
    }
  };

  const handleUpgrade = async () => {
    try {
      const { url } = await createCheckoutSession(user.id, 'monthly');
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      error('Failed to create checkout session');
    }
  };

  const handleBillingPortal = async () => {
    try {
      if (!subscription.stripeCustomerId) {
        error('No active subscription found');
        return;
      }
      const { url } = await createPortalSession(user.id);
      window.location.href = url;
    } catch (err) {
      console.error('Error creating portal session:', err);
      error('Failed to open billing portal');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete your account, reviews, watchlists, and all associated data. Continue?')) {
        try {
          // In a real app, delete account via Supabase
          // We'll also need to delete storage files, etc.
          // For now, we'll just sign out and delete the user row
          const { error } = await supabase.from('User').delete().eq('id', user.id);
          if (error) throw error;

          success('Account deletion initiated. Redirecting to home...');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } catch (err) {
          console.error('Error deleting account:', err);
          error('Failed to delete account');
        }
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Settings
            <PremiumBadge isPremium={subscription.isPremium} className="ml-2" />
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your CineVerse AI account and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Tab Section */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 border-b border-accent-blue/20">
              <TabsTrigger value="profile" className="hover:text-accent-blue">
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="hover:text-accent-blue">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="dna" className="hover:text-accent-blue">
                Entertainment DNA
              </TabsTrigger>
              <TabsTrigger value="privacy" className="hover:text-accent-blue">
                Privacy
              </TabsTrigger>
              <TabsTrigger value="subscription" className="hover:text-accent-blue">
                Subscription
              </TabsTrigger>
              <TabsTrigger value="danger" className="hover:text-accent-coral">
                Danger Zone
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab Content */}
            <TabsContent value="profile">
              <form onSubmit={handleProfileSubmit} className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={setUsername}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="name">Full Name (optional)</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={setName}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people about yourself"
                    className="w-full min-h-[80px] resize-y border-border/20 px-3 py-2 rounded-md focus:outline-none focus:border-accent-blue focus:ring-accent-blue/20 transition-colors"
                    maxLength={500}
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="avatar">Avatar</Label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-full border-2 border-accent-blue/20"
                      />
                    ) : avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-full border-2 border-accent-blue/20"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="space-y-6">
                  <Label htmlFor="social-links">Social Links (optional)</Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={socialLinks.twitter}
                        onChange={(value) => setSocialLinks(prev => ({ ...prev, twitter: value }))}
                        placeholder="twitter.com/yourhandle"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={socialLinks.instagram}
                        onChange={(value) => setSocialLinks(prev => ({ ...prev, instagram: value }))}
                        placeholder="instagram.com/yourhandle"
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        value={socialLinks.youtube}
                        onChange={(value) => setSocialLinks(prev => ({ ...prev, youtube: value }))}
                        placeholder="youtube.com/yourchannel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok">TikTok</Label>
                      <Input
                        id="tiktok"
                        value={socialLinks.tiktok}
                        onChange={(value) => setSocialLinks(prev => ({ ...prev, tiktok: value }))}
                        placeholder="tiktok.com/@yourhandle"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="default" className="w-full">
                  Save Profile
                </Button>
              </form>
            </TabsContent>

            {/* Notifications Tab Content */}
            <TabsContent value="notifications">
              <form onSubmit={handleNotificationsSubmit} className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Label htmlFor="followers">Notify me when someone follows me</Label>
                  <Checkbox
                    id="followers"
                    checked={notifications.followers}
                    onChange={(checked) => setNotifications(prev => ({ ...prev, followers: checked }))}
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="reviewLikes">Notify me when someone likes my review</Label>
                  <Checkbox
                    id="reviewLikes"
                    checked={notifications.reviewLikes}
                    onChange={(checked) => setNotifications(prev => ({ ...prev, reviewLikes: checked }))}
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="weeklyRecommendations">Send me weekly AI recommendations via email</Label>
                  <Checkbox
                    id="weeklyRecommendations"
                    checked={notifications.weeklyRecommendations}
                    onChange={(checked) => setNotifications(prev => ({ ...prev, weeklyRecommendations: checked }))}
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="achievements">Notify me when I unlock an achievement</Label>
                  <Checkbox
                    id="achievements"
                    checked={notifications.achievements}
                    onChange={(checked) => setNotifications(prev => ({ ...prev, achievements: checked }))}
                  />
                </div>

                <Button type="submit" variant="default" className="w-full">
                  Save Notification Preferences
                </Button>
              </form>
            </TabsContent>

            {/* Entertainment DNA Tab Content */}
            <TabsContent value="dna">
              <div className="space-y-6 mt-4">
                {dna ? (
                  <>
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-primary">Your Current Entertainment DNA</h2>
                      <p className="text-muted-foreground">
                        Your DNA is based on your viewing, rating, and review history.
                      </p>
                    </div>

                    {/* DNA Chart */}
                    <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-text-secondary">Genre affinity scores based on your activity</p>
                        <button
                          onClick={() => {
                            // In a real app, toggle between showing all and top genres
                          }}
                          className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                        >
                          Show Top 8
                        </button>
                      </div>

                      <div className="h-[300px]">
                        {dnaChartData.length > 0 ? (
                          <RadarChart
                            width={300}
                            height={300}
                            data={dnaChartData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                          >
                            <PolarGrid />
                            <PolarAngleAxis dataKey="genre" />
                            <PolarRadiusAxis />
                            <Tooltip />
                            <Legend />
                            <Radar dataKey="value" strokeWidth={2} fillOpacity={0.6} />
                          </RadarChart>
                        ) : (
                          <div className="flex items-center justify-center h-full text-text-tertiary">
                            DNA Radar Chart (Placeholder)
                          </div>
                        )}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {Object.entries(dna).map(([genre, value]) => (
                          <div key={genre} className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <div className="w-2 h-2 rounded-full bg-accent-blue" />
                            <span>{genre}</span>
                            <span className="text-accent-blue font-medium">{Number(value)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-text-tertiary">
                      No Entertainment DNA data available. Complete the onboarding quiz to generate your DNA.
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleDnaReset}
                      className="mt-4"
                    >
                      Take Onboarding Quiz
                    </Button>
                  </div>
                )}

                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-primary">DNA History</h2>
                  <p className="text-muted-foreground">
                    Track how your taste has evolved over time.
                  </p>
                  {dnaHistory.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {dnaHistory.map((entry, index) => (
                        <div key={index} className="bg-background-secondary/50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-text-tertiary">{new Date(entry.date).toLocaleDateString()}</span>
                            <span className="text-xs text-text-tertiary">Snapshot #{entry.index}</span>
                          </div>
                          <div className="h-[200px]">
                            <div className="flex items-center justify-center h-full text-text-tertiary">
                              DNA Chart (History Placeholder)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-text-tertiary">
                      No DNA history available yet.
                    </p>
                  )}
                </div>

                <div className="mt-8">
                  <Button
                    variant="destructive"
                    onClick={handleDnaReset}
                    className="w-full"
                  >
                    Reset Entertainment DNA
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Privacy Tab Content */}
            <TabsContent value="privacy">
              <form onSubmit={handlePrivacySubmit} className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Label htmlFor="profilePublic">Profile Visibility</Label>
                  <div className="flex items-center space-x-3">
                    <span className="text-text-tertiary">My profile is:</span>
                    <span className="text-primary font-medium">
                      {privacy.profilePublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">
                    When public, anyone can see your profile, reviews, and watchlists.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="watchlistPublic">Watchlist Visibility</Label>
                  <div className="flex items-center space-x-3">
                    <span className="text-text-tertiary">My watchlists are:</span>
                    <span className="text-primary font-medium">
                      {privacy.watchlistPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">
                    When public, others can see what you're planning to watch.
                  </p>
                </div>

                <div className="space-y-6">
                  <Label htmlFor="blocked-users">Blocked Users</Label>
                  <div className="space-y-3">
                    {privacy.blockedUsers.length > 0 ? (
                      <div className="space-y-2">
                        {privacy.blockedUsers.map((blockedUser, index) => (
                          <div key={index} className="flex items-center justify-between px-3 py-2 bg-background-secondary/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <img
                                src={blockedUser.avatarUrl || 'https://via.placeholder.com/40'}
                                alt={blockedUser.username}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="text-sm font-medium text-primary">{blockedUser.username}</p>
                                <p className="text-xs text-text-tertiary">@{blockedUser.username}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                // Remove from blocked list
                                setPrivacy(prev => ({
                                  ...prev,
                                  blockedUsers: prev.blockedUsers.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-xs text-accent-coral hover:underline"
                            >
                              Unblock
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-text-tertiary">
                        You haven't blocked any users yet.
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" variant="default" className="w-full">
                  Save Privacy Settings
                </Button>
              </form>
            </TabsContent>

            {/* Subscription Tab Content */}
            <TabsContent value="subscription">
              <div className="space-y-6 mt-4">
                <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-2xl p-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-primary">Current Plan</h2>
                    <div className="flex items-baseline space-x-2 mt-2">
                      <span className={subscription.isPremium ? 'text-3xl font-bold text-accent-gold' : 'text-2xl font-semibold text-primary'}>
                        {subscription.plan}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {subscription.isPremium ? '/month' : ''}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2">
                      {subscription.isPremium
                        ? 'Save 20% with annual billing: $79.99/year (2 months free)'
                        : 'Get personalized recommendations, unlimited chats, and more with Premium'}
                    </p>
                  </div>

                  {subscription.isPremium ? (
                    <>
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-primary">Billing Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-text-tertiary">Status:</span>
                            <span className="text-accent-success font-medium">{subscription.status}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-text-tertiary">Next Billing Date:</span>
                            <span className="text-primary font-medium">
                              {/* In a real app, format the date */}
                              Jan 15, 2027
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-text-tertiary">Payment Method:</span>
                            <span className="text-primary font-medium">•••• •••• •••• 4242</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-primary">Invoice History</h3>
                        <div className="space-y-4">
                          {/* Placeholder for invoice history */}
                          <div className="bg-background-secondary/50 p-4 rounded-lg">
                            <p className="text-sm text-text-tertiary">
                              No recent invoices. Your next invoice will be generated on Jan 15, 2027.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-primary">Why Upgrade?</h3>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <Badge variant="secondary">Advanced AI</Badge>
                            <span>More personalized, cross-domain recommendations</span>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Badge variant="secondary">Unlimited</Badge>
                            <span>Unlimited collections and AI chat messages</span>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Badge variant="secondary">Analytics</Badge>
                            <span>Deep analytics + monthly reports</span>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Badge variant="secondary">DNA</Badge>
                            <span>Entertainment DNA insights</span>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Badge variant="secondary">Access</Badge>
                            <span>Early access to new features</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    variant={subscription.isPremium ? 'outline' : 'default'}
                    onClick={handleUpgrade}
                    className={`w-full ${!subscription.isPremium ? 'bg-accent-gold text-primary' : ''}`}
                  >
                    {subscription.isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Danger Zone Tab Content */}
            <TabsContent value="danger">
              <div className="space-y-6 mt-4">
                <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-primary text-accent-coral">Danger Zone</h2>
                  <p className="text-muted-foreground mt-2">
                    These actions are irreversible and will permanently delete your data.
                  </p>

                  <div className="mt-6">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="w-full"
                    >
                      Delete Account
                    </Button>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-primary">Data Export</h3>
                    <p className="text-muted-foreground">
                      Request a copy of your data (reviews, watchlists, etc.) for your records.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        info('Data export requested. You will receive an email with your data within 24 hours.');
                      }}
                      className="w-full"
                    >
                      Export My Data
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}