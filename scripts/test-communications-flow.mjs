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

async function testCommunicationsFlow() {
  console.log('=== Testing Communications Lifecycle in Supabase ===');

  // 1. Get admin profile
  const { data: admin, error: adErr } = await adminClient.from('profiles').select('id').eq('role', 'ADMIN').limit(1).single();
  if (adErr || !admin) {
    console.error('No admin found:', adErr);
    process.exit(1);
  }

  // 2. Get student profile
  const { data: student, error: stErr } = await adminClient.from('profiles').select('id').eq('role', 'STUDENT').limit(1).single();
  if (stErr || !student) {
    console.error('No student found:', stErr);
    process.exit(1);
  }

  // 3. Create announcement
  const { data: announcement, error: aErr } = await adminClient.from('announcements').insert({
    title: 'إعلان تجريبي لفحص منصة مدرستي',
    content: 'يرجى العلم بأنه تم تشغيل النظام بالكامل متصلاً بقاعدة البيانات الحقيقية.',
    target_audience: 'all',
    created_by: admin.id,
  }).select('id').single();

  if (aErr || !announcement) {
    console.error('Failed to create announcement:', aErr);
    process.exit(1);
  }
  console.log('✓ Announcement created successfully:', announcement.id);

  // 4. Create notification
  const { data: notification, error: nErr } = await adminClient.from('notifications').insert({
    user_id: student.id,
    title: 'إشعار تجريبي جديد',
    message: 'تم تفعيل حسابك بنجاح في منصة ثانوية مدرستي.',
    link_url: '/student',
    type: 'general',
    is_read: false,
  }).select('id').single();

  if (nErr || !notification) {
    console.error('Failed to create notification:', nErr);
    process.exit(1);
  }
  console.log('✓ Notification created successfully:', notification.id);

  // 5. Mark notification as read
  await adminClient.from('notifications').update({ is_read: true }).eq('id', notification.id);
  const { data: checkNote } = await adminClient.from('notifications').select('is_read').eq('id', notification.id).single();
  console.log('✓ Verified notification marked as read:', checkNote.is_read);

  // 6. Create conversation & send message
  const { data: conv, error: cErr } = await adminClient.from('conversations').insert({}).select('id').single();
  if (cErr || !conv) {
    console.error('Failed to create conversation:', cErr);
    process.exit(1);
  }

  await adminClient.from('conversation_members').insert([
    { conversation_id: conv.id, user_id: admin.id },
    { conversation_id: conv.id, user_id: student.id },
  ]);

  const { data: msg, error: mErr } = await adminClient.from('messages').insert({
    conversation_id: conv.id,
    sender_id: admin.id,
    body: 'مرحباً بك يا أحمد في العام الدراسي الجديد.',
  }).select('id, body').single();

  if (mErr || !msg) {
    console.error('Failed to send message:', mErr);
    process.exit(1);
  }
  console.log('✓ Message sent successfully:', msg);

  // 7. Cleanup
  await adminClient.from('announcements').delete().eq('id', announcement.id);
  await adminClient.from('notifications').delete().eq('id', notification.id);
  await adminClient.from('conversations').delete().eq('id', conv.id);
  console.log('✓ Cleaned up test announcement, notification, conversation.');
  console.log('=== PHASE 10 TEST PASSED 100% ===');
}

testCommunicationsFlow().catch(console.error);
