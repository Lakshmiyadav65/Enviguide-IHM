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
  /** Get all vessels belonging to a specific user */
  async getVesselsByUser(userId: string) {
    return prisma.vessel.findMany({
      where: { createdById: userId },
      include: { auditSummaries: true, decks: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Get a single vessel only if it belongs to the user */
  async getVesselByIdForUser(id: string, userId: string) {
    return prisma.vessel.findFirst({
      where: { id, createdById: userId },
      include: { auditSummaries: true, decks: true },
    });
  },

  /** Check if IMO already exists (globally unique) */
  async getVesselByImo(imoNumber: string) {
    return prisma.vessel.findUnique({
      where: { imoNumber },
    });
  },

  /** Create a vessel owned by the user */
  async createVessel(data: Record<string, unknown>, userId: string) {
    const cleaned = stripUnknownFields(data);
    return prisma.vessel.create({
      data: { ...cleaned, createdById: userId } as any,
      include: { auditSummaries: true, decks: true },
    });
  },

  /** Update a vessel (caller must verify ownership first) */
  async updateVessel(id: string, data: Record<string, unknown>) {
    return prisma.vessel.update({
      where: { id },
      data: stripUnknownFields(data) as any,
      include: { auditSummaries: true, decks: true },
    });
  },

  /** Delete a vessel (caller must verify ownership first) */
  async deleteVessel(id: string) {
    return prisma.vessel.delete({ where: { id } });
  },
};
