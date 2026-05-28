import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";
import { withValidation, UpdateRoleNavigationSchema } from "@/lib/validations";

// GET /api/role-navigation/[id] - Get single role-navigation mapping
export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
    auth: any,
  ) => {
    try {
      const { id } = await params;
      const companyId = auth.user.companyId;

      const record = await prisma.roleNavigation.findUnique({
        where: { id },
        include: {
          role: {
            select: { id: true, name: true },
          },
          template: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      if (!record || record.companyId !== companyId) {
        return NextResponse.json(
          { error: "Role-navigation mapping not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(record);
    } catch (error) {
      console.error("Error fetching role-navigation mapping:", error);
      return NextResponse.json(
        { error: "Failed to fetch role-navigation mapping" },
        { status: 500 },
      );
    }
  },
);

// PUT /api/role-navigation/[id] - Update a role-navigation mapping
export const PUT = withAuth(
  withValidation(
    UpdateRoleNavigationSchema,
    async (data, request, { params }, auth) => {
      try {
        const { id } = await params;
        const { navigationTemplateId } = data;
        const companyId = auth.user.companyId;

        // Check if mapping exists
        const existing = await prisma.roleNavigation.findUnique({
          where: { id },
        });

        if (!existing || existing.companyId !== companyId) {
          return NextResponse.json(
            { error: "Role-navigation mapping not found" },
            { status: 404 },
          );
        }

        // Verify template exists
        const template = await prisma.featureNavigationTemplate.findUnique({
          where: { id: navigationTemplateId },
        });

        if (!template) {
          return NextResponse.json(
            { error: "Invalid navigation template specified" },
            { status: 400 },
          );
        }

        // Update mapping
        const updated = await prisma.roleNavigation.update({
          where: { id },
          data: {
            navigationTemplateId,
          },
          include: {
            role: { select: { id: true, name: true } },
            template: { select: { id: true, name: true, code: true } },
          },
        });

        return NextResponse.json(updated);
      } catch (error) {
        console.error("Error updating role-navigation mapping:", error);
        return NextResponse.json(
          { error: "Failed to update role-navigation mapping" },
          { status: 500 },
        );
      }
    },
  ),
);

// DELETE /api/role-navigation/[id] - Soft delete (archive) a mapping
export const DELETE = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
    auth: any,
  ) => {
    try {
      const { id } = await params;
      const companyId = auth.user.companyId;

      // Check if mapping exists
      const existing = await prisma.roleNavigation.findUnique({
        where: { id },
      });

      if (!existing || existing.companyId !== companyId) {
        return NextResponse.json(
          { error: "Role-navigation mapping not found" },
          { status: 404 },
        );
      }

      // Soft delete - set archivedAt
      await prisma.roleNavigation.update({
        where: { id },
        data: {
          archivedAt: new Date(),
          archivedBy: auth.user.id,
        },
      });

      return NextResponse.json({
        message: "Role-navigation mapping removed successfully",
        mappingId: id,
      });
    } catch (error) {
      console.error("Error removing role-navigation mapping:", error);
      return NextResponse.json(
        { error: "Failed to remove role-navigation mapping" },
        { status: 500 },
      );
    }
  },
);
