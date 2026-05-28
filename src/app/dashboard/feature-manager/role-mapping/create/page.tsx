"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";
import RoleNavigationForm from "@/components/forms/RoleNavigationForm";
import type { CreateRoleNavigationData } from "@/lib/validations";

export default function CreateRoleMappingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateRoleNavigationData) => {
    try {
      setError(null);
      const response = await fetch("/api/role-navigation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create mapping");
      }

      router.push("/dashboard/feature-manager/role-mapping");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <DashboardLayout
      title="New Role Mapping"
      subtitle="Assign a navigation template to a role"
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

      <RoleNavigationForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isEditMode={false}
      />
    </DashboardLayout>
  );
}
