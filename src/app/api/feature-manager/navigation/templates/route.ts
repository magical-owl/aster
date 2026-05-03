import { NextResponse } from "next/server";
import { currentUser } from "@/lib/tenant-prisma";

export async function GET() {
  try {
    const { prisma } = await currentUser();
    const templates = await prisma.featureNavigationTemplate.findMany({
      where: {
        archivedAt: null,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching navigation templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}
