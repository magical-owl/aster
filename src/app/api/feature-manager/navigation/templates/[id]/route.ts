import { NextResponse } from "next/server";
import { currentUser } from "@/lib/tenant-prisma";

// Convert flat database items to nested structure
function buildNestedTree(items: any[], parentId: string | null = null): any[] {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      id: item.id,
      name: item.name,
      icon: item.icon || "Circle",
      type: item.type === "container" ? "container" : "page",
      url: item.url,
      featureCode: item.featureCode,
      children: buildNestedTree(items, item.id),
      expanded: true,
    }));
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { prisma } = await currentUser();

    const items = await prisma.featureNavigationItem.findMany({
      where: {
        templateId: params.id,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    const navigation = buildNestedTree(items);

    return NextResponse.json(navigation);
  } catch (error) {
    console.error("Error loading navigation template:", error);
    return NextResponse.json(
      { error: "Failed to load template" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { prisma } = await currentUser();

    // Properly parse request body for Next.js
    const body = await request.json();
    const navigation = body.navigation;

    if (!navigation || !Array.isArray(navigation)) {
      return NextResponse.json(
        { error: "Invalid navigation structure" },
        { status: 400 },
      );
    }

    // Use transaction for atomic operation
    await prisma.$transaction(async (tx) => {
      // First delete all existing items for this template
      await tx.featureNavigationItem.deleteMany({
        where: {
          templateId: params.id,
        },
      });

      // Iterative save function (avoid recursion stack issues)
      const queue: { items: any[]; parentId: string | null }[] = [
        { items: navigation, parentId: null },
      ];
      let sortOrder = 0;

      while (queue.length > 0) {
        const current = queue.shift()!;

        for (const item of current.items) {
          const createdItem = await tx.featureNavigationItem.create({
            data: {
              templateId: params.id,
              parentId: current.parentId,
              name: item.name,
              icon: item.icon || "Circle",
              type: item.type,
              url: item.url || null,
              sortOrder,
              code: item.id || String(Date.now() + sortOrder),
              featureCode: item.featureCode || null,
            },
          });

          sortOrder++;

          if (item.children && item.children.length > 0) {
            queue.push({ items: item.children, parentId: createdItem.id });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving navigation template:", error);
    return NextResponse.json(
      { error: "Failed to save template", details: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { prisma } = await currentUser();

    await prisma.featureNavigationTemplate.update({
      where: { id: params.id },
      data: { archivedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting navigation template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 },
    );
  }
}
