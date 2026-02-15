/**
 * Shared Yup validation schemas for auth forms
 */
import * as Yup from 'yup';

export const signInSchema = Yup.object({
  email: Yup.string().required('Email is required').email('Enter a valid email address').trim(),
  password: Yup.string().required('Password is required'),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string().required('Email is required').email('Enter a valid email address').trim(),
});

export const newPasswordAdminSchema = Yup.object({
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
});

export const verifyOtpSchema = Yup.object({
  otp: Yup.string()
    .required('Please enter the 6-digit code')
    .length(6, 'Code must be 6 digits')
    .matches(/^\d{6}$/, 'Code must be 6 digits'),
});
