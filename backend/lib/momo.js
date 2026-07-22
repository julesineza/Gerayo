// lib/momo.js
const MOMO_BASE_URL = process.env.MOMO_BASE_URL; // sandbox: https://sandbox.momodeveloper.mtn.com
const MOMO_SUBSCRIPTION_KEY = process.env.MOMO_SUBSCRIPTION_KEY;
const MOMO_API_USER = process.env.MOMO_API_USER;
const MOMO_API_KEY = process.env.MOMO_API_KEY;
const MOMO_TARGET_ENV = process.env.MOMO_TARGET_ENV || 'sandbox';

async function getMomoAccessToken() {
    const credentials = Buffer.from(`${MOMO_API_USER}:${MOMO_API_KEY}`).toString('base64');
    const res = await fetch(`${MOMO_BASE_URL}/collection/token/`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
        },
    });
    const data = await res.json();
    return data.access_token;
}

export async function requestMomoPayment({ amount, payerPhone, referenceId }) {
    const token = await getMomoAccessToken();

    const res = await fetch(`${MOMO_BASE_URL}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'X-Reference-Id': referenceId,        // must be a UUID, ties MTN's request back to your Payment.id
            'X-Target-Environment': MOMO_TARGET_ENV,
            'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: String(amount),
            currency: 'RWF',
            externalId: referenceId,
            payer: { partyIdType: 'MSISDN', partyId: payerPhone },
            payerMessage: 'Gerayo ride payment',
            payeeNote: 'Gerayo ride payment',
        }),
    });

    if (res.status !== 202) {
        const errBody = await res.text();
        throw new Error(`MoMo request failed: ${errBody}`);
    }

    // MTN doesn't return a transaction ID synchronously — it confirms
    // via a later status check or the webhook you registered.
    return { transactionId: null, referenceId };
}