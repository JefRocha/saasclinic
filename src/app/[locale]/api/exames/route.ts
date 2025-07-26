export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

import { db } from '@/db';
import { examesTable } from '@/models/Schema';
import { eq, and, ilike, sql, or } from 'drizzle-orm';

import { upsertExameSchema, searchExamesSchema } from '@/actions/upsert-exame/schema';
import { buildAbility, Action } from '@/lib/ability';







