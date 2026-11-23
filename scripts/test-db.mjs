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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

console.log('\n========================================================');
console.log('   فحص الاتصال بقاعدة بيانات Supabase — MADRASTI LMS');
console.log('========================================================\n');

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runDiagnostics() {
  console.log('1. اختبار صلاحيات السيرفر الإداري (Service Role)...');
  const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
  if (usersError) {
    console.log(`  ❌ فحص auth.users: ${usersError.message}`);
  } else {
    console.log(`  ✅ تم الاتصال بـ auth.users بنجاح (المستخدمون الحاليون: ${usersData.users.length})`);
  }

  const tablesToCheck = [
    'school_settings',
    'profiles',
    'academic_years',
    'semesters',
    'grade_levels',
    'academic_tracks',
    'sections',
    'subjects',
    'class_subjects',
    'enrollments',
    'lessons',
    'lesson_materials',
    'assignments',
    'submissions',
    'quizzes',
    'attendance_records',
    'announcements',
    'messages'
  ];

  console.log('\n2. فحص قراءة الجداول عبر صلاحية Service Role:');
  for (const table of tablesToCheck) {
    const { count, error } = await adminClient
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`  ❌ جدول [${table}]: خطأ -> ${error.message} (كود: ${error.code})`);
    } else {
      console.log(`  ✅ جدول [${table}]: متصل بنجاح (عدد السجلات: ${count ?? 0})`);
    }
  }

  console.log('\n3. فحص قراءة إعدادات المدرسة عبر Anon Key (لصفحة تسجيل الدخول):');
  const { data: schoolData, error: schoolError } = await anonClient
    .from('school_settings')
    .select('id, school_name')
    .limit(1);

  if (schoolError) {
    console.log(`  ❌ فحص school_settings عبر anon: ${schoolError.message} (كود: ${schoolError.code})`);
  } else {
    console.log(`  ✅ قراءة school_settings عبر anon ناجحة! البيانات:`, schoolData);
  }

  console.log('\n========================================================');
  console.log('   اكتمل الفحص بنجاح!');
  console.log('========================================================\n');
}

runDiagnostics().catch(console.error);
