# Secure Login Configuration

## 🔒 Security Implementation

For security reasons, only the **Customer login** is visible on the public login page. Admin and Super Admin login pages are hidden and accessible only by direct URL access.

---

## 🌐 Public Access

### Customer Login (Visible)

**URL:** `/sign-in` or `/sign-in/customer`

**Who can see it:** Everyone (public)

**Features:**
- Visible on the main sign-in page
- Green theme (#00A76F)
- Google Sign-In enabled
- Registration link available

---

## 🔐 Hidden Admin Access

### Super Admin Login (Hidden)

**URL:** `/sign-in/superadmin`

**Who can access:** Super Admin users only (by typing the URL directly)

**Security:**
- ❌ Not visible on the public sign-in page
- ❌ No links or hints on the public website
- ✅ Only accessible by typing the URL directly
- ✅ Protected by authentication

**Features:**
- Purple theme (#4D0CE7)
- Full system access
- No Google Sign-In (email/password only)

---

### Admin Login (Hidden)

**URL:** `/sign-in/admin`

**Who can access:** Admin users only (by typing the URL directly)

**Security:**
- ❌ Not visible on the public sign-in page
- ❌ No links or hints on the public website
- ✅ Only accessible by typing the URL directly
- ✅ Protected by authentication

**Features:**
- Blue theme (#1877F2)
- Operations management access
- No Google Sign-In (email/password only)

---

## 🎯 How It Works

### Public User Flow

```
User visits website
    ↓
Goes to /sign-in
    ↓
Sees Customer login option
    ↓
Clicks Customer
    ↓
Redirected to /sign-in/customer
    ↓
Login with email/password or Google
```

### Admin User Flow

```
Admin user
    ↓
Types /sign-in/admin directly in browser
    ↓
Admin login page loads
    ↓
Login with email/password
    ↓
Access dashboard with admin permissions
```

### Super Admin User Flow

```
Super Admin user
    ↓
Types /sign-in/superadmin directly in browser
    ↓
Super Admin login page loads
    ↓
Login with email/password
    ↓
Access dashboard with full permissions
```

---

## 🛡️ Security Benefits

### 1. **Reduced Attack Surface**
- Attackers can't easily find admin login pages
- No obvious entry points for brute force attacks
- Reduces automated scanning targets

### 2. **Security Through Obscurity (Layer)**
- Admin URLs are not advertised
- Adds an extra layer of defense
- Combined with strong authentication

### 3. **Professional Appearance**
- Public users only see customer-facing features
- Clean, focused user experience
- No confusion about different login types

### 4. **Audit Trail**
- Admin access requires knowledge of specific URLs
- Easier to identify unauthorized access attempts
- Clear separation of user types

---

## 📋 Access URLs Summary

| Role        | URL                     | Visible | Access Method          |
|-------------|-------------------------|---------|------------------------|
| Customer    | `/sign-in/customer`     | ✅ Yes  | Public link            |
| Admin       | `/sign-in/admin`        | ❌ No   | Direct URL only        |
| Super Admin | `/sign-in/superadmin`   | ❌ No   | Direct URL only        |

---

## 🔐 Additional Security Measures

### Already Implemented

✅ **Token-based authentication**  
✅ **Automatic token refresh with mutex**  
✅ **Role-based access control (RBAC)**  
✅ **Permission checks on routes**  
✅ **Guest-only routes** (authenticated users can't access login)  
✅ **Protected routes** (unauthenticated users redirected)  

### Recommended for Production

⚠️ **Rate limiting** - Prevent brute force attacks  
⚠️ **CAPTCHA** - Add after failed login attempts  
⚠️ **IP whitelisting** - For admin/superadmin routes  
⚠️ **Two-factor authentication (2FA)** - Extra security layer  
⚠️ **Session timeout** - Auto-logout after inactivity  
⚠️ **Login attempt monitoring** - Track failed attempts  
⚠️ **Account lockout** - Lock after multiple failures  

---

## 🚨 Important Notes

### For Administrators

1. **Bookmark the admin URL** - You'll need it regularly
2. **Don't share admin URLs publicly** - Keep them confidential
3. **Use strong passwords** - Critical for security
4. **Enable 2FA when available** - Extra protection

### For Developers

1. **Never expose admin URLs in**:
   - Public documentation
   - Client-side code comments
   - Error messages
   - Public repositories

2. **Keep admin routes hidden**:
   - No links from public pages
   - No hints in HTML source
   - No references in sitemap

3. **Monitor access attempts**:
   - Log failed login attempts
   - Alert on suspicious activity
   - Track admin route access

---

## 🧪 Testing Admin Access

### Development Mode

```env
VITE_BYPASS_AUTH=true
VITE_MOCK_USER=superadmin  # or 'admin'
```

### Manual Testing

1. **Test Public Access:**
   ```
   Visit: http://localhost:5173/sign-in
   Expected: Only Customer login visible
   ```

2. **Test Admin Access:**
   ```
   Visit: http://localhost:5173/sign-in/admin
   Expected: Admin login page loads
   ```

3. **Test Super Admin Access:**
   ```
   Visit: http://localhost:5173/sign-in/superadmin
   Expected: Super Admin login page loads
   ```

4. **Test Authentication:**
   - Try logging in with valid credentials
   - Verify role-based navigation
   - Test unauthorized route access

---

## 📝 Code Implementation

### Role Selector (Modified)

```typescript
// src/sections/auth/sign-in-role-selector-view.tsx

// Only show customer login publicly for security
// Admin and SuperAdmin can access their login pages by typing the URL directly
const ROLES: RoleCard[] = [
  {
    role: 'customer',
    title: 'Customer',
    description: 'Access your account and loans',
    icon: 'solar:user-bold-duotone',
    color: '#00A76F',
    path: '/sign-in/customer',
  },
];
```

### All Routes Still Active

```typescript
// src/routes/sections.tsx

// All three routes are still configured and functional
- /sign-in → Role selector (shows Customer only)
- /sign-in/customer → Customer login (public)
- /sign-in/admin → Admin login (direct URL only)
- /sign-in/superadmin → Super Admin login (direct URL only)
```

---

## 🔄 Changing Visibility (If Needed)

If you need to make admin logins visible again, update:

```typescript
// src/sections/auth/sign-in-role-selector-view.tsx

const ROLES: RoleCard[] = [
  // Add back these entries
  {
    role: 'superadmin',
    title: 'Super Admin',
    description: 'Full system access and control',
    icon: 'solar:shield-star-bold-duotone',
    color: '#4D0CE7',
    path: '/sign-in/superadmin',
  },
  {
    role: 'admin',
    title: 'Admin',
    description: 'Manage operations and users',
    icon: 'solar:user-id-bold-duotone',
    color: '#1877F2',
    path: '/sign-in/admin',
  },
  // Customer...
];
```

---

## 🎓 Best Practices

### Do ✅
- Use strong, unique passwords for admin accounts
- Enable 2FA when implemented
- Regularly audit admin access logs
- Keep admin URLs confidential
- Use HTTPS in production
- Implement rate limiting
- Monitor failed login attempts

### Don't ❌
- Share admin URLs publicly
- Use weak passwords
- Reuse passwords across accounts
- Leave admin accounts unlocked
- Expose admin routes in client code
- Ignore failed login alerts
- Use HTTP for sensitive pages

---

## 📊 Security Checklist

- [x] Admin routes hidden from public view
- [x] Direct URL access still functional
- [x] Role-based access control implemented
- [x] Token authentication enabled
- [x] Protected routes configured
- [x] Guest-only routes for login pages
- [ ] Rate limiting (recommended)
- [ ] 2FA (recommended)
- [ ] IP whitelisting (recommended)
- [ ] Login monitoring (recommended)
- [ ] Account lockout (recommended)

---

## 🚀 Production Deployment

### Before Deploying

1. **Review security settings**
2. **Test all login flows**
3. **Verify admin URL access**
4. **Enable HTTPS**
5. **Configure security headers**
6. **Set up monitoring**
7. **Enable logging**

### Environment Variables

```env
# Production settings
NODE_ENV=production
VITE_BYPASS_AUTH=false  # NEVER true in production
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## 📞 Support

For security concerns or questions:
- Review this documentation
- Check code comments
- Contact the development team
- Report security issues immediately

---

## ✨ Summary

The login system now implements **security by obscurity** as an additional layer of protection:

- ✅ **Public users** see only Customer login
- ✅ **Admin users** access via direct URL
- ✅ **Super Admin users** access via direct URL
- ✅ **All routes** remain functional
- ✅ **No public hints** about admin access
- ✅ **Professional appearance** for customers

This approach reduces the attack surface while maintaining full functionality for authorized users.
