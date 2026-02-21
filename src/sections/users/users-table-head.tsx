import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';

interface HeadLabel {
  id: string;
  label: string;
  width?: number;
}

interface UsersTableHeadProps {
  headLabel: HeadLabel[];
}

export function UsersTableHead({ headLabel }: UsersTableHeadProps) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            sx={{
              width: headCell.width,
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.875rem',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {headCell.label}
            </Box>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
