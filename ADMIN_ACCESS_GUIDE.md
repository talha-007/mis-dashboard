# Admin Access Guide

## 🔐 How to Access Admin Login Pages

For security reasons, admin login pages are **not visible** on the public website. Only the Customer login is publicly shown.

---

## 🎯 Quick Access

### Super Admin

**URL:** `https://yourdomain.com/sign-in/superadmin`

**Development:** `http://localhost:5173/sign-in/superadmin`

**Credentials (Dev Mode):**
- Email: `admin@mis.local`
- Password: Any (bypassed in dev mode)

---

### Admin

**URL:** `https://yourdomain.com/sign-in/admin`

**Development:** `http://localhost:5173/sign-in/admin`

**Credentials (Dev Mode):**
- Email: `admin@example.com`
- Password: Any (bypassed in dev mode)

---

## 📌 How to Bookmark (Recommended)

### For Chrome/Edge
1. Navigate to your admin login URL
2. Press `Ctrl+D` (Windows) or `Cmd+D` (Mac)
3. Save bookmark with name like "MIS Admin Login"

### For Firefox
1. Navigate to your admin login URL
2. Click the star icon in the address bar
3. Save to "Bookmarks Toolbar" for quick access

---

## 🚀 Access Methods

### Method 1: Direct URL (Recommended)
1. Type the full URL in your browser
2. Press Enter
3. Login with your credentials

### Method 2: Bookmark
1. Click your saved bookmark
2. Login with your credentials

### Method 3: Browser History
1. Start typing the URL
2. Browser will suggest from history
3. Select and press Enter

---

## 🔒 Security Notes

### ✅ Do This
- Bookmark the admin URL for quick access
- Use strong, unique passwords
- Never share your login credentials
- Log out when done
- Clear browser cache on shared computers

### ❌ Don't Do This
- Don't share the admin URL publicly
- Don't save passwords in plain text
- Don't use weak passwords
- Don't leave your session unlocked
- Don't access from public WiFi without VPN

---

## 🐛 Troubleshooting

### Can't Find Admin Login Page

**Problem:** The admin login is not visible on `/sign-in`

**Solution:** This is by design! Type the URL directly:
- Super Admin: `/sign-in/superadmin`
- Admin: `/sign-in/admin`

---

### Typing URL Shows 404

**Problem:** Direct URL shows "Page Not Found"

**Solution:** 
1. Check spelling of the URL
2. Ensure you're using the correct domain
3. Verify the application is running
4. Clear browser cache and retry

---

### Login Fails

**Problem:** Credentials don't work

**Solution:**
1. Verify you're using correct email
2. Check password (case-sensitive)
3. Ensure caps lock is off
4. Contact IT support if issue persists

---

### Redirected to Customer Login

**Problem:** After login, seeing customer view

**Solution:**
1. Verify you're logging in at the correct URL
2. Check your account role with IT
3. Clear browser cookies
4. Try incognito/private mode

---

## 📱 Mobile Access

### iOS Safari
1. Open Safari
2. Type: `yourdomain.com/sign-in/admin`
3. Tap "Add to Home Screen" for quick access
4. Icon will appear on your home screen

### Android Chrome
1. Open Chrome
2. Type: `yourdomain.com/sign-in/admin`
3. Tap menu (⋮) → "Add to Home screen"
4. Icon will appear on your home screen

---

## 🔐 First Time Setup

### New Admin User

1. **Receive credentials** from IT department
2. **Navigate** to your admin login URL
3. **Login** with provided credentials
4. **Change password** immediately (if prompted)
5. **Bookmark** the login page
6. **Test access** to verify permissions

---

## 📞 Support Contacts

### Need Help?

**Can't access login page:**
- Contact: IT Support
- Email: support@yourdomain.com

**Forgot password:**
- Use "Forgot Password" link on login page
- Or contact IT Support

**Account locked:**
- Contact IT Support immediately

**Technical issues:**
- Contact Development Team

---

## 🎓 Training Resources

### For New Admins

1. **Security Best Practices** - Read SECURITY_LOGIN_SETUP.md
2. **Role Permissions** - Review ROLE_BASED_LOGIN_SETUP.md
3. **System Features** - Check dashboard documentation
4. **Common Tasks** - See admin user manual

---

## ✨ Quick Reference Card

Print or save this for quick access:

```
═══════════════════════════════════════════
        MIS DASHBOARD - ADMIN ACCESS
═══════════════════════════════════════════

SUPER ADMIN LOGIN
URL: yourdomain.com/sign-in/superadmin

ADMIN LOGIN
URL: yourdomain.com/sign-in/admin

CUSTOMER LOGIN (PUBLIC)
URL: yourdomain.com/sign-in/customer

SUPPORT
Email: support@yourdomain.com

═══════════════════════════════════════════
        Keep this information secure
═══════════════════════════════════════════
```

---

## 🔄 What Changed?

Previously, all three role options (Super Admin, Admin, Customer) were visible on the `/sign-in` page.

**Now:**
- ✅ Only Customer login is visible publicly
- 🔒 Admin logins are hidden
- 🔗 Admin users access via direct URL
- 🛡️ Improved security posture

This change reduces the attack surface and provides a cleaner public-facing login experience.

---

**Remember:** Bookmark your admin login URL for quick and easy access!
