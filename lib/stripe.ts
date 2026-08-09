import Stripe from 'stripe'
import { prisma } from './prisma'

/**
 * Create a Stripe instance with the secret key from environment variables.
 * This function is called at request time to avoid reading environment variables during build.
 */
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(secretKey, {
    apiVersion: '2026-07-29.dahlia',
  })
}

/**
 * Get the Stripe price IDs from environment variables.
 * This function is called at request time to avoid reading environment variables during build.
 */
function getPriceIds(): { monthly: string; yearly: string } {
  return {
    monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_1NLABCDEFGHIJKLMNOPQR', // $9.99/month
    yearly: process.env.STRIPE_PRICE_YEARLY || 'price_2NLABCDEFGHIJKLMNOPQR',  // $79.99/year
  }
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  priceId: 'monthly' | 'yearly' = 'monthly'
) {
  try {
    // Get user data to attach metadata
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Create checkout session
    const stripe = getStripe()
    const priceIds = getPriceIds()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceIds[priceId],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: userId,
      },
      // Optional: collect additional info
      billing_address_collection: 'required',
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

/**
 * Create a Stripe billing portal session
 */
export async function createPortalSession(userId: string) {
  try {
    // Get user's Stripe customer ID from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    })

    if (!user || !user.stripeCustomerId) {
      throw new Error('No active subscription found')
    }

    // Create billing portal session
    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription`,
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw new Error('Failed to create billing portal session')
  }
}

/**
 * Get user's subscription status
 */
export async function getSubscriptionStatus(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        stripeCancelAtPeriodEnd: true,
      }
    })

    if (!user || !user.stripeCustomerId) {
      return {
        isSubscribed: false,
        isPremium: false,
        status: 'none',
      }
    }

    // If no subscription ID, customer exists but no active subscription
    if (!user.stripeSubscriptionId) {
      return {
        isSubscribed: false,
        isPremium: false,
        status: 'incomplete',
      }
    }

    // Check if subscription is still active
    const isSubscribed = !!user.stripeSubscriptionId &&
                         (user.stripeCurrentPeriodEnd ?
                          Date.now() < user.stripeCurrentPeriodEnd.getTime() :
                          false)

    return {
      isSubscribed,
      isPremium: isSubscribed,
      status: user.stripeCancelAtPeriodEnd ? 'cancelling' : 'active',
      currentPeriodEnd: user.stripeCurrentPeriodEnd,
      priceId: user.stripePriceId,
      cancelAtPeriodEnd: user.stripeCancelAtPeriodEnd,
    }
  } catch (error) {
    console.error('Error getting subscription status:', error)
    return {
      isSubscribed: false,
      isPremium: false,
      status: 'error',
    }
  }
}

