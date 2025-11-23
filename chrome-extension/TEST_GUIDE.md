# Testing Guide for Chrome Extension

## Pre-Testing Checklist

Before testing the extension, ensure:

- [ ] Backend is running (default: http://localhost:3000)
- [ ] Database is set up and migrations are run
- [ ] You have a test user account
- [ ] At least one open job exists in the system
- [ ] At least one talent pool exists in the system

## Test Scenarios

### 1. Installation Test

**Objective**: Verify extension installs correctly

**Steps**:
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `chrome-extension` directory
5. Verify extension appears in list

**Expected Result**:
- ✓ Extension loads without errors
- ✓ Extension icon appears in toolbar
- ✓ Badge shows red "!" (not authenticated)

**Troubleshooting**:
- If manifest error: Check manifest.json syntax
- If icon error: Generate icons or use placeholders

---

### 2. Welcome Page Test

**Objective**: Verify welcome page displays on first install

**Steps**:
1. Install extension (first time)
2. Welcome page should open automatically

**Expected Result**:
- ✓ Welcome page opens in new tab
- ✓ Page displays features and setup steps
- ✓ "Go to LinkedIn" button works

---

### 3. Settings Configuration Test

**Objective**: Verify API URL can be configured

**Steps**:
1. Click extension icon
2. Click "Configure API URL"
3. Enter `http://localhost:3000`
4. Click "Save"
5. Click "Back"

**Expected Result**:
- ✓ Settings page displays
- ✓ API URL input accepts text
- ✓ Save button works
- ✓ Success message appears
- ✓ Returns to login screen

---

### 4. Authentication Test

**Objective**: Verify login flow works

**Steps**:
1. Click extension icon
2. Click "Log In"
3. Log in with test credentials
4. Verify redirect back to extension

**Expected Result**:
- ✓ Login page opens in new tab
- ✓ Can log in successfully
- ✓ Token is saved
- ✓ Badge changes to green "✓"
- ✓ Extension shows main interface

**Troubleshooting**:
- If login page doesn't open: Check API URL
- If redirect fails: Check backend auth flow
- If token not saved: Check browser console

---

### 5. LinkedIn Profile Detection Test

**Objective**: Verify extension detects LinkedIn profiles

**Steps**:
1. Navigate to any LinkedIn profile (e.g., https://www.linkedin.com/in/williamhgates/)
2. Wait for page to load
3. Look for floating "Save to ATS" button

**Expected Result**:
- ✓ Floating button appears (bottom right)
- ✓ Button has purple gradient background
- ✓ Button shows icon and text
- ✓ Button is clickable

**Troubleshooting**:
- If button doesn't appear: Refresh page
- If still missing: Check browser console for errors
- Verify you're on a profile page (URL has `/in/`)

---

### 6. Profile Data Extraction Test

**Objective**: Verify data extraction from LinkedIn

**Steps**:
1. On a LinkedIn profile page
2. Click extension icon (or floating button)
3. Wait for data extraction
4. Review extracted data in popup

**Expected Result**:
- ✓ Loading indicator appears briefly
- ✓ Candidate info displays correctly:
  - Name (first and last)
  - Current title
  - Current company
  - Location
- ✓ No console errors

**Test Profiles**:
- Profile with complete information
- Profile with minimal information
- Profile with special characters in name
- Profile in different language

**Troubleshooting**:
- If no data extracted: Check content.js selectors
- If partial data: Some fields may not be visible
- Check browser console for extraction errors

---

### 7. Jobs Dropdown Test

**Objective**: Verify jobs load in dropdown

**Steps**:
1. Extract profile data (previous test)
2. Check "Add to Job" dropdown
3. Verify jobs are listed

**Expected Result**:
- ✓ Dropdown shows "Select a job..."
- ✓ Open jobs are listed
- ✓ Job titles are readable
- ✓ Can select a job

**Troubleshooting**:
- If no jobs: Create a job in the system
- If API error: Check backend logs
- Verify GET /api/v1/jobs endpoint works

---

### 8. Talent Pools Dropdown Test

**Objective**: Verify talent pools load in dropdown

**Steps**:
1. Extract profile data
2. Check "Add to Talent Pool" dropdown
3. Verify pools are listed

**Expected Result**:
- ✓ Dropdown shows "Select a talent pool..."
- ✓ Talent pools are listed
- ✓ Pool names are readable
- ✓ Can select a pool

**Troubleshooting**:
- If no pools: Create a talent pool in the system
- If API error: Check backend logs
- Verify GET /api/v1/talent-pools endpoint works

---

### 9. Save Candidate Test (Basic)

**Objective**: Verify candidate can be saved

**Steps**:
1. Extract profile data
2. Don't select job or pool
3. Ensure GDPR consent is checked
4. Click "Save Candidate"
5. Wait for success message

**Expected Result**:
- ✓ Button shows "Saving..." during save
- ✓ Success message appears
- ✓ Popup closes automatically
- ✓ Candidate created in database
- ✓ Source is set to "linkedin"

**Verify in Database**:
```sql
SELECT * FROM candidates 
WHERE linkedin_url LIKE '%linkedin.com/in/%' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Troubleshooting**:
- If save fails: Check backend logs
- If validation error: Check required fields
- Verify POST /api/v1/candidates endpoint works

---

### 10. Save with Job Test

**Objective**: Verify candidate can be added to job

**Steps**:
1. Extract profile data
2. Select a job from dropdown
3. Click "Save Candidate"
4. Wait for success

**Expected Result**:
- ✓ Candidate is created
- ✓ Application is created
- ✓ Application links to selected job
- ✓ Application appears in job pipeline

**Verify in Database**:
```sql
SELECT a.*, c.first_name, c.last_name, j.title 
FROM applications a
JOIN candidates c ON a.candidate_id = c.id
JOIN jobs j ON a.job_id = j.id
ORDER BY a.created_at DESC 
LIMIT 1;
```

---

### 11. Save with Talent Pool Test

**Objective**: Verify candidate can be added to pool

**Steps**:
1. Extract profile data
2. Select a talent pool from dropdown
3. Click "Save Candidate"
4. Wait for success

**Expected Result**:
- ✓ Candidate is created
- ✓ Candidate is added to pool
- ✓ Pool membership is recorded

**Verify in Database**:
```sql
SELECT tpm.*, c.first_name, c.last_name, tp.name 
FROM talent_pool_members tpm
JOIN candidates c ON tpm.candidate_id = c.id
JOIN talent_pools tp ON tpm.pool_id = tp.id
ORDER BY tpm.added_at DESC 
LIMIT 1;
```

---

### 12. Save with Both Test

**Objective**: Verify candidate can be added to job AND pool

**Steps**:
1. Extract profile data
2. Select a job
3. Select a talent pool
4. Click "Save Candidate"
5. Wait for success

**Expected Result**:
- ✓ Candidate is created
- ✓ Application is created for job
- ✓ Candidate is added to pool
- ✓ All relationships are correct

---

### 13. Duplicate Candidate Test

**Objective**: Verify handling of duplicate candidates

**Steps**:
1. Save a candidate from LinkedIn
2. Go to the same profile again
3. Try to save again

**Expected Result**:
- ✓ Error message about duplicate
- OR ✓ Candidate is updated (depending on backend logic)

**Note**: Backend should handle duplicates based on email or LinkedIn URL

---

### 14. Error Handling Test

**Objective**: Verify error messages display correctly

**Test Cases**:

**A. Network Error**
1. Stop backend server
2. Try to save candidate
3. Expected: Error message about connection

**B. Invalid Token**
1. Manually corrupt token in storage
2. Try to save candidate
3. Expected: Redirect to login

**C. Validation Error**
1. Modify content.js to send invalid data
2. Try to save candidate
3. Expected: Validation error message

**D. API Error**
1. Backend returns 500 error
2. Try to save candidate
3. Expected: Generic error message

---

### 15. GDPR Consent Test

**Objective**: Verify GDPR consent is recorded

**Steps**:
1. Extract profile data
2. Uncheck GDPR consent
3. Save candidate
4. Check database

**Expected Result**:
- ✓ Candidate saved with gdprConsent = false
- ✓ gdprConsentDate is null

**Then**:
1. Save another candidate with consent checked
2. Verify gdprConsent = true
3. Verify gdprConsentDate is set

---

### 16. Context Menu Test

**Objective**: Verify right-click menu works

**Steps**:
1. Navigate to LinkedIn profile
2. Right-click anywhere on page
3. Look for "Save to Recruiting Platform" option
4. Click it

**Expected Result**:
- ✓ Context menu item appears
- ✓ Clicking it opens popup
- ✓ Data is extracted

---

### 17. Badge Status Test

**Objective**: Verify badge shows correct status

**Test Cases**:

**A. Not Logged In**
- Badge shows red "!"

**B. Logged In**
- Badge shows green "✓"

**C. After Logout**
- Clear storage
- Badge returns to red "!"

---

### 18. Multiple Profiles Test

**Objective**: Verify extension works across multiple profiles

**Steps**:
1. Open 5 LinkedIn profiles in different tabs
2. Save each candidate
3. Verify all are saved correctly

**Expected Result**:
- ✓ Each profile extracts correctly
- ✓ All candidates are saved
- ✓ No data mixing between profiles

---

### 19. SPA Navigation Test

**Objective**: Verify button persists during LinkedIn navigation

**Steps**:
1. Go to a LinkedIn profile
2. Verify button appears
3. Click a link to another profile (within LinkedIn)
4. Verify button appears on new profile

**Expected Result**:
- ✓ Button appears on first profile
- ✓ Button appears on second profile
- ✓ No duplicate buttons

---

### 20. Performance Test

**Objective**: Verify extension doesn't slow down browsing

**Steps**:
1. Open LinkedIn with extension
2. Navigate between profiles
3. Monitor performance

**Expected Result**:
- ✓ Page load time < 3 seconds
- ✓ No noticeable lag
- ✓ Memory usage < 50MB
- ✓ CPU usage minimal

**Tools**:
- Chrome Task Manager (Shift+Esc)
- Chrome DevTools Performance tab

---

## Automated Testing

### Unit Tests (Future)

```javascript
// Example test structure
describe('Profile Extraction', () => {
  it('should extract first name', () => {
    // Test implementation
  });
  
  it('should extract last name', () => {
    // Test implementation
  });
  
  it('should handle missing data gracefully', () => {
    // Test implementation
  });
});
```

### Integration Tests (Future)

```javascript
describe('API Integration', () => {
  it('should create candidate via API', async () => {
    // Test implementation
  });
  
  it('should handle API errors', async () => {
    // Test implementation
  });
});
```

---

## Test Data

### Sample LinkedIn Profiles for Testing

Use these public profiles for testing (or create test profiles):

1. **Complete Profile**: Profile with all fields filled
2. **Minimal Profile**: Profile with only name and title
3. **Special Characters**: Profile with accents, unicode
4. **Long Content**: Profile with extensive experience
5. **Different Language**: Profile in non-English language

---

## Regression Testing

After making changes, re-run these critical tests:

- [ ] Installation
- [ ] Authentication
- [ ] Profile extraction
- [ ] Candidate save
- [ ] Job application creation
- [ ] Talent pool addition
- [ ] Error handling

---

## Browser Compatibility Testing

Test on:
- [ ] Chrome (latest)
- [ ] Chrome (one version back)
- [ ] Edge (Chromium)
- [ ] Brave

---

## Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
Extension Version: ___________

Test Results:
[ ] Installation - Pass/Fail
[ ] Authentication - Pass/Fail
[ ] Profile Extraction - Pass/Fail
[ ] Save Candidate - Pass/Fail
[ ] Add to Job - Pass/Fail
[ ] Add to Pool - Pass/Fail
[ ] Error Handling - Pass/Fail

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

## Reporting Issues

When reporting issues, include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser console errors**
5. **Backend logs** (if applicable)
6. **Screenshots** (if helpful)
7. **LinkedIn profile URL** (if specific to a profile)

---

## Success Criteria

Extension is ready for production when:

- [ ] All 20 test scenarios pass
- [ ] No console errors during normal use
- [ ] Performance is acceptable
- [ ] Error messages are user-friendly
- [ ] Documentation is complete
- [ ] Backend integration works
- [ ] GDPR compliance verified
- [ ] Security review passed
