import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const goToPage = (page: number): void => {
    const clamped = Math.max(1, Math.min(totalPages, page));
    if (clamped !== currentPage) onPageChange(clamped);
  };

  const buildPages = (): (number | 'dots')[] => {
    const pages: (number | 'dots')[] = [];
    const windowSize = 2;

    const add = (p: number): void => {
      if (p >= 1 && p <= totalPages) pages.push(p);
    };

    add(1);

    const start = Math.max(2, currentPage - windowSize);
    const end = Math.min(totalPages - 1, currentPage + windowSize);

    if (start > 2) pages.push('dots');
    for (let p = start; p <= end; p++) add(p);
    if (end < totalPages - 1) pages.push('dots');

    if (totalPages > 1) add(totalPages);

    return pages;
  };

  const pages = buildPages();

  return (
    <nav className="flex items-center justify-center gap-2 mt-6 select-none" aria-label="Pagination">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="button-secondary px-3 py-2 disabled:opacity-50"
      >
        Prev
      </button>

      {pages.map((p, idx) =>
        p === 'dots' ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-500">…</span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={
              p === currentPage
                ? 'button-primary px-3 py-2'
                : 'button-secondary px-3 py-2'
            }
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="button-secondary px-3 py-2 disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
};


