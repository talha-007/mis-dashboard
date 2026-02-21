/**
 * Memoized form field components to avoid full-form re-renders on every keystroke.
 * Pass scalar value/error/touched and stable onChange/onBlur so only the edited field re-renders.
 */

import { memo } from 'react';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

export type FormFieldProps = {
  name: string;
  value: string | number | undefined;
  error?: string;
  touched?: boolean;
  onChange: (e: React.ChangeEvent<unknown>) => void;
  onBlur?: (e: React.FocusEvent<unknown>) => void;
  helperText?: React.ReactNode;
} & Omit<
  React.ComponentProps<typeof TextField>,
  'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'helperText'
>;

export const FormField = memo(function FormField({
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  helperText: helperTextProp,
  ...rest
}: FormFieldProps) {
  const showError = Boolean(touched && error);
  const helperText = showError ? error : helperTextProp;
  const safeValue = value === undefined || value === null ? '' : value;
  return (
    <TextField
      fullWidth
      name={name}
      value={safeValue}
      onChange={onChange}
      onBlur={onBlur}
      error={showError}
      helperText={helperText}
      {...rest}
    />
  );
});

export type FormSelectOption = { value: string; label: string };

export type FormSelectFieldProps = FormFieldProps & {
  options: FormSelectOption[];
};

export const FormSelectField = memo(function FormSelectField({
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  options,
  ...rest
}: FormSelectFieldProps) {
  const showError = Boolean(touched && error);
  const safeValue = value === undefined || value === null ? '' : value;
  return (
    <TextField
      fullWidth
      select
      name={name}
      value={safeValue}
      onChange={onChange}
      onBlur={onBlur}
      error={showError}
      helperText={showError ? error : undefined}
      {...rest}
    >
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
});

export type FormPasswordFieldProps = FormFieldProps & {
  showPassword: boolean;
  onTogglePassword: () => void;
};

export const FormPasswordField = memo(function FormPasswordField({
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  showPassword,
  onTogglePassword,
  helperText: helperTextProp,
  ...rest
}: FormPasswordFieldProps) {
  const showError = Boolean(touched && error);
  const helperText = showError ? error : helperTextProp;
  const safeValue = value === undefined || value === null ? '' : value;
  return (
    <TextField
      fullWidth
      name={name}
      value={safeValue}
      type={showPassword ? 'text' : 'password'}
      onChange={onChange}
      onBlur={onBlur}
      error={showError}
      helperText={helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={onTogglePassword} edge="end" aria-label="toggle password">
              <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...rest}
    />
  );
});
