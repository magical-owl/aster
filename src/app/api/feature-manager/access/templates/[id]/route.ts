import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;

    const items = await prisma.featureAccessItem.findMany({
      where: {
        templateId: params.id,
      },
      include: {
        feature: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Transform to a structure the UI can use
    const accessRules = items.map((item) => ({
      id: item.id,
      templateId: item.templateId,
      featureId: item.featureId,
      featureCode: item.feature.code,
      featureName: item.feature.name,
      action: item.action,
      effect: item.effect,
      scopeLevel: item.scopeLevel,
      scopeOverride: item.scopeOverride,
    }));

    return NextResponse.json(accessRules);
  } catch (error) {
    console.error("Error loading access template:", error);
    return NextResponse.json(
      { error: "Failed to load access template" },
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
    const body = await request.json();
    const accessRules = body.accessRules;

    if (!accessRules || !Array.isArray(accessRules)) {
      return NextResponse.json(
        { error: "Invalid access rules structure" },
        { status: 400 },
      );
    }

    // Build a lookup map: feature code → feature id
    const features = await prisma.feature.findMany({
      select: { id: true, code: true },
    });

    // Use transaction for atomic operation
    await prisma.$transaction(async (tx) => {
      // First delete all existing items for this template
      await tx.featureAccessItem.deleteMany({
        where: {
          templateId: params.id,
        },
      });

      // Create new items
      const processed = new Set<string>(); // To avoid duplicates within the same request
      for (const rule of accessRules) {
        // Resolve featureCode → featureId
        // The UI sends simplified codes like "users" (from item name),
        // but actual feature codes are like "users.view".
        // Try exact match first, then prefix match.
        const normalizedCode = rule.featureCode
          ?.toLowerCase()
          .replace(/\s+/g, "_");
        let featureId = rule.featureId;

        if (!featureId) {
          const exactMatch = features.find((f) => f.code === normalizedCode);
          if (exactMatch) {
            featureId = exactMatch.id;
          } else {
            // Try prefix match: e.g. "users" matches "users.view"
            const prefixMatch = features.find((f) =>
              f.code.startsWith(normalizedCode + "."),
            );
            if (prefixMatch) {
              featureId = prefixMatch.id;
            }
          }
        }

        if (!featureId) {
          console.warn(
            `Skipping rule for unknown feature code: ${rule.featureCode}`,
          );
          continue;
        }

        // Create a unique key to detect duplicates within this request
        const key = `${params.id}-${featureId}-${rule.action}`;
        if (processed.has(key)) {
          console.warn(`Skipping duplicate rule: ${key}`);
          continue;
        }
        processed.add(key);

        // After deleteMany, there are no existing items, so we always create
        await tx.featureAccessItem.create({
          data: {
            templateId: params.id,
            featureId,
            action: rule.action,
            effect: rule.effect ?? "allow",
            scopeLevel: rule.scopeLevel ?? null,
            scopeOverride: rule.scopeOverride ?? false,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving access template:", error);
    return NextResponse.json(
      { error: "Failed to save access template", details: String(error) },
      { status: 500 },
    );
  }
}
