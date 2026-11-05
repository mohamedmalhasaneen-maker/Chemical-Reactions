# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default Deny**: All unmatched paths (`/{document=**}`) deny all reads and writes unconditionally.
2. **Identity & Ownership (`/lab_profiles/{userId}`)**:
   - A `LabProfile` document ID `{userId}` MUST strictly match `request.auth.uid` and `isValidId(userId)`.
   - Only verified Google users (`request.auth.token.email_verified == true`) can create or update their own `LabProfile`.
   - `ownerId` MUST match `request.auth.uid` on creation and remain immutable (`incoming().ownerId == existing().ownerId`) on update.
   - `createdAt` MUST equal `request.time` on creation and remain immutable on update; `updatedAt` MUST equal `request.time` on both creation and update.
   - No PII (no email/phone/address) is stored in `LabProfile`; reads (`get`) are restricted strictly to the document owner (`request.auth.uid == userId`) or verified admin. `list` is disallowed on `lab_profiles` to prevent scraping.
   - Bounded lists: `completedLessons.size() <= 50`, `unlockedBadges.size() <= 50`.
3. **Admin Verification**:
   - Admin checks require `isSignedIn() && request.auth.token.email_verified == true` when checking runtime bootstrap email (`mohamed.m.alhasaneen@gmail.com`) or `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write**: Create `/lab_profiles/user_1` with `auth = null` -> `PERMISSION_DENIED`.
2. **Identity Spoofing**: User `uid_A` creates `/lab_profiles/uid_B` or sets `ownerId: "uid_B"` -> `PERMISSION_DENIED`.
3. **Unverified Email Spoofing**: Attacker claims `email: "mohamed.m.alhasaneen@gmail.com"` with `email_verified: false` -> `PERMISSION_DENIED`.
4. **Shadow Ghost Field**: User updates `/lab_profiles/uid_A` with extra key `isAdmin: true` -> `PERMISSION_DENIED` (`hasOnly` blocks).
5. **Immutable Field Tampering**: User updates `createdAt` or `ownerId` on `/lab_profiles/uid_A` -> `PERMISSION_DENIED`.
6. **Client Timestamp Forgery**: User passes forged `updatedAt` != `request.time` -> `PERMISSION_DENIED`.
7. **Resource Poisoning (1MB String)**: User passes 5,000-char `displayName` -> `PERMISSION_DENIED` (`displayName.size() <= 80`).
8. **ID Poisoning**: Create document with 300-char or special-char ID -> `PERMISSION_DENIED` (`isValidId`).
9. **Unbounded Array Exhaustion**: User pushes 500 items to `unlockedBadges` -> `PERMISSION_DENIED` (`.size() <= 50`).
10. **Array Element Type Poisoning**: User sets `unlockedBadges: [12345]` -> `PERMISSION_DENIED` (`[0] is string`).
11. **Negative Score Injection**: User sets `scorePoints: -999` or string -> `PERMISSION_DENIED` (`is int && >= 0 && <= 1000000`).
12. **Blanket Scraping (`list`)**: Authenticated user runs collection list on `/lab_profiles` -> `PERMISSION_DENIED`.
