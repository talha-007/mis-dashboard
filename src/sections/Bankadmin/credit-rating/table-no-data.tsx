import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableNoDataProps = {
  searchQuery: string;
};

export function TableNoData({ searchQuery }: TableNoDataProps) {
  return (
    <TableRow>
      <TableCell align="center" colSpan={9}>
        <Typography variant="h6" sx={{ py: 3 }}>
          Not found
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No results found for &quot;{searchQuery}&quot;
          <br />
          Try checking for typos or using complete words.
        </Typography>
      </TableCell>
    </TableRow>
  );
}
