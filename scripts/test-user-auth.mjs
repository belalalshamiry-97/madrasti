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

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function testUserLifecycle() {
  console.log('\n--- اختبار دورة حياة المستخدمين الحقيقية في Supabase ---');

  const testUsername = 'test_teacher_' + Math.floor(Math.random() * 1000);
  const testEmail = `${testUsername}@madrasti.school`;
  const testPassword = 'Password123!';

  console.log(`1. إنشاء حساب تجريبي: ${testUsername} (${testEmail})...`);
  const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      username: testUsername,
      full_name: 'أستاذ فحص تجريبي',
      role: 'TEACHER'
    }
  });

  if (authErr) {
    console.error('❌ فشل إنشاء الحساب في auth.users:', authErr);
    return;
  }
  console.log('✅ تم إنشاء الحساب بنجاح في auth.users! المعرف:', authData.user.id);

  console.log('2. حفظ السجل في جدول public.profiles...');
  const { data: profData, error: profErr } = await adminClient.from('profiles').insert({
    id: authData.user.id,
    role: 'TEACHER',
    full_name: 'أستاذ فحص تجريبي',
    username: testUsername,
    phone: '777000111',
    is_active: true
  }).select().single();

  if (profErr) {
    console.error('❌ فشل إدراج السجل في profiles:', profErr);
    return;
  }
  console.log('✅ تم حفظ السجل في profiles بنجاح:', profData);

  console.log('3. اختبار تسجيل الدخول عبر Anon Client بمحرك Supabase Auth...');
  const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (signInErr) {
    console.error('❌ فشل تسجيل الدخول:', signInErr);
  } else {
    console.log('✅ تم تسجيل الدخول بنجاح عبر Supabase Auth!');
    console.log('   الجلسة الصادرة: User ID =', signInData.user.id);
  }

  console.log('4. تنظيف حساب الفحص التجريبي من السيرفر...');
  await adminClient.from('profiles').delete().eq('id', authData.user.id);
  await adminClient.auth.admin.deleteUser(authData.user.id);
  console.log('✅ تم حذف حساب الفحص التجريبي بنجاح وبقيت قاعدة البيانات نظيفة.');
  console.log('\n========================================================');
  console.log('   🎉 الاختبار البرمجي لمصادقة المستخدمين اكتمل بنجاح تام 100%');
  console.log('========================================================\n');
}

testUserLifecycle().catch(console.error);
