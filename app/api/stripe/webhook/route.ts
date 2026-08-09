import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  // Read environment variables at request time to avoid breaking build if they are missing
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey || !webhookSecret) {
    // If Stripe is not configured, we still return a 200 to prevent Stripe from retrying,
    // but we log the error. In a production environment, you might want to alert.
    console.error('Stripe environment variables are not set')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-07-29.dahlia',
  })

  const body = await request.text()
  const sig = request.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const subscription = session.subscription as string
  const customerId = session.customer as string

  if (!userId || !subscription || !customerId) {
    throw new Error('Missing required metadata in checkout session')
  }

  // Update user with Stripe subscription info
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription,
      stripePriceId: session.line_items?.data[0]?.price?.id || null,
      stripeCurrentPeriodEnd: null,
    }
  })

  console.log(`User ${userId} subscribed to premium`)
}

/**
 * Handle subscription deletion (cancellation)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  if (!customerId) {
    throw new Error('Missing customer ID in subscription deleted event')
  }

  // Find user by stripe customer ID and update
  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      stripeCancelAtPeriodEnd: false,
    }
  })

  console.log(`Subscription ${subscription.id} cancelled for customer ${customerId}`)
}

/**
 * Handle subscription updates (including renewals, plan changes, etc.)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  if (!customerId) {
    throw new Error('Missing customer ID in subscription updated event')
  }

  // Update user with latest subscription info
  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id || null,
      stripeCurrentPeriodEnd: subscription['current_period_end'] ? new Date(subscription['current_period_end'] * 1000) : null,
      stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
    }
  })

  console.log(`Subscription ${subscription.id} updated for customer ${customerId}`)
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  if (!customerId) {
    throw new Error('Missing customer ID in invoice payment failed event')
  }

  // You could send an email notification here or mark subscription as past due
  // For now, we'll just log it
  console.warn(`Invoice payment failed for customer ${customerId}`)

  // Optionally, you could update user status here if needed
  // await prisma.user.updateMany({
  //   where: { stripeCustomerId: customerId },
  //   data: {
  //     // Add a flag for past due if needed
  //   }
  // })
}