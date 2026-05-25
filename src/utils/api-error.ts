/**
 * Normalize API error payloads into a user-facing message.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error) return fallback;

  if (typeof error === 'string') return error;

  const err = error as {
    message?: string;
    response?: {
      data?: {
        message?: string;
        error?: string;
        errors?: Array<string | { message?: string; msg?: string }>;
      };
    };
  };

  const data = err.response?.data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;

  const firstFieldError = data?.errors?.[0];
  if (typeof firstFieldError === 'string') return firstFieldError;
  if (firstFieldError?.message) return firstFieldError.message;
  if (firstFieldError?.msg) return firstFieldError.msg;

  if (err.message && err.message !== 'Network Error') return err.message;

  return fallback;
}
