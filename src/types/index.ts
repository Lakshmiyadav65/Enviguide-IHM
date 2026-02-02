// ========================================
// IHM Platform - Type Definitions
// ========================================

export interface Vessel {
    id: string;
    name: string;
    imoNumber: string;
    vesselType: string;
    registrationNumber?: string;
    signalLetters?: string;
    grossTonnage?: string;
    deadweightTonnage?: string;
    teuUnits?: string;

    // Ownership
    registeredOwner: string;
    shipOwner: string;
    shipManager: string;
    fleet?: string;

    // Classification
    vesselClass?: string;
    ihmClass?: string;
    flagState: string;
    portOfRegistry?: string;

    // Construction
    shipyardName?: string;
    shipyardLocation?: string;
    builderUniqueId?: string;
    keelLaidDate?: string;
    deliveryDate?: string;

    // IHM & SOC
    ihmMethod: 'EU' | 'HKC';
    mdStandard: 'EU' | 'HKC';
    initialIhmReference?: string;
    socReference?: string;
    socExpiryDate: string;

    // Status
    complianceStatus: 'compliant' | 'warning' | 'expired';
    imageUrl?: string;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    vesselId: string;
    supplierId: string;
    orderDate: string;
    totalLineItems: number;
    pendingMDs: number;
    receivedMDs: number;
    hmRed: number;
    hmGreen: number;
    status: 'responsive' | 'non-responsive' | 'pending';
}

export interface Material {
    id: string;
    name: string;
    vesselId?: string; // Optional for mock data flexibility
    ihmPart: string; // Changed to string to match 'PART I', 'PART II' usage or mapping
    category: 'hazard' | 'safe' | 'warning';
    completion: number;
    status: string; // Generalized status
    thresholdMessage?: string;
    thresholdType?: 'limit-exceeded' | 'safe' | 'trace';
    thresholdValue?: number;
    zone?: string;
    deckCoordinates?: { x: number; y: number };

    // Legacy/Back-end fields (keeping them optional/available)
    hazardType?: string;
    quantity?: number;
    unit?: string;
    deckId?: string;
    compartment?: string;
    equipment?: string;
    mdStatus?: 'pending' | 'received' | 'approved';
}

export interface Deck {
    id: string;
    vesselId: string;
    name: string;
    level: number;
    gaPlanUrl?: string;
    materials: Material[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    country?: string;
    status: 'active' | 'inactive';
    category: 'admin' | 'manager' | 'viewer';
    lastActivity?: string;
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    country?: string;
    status: 'active' | 'inactive';
}

export interface ShipOwner {
    id: string;
    name: string;
    code: string;
    vessels: Vessel[];
}

export interface DashboardStats {
    users: {
        newRegistrations: number;
        ihmRegistrations: number;
        inactiveUsers: number;
        trend: number;
    };
    purchaseOrders: {
        totalLineItems: number;
        pendingMDs: number;
        receivedMDs: number;
        hmRed: number;
        hmGreen: number;
        trend: number;
    };
    vessels: {
        newOnboarded: number;
        itemsMovedFromDeck: number;
        itemsMovedAshore: number;
        socExpired: number;
    };
}

export interface SOCAlert {
    vesselId: string;
    vesselName: string;
    imoNumber: string;
    expiryDate: string;
    daysUntilExpiry: number;
    status: 'expired' | 'expiring-soon';
}

export interface GlobalFilters {
    shipOwner?: string;
    shipManager?: string;
    supplier?: string;
    vessel?: string;
    timePeriod?: 'today' | 'monthly' | 'yearly';
    quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    year?: number;
}

export interface Project {
    id: string;
    vesselId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate?: string;
    status: 'active' | 'completed' | 'on-hold';
}

export interface Document {
    id: string;
    vesselId: string;
    name: string;
    type: 'certificate' | 'md' | 'sdoc' | 'report' | 'other';
    uploadDate: string;
    fileUrl: string;
    status: 'valid' | 'expired' | 'pending-review';
}

export interface Certificate {
    id: string;
    vesselId: string;
    type: 'IHM' | 'SOC' | 'other';
    reference: string;
    issueDate: string;
    expiryDate: string;
    issuingAuthority: string;
    status: 'valid' | 'expired' | 'expiring-soon';
}
