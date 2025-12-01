import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
        return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId; // This is the DB ID if we passed it, or kindeId

        if (userId) {
            // Find user by ID (preferred) or Kinde ID
            let dbUser = await prisma.user.findUnique({ where: { id: userId } });
            if (!dbUser) {
                dbUser = await prisma.user.findUnique({ where: { kindeId: userId } });
            }

            if (dbUser) {
                const amount = session.amount_total || 0;
                let creditsToAdd = 0;
                let videoCreditsToAdd = 0;
                let newTier = dbUser.tier;

                if (amount === 2000) { // Diamond ($20)
                    creditsToAdd = 100;
                    videoCreditsToAdd = 3; // 3 Free Video Generations
                    newTier = "Diamond";
                } else if (amount === 3000) { // Solitaire ($30)
                    creditsToAdd = 200;
                    videoCreditsToAdd = 5; // 5 Free Video Generations
                    newTier = "Solitaire";
                }

                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: dbUser.id },
                        data: {
                            credits: dbUser.credits + creditsToAdd,
                            videoCredits: dbUser.videoCredits + videoCreditsToAdd,
                            tier: newTier,
                        },
                    }),
                    prisma.creditTransaction.create({
                        data: {
                            userId: dbUser.id,
                            amount: creditsToAdd,
                            creditType: "IDEA",
                            type: "PURCHASE",
                            description: `Webhook: Purchased ${newTier} Plan`
                        }
                    }),
                    prisma.creditTransaction.create({
                        data: {
                            userId: dbUser.id,
                            amount: videoCreditsToAdd,
                            creditType: "VIDEO",
                            type: "PURCHASE",
                            description: `Webhook: Purchased ${newTier} Plan (Video Credits)`
                        }
                    })
                ]);
                console.log(`Webhook: Updated user ${dbUser.email} - Tier: ${newTier}, Credits: +${creditsToAdd}, Video: +${videoCreditsToAdd}`);
            } else {
                console.error(`Webhook: User not found for ID ${userId}`);
            }
        }
    }

    return NextResponse.json({ received: true });
}
