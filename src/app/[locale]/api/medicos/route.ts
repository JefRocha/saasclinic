export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

import { db } from '@/db';
import { medicosTable } from '@/models/Schema';
import { eq, and, ilike, sql } from 'drizzle-orm';

import { upsertMedicoSchema, searchMedicosSchema } from '@/actions/upsert-medico/schema';
import { buildAbility, Action } from '@/lib/ability';







