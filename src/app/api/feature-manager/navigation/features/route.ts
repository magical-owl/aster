import { NextResponse } from "next/server";
import { currentUser } from "@/lib/tenant-prisma";

export async function GET() {
  try {
    const { prisma } = await currentUser();
    const features = await prisma.feature.findMany({
      where: {
        kind: "page",
        archivedAt: null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        path: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(features);
  } catch (error) {
    console.error("Error fetching page features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 },
    );
  }
}
