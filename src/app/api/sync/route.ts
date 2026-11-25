import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServerSupabaseClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function resolveTableName(entity: string): string {
  switch (entity) {
    case 'students':
      return 'students';
    case 'marks':
      return 'assessment_records';
    case 'cocurricular':
      return 'co_curricular_grades';
    case 'calendar':
      return 'academic_calendar_events';
    case 'former_students':
      return 'former_students';
    case 'school':
      return 'schools';
    case 'achievements':
      return 'school_achievements';
    case 'faculty':
      return 'users';
    case 'tc':
      return 'transfer_certificates';
    case 'study_cert':
      return 'study_certificates';
    default:
      return entity;
  }
}

export async function GET() {
  const client = getServerSupabaseClient();
  if (!client) {
    return NextResponse.json({
      configured: false,
      message: 'Supabase URL or Key not set in environment.',
    });
  }

  try {
    const { count, error } = await client.from('schools').select('*', { count: 'exact', head: true });
    if (error) {
      return NextResponse.json({
        configured: true,
        connected: false,
        error: error.message,
        code: error.code,
      });
    }
    return NextResponse.json({
      configured: true,
      connected: true,
      schoolCount: count,
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: true,
      connected: false,
      error: err?.message || 'Connection failure',
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { operations } = body;

    if (!Array.isArray(operations)) {
      return NextResponse.json({ error: 'Operations array is required' }, { status: 400 });
    }

    const client = getServerSupabaseClient();
    const isCloudConnected = Boolean(client);
    const results = [];

    for (const op of operations) {
      try {
        if (client) {
          const tableName = resolveTableName(op.entity_type);
          if (op.operation_type === 'CREATE' || op.operation_type === 'UPDATE') {
            const { error } = await client.from(tableName).upsert(op.data);
            if (error) throw error;
          } else if (op.operation_type === 'DELETE') {
            const { error } = await client.from(tableName).delete().eq('id', op.record_id);
            if (error) throw error;
          }
        }

        results.push({
          op_id: op.op_id,
          idempotency_key: op.idempotency_key,
          status: 'SUCCESS',
          cloud_persisted: isCloudConnected,
        });
      } catch (err: any) {
        results.push({
          op_id: op.op_id,
          idempotency_key: op.idempotency_key,
          status: 'FAILED',
          error: err?.message || 'Database sync error',
          code: err?.code,
        });
      }
    }

    return NextResponse.json({
      success: results.every((r) => r.status === 'SUCCESS'),
      processed: results.length,
      isCloudConnected,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Sync processing failure' }, { status: 500 });
  }
}
