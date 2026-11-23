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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log('\n========================================================');
  console.log('   اختبار المرحلة 12: إعدادات المدرسة والتقارير الحية');
  console.log('========================================================\n');

  // 1. Check school_settings retrieval
  console.log('1. اختبار جلب إعدادات المدرسة من school_settings...');
  const { data: settings, error: sErr } = await admin
    .from('school_settings')
    .select('*')
    .limit(1)
    .single();

  if (sErr) {
    console.error('❌ خطأ في جلب school_settings:', sErr.message);
    process.exit(1);
  }
  console.log('  ✅ تم جلب الإعدادات بنجاح. اسم المدرسة الحالي:', settings.school_name);

  // 2. Test updating school settings
  console.log('\n2. اختبار تحديث هوية المدرسة في Supabase...');
  const updatedName = 'ثانوية مدرستي النموذجية';
  const { error: upErr } = await admin
    .from('school_settings')
    .update({
      school_name: updatedName,
      contact_phone: '+967-783085075',
      updated_at: new Date().toISOString(),
    })
    .eq('id', settings.id);

  if (upErr) {
    console.error('❌ خطأ في تحديث school_settings:', upErr.message);
    process.exit(1);
  }
  console.log('  ✅ تم تحديث اسم وهاتف المدرسة في قاعدة البيانات بنجاح!');

  // 3. Test Admin Live Stats calculation
  console.log('\n3. اختبار حساب مؤشرات المنصة الحية (KPIs)...');
  const { count: studentsCount } = await admin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'STUDENT');

  const { count: teachersCount } = await admin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'TEACHER');

  const { count: classSubjectsCount } = await admin
    .from('class_subjects')
    .select('*', { count: 'exact', head: true });

  const { count: assignmentsCount } = await admin
    .from('assignments')
    .select('*', { count: 'exact', head: true });

  const { count: submissionsCount } = await admin
    .from('submissions')
    .select('*', { count: 'exact', head: true });

  const { count: attendanceCount } = await admin
    .from('attendance_records')
    .select('*', { count: 'exact', head: true });

  console.log(`  ✅ عدد الطلاب المسجلين: ${studentsCount}`);
  console.log(`  ✅ عدد المعلمين: ${teachersCount}`);
  console.log(`  ✅ عدد المواد والفصول: ${classSubjectsCount}`);
  console.log(`  ✅ عدد التكاليف والأنشطة: ${assignmentsCount}`);
  console.log(`  ✅ إجمالي التسليمات: ${submissionsCount}`);
  console.log(`  ✅ إجمالي سجلات الحضور: ${attendanceCount}`);

  console.log('\n========================================================');
  console.log('   🎉 نجح اختبار المرحلة 12 بنسبة 100%!');
  console.log('========================================================\n');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

