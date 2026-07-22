// routes/payments.js
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import prisma from '../lib/prisma.js';
import { requestMomoPayment } from '../lib/momo.js';

const router = Router();

// Create a payment for a completed trip
router.post('/trip/:tripId', requireAuth, async (req, res) => {
    const { method } = req.body; // 'MTN_MOMO' or 'CASH'
    const { tripId } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.status !== 'COMPLETED') {
        return res.status(409).json({ error: 'Trip must be completed before payment' });
    }
    if (trip.passengerId !== req.user.id) {
        return res.status(403).json({ error: 'Only the passenger can pay for this trip' });
    }

    const existing = await prisma.payment.findUnique({ where: { tripId } });
    if (existing) return res.status(409).json({ error: 'Payment already exists for this trip' });

    if (method === 'CASH') {
        // Cash is confirmed by the driver in person — mark successful immediately.
        // (You could instead leave this PENDING and add a separate
        // /payments/:id/confirm-cash route the driver calls after collecting it.)
        const payment = await prisma.payment.create({
            data: { tripId, amount: trip.estimatedFare, method: 'CASH', status: 'SUCCESSFUL' },
        });
        return res.status(201).json(payment);
    }

    if (method === 'MTN_MOMO') {
        const payment = await prisma.payment.create({
            data: { tripId, amount: trip.estimatedFare, method: 'MTN_MOMO', status: 'PENDING' },
        });

        try {
            const passenger = await prisma.user.findUnique({ where: { id: req.user.id } });
            const momoResult = await requestMomoPayment({
                amount: trip.estimatedFare,
                payerPhone: req.body.phone, // MoMo number, may differ from account email
                referenceId: payment.id,
            });

            const updated = await prisma.payment.update({
                where: { id: payment.id },
                data: { transactionId: momoResult.transactionId },
            });
            return res.status(201).json(updated);
        } catch (err) {
            await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
            return res.status(502).json({ error: 'MoMo payment request failed', detail: err.message });
        }
    }

    return res.status(400).json({ error: 'Invalid payment method' });
});

// Check payment status
router.get('/:id', requireAuth, async (req, res) => {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.status(200).json(payment);
});

// MTN MoMo calls this when the payment resolves (success or failure)
router.post('/webhook/momo', async (req, res) => {
    // No requireAuth — this is called by MTN's servers, not your users.
    // MUST verify authenticity another way (see note below) before trusting the body.
    const { referenceId, status, financialTransactionId } = req.body;

    const payment = await prisma.payment.findUnique({ where: { id: referenceId } });
    if (!payment) return res.status(404).json({ error: 'Unknown payment reference' });

    await prisma.payment.update({
        where: { id: referenceId },
        data: {
            status: status === 'SUCCESSFUL' ? 'SUCCESSFUL' : 'FAILED',
            transactionId: financialTransactionId ?? payment.transactionId,
        },
    });

    res.status(200).send('OK');
});

export default router;