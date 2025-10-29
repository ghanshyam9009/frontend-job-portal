# Subscription Flow API Integration

## Overview
This document details the integration of subscription/premium APIs for the Job Portal application. The integration includes functionality for marking jobs as premium, managing student premium subscriptions, and handling premium pricing.

## API Endpoints Integrated

### 1. Mark Job as Premium
**Endpoint:** `POST https://api.bigsources.in/api/premium/mark-job-premium`

**Request Body:**
```json
{
  "job_id": "928b134c-23ce-41b6-91cf-794de1901fb1",
  "is_premium": true,
  "category": "job"
}
```

**Response:**
```json
{
  "message": "Job in category 'job' marked as premium successfully.",
  "job": { /* job details */ }
}
```

**Integration Location:**
- Service: `src/services/adminService.js` - `markJobPremium()`
- Admin UI: `src/Pages/Admin/ManageJobs.jsx` - Premium star button in job actions

---

### 2. Mark Student as Premium
**Endpoint:** `POST https://api.bigsources.in/api/premium/mark-student-premium`

**Request Body:**
```json
{
  "email": "parulsenjeewansathi@gmail.com",
  "is_premium": true,
  "plan": "gold"
}
```

**Response:**
```json
{
  "message": "Student marked as premium successfully.",
  "student": { /* student details */ }
}
```

**Integration Location:**
- Service: `src/services/candidateService.js` - `markStudentPremium()`
- Service: `src/services/adminService.js` - `markStudentPremium()`
- Candidate UI: `src/Pages/Candidate/MembershipPlans.jsx` - Plan upgrade functionality

---

### 3. Get Premium Prices
**Endpoint:** `GET https://api.bigsources.in/api/students/premium-prices`

**Response:**
```json
{
  "subscription": {
    "silver": 1000,
    "updated_at": "2025-10-26T05:34:18.289Z",
    "subscription_id": "default",
    "email": "john900009@example.com",
    "platinum": 500,
    "gold": 4000
  }
}
```

**Integration Location:**
- Service: `src/services/candidateService.js` - `getPremiumPrices()`
- Service: `src/services/adminService.js` - `getPremiumPrices()`
- Candidate UI: `src/Pages/Candidate/MembershipPlans.jsx` - Display pricing
- Admin UI: `src/Pages/Admin/ManageMembershipPlans.jsx` - Display & manage pricing

---

### 4. Update Premium Prices
**Endpoint:** `PUT https://api.bigsources.in/api/admin/updates/premium-pricess`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "gold": 400,
  "platinum": 500,
  "silver": 1000
}
```

**Response:**
```json
{
  "message": "Subscription prices updated successfully",
  "subscription": { /* updated subscription details */ }
}
```

**Integration Location:**
- Service: `src/services/adminService.js` - `updatePremiumPrices()`
- Admin UI: `src/Pages/Admin/ManageMembershipPlans.jsx` - Premium price management modal

---

## File Structure

### Services Layer
```
src/services/
├── adminService.js         # Admin premium management functions
├── candidateService.js     # Candidate premium functions
└── apiClient.js            # HTTP client for API calls
```

### Configuration
```
src/config/
└── api.js                  # API endpoint definitions
```

### UI Components

#### Admin Side
```
src/Pages/Admin/
├── ManageJobs.jsx          # Job premium marking functionality
└── ManageMembershipPlans.jsx  # Premium pricing management
```

#### Candidate Side
```
src/Pages/Candidate/
└── MembershipPlans.jsx     # Premium plan selection & upgrade
```

---

## Key Features Implemented

### Admin Features
1. **Mark Job as Premium**
   - Gold star button in ManageJobs page
   - Marks individual jobs as premium
   - Updates job status in real-time

2. **Manage Premium Prices**
   - View current pricing for Gold, Platinum, and Silver plans
   - Update pricing through dedicated modal
   - Real-time price updates across the platform

3. **Student Premium Management**
   - Mark students as premium users
   - Assign premium plans (Gold/Platinum/Silver)

### Candidate Features
1. **View Membership Plans**
   - Display all available plans (Free, Silver, Gold, Platinum)
   - Real-time pricing from API
   - Feature comparison for each plan

2. **Upgrade to Premium**
   - One-click plan upgrade
   - Automatic premium status assignment
   - Plan-specific benefits activation

---

## API Configuration

All API endpoints are centralized in `src/config/api.js`:

```javascript
premium: {
  markJobPremium: '/premium/mark-job-premium',
  markStudentPremium: '/premium/mark-student-premium',
  getPremiumPrices: '/students/premium-prices',
  updatePremiumPrices: '/admin/updates/premium-pricess'
}
```

Base URL: `https://api.bigsources.in/api`

---

## Usage Examples

### Admin: Mark Job as Premium
```javascript
import { adminService } from '../../services/adminService';

const handleMarkJobPremium = async (jobId) => {
  try {
    const result = await adminService.markJobPremium(
      jobId,      // Job ID
      true,       // is_premium flag
      'job'       // category
    );
    console.log('Job marked as premium:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Admin: Update Premium Prices
```javascript
import { adminService } from '../../services/adminService';

const handleUpdatePrices = async () => {
  try {
    const result = await adminService.updatePremiumPrices({
      email: "admin@example.com",
      gold: 400,
      platinum: 500,
      silver: 1000
    });
    console.log('Prices updated:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Candidate: Upgrade Plan
```javascript
import { candidateService } from '../../services/candidateService';

const handleUpgrade = async (userEmail, plan) => {
  try {
    const result = await candidateService.markStudentPremium({
      email: userEmail,
      is_premium: true,
      plan: plan  // 'gold', 'platinum', or 'silver'
    });
    console.log('Plan upgraded:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Get Current Pricing
```javascript
import { candidateService } from '../../services/candidateService';

const fetchPrices = async () => {
  try {
    const response = await candidateService.getPremiumPrices();
    console.log('Current prices:', response.data);
    // { gold: 400, platinum: 500, silver: 1000 }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Premium Plans Overview

### Free Plan
- Basic job searching features
- Limited applications (3 per month)
- Save up to 5 jobs
- Basic profile visibility
- Email support

### Silver Plan
- 50 job applications per month
- Save up to 50 jobs
- Standard profile visibility
- Basic messaging
- Application tracking
- Email support

### Gold Plan (Most Popular)
- **Unlimited** job applications
- Save unlimited jobs
- Advanced profile visibility
- Priority in search results
- Direct messaging with employers
- Application tracking
- Resume builder
- Email & phone support

### Platinum Plan
- Everything in Gold
- Personalized job recommendations
- Interview preparation tools
- Career coaching sessions
- Salary negotiation guidance
- LinkedIn profile optimization
- Priority customer support
- Advanced analytics

---

## Error Handling

All API calls include comprehensive error handling:

```javascript
try {
  const result = await adminService.markJobPremium(jobId, true, 'job');
  // Success handling
} catch (error) {
  console.error('Error marking job as premium:', error);
  // Error notification to user
  alert('Failed to mark job as premium. Please try again.');
}
```

---

## Testing Checklist

- [x] API endpoints configured in `api.js`
- [x] Service functions implemented for all 4 APIs
- [x] Admin can mark jobs as premium
- [x] Admin can view and update premium prices
- [x] Admin can mark students as premium
- [x] Candidates can view premium plans with live pricing
- [x] Candidates can upgrade to premium plans
- [x] Error handling implemented for all API calls
- [x] Loading states implemented
- [x] Success/failure notifications implemented

---

## Future Enhancements

1. **Payment Integration**
   - Add payment gateway for plan upgrades
   - Subscription renewal automation
   - Invoice generation

2. **Analytics**
   - Track premium conversions
   - Monitor popular plans
   - Revenue analytics

3. **Notifications**
   - Email notifications for plan upgrades
   - Expiry reminders
   - Feature unlock notifications

4. **Advanced Features**
   - Trial periods for premium plans
   - Discounts and promotional codes
   - Referral programs

---

## Support

For issues or questions regarding the subscription API integration:
- Check API documentation at `https://api.bigsources.in/docs`
- Review error logs in browser console
- Contact backend team for API-related issues

---

**Last Updated:** October 28, 2025  
**Version:** 1.0.0
