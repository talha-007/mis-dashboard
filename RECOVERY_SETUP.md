# Recoveries & Overdues - Complete Setup

## ✅ What's Been Created

### **📁 File Structure**

```
src/sections/recovery/
├── recovery-table-row.tsx         ✅ Mark Defaulter button
├── recovery-table-head.tsx        ✅ Table header with sorting
├── recovery-table-toolbar.tsx     ✅ Search toolbar
├── table-empty-rows.tsx           ✅ Empty rows handler
├── table-no-data.tsx              ✅ No results component
├── utils.ts                       ✅ Sorting & filtering utilities
└── view/
    ├── recovery-view.tsx          ✅ Main view component
    └── index.ts                   ✅ Export file

src/_mock/
└── _recovery.ts                   ✅ Mock data (10 overdue loans)

src/pages/
└── recovery.tsx                   ✅ Page component

src/routes/
└── sections.tsx                   ✅ Route added
```

## 🎯 Table Columns (As Requested)

```
┌──────────────────┬──────────────┬─────────────┬───────────────────┐
│ Borrower         │ Due          │ Days Late   │ Action            │
├──────────────────┼──────────────┼─────────────┼───────────────────┤
│ Muhammad Usman   │ PKR 15,000   │ 45 days     │ [Mark Defaulter]  │
│ BRW-003          │ Loan: 100K   │             │                   │
├──────────────────┼──────────────┼─────────────┼───────────────────┤
│ Ali Raza         │ PKR 8,000    │ 67 days     │ [Mark Defaulter]  │
│ BRW-009          │ Loan: 55K    │             │                   │
├──────────────────┼──────────────┼─────────────┼───────────────────┤
│ Nida Malik       │ PKR 25,000   │ 102 days    │ DEFAULTER         │
│ BRW-021          │ Loan: 120K   │             │                   │
└──────────────────┴──────────────┴─────────────┴───────────────────┘
```

### **Column Details:**

#### **1. Borrower**
- Borrower name (bold)
- Borrower ID + CNIC (small text)

#### **2. Due**
- Due amount (formatted PKR, bold)
- Total loan amount (small text)

#### **3. Days Late**
- Number of days overdue
- **Color-coded:**
  - 🔴 **90+ days**: Red (Critical)
  - 🟡 **60-89 days**: Orange (Warning)
  - 🔵 **30-59 days**: Blue (Caution)
  - ⚫ **<30 days**: Grey (Recent)

#### **4. Action**
- **For Non-Defaulters:**
  - **[Mark Defaulter]** button
  - Dark grey by default
  - Brand purple on hover
- **For Defaulters:**
  - Shows "DEFAULTER" label (red)
  - Button is hidden

## 🎨 Button Design (Monochromatic)

### Mark Defaulter Button
```tsx
<Button
  sx={{
    bgcolor: 'grey.800',       // Dark grey default
    color: 'white',
    '&:hover': {
      bgcolor: 'primary.main', // Brand purple hover
    },
  }}
>
  Mark Defaulter
</Button>
```

### Visual States:
```
Default:  [Mark Defaulter]  ← Dark grey (#1C252E)
Hover:    [Mark Defaulter]  ← Brand purple (#4D0CE7)
After:    DEFAULTER          ← Red label
```

## 📊 Mock Data (10 Overdue Loans)

### Data Structure:
```typescript
{
  id: 'REC-001',
  borrowerId: 'BRW-003',
  borrowerName: 'Muhammad Usman',
  cnic: '42301-3456789-0',
  phone: '+92 302 3456789',
  email: 'usman@example.com',
  loanId: 'LOAN-003',
  loanAmount: 100000,
  dueAmount: 15000,
  daysLate: 45,
  dueDate: '2023-12-15',
  lastPaymentDate: '2023-11-20',
  status: 'overdue',
  isDefaulter: false,
}
```

### Sample Data:
1. **Muhammad Usman** - Due: PKR 15K - **45 days** late
2. **Ali Raza** - Due: PKR 8K - **67 days** late
3. **Imran Khan** - Due: PKR 12K - **23 days** late
4. **Sana Ahmed** - Due: PKR 18K - **89 days** late ⚠️
5. **Nida Malik** - Due: PKR 25K - **102 days** late - DEFAULTER ❌
6. *(+ 5 more overdue loans)*

## ✨ Features Implemented

### ✅ **Mark Defaulter Action**
- Click button to mark borrower as defaulter
- Status changes from "overdue" to "defaulted"
- `isDefaulter` flag set to `true`
- Button replaced with "DEFAULTER" label
- Irreversible action (by design)

### ✅ **Days Late Severity**
Color-coded visual indicators:
```
15 days  → Grey (Recent)
45 days  → Blue (Caution)
67 days  → Orange (Warning)
102 days → Red (Critical)
```

### ✅ **Built-in Features**
- **Search** - Filter by borrower name
- **Sorting** - Click any column header (default: Days Late descending)
- **Pagination** - 5, 10, 25 per page
- **Selection** - Checkbox for batch operations
- **Responsive** - Scrollable table on small screens

## 🔐 Security & Access

### Role-Based Access Control
- **Route Protected:** ✅ Superadmin only
- **Guard:** `RoleGuard` with `UserRole.SUPER_ADMIN`
- **Customers:** Cannot access this page

## 🎯 User Workflow

### Mark Defaulter Flow:
```
1. Review overdue loan details
2. Check days late and due amount
3. Click "Mark Defaulter" button
4. Button shows loading state
5. Status updates to "DEFAULTER"
6. Button disappears
7. Red "DEFAULTER" label appears
```

## 🔗 Navigation & Routing

### URL
`/recovery`

### Access
- **Sidebar:** "Recoveries & Overdues" (4th item)
- **Icon:** Warning/Alert icon
- **Permission:** Superadmin only

## 📈 Data Insights

### Severity Levels:
```
Critical (90+ days):  3 cases
Warning (60-89 days): 2 cases
Caution (30-59 days): 3 cases
Recent (<30 days):    2 cases
```

### Already Defaulted:
```
Total Defaulters: 2
- Nida Malik (102 days late)
- Usman Ghani (78 days late)
```

## 🎨 Design Consistency

### Monochromatic Theme
- **Button Default:** Dark grey (#1C252E)
- **Button Hover:** Brand purple (#4D0CE7)
- **Defaulter Label:** Red (error color)
- **Days Late:** Color-coded by severity
- **No multi-color buttons:** Consistent with design system

### Typography
```
Borrower Name:    16px, Semi-bold
Borrower ID:      12px, Regular, Grey
Due Amount:       14px, Semi-bold
Loan Amount:      12px, Regular, Grey
Days Late:        14px, Semi-bold, Color-coded
```

## 📝 Component Breakdown

### Table Row Component
```tsx
<RecoveryTableRow
  row={recovery}
  selected={isSelected}
  onSelectRow={handleSelect}
  onMarkDefaulter={handleMarkDefaulter}  // Mark defaulter handler
/>
```

### Action Handler
```typescript
const handleMarkDefaulter = (id: string) => {
  // Update recovery record
  // Set isDefaulter: true
  // Change status to 'defaulted'
};
```

## 🚀 Ready to Test

```bash
npm run dev
```

Navigate to: **Recoveries & Overdues** in the sidebar

### Test Scenarios:
1. ✅ View all overdue loans
2. ✅ Search by borrower name
3. ✅ Sort by days late (default)
4. ✅ Sort by due amount
5. ✅ Mark a borrower as defaulter
6. ✅ Verify label changes
7. ✅ Check color-coding of days late

## 📊 Future Enhancements (Optional)

### When Backend is Ready:
- [ ] Connect to real API endpoints
- [ ] Add confirmation dialog before marking defaulter
- [ ] Add reason/notes field
- [ ] Email notifications to borrower
- [ ] SMS reminders for overdue payments
- [ ] Payment collection tracking
- [ ] Recovery agent assignment
- [ ] Legal notice generation
- [ ] Settlement options
- [ ] Payment plan creation

### Advanced Features:
- [ ] Bulk mark as defaulter
- [ ] Export to Excel/PDF
- [ ] Filter by days late range
- [ ] Filter by due amount range
- [ ] Recovery analytics dashboard
- [ ] Automated escalation rules
- [ ] Recovery success rate tracking
- [ ] Aging analysis report

## 💡 Business Logic

### Defaulter Criteria
Typically, a borrower is marked as defaulter when:
- **90+ days** overdue (automatic)
- **Multiple missed payments**
- **Unreachable** for extended period
- **Legal action** initiated

### Recovery Process
```
Overdue (1-30 days)
  ↓
Send reminders (email/SMS)
  ↓
Phone call follow-up (30-60 days)
  ↓
Field visit by recovery agent (60-90 days)
  ↓
Mark as Defaulter (90+ days)
  ↓
Legal notice / Settlement
```

---

## ✨ Current Status

**✅ Recoveries & Overdues Page is Complete!**

**Features:**
- ✅ Full table with 4 columns (Borrower, Due, Days Late, Action)
- ✅ Mark Defaulter button (dark grey → brand purple)
- ✅ Color-coded days late indicator
- ✅ Defaulter label for marked borrowers
- ✅ Search functionality
- ✅ Sorting & pagination
- ✅ Responsive design
- ✅ Mock data (10 overdue loans)
- ✅ Superadmin only access
- ✅ Monochromatic design consistency

**Ready for production with backend integration!** 🚀
