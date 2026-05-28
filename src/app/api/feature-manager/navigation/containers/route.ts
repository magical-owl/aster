import { NextResponse } from "next/server";
import { currentUser } from "@/lib/tenant-prisma";

export async function GET() {
  try {
    const { prisma } = await currentUser();
    const containers = await prisma.featureNavigationItem.findMany({
      where: {
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        icon: true,
        url: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json(containers);
  } catch (error) {
    console.error("Error fetching navigation containers:", error);
    return NextResponse.json(
      { error: "Failed to fetch containers" },
      { status: 500 },
    );
  }
}
