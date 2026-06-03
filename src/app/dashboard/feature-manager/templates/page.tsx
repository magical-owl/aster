"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import type { ColumnDef } from "@tanstack/react-table";
import { ThemedDataTable } from "@/components/DataTable";
import * as Icons from "lucide-react";
import { useToast } from "@/lib/toast";

interface Template {
  id: string;
  name: string;
  code?: string;
  description?: string;
  createdAt: string;
}

export default function NavigationTemplatesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/feature-manager/navigation/templates");
        const data = await res.json();
        setTemplates(data);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        addToast("Failed to load templates", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [addToast]);

  const handleDelete = (id: string) => {
    router.push(`/dashboard/feature-manager/templates/delete/${id}`);
  };

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
              title="Delete"
            >
              <Icons.Trash2 className="w-4 h-4 text-red-600 dark:text-red-600" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout
      title="Navigation Templates"
      subtitle="Manage navigation structure templates"
      icon={<Icons.Layout className="w-6 h-6 text-white" />}
    >
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Navigation Templates
        </h3>
        <button
          onClick={() =>
            router.push("/dashboard/feature-manager/templates/create")
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Icons.Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <ThemedDataTable
          columns={columns}
          data={templates}
          searchKey="name"
          searchPlaceholder="Search templates..."
        />
      )}
    </DashboardLayout>
  );
}
