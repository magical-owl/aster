"use client";

import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/tables/ServerSideDataTable";
import { columns, Feature } from "@/components/tables/columns/FeatureColumns";
import { useServerSideDataTable } from "@/hooks/useServerSideDataTable";

interface FeatureListProps {
  /** Optional callback when Add Feature button is clicked */
  onAddClick?: () => void;
}

export default function FeatureList({ onAddClick }: FeatureListProps) {
  const {
    data: features,
    loading,
    error,
    pagination,
    tablePagination,
    setTablePagination,
    sorting,
    setSorting,
    search,
    setSearch,
    extraParams,
    setExtraParams,
  } = useServerSideDataTable<Feature>({
    apiEndpoint: "/api/features",
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    mapResponse: (response) => ({
      items: response.features,
      pagination: response.pagination,
    }),
  });

  // Build filters configuration
  const filters: FilterConfig[] = [
    {
      id: "domain",
      label: "Domain",
      type: "select",
      options: [
        { value: "HR", label: "HR" },
        { value: "Finance", label: "Finance" },
        { value: "Operations", label: "Operations" },
        { value: "Analytics", label: "Analytics" },
        { value: "System", label: "System" },
      ],
      value: extraParams.domain || "",
      onChange: (value: string) =>
        setExtraParams((prev) => ({ ...prev, domain: value })),
    },
    {
      id: "kind",
      label: "Kind",
      type: "select",
      options: [
        { value: "page", label: "Page" },
        { value: "action", label: "Action" },
        { value: "api", label: "API" },
      ],
      value: extraParams.kind || "",
      onChange: (value: string) =>
        setExtraParams((prev) => ({ ...prev, kind: value })),
    },
  ];

  // Create the Add Feature button if onAddClick is provided
  const searchAction = onAddClick ? (
    <button
      onClick={onAddClick}
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 whitespace-nowrap"
    >
      <svg
        className="-ml-1 mr-2 h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      Add Feature
    </button>
  ) : null;

  return (
    <ServerSideDataTable
      columns={columns}
      data={features}
      totalCount={pagination.total}
      isLoading={loading}
      error={error}
      searchKey="name"
      searchPlaceholder="Search by feature name or code..."
      searchValue={search}
      onSearchChange={setSearch}
      searchAction={searchAction}
      filters={filters}
      pagination={tablePagination}
      onPaginationChange={setTablePagination}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
