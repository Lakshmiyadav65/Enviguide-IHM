import prisma from '../config/prisma.js';

// Fields allowed in the Vessel model (prevents Prisma errors from unknown fields)
const VESSEL_FIELDS = [
  'name', 'imoNumber', 'vesselType', 'registrationNumber', 'signalLetters',
  'grossTonnage', 'deadweightTonnage', 'teuUnits', 'registeredOwner',
  'shipOwner', 'shipManager', 'fleet', 'subFleet', 'vesselClass',
  'vesselIhmClass', 'classIdNo', 'ihmClass', 'flagState', 'portOfRegistry',
  'nameOfYard', 'shipyardLocation', 'buildersUniqueId', 'keelLaidDate',
  'deliveryDate', 'ihmMethod', 'mdStandard', 'ihmReference', 'socReference',
  'socExpiryDate', 'complianceStatus', 'image',
];

function stripUnknownFields(data: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const key of VESSEL_FIELDS) {
    if (key in data && data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  }
  return cleaned;
}

export const VesselService = {
  async getAllVessels() {
    return prisma.vessel.findMany({
      include: { auditSummaries: true, decks: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getVesselById(id: string) {
    return prisma.vessel.findUnique({
      where: { id },
      include: { auditSummaries: true, decks: true },
    });
  },

  async getVesselByImo(imoNumber: string) {
    return prisma.vessel.findUnique({
      where: { imoNumber },
    });
  },

  async createVessel(data: Record<string, unknown>) {
    return prisma.vessel.create({
      data: stripUnknownFields(data) as any,
      include: { auditSummaries: true, decks: true },
    });
  },

  async updateVessel(id: string, data: Record<string, unknown>) {
    return prisma.vessel.update({
      where: { id },
      data: stripUnknownFields(data) as any,
      include: { auditSummaries: true, decks: true },
    });
  },

  async deleteVessel(id: string) {
    return prisma.vessel.delete({ where: { id } });
  },
};
