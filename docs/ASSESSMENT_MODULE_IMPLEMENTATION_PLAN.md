# Assessment Module – Implementation Plan

## 1. Overview & Goals

- **Bank-specific assessments**: Each bank has its own assessment. Bank admin can add **as many questions as they want** and assign **whatever points they want** to each option (no fixed total). Total score = sum of each question’s maximum option points (e.g. 50, 100, 200).
- **Bank admin**: Sets up (1) **multiple-choice questions** with options and points (any points per option), and (2) **custom fields** (e.g. Salary Income, Utilities Bills) that the customer fills in; custom fields do not affect the score but appear on the credit proposal report.
- **Customer**: Takes the assessment → can then apply for a loan. Loan application is allowed only after completing the assessment.
- **Credit proposal report**: After a customer submits the assessment and applies for a loan, the bank admin sees a **credit proposal report** for that customer (score, answers, loan details).
- **Loan decision**: Bank admin can **approve** or **reject** the loan application from the credit proposal report (or from the report list). Approved/rejected status is reflected on the loan application and in the report list.
- **UI first**: Frontend is built as a complete module with mock data; APIs can be integrated later.

---

## 2. Data Model & API Assumptions

### 2.1 Assessment (per bank)

- **Owner**: One bank (e.g. `bankId`).
- **Items**: Two types.
  1. **Multiple-choice questions**: `_id`, `text`, `order`, **options** (each option: `_id`, `text`, `points`). Bank assigns points per option; only these questions contribute to the credit score.
  2. **Custom fields**: `_id`, `fieldKey`, `label`, `inputType` (number/text), `order`, optional `unit`. Customer enters a value; no points. Used for income/expense data (e.g. Salary Income, Utilities Bills, Installments, Fuel Expenses, Grocery Expenses, Medical Bills, Insurance, Fees, Miscellaneous, Car Rental, House Rental, Investment Income, Business Income).
- **Rule**: Bank assigns any points per option. Total max score = sum of each MC question’s max option points (no fixed value). Custom fields do not affect the score.

**Suggested API shape (backend to implement):**

```
GET  /api/banks/:bankId/assessment              → get bank’s assessment (questions + options)
PUT  /api/banks/:bankId/assessment              → create/update full assessment (idempotent)
POST /api/banks/:bankId/assessment/questions   → add question (optional; can be part of PUT)
```

**Assessment (response) example:**

```json
{
  "bankId": "...",
  "questions": [
    {
      "_id": "...",
      "text": "Employment type?",
      "order": 1,
      "options": [
        { "_id": "...", "text": "Salaried", "points": 25 },
        { "_id": "...", "text": "Self-employed", "points": 15 },
        { "_id": "...", "text": "Unemployed", "points": 0 }
      ]
    }
  ],
  "totalMaxScore": 100
}
```

---

### 2.2 Assessment submission (customer)

- **Who**: Customer (identified by auth / `customerId`).
- **Which bank**: Current bank context (from auth/session).
- **Data**: Selected option per question → computed **score** (sum of option points). Store each answer for the report.

**Suggested API:**

```
POST /api/customers/me/assessment-submissions   → submit answers (body: { answers: [{ questionId, optionId }] })
GET  /api/customers/me/assessment-submissions   → list my submissions (optional, for “My assessments”)
GET  /api/customers/me/assessment-submissions/latest → latest submission + score (to gate “Apply for loan”)
```

**Submission (response) example:**

```json
{
  "_id": "...",
  "customerId": "...",
  "bankId": "...",
  "score": 72,
  "totalScore": 100,
  "answers": [
    { "questionId": "...", "optionId": "...", "points": 25 }
  ],
  "submittedAt": "2026-02-14T12:00:00.000Z"
}
```

---

### 2.3 Loan application (link to assessment)

- Existing **loan application** entity should reference the **assessment submission** that was used (e.g. `assessmentSubmissionId`).
- **Rule**: Backend should accept loan application only if customer has a completed assessment submission for that bank (and optionally within a validity window).

**Suggested addition to loan application payload/response:**

- `assessmentSubmissionId` (required when creating application from this flow).

---

### 2.4 Credit proposal report (bank admin)

- **Input**: Customers who have **submitted assessment** and **applied for loan** for this bank.
- **Content**: Customer info + assessment result (score, each Q&A and points) + loan application summary.
- **Loan decision**: Bank admin can **approve** or **reject** the associated loan application. Status values: `pending` | `approved` | `rejected`.

**Suggested API:**

```
GET  /api/banks/me/credit-proposal-reports       → list reports (paginated, filter by status/date)
GET  /api/banks/me/credit-proposal-reports/:id    → single report detail
POST /api/banks/me/credit-proposal-reports/:id/approve → approve loan application
POST /api/banks/me/credit-proposal-reports/:id/reject  → reject loan application
```

**Report (list item) example:**

```json
{
  "_id": "...",
  "customerId": "...",
  "customer": { "name": "...", "email": "...", "phone": "..." },
  "assessmentSubmissionId": "...",
  "score": 72,
  "totalScore": 100,
  "loanApplicationId": "...",
  "loanAmount": 50000,
  "status": "pending",
  "submittedAt": "2026-02-14T12:00:00.000Z"
}
```

**Report (detail) example:** same as above plus:

- Full **assessment snapshot**: questions with customer’s chosen option and points per question.
- Full **loan application** fields (amount, tenure, purpose, etc.).
- Actions: **Approve** and **Reject** to update loan application status.

---

## 3. User Flows

### 3.1 Bank admin

| Step | Action | Location (UI) |
|------|--------|----------------|
| 1 | Open “Assessment” (or “Credit assessment setup”) | New nav item under admin |
| 2 | See current questions and options (or empty state) | Assessment setup page |
| 3 | Add / edit / reorder questions; for each question add options and points | Same page or modal/drawer |
| 4 | Ensure total max score = 100 (validation + warning) | Inline / on save |
| 5 | Save assessment | Button → PUT bank assessment API |
| 6 | Open “Credit proposal reports” | New nav item under admin |
| 7 | See list of customers who completed assessment + applied for loan | Table: customer, score, loan amount, date, status |
| 8 | Open a report to view full credit proposal (score breakdown, Q&A, loan details) | Detail page or dialog |
| 9 | **Approve** or **Reject** the loan application from the report (list or detail) | Approve/Reject buttons; status updates to approved/rejected |

### 3.2 Customer

| Step | Action | Location (UI) |
|------|--------|----------------|
| 1 | Open “Assessment” or “Credit assessment” (or “Take assessment” before apply loan) | New customer nav item or step before “Apply for loan” |
| 2 | See bank’s questions; select one option per question | Single-page or stepper form |
| 3 | Submit assessment | Button → POST assessment submission |
| 4 | See result (e.g. score out of 100) and message “You can now apply for a loan” | Result screen |
| 5 | Go to “Apply for loan” | Existing apply-loan page |
| 6 | Fill loan form; submit (backend attaches latest assessment submission) | Existing flow + backend link to submission |

---

## 4. Frontend Implementation Plan

### 4.1 New routes (admin – bank admin)

| Path | Page | Guard |
|------|------|--------|
| `/assessment` | Assessment setup (questions + options, total 100) | ADMIN (bank context) |
| `/credit-proposal-reports` | List of credit proposal reports | ADMIN |
| `/credit-proposal-reports/:id` | Report detail (customer, score breakdown, loan) | ADMIN |

### 4.2 New routes (customer)

| Path | Page | Guard |
|------|------|--------|
| `/assessment` | Take assessment (show questions, submit answers) | CUSTOMER |
| Optional: `/assessment/result` | Show score and “Apply for loan” CTA | CUSTOMER |

Apply-loan can stay at `/apply-loan`; ensure it only allows submission when customer has a recent assessment submission (backend enforces; frontend can disable button or redirect if no submission).

### 4.3 Navigation (nav-config-dashboard)

- **Admin**: Add “Assessment” (setup) and “Credit proposal reports” to `adminNavData` (e.g. after “Credit ratings” or “Loan applications”).
- **Customer**: Add “Assessment” (take assessment) before “Apply for loan”, or make “Apply for loan” show a step “Complete assessment first” with link to assessment.

### 4.4 Redux / API layer

- **New service file**: `src/redux/services/assessment.services.ts` (or similar).
  - `getBankAssessment(bankId)` → GET bank assessment.
  - `updateBankAssessment(bankId, payload)` → PUT bank assessment.
  - `submitAssessment(answers)` → POST customer assessment submission.
  - `getMyLatestSubmission()` → GET latest submission (for gating apply-loan).
  - `getCreditProposalReports(params)` → GET list (admin).
  - `getCreditProposalReportById(id)` → GET one report (admin).

- Use existing `http-common` and bank context (e.g. bank id from auth/me) for admin; customer uses logged-in user.

### 4.5 Sections & pages (suggested structure)

| Area | Section path | Page path | Description |
|------|--------------|-----------|-------------|
| Admin | `sections/assessment/` | - | Assessment setup view (questions/options editor), reuse patterns from bank-view tables/forms |
| Admin | `sections/credit-proposal-report/` | - | List view + detail view (table + expand or separate page) |
| Customer | `sections/customer/assessment/` | - | Take-assessment view + optional result view |
| Pages | `pages/admin/assessment.tsx` | `/assessment` | Wraps assessment setup section |
| Pages | `pages/admin/credit-proposal-reports.tsx` | `/credit-proposal-reports` | Wraps list |
| Pages | `pages/admin/credit-proposal-report-detail.tsx` | `/credit-proposal-reports/:id` | Wraps report detail |
| Pages | `pages/customer/assessment.tsx` | `/assessment` | Wraps take-assessment (and result) |

- **Assessment setup (admin)**: Form or inline editor for questions; each question has options with points; running total and validation for 100; drag-and-drop or numeric order optional.
- **Take assessment (customer)**: Load bank assessment (GET); render one option per question (radio); on submit POST answers; show score and link to apply-loan.
- **Credit proposal reports (admin)**: Table with customer name, score, loan amount, date, status; row click or “View” → detail with full Q&A and loan info.

### 4.6 Types

- Add types (e.g. in `src/types/assessment.types.ts` or under `sections/assessment/`) for:
  - Assessment (questions, options, points).
  - Assessment submission (answers, score).
  - Credit proposal report (list + detail).

---

## 5. Backend Checklist (for API team)

- [ ] **Bank assessment**: CRUD or GET + PUT for bank’s assessment (questions + options, points). Enforce or validate total max score = 100.
- [ ] **Assessment submission**: POST customer answers; compute score; store with `customerId`, `bankId`, `submittedAt`.
- [ ] **Loan application**: Require `assessmentSubmissionId` (or validate that customer has a submission) when creating application; store link.
- [ ] **Credit proposal report**: Generate or query “customers with assessment submission + loan application” for the bank; expose list and detail APIs (with assessment snapshot and loan details).
- [ ] **Loan decision**: Endpoints for bank admin to approve or reject a loan application (e.g. from report id or loan application id); update loan application status to `approved` or `rejected`.
- [ ] **Authorization**: Bank admin sees only their bank’s assessment and reports; customer sees only their submissions and only their bank’s assessment.

---

## 6. Implementation Order (phases)

1. **Phase 1 – Data & API**
   - Define types and API contracts (align with backend).
   - Implement `assessment.services.ts` and wire to existing auth/bank context.

2. **Phase 2 – Bank admin: Assessment setup**
   - Assessment setup page: load assessment, edit questions/options/points, validate 100, save.
   - Route + nav for “Assessment”.

3. **Phase 3 – Customer: Take assessment**
   - Customer assessment page: load bank assessment, render form, submit, show score and CTA to apply for loan.
   - Route + nav for “Assessment” (customer).
   - Optional: gate “Apply for loan” on “has submission” (frontend + backend).

4. **Phase 4 – Loan application link**
   - Ensure apply-loan form sends `assessmentSubmissionId` (from latest submission) when creating application; backend stores it and enforces “assessment completed”.

5. **Phase 5 – Credit proposal reports**
   - List page: table of reports (customer, score, loan, date, status).
   - Detail page: full credit proposal (score breakdown, Q&A, loan details).
   - Route + nav for “Credit proposal reports”.

6. **Phase 6 – Polish**
   - Empty states (no assessment yet, no reports yet).
   - Error handling and loading states.
   - Optional: notifications when a new credit proposal is available for bank admin.

---

## 7. Summary

| Item | Description |
|------|-------------|
| **Assessment** | Per-bank; questions + options + points; total 100. |
| **Bank admin** | Sets assessment; sees credit proposal reports (assessment + loan per customer). |
| **Customer** | Takes assessment → sees score → applies for loan. |
| **Credit proposal report** | One per customer who did assessment + applied; shows score, answers, loan. |
| **Loan decision** | Bank admin approves or rejects the loan from the credit proposal report (list or detail). |
| **Frontend** | New admin routes (assessment, credit-proposal-reports), new customer route (assessment), new services and sections; reuse existing apply-loan and auth/bank context. **UI built first with mocks; API integration later.** |

This plan keeps each bank’s assessment separate, enforces a 100-point total, and ties the credit proposal report to “assessment submitted + loan applied” for that bank. Bank admin uses the report to approve or reject each loan application.
