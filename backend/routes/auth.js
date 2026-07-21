// routes/auth.js
import { Router } from 'express';
import { supabaseAuth } from '../lib/supabase.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { email, password, fullName, role } = req.body;

  const { data, error } = await supabaseAuth.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  await prisma.profile.create({
    data: {
      id: data.user.id,
      email,
      fullName,
      role: role ?? 'PASSENGER',
    },
  });

  res.json({ user: data.user, session: data.session });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });
  res.json({ session: data.session, user: data.user });
});

router.post('/otp/request', async (req, res) => {
  const { email } = req.body;
  const { error } = await supabaseAuth.auth.signInWithOtp({ email });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'OTP sent to email' });
});

router.post('/otp/verify', async (req, res) => {
  const { email, token } = req.body;
  const { data, error } = await supabaseAuth.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) return res.status(400).json({ error: error.message });

  await prisma.profile.upsert({
    where: { id: data.user.id },
    update: {},
    create: { id: data.user.id, email, fullName: '', role: 'PASSENGER' },
  });

  res.json({ session: data.session, user: data.user });
});

router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  const { data, error } = await supabaseAuth.auth.refreshSession({ refresh_token });
  if (error) return res.status(401).json({ error: error.message });
  res.json({ session: data.session });
});

export default router;