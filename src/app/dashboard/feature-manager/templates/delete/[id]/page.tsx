"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";

interface TemplateRecord {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
}

export default function DeleteTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState<TemplateRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch("/api/feature-manager/navigation/templates");
        if (!res.ok) throw new Error("Failed to load templates");

        const templates: TemplateRecord[] = await res.json();
        const found = templates.find((t) => t.id === resolvedParams.id);

        if (!found) {
          throw new Error("Template not found");
        }

        setTemplate(found);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load template details",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [resolvedParams.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/feature-manager/navigation/templates/${resolvedParams.id}`,
        { method: "DELETE" },
      );

      if (!res.ok) throw new Error("Failed to delete template");

      router.push("/dashboard/feature-manager/templates");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete template",
      );
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/feature-manager/templates");
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Delete Template"
        subtitle="Loading..."
        icon={<Icons.Layout className="w-6 h-6 text-white" />}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !template) {
    return (
      <DashboardLayout
        title="Delete Template"
        subtitle="Error"
        icon={<Icons.Layout className="w-6 h-6 text-white" />}
      >
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <Icons.XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-800 dark:text-zinc-200 font-medium rounded-lg transition-colors"
            >
              Back to Templates
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Delete Template"
      subtitle="Confirm navigation template deletion"
      icon={<Icons.Layout className="w-6 h-6 text-white" />}
    >
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <Icons.AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Are you sure?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              You are about to delete this navigation template. This action
              cannot be undone.
            </p>
          </div>

          {/* Template Details Card */}
          {template && (
            <div className="mb-6 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-900 px-5 py-3 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Template Details
                </h3>
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                <div className="px-5 py-3 flex items-start gap-3">
                  <Icons.Tag className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
                      Name
                    </p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {template.name}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3 flex items-start gap-3">
                  <Icons.Code className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
                      Code
                    </p>
                    <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
                      {template.code || "—"}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3 flex items-start gap-3">
                  <Icons.FileText className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
                      Description
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                      {template.description || "No description"}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3 flex items-start gap-3">
                  <Icons.Calendar className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
                      Created
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                      {new Date(template.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-800 dark:text-zinc-200 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Icons.Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Icons.Trash2 className="w-4 h-4" />
                  Delete Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
