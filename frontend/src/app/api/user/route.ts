import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Handle both Credits and Transactions
export async function GET(req: Request) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'credits' or 'transactions'

    // Get or create user in DB
    let dbUser: any = await prisma.user.findUnique({
        where: { kindeId: user.id },
        include: {
            transactions: type === 'transactions' ? { orderBy: { createdAt: 'desc' } } : false
        }
    });

    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                kindeId: user.id,
                email: user.email || "",
            }
        });
        // New user has no transactions
        dbUser.transactions = [];
    }

    if (type === 'transactions') {
        return NextResponse.json({ transactions: dbUser.transactions || [] });
    }

    if (type === 'history') {
        let takeLimit = 1; // Default Free
        if (dbUser.tier === 'Diamond') takeLimit = 10;
        if (dbUser.tier === 'Solitaire') takeLimit = 10000; // Effectively unlimited

        const history = await prisma.analysis.findMany({
            where: { userId: dbUser.id },
            orderBy: { createdAt: 'desc' },
            take: takeLimit,
        });
        return NextResponse.json({ history });
    }

    // Default: Return credits
    return NextResponse.json({
        credits: dbUser.credits,
        tier: dbUser.tier,
        videoGenerations: dbUser.videoGenerations,
        videoCredits: dbUser.videoCredits
    });
}

// POST: Handle Deductions
export async function POST(req: Request) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body = {};
    try {
        body = await req.json();
    } catch (e) {
        // Body might be empty
    }

    const { action } = body as any;

    if (action === 'deduct') {
        const { amount = 1, description = "Analyzed video content" } = body as any;
        const deductAmount = Math.abs(amount);

        const dbUser = await prisma.user.findUnique({
            where: { kindeId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (dbUser.credits < deductAmount) {
            return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: dbUser.id },
                data: { credits: dbUser.credits - deductAmount },
            }),
            prisma.creditTransaction.create({
                data: {
                    userId: dbUser.id,
                    amount: -deductAmount,
                    creditType: "IDEA",
                    type: "USAGE",
                    description: description
                }
            })
        ]);

        return NextResponse.json({ success: true, remaining: dbUser.credits - deductAmount });
    }

    if (action === 'save_history') {
        const { videoUrl, result } = body as any;

        const dbUser = await prisma.user.findUnique({
            where: { kindeId: user.id },
        });

        if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        await prisma.analysis.create({
            data: {
                userId: dbUser.id,
                videoUrl,
                result: JSON.stringify(result),
            },
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
