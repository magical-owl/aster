import { NextResponse } from "next/server";
import { currentUser } from "@/lib/tenant-prisma";

export async function GET(request: Request) {
  try {
    const { prisma } = await currentUser();
    const templates = await prisma.featureNavigationTemplate.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching navigation templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch navigation templates" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prisma } = await currentUser();
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const template = await prisma.featureNavigationTemplate.create({
      data: {
        name: body.name,
        code: body.code || body.name.toLowerCase().replace(/\s+/g, "-"),
        description: body.description || "",
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating navigation template:", error);
    return NextResponse.json(
      { error: "Failed to create navigation template" },
      { status: 500 },
    );
  }
}
