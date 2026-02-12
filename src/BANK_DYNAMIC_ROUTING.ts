/**
 * ============================================================================
 * DYNAMIC BANK-BASED ROUTING IMPLEMENTATION
 * ============================================================================
 * 
 * This file documents the implementation of dynamic bank-based routing
 * allowing customers and admins to access bank-specific login/register pages.
 *
 * ROUTE PATTERNS:
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * CUSTOMER ROUTES (Dynamic Bank Slug):
 *   /{bank_slug}/register          - Customer Registration
 *   /{bank_slug}/login             - Customer Login
 *   /{bank_slug}/forgot-password   - Customer Forgot Password
 *   /{bank_slug}/verify-otp        - Customer Verify OTP
 * 
 * ADMIN ROUTES (Dynamic Bank Slug):
 *   /{bank_slug}/admin/login           - Admin Login
 *   /{bank_slug}/admin/forgot-password - Admin Forgot Password
 *   /{bank_slug}/admin/verify-otp      - Admin Verify OTP
 *   /{bank_slug}/admin/new-password    - Admin New Password
 * 
 * EXAMPLES:
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * For Bank Slug: "acme-bank"
 * 
 *   Customer:
 *   - https://app.example.com/acme-bank/register
 *   - https://app.example.com/acme-bank/login
 *   - https://app.example.com/acme-bank/forgot-password
 * 
 *   Admin:
 *   - https://app.example.com/acme-bank/admin/login
 *   - https://app.example.com/acme-bank/admin/forgot-password
 * 
 * ============================================================================
 * FILES INVOLVED
 * ============================================================================
 * 
 * 1. ROUTE CONFIGURATION
 *    └─ src/routes/routes-bank-dynamic.tsx
 *       Defines all dynamic bank-based routes with {bank_slug} parameter
 * 
 * 2. HOOKS & UTILITIES
 *    ├─ src/hooks/use-bank-slug.ts
 *    │  Custom hook to extract bank_slug from URL and navigation helpers
 *    │
 *    ├─ src/utils/bank-context.ts
 *    │  Bank context management utilities (session storage)
 *    │
 *    └─ src/utils/bank-routes.ts
 *       Route builder functions for generating bank-specific URLs
 * 
 * 3. API SERVICES
 *    └─ src/redux/services/bank-auth.services.tsx
 *       Bank-specific authentication API calls with bank_slug handling
 * 
 * 4. UPDATED VIEWS
 *    ├─ src/sections/auth/sign-in-customer-view.tsx
 *    ├─ src/sections/auth/sign-in-admin-view.tsx
 *    └─ src/sections/auth/register-view.tsx
 *       All updated to support bank slug extraction and context
 * 
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 * 
 * 1. EXTRACT BANK SLUG IN A COMPONENT
 * ────────────────────────────────────
 *   import { useBankSlug } from 'src/hooks/use-bank-slug';
 * 
 *   export function MyComponent() {
 *     const { bankSlug, navigateToBankLogin, navigateToBankRegister } = useBankSlug();
 *     
 *     if (!bankSlug) {
 *       return <div>Bank not found</div>;
 *     }
 * 
 *     return (
 *       <button onClick={() => navigateToBankLogin()}>
 *         Back to Login
 *       </button>
 *     );
 *   }
 * 
 * 2. GENERATE BANK URLS PROGRAMMATICALLY
 * ────────────────────────────────────────
 *   import { bankRoutes } from 'src/utils/bank-routes';
 * 
 *   const acmeBankRegisterUrl = bankRoutes.register('acme-bank');
 *   // Result: /acme-bank/register
 * 
 *   const acmeBankAdminLoginUrl = bankRoutes.adminLogin('acme-bank');
 *   // Result: /acme-bank/admin/login
 * 
 * 3. MAKE BANK-SPECIFIC API CALLS
 * ────────────────────────────────
 *   import bankAuthService from 'src/redux/services/bank-auth.services';
 *   import { useBankSlug } from 'src/hooks/use-bank-slug';
 * 
 *   export function LoginComponent() {
 *     const { bankSlug } = useBankSlug();
 * 
 *     const handleCustomerLogin = async (email: string, password: string) => {
 *       try {
 *         const response = await bankAuthService.customerLogin({
 *           bankSlug: bankSlug!,
 *           email,
 *           password,
 *           rememberMe: true,
 *         });
 *         // Handle success
 *       } catch (error) {
 *         // Handle error
 *       }
 *     };
 * 
 *     return <form onSubmit={handleCustomerLogin}>...</form>;
 *   }
 * 
 * 4. GET BANK CONTEXT (SESSION STORAGE)
 * ──────────────────────────────────────
 *   import { useBankContext, getCurrentBankSlug } from 'src/utils/bank-context';
 * 
 *   export function SomeComponent() {
 *     const { bankSlug, initializeBankContext, cleanupBankContext } = useBankContext();
 * 
 *     useEffect(() => {
 *       initializeBankContext();
 *       return () => cleanupBankContext();
 *     }, []);
 * 
 *     // Or retrieve from session storage directly
 *     const currentBank = getCurrentBankSlug();
 *     console.log('Current bank slug:', currentBank);
 *   }
 * 
 * ============================================================================
 * API INTEGRATION NOTES
 * ============================================================================
 * 
 * The bank-auth.services handles bank_slug as a query parameter or URL segment:
 * 
 * CUSTOMER ENDPOINTS:
 *   POST /api/borrowers/register?bank_slug={bank_slug}
 *   POST /api/borrowers/login?bank_slug={bank_slug}
 *   POST /api/borrowers/forgot-password?bank_slug={bank_slug}
 *   POST /api/borrowers/verify-otp?bank_slug={bank_slug}
 * 
 * ADMIN ENDPOINTS:
 *   POST /api/banks/{bank_slug}/login
 *   POST /api/banks/{bank_slug}/forgot-password
 *   POST /api/banks/{bank_slug}/verify-otp
 *   POST /api/banks/{bank_slug}/reset-password
 * 
 * If your backend uses different patterns, update bank-auth.services.tsx
 * 
 * ============================================================================
 * FLOW DIAGRAM
 * ============================================================================
 * 
 * CUSTOMER FLOW:
 * ──────────────
 *   1. User visits: /acme-bank/register
 *   2. Router matches: routes-bank-dynamic.tsx (path: :bank_slug/register)
 *   3. Component loads: RegisterPage with bank_slug='acme-bank' in params
 *   4. Hook extracts: useBankSlug() returns { bankSlug: 'acme-bank', ... }
 *   5. Context stores: getBankDataFromSlug() saves to sessionStorage
 *   6. API call: bankAuthService.customerRegister({ bankSlug: 'acme-bank', ... })
 *   7. Backend endpoint: POST /api/borrowers/register?bank_slug=acme-bank
 *   8. On success: Navigate to /dashboard (or /acme-bank/login if error)
 * 
 * ADMIN FLOW:
 * ───────────
 *   1. User visits: /acme-bank/admin/login
 *   2. Router matches: routes-bank-dynamic.tsx (path: :bank_slug/admin/login)
 *   3. Component loads: SignInAdminPage with bank_slug='acme-bank' in params
 *   4. Hook extracts: useBankSlug() returns { bankSlug: 'acme-bank', ... }
 *   5. API call: bankAuthService.adminLogin({ bankSlug: 'acme-bank', ... })
 *   6. Backend endpoint: POST /api/banks/acme-bank/login
 *   7. On success: Navigate to /dashboard (or /acme-bank/admin/login if error)
 * 
 * ============================================================================
 * TROUBLESHOOTING
 * ============================================================================
 * 
 * Q: bank_slug is undefined in my component
 * A: Make sure the route matches the pattern :bank_slug/...
 *    Check that you're using useBankSlug() hook, not useParams()
 * 
 * Q: Session storage not persisting bank slug
 * A: Call initializeBankContext() in useEffect on component mount
 *    Or ensure getBankDataFromSlug() is called after bankSlug extraction
 * 
 * Q: API endpoint receives incorrect bank_slug format
 * A: Check if your backend expects:
 *    - Query parameter: ?bank_slug=acme-bank (current implementation)
 *    - URL segment: /banks/acme-bank (customize in bank-auth.services.tsx)
 *    Update the service functions accordingly
 * 
 * Q: Routes not working after adding bank-dynamic routes
 * A: Ensure bankDynamicRoutes is imported in sections.tsx and added to routesSection
 *    The route order matters - bank dynamic routes should be before error routes
 * 
 * ============================================================================
 */

export {};
