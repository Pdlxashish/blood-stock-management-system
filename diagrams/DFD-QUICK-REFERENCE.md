# Data Flow Diagram (DFD) Quick Reference
## Blood Stock Management System

---

## DFD Hierarchy

```
Context Diagram (Level 0)
    │
    ├─→ DFD Level 0 (8 Main Processes)
    │       │
    │       ├─→ DFD Level 1: Donation Processing (Process 3.0)
    │       ├─→ DFD Level 1: Blood Issuance (Process 5.0)
    │       └─→ DFD Level 1: Inventory Management (Process 4.0)
```

---

## Context Diagram Summary

**External Entities:**
- Donor
- Staff
- Admin
- Recipient

**System:** Blood Stock Management System (single process)

**Key Data Flows:**
- Donor ↔ System: Registration, donations, certificates
- Staff ↔ System: Records, reports, alerts
- Admin ↔ System: Configuration, analytics
- Recipient ↔ System: Blood requests, receipts

---

## DFD Level 0 - Main Processes

| Process | Name | Description |
|---------|------|-------------|
| 1.0 | User Authentication & Management | Login, registration, access control |
| 2.0 | Donor Management | Donor profiles, eligibility, search |
| 3.0 | Donation Processing | Record donations, create blood packs |
| 4.0 | Inventory Management | Track stock, monitor expiry |
| 5.0 | Blood Issuance | Distribute blood to recipients |
| 6.0 | Event Management | Organize donation camps |
| 7.0 | Certificate Generation | Create donor/volunteer certificates |
| 8.0 | Reporting & Analytics | Generate reports and statistics |

---

## Data Stores

| ID | Name | Contents |
|----|------|----------|
| D1 | Users | User accounts, credentials, roles |
| D2 | Donors | Donor profiles, eligibility, history |
| D3 | Donations | Donation records, details |
| D4 | Blood Packs | Individual blood pack inventory |
| D5 | Blood Issues | Issuance records, recipients |
| D6 | Events | Blood donation events, camps |
| D7 | Certificates | Generated certificates |
| D8 | Blood Stock Summary | Aggregated stock levels by blood group |

---

## DFD Level 1: Donation Processing (3.0)

**Sub-processes:**

| Process | Name | Key Function |
|---------|------|--------------|
| 3.1 | Validate Donor Eligibility | Check if donor can donate |
| 3.2 | Record Donation Details | Capture donation information |
| 3.3 | Create Blood Pack | Generate blood pack record |
| 3.4 | Update Donor History | Update donor's donation count |
| 3.5 | Link to Event | Associate with donation event |
| 3.6 | Generate Confirmation | Create donation receipt |

**Data Flow:**
```
Donor → 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → Confirmation
         ↓     ↓     ↓     ↓     ↓
        D2    D3    D4    D2    D6
```

**Key Business Rules:**
- Minimum 3 months between donations
- Age: 18-65 years
- Minimum weight: 50 kg
- Blood pack expiry: 42 days from collection

---

## DFD Level 1: Blood Issuance (5.0)

**Sub-processes:**

| Process | Name | Key Function |
|---------|------|--------------|
| 5.1 | Receive Blood Request | Capture recipient requirements |
| 5.2 | Check Blood Availability | Query available stock |
| 5.3 | Select Blood Packs | Choose packs using FIFO |
| 5.4 | Create Issuance Record | Document the issuance |
| 5.5 | Update Blood Pack Status | Mark packs as USED |
| 5.6 | Update Inventory Summary | Adjust stock counts |
| 5.7 | Generate Issuance Receipt | Create receipt for recipient |

**Data Flow:**
```
Recipient → 5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6 → 5.7 → Receipt
                   ↓     ↓     ↓     ↓     ↓
                  D4    D4    D5    D4    D8
```

**Key Business Rules:**
- FIFO (First In, First Out) selection
- Prioritize nearest expiry dates
- Exact blood group matching
- Update status: AVAILABLE → USED

---

## DFD Level 1: Inventory Management (4.0)

**Sub-processes:**

| Process | Name | Key Function |
|---------|------|--------------|
| 4.1 | Add/Update Blood Pack | Manage blood pack records |
| 4.2 | Monitor Expiry Dates | Check for expiring packs |
| 4.3 | Update Pack Status | Change pack status |
| 4.4 | Calculate Stock Summary | Aggregate stock by blood group |
| 4.5 | Generate Stock Alerts | Alert on low stock/expiry |
| 4.6 | Search & Filter Inventory | Query blood packs |
| 4.7 | Generate Inventory Reports | Create stock reports |

**Data Flow:**
```
Staff → 4.1 → 4.4 → 4.5 → Alerts
         ↓     ↓     
        D4    D8    

        4.2 → 4.3 → 4.4
         ↓     ↓     ↓
        D4    D4    D8

Admin → 4.7 → Reports
         ↓
        D4, D8
```

**Key Business Rules:**
- Daily expiry monitoring
- Alert threshold: 7 days before expiry
- Low stock alert: < 5 units per blood group
- Status transitions: AVAILABLE → EXPIRED

---

## Data Flow Notation

**Symbols Used:**

- **Rectangle (Process)**: Represents a process/function
  ```
  ┌──────────────┐
  │   Process    │
  │     Name     │
  └──────────────┘
  ```

- **Cylinder (Data Store)**: Represents stored data
  ```
  ┌──────────┐
  │D1: Users │
  └──────────┘
  ```

- **External Entity**: Actors outside the system
  ```
  ┌─────────┐
  │  Donor  │
  └─────────┘
  ```

- **Arrow (Data Flow)**: Shows data movement
  ```
  ────→  Data Flow Name
  ```

---

## Key Relationships Between Processes

1. **Authentication → All Processes**
   - Provides user authentication and authorization

2. **Donor Management → Donation Processing**
   - Provides donor details and eligibility

3. **Donation Processing → Inventory Management**
   - Creates new blood packs

4. **Inventory Management → Blood Issuance**
   - Provides available blood packs

5. **Event Management → Donation Processing**
   - Links donations to events

6. **Donation Processing → Certificate Generation**
   - Triggers certificate creation

7. **All Processes → Reporting & Analytics**
   - Provide data for reports

---

## Critical Data Flows

### High Priority Flows:
1. **Donation → Blood Pack Creation**
   - Ensures inventory is updated immediately
   - Critical for stock availability

2. **Blood Request → Issuance**
   - Time-sensitive for emergency situations
   - Must check availability in real-time

3. **Expiry Monitoring → Status Update**
   - Prevents distribution of expired blood
   - Automated daily process

4. **Issuance → Inventory Update**
   - Maintains accurate stock levels
   - Triggers low stock alerts

### Supporting Flows:
1. **User Registration → Donor Profile**
2. **Event Creation → Participant Management**
3. **Donation → Certificate Generation**
4. **All Operations → Audit Logs**

---

## Data Store Relationships

```
D1 (Users) ──1:1──→ D2 (Donors)
D2 (Donors) ──1:M──→ D3 (Donations)
D3 (Donations) ──1:M──→ D4 (Blood Packs)
D4 (Blood Packs) ──M:M──→ D5 (Blood Issues)
D6 (Events) ──1:M──→ D3 (Donations)
D1 (Users) ──1:M──→ D7 (Certificates)
D4 (Blood Packs) ──aggregates to──→ D8 (Stock Summary)
```

---

## Process Timing

| Process | Frequency | Trigger |
|---------|-----------|---------|
| User Authentication | On-demand | User login |
| Donor Registration | On-demand | New donor |
| Donation Recording | On-demand | Donation event |
| Blood Issuance | On-demand | Blood request |
| Expiry Monitoring | Daily | Automated schedule |
| Stock Summary Update | Real-time | Inventory change |
| Report Generation | On-demand | User request |
| Certificate Generation | On-demand | Donation completion |

---

## Error Handling in DFD

**Common Error Scenarios:**

1. **Donation Processing:**
   - Donor not eligible → Reject with reason
   - Invalid blood group → Validation error
   - Duplicate donation → Check last donation date

2. **Blood Issuance:**
   - Insufficient stock → Alert and suggest alternatives
   - Expired packs selected → Auto-filter in selection
   - Invalid recipient → Validation error

3. **Inventory Management:**
   - Duplicate pack code → Generate new code
   - Invalid expiry date → Validation error
   - Negative stock → Data integrity check

---

## Performance Considerations

**Optimized Processes:**
- Stock availability check (indexed queries)
- Donor search (geolocation indexing)
- Expiry monitoring (date indexing)

**Batch Processes:**
- Daily expiry checks
- Stock summary calculations
- Report generation

**Real-time Processes:**
- User authentication
- Blood availability check
- Issuance recording

---

## Security in DFD

**Access Control:**
- Process 1.0 validates all user access
- Role-based permissions enforced
- Audit trails for sensitive operations

**Data Protection:**
- Encrypted passwords in D1
- Secure data transmission
- Protected health information (PHI) compliance

---

## Future Enhancements

**Potential New Processes:**
- 9.0: Notification Management (SMS/Email)
- 10.0: Mobile App Integration
- 11.0: Inter-facility Blood Transfer
- 12.0: Predictive Analytics

**Potential New Data Stores:**
- D9: Notifications
- D10: Audit Logs
- D11: System Configuration
- D12: Analytics Cache

---

## Rendering Instructions

1. **For PlantUML files (.puml):**
   - Use http://www.plantuml.com/plantuml/uml/
   - Or install PlantUML extension in VS Code
   - Export as PNG or SVG

2. **For ASCII files (.txt):**
   - View directly in text editor
   - Use monospace font for proper alignment

3. **For Reports:**
   - Export diagrams as high-resolution PNG
   - Recommended size: 1920x1080 or higher
   - Use SVG for scalable quality

---

**Document Version:** 1.0  
**Last Updated:** May 2026  
**Project:** Blood Stock Management System
