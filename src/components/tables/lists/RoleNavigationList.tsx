"use client";

import {
  ServerSideDataTable,
  FilterConfig,
} from "@/components/tables/ServerSideDataTable";
import {
  columns,
  RoleNavigationRecord,
} from "@/components/tables/columns/RoleNavigationColumns";
import { useServerSideDataTable } from "@/hooks/useServerSideDataTable";

interface RoleNavigationListProps {
  /** Optional callback when Add Mapping button is clicked */
  onAddClick?: () => void;
}

export default function RoleNavigationList({
  onAddClick,
}: RoleNavigationListProps) {
  const {
    data: records,
    loading,
    error,
    pagination,
    tablePagination,
    setTablePagination,
    sorting,
    setSorting,
    search,
    setSearch,
  } = useServerSideDataTable<RoleNavigationRecord>({
    apiEndpoint: "/api/role-navigation",
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  // Create the Add Mapping button if onAddClick is provided
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
      Add Mapping
    </button>
  ) : null;

  return (
    <ServerSideDataTable
      columns={columns}
      data={records}
      totalCount={pagination.total}
      isLoading={loading}
      error={error}
      searchKey="search"
      searchPlaceholder="Search by role or template name..."
      searchValue={search}
      onSearchChange={setSearch}
      searchAction={searchAction}
      pagination={tablePagination}
      onPaginationChange={setTablePagination}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
