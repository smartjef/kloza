export interface PaginationResult<T> {
  items: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getPaginationMetadata = (totalItems: number, page: number, limit: number) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    currentPage: page,
    pageSize: limit,
    totalPages,
    totalItems,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
