import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.post('/apply', requireAuth, async (req, res) => {
    const { nationalId, driversLicense } = req.body;
    const driverProfile = await prisma.driverProfile.create({
        data: {
            userId: req.user.id,
            nationalId,
            driversLicense,
            //status is set to default (inactive)
        },
    });

    res.status(201).json(driverProfile);
})

router.get('/pending', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const pendingDrivers = await prisma.driverProfile.findMany({
        where: { isApproved: false },
        include: { user: true },
    });
    res.status(200).json(pendingDrivers);
});

router.patch('/:id/approve', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const driverProfile = await prisma.driverProfile.update({
        where: { id: req.params.id },
        data: { isApproved: true, status: 'AVAILABLE' },
    });
    res.status(200).json(driverProfile);
});

router.patch('/:id/reject', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const driverProfile = await prisma.driverProfile.delete({
        where: { id: req.params.id },
    });
    res.status(200).json({ message: 'Driver application rejected' });
});

router.get('/me', requireAuth, async (req, res) => {
    const driverProfile = await prisma.driverProfile.findUnique({
        where: {
            userId: req.user.id,
        },
    });
    res.status(201).json(driverProfile);
})

router.patch('/me/status', requireAuth, async (req, res) => {
    const { status } = req.body;
    const driverProfile = await prisma.driverProfile.update({
        where: {
            userId: req.user.id,
        },
        data: {
            status,
        },
    });
    res.status(201).json(driverProfile);
})

export default router