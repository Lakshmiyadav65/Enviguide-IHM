# 🚢 IHM Platform - Maritime Safety & Compliance

> **A digital IHM management platform that enables shipowners to maintain accurate, compliant, and inspection-ready Inventory of Hazardous Materials throughout the entire vessel lifecycle.**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## 🌊 Overview

The **IHM Platform** is an enterprise-grade web application designed to solve the critical challenge of managing **Inventory of Hazardous Materials (IHM)** for commercial shipping vessels.

### **The Challenge**
IHM is **not a static document** — it's a **living inventory** that must continuously reflect hazardous materials onboard, their locations, and changes due to repairs, retrofits, and equipment replacement.

### **Our Solution**
Transform IHM from a manual, document-based process into a **structured, digital, and inspection-ready system**.

---

## ❌ Problem Statement

### Current Pain Points in IHM Management

- **Manual Compilation**: Supplier declarations (MDs/SDoCs) are manually collected and compiled
- **No Traceability**: Lack of connection between equipment and hazardous substances
- **Fragmented Data**: Documentation scattered across emails, PDFs, Excel sheets
- **Poor Version Control**: No systematic tracking of IHM Part I, II, and III changes
- **High Consultant Dependency**: Heavy reliance on external consultants
- **Audit Difficulties**: Challenges during PSC, Flag, and Class inspections

### Business Impact

- ⏱️ Delays in IHM certification and renewal
- ⚠️ Risk of non-compliance with ship recycling regulations
- 💰 High costs during end-of-life ship recycling
- 📉 Inability to track materials added during maintenance
- 🔍 Difficulty demonstrating compliance during inspections

---

## ✅ Solution

### What We Provide

A **vessel-centric digital platform** that:

1. **Digitizes IHM** Part I, II, and III
2. **Centralizes** all hazardous material data
3. **Links materials** to specific locations and equipment
4. **Stores and validates** Material Declarations (MDs) and Supplier Declarations (SDoCs)
5. **Enables continuous updates** after repairs or modifications
6. **Generates inspection-ready** IHM reports

### Traceability Chain

```
Purchase Order → Supplier → MD/SDoC → Material → Equipment → Deck/Location → IHM Part → Certificate
```

---

## ✨ Features

### ✅ **Implemented**

#### **Admin Dashboard**
- 📊 Real-time KPI cards (Users, Purchase Orders, Vessels)
- 🔍 Global filters (Ship Owner, Manager, Supplier, Vessel)
- 📅 Time period controls (Today, Monthly, Yearly, Quarterly)
- 📋 Operational overview table grouped by ship owner
- ⚠️ SOC expiry alerts panel
- 🎨 Maritime-inspired light blue design

#### **Layout & Navigation**
- 🧭 Fixed sidebar with vessel list
- 🚢 Vessel context display in header
- 🔔 Notification system
- 👤 User profile menu
- 📱 Responsive design

### 🔄 **In Progress**

#### **Vessel Management Module**
- Vessel profile CRUD operations
- Construction timeline visualization
- IHM & SOC compliance configuration
- Vessel-based tab navigation

### 📋 **Planned**

- **Decks & Materials**: GA plan upload, spatial material mapping
- **Materials Record**: Central repository with IHM Part I/II/III tabs
- **Purchase Orders**: Supplier-grouped PO management with MD/SDoC workflow
- **Administration**: Progressive upload pipeline with approval workflows
- **Users & Security**: Role-based access control
- **Master Data**: CRUD screens for reference data
- **Reports & Certificates**: IHM report generation and certificate management

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Custom CSS** - Maritime-themed design system

### **Recommended Backend** (Future)
- **Node.js + Express/NestJS** - API server
- **PostgreSQL** - Relational data
- **MongoDB** - Document storage
- **AWS S3** - File storage
- **Redis** - Caching

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Edge)

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd IHM

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at **http://localhost:5173/**

### **Build for Production**

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
IHM/
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar, Header, Layout
│   │   ├── dashboard/       # Dashboard components
│   │   ├── vessels/         # Vessel components
│   │   └── common/          # Shared components
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Admin dashboard
│   │   └── Vessels.tsx      # Vessel management
│   ├── services/            # API services & mock data
│   │   └── mockData.ts      # Development data
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # Core type definitions
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── styles/              # Global styles
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global CSS & design system
├── public/                  # Static assets
├── PLATFORM_ARCHITECTURE.md # Technical documentation
├── README.md                # This file
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite config
```

---

## 💻 Development

### **Available Scripts**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### **Design System**

The platform uses a **maritime-inspired design system** with:

- **Primary Color**: Light Blue (`#0891b2`) - Ocean/water theme
- **Status Colors**:
  - 🟢 Green (`#10b981`) - Compliant/Approved
  - 🔴 Red (`#ef4444`) - Expired/Risk
  - 🟠 Orange (`#f59e0b`) - Pending/Attention
- **Typography**: Inter font family
- **Components**: Rounded cards, soft shadows, smooth animations

### **Key Principles**

1. **Vessel-Centric**: Every module depends on selected vessel context
2. **Progressive Disclosure**: Show only what's needed
3. **Compliance-First**: Structured according to IHM regulatory formats
4. **Traceability**: Full audit trail for all changes
5. **User-Friendly**: Designed for non-technical users

---

## 🗺️ Roadmap

### **Phase 1: Foundation** ✅ **COMPLETE**
- [x] React + TypeScript setup
- [x] Maritime design system
- [x] Layout components
- [x] Admin Dashboard
- [x] Global filters
- [x] Mock data services

### **Phase 2: Vessel Management** 🔄 **IN PROGRESS**
- [ ] Vessel profile CRUD
- [ ] Vessel selection context
- [ ] Profile tabs
- [ ] Construction timeline
- [ ] IHM/SOC compliance forms

### **Phase 3: Core IHM Modules** 📋 **Q2 2026**
- [ ] Decks & Materials
- [ ] Materials Record
- [ ] Purchase Orders
- [ ] MD/SDoC management

### **Phase 4: Workflows** 📋 **Q3 2026**
- [ ] Upload pipeline
- [ ] Approval workflows
- [ ] User management
- [ ] Master data

### **Phase 5: Reporting** 📋 **Q4 2026**
- [ ] IHM report generation
- [ ] Certificate management
- [ ] Inspection preparation

---

## 🎯 Target Audience

### **Primary Users**
- Ship Owners
- Ship Operators
- Fleet Managers
- Technical Managers
- Marine Superintendents

### **Secondary Users**
- Shipyards & Repair Yards
- IHM Consultants
- Classification Societies
- Ship Recycling Facilities
- Flag/Port State Inspectors

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Contact

For questions, support, or business inquiries, please contact:
- **Email**: [Your Email]
- **Website**: [Your Website]

---

## 🙏 Acknowledgments

Built with modern web technologies to solve real-world maritime compliance challenges.

**Positioning Statement:**  
*We are building a digital IHM management platform that enables shipowners to maintain accurate, compliant, and inspection-ready Inventory of Hazardous Materials throughout the entire vessel lifecycle.*

---

**Made with ⚓ for Maritime Safety**
