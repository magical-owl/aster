"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";
import { useToast } from "@/lib/toast";

// Types
interface Role {
  id: string;
  name: string;
  userCount: number;
  assignedTemplate: string | null;
  templateId: string | null;
  lastModified: string;
}

interface Template {
  id: string;
  name: string;
}

// Mock data
const mockRoles: Role[] = [
  {
    id: "1",
    name: "Super Admin",
    userCount: 3,
    assignedTemplate: "Full Access Navigation",
    templateId: "1",
    lastModified: "2026-05-01",
  },
  {
    id: "2",
    name: "Administrator",
    userCount: 12,
    assignedTemplate: "Admin Navigation",
    templateId: "2",
    lastModified: "2026-05-02",
  },
  {
    id: "3",
    name: "Manager",
    userCount: 27,
    assignedTemplate: "Manager Navigation",
    templateId: "3",
    lastModified: "2026-04-28",
  },
  {
    id: "4",
    name: "Team Lead",
    userCount: 45,
    assignedTemplate: null,
    templateId: null,
    lastModified: "2026-04-15",
  },
  {
    id: "5",
    name: "Employee",
    userCount: 186,
    assignedTemplate: "Standard Employee Navigation",
    templateId: "4",
    lastModified: "2026-04-20",
  },
  {
    id: "6",
    name: "HR Manager",
    userCount: 8,
    assignedTemplate: null,
    templateId: null,
    lastModified: "2026-04-10",
  },
  {
    id: "7",
    name: "Finance User",
    userCount: 11,
    assignedTemplate: "Finance Navigation",
    templateId: "5",
    lastModified: "2026-05-03",
  },
  {
    id: "8",
    name: "Guest User",
    userCount: 34,
    assignedTemplate: null,
    templateId: null,
    lastModified: "2026-03-30",
  },
];

const mockTemplates: Template[] = [
  { id: "1", name: "Full Access Navigation" },
  { id: "2", name: "Admin Navigation" },
  { id: "3", name: "Manager Navigation" },
  { id: "4", name: "Standard Employee Navigation" },
  { id: "5", name: "Finance Navigation" },
];

// Design 1: Split View
interface SplitViewProps {
  filteredRoles: Role[];
  selectedRole: string | null;
  setSelectedRole: (id: string | null) => void;
  selectedRoleData: Role | undefined;
  removeAssignment: (roleId: string) => void;
  assignTemplate: (roleId: string, templateId: string) => void;
}

const SplitView = ({
  filteredRoles,
  selectedRole,
  setSelectedRole,
  selectedRoleData,
  removeAssignment,
  assignTemplate,
}: SplitViewProps) => (
  <div className="grid grid-cols-5 gap-6">
    <div className="col-span-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Roles
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`px-4 py-3 border-b border-zinc-100 dark:border-zinc-700/50 cursor-pointer transition-colors ${
              selectedRole === role.id
                ? "bg-blue-50 dark:bg-blue-900/20"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-700/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {role.name}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {role.userCount} users
                </div>
              </div>
              {role.assignedTemplate ? (
                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                  Assigned
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded">
                  Unassigned
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="col-span-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {selectedRoleData ? selectedRoleData.name : "Select a role"}
        </h3>
      </div>
      <div className="p-6 flex-1">
        {selectedRoleData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg">
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                  User Count
                </div>
                <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedRoleData.userCount}
                </div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg">
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                  Last Modified
                </div>
                <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedRoleData.lastModified}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                Assigned Navigation Template
              </label>
              {selectedRoleData.assignedTemplate ? (
                <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {selectedRoleData.assignedTemplate}
                    </div>
                  </div>
                  <button
                    onClick={() => removeAssignment(selectedRoleData.id)}
                    className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="p-4 border border-zinc-200 dark:border-zinc-700 border-dashed rounded-lg text-center">
                  <div className="text-zinc-500 dark:text-zinc-400 mb-3">
                    No template assigned
                  </div>
                  <select
                    onChange={(e) =>
                      e.target.value &&
                      assignTemplate(selectedRoleData.id, e.target.value)
                    }
                    className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm"
                    defaultValue=""
                  >
                    <option value="">Assign template...</option>
                    {mockTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
            Select a role from the list to view details
          </div>
        )}
      </div>
    </div>
  </div>
);

// Design 2: Card Grid View
interface CardGridViewProps {
  filteredRoles: Role[];
  removeAssignment: (roleId: string) => void;
  assignTemplate: (roleId: string, templateId: string) => void;
}

const CardGridView = ({
  filteredRoles,
  removeAssignment,
  assignTemplate,
}: CardGridViewProps) => (
  <div className="grid grid-cols-3 gap-6">
    {filteredRoles.map((role) => (
      <div
        key={role.id}
        className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {role.name}
              </h4>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {role.userCount} users
              </div>
            </div>
            {role.assignedTemplate ? (
              <Icons.CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <Icons.Circle className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
            )}
          </div>

          {role.assignedTemplate ? (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">
                Assigned Template
              </div>
              <div className="font-medium text-green-800 dark:text-green-200">
                {role.assignedTemplate}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg mb-4">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                No Template Assigned
              </div>
              <select
                onChange={(e) =>
                  e.target.value && assignTemplate(role.id, e.target.value)
                }
                className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded text-sm"
                defaultValue=""
              >
                <option value="">Select template...</option>
                {mockTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {role.assignedTemplate && (
              <button
                onClick={() => removeAssignment(role.id)}
                className="px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Unassign
              </button>
            )}
            <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Preview
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Design 3: Table View
interface TableViewProps {
  filteredRoles: Role[];
  removeAssignment: (roleId: string) => void;
  assignTemplate: (roleId: string, templateId: string) => void;
}

const TableView = ({
  filteredRoles,
  removeAssignment,
  assignTemplate,
}: TableViewProps) => (
  <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="bg-zinc-50 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700">
          <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Role Name
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
            User Count
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Navigation Template
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Last Modified
          </th>
          <th className="px-4 py-3 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredRoles.map((role) => (
          <tr
            key={role.id}
            className="border-b border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
          >
            <td className="px-4 py-3">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {role.name}
              </div>
            </td>
            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
              {role.userCount}
            </td>
            <td className="px-4 py-3">
              {role.assignedTemplate ? (
                <span className="text-zinc-900 dark:text-zinc-100">
                  {role.assignedTemplate}
                </span>
              ) : (
                <select
                  onChange={(e) =>
                    e.target.value && assignTemplate(role.id, e.target.value)
                  }
                  className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded text-sm"
                  defaultValue=""
                >
                  <option value="">Assign...</option>
                  {mockTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </td>
            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
              {role.lastModified}
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex justify-end gap-2">
                {role.assignedTemplate && (
                  <button
                    onClick={() => removeAssignment(role.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                    title="Remove assignment"
                  >
                    <Icons.X className="w-4 h-4" />
                  </button>
                )}
                <button className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded transition-colors">
                  <Icons.Eye className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function RoleMappingPage() {
  const { addToast } = useToast();
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "assigned" | "unassigned"
  >("all");

  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "assigned"
          ? role.assignedTemplate !== null
          : role.assignedTemplate === null;
    return matchesSearch && matchesFilter;
  });

  const assignTemplate = (roleId: string, templateId: string) => {
    const template = mockTemplates.find((t) => t.id === templateId);
    setRoles(
      roles.map((r) =>
        r.id === roleId
          ? {
              ...r,
              assignedTemplate: template?.name || null,
              templateId,
              lastModified: new Date().toISOString().split("T")[0],
            }
          : r,
      ),
    );
    addToast(`Template assigned successfully`, "success");
  };

  const removeAssignment = (roleId: string) => {
    setRoles(
      roles.map((r) =>
        r.id === roleId
          ? {
              ...r,
              assignedTemplate: null,
              templateId: null,
              lastModified: new Date().toISOString().split("T")[0],
            }
          : r,
      ),
    );
    addToast(`Template assignment removed`, "success");
  };

  return (
    <DashboardLayout
      title="Role Mapping"
      subtitle="Assign navigation templates to system roles"
      icon={<Icons.Shield className="w-6 h-6 text-white" />}
    >
      <div className="mb-6 flex items-center justify-end">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as "all" | "assigned" | "unassigned",
              )
            }
            className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm"
          >
            <option value="all">All Roles</option>
            <option value="assigned">Assigned Only</option>
            <option value="unassigned">Unassigned Only</option>
          </select>
        </div>
      </div>

      <TableView
        filteredRoles={filteredRoles}
        removeAssignment={removeAssignment}
        assignTemplate={assignTemplate}
      />
    </DashboardLayout>
  );
}
