import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";
import { withValidation, CreateRoleNavigationSchema } from "@/lib/validations";

// GET /api/role-navigation - List all role-navigation mappings with pagination
export const GET = withAuth(
  async (request: NextRequest, _context: any, auth: any) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const search = searchParams.get("search") || "";
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = searchParams.get("sortOrder") || "desc";
      const companyId = auth.user.companyId;

      const skip = (page - 1) * limit;

      // Validate sortBy
      const validSortFields = ["createdAt", "role", "template"];
      const finalSortBy = validSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";

      // Build where clause - company scoped, not archived
      const where: any = {
        companyId,
        archivedAt: null,
      };

      // Search filter (by role name or template name)
      if (search) {
        where.OR = [
          {
            role: {
              name: { contains: search.toLowerCase() },
            },
          },
          {
            template: {
              name: { contains: search.toLowerCase() },
            },
          },
        ];
      }

      // Get total count
      const total = await prisma.roleNavigation.count({ where });

      // Build orderBy
      const orderBy: any =
        finalSortBy === "role"
          ? { role: { name: sortOrder as "asc" | "desc" } }
          : finalSortBy === "template"
            ? { template: { name: sortOrder as "asc" | "desc" } }
            : { [finalSortBy]: sortOrder };

      // Fetch records with relations
      const records = await prisma.roleNavigation.findMany({
        where,
        include: {
          role: {
            select: { id: true, name: true },
          },
          template: {
            select: { id: true, name: true, code: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      });

      return NextResponse.json({
        data: records,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching role-navigation mappings:", error);
      return NextResponse.json(
        { error: "Failed to fetch role-navigation mappings" },
        { status: 500 },
      );
    }
  },
);

// POST /api/role-navigation - Create a new role-navigation mapping
export const POST = withAuth(
  withValidation(
    CreateRoleNavigationSchema,
    async (data, request, _context, auth) => {
      try {
        const { roleId, navigationTemplateId } = data;
        const companyId = auth.user.companyId;

        // Verify role exists and belongs to company
        const role = await prisma.role.findUnique({
          where: { id: roleId },
        });

        if (!role || role.companyId !== companyId) {
          return NextResponse.json(
            { error: "Invalid role specified" },
            { status: 400 },
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

        // Check if mapping already exists for this role (unique constraint)
        const existing = await prisma.roleNavigation.findUnique({
          where: {
            companyId_roleId: {
              companyId,
              roleId,
            },
          },
        });

        if (existing) {
          if (existing.archivedAt) {
            // Re-activate archived mapping
            const updated = await prisma.roleNavigation.update({
              where: { id: existing.id },
              data: {
                navigationTemplateId,
                archivedAt: null,
                archivedBy: null,
              },
              include: {
                role: { select: { id: true, name: true } },
                template: { select: { id: true, name: true, code: true } },
              },
            });
            return NextResponse.json(updated, { status: 200 });
          }

          return NextResponse.json(
            { error: "A mapping already exists for this role" },
            { status: 409 },
          );
        }

        // Create new mapping
        const record = await prisma.roleNavigation.create({
          data: {
            companyId,
            roleId,
            navigationTemplateId,
          },
          include: {
            role: { select: { id: true, name: true } },
            template: { select: { id: true, name: true, code: true } },
          },
        });

        return NextResponse.json(record, { status: 201 });
      } catch (error) {
        console.error("Error creating role-navigation mapping:", error);
        return NextResponse.json(
          { error: "Failed to create role-navigation mapping" },
          { status: 500 },
        );
      }
    },
  ),
);
