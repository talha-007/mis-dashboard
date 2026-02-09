import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';


// ----------------------------------------------------------------------

type DocumentType = 'idCard' | 'utilityBill';

type DocumentState = {
  file: File | null;
  fileName: string;
  uploadDate: string | null;
};

export function DocumentsView() {
  const theme = useTheme();
  const idCardInputRef = useRef<HTMLInputElement>(null);
  const utilityBillInputRef = useRef<HTMLInputElement>(null);

  const [idCard, setIdCard] = useState<DocumentState>({
    file: null,
    fileName: '',
    uploadDate: null,
  });

  const [utilityBill, setUtilityBill] = useState<DocumentState>({
    file: null,
    fileName: '',
    uploadDate: null,
  });

  const handleFileSelect = (type: DocumentType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const state = {
        file,
        fileName: file.name,
        uploadDate: new Date().toLocaleDateString(),
      };

      if (type === 'idCard') {
        setIdCard(state);
      } else {
        setUtilityBill(state);
      }
    }
  };

  const handleUpload = (type: DocumentType) => {
    const document = type === 'idCard' ? idCard : utilityBill;
    if (document.file) {
      // Handle file upload to server
      console.log(`Uploading ${type}:`, document.file);
      // API call would go here
    }
  };

  const handleRemove = (type: DocumentType) => {
    if (type === 'idCard') {
      setIdCard({ file: null, fileName: '', uploadDate: null });
      if (idCardInputRef.current) {
        idCardInputRef.current.value = '';
      }
    } else {
      setUtilityBill({ file: null, fileName: '', uploadDate: null });
      if (utilityBillInputRef.current) {
        utilityBillInputRef.current.value = '';
      }
    }
  };

  const renderDocumentUpload = (
    type: DocumentType,
    title: string,
    description: string,
    document: DocumentState,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const hasFile = !!document.file;

    return (
      <Card>
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {description}
              </Typography>
            </Box>

            {hasFile ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Iconify icon="eva:file-text-fill" width={24} sx={{ color: 'success.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{document.fileName}</Typography>
                    {document.uploadDate && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Uploaded: {document.uploadDate}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemove(type)}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 1,
                  border: `2px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
                onClick={() => inputRef.current?.click()}
              >
                <Iconify
                  icon="eva:cloud-upload-fill"
                  width={48}
                  sx={{ color: 'text.secondary', mb: 1 }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  PDF, JPG, PNG (Max 5MB)
                </Typography>
              </Box>
            )}

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(type, e)}
            />

            {hasFile && (
              <Button
                variant="contained"
                onClick={() => handleUpload(type)}
                startIcon={<Iconify icon="eva:upload-fill" />}
              >
                Upload {title}
              </Button>
            )}
          </Stack>
        </Box>
      </Card>
    );
  };

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Typography variant="h4">Upload Documents</Typography>

          <Stack spacing={3}>
            {renderDocumentUpload(
              'idCard',
              'ID Card',
              'Upload a clear copy of your National ID Card (CNIC)',
              idCard,
              idCardInputRef
            )}

            {renderDocumentUpload(
              'utilityBill',
              'Utility Bill',
              'Upload a recent utility bill (electricity, gas, or water) as proof of address',
              utilityBill,
              utilityBillInputRef
            )}
          </Stack>
        </Stack>
      </Container>
    </DashboardContent>
  );
}
