# IHM Platform - Technical Architecture & Business Requirements

## Executive Summary

**Platform Positioning:**  
A digital IHM management platform that enables shipowners to maintain accurate, compliant, and inspection-ready Inventory of Hazardous Materials throughout the entire vessel lifecycle.

---

## 1. Problem Statement

### Core Challenge
IHM is **not a one-time document** — it's a **living inventory** that must continuously reflect:
- Hazardous materials present onboard
- Their location, quantity, and status
- Changes due to repairs, retrofits, and equipment replacement

### Current Pain Points
- ❌ Manual compilation of supplier declarations (MDs / SDoCs)
- ❌ Lack of traceability between equipment and hazardous substances
- ❌ No centralized data system for IHM updates
- ❌ Poor version control of Part I, II, and III
- ❌ High dependency on external consultants
- ❌ Difficulty during audits and inspections

### Business Impact
- Delays in IHM certification and renewal
- Risk of non-compliance with ship recycling regulations
- Difficulty demonstrating compliance during PSC, Flag, and Class inspections
- High cost and time spent during end-of-life ship recycling
- Inability to track hazardous materials added during maintenance or retrofits

---

## 2. Solution Architecture

### Core Value Proposition
Transform IHM from a **static compliance document** into a **living, manageable system**.

### Platform Capabilities

#### **Digital IHM Management**
- ✅ Digitizes IHM Part I, II, and III
- ✅ Centralizes all hazardous material data
- ✅ Links materials to specific locations and equipment
- ✅ Stores and validates Material Declarations (MDs) and Supplier Declarations (SDoCs)
- ✅ Enables continuous IHM updating after repairs or modifications
- ✅ Generates inspection- and audit-ready IHM reports

#### **Traceability Chain**
```
Purchase Order → Supplier → MD/SDoC → Material → Equipment → Deck/Location → IHM Part → Certificate
```

#### **Version Control**
- Track all changes to IHM Part I, II, and III
- Audit trail for every material addition/removal
- Historical snapshots for compliance verification

---

## 3. Target Audience

### Primary Users
- **Ship Owners** - Fleet-level compliance oversight
- **Ship Operators** - Day-to-day IHM management
- **Fleet Managers** - Multi-vessel coordination
- **Technical Managers** - Maintenance and retrofit tracking
- **Marine Superintendents** - Operational compliance

### Secondary Users
- **Shipyards & Repair Yards** - Material declaration submission
- **IHM Consultants** - Audit and verification support
- **Classification Societies** - Inspection and certification
- **Ship Recycling Facilities** - End-of-life material inventory
- **Flag/Port State Inspectors** - Compliance verification

### Market Focus
- Commercial shipping fleets (existing vessels and newbuilds)
- Ship management companies managing multiple vessels
- Owners preparing vessels for recycling
- Small and mid-sized operators lacking digital IHM systems

---

## 4. Technical Architecture

### System Design Principles

#### **Vessel-Centric Architecture**
- Every module depends on **selected vessel context**
- Vessel is the **master entity** driving all data relationships
- Context persists across all modules and sessions

#### **Modular Structure**
```
Platform
├── Vessel Management (Master Control Plane)
├── IHM Part I (Materials installed during construction)
├── IHM Part II (Materials added during operation)
├── IHM Part III (Stores and consumables)
├── Decks & Locations (Spatial mapping)
├── Purchase Orders (Procurement tracking)
├── Materials Record (Central repository)
├── Documents & Certificates (Compliance records)
└── Administration (User management & workflows)
```

#### **Data Model - Core Entities**

**Vessel (Master Entity)**
- Core Identity (IMO, Name, Type, Registration)
- Ownership & Management (Owner, Manager, Fleet)
- Classification & Regulatory (Class, Flag State, IHM Class)
- Construction Lifecycle (Shipyard, Keel Date, Delivery)
- IHM & SOC Compliance (Method, Standards, Expiry)

**Material**
- IHM Part Classification (I, II, III)
- Hazard Type & Quantity
- Location Mapping (Deck, Compartment, Equipment)
- MD/SDoC Status
- Lifecycle Status (Active, Removed, Archived)

**Purchase Order**
- Supplier Information
- Line Items & Materials
- MD/SDoC Documents
- Approval Workflow
- Compliance Status

**Deck/Location**
- GA Plan Upload
- Spatial Coordinates
- Material Markers
- Equipment Mapping

**Document**
- Type (MD, SDoC, Certificate, Report)
- Vessel Association
- Validity Period
- Approval Status

#### **Compliance-Oriented Design**
- Structured according to IHM regulatory formats (EU 1257/2013, HKC)
- Transparent data traceability
- Easy report generation for inspections and recycling
- Designed to support future regulatory updates

#### **Security & Access Control**
- Role-based permissions (Admin, Manager, Viewer)
- Vessel-level access control
- Audit logging for all changes
- Secure document storage

---

## 5. Key Workflows

### **Workflow 1: New Vessel Onboarding**
1. Create vessel profile (Core Identity + Compliance Config)
2. Upload initial IHM documentation
3. Parse and structure IHM Part I data
4. Upload GA plans and deck layouts
5. Map materials to locations
6. Generate baseline IHM certificate

### **Workflow 2: Material Addition (Retrofit/Repair)**
1. Create Purchase Order
2. Request MD/SDoC from supplier
3. Receive and validate MD/SDoC
4. Extract hazardous material data
5. Assign material to deck/location
6. Update IHM Part II
7. Trigger IHM certificate renewal if needed

### **Workflow 3: Inspection Preparation**
1. Select vessel and inspection type
2. Generate current IHM report (Part I + II + III)
3. Verify all MDs/SDoCs are valid
4. Check SOC expiry status
5. Export inspection-ready documentation
6. Provide auditor access (read-only)

### **Workflow 4: Ship Recycling Preparation**
1. Generate complete IHM inventory
2. Classify materials by hazard type
3. Calculate quantities by category
4. Prepare recycling facility documentation
5. Export IHM in required format

---

## 6. Platform Modules - Detailed Specifications

### **Module 1: Admin Dashboard**
**Purpose:** High-level operational overview and compliance monitoring

**Features:**
- KPI Cards (Users, Purchase Orders, Vessels)
- Global Filters (Owner, Manager, Supplier, Vessel)
- Time Period Analysis (Today, Monthly, Yearly, Quarterly)
- Operational Overview Table (Grouped by Ship Owner)
- SOC Expiry Alerts Panel
- Compliance Risk Indicators

**Status:** ✅ **Implemented**

---

### **Module 2: Vessel Management (Master Control Plane)**
**Purpose:** Single source of truth for vessel data

**Features:**
- Vessel Selection Sidebar (with compliance status)
- Vessel Profile Management
  - Core Identity
  - Ownership & Management
  - Classification & Regulatory
  - Construction Timeline
  - IHM & SOC Compliance Configuration
- Vessel-Based Navigation Tabs
  - Projects
  - Decks
  - Documents
  - Materials Record
  - Purchase Orders
  - Reports
  - IHM Certificates

**Status:** 🔄 **Structure Ready - Needs Full Implementation**

---

### **Module 3: Decks & Materials**
**Purpose:** Spatial mapping of hazardous materials

**Features:**
- GA Plan Upload & Viewer
- Deck Cards (Visual Overview)
- Material Overlay on Deck Plans
- Add Material Flow
  - Movement Type (Installed, Removed, Moved)
  - IHM Part Classification
  - Hazardous Material Selection
  - Location Assignment (Deck, Compartment, Equipment)
  - Quantity & Unit
  - MD/PCHM Status
- Auto-update Materials Record

**Status:** 📋 **Planned**

---

### **Module 4: Materials Record**
**Purpose:** Central repository for all materials

**Features:**
- Sub-tabs for IHM Parts
  - Part I (Construction materials)
  - Part II (Operational additions)
  - Part III (Stores & consumables)
  - Non-Hazardous Materials
  - Archived Materials
- Material Details
  - Name, Type, Hazard Classification
  - Quantity, Unit, Location
  - MD/SDoC Reference
  - Installation/Removal Date
  - Status & Lifecycle
- Search & Filter
- Export Capabilities

**Status:** 📋 **Planned**

---

### **Module 5: Purchase Orders**
**Purpose:** Procurement tracking and MD/SDoC management

**Features:**
- Grouped by Supplier
- PO Details
  - PO Number, Date, Supplier
  - Line Items & Descriptions
  - IMPA/ISSA Codes
  - Equipment & Maker
- MD/SDoC Management
  - Upload & Validation
  - Approval Workflow
  - Compliance Status (HM Red/Green)
- Supplier Communication
  - Auto-generated email templates
  - Clarification requests
  - Document resubmission

**Status:** 📋 **Planned**

---

### **Module 6: Administration**
**Purpose:** Data ingestion and approval workflows

**Features:**
- Progressive Upload Pipeline
  1. Source Selection (Excel/PDF)
  2. Ship Manager & Vessel Selection
  3. File Upload
  4. Data Parsing & Editable Table
  5. Field Mapping Panel
  6. Save → Pending Audits
- Pending Audits
  - Duplicate Detection
  - Edit/Delete Actions
  - Save → Pending Review
- Pending Review
  - Internal Verification
  - Trigger Supplier MD/SDoC Request
- MD & SDoC Audit
  - Document Viewer
  - MD vs SDoC Comparison
  - Approve or Request Clarification

**Status:** 📋 **Planned**

---

### **Module 7: Users & Security**
**Purpose:** Access control and permissions

**Features:**
- User Management
  - Name, Email, Phone, Country
  - Status (Active/Inactive)
  - Category (Admin, Manager, Viewer)
  - Last Activity
- User Rights (Granular Permissions)
  - View, Add, Edit, Delete, Restore
  - Per Module & Sub-Module
  - Vessel-Level Access Control

**Status:** 📋 **Planned**

---

### **Module 8: Master Data**
**Purpose:** Reference data management

**Features:**
- CRUD Screens for:
  - Registered Owners
  - Ship Owners
  - Ship Managers
  - Suppliers
  - Equipment Types
  - Suspected Keywords (Hazard Detection)
- Used as lookup data throughout platform

**Status:** 📋 **Planned**

---

## 7. Development Roadmap

### **Phase 1: Foundation** ✅ **COMPLETE**
- [x] React + TypeScript setup
- [x] Maritime design system
- [x] Layout components (Sidebar, Header)
- [x] Admin Dashboard with KPIs
- [x] Global filters and time controls
- [x] Mock data services
- [x] Type definitions

### **Phase 2: Vessel Management** 🔄 **IN PROGRESS**
- [ ] Vessel profile CRUD
- [ ] Vessel selection context
- [ ] Profile tabs implementation
- [ ] Construction timeline UI
- [ ] IHM/SOC compliance forms

### **Phase 3: Core IHM Modules** 📋 **PLANNED**
- [ ] Decks & Materials module
- [ ] Materials Record with Part I/II/III
- [ ] Purchase Orders management
- [ ] MD/SDoC upload and validation

### **Phase 4: Workflows & Administration** 📋 **PLANNED**
- [ ] Progressive upload pipeline
- [ ] Approval workflows
- [ ] User management
- [ ] Master data CRUD

### **Phase 5: Reporting & Compliance** 📋 **PLANNED**
- [ ] IHM report generation
- [ ] Certificate management
- [ ] Inspection preparation
- [ ] Audit trail

---

## 8. Technology Stack

### **Frontend**
- React 18 with TypeScript
- Vite (Build tool)
- React Router (Navigation)
- Lucide React (Icons)
- Custom CSS (Maritime theme)

### **Future Backend** (Recommended)
- Node.js + Express or NestJS
- PostgreSQL (Relational data)
- MongoDB (Document storage for MDs/SDoCs)
- AWS S3 (File storage for GA plans, certificates)
- Redis (Caching)

### **Future Integrations**
- Email service (Supplier communication)
- PDF generation (Reports)
- OCR service (MD/SDoC parsing)
- Classification society APIs

---

## 9. Success Metrics

### **Operational Metrics**
- Time to create/update IHM (reduction from days to hours)
- Number of vessels managed per user
- MD/SDoC approval cycle time
- Inspection preparation time

### **Compliance Metrics**
- SOC renewal success rate
- Inspection pass rate
- Material traceability coverage
- Document validity rate

### **Business Metrics**
- Reduction in consultant dependency
- Cost savings per vessel
- User adoption rate
- Customer satisfaction score

---

## 10. Next Steps

### **Immediate Priorities**
1. ✅ Complete Vessel Management module
2. ✅ Implement Decks & Materials with GA plan upload
3. ✅ Build Materials Record with IHM Part I/II/III tabs
4. ✅ Create Purchase Orders module with MD/SDoC workflow

### **Questions to Clarify**
1. Do you have existing IHM data to migrate?
2. What file formats do suppliers typically provide MDs in?
3. Are there specific classification societies you need to integrate with?
4. Do you need multi-language support?
5. What are your hosting preferences (cloud vs on-premise)?

---

**Last Updated:** January 21, 2026  
**Version:** 1.0  
**Status:** Foundation Complete, Vessel Module In Progress
