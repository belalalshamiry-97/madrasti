"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Search,
  Filter,
  Download,
  Printer,
  Award,
  Trophy,
  CheckCircle2,
  FileSpreadsheet,
  Users,
  GraduationCap,
  Percent,
  X,
  FileText,
  Calendar,
  Layers,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { getActiveUser } from "@/lib/user-store";
import { getProfilesFromDB } from "@/lib/services/users-service";

interface StudentResult {
  id: string;
  rank: number;
  name: string;
  username: string; // Seat / Student ID
  grade: string;
  section: string;
  year: string;
  term: string;
  math: number;
  physics: number;
  chemistry: number;
  biologyOrTech: number;
  arabic: number;
  english: number;
  computer: number;
  totalScore: number; // out of 700
  percentage: number;
  gpaRating: "ممتاز" | "جيد جداً" | "جيد" | "مقبول" | "راسب";
  status: "ناجح بتفوق" | "ناجح" | "دور ثان";
}

export default function AdminResultsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(getActiveUser());

  const [yearFilter, setYearFilter] = useState("2026-2027");
  const [termFilter, setTermFilter] = useState("الفصل الدراسي الأول");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);

  // Student results database
  const [resultsList, setResultsList] = useState<StudentResult[]>([
    {
      id: "res-1",
      rank: 1,
      name: "سارة خالد الكثيري",
      username: "student2",
      grade: "الثالث الثانوي (علمي)",
      section: "الشعبة (أ)",
      year: "2026-2027",
      term: "الفصل الدراسي الأول",
      math: 99,
      physics: 98,
      chemistry: 99,
      biologyOrTech: 100,
      arabic: 97,
      english: 98,
      computer: 99,
      totalScore: 690,
      percentage: 98.6,
      gpaRating: "ممتاز",
      status: "ناجح بتفوق",
    },
    {
      id: "res-2",
      rank: 2,
      name: "عمر أحمد بافضل",
      username: "student1",
      grade: "الثالث الثانوي (علمي)",
      section: "الشعبة (أ)",
      year: "2026-2027",
      term: "الفصل الدراسي الأول",
      math: 98,
      physics: 96,
      chemistry: 95,
      biologyOrTech: 97,
      arabic: 96,
      english: 98,
      computer: 100,
      totalScore: 680,
      percentage: 97.1,
      gpaRating: "ممتاز",
      status: "ناجح بتفوق",
    },
    {
      id: "res-3",
      rank: 3,
      name: "محمد ياسين اليافعي",
      username: "student3",
      grade: "الثالث الثانوي (علمي)",
      section: "الشعبة (ب)",
      year: "2026-2027",
      term: "الفصل الدراسي الأول",
      math: 92,
      physics: 89,
      chemistry: 91,
      biologyOrTech: 90,
      arabic: 88,
      english: 94,
      computer: 95,
      totalScore: 639,
      percentage: 91.3,
      gpaRating: "ممتاز",
      status: "ناجح بتفوق",
    },
    {
      id: "res-4",
      rank: 4,
      name: "أروى عبد الله بارحيم",
      username: "student4",
      grade: "الثاني الثانوي",
      section: "الشعبة (أ)",
      year: "2026-2027",
      term: "الفصل الدراسي الأول",
      math: 88,
      physics: 85,
      chemistry: 89,
      biologyOrTech: 87,
      arabic: 92,
      english: 90,
      computer: 91,
      totalScore: 622,
      percentage: 88.9,
      gpaRating: "جيد جداً",
      status: "ناجح",
    },
    {
      id: "res-5",
      rank: 5,
      name: "فاطمة سالم باوزير",
      username: "student6",
      grade: "الأول الثانوي",
      section: "الشعبة (ب)",
      year: "2026-2027",
      term: "الفصل الدراسي الأول",
      math: 84,
      physics: 82,
      chemistry: 85,
      biologyOrTech: 86,
      arabic: 90,
      english: 89,
      computer: 90,
      totalScore: 606,
      percentage: 86.6,
      gpaRating: "جيد جداً",
      status: "ناجح",
    },
    {
      id: "res-6",
      rank: 6,
      name: "خالد سعيد العامري",
      username: "student5",
      grade: "الأول الثانوي",
      section: "الشعبة (أ)",
      year: "2026-2027",
      term: "الفصل الدراسي الأول",
      math: 72,
      physics: 70,
      chemistry: 68,
      biologyOrTech: 74,
      arabic: 78,
      english: 76,
      computer: 82,
      totalScore: 520,
      percentage: 74.3,
      gpaRating: "جيد",
      status: "ناجح",
    },
    // Past Year 2025-2026 Record
    {
      id: "res-7",
      rank: 1,
      name: "عمر أحمد بافضل",
      username: "student1",
      grade: "الثاني الثانوي",
      section: "الشعبة (أ)",
      year: "2025-2026",
      term: "النتيجة السنوية الشاملة",
      math: 97,
      physics: 95,
      chemistry: 96,
      biologyOrTech: 98,
      arabic: 94,
      english: 96,
      computer: 99,
      totalScore: 675,
      percentage: 96.4,
      gpaRating: "ممتاز",
      status: "ناجح بتفوق",
    },
  ]);

  useEffect(() => {
    setAdmin(getActiveUser());

    async function loadDBStudents() {
      try {
        const profiles = await getProfilesFromDB("STUDENT");
        if (profiles && profiles.length > 0) {
          setResultsList((prev) => {
            const existingUsernames = new Set(prev.map((r) => r.username.toLowerCase()));
            const newEntries: StudentResult[] = [];

            profiles.forEach((p, idx) => {
              if (!existingUsernames.has(p.username.toLowerCase())) {
                newEntries.push({
                  id: p.id,
                  rank: prev.length + newEntries.length + 1,
                  name: p.full_name,
                  username: p.username,
                  grade: "المرحلة الثانوية",
                  section: "الشعبة (أ)",
                  year: "2026-2027",
                  term: "الفصل الدراسي الأول",
                  math: 90,
                  physics: 88,
                  chemistry: 89,
                  biologyOrTech: 91,
                  arabic: 92,
                  english: 87,
                  computer: 95,
                  totalScore: 632,
                  percentage: 90.3,
                  gpaRating: "ممتاز",
                  status: "ناجح بتفوق",
                });
              }
            });

            return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
          });
        }
      } catch (err) {
        console.error("Error loading DB students for results:", err);
      }
    }

    loadDBStudents();
  }, []);

  const filteredResults = useMemo(() => {
    return resultsList.filter((r) => {
      const matchesYear = r.year === yearFilter;
      const matchesTerm = termFilter === "ALL" || r.term === termFilter;
      const matchesGrade = gradeFilter === "ALL" || r.grade.includes(gradeFilter);
      const matchesSection = sectionFilter === "ALL" || r.section === sectionFilter;
      const matchesRating = ratingFilter === "ALL" || r.gpaRating === ratingFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        r.name.includes(searchQuery) ||
        r.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesYear && matchesTerm && matchesGrade && matchesSection && matchesRating && matchesSearch;
    });
  }, [resultsList, yearFilter, termFilter, gradeFilter, sectionFilter, ratingFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = filteredResults.length;
    const excellentCount = filteredResults.filter((r) => r.gpaRating === "ممتاز").length;
    const veryGoodCount = filteredResults.filter((r) => r.gpaRating === "جيد جداً").length;
    const passedCount = filteredResults.filter((r) => r.status !== "دور ثان").length;
    const passRate = total > 0 ? ((passedCount / total) * 100).toFixed(1) : "0.0";
    const avgPercentage = total > 0 ? (filteredResults.reduce((acc, curr) => acc + curr.percentage, 0) / total).toFixed(1) : "0.0";

    return { total, excellentCount, veryGoodCount, passRate, avgPercentage };
  }, [filteredResults]);

  const getRatingBadge = (rating: StudentResult["gpaRating"]) => {
    switch (rating) {
      case "ممتاز":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center gap-1 justify-center">
            <Trophy className="w-3 h-3 text-status-warning" />
            ممتاز
          </span>
        );
      case "جيد جداً":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
            جيد جداً
          </span>
        );
      case "جيد":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-secondary text-muted border border-border">
            جيد
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-status-danger/20 text-status-danger border border-status-danger/30">
            {rating}
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const header = "الترتيب,اسم الطالب,رقم القيد,الصف,الشعبة,السنة,الفصل,الرياضيات,الفيزياء,الكيمياء,الأحياء/التقنية,العربية,الإنجليزية,الحاسوب,المجموع,النسبة,التقدير,الحالة\n";
    const rows = filteredResults.map((r) =>
      `"${r.rank}","${r.name}","${r.username}","${r.grade}","${r.section}","${r.year}","${r.term}","${r.math}","${r.physics}","${r.chemistry}","${r.biologyOrTech}","${r.arabic}","${r.english}","${r.computer}","${r.totalScore}","${r.percentage}%","${r.gpaRating}","${r.status}"`
    );
    const blob = new Blob(["\uFEFF" + header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `student_results_${yearFilter}_${termFilter}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={admin} onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={admin} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                <Percent className="w-6 h-6 text-brand-teal" />
                قوائم نتائج الطلاب لكل فصل ولكل سنة
              </h1>
              <p className="text-xs text-muted">
                الكشوفات الرسمية للنتائج، الدرجات، ونسب النجاح والتقدير لجميع المراحل الدراسية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-brand-teal" />
              <span>تصدير كشف الدرجات</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>طباعة الكشوف</span>
            </button>
          </div>
        </div>

        {/* Key Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">الطلاب في الكشف</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">{stats.total}</span>
              <Users className="w-5 h-5 text-brand-cyan" />
            </div>
            <span className="text-[11px] text-muted mt-1 block">طالب ممتحن</span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">نسبة النجاح العامة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-status-success">{stats.passRate}%</span>
              <CheckCircle2 className="w-5 h-5 text-status-success" />
            </div>
            <span className="text-[11px] text-status-success mt-1 block">اعتماد نهائي</span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">المتفوقون (امتياز)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-status-warning">{stats.excellentCount}</span>
              <Trophy className="w-5 h-5 text-status-warning" />
            </div>
            <span className="text-[11px] text-status-warning mt-1 block">معدل 90% فأعلى</span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">متوسط الدرجات العام</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-brand-teal">{stats.avgPercentage}%</span>
              <GraduationCap className="w-5 h-5 text-brand-teal" />
            </div>
            <span className="text-[11px] text-brand-teal mt-1 block">المتوسط المدرسي</span>
          </div>
        </div>

        {/* Filter Toolbar (Year, Semester, Grade, Section, Search) */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم الطالب أو رقم القيد..."
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
              />
            </div>

            {/* Academic Year */}
            <div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
              >
                <option value="2026-2027">العام الدراسي 2026-2027</option>
                <option value="2025-2026">العام الدراسي 2025-2026</option>
              </select>
            </div>

            {/* Semester / Term */}
            <div>
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
              >
                <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                <option value="النتيجة السنوية الشاملة">النتيجة السنوية الشاملة</option>
              </select>
            </div>

            {/* Grade */}
            <div>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-semibold focus:outline-none focus:border-brand-cyan"
              >
                <option value="ALL">جميع الصفوف</option>
                <option value="الثالث الثانوي">الثالث الثانوي</option>
                <option value="الثاني الثانوي">الثاني الثانوي</option>
                <option value="الأول الثانوي">الأول الثانوي</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-semibold focus:outline-none focus:border-brand-cyan"
              >
                <option value="ALL">جميع التقديرات</option>
                <option value="ممتاز">ممتاز (90%+)</option>
                <option value="جيد جداً">جيد جداً (80-89%)</option>
                <option value="جيد">جيد (65-79%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-status-warning" />
              <h3 className="text-base font-bold text-foreground">
                كشف درجات: {termFilter} ({yearFilter})
              </h3>
            </div>
            <span className="text-xs text-muted font-bold">
              {filteredResults.length} طلاب معتمدين
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-surface-secondary/70 border-b border-border text-muted font-bold">
                  <th className="py-3 px-3 text-center">الترتيب</th>
                  <th className="py-3 px-4">اسم الطالب ورقم القيد</th>
                  <th className="py-3 px-3">الصف والشعبة</th>
                  <th className="py-3 px-2 text-center">الرياضيات</th>
                  <th className="py-3 px-2 text-center">الفيزياء</th>
                  <th className="py-3 px-2 text-center">الكيمياء</th>
                  <th className="py-3 px-2 text-center">الحاسوب</th>
                  <th className="py-3 px-2 text-center">العربية</th>
                  <th className="py-3 px-2 text-center">الإنجليزية</th>
                  <th className="py-3 px-3 text-center">المجموع (700)</th>
                  <th className="py-3 px-3 text-center">النسبة</th>
                  <th className="py-3 px-3 text-center">التقدير</th>
                  <th className="py-3 px-3 text-center">إشعار الدرجات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-muted">
                      لا توجد نتائج مطابقة للفلاتر المحددة.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-surface-secondary/40 transition-colors"
                    >
                      <td className="py-3.5 px-3 text-center">
                        <span className="w-6 h-6 rounded-full bg-surface-secondary border border-border inline-flex items-center justify-center font-bold text-foreground">
                          {r.rank}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-foreground block">{r.name}</span>
                        <span className="text-[11px] text-brand-cyan font-mono" dir="ltr">
                          @{r.username}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-foreground block">{r.grade}</span>
                        <span className="text-[11px] text-muted">{r.section}</span>
                      </td>

                      <td className="py-3.5 px-2 text-center font-mono font-semibold text-foreground">
                        {r.math}
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-semibold text-foreground">
                        {r.physics}
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-semibold text-foreground">
                        {r.chemistry}
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-semibold text-brand-cyan">
                        {r.computer}
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-semibold text-foreground">
                        {r.arabic}
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-semibold text-foreground">
                        {r.english}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-bold text-foreground">
                        {r.totalScore}
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-brand-cyan">
                        {r.percentage}%
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        {getRatingBadge(r.gpaRating)}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedStudent(r)}
                          className="px-2.5 py-1 rounded-lg bg-surface-secondary hover:bg-brand-cyan hover:text-background border border-border font-bold text-xs transition-colors"
                        >
                          عرض الشهادة
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DeveloperFooter />
      </main>

      {/* Student Transcript / Certificate Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-2xl max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-brand-cyan" />
                <h3 className="text-base font-bold text-foreground">
                  إشعار درجات رسمي — منصة مدرستي
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">اسم الطالب:</span>
                <span className="font-bold text-foreground text-sm">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">رقم القيد / الجلوس:</span>
                <span className="font-mono text-brand-cyan font-bold">{selectedStudent.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">الصف والشعبة:</span>
                <span className="font-semibold text-foreground">
                  {selectedStudent.grade} — {selectedStudent.section}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">العام الدراسي والفصل:</span>
                <span className="font-semibold text-foreground">
                  {selectedStudent.year} • {selectedStudent.term}
                </span>
              </div>
            </div>

            {/* Subject breakdown */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-foreground">تفاصيل درجات المواد:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-surface-secondary flex justify-between">
                  <span className="text-muted">الرياضيات:</span>
                  <span className="font-bold text-foreground">{selectedStudent.math} / 100</span>
                </div>
                <div className="p-2 rounded-xl bg-surface-secondary flex justify-between">
                  <span className="text-muted">الفيزياء:</span>
                  <span className="font-bold text-foreground">{selectedStudent.physics} / 100</span>
                </div>
                <div className="p-2 rounded-xl bg-surface-secondary flex justify-between">
                  <span className="text-muted">الكيمياء:</span>
                  <span className="font-bold text-foreground">{selectedStudent.chemistry} / 100</span>
                </div>
                <div className="p-2 rounded-xl bg-surface-secondary flex justify-between">
                  <span className="text-muted">الحاسوب ونظم التشغيل:</span>
                  <span className="font-bold text-brand-cyan">{selectedStudent.computer} / 100</span>
                </div>
                <div className="p-2 rounded-xl bg-surface-secondary flex justify-between">
                  <span className="text-muted">اللغة العربية:</span>
                  <span className="font-bold text-foreground">{selectedStudent.arabic} / 100</span>
                </div>
                <div className="p-2 rounded-xl bg-surface-secondary flex justify-between">
                  <span className="text-muted">اللغة الإنجليزية:</span>
                  <span className="font-bold text-foreground">{selectedStudent.english} / 100</span>
                </div>
              </div>
            </div>

            {/* Final Grade Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-blue/20 to-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted block">المجموع والنسبة:</span>
                <span className="text-lg font-black text-brand-cyan">
                  {selectedStudent.totalScore} / 700 ({selectedStudent.percentage}%)
                </span>
              </div>
              <div className="text-left">
                <span className="text-muted block">التقدير العام:</span>
                <span className="text-sm font-black text-status-warning">
                  {selectedStudent.gpaRating} — {selectedStudent.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 shadow-glow"
              >
                <Printer className="w-4 h-4" />
                طباعة إشعار النتيجة
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation user={admin} />
    </div>
  );
}
