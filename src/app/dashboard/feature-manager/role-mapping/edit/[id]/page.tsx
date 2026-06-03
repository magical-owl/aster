"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";
import RoleNavigationForm from "@/components/forms/RoleNavigationForm";
import type { CreateRoleNavigationData } from "@/lib/validations";

export default function EditRoleMappingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mappingData, setMappingData] = useState<{
    roleId: string;
    navigationTemplateId: string;
    roleName?: string;
    templateName?: string;
  } | null>(null);

  useEffect(() => {
    const fetchMapping = async () => {
      try {
        const response = await fetch(
          `/api/role-navigation/${resolvedParams.id}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch role-navigation mapping");
        }
        const data = await response.json();

        setMappingData({
          roleId: data.role?.id || "",
          navigationTemplateId: data.template?.id || "",
          roleName: data.role?.name,
          templateName: data.template?.name,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapping();
  }, [resolvedParams.id]);

  const handleSubmit = async (data: CreateRoleNavigationData) => {
    try {
      setError(null);
      const response = await fetch(
        `/api/role-navigation/${resolvedParams.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            navigationTemplateId: data.navigationTemplateId,
          }),
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update mapping");
      }

      router.push("/dashboard/feature-manager/role-mapping");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this mapping?")) return;

    try {
      setIsDeleting(true);
      const response = await fetch(
        `/api/role-navigation/${resolvedParams.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to remove mapping");
      }

      router.push("/dashboard/feature-manager/role-mapping");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Edit Role Mapping"
        subtitle="Loading..."
        icon={<Icons.Shield className="w-6 h-6 text-white" />}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Role Mapping"
      subtitle={
        mappingData
          ? `${mappingData.roleName || ""} → ${mappingData.templateName || ""}`
          : "Update navigation template assignment"
      }
      icon={<Icons.Shield className="w-6 h-6 text-white" />}
    >
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {mappingData && (
        <RoleNavigationForm
          initialData={mappingData}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isEditMode={true}
        />
      )}

      {/* Delete Section */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
              Remove Mapping
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              This will unassign the navigation template from this role.
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
