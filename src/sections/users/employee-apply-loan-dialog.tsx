import Dialog from '@mui/material/Dialog';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customerId: string;
  customer?: { name?: string; lastname?: string; cnic?: string; city?: string; region?: string; bankSlug?: string };
};

/** Placeholder: wire employee loan flow when implemented. */
export function EmployeeApplyLoanDialog({ open, onClose }: Props) {
  return <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth />;
}
