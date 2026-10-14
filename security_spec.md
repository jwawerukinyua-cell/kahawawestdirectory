# Security Specification for Kahawa West Directory (KWEST)

## 1. Data Invariants
- Businesses: Public read access for published/active listings. Write operations require valid schema bounds.
- Claims: Public submissions allowed with strict validation (status defaults to 'pending'). Deletions and status changes restricted to administrative actions.
- Applications: Public listing submissions allowed with strict validation (status defaults to 'pending').
- Community Stories & Updates: Public read access for published stories/notices. Submissions start in 'pending_review' or verified state.
- Community Feedback: Public read access; submissions must include valid ratings (1-5) and valid business IDs.

## 2. The Dirty Dozen Payloads (Targeting Rejection)
1. Injection of 500KB oversized business title.
2. Malformed business ID containing illegal URI or control characters.
3. Attempting to create a claim with an already 'verified' status without moderation.
4. Overwriting an existing verified business listing with malicious arbitrary fields.
5. Creating an application with missing required applicant phone and category.
6. Setting negative or out-of-bounds ratings (rating: 99 or rating: -5) on feedback.
7. Submitting community update with missing author and content fields.
8. Injecting executable code or HTML script tags in business description fields exceeding length limits.
9. Modifying immutable creation timestamps on stories or claims.
10. Setting unapproved role privileges in claim payload.
11. Bypassing rate limiting by flooding non-whitelisted attributes.
12. Deleting directory records using unauthenticated raw collection sweeps.
