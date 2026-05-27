# Quick Test - Copy and Paste These

## ✅ WORKING TEST DONORS

Copy and paste these **EXACT** values into the search box at:
`http://localhost:3000/admin-public/donor-verification`

### Test 1: Search by Email
```
aaseekapoudel18@gmail.com
```
**Expected Result:** Aaseeka Poudel, O+, 6 donations, REGULAR donor

### Test 2: Search by Phone
```
9876543210
```
**Expected Result:** Same donor (Aaseeka Poudel)

### Test 3: Search by Donor ID
```
cmplfp9560001gk0ni817wmpl
```
**Expected Result:** Same donor (Aaseeka Poudel)

### Test 4: Another Email
```
ashishgautam112@gmail.com
```
**Expected Result:** Ashish Gautam, B+, 2 donations, OCCASIONAL donor

### Test 5: Organization
```
aa@gmail.com
```
**Expected Result:** Ashish Club, A+, 9 donations, ORGANIZATION type

---

## ❌ EXPECTED TO FAIL (404 Error)

These will show "Donor not found" - this is correct behavior:

```
nonexistent@example.com
```

```
fake-phone-123
```

```
random-donor-id
```

---

## 🔍 What You're Testing

1. **Copy** one of the working test values above
2. **Paste** into the search box on the donor verification page
3. **Click Search** or press Enter
4. **See** the complete donor information

If you're getting 404 errors with the working test values above, there might be an issue with:
- Backend not running
- Database connection
- Route configuration

Let me know which test value you tried and I'll help debug!
