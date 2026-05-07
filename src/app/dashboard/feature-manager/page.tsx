"use client";

import { useRouter } from "next/navigation";
import FeatureList from "@/components/tables/lists/FeatureList";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";

export default function FeatureManagerPage() {
  const router = useRouter();

  const handleAddFeature = () => {
    router.push("/dashboard/feature-manager/create");
  };

  return (
    <DashboardLayout
      title="Feature Manager"
      subtitle="Manage system features and permissions"
      icon={<Icons.Settings className="w-6 h-6 text-white" />}
    >
      <FeatureList onAddClick={handleAddFeature} />
    </DashboardLayout>
  );
}
