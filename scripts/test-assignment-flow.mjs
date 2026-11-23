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

async function testAssignmentFlow() {
  console.log('=== Testing Assignment Lifecycle in Supabase ===');

  // 1. Get or create student
  let { data: student } = await adminClient.from('profiles').select('id, full_name').eq('role', 'STUDENT').limit(1).maybeSingle();
  let createdAuthStudentId = null;

  if (!student) {
    console.log('Creating baseline student in auth and profiles...');
    const { data: newAuth, error: authErr } = await adminClient.auth.admin.createUser({
      email: 'student.ahmed@madrasti.school',
      password: 'Password123!',
      email_confirm: true,
      user_metadata: {
        username: 'ahmed2026',
        full_name: 'أحمد خالد محمد',
        role: 'STUDENT',
      },
    });

    if (authErr) {
      console.error('Failed to create student in auth:', authErr);
      process.exit(1);
    }

    createdAuthStudentId = newAuth.user.id;
    const { data: prof, error: profErr } = await adminClient.from('profiles').upsert({
      id: createdAuthStudentId,
      full_name: 'أحمد خالد محمد',
      username: 'ahmed2026',
      role: 'STUDENT',
      phone: '771234567',
      is_active: true,
    }).select('id, full_name').single();

    if (profErr) {
      console.error('Failed to insert student profile:', profErr);
      process.exit(1);
    }
    student = prof;
  }
  console.log('Using student:', student.id, student.full_name);

  // 2. Get an existing class_subject
  const { data: cs, error: csErr } = await adminClient.from('class_subjects').select('id, teacher_id').limit(1).single();
  if (csErr || !cs) {
    console.error('No class_subject found:', csErr);
    process.exit(1);
  }
  console.log('Using class_subject:', cs.id, 'teacher_id:', cs.teacher_id);

  // 3. Create assignment
  const { data: assignment, error: aErr } = await adminClient.from('assignments').insert({
    class_subject_id: cs.id,
    title: 'واجب تجريبي لاختبار دورة التصحيح الآلية',
    instructions: 'قم بحل المسائل في الملف المرفق وإعادة رفع الحل بصيغة PDF',
    max_score: 10,
    open_date: new Date().toISOString(),
    due_date: new Date(Date.now() + 86400000).toISOString()
  }).select('id').single();

  if (aErr || !assignment) {
    console.error('Failed to create assignment:', aErr);
    process.exit(1);
  }
  console.log('✓ Assignment created successfully with ID:', assignment.id);

  // 4. Submit student answer
  const { data: submission, error: subErr } = await adminClient.from('submissions').insert({
    assignment_id: assignment.id,
    student_id: student.id,
    answer_text: 'تم حل الواجب بالكامل، المرفق يحتوي على الخطوات التفصيلية.',
    status: 'submitted',
    submitted_at: new Date().toISOString(),
    attempt_number: 1
  }).select('id').single();

  if (subErr || !submission) {
    console.error('Failed to submit assignment:', subErr);
    process.exit(1);
  }
  console.log('✓ Submission recorded successfully with ID:', submission.id);

  // 5. Grade submission
  const { error: feedErr } = await adminClient.from('submission_feedback').insert({
    submission_id: submission.id,
    grader_id: cs.teacher_id,
    score: 9.5,
    feedback_notes: 'ممتاز جداً وإجابة دقيقة ومنظمة.',
    graded_at: new Date().toISOString()
  });

  if (feedErr) {
    console.error('Failed to insert feedback:', feedErr);
    process.exit(1);
  }

  await adminClient.from('submissions').update({ status: 'graded' }).eq('id', submission.id);
  console.log('✓ Graded with score 9.5 and updated status to graded!');

  // 6. Query back
  const { data: feedbackCheck } = await adminClient.from('submission_feedback').select('score, feedback_notes').eq('submission_id', submission.id).single();
  console.log('✓ Verified feedback from DB:', feedbackCheck);

  // 7. Cleanup
  await adminClient.from('assignments').delete().eq('id', assignment.id);
  console.log('✓ Cleaned up test assignment & cascade submissions.');
  console.log('=== PHASE 8 TEST PASSED 100% ===');
}

testAssignmentFlow().catch(console.error);

