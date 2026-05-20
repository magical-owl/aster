"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";
import { useToast } from "@/lib/toast";

export default function CreateNavigationTemplatePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      addToast("Name is required", "error");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/feature-manager/navigation/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code: code || undefined,
          description,
        }),
      });

      if (!res.ok) throw new Error("Failed to create template");

      addToast("Template created successfully", "success");
      router.push("/dashboard/feature-manager/templates");
    } catch (error) {
      addToast("Failed to create template", "error");
      console.error("Create error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Create Navigation Template"
      subtitle="Create a new navigation structure template"
      icon={<Icons.Layout className="w-6 h-6 text-white" />}
    >
      <div className="max-w-2xl">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-none text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800"
                placeholder="e.g. Default Navigation"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-none text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800"
                placeholder="e.g. default-navigation"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Leave blank to auto-generate from the name.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-none text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800"
                placeholder="Optional description for this template"
                rows={4}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/feature-manager/templates")
              }
              className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icons.Plus className="w-4 h-4" />
                  <span>Create Template</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
