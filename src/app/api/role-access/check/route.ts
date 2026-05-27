import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { checkPageAccess } from "@/lib/role-access-check";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Missing 'path' query parameter" },
        { status: 400 },
      );
    }

    const result = await checkPageAccess(authResult.user.roleId, path);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Role access check error:", error);
    return NextResponse.json(
      { authorized: false, error: "Failed to check access" },
      { status: 500 },
    );
  }
}
