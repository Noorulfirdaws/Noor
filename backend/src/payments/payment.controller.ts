import { Request, Response } from 'express';
import {
  verifyWaafiSignature,
  verifyDmoneySignature,
  isTransactionProcessed,
  recordTransaction,
  applyPaymentToTrip,
  getUserTransactions,
  getAllTransactions,
} from './payment.service';
import { AuthRequest } from '../auth/auth.middleware';

// ── WAAFI Webhook ──────────────────────────────────────────────────────────────
export const handleWaafiWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-waafi-signature'] as string;
  const { transactionId, tripId, userId, amount, currency = 'DJF', purpose, status } = req.body;

  if (!signature) {
    return res.status(401).json({ error: 'Signature WAAFI manquante.' });
  }

  if (!verifyWaafiSignature(req.body, signature)) {
    console.warn(`[WAAFI] Signature invalide — IP: ${req.ip} TX: ${transactionId}`);
    return res.status(401).json({ error: 'Signature invalide. Tentative tracée.' });
  }

  if (!transactionId || !userId || !amount) {
    return res.status(400).json({ error: 'Payload incomplet.' });
  }

  // Anti-replay
  if (await isTransactionProcessed(transactionId)) {
    return res.status(409).json({ error: 'Transaction déjà traitée.' });
  }

  try {
    const tx = await recordTransaction({
      tripId,
      userId,
      provider: 'waafi',
      providerTransactionId: transactionId,
      amount: parseFloat(amount),
      currency,
      purpose: purpose || 'deposit',
      status: status === 'SUCCESS' ? 'confirmed' : 'failed',
      rawPayload: req.body,
    });

    if (status === 'SUCCESS' && tripId) {
      await applyPaymentToTrip(tripId, purpose || 'deposit', parseFloat(amount));
    }

    return res.status(200).json({ status: 'REÇU', transactionId: tx.id });
  } catch (err: any) {
    console.error('[WAAFI] Erreur traitement:', err.message);
    return res.status(500).json({ error: 'Erreur interne sécurisée.' });
  }
};

// ── D-Money Webhook ────────────────────────────────────────────────────────────
export const handleDmoneyWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-dmoney-signature'] as string;
  const { transactionId, tripId, userId, amount, currency = 'DJF', purpose, status } = req.body;

  if (!signature) {
    return res.status(401).json({ error: 'Signature D-Money manquante.' });
  }

  if (!verifyDmoneySignature(req.body, signature)) {
    console.warn(`[DMONEY] Signature invalide — IP: ${req.ip} TX: ${transactionId}`);
    return res.status(401).json({ error: 'Signature invalide. Tentative tracée.' });
  }

  if (!transactionId || !userId || !amount) {
    return res.status(400).json({ error: 'Payload incomplet.' });
  }

  if (await isTransactionProcessed(transactionId)) {
    return res.status(409).json({ error: 'Transaction déjà traitée.' });
  }

  try {
    const tx = await recordTransaction({
      tripId,
      userId,
      provider: 'dmoney',
      providerTransactionId: transactionId,
      amount: parseFloat(amount),
      currency,
      purpose: purpose || 'deposit',
      status: status === 'SUCCESS' ? 'confirmed' : 'failed',
      rawPayload: req.body,
    });

    if (status === 'SUCCESS' && tripId) {
      await applyPaymentToTrip(tripId, purpose || 'deposit', parseFloat(amount));
    }

    return res.status(200).json({ status: 'REÇU', transactionId: tx.id });
  } catch (err: any) {
    console.error('[DMONEY] Erreur traitement:', err.message);
    return res.status(500).json({ error: 'Erreur interne sécurisée.' });
  }
};

// ── User: get own transaction history ─────────────────────────────────────────
export const getMyTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await getUserTransactions(req.user!.id);
    return res.status(200).json({ transactions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// ── Admin: all transactions ────────────────────────────────────────────────────
export const getAdminTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await getAllTransactions();
    return res.status(200).json({ transactions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
