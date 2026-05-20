import { PrismaClient } from "@prisma/client";
import { UserNavigation, NavigationItem } from "../types/navigation";

const prisma = new PrismaClient();

export async function buildUserNavigation({
  companyId,
  roleId,
}: {
  companyId: string;
  roleId: string;
}): Promise<UserNavigation> {
  // Get assigned navigation template for this role
  const roleNavigation = await prisma.roleNavigation.findFirst({
    where: {
      companyId,
      roleId,
      archivedAt: null,
    },
  });

  if (!roleNavigation) {
    return {
      version: 3,
      template: "default.sidebar",
      generatedAt: new Date().toISOString(),
      items: [],
    };
  }

  // Get navigation template
  const navigationTemplate =
    await prisma.featureNavigationTemplate.findUniqueOrThrow({
      where: { id: roleNavigation.navigationTemplateId },
    });

  // Get all navigation items for this template
  const allItems = await prisma.featureNavigationItem.findMany({
    where: {
      templateId: roleNavigation.navigationTemplateId,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  // Extract unique featureCodes from items
  const featureCodes = Array.from(
    new Set(
      allItems
        .filter((item) => item.featureCode != null)
        .map((item) => item.featureCode!),
    ),
  );

  // Fetch features to get the latest paths for these featureCodes
  let featurePathMap: Record<string, string> = {};
  if (featureCodes.length > 0) {
    const features = await prisma.feature.findMany({
      where: {
        code: { in: featureCodes },
      },
      select: {
        code: true,
        path: true,
      },
    });
    featurePathMap = Object.fromEntries(
      features.map((feature) => [feature.code, feature.path]),
    );
  }

  // Build hierarchical tree
  const buildTree = (parentId: string | null): NavigationItem[] => {
    return allItems
      .filter((item) => item.parentId === parentId)
      .map((item) => {
        // Use the feature path if available, otherwise fall back to item.url
        const url =
          item.featureCode && featurePathMap[item.featureCode]
            ? featurePathMap[item.featureCode]
            : item.url;

        return {
          name: item.name,
          type: item.type as "page" | "container",
          alias: item.alias ?? undefined,
          icon: item.icon ?? undefined,
          code: item.featureCode ?? undefined,
          url: url ?? undefined,
          id: item.id,
          children:
            buildTree(item.id).length > 0 ? buildTree(item.id) : undefined,
        };
      });
  };

  // console.log("Navigation structure built:",JSON.stringify(buildTree(null), null, 2),);

  return {
    version: 3,
    template: navigationTemplate.code,
    generatedAt: new Date().toISOString(),
    items: buildTree(null),
  };
}
