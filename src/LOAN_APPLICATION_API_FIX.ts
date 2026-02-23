/**
 * ============================================================================
 * LOAN APPLICATION - API INTEGRATION FIX
 * ============================================================================
 *
 * Fixed wrong API integration in loan application customer flow
 * Now using correct endpoints for bank-specific assessment
 *
 * ============================================================================
 * OLD vs NEW INTEGRATION
 * ============================================================================
 *
 * ASSESSMENT FETCH:
 * ─────────────────
 * OLD: assessmentService.getAssessmentForCustomer()
 *      └─ Used bank-admin API (incorrect for customers)
 *
 * NEW: customerService.getBankQuestionsForCustomer(bankId)
 *      └─ Uses: GET /api/v1/bank-questions/customer/:bankId
 *      └─ Direct customer-side API (correct)
 *
 * ASSESSMENT SUBMIT:
 * ──────────────────
 * OLD: assessmentService.submitAssessment(answers, customFields, score)
 *      └─ Used system user API (incorrect for customers)
 *
 * NEW: customerService.submitAssessmentAnswers(payload)
 *      └─ Uses: POST /api/v1/assessments/submit
 *      └─ Direct assessment submit API (correct)
 *
 * ============================================================================
 * FILES MODIFIED
 * ============================================================================
 *
 * 1. src/redux/services/customer.services.ts
 *    ├─ Added: getBankQuestionsForCustomer(bankId)
 *    │  └─ Endpoint: GET /api/v1/bank-questions/customer/:bankId
 *    │
 *    └─ Added: submitAssessmentAnswers(payload)
 *       └─ Endpoint: POST /api/v1/assessments/submit
 *
 * 2. src/redux/services/assessment.services.ts
 *    ├─ Added import: customerService
 *    ├─ Updated: getAssessmentForCustomer()
 *    │  └─ Now uses customerService when bankId provided
 *    └─ Updated: submitAssessment()
 *       └─ Now uses customerService.submitAssessmentAnswers()
 *
 * 3. src/sections/customer/apply-loan/apply-loan-flow-view.tsx
 *    ├─ Updated imports:
 *    │  ├─ Removed: assessmentService
 *    │  ├─ Removed: AssessmentAnswer type
 *    │  ├─ Added: customerService
 *    │  └─ Added: useAppSelector
 *    │
 *    ├─ Updated: AssessmentStepContent()
 *    │  ├─ Gets bankId from user data: (user).bankId or (user).bank
 *    │  ├─ Fetches assessment using: customerService.getBankQuestionsForCustomer()
 *    │  ├─ Maps response to BankAssessment format
 *    │  └─ Error if bankId not found
 *    │
 *    ├─ Updated: handleSubmit()
 *    │  ├─ Builds answer payload locally
 *    │  ├─ Submits using: customerService.submitAssessmentAnswers()
 *    │  └─ Extracts score/submission ID from response
 *    │
 *    └─ Removed: buildAnswerPayload() function
 *       └─ Inline logic in handleSubmit() now
 *
 * ============================================================================
 * API ENDPOINTS USED
 * ============================================================================
 *
 * ASSESSMENT FETCH (CUSTOMER):
 * GET /api/v1/bank-questions/customer/:bankId
 *
 * Request:
 *   No body required, bankId in URL
 *
 * Response:
 *   {
 *     "data": {
 *       "questions": [
 *         {
 *           "_id": "...",
 *           "type": "multiple_choice",
 *           "text": "Question text",
 *           "options": [
 *             {
 *               "_id": "...",
 *               "text": "Option A",
 *               "points": 10
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   }
 *
 * ASSESSMENT SUBMIT (CUSTOMER):
 * POST /api/v1/assessments/submit
 *
 * Request:
 *   {
 *     "score": 30,
 *     "totalScore": 100,
 *     "answers": [
 *       {
 *         "questionId": "...",
 *         "optionId": "...",
 *         "points": 10
 *       }
 *     ],
 *     "customFieldValues": []
 *   }
 *
 * Response:
 *   {
 *     "data": {
 *       "_id": "submission_id",
 *       "score": 30,
 *       "totalScore": 100,
 *       "answers": [...]
 *     }
 *   }
 *
 * ============================================================================
 * FLOW DIAGRAM
 * ============================================================================
 *
 * Customer clicks "New Loan Application"
 *   ↓
 * ApplyLoanFlowView opens with 2-step stepper
 *   ├─ Step 1: Credit Assessment
 *   └─ Step 2: Loan Details
 *   ↓
 * Step 1: AssessmentStepContent
 *   ├─ Get bankId from Redux user data: (user).bankId
 *   ├─ Call: customerService.getBankQuestionsForCustomer(bankId)
 *   ├─ API: GET /api/v1/bank-questions/customer/:bankId
 *   ├─ Display questions with radio button options
 *   ├─ User selects answers
 *   ├─ User clicks "Complete Assessment"
 *   │  ├─ Build answer payload with questionId, optionId, points
 *   │  ├─ Call: customerService.submitAssessmentAnswers(payload)
 *   │  ├─ API: POST /api/v1/assessments/submit
 *   │  └─ Get submissionId from response
 *   ├─ onComplete(score, totalScore, submissionId)
 *   ├─ Move to Step 2
 *   ↓
 * Step 2: ApplyLoanFormView (embedded)
 *   ├─ Show success alert: "Assessment complete"
 *   ├─ "Back to assessment" button (returns to Step 1)
 *   ├─ Display loan details form
 *   ├─ User fills: customerName, fatherName, cnic, city, region, loanAmount, duration
 *   ├─ User clicks "Submit Application"
 *   │  ├─ Include assessmentSubmissionId in payload
 *   │  ├─ Call: loanApplicationService.create(payload)
 *   │  └─ Backend links loan to assessment
 *   ├─ Navigate to /apply-loan (list)
 *   ↓
 * Complete: Loan application submitted with assessment
 *
 * ============================================================================
 * BANK ID EXTRACTION
 * ============================================================================
 *
 * The bankId is extracted from Redux auth state:
 *
 *   const { user } = useAppSelector((state) => state.auth);
 *   const bankId = (user as any)?.bankId || (user as any)?.bank;
 *
 * This assumes the user data object contains either:
 * - user.bankId (preferred)
 * - user.bank (fallback)
 *
 * If bankId is not found, assessment fails with error:
 * "Bank ID not found. Unable to load assessment."
 *
 * ============================================================================
 * RESPONSE MAPPING
 * ============================================================================
 *
 * The response from GET /api/v1/bank-questions/customer/:bankId
 * is mapped to BankAssessment format in AssessmentStepContent:
 *
 * ├─ question._id → q._id
 * ├─ question.type → q.type ('multiple_choice' or 'custom_field')
 * ├─ question.text → q.text
 * ├─ question.order → q.order (defaults to index + 1)
 * ├─ option._id → option._id
 * ├─ option.text → option.text
 * └─ option.points → option.points
 *
 * Custom field questions are handled if type !== 'multiple_choice'
 *
 * ============================================================================
 * ERROR HANDLING
 * ============================================================================
 *
 * 1. Missing bankId:
 *    Error: "Bank ID not found. Unable to load assessment."
 *    Action: Show alert and prevent assessment load
 *
 * 2. Assessment fetch fails:
 *    Error: (from catch block)
 *    Action: Show error alert with retry option
 *
 * 3. Assessment submit fails:
 *    Error: (from catch block)
 *    Action: Show error alert, stay in assessment form
 *    User can retry or go back
 *
 * 4. No questions available:
 *    Alert: "No assessment is available"
 *    Action: Show button to skip to loan form
 *
 * ============================================================================
 * TESTING CHECKLIST
 * ============================================================================
 *
 * [ ] Customer is logged in with bankId in user data
 * [ ] Click "New Loan Application"
 * [ ] Step 1 (Assessment) loads questions
 * [ ] Questions display correctly
 * [ ] Answer options are clickable
 * [ ] "Complete Assessment" button is enabled when all answered
 * [ ] Assessment submits successfully
 * [ ] Get submissionId from response
 * [ ] Step 2 (Loan Form) loads
 * [ ] Loan form displays with assessmentSubmissionId passed
 * [ ] Fill loan form
 * [ ] Submit creates application linked to assessment
 * [ ] Redirect to /apply-loan list
 * [ ] Test error cases:
 *     [ ] Missing bankId
 *     [ ] Network error on fetch
 *     [ ] Network error on submit
 *
 * ============================================================================
 * BACKWARD COMPATIBILITY
 * ============================================================================
 *
 * The updated assessment.services.ts still supports:
 *
 * 1. getAssessmentForCustomer(bankId) - NEW flow
 * 2. submitAssessment() - Still available for legacy code
 * 3. getAssessmentForCustomer() without bankId - Fallback
 *
 * But ONLY the new customer service endpoints are used in loan flow.
 * Old bank-admin endpoints are no longer called from customer flow.
 *
 * ============================================================================
 * SUMMARY OF CHANGES
 * ============================================================================
 *
 * ✅ Removed wrong API integration from customer loan flow
 * ✅ Added correct customer-side API endpoints
 * ✅ Assessment fetches from: /api/v1/bank-questions/customer/:bankId
 * ✅ Assessment submits to: /api/v1/assessments/submit
 * ✅ Bank ID extracted from Redux auth state
 * ✅ Response properly mapped to BankAssessment format
 * ✅ Error handling for missing bankId
 * ✅ Flow continues to loan details after assessment submission
 * ✅ Assessment ID passed to loan form for linking
 *
 * STATUS: COMPLETE ✅
 *
 * ============================================================================
 */

export {};
