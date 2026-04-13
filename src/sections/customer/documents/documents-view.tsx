import type { CustomerDocument, CustomerDocumentType } from 'src/types/customer-documents.types';

import { toast } from 'react-toastify';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import customerService from 'src/redux/services/customer.services';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import {
  CUSTOMER_DOCUMENT_LABELS,
  CUSTOMER_DOCUMENT_TYPE_VALUES,
  CUSTOMER_DOCUMENT_DESCRIPTIONS,
} from 'src/types/customer-documents.types';


// ----------------------------------------------------------------------

/** File picker hint + server-side style checks: only PNG, JPG, JPEG, PDF */
const ACCEPT_UPLOAD =
  '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);

function fileExtension(name: string): string {
  const i = name.lastIndexOf('.');
  if (i <= 0 || i >= name.length - 1) return '';
  return name.slice(i + 1).toLowerCase();
}

/** Rejects wrong extensions; if the browser sets a MIME type, it must match the extension */
function isAllowedCustomerDocumentFile(file: File): boolean {
  const ext = fileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) return false;

  const t = file.type.toLowerCase();
  if (!t) return true;

  if (ext === 'pdf') return t === 'application/pdf';
  if (ext === 'png') return t === 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') {
    return t === 'image/jpeg' || t === 'image/jpg' || t === 'image/pjpeg';
  }

  return false;
}

function mapApiDocument(raw: any): CustomerDocument {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    documentType: String(raw.document_type ?? raw.documentType ?? ''),
    fileName: String(raw.fileName ?? raw.originalName ?? raw.name ?? 'Document'),
    url: raw.url ?? raw.signedUrl ?? raw.fileUrl ?? raw.downloadUrl ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  };
}

function extractDocumentsList(payload: any): any[] {
  const data = payload?.data?.data ?? payload?.data ?? payload;
  if (Array.isArray(data?.documents)) return data.documents;
  if (Array.isArray(data)) return data;
  return [];
}

export function DocumentsView() {
  const theme = useTheme();
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [pendingFiles, setPendingFiles] = useState<Partial<Record<CustomerDocumentType, File | null>>>(
    {}
  );
  const [uploadingSlot, setUploadingSlot] = useState<CustomerDocumentType | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setListLoading(true);
      setListError(null);
      const res = await customerService.listDocuments();
      const rawList = extractDocumentsList(res.data);
      const mapped = Array.isArray(rawList)
        ? rawList.map(mapApiDocument).filter((d) => d.id)
        : [];
      setDocuments(mapped);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load documents';
      setListError(msg);
      setDocuments([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileSelect = (key: CustomerDocumentType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAllowedCustomerDocumentFile(file)) {
      toast.error('Only PDF, PNG, JPG, or JPEG files are allowed');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File is too large (max 2MB)');
      event.target.value = '';
      return;
    }

    setPendingFiles((prev) => ({ ...prev, [key]: file }));
  };

  const clearFileInput = (key: CustomerDocumentType) => {
    setPendingFiles((prev) => ({ ...prev, [key]: null }));
    const el = fileInputsRef.current[key];
    if (el) el.value = '';
  };

  const handleUpload = async (key: CustomerDocumentType) => {
    const file = pendingFiles[key];
    if (!file) return;
    if (!isAllowedCustomerDocumentFile(file)) {
      toast.error('Only PDF, PNG, JPG, or JPEG files are allowed');
      clearFileInput(key);
      return;
    }
    try {
      setUploadingSlot(key);
      await customerService.uploadDocument(file, key);
      toast.success('Document uploaded');
      clearFileInput(key);
      await fetchDocuments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await customerService.deleteDocument(deleteId);
      toast.success('Document removed');
      setDeleteId(null);
      await fetchDocuments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const formatTypeLabel = (t: string) =>
    CUSTOMER_DOCUMENT_LABELS[t as CustomerDocumentType] ??
    t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const renderUploadCard = (key: CustomerDocumentType) => {
    const title = CUSTOMER_DOCUMENT_LABELS[key];
    const description = CUSTOMER_DOCUMENT_DESCRIPTIONS[key];
    const file = pendingFiles[key] ?? null;
    const hasFile = !!file;
    const busy = uploadingSlot === key;

    return (
      <Card
        key={key}
        sx={{
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 3, minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
              >
                {description}
              </Typography>
            </Box>

            {hasFile ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  minWidth: 0,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                  sx={{ minWidth: 0 }}
                >
                  <Iconify
                    icon="eva:file-text-fill"
                    width={24}
                    sx={{ color: 'success.main', flexShrink: 0, mt: { sm: 0.5 } }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <Typography
                      variant="subtitle2"
                      component="p"
                      title={file.name}
                      sx={{
                        m: 0,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      Ready to upload
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={busy}
                    onClick={() => clearFileInput(key)}
                    sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', sm: 'flex-start' } }}
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
                onClick={() => fileInputsRef.current[key]?.click()}
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
                  PDF, PNG, JPG, or JPEG only · max 2MB
                </Typography>
              </Box>
            )}

            <input
              ref={(el) => {
                fileInputsRef.current[key] = el;
              }}
              type="file"
              accept={ACCEPT_UPLOAD}
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(key, e)}
            />

            {hasFile && (
              <Button
                fullWidth
                variant="contained"
                disabled={busy}
                onClick={() => handleUpload(key)}
                sx={{ minWidth: 0, whiteSpace: 'normal', textAlign: 'center' }}
                startIcon={
                  busy ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Iconify icon="eva:upload-fill" />
                  )
                }
              >
                {busy ? 'Uploading…' : `Upload ${title}`}
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
          <Typography variant="h4">Documents</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Upload the documents requested by your bank. Files are stored securely; download links are
            time-limited when you open them.
          </Typography>

          {listError && (
            <Alert severity="error" onClose={() => setListError(null)}>
              {listError}
            </Alert>
          )}

          <Card>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Your uploaded documents</Typography>
              <Typography variant="body2" color="text.secondary">
                All documents linked to your account
              </Typography>
            </Box>
            {listLoading ? (
              <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : documents.length === 0 ? (
              <Box sx={{ py: 4, px: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  No documents uploaded yet.
                </Typography>
              </Box>
            ) : (
              <Scrollbar>
                <TableContainer sx={{ maxWidth: '100%' }}>
                  <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '22%' }}>Type</TableCell>
                        <TableCell sx={{ width: '38%' }}>File</TableCell>
                        <TableCell sx={{ width: '22%' }}>Uploaded</TableCell>
                        <TableCell align="right" sx={{ width: '18%' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ verticalAlign: 'top', wordBreak: 'break-word' }}>
                            {formatTypeLabel(row.documentType)}
                          </TableCell>
                          <TableCell
                            sx={{
                              verticalAlign: 'top',
                              maxWidth: 0,
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                            }}
                          >
                            <Typography
                              component="span"
                              variant="body2"
                              title={row.fileName}
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {row.fileName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                            {formatDate(row.createdAt)}
                          </TableCell>
                          <TableCell align="right">
                            {row.url && (
                              <IconButton
                                component="a"
                                href={row.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                color="primary"
                                aria-label="Open document"
                              >
                                <Iconify icon="eva:external-link-fill" />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="Delete document"
                              onClick={() => setDeleteId(row.id)}
                            >
                              <Iconify icon="eva:trash-2-outline" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Scrollbar>
            )}
          </Card>

          <Typography variant="h6" sx={{ pt: 1 }}>
            Upload new files
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              minWidth: 0,
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {CUSTOMER_DOCUMENT_TYPE_VALUES.map((key) => renderUploadCard(key))}
          </Box>
        </Stack>
      </Container>

      <Dialog open={Boolean(deleteId)} onClose={() => !deleting && setDeleteId(null)}>
        <DialogTitle>Delete document?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This cannot be undone. You can upload a new file afterward if needed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
