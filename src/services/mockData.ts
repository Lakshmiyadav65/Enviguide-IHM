import type { Vessel, DashboardStats, SOCAlert, PurchaseOrder, Material, Deck } from '../types/index';

// Mock Vessels Data
export const mockVessels: Vessel[] = [
    {
        id: '1',
        name: 'Maersk Sealand',
        imoNumber: '9234567',
        vesselType: 'Container Ship',
        registrationNumber: 'DK-2024-567',
        signalLetters: 'OXDF2',
        grossTonnage: '171,000 GT',
        deadweightTonnage: '195,000 DWT',
        teuUnits: '18,270 TEU',
        registeredOwner: 'Maersk Line A/S',
        shipOwner: 'Maersk Line',
        shipManager: 'Anglo-Eastern Ship Management',
        fleet: 'Maersk Asia-Pacific Fleet',
        vesselClass: 'DNV GL',
        ihmClass: 'Class A - Full Compliance',
        flagState: 'Denmark',
        portOfRegistry: 'Copenhagen',
        shipyardName: 'Daewoo Shipbuilding & Marine Engineering',
        shipyardLocation: 'Geoje, South Korea',
        builderUniqueId: 'DSME-2018-042',
        keelLaidDate: '2018-03-15',
        deliveryDate: '2019-11-20',
        ihmMethod: 'EU',
        mdStandard: 'EU',
        initialIhmReference: 'IHM-MS-2019-001',
        socReference: 'SOC-DNV-2024-567',
        socExpiryDate: '2026-12-15',
        complianceStatus: 'compliant',
        imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop'
    },
    {
        id: '2',
        name: 'Maersk Tigris',
        imoNumber: '9345678',
        vesselType: 'Container Ship',
        registeredOwner: 'Maersk Line A/S',
        shipOwner: 'Maersk Line',
        shipManager: 'V.Ships',
        flagState: 'Denmark',
        ihmMethod: 'EU',
        mdStandard: 'EU',
        socExpiryDate: '2027-03-20',
        complianceStatus: 'compliant'
    },
    {
        id: '3',
        name: 'Maersk Elba',
        imoNumber: '9456789',
        vesselType: 'Container Ship',
        registeredOwner: 'Maersk Line A/S',
        shipOwner: 'Maersk Line',
        shipManager: 'Anglo-Eastern Ship Management',
        flagState: 'Denmark',
        ihmMethod: 'EU',
        mdStandard: 'EU',
        socExpiryDate: '2026-01-06',
        complianceStatus: 'expired'
    },
    {
        id: '4',
        name: 'MSC Gülsün',
        imoNumber: '9839450',
        vesselType: 'Container Ship',
        registeredOwner: 'MSC Mediterranean Shipping',
        shipOwner: 'Mediterranean Shipping Company',
        shipManager: 'Columbia Shipmanagement',
        flagState: 'Panama',
        ihmMethod: 'HKC',
        mdStandard: 'HKC',
        socExpiryDate: '2026-02-02',
        complianceStatus: 'warning'
    },
    {
        id: '5',
        name: 'MSC Mina',
        imoNumber: '9839451',
        vesselType: 'Container Ship',
        registeredOwner: 'MSC Mediterranean Shipping',
        shipOwner: 'Mediterranean Shipping Company',
        shipManager: 'Thome Ship Management',
        flagState: 'Panama',
        ihmMethod: 'HKC',
        mdStandard: 'HKC',
        socExpiryDate: '2027-06-15',
        complianceStatus: 'compliant'
    }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
    users: {
        newRegistrations: 248,
        ihmRegistrations: 1842,
        inactiveUsers: 127,
        trend: 12
    },
    purchaseOrders: {
        totalLineItems: 3456,
        pendingMDs: 89,
        receivedMDs: 3367,
        hmRed: 142,
        hmGreen: 3225,
        trend: 8
    },
    vessels: {
        newOnboarded: 12,
        itemsMovedFromDeck: 456,
        itemsMovedAshore: 234,
        socExpired: 5
    }
};

// Mock SOC Alerts
export const mockSOCAlerts: SOCAlert[] = [
    {
        vesselId: '3',
        vesselName: 'Maersk Elba',
        imoNumber: 'IMO 9456789',
        expiryDate: '2026-01-06',
        daysUntilExpiry: -15,
        status: 'expired'
    },
    {
        vesselId: '6',
        vesselName: 'CMA CGM Antoine De Saint Exupery',
        imoNumber: 'IMO 9454436',
        expiryDate: '2026-01-13',
        daysUntilExpiry: -8,
        status: 'expired'
    },
    {
        vesselId: '4',
        vesselName: 'MSC Gülsün',
        imoNumber: 'IMO 9839450',
        expiryDate: '2026-02-02',
        daysUntilExpiry: 12,
        status: 'expiring-soon'
    },
    {
        vesselId: '7',
        vesselName: 'Ever Given',
        imoNumber: 'IMO 9811000',
        expiryDate: '2026-02-08',
        daysUntilExpiry: 18,
        status: 'expiring-soon'
    },
    {
        vesselId: '8',
        vesselName: 'OOCL Hong Kong',
        imoNumber: 'IMO 9714335',
        expiryDate: '2026-01-18',
        daysUntilExpiry: -3,
        status: 'expired'
    }
];

// Mock Purchase Orders
export const mockPurchaseOrders: PurchaseOrder[] = [
    {
        id: '1',
        poNumber: 'PO-2024-001',
        vesselId: '1',
        supplierId: 'SUP-001',
        orderDate: '2024-11-15',
        totalLineItems: 342,
        pendingMDs: 12,
        receivedMDs: 330,
        hmRed: 15,
        hmGreen: 327,
        status: 'responsive'
    },
    {
        id: '2',
        poNumber: 'PO-2024-002',
        vesselId: '2',
        supplierId: 'SUP-002',
        orderDate: '2024-12-01',
        totalLineItems: 267,
        pendingMDs: 5,
        receivedMDs: 262,
        hmRed: 8,
        hmGreen: 259,
        status: 'responsive'
    },
    {
        id: '3',
        poNumber: 'PO-2024-003',
        vesselId: '3',
        supplierId: 'SUP-001',
        orderDate: '2024-10-20',
        totalLineItems: 489,
        pendingMDs: 23,
        receivedMDs: 466,
        hmRed: 45,
        hmGreen: 444,
        status: 'non-responsive'
    }
];

export const mockMaterials: Material[] = [
    {
        id: 'HAZ-901-ASB',
        name: 'Asbestos Gasket',
        ihmPart: 'PART I',
        category: 'hazard',
        completion: 65,
        status: 'In Progress',
        thresholdMessage: 'ABOVE LIMIT (0.1%)',
        thresholdType: 'limit-exceeded',
        zone: 'Engine Room',
        thresholdValue: 0.12
    },
    {
        id: 'HAZ-442-PB',
        name: 'Lead-based Paint',
        ihmPart: 'PART I',
        category: 'safe',
        completion: 100,
        status: 'Certified',
        thresholdMessage: 'Below Limit',
        thresholdType: 'safe',
        zone: 'Hull',
        thresholdValue: 0.02
    },
    {
        id: 'HAZ-105-PCB',
        name: 'PCBs (Lubricants)',
        ihmPart: 'PART II',
        category: 'warning',
        completion: 20,
        status: 'Pending Survey',
        thresholdMessage: 'Trace Amount',
        thresholdType: 'trace',
        zone: 'Pump Room',
        thresholdValue: 0.05
    },
    {
        id: 'HAZ-202-ODS',
        name: 'Ozone Depleting Substances',
        ihmPart: 'PART I',
        category: 'hazard',
        completion: 45,
        status: 'Review Needed',
        thresholdMessage: 'POTENTIAL RISK',
        thresholdType: 'limit-exceeded',
        zone: 'Accomodation',
        thresholdValue: 0.8
    },
    {
        id: 'HAZ-550-PFOS',
        name: 'PFOS Connections',
        ihmPart: 'PART I',
        category: 'warning',
        completion: 80,
        status: 'Documentation',
        thresholdMessage: 'Within Range',
        thresholdType: 'trace',
        zone: 'Deck',
        thresholdValue: 0.08
    },
    {
        id: 'MAT-101-GEN',
        name: 'General Insulation',
        ihmPart: 'PART III',
        category: 'safe',
        completion: 100,
        status: 'Verified',
        thresholdMessage: 'Non-Hazardous',
        thresholdType: 'safe',
        zone: 'Engine Room',
        thresholdValue: 0.0
    },
    { id: 'HAZ-108-HG', name: 'Mercury Compounds', ihmPart: 'PART I', category: 'hazard', completion: 12, status: 'In Progress', thresholdMessage: 'Detected', thresholdType: 'limit-exceeded', zone: 'Engine Room', thresholdValue: 0.9 },
    { id: 'HAZ-215-CAD', name: 'Cadmium Plating', ihmPart: 'PART I', category: 'warning', completion: 55, status: 'Review Needed', thresholdMessage: 'Near Limit', thresholdType: 'trace', zone: 'Hull', thresholdValue: 0.09 },
    { id: 'HAZ-303-CR6', name: 'Hexavalent Chromium', ihmPart: 'PART I', category: 'safe', completion: 100, status: 'Certified', thresholdMessage: 'Below Limit', thresholdType: 'safe', zone: 'Deck', thresholdValue: 0.01 },
    { id: 'HAZ-412-PBB', name: 'Polybrominated Biphenyls', ihmPart: 'PART I', category: 'hazard', completion: 0, status: 'Pending Survey', thresholdMessage: 'Unknown', thresholdType: 'limit-exceeded', zone: 'Accomodation', thresholdValue: 0.5 },
    { id: 'HAZ-612-PB', name: 'Lead Storage Battery', ihmPart: 'PART II', category: 'hazard', completion: 30, status: 'In Progress', thresholdMessage: '150mg/kg', thresholdType: 'limit-exceeded', zone: 'Engine Room', thresholdValue: 0.15 },
    { id: 'MAT-205-PVC', name: 'Polyvinyl Chloride', ihmPart: 'PART III', category: 'safe', completion: 100, status: 'Certified', thresholdMessage: 'Non-Hazardous', thresholdType: 'safe', zone: 'Accomodation', thresholdValue: 0.0 },
    { id: 'HAZ-711-TBT', name: 'Tributyltin Compounds', ihmPart: 'PART I', category: 'hazard', completion: 10, status: 'Review Needed', thresholdMessage: 'Detected', thresholdType: 'limit-exceeded', zone: 'Hull', thresholdValue: 0.88 },
    { id: 'HAZ-812-CN', name: 'Cyanide Compounds', ihmPart: 'PART II', category: 'warning', completion: 45, status: 'In Progress', thresholdMessage: 'Trace', thresholdType: 'trace', zone: 'Pump Room', thresholdValue: 0.04 },
    { id: 'MAT-312-STL', name: 'Stainless Steel Fitting', ihmPart: 'PART III', category: 'safe', completion: 100, status: 'Verified', thresholdMessage: 'Safe', thresholdType: 'safe', zone: 'Deck', thresholdValue: 0.0 },
    { id: 'HAZ-915-RAD', name: 'Radioactive Substances', ihmPart: 'PART I', category: 'hazard', completion: 5, status: 'Critical', thresholdMessage: 'HIGH LEVEL', thresholdType: 'limit-exceeded', zone: 'Engine Room', thresholdValue: 1.0 },
    { id: 'HAZ-101-SCCP', name: 'SCCPs (Short Chain Chlorinated Paraffins)', ihmPart: 'PART I', category: 'warning', completion: 60, status: 'Verified', thresholdMessage: '0.01%', thresholdType: 'trace', zone: 'Deck', thresholdValue: 0.01 },
    { id: 'HAZ-122-HBCDD', name: 'HBCDD (Polystyrene)', ihmPart: 'PART I', category: 'hazard', completion: 25, status: 'In Progress', thresholdMessage: 'Detected', thresholdType: 'limit-exceeded', zone: 'Accomodation', thresholdValue: 0.45 },
    { id: 'MAT-442-OP', name: 'Optical Cable', ihmPart: 'PART III', category: 'safe', completion: 100, status: 'Certified', thresholdMessage: 'Safe', thresholdType: 'safe', zone: 'Bridge', thresholdValue: 0.0 },
    { id: 'HAZ-552-FR', name: 'Fire Retardant Panels', ihmPart: 'PART I', category: 'warning', completion: 75, status: 'Verified', thresholdMessage: 'Trace', thresholdType: 'trace', zone: 'Accomodation', thresholdValue: 0.05 }
];

export const mockDecks: Deck[] = [
    {
        id: 'deck-001',
        vesselId: '1',
        name: 'Navigation Bridge Deck',
        level: 5,
        gaPlanUrl: 'https://images.unsplash.com/photo-1597423244036-ef5020e83f3c?auto=format&fit=crop&q=80&w=1600',
        materials: []
    },
    {
        id: 'deck-002',
        vesselId: '1',
        name: 'Upper Deck',
        level: 4,
        gaPlanUrl: 'https://images.unsplash.com/photo-1581093588402-4857474d5f04?auto=format&fit=crop&q=80&w=1600',
        materials: []
    },
    {
        id: 'deck-003',
        vesselId: '1',
        name: 'Main Deck',
        level: 3,
        materials: []
    },
    {
        id: 'deck-004',
        vesselId: '1',
        name: 'Engine Room Top',
        level: 2,
        materials: []
    }
];
