import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: List Requests
// POST: Create Request
export async function GET() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { kindeId: user.id },
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const requests = await prisma.videoRequest.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ requests });
}

export async function POST(req: Request) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, notes, style, duration, tone } = body;

    const dbUser = await prisma.user.findUnique({
        where: { kindeId: user.id },
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check credits (Cost: 10)
    if (dbUser.credits < 10) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // Deduct credits and create request
    const [updatedUser, newRequest] = await prisma.$transaction([
        prisma.user.update({
            where: { id: dbUser.id },
            data: { credits: dbUser.credits - 10 },
        }),
        prisma.videoRequest.create({
            data: {
                userId: dbUser.id,
                ideaTitle: title,
                notes,
                preferences: JSON.stringify({ style, duration, tone }),
                status: 'PENDING',
            }
        }),
        prisma.creditTransaction.create({
            data: {
                userId: dbUser.id,
                amount: -10,
                creditType: 'VIDEO',
                type: 'USAGE',
                description: `Video Request: ${title}`
            }
        })
    ]);

    return NextResponse.json({ success: true, request: newRequest, remainingCredits: updatedUser.credits });
}
