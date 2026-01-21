import { Vessel, DashboardStats, SOCAlert, PurchaseOrder } from '../types';

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
