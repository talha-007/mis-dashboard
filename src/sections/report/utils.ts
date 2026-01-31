import type { Report } from 'src/_mock/_report';

// Visually hidden utility for accessibility
export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

// Calculate empty rows for pagination
export function emptyRows(page: number, rowsPerPage: number, arrayLength: number): number {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// Type for ordering
type Order = 'asc' | 'desc';

// Generic comparator function
function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  const aValue = a[orderBy];
  const bValue = b[orderBy];
  
  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}

// Get comparator based on order and orderBy
export function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Apply filter to reports
export function applyFilter({
  inputData,
  comparator,
  filterName,
  filterType,
}: {
  inputData: Report[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterType: string;
}): Report[] {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (report) =>
        report.name.toLowerCase().includes(filterName.toLowerCase()) ||
        report.description.toLowerCase().includes(filterName.toLowerCase())
    );
  }

  if (filterType && filterType !== 'all') {
    inputData = inputData.filter((report) => report.type === filterType);
  }

  return inputData;
}
