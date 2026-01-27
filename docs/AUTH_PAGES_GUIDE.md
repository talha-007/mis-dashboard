# Authentication Pages Guide

## 📄 Pages Created

Your microfinance dashboard now includes complete authentication flow with these pages:

### 1. Sign In Page (`/sign-in`)
- Email/password login
- Google OAuth login
- Links to register and forgot password

### 2. Register Page (`/register`)
- Customer registration form
- Individual or Business account selection
- Email, phone, name fields
- Password with confirmation
- Google OAuth registration
- Auto-redirect to OTP verification

### 3. Forgot Password Page (`/forgot-password`)
- Email input
- Sends OTP to email/phone
- Redirects to OTP verification

### 4. Verify OTP Page (`/verify-otp`)
- 6-digit OTP input
- Auto-focus between fields
- Paste support
- Resend OTP (60s cooldown)
- Works for both registration and password reset

## 🔗 Navigation Flow

### Registration Flow:
```
Register Page → Verify OTP → Sign In
```

### Password Reset Flow:
```
Sign In → Forgot Password → Verify OTP → Reset Password (to be created)
```

### Normal Login:
```
Sign In → Dashboard
```

## 🎯 Routes Added

| Route | Component | Purpose |
|-------|-----------|---------|
| `/sign-in` | SignInPage | Login page |
| `/register` | RegisterPage | Customer registration |
| `/forgot-password` | ForgotPasswordPage | Request password reset |
| `/verify-otp` | VerifyOtpPage | OTP verification |

## 📝 Usage Examples

### Navigate to Registration

```typescript
import { useRouter } from 'src/routes/hooks';

function Component() {
  const router = useRouter();
  
  const goToRegister = () => {
    router.push('/register');
  };
  
  return <button onClick={goToRegister}>Create Account</button>;
}
```

### OTP Verification Types

The OTP page supports two types via URL parameters:

```typescript
// For registration
router.push('/verify-otp?type=registration');

// For password reset
router.push('/verify-otp?type=reset&email=user@example.com');
```

## 🔌 Backend API Endpoints Required

### 1. Registration
```typescript
POST /api/auth/register
Body: {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber?: string,
  customerType: 'individual' | 'business'
}
Response: {
  success: true,
  data: {
    user: User,
    message: "OTP sent to email and phone"
  }
}
```

### 2. Request Password Reset
```typescript
POST /api/auth/password/reset-request
Body: {
  email: string
}
Response: {
  success: true,
  message: "Reset code sent to email"
}
```

### 3. Verify OTP/Email
```typescript
POST /api/auth/verify-email
Body: {
  token: string  // The 6-digit OTP
}
Response: {
  success: true,
  message: "Email verified successfully"
}
```

### 4. Resend OTP
```typescript
POST /api/auth/resend-otp
Body: {
  email: string,
  type: 'registration' | 'reset'
}
Response: {
  success: true,
  message: "OTP resent"
}
```

## 🎨 Features Implemented

### Registration Page Features:
- ✅ First name & last name fields
- ✅ Email validation
- ✅ Phone number field
- ✅ Account type selection (Individual/Business)
- ✅ Password strength indicator
- ✅ Password confirmation matching
- ✅ Google OAuth integration
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling

### Forgot Password Features:
- ✅ Email input
- ✅ Success message
- ✅ Auto-redirect to OTP
- ✅ Error handling
- ✅ Loading states

### OTP Verification Features:
- ✅ 6-digit input fields
- ✅ Auto-focus next field
- ✅ Backspace navigation
- ✅ Paste support (paste 6 digits at once)
- ✅ Resend OTP with countdown
- ✅ Type detection (registration/reset)
- ✅ Email display
- ✅ Success/error messages
- ✅ Auto-redirect after success

## 🔐 Security Features

### Password Requirements:
- Minimum 8 characters
- Must match confirmation
- Hidden by default (show/hide toggle)

### OTP Security:
- 6-digit numeric code
- 60-second cooldown for resend
- Expires after certain time (backend handles this)
- Single-use token

### Form Validation:
- Email format validation
- Required field validation
- Password strength check
- Real-time error messages

## 💡 Customization

### Change OTP Length

In `verify-otp-view.tsx`:

```typescript
// Change from 6 to 4 digits
const [otp, setOtp] = useState(['', '', '', '']); // 4 digits

// Update validation
if (otpCode.length !== 4) {
  setError('Please enter all 4 digits');
}
```

### Change Resend Cooldown

```typescript
setCountdown(30); // Change from 60 to 30 seconds
```

### Add More Registration Fields

In `register-view.tsx`:

```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  address: '',
  city: '',
  country: '',
});

// Add input fields
<TextField
  name="address"
  label="Address"
  value={formData.address}
  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
/>
```

## 🧪 Testing

### Test Registration Flow

1. Go to `/register`
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: +1234567890
   - Account Type: Individual
   - Password: Password123
   - Confirm Password: Password123
3. Click "Create Account"
4. Should redirect to `/verify-otp?type=registration`
5. Enter 6-digit OTP
6. Should redirect to `/sign-in`

### Test Password Reset Flow

1. Go to `/sign-in`
2. Click "Forgot password?"
3. Enter email: john@example.com
4. Click "Send Reset Code"
5. Should redirect to `/verify-otp?type=reset&email=john@example.com`
6. Enter 6-digit OTP
7. Should redirect to reset password page (to be created)

### Test OTP Features

1. **Auto-focus**: Type digit, automatically moves to next field
2. **Backspace**: Press backspace on empty field, moves to previous
3. **Paste**: Paste "123456" in first field, fills all 6 fields
4. **Resend**: Click "Resend Code", disabled for 60 seconds
5. **Validation**: Submit with incomplete OTP, shows error

## 🚀 Next Steps

### Recommended Additional Pages:

1. **Reset Password Page** (`/reset-password`)
   - New password input
   - Confirm password
   - Uses token from OTP verification

2. **Email Verification Success** (`/email-verified`)
   - Success message
   - Auto-redirect to login

3. **Profile Setup** (`/setup-profile`)
   - Additional customer information
   - KYC document upload
   - Account preferences

### Example Reset Password Page:

```typescript
// src/pages/reset-password.tsx
export default function ResetPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Reset Password - MIS Dashboard</title>
      </Helmet>
      <ResetPasswordView />
    </>
  );
}

// src/sections/auth/reset-password-view.tsx
export function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      // Show error
      return;
    }
    
    await authService.resetPassword(token, newPassword);
    router.push('/sign-in');
  };
  
  // Render form...
}
```

## 📱 Mobile Responsive

All pages are fully responsive:
- ✅ Mobile-friendly layouts
- ✅ Touch-optimized inputs
- ✅ Readable on small screens
- ✅ Accessible keyboard navigation

## ♿ Accessibility

- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ Error announcements

## 📚 Related Documentation

- [Setup Summary](./SETUP_SUMMARY.md) - Overall setup guide
- [Environment Setup](../ENV_SETUP_GUIDE.md) - Environment variables
- [Setup Guide](./SETUP.md) - Backend setup

Your authentication system is now complete with all necessary pages! 🎉
