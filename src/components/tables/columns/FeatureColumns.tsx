import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface Feature {
  id: string;
  code: string;
  name: string;
  description: string | null;
  domain: string;
  kind: "page" | "action" | "api";
  httpMethod: string | null;
  path: string;
  createdAt: string;
  updatedAt: string;
}

function getKindColor(kind: string) {
  switch (kind) {
    case "page":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "action":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "api":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

export const columns: ColumnDef<Feature>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Feature
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.description || "-"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
          {row.original.code}
        </span>
      );
    },
  },
  {
    accessorKey: "domain",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Domain
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {row.original.domain}
        </span>
      );
    },
  },
  {
    accessorKey: "kind",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Kind
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getKindColor(row.original.kind)}`}
        >
          {row.original.kind}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const featureId = row.original.id;
      return (
        <div className="text-right">
          <Link
            href={`/dashboard/feature-manager/edit/${featureId}`}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            Edit
          </Link>
        </div>
      );
    },
  },
];
