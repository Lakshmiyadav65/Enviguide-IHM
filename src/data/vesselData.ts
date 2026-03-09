import vesselDefault from '../assets/images/vessel_default.jpg';

export interface VesselData {
    name: string;
    shipOwner: string;
    fleet: string;
    subFleet: string;
    vesselClass: string;
    imoNo: string;
    registrationNumber: string;
    deliveryDate: string;
    deadweightTonnage: string;
    portOfRegistry: string;
    socExpiryDate: string;
    type: string;
    shipManager: string;
    registeredOwner: string;
    flagState: string;
    vesselIhmClass: string;
    classIdNo: string;
    nameOfYard: string;
    keelLaidDate: string;
    grossTonnage: string;
    teuUnits: string;
    ihmReference: string;
    signalLetters: string;
    buildersUniqueId: string;
    mdStandard: string;
    ihmMethod: string;
    socReference: string;
    image: string;
}

export const INITIAL_VESSELS: VesselData[] = [
    {
        name: 'MV Ocean Pioneer',
        shipOwner: 'MARITIME SOLUTIONS',
        fleet: 'Blue Fleet',
        subFleet: 'Atlantic',
        vesselClass: 'DNV',
        imoNo: '9876543',
        registrationNumber: 'REG-987',
        deliveryDate: '2020-01-01',
        deadweightTonnage: '50000',
        portOfRegistry: 'Panama',
        socExpiryDate: '2025-06-15',
        type: 'Bulk Carrier',
        shipManager: 'OCEAN MANAGERS',
        registeredOwner: 'PIONEER SHIPPING',
        flagState: 'Panama',
        vesselIhmClass: 'DNV',
        classIdNo: 'CID-111',
        nameOfYard: 'GLOBAL YARD',
        keelLaidDate: '2018-05-12',
        grossTonnage: '35000',
        teuUnits: '0',
        ihmReference: 'IHM-P-2024',
        signalLetters: 'PION',
        buildersUniqueId: 'BUILD-P1',
        mdStandard: 'HKC',
        ihmMethod: 'NB',
        socReference: 'SOC-998',
        image: vesselDefault
    },
    {
        name: 'ACOSTA',
        shipOwner: 'AQUARIUS BULKCARRIER',
        fleet: 'Fleet A',
        subFleet: 'Sub Fleet 1',
        vesselClass: 'Registro Italiano Navale',
        imoNo: '9571648',
        registrationNumber: 'REG-123',
        deliveryDate: '2013-06-01',
        deadweightTonnage: '34236',
        portOfRegistry: 'Panama - 44761PEXT',
        socExpiryDate: '2028-06-29',
        type: 'Bulk Carrier',
        shipManager: 'AQUARIUS BULKCARRIER',
        registeredOwner: 'SCARLET STREET CORP',
        flagState: 'Panama',
        vesselIhmClass: 'Registro Italiano Navale',
        classIdNo: 'CID-998',
        nameOfYard: 'SHANGHAI SHIPYARD',
        keelLaidDate: '2011-12-27',
        grossTonnage: '22414',
        teuUnits: '0',
        ihmReference: 'IHM Report: J-1109202',
        signalLetters: '3FHM7',
        buildersUniqueId: 'BUILD-99',
        mdStandard: 'HKC',
        ihmMethod: 'NB',
        socReference: 'IHM-00670',
        image: vesselDefault
    },
    {
        name: 'AFIF',
        shipOwner: 'GLOBAL SHIPPING',
        fleet: 'Fleet B',
        subFleet: 'Sub Fleet 2',
        vesselClass: 'DNV',
        imoNo: '9308642',
        registrationNumber: 'REG-456',
        deliveryDate: '2015-08-15',
        deadweightTonnage: '45000',
        portOfRegistry: 'Liberia',
        socExpiryDate: '2030-10-10',
        type: 'Container Ship',
        shipManager: 'GLOBAL MANAGERS',
        registeredOwner: 'OCEAN BLUE INC',
        flagState: 'Liberia',
        vesselIhmClass: 'DNV',
        classIdNo: 'CID-777',
        nameOfYard: 'HYUNDAI HEAVY',
        keelLaidDate: '2014-02-05',
        grossTonnage: '30000',
        teuUnits: '5000',
        ihmReference: 'IHM Report: G-9922',
        signalLetters: 'ABCD4',
        buildersUniqueId: 'BUILD-45',
        mdStandard: 'EU',
        ihmMethod: 'ES',
        socReference: 'IHM-9988',
        image: vesselDefault
    },
    {
        name: 'PACIFIC HORIZON',
        shipOwner: 'PACIFIC TRADING',
        fleet: 'Pacific',
        subFleet: 'North',
        vesselClass: 'ABS',
        imoNo: '9234567',
        registrationNumber: 'REG-567',
        deliveryDate: '2010-05-20',
        deadweightTonnage: '28000',
        portOfRegistry: 'Singapore',
        socExpiryDate: '2025-03-10',
        type: 'Bulk Carrier',
        shipManager: 'PACIFIC SHIP MGMT',
        registeredOwner: 'HORIZON MARITIME',
        flagState: 'Singapore',
        vesselIhmClass: 'ABS',
        classIdNo: 'CID-555',
        nameOfYard: 'SINGAPORE YARD',
        keelLaidDate: '2008-01-15',
        grossTonnage: '18000',
        teuUnits: '0',
        ihmReference: 'IHM-PH-10',
        signalLetters: 'PHOR',
        buildersUniqueId: 'BUILD-P5',
        mdStandard: 'HKC',
        ihmMethod: 'NB',
        socReference: 'SOC-556',
        image: vesselDefault
    },
    {
        name: 'MV NORTH STAR',
        shipOwner: 'NORTHERN SHIPPING',
        fleet: 'Arctic',
        subFleet: 'North',
        vesselClass: 'DNV',
        imoNo: '9876543',
        registrationNumber: 'REG-999',
        deliveryDate: '2022-11-30',
        deadweightTonnage: '35000',
        portOfRegistry: 'Oslo',
        socExpiryDate: '2032-11-30',
        type: 'Ice Breaker',
        shipManager: 'ARCTIC MGMT',
        registeredOwner: 'NORTH STAR AS',
        flagState: 'Norway',
        vesselIhmClass: 'DNV',
        classIdNo: 'CID-999',
        nameOfYard: 'VARD YARD',
        keelLaidDate: '2021-01-10',
        grossTonnage: '25000',
        teuUnits: '0',
        ihmReference: 'IHM-NS-01',
        signalLetters: 'NSTR',
        buildersUniqueId: 'B-STAR-1',
        mdStandard: 'EU',
        ihmMethod: 'ES',
        socReference: 'SOC-NS-01',
        image: vesselDefault
    },
];
