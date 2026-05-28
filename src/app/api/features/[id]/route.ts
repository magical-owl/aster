import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";
import { withValidation } from "@/lib/validations";
import { UpdateFeatureSchema } from "@/lib/validations";

// GET /api/features/[id] - Get single feature
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const feature = await prisma.feature.findUnique({
      where: { id },
    });

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error("Error fetching feature:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature" },
      { status: 500 },
    );
  }
}

// PUT /api/features/[id] - Update feature
export const PUT = withAuth(
  withValidation(UpdateFeatureSchema, async (data, request, { params }) => {
    try {
      const { id } = await params;

      // Check if feature exists
      const existingFeature = await prisma.feature.findUnique({
        where: { id },
      });

      if (!existingFeature) {
        return NextResponse.json(
          { error: "Feature not found" },
          { status: 404 },
        );
      }

      // Check if code is being changed and already exists
      if (data.code && data.code !== existingFeature.code) {
        const codeExists = await prisma.feature.findUnique({
          where: { code: data.code },
        });

        if (codeExists) {
          return NextResponse.json(
            { error: "Feature code already exists" },
            { status: 400 },
          );
        }
      }

      // Update feature
      const updatedFeature = await prisma.feature.update({
        where: { id },
        data: {
          code: data.code,
          name: data.name,
          description: data.description || null,
          domain: data.domain,
          kind: data.kind,
          httpMethod: data.httpMethod || null,
          path: data.path,
        },
      });

      return NextResponse.json(updatedFeature);
    } catch (error) {
      console.error("Error updating feature:", error);
      return NextResponse.json(
        { error: "Failed to update feature" },
        { status: 500 },
      );
    }
  }),
);

// DELETE /api/features/[id] - Soft delete feature
export const DELETE = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
    auth: any,
  ) => {
    try {
      const { id } = await params;

      // Check if feature exists
      const existingFeature = await prisma.feature.findUnique({
        where: { id },
      });

      if (!existingFeature) {
        return NextResponse.json(
          { error: "Feature not found" },
          { status: 404 },
        );
      }

      // Soft delete - set archivedAt
      await prisma.feature.update({
        where: { id },
        data: {
          archivedAt: new Date(),
          archivedBy: auth.user.id,
        },
      });

      return NextResponse.json({
        message: "Feature archived successfully",
        featureId: id,
      });
    } catch (error) {
      console.error("Error archiving feature:", error);
      return NextResponse.json(
        { error: "Failed to archive feature" },
        { status: 500 },
      );
    }
  },
);
