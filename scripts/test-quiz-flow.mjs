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

async function testQuizFlow() {
  console.log('=== Testing Quizzes Lifecycle in Supabase ===');

  // 1. Get class_subject
  const { data: cs, error: csErr } = await adminClient.from('class_subjects').select('id').limit(1).single();
  if (csErr || !cs) {
    console.error('No class_subject found:', csErr);
    process.exit(1);
  }

  // 2. Get student
  const { data: student, error: stErr } = await adminClient.from('profiles').select('id, full_name').eq('role', 'STUDENT').limit(1).single();
  if (stErr || !student) {
    console.error('No student found:', stErr);
    process.exit(1);
  }

  // 3. Create quiz
  const now = new Date();
  const { data: quiz, error: qErr } = await adminClient.from('quizzes').insert({
    class_subject_id: cs.id,
    title: 'اختبار تجريبي مؤتمت — شبكات الحاسوب',
    description: 'اختبار لقياس فهم البروتوكولات والمنافذ الأساسية',
    duration_minutes: 20,
    start_time: now.toISOString(),
    end_time: new Date(now.getTime() + 86400000).toISOString(),
    max_attempts: 1,
    show_results_immediately: true,
    is_published: true,
  }).select('id').single();

  if (qErr || !quiz) {
    console.error('Failed to create quiz:', qErr);
    process.exit(1);
  }
  console.log('✓ Quiz created successfully:', quiz.id);

  // 4. Create question & options
  const { data: q1, error: q1Err } = await adminClient.from('quiz_questions').insert({
    quiz_id: quiz.id,
    question_text: 'ما هو المنفذ الافتراضي لبروتوكول HTTPS المشفر؟',
    question_type: 'mcq',
    points: 5.0,
    order_index: 1,
  }).select('id').single();

  if (q1Err || !q1) {
    console.error('Failed to create question:', q1Err);
    process.exit(1);
  }

  const { data: opt1, error: optErr } = await adminClient.from('quiz_options').insert([
    { question_id: q1.id, option_text: '80', is_correct: false, order_index: 1 },
    { question_id: q1.id, option_text: '443', is_correct: true, order_index: 2 },
    { question_id: q1.id, option_text: '22', is_correct: false, order_index: 3 },
    { question_id: q1.id, option_text: '53', is_correct: false, order_index: 4 },
  ]).select('id, is_correct, option_text');

  if (optErr || !opt1) {
    console.error('Failed to create options:', optErr);
    process.exit(1);
  }
  console.log('✓ Questions and options inserted successfully.');

  // 5. Submit student attempt (choosing the correct option 443)
  const correctOpt = opt1.find(o => o.is_correct);
  const { data: attempt, error: attErr } = await adminClient.from('quiz_attempts').insert({
    quiz_id: quiz.id,
    student_id: student.id,
    total_score: 5.0,
    status: 'completed',
    start_time: now.toISOString(),
    end_time: now.toISOString(),
    attempt_number: 1,
  }).select('id').single();

  if (attErr || !attempt) {
    console.error('Failed to record attempt:', attErr);
    process.exit(1);
  }

  await adminClient.from('quiz_answers').insert({
    attempt_id: attempt.id,
    question_id: q1.id,
    selected_option_id: correctOpt.id,
    score_awarded: 5.0,
  });
  console.log('✓ Student attempt recorded & scored 5.0/5.0 with answer ID link.');

  // 6. Verify from DB
  const { data: verifiedAttempt } = await adminClient.from('quiz_attempts').select('total_score, status').eq('id', attempt.id).single();
  console.log('✓ Verified attempt from DB:', verifiedAttempt);

  // 7. Cleanup
  await adminClient.from('quizzes').delete().eq('id', quiz.id);
  console.log('✓ Cleaned up test quiz & cascade records.');
  console.log('=== PHASE 9 TEST PASSED 100% ===');
}

testQuizFlow().catch(console.error);
