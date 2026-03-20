import prisma from '../config/prisma.js';

export const VesselService = {
    async getAllVessels() {
        return await prisma.vessel.findMany({
            include: {
                audits: true,
                decks: true
            }
        });
    },

    async getVesselById(id: string) {
        return await prisma.vessel.findUnique({
            where: { id },
            include: {
                audits: true,
                decks: true
            }
        });
    },

    async createVessel(data: any) {
        return await prisma.vessel.create({
            data
        });
    },

    async updateVessel(id: string, data: any) {
        return await prisma.vessel.update({
            where: { id },
            data
        });
    },

    async deleteVessel(id: string) {
        return await prisma.vessel.delete({
            where: { id }
        });
    }
};
