# Account Deletion Page - Google Play Store Requirements

## Delete Account URL

**Production URL:** `https://motorove.app/en/delete-account`  
**Turkish URL:** `https://motorove.app/tr/delete-account`

This URL should be provided to Google Play Store in the "Delete account URL" field.

## Page Features

The account deletion page meets all Google Play Store requirements:

### ✅ Refers to App/Developer Name

- Page prominently displays "Motorove" throughout
- Clear branding and reference to the mobile app

### ✅ Prominently Features Deletion Steps

The page provides a clear method for account deletion via email:

**Email Request**

- Send email to: media@motorove.app
- Include: Subject "Account Deletion Request" and your registered email address

### ✅ Specifies Data Types Deleted/Retained

**Data That Will Be Deleted:**

- Profile information (name, username, email, phone, photo)
- Motorcycle information and preferences
- Saved routes, recorded rides, and GPS data
- Posts, comments, and reviews
- Group memberships and event participations
- Social connections (followers, following)
- Notification preferences and settings
- Subscription and payment history (after retention period)

**Data That May Be Retained (with clear retention periods):**

- Transaction records and payment information (7 years - required by tax/financial regulations)
- Anonymized analytics data (cannot be linked back to user)
- Data required for legal compliance, fraud prevention, or dispute resolution

**Retention Period:**

- Most data: 30 days
- Financial records: Up to 7 years (legal requirement)

### ✅ Additional Information Provided

**Consequences of Deletion:**

- Loss of access to all features
- Username becomes available for others
- Active subscriptions cancelled (no refunds)
- Content removed from platform
- New account required for future use

**Reactivation Policy:**

- Account deletion is permanent
- Cannot reactivate deleted accounts
- Must create new account with new email

## Multi-Language Support

The page is available in both English and Turkish:

- English: `/en/delete-account`
- Turkish: `/tr/delete-account`

## Contact Information

Support Email: media@motorove.app

## Implementation Details

- **Page Location:** `/apps/landing/src/app/[locale]/delete-account/page.tsx`
- **Translations:**
  - English: `/apps/landing/public/locales/en/common.json`
  - Turkish: `/apps/landing/public/locales/tr/common.json`
- **Footer Link:** Added to footer navigation for easy access

## Compliance

This page fully complies with:

- Google Play Store account deletion requirements
- GDPR data protection regulations
- Turkish data protection laws (KVKK)
- User privacy rights and transparency requirements
