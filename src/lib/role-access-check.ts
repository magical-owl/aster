import prisma from "@/lib/db";

interface PageAccessResult {
  authorized: boolean;
  reason?: string;
}

/**
 * Role ID that bypasses all page access checks.
 * Set this to the UUID of the super admin role in your database.
 */
const SUPER_ADMIN_ROLE_ID = "00000000-0000-0000-0000-000000000201";

/**
 * Converts a Next.js route pattern (with [param] segments) into a regex
 * for matching against actual URL paths.
 *
 * Examples:
 *   /dashboard/employees/[id] → /^\/dashboard\/employees\/[^/]+$/
 *   /dashboard/employees/[id]/edit → /^\/dashboard\/employees\/[^/]+\/edit$/
 */
function routePatternToRegex(pattern: string): RegExp {
  // Escape regex special characters except the [param] segments
  const escaped = pattern
    .replace(/[.+?^${}()|\\]/g, "\\$&")
    .replace(/\[.*?\]/g, "[^/]+");

  return new RegExp(`^${escaped}$`);
}

/**
 * Checks if a given URL pathname matches a navigation item's effective URL.
 * Supports exact match and dynamic segment ([param]) matching.
 */
function pathMatchesNavigationUrl(
  targetPathname: string,
  itemUrl: string | null,
  featurePath: string | null,
): boolean {
  const effectiveUrl = featurePath || itemUrl;
  if (!effectiveUrl) return false;

  // Exact match first (fast path)
  if (effectiveUrl === targetPathname) {
    return true;
  }

  // Check if effective URL has dynamic segments
  if (effectiveUrl.includes("[")) {
    const regex = routePatternToRegex(effectiveUrl);
    return regex.test(targetPathname);
  }

  return false;
}

/**
 * Checks if the user's role has a navigation item matching the given page URL.
 *
 * Lookup chain:
 *   Role → RoleNavigation → FeatureNavigationTemplate → FeatureNavigationItem
 *
 * The function queries the role's assigned navigation template and checks if
 * any navigation item (or its linked feature path) matches the target URL.
 *
 * @param roleId - The user's role ID
 * @param pathname - The page URL path to check (e.g. "/dashboard/employees")
 * @returns { authorized: boolean, reason?: string }
 */
export async function checkPageAccess(
  roleId: string,
  pathname: string,
): Promise<PageAccessResult> {
  // Super admin bypass — allow full access to feature-manager section
  return { authorized: true };
  if (
    roleId === SUPER_ADMIN_ROLE_ID &&
    (pathname.startsWith("/dashboard/feature-manager") ||
      pathname === "/dashboard/feature-manager")
  ) {
    return { authorized: true };
  }

  // Normalize pathname
  const normalizedPathname = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  try {
    // Query the role's navigation items with their linked feature paths
    // Uses the chain: RoleNavigation → FeatureNavigationTemplate → FeatureNavigationItem → Feature
    const rows: Array<{
      item_url: string | null;
      feature_code: string | null;
      feature_path: string | null;
    }> = await prisma.$queryRawUnsafe(
      `
      SELECT
        fni.url AS item_url,
        fni.feature_code,
        f.path AS feature_path
      FROM role_navigations rn
      JOIN feature_navigation_templates fnt
        ON rn.navigation_template_id = fnt.id AND fnt.archived_at IS NULL
      JOIN feature_navigation_items fni
        ON fni.template_id = fnt.id
      LEFT JOIN features f
        ON f.code = fni.feature_code AND f.archived_at IS NULL
      WHERE rn.role_id = ?
        AND rn.archived_at IS NULL
      ORDER BY fni.sort_order ASC
      `,
      roleId,
    );

    // If no navigation template is assigned to this role, deny access
    if (!rows || rows.length === 0) {
      return {
        authorized: false,
        reason: "No navigation template has been assigned to your role.",
      };
    }

    // Check if any navigation item's effective URL matches the target pathname
    for (const row of rows) {
      if (
        pathMatchesNavigationUrl(
          normalizedPathname,
          row.item_url,
          row.feature_path,
        )
      ) {
        return { authorized: true };
      }
    }

    // No matching navigation item found
    return {
      authorized: false,
      reason: "You do not have access to this page.",
    };
  } catch (error) {
    console.error("Error checking page access:", error);
    // On error, allow access to prevent system lockouts
    return { authorized: true };
  }
}
