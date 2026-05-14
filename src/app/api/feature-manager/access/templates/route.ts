import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const templates = await prisma.featureAccessTemplate.findMany({
      where: {
        archivedAt: null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        domain: true,
        scopeLevel: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching access templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 },
      );
    }

    const template = await prisma.featureAccessTemplate.create({
      data: {
        name,
        code,
        scopeLevel: "self",
        isSystem: false,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating access template:", error);
    return NextResponse.json(
      { error: "Failed to create access template" },
      { status: 500 },
    );
  }
}
