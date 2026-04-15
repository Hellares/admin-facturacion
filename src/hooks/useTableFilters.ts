import { useState, useCallback } from 'react';
import type { ListQueryParams } from '@/types/api.types';
import { useCompanyContextStore } from '@/stores/company-context.store';

interface UseTableFiltersOptions {
  defaultPerPage?: number;
  defaultSortBy?: string;
  defaultSortDir?: 'asc' | 'desc';
}

export function useTableFilters(options: UseTableFiltersOptions = {}) {
  const { defaultPerPage = 15, defaultSortBy, defaultSortDir = 'desc' } = options;

  const selectedCompanyId = useCompanyContextStore((s) => s.selectedCompanyId);
  const selectedBranchId = useCompanyContextStore((s) => s.selectedBranchId);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir);
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);

  const getQueryParams = useCallback((): ListQueryParams => {
    const params: ListQueryParams = {
      page,
      per_page: perPage,
    };

    if (selectedCompanyId) params.company_id = selectedCompanyId;
    if (selectedBranchId) params.branch_id = selectedBranchId;
    if (search) params.search = search;
    if (sortBy) params.sort_by = sortBy;
    if (sortDir) params.sort_dir = sortDir;
    if (dateRange[0]) params.fecha_desde = dateRange[0];
    if (dateRange[1]) params.fecha_hasta = dateRange[1];

    return params;
  }, [page, perPage, search, sortBy, sortDir, dateRange, selectedCompanyId, selectedBranchId]);

  const resetFilters = useCallback(() => {
    setPage(1);
    setSearch('');
    setDateRange([null, null]);
    setSortBy(defaultSortBy);
    setSortDir(defaultSortDir);
  }, [defaultSortBy, defaultSortDir]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleDateRangeChange = useCallback((dates: [string | null, string | null]) => {
    setDateRange(dates);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number, newPerPage?: number) => {
    setPage(newPage);
    if (newPerPage && newPerPage !== perPage) {
      setPerPage(newPerPage);
      setPage(1);
    }
  }, [perPage]);

  return {
    // State
    page,
    perPage,
    search,
    sortBy,
    sortDir,
    dateRange,
    // Params
    getQueryParams,
    // Setters
    setPage,
    setPerPage,
    setSearch: handleSearchChange,
    setSortBy,
    setSortDir,
    setDateRange: handleDateRangeChange,
    handlePageChange,
    resetFilters,
  };
}
