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

async function checkAcademic() {
  const years = await adminClient.from('academic_years').select('*');
  const sems = await adminClient.from('semesters').select('*');
  const grades = await adminClient.from('grade_levels').select('*');
  const tracks = await adminClient.from('academic_tracks').select('*');
  const sections = await adminClient.from('sections').select('*');
  const subjects = await adminClient.from('subjects').select('*');

  console.log('academic_years:', years.data?.length);
  console.log('semesters:', sems.data?.length);
  console.log('grade_levels:', grades.data?.length);
  console.log('academic_tracks:', tracks.data?.length);
  console.log('sections:', sections.data?.length);
  console.log('subjects:', subjects.data?.length);
}

checkAcademic();
