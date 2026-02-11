import { useEffect, useState } from "react";
const usePagination = (items = [], pageSize = 5) => {
  const [currentPage, setCurrentPage] = useState(1);

  // note: get total number of pages
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // note: reset to first page if current more than total
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // note: calculate slice of items for current page
  const start = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);

  return {
    currentPage,
    totalPages,
    setCurrentPage,
    paginatedItems,
  };
};

export default usePagination;