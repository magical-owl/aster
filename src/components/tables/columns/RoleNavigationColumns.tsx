import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface RoleNavigationRecord {
  id: string;
  roleId: string;
  navigationTemplateId: string;
  createdAt: string;
  role: {
    id: string;
    name: string;
  } | null;
  template: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export const columns: ColumnDef<RoleNavigationRecord>[] = [
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const roleName = row.original.role?.name || "-";
      return (
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {roleName}
        </div>
      );
    },
  },
  {
    accessorKey: "template",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Navigation Template
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const template = row.original.template;
      if (!template) {
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      }
      return (
        <div>
          <div className="text-gray-900 dark:text-gray-100">
            {template.name}
          </div>
          <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
            {template.code}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return <span className="text-gray-400">-</span>;
      return (
        <span className="text-gray-600 dark:text-gray-400">
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const mappingId = row.original.id;
      return (
        <div className="text-right">
          <Link
            href={`/dashboard/feature-manager/role-mapping/edit/${mappingId}`}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            Edit
          </Link>
        </div>
      );
    },
  },
];
