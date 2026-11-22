# دليل النشر والاستضافة السحابية — منصة مدرستي (Madrasti LMS)

تم تصميم منصة **مدرستي** لتكون قابلة للنشر والتشغيل الإنتاجي الفوري عبر الإنترنت بأعلى معايير الأداء والأمان.
يوضح هذا الدليل الخطوات التفصيلية لنشر المنصة باستخدام **Vercel** (للواجهة الأمامية وخوادم Next.js) و **Supabase Cloud** (لقاعدة بيانات PostgreSQL والتخزين والمصادقة).

---

## 1. المتطلبات المسبقة
1. حساب على [GitHub](https://github.com) لرفع الكود المصدري للمشروع.
2. حساب على [Supabase Cloud](https://supabase.com).
3. حساب على [Vercel](https://vercel.com).
4. اسم نطاق مخصص (Domain Name) مثل: `madrasti.edu.ye` أو `madrasti.school`.

---

## 2. إعداد قاعدة بيانات Supabase في بيئة الإنتاج

1. أنشئ مشروعاً جديداً في Supabase:
   - **Project Name:** `madrasti-lms-prod`
   - **Database Password:** كلمة مرور قوية ومؤمنة.
   - **Region:** اختر أقرب منطقة جغرافية (مثل: `Frankfurt (eu-central-1)` أو `Middle East`).

2. تشغيل ملفات التهجرة (Migrations):
   - افتح **SQL Editor** في لوحة تحكم Supabase.
   - انسخ محتويات الملف `supabase/migrations/001_initial_schema.sql` ونفذها لإنشاء الـ 33 جدولاً والعلاقات والفهارس.
   - انسخ محتويات الملف `supabase/migrations/002_rls_policies.sql` ونفذها لتفعيل سياسات الأمان على مستوى الصف (RLS).
   - (اختياري) قم بتشغيل `supabase/seed.sql` لإدراج البيانات التأسيسية للمدرسة.

3. إعداد حاويات التخزين (Storage Buckets):
   - من قسم **Storage**، أنشئ الحاويات التالية مع تفعيل الصلاحيات المناسبة:
     - `lesson-materials` (ملفات الدروس والوسائط التعليمية - حجم أقصى 25MB)
     - `submissions` (ملفات تسليم الواجبات وصور الحلول - حجم أقصى 25MB)
     - `avatars` (الصور الشخصية للمستخدمين)

---

## 3. النشر عبر منصة Vercel

1. ارفع المشروع إلى مستودع خاص على GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete madrasti LMS production build"
   git branch -M main
   git remote add origin https://github.com/your-org/madrasti.git
   git push -u origin main
   ```

2. ربط المشروع في Vercel:
   - في Vercel Dashboard، اختر **Add New Project** ثم استورد مستودع `madrasti`.
   - **Framework Preset:** Next.js.
   - **Root Directory:** `./`

3. ضبط المتغيرات البيئية (Environment Variables):
   أضف المتغيرات التالية في إعدادات المشروع في Vercel:
   | المتغير | القيمة |
   | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | رابط مشروعك من Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | المفتاح العام (Anon Key) |
   | `SUPABASE_SERVICE_ROLE_KEY` | مفتاح الخدمة المشفر (Service Role) |
   | `NEXT_PUBLIC_APP_URL` | رابط الموقع الإنتاجي (مثل: `https://madrasti.school`) |

4. اضغط **Deploy**:
   - ستقوم Vercel ببناء المشروع وتوليد كافة المسارات الثابتة والمتحركة وتوزيعها عبر شبكة CDN عالمية ذات زمن استجابة منخفض.

---

## 4. ربط النطاق المخصص وشهادة SSL (Custom Domain & DNS)

1. في لوحة تحكم Vercel > **Settings** > **Domains**:
   - أضف اسم النطاق: `madrasti.school` و `www.madrasti.school`.
2. في لوحة تحكم مزود النطاق الخاص بك (مثل GoDaddy أو Cloudflare)، أضف سجلات الـ DNS التالية:
   - **Type A Record:**
     - Name: `@`
     - Value: `76.76.21.21`
   - **CNAME Record:**
     - Name: `www`
     - Value: `cname.vercel-dns.com`
3. ستقوم Vercel تلقائياً بتوليد شهادة أمان SSL/TLS مشفرة ومجانية (Let's Encrypt) مع التجديد التلقائي.

---

## 5. فحص الجاهزية التشغيلية (Go-Live Checklist)
- [x] تفعيل RLS على جميع الجداول لمنع تسريب بيانات الطلاب.
- [x] حظر امتدادات الملفات الخطرة (`.exe`, `.bat`, `.sh`, `.php`) في خادم التخزين.
- [x] التأكد من حظر وصول غير المديرين لمسارات `/admin`.
- [x] فحص عمل الـ PWA وإمكانية تثبيت المنصة على هواتف أندرويد و iOS.
- [x] اختبار عداد الوقت للاختبارات الإلكترونية والتقاط الكاميرا للواجبات.
