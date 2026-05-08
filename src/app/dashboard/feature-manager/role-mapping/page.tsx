"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";
import RoleNavigationList from "@/components/tables/lists/RoleNavigationList";

export default function RoleMappingPage() {
  const router = useRouter();

  const handleAddMapping = () => {
    router.push("/dashboard/feature-manager/role-mapping/create");
  };

  return (
    <DashboardLayout
      title="Role Mapping"
      subtitle="Assign navigation templates to system roles"
      icon={<Icons.Shield className="w-6 h-6 text-white" />}
    >
      <RoleNavigationList onAddClick={handleAddMapping} />
    </DashboardLayout>
  );
}
