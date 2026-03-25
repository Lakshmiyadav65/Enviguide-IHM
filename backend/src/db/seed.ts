import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

const DEFAULT_PASSWORD = 'Envi123';

const users = [
  { email: 'narasimha.goggi@enviguide.com',       name: 'Narasimha Goggi',       category: 'admin',   country: 'India' },
  { email: 'hruday.murikipudi@enviguide.com',      name: 'Hruday Murikipudi',     category: 'admin',   country: 'India' },
  { email: 'saisanjan.kethamreddy@enviguide.com',   name: 'Sai Sanjan Kethamreddy', category: 'admin',   country: 'India' },
  { email: 'vishnu.simhadri@enviguide.com',         name: 'Vishnu Simhadri',       category: 'admin',   country: 'India' },
  { email: 'govardhan.kothapalli@enviguide.com',    name: 'Govardhan Kothapalli',  category: 'admin',   country: 'India' },
  { email: 'sivaprasad@enviguide.com',              name: 'Sivaprasad',            category: 'admin',   country: 'India' },
];

const vessels = [
  {
    name: 'MV Ocean Pioneer', imoNumber: '9876543', vesselType: 'Bulk Carrier',
    shipOwner: 'MARITIME SOLUTIONS', shipManager: 'OCEAN MANAGERS', registeredOwner: 'PIONEER SHIPPING',
    fleet: 'Blue Fleet', subFleet: 'Atlantic', vesselClass: 'DNV', vesselIhmClass: 'DNV',
    registrationNumber: 'REG-987', classIdNo: 'CID-111', flagState: 'Panama', portOfRegistry: 'Panama',
    nameOfYard: 'GLOBAL YARD', keelLaidDate: '2018-05-12', deliveryDate: '2020-01-01',
    grossTonnage: '35000', deadweightTonnage: '50000', teuUnits: '0',
    signalLetters: 'PION', buildersUniqueId: 'BUILD-P1',
    mdStandard: 'HKC', ihmMethod: 'NB', ihmReference: 'IHM-P-2024',
    socReference: 'SOC-998', socExpiryDate: '2025-06-15', complianceStatus: 'compliant',
  },
  {
    name: 'ACOSTA', imoNumber: '9571648', vesselType: 'Bulk Carrier',
    shipOwner: 'AQUARIUS BULKCARRIER', shipManager: 'AQUARIUS BULKCARRIER', registeredOwner: 'SCARLET STREET CORP',
    fleet: 'Fleet A', subFleet: 'Sub Fleet 1', vesselClass: 'Registro Italiano Navale', vesselIhmClass: 'Registro Italiano Navale',
    registrationNumber: 'REG-123', classIdNo: 'CID-998', flagState: 'Panama', portOfRegistry: 'Panama - 44761PEXT',
    nameOfYard: 'SHANGHAI SHIPYARD', keelLaidDate: '2011-12-27', deliveryDate: '2013-06-01',
    grossTonnage: '22414', deadweightTonnage: '34236', teuUnits: '0',
    signalLetters: '3FHM7', buildersUniqueId: 'BUILD-99',
    mdStandard: 'HKC', ihmMethod: 'NB', ihmReference: 'IHM Report: J-1109202',
    socReference: 'IHM-00670', socExpiryDate: '2028-06-29', complianceStatus: 'compliant',
  },
  {
    name: 'AFIF', imoNumber: '9308642', vesselType: 'Container Ship',
    shipOwner: 'GLOBAL SHIPPING', shipManager: 'GLOBAL MANAGERS', registeredOwner: 'OCEAN BLUE INC',
    fleet: 'Fleet B', subFleet: 'Sub Fleet 2', vesselClass: 'DNV', vesselIhmClass: 'DNV',
    registrationNumber: 'REG-456', classIdNo: 'CID-777', flagState: 'Liberia', portOfRegistry: 'Liberia',
    nameOfYard: 'HYUNDAI HEAVY', keelLaidDate: '2014-02-05', deliveryDate: '2015-08-15',
    grossTonnage: '30000', deadweightTonnage: '45000', teuUnits: '5000',
    signalLetters: 'ABCD4', buildersUniqueId: 'BUILD-45',
    mdStandard: 'EU', ihmMethod: 'ES', ihmReference: 'IHM Report: G-9922',
    socReference: 'IHM-9988', socExpiryDate: '2030-10-10', complianceStatus: 'compliant',
  },
  {
    name: 'PACIFIC HORIZON', imoNumber: '9234567', vesselType: 'Bulk Carrier',
    shipOwner: 'PACIFIC TRADING', shipManager: 'PACIFIC SHIP MGMT', registeredOwner: 'HORIZON MARITIME',
    fleet: 'Pacific', subFleet: 'North', vesselClass: 'ABS', vesselIhmClass: 'ABS',
    registrationNumber: 'REG-567', classIdNo: 'CID-555', flagState: 'Singapore', portOfRegistry: 'Singapore',
    nameOfYard: 'SINGAPORE YARD', keelLaidDate: '2008-01-15', deliveryDate: '2010-05-20',
    grossTonnage: '18000', deadweightTonnage: '28000', teuUnits: '0',
    signalLetters: 'PHOR', buildersUniqueId: 'BUILD-P5',
    mdStandard: 'HKC', ihmMethod: 'NB', ihmReference: 'IHM-PH-10',
    socReference: 'SOC-556', socExpiryDate: '2025-03-10', complianceStatus: 'warning',
  },
  {
    name: 'MV NORTH STAR', imoNumber: '9887654', vesselType: 'Ice Breaker',
    shipOwner: 'NORTHERN SHIPPING', shipManager: 'ARCTIC MGMT', registeredOwner: 'NORTH STAR AS',
    fleet: 'Arctic', subFleet: 'North', vesselClass: 'DNV', vesselIhmClass: 'DNV',
    registrationNumber: 'REG-999', classIdNo: 'CID-999', flagState: 'Norway', portOfRegistry: 'Oslo',
    nameOfYard: 'VARD YARD', keelLaidDate: '2021-01-10', deliveryDate: '2022-11-30',
    grossTonnage: '25000', deadweightTonnage: '35000', teuUnits: '0',
    signalLetters: 'NSTR', buildersUniqueId: 'B-STAR-1',
    mdStandard: 'EU', ihmMethod: 'ES', ihmReference: 'IHM-NS-01',
    socReference: 'SOC-NS-01', socExpiryDate: '2032-11-30', complianceStatus: 'compliant',
  },
];

async function seed() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // Seed users
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword },
      create: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
        category: u.category,
        status: 'active',
        country: u.country,
      },
    });
    console.log(`Seeded user: ${user.email} (${user.category})`);
  }

  // Seed vessels
  for (const v of vessels) {
    const vessel = await prisma.vessel.upsert({
      where: { imoNumber: v.imoNumber },
      update: v,
      create: v,
    });
    console.log(`Seeded vessel: ${vessel.name} (IMO ${vessel.imoNumber})`);
  }
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
