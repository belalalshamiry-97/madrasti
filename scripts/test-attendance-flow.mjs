import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          if (!process.env[key] && val) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnv();

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testAttendanceFlow() {
  console.log('=== Testing Attendance Lifecycle in Supabase ===');

  // 1. Get class_subject
  const { data: cs, error: csErr } = await adminClient.from('class_subjects').select('id, teacher_id').limit(1).single();
  if (csErr || !cs) {
    console.error('No class_subject found:', csErr);
    process.exit(1);
  }

  // 2. Get student profile
  const { data: student, error: stErr } = await adminClient.from('profiles').select('id, full_name').eq('role', 'STUDENT').limit(1).single();
  if (stErr || !student) {
    console.error('No student found:', stErr);
    process.exit(1);
  }

  // 3. Record attendance
  const today = '2026-11-23';
  const { data: record, error: recErr } = await adminClient.from('attendance_records').insert({
    student_id: student.id,
    class_subject_id: cs.id,
    attendance_date: today,
    status: 'present',
    notes: 'حاضر في الموعد ومشارك',
    recorded_by: cs.teacher_id,
  }).select('id').single();

  if (recErr || !record) {
    console.error('Failed to record attendance:', recErr);
    process.exit(1);
  }
  console.log('✓ Attendance record created successfully:', record.id);

  // 4. Query back
  const { data: verified, error: verErr } = await adminClient
    .from('attendance_records')
    .select('id, status, notes')
    .eq('id', record.id)
    .single();

  if (verErr || !verified) {
    console.error('Failed to verify attendance record:', verErr);
    process.exit(1);
  }
  console.log('✓ Verified attendance record from DB:', verified);

  // 5. Cleanup
  await adminClient.from('attendance_records').delete().eq('id', record.id);
  console.log('✓ Cleaned up test attendance record.');
  console.log('=== PHASE 11 TEST PASSED 100% ===');
}

testAttendanceFlow().catch(console.error);
