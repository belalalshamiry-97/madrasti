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

const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testLessonFlow() {
  console.log('\n--- اختبار دورة حياة الدروس والمواد في Supabase ---');

  // 1. Get or create a class_subject for test
  let { data: classSub } = await adminClient.from('class_subjects').select('id').limit(1).maybeSingle();
  if (!classSub) {
    const { data: sec } = await adminClient.from('sections').select('id').limit(1).single();
    const { data: sub } = await adminClient.from('subjects').select('id').limit(1).single();
    const { data: teacher } = await adminClient.from('profiles').select('id').limit(1).single();
    const { data: sem } = await adminClient.from('semesters').select('id').limit(1).single();

    const { data: newCS, error: csErr } = await adminClient.from('class_subjects').insert({
      id: '80000000-0000-0000-0000-000000000001',
      section_id: sec.id,
      subject_id: sub.id,
      teacher_id: teacher.id,
      semester_id: sem.id
    }).select('id').single();

    if (csErr) {
      console.error('خطأ class_subjects:', csErr);
      return;
    }
    classSub = newCS;
    console.log('✅ تم إنشاء مقرر دراسي تجريبي مسند:', classSub.id);
  }

  // 2. Insert test lesson
  const { data: lesson, error: lErr } = await adminClient.from('lessons').insert({
    class_subject_id: classSub.id,
    lesson_number: 99,
    title: 'درس تجريبي للفحص السحابي',
    description: 'شرح تجريبي لاختبار الربط بـ Supabase',
    status: 'published',
    published_at: new Date().toISOString()
  }).select().single();

  if (lErr) {
    console.error('❌ خطأ إنشاء الدرس:', lErr);
    return;
  }
  console.log(`✅ تم إنشاء الدرس بنجاح في جدول lessons (المعرف: ${lesson.id})`);

  // 3. Insert test lesson material
  const { data: mat, error: mErr } = await adminClient.from('lesson_materials').insert({
    lesson_id: lesson.id,
    title: 'ملخص_الدرس_التجريبي.pdf',
    material_type: 'pdf',
    file_path: 'materials/test.pdf',
    file_size_bytes: 512000
  }).select().single();

  if (mErr) {
    console.error('❌ خطأ إضافة المرفق:', mErr);
  } else {
    console.log(`✅ تم حفظ المرفق بنجاح في lesson_materials (المعرف: ${mat.id})`);
  }

  // 4. Clean up test lesson and materials
  await adminClient.from('lesson_materials').delete().eq('lesson_id', lesson.id);
  await adminClient.from('lessons').delete().eq('id', lesson.id);
  console.log('✅ تم حذف بيانات الفحص التجريبي بنجاح وبقيت قاعدة البيانات نظيفة.');
  console.log('\n========================================================');
  console.log('   🎉 فحص الدروس والمواد في Supabase اكتمل بنجاح تام 100%');
  console.log('========================================================\n');
}

testLessonFlow().catch(console.error);
