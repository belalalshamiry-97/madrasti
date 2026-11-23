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

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('--- تهيئة إعدادات المدرسة وحساب المدير الأساسي في Supabase ---');

  // 1. School settings
  const { data: existingSchool } = await adminClient.from('school_settings').select('id').limit(1);
  if (!existingSchool || existingSchool.length === 0) {
    const { error: schoolErr } = await adminClient.from('school_settings').insert({
      id: '00000000-0000-0000-0000-000000000001',
      school_name: 'ثانوية مدرستي النموذجية',
      contact_phone: '+967-783085075',
      contact_email: 'info@madrasti.school',
      address: 'اليمن — حضرموت / المكلا — شارع المعلمين',
      timezone: 'Asia/Aden',
      max_file_size_mb: 25,
      allowed_file_types: ['pdf', 'docx', 'pptx', 'jpg', 'jpeg', 'png', 'webp'],
      messaging_enabled: true,
      quizzes_enabled: true
    });
    if (schoolErr) console.error('خطأ إعدادات المدرسة:', schoolErr);
    else console.log('✅ تم حفظ إعدادات المدرسة بنجاح في school_settings');
  } else {
    console.log('ℹ️ إعدادات المدرسة موجودة مسبقاً.');
  }

  // 2. Initial Admin User
  const adminEmail = 'admin@madrasti.school';
  const { data: usersList } = await adminClient.auth.admin.listUsers();
  let adminAuthId = usersList?.users?.find(u => u.email === adminEmail)?.id;

  if (!adminAuthId) {
    const { data: newAuth, error: authErr } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: 'admin123456',
      email_confirm: true,
      user_metadata: {
        username: 'admin',
        full_name: 'د. عبد الرحمن باحميد (مدير المدرسة)',
        role: 'ADMIN'
      }
    });

    if (authErr) {
      console.error('❌ خطأ إنشاء حساب المدير في auth.users:', authErr);
      return;
    }
    adminAuthId = newAuth.user.id;
    console.log(`✅ تم إنشاء مستخدم المدير في auth.users (ID: ${adminAuthId})`);
  } else {
    console.log(`ℹ️ حساب المدير موجود مسبقاً في auth.users (ID: ${adminAuthId})`);
  }

  // 3. Upsert admin profile in public.profiles
  const { error: profErr } = await adminClient.from('profiles').upsert({
    id: adminAuthId,
    role: 'ADMIN',
    full_name: 'د. عبد الرحمن باحميد',
    username: 'admin',
    phone: '777111222',
    is_active: true
  });

  if (profErr) {
    console.error('❌ خطأ إنشاء سجل المدير في profiles:', profErr);
  } else {
    console.log('✅ تم حفظ ملف المدير بنجاح في جدول profiles');
  }

  // 4. Grade levels seed
  const { count: gradesCount } = await adminClient.from('grade_levels').select('*', { count: 'exact', head: true });
  if (!gradesCount || gradesCount === 0) {
    await adminClient.from('grade_levels').insert([
      { id: '30000000-0000-0000-0000-000000000001', name: 'الأول الثانوي', level_order: 1 },
      { id: '30000000-0000-0000-0000-000000000002', name: 'الثاني الثانوي', level_order: 2 },
      { id: '30000000-0000-0000-0000-000000000003', name: 'الثالث الثانوي', level_order: 3 },
    ]);
    console.log('✅ تم حفظ الصفوف الدراسية الأساسية في grade_levels');
  }
}

main().catch(console.error);
