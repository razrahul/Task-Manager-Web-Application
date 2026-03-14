function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    pages.push(pageNumber);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        className="button-secondary"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      {pages.map((pageNumber) => (
        <button
          type="button"
          key={pageNumber}
          className={
            pageNumber === page
              ? "button-primary min-w-11"
              : "button-secondary min-w-11"
          }
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        className="button-secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
