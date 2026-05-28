import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withValidation } from "@/lib/validations";
import { withAuth } from "@/lib/api-auth";
import { CreateFeatureSchema, UpdateFeatureSchema } from "@/lib/validations";

// GET /api/features - List all features with pagination, search, and filtering
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const domain = searchParams.get("domain") || "";
    const kind = searchParams.get("kind") || "";
    let sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Validate sortBy to prevent invalid fields
    const validSortFields = [
      "name",
      "code",
      "domain",
      "kind",
      "createdAt",
      "updatedAt",
    ];
    if (!validSortFields.includes(sortBy)) {
      sortBy = "createdAt";
    }

    // Build filter conditions
    const where: any = {
      archivedAt: null,
    };

    const filterConditions: any[] = [];

    // Domain filter
    if (domain) {
      filterConditions.push({ domain });
    }

    // Kind filter
    if (kind) {
      filterConditions.push({ kind });
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filterConditions.push({
        OR: [
          { name: { contains: searchLower, mode: "insensitive" } },
          { code: { contains: searchLower, mode: "insensitive" } },
          { description: { contains: searchLower, mode: "insensitive" } },
        ],
      });
    }

    // Combine all filters with AND
    if (filterConditions.length > 0) {
      where.AND =
        filterConditions.length === 1
          ? filterConditions[0]
          : { AND: filterConditions };
    }

    // Get total count for pagination
    const total = await prisma.feature.count({ where });

    // Build orderBy
    const orderBy: any = { [sortBy]: sortOrder as "asc" | "desc" };

    // Get features with pagination
    const features = await prisma.feature.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    });

    return NextResponse.json({
      features,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 },
    );
  }
});

// POST /api/features - Create new feature
export const POST = withAuth(
  withValidation(CreateFeatureSchema, async (data) => {
    try {
      // Check if feature code already exists
      const existingFeature = await prisma.feature.findUnique({
        where: { code: data.code },
      });

      if (existingFeature) {
        return NextResponse.json(
          { error: "Feature code already exists" },
          { status: 400 },
        );
      }

      // Create feature
      const feature = await prisma.feature.create({
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

      return NextResponse.json(feature, { status: 201 });
    } catch (error) {
      console.error("Error creating feature:", error);
      return NextResponse.json(
        { error: "Failed to create feature" },
        { status: 500 },
      );
    }
  }),
);
