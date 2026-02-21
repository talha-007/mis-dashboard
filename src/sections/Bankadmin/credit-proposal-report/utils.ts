import type { CreditProposalReport } from 'src/types/assessment.types';

// ----------------------------------------------------------------------

export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute' as const,
  whiteSpace: 'nowrap' as const,
  clip: 'rect(0 0 0 0)',
};

// ----------------------------------------------------------------------

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

export function getComparator<Key extends keyof CreditProposalReport>(
  order: 'asc' | 'desc',
  orderBy: Key
): (a: CreditProposalReport, b: CreditProposalReport) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------

export function applyFilter({
  inputData,
  comparator,
  filterName,
}: {
  inputData: CreditProposalReport[];
  comparator: (a: CreditProposalReport, b: CreditProposalReport) => number;
  filterName: string;
}) {
  const stabilized = inputData.map((el, index) => [el, index] as const);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  let result = stabilized.map((el) => el[0]);
  if (filterName) {
    const q = filterName.toLowerCase();
    result = result.filter(
      (row) =>
        row.customer?.name?.toLowerCase().includes(q) ||
        row.customer?.email?.toLowerCase().includes(q)
    );
  }
  return result;
}
