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

async function seedAcademic() {
  console.log('--- تهيئة الهيكل الأكاديمي النموذجي في Supabase ---');

  // 1. Academic Year
  let yearId = '10000000-0000-0000-0000-000000000001';
  const { data: yData } = await adminClient.from('academic_years').select('id').eq('name', '2026-2027').maybeSingle();
  if (!yData) {
    await adminClient.from('academic_years').insert({
      id: yearId,
      name: '2026-2027',
      start_date: '2026-09-01',
      end_date: '2027-06-30',
      is_current: true
    });
    console.log('✅ تم حفظ العام الدراسي 2026-2027');
  } else {
    yearId = yData.id;
  }

  // 2. Semester
  let semId = '20000000-0000-0000-0000-000000000001';
  const { data: sData } = await adminClient.from('semesters').select('id').eq('academic_year_id', yearId).maybeSingle();
  if (!sData) {
    await adminClient.from('semesters').insert({
      id: semId,
      academic_year_id: yearId,
      name: 'الفصل الدراسي الأول',
      code: '20261',
      start_date: '2026-09-01',
      end_date: '2027-01-31',
      is_active: true
    });
    console.log('✅ تم حفظ الفصل الدراسي الأول');
  } else {
    semId = sData.id;
  }

  // 3. Academic Tracks
  const tracks = [
    { id: '40000000-0000-0000-0000-000000000001', name: 'المسار العام', code: 'GENERAL', description: 'المسار المشترك للصف الأول الثانوي' },
    { id: '40000000-0000-0000-0000-000000000002', name: 'المسار العلمي', code: 'SCIENCE', description: 'مسار العلوم الطبيعية والحاسوبية' },
    { id: '40000000-0000-0000-0000-000000000003', name: 'المسار الأدبي', code: 'LITERARY', description: 'مسار الدراسات الإنسانية واللغوية' }
  ];
  for (const t of tracks) {
    await adminClient.from('academic_tracks').upsert(t, { onConflict: 'name' });
  }
  console.log('✅ تم حفظ المسارات الأكاديمية (عام، علمي، أدبي)');

  // 4. Grade Levels
  const grades = [
    { id: '30000000-0000-0000-0000-000000000001', name: 'الأول الثانوي', level_order: 1 },
    { id: '30000000-0000-0000-0000-000000000002', name: 'الثاني الثانوي', level_order: 2 },
    { id: '30000000-0000-0000-0000-000000000003', name: 'الثالث الثانوي', level_order: 3 }
  ];
  for (const g of grades) {
    await adminClient.from('grade_levels').upsert(g, { onConflict: 'name' });
  }

  // 5. Sections
  const sections = [
    { id: '50000000-0000-0000-0000-000000000001', name: 'الشعبة (أ)', grade_level_id: grades[2].id, academic_track_id: tracks[1].id, capacity: 30 },
    { id: '50000000-0000-0000-0000-000000000002', name: 'الشعبة (ب)', grade_level_id: grades[2].id, academic_track_id: tracks[1].id, capacity: 30 },
    { id: '50000000-0000-0000-0000-000000000003', name: 'الشعبة (أ)', grade_level_id: grades[1].id, academic_track_id: tracks[1].id, capacity: 30 },
    { id: '50000000-0000-0000-0000-000000000004', name: 'الشعبة (ب)', grade_level_id: grades[1].id, academic_track_id: tracks[2].id, capacity: 30 },
    { id: '50000000-0000-0000-0000-000000000005', name: 'الشعبة (أ)', grade_level_id: grades[0].id, academic_track_id: tracks[0].id, capacity: 35 },
    { id: '50000000-0000-0000-0000-000000000006', name: 'الشعبة (ب)', grade_level_id: grades[0].id, academic_track_id: tracks[0].id, capacity: 35 }
  ];
  for (const sec of sections) {
    await adminClient.from('sections').upsert(sec);
  }
  console.log('✅ تم حفظ الشُعب الدراسية لكل صف');

  // 6. Subjects
  const subjects = [
    { id: '60000000-0000-0000-0000-000000000001', name: 'إدارة الشبكات', code: 'NET-301', description: 'مقرر إدارة وصيانة الخوادم والشبكات', icon_name: 'Network', subject_type: 'theory' },
    { id: '60000000-0000-0000-0000-000000000002', name: 'أمنية النظم والشبكات', code: 'SEC-302', description: 'مقرر حماية البيانات والتشفير وأمن المعلومات', icon_name: 'ShieldCheck', subject_type: 'practical' },
    { id: '60000000-0000-0000-0000-000000000003', name: 'برمجة التطبيقات المتقدمة', code: 'DEV-303', description: 'تطوير تطبيقات الويب والهواتف الذكية الحديثة', icon_name: 'Code2', subject_type: 'practical' },
    { id: '60000000-0000-0000-0000-000000000004', name: 'الرياضيات التطبيقية', code: 'MATH-304', description: 'التفاضل والتكامل والجبر المتقدم', icon_name: 'Calculator', subject_type: 'theory' },
    { id: '60000000-0000-0000-0000-000000000005', name: 'اللغة العربية', code: 'ARB-101', description: 'قواعد النحو والأدب والبلاغة', icon_name: 'BookOpen', subject_type: 'theory' },
    { id: '60000000-0000-0000-0000-000000000006', name: 'اللغة الإنجليزية', code: 'ENG-102', description: 'مهارات القراءة والكتابة والمحادثة', icon_name: 'Globe', subject_type: 'theory' },
    { id: '60000000-0000-0000-0000-000000000007', name: 'الفيزياء العامة', code: 'PHY-201', description: 'الميكانيكا والكهرباء والمغناطيسية', icon_name: 'Atom', subject_type: 'practical' },
    { id: '60000000-0000-0000-0000-000000000008', name: 'الكيمياء العامة', code: 'CHM-202', description: 'التفاعلات الكيميائية والمحاليل والحرارة', icon_name: 'FlaskConical', subject_type: 'practical' }
  ];
  for (const sub of subjects) {
    await adminClient.from('subjects').upsert(sub, { onConflict: 'code' });
  }
  console.log('✅ تم حفظ المقررات الدراسية الـ 8');
  console.log('--- اكتملت تهيئة الهيكل الأكاديمي بنجاح ---');
}

seedAcademic().catch(console.error);
