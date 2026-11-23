"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Users,
  Shield,
  Layers,
  Edit3,
  X,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { MOCK_USERS } from "@/lib/mock-data";

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  username: string;
  grade: string;
  section: string;
  date: string;
  dayName: string;
  period: string;
  subject: string;
  teacherName: string;
  status: "present" | "absent" | "late" | "excused";
  note?: string;
}

export default function AdminAttendancePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const admin = MOCK_USERS.admin;

  const [records, setRecords] = useState<AttendanceRecord[]>([
    {
      id: "att-1",
      studentId: "1",
      studentName: "عمر أحمد بافضل",
      username: "student1",
      grade: "الثالث الثانوي",
      section: "الشعبة (أ)",
      date: "2026-11-23",
      dayName: "الإثنين",
      period: "الحصة الأولى",
      subject: "إدارة الشبكات ونظم التشغيل",
      teacherName: "م. بلال الشميري",
      status: "present",
      note: "حاضر في الموعد",
    },
    {
      id: "att-2",
      studentId: "2",
      studentName: "سارة خالد الكثيري",
      username: "student2",
      grade: "الثالث الثانوي",
      section: "الشعبة (أ)",
      date: "2026-11-23",
      dayName: "الإثنين",
      period: "الحصة الأولى",
      subject: "إدارة الشبكات ونظم التشغيل",
      teacherName: "م. بلال الشميري",
      status: "present",
      note: "مشاركة ممتازة",
    },
    {
      id: "att-3",
      studentId: "3",
      studentName: "محمد ياسين اليافعي",
      username: "student3",
      grade: "الثالث الثانوي",
      section: "الشعبة (ب)",
      date: "2026-11-23",
      dayName: "الإثنين",
      period: "الحصة الثانية",
      subject: "الفيزياء النووية",
      teacherName: "أ. عبد الله بارحيم",
      status: "late",
      note: "تأخر 10 دقائق",
    },
    {
      id: "att-4",
      studentId: "4",
      studentName: "أروى عبد الله بارحيم",
      username: "student4",
      grade: "الثاني الثانوي",
      section: "الشعبة (أ)",
      date: "2026-11-23",
      dayName: "الإثنين",
      period: "الحصة الأولى",
      subject: "الرياضيات التطبيقية",
      teacherName: "أ. فاطمة العولقي",
      status: "excused",
      note: "عذر طبي معتمد",
    },
    {
      id: "att-5",
      studentId: "5",
      studentName: "خالد سعيد العامري",
      username: "student5",
      grade: "الأول الثانوي",
      section: "الشعبة (أ)",
      date: "2026-11-23",
      dayName: "الإثنين",
      period: "الحصة الأولى",
      subject: "اللغة الإنجليزية",
      teacherName: "أ. سالم باوزير",
      status: "absent",
      note: "غياب بدون إشعار",
    },
    {
      id: "att-6",
      studentId: "6",
      studentName: "فاطمة سالم باوزير",
      username: "student6",
      grade: "الأول الثانوي",
      section: "الشعبة (ب)",
      date: "2026-11-23",
      dayName: "الإثنين",
      period: "الحصة الثالثة",
      subject: "الكيمياء العامة",
      teacherName: "أ. فاطمة العولقي",
      status: "present",
      note: "حاضرة",
    },
    {
      id: "att-7",
      studentId: "1",
      studentName: "عمر أحمد بافضل",
      username: "student1",
      grade: "الثالث الثانوي",
      section: "الشعبة (أ)",
      date: "2026-11-22",
      dayName: "الأحد",
      period: "الحصة الرابعة",
      subject: "الأمن السيبراني",
      teacherName: "م. بلال الشميري",
      status: "present",
      note: "حاضر",
    },
    {
      id: "att-8",
      studentId: "2",
      studentName: "سارة خالد الكثيري",
      username: "student2",
      grade: "الثالث الثانوي",
      section: "الشعبة (أ)",
      date: "2026-11-22",
      dayName: "الأحد",
      period: "الحصة الرابعة",
      subject: "الأمن السيبراني",
      teacherName: "م. بلال الشميري",
      status: "present",
      note: "حاضرة",
    },
    {
      id: "att-9",
      studentId: "3",
      studentName: "محمد ياسين اليافعي",
      username: "student3",
      grade: "الثالث الثانوي",
      section: "الشعبة (ب)",
      date: "2026-11-22",
      dayName: "الأحد",
      period: "الحصة الأولى",
      subject: "التفاضل والتكامل",
      teacherName: "أ. فاطمة العولقي",
      status: "present",
      note: "حاضر",
    },
    {
      id: "att-10",
      studentId: "4",
      studentName: "أروى عبد الله بارحيم",
      username: "student4",
      grade: "الثاني الثانوي",
      section: "الشعبة (أ)",
      date: "2026-11-22",
      dayName: "الأحد",
      period: "الحصة الثانية",
      subject: "التاريخ الحديث",
      teacherName: "أ. ناصر السعدي",
      status: "present",
      note: "حاضرة",
    },
    {
      id: "att-11",
      studentId: "5",
      studentName: "خالد سعيد العامري",
      username: "student5",
      grade: "الأول الثانوي",
      section: "الشعبة (أ)",
      date: "2026-11-22",
      dayName: "الأحد",
      period: "الحصة الثالثة",
      subject: "الفيزياء العامة",
      teacherName: "أ. عبد الله بارحيم",
      status: "present",
      note: "حاضر",
    },
    {
      id: "att-12",
      studentId: "6",
      studentName: "فاطمة سالم باوزير",
      username: "student6",
      grade: "الأول الثانوي",
      section: "الشعبة (ب)",
      date: "2026-11-22",
      dayName: "الأحد",
      period: "الحصة الأولى",
      subject: "اللغة العربية",
      teacherName: "أ. ناصر السعدي",
      status: "absent",
      note: "غياب غير مبرر",
    },
    {
      id: "att-13",
      studentId: "1",
      studentName: "عمر أحمد بافضل",
      username: "student1",
      grade: "الثالث الثانوي",
      section: "الشعبة (أ)",
      date: "2026-11-21",
      dayName: "السبت",
      period: "الحصة الثانية",
      subject: "إدارة الشبكات",
      teacherName: "م. بلال الشميري",
      status: "present",
      note: "حاضر",
    },
    {
      id: "att-14",
      studentId: "3",
      studentName: "محمد ياسين اليافعي",
      username: "student3",
      grade: "الثالث الثانوي",
      section: "الشعبة (ب)",
      date: "2026-11-21",
      dayName: "السبت",
      period: "الحصة الثانية",
      subject: "الأحياء",
      teacherName: "أ. عبد الله بارحيم",
      status: "present",
      note: "حاضر",
    },
  ]);

  const [selectedDate, setSelectedDate] = useState<string>("ALL");
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
  const [selectedSection, setSelectedSection] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesDate = selectedDate === "ALL" || r.date === selectedDate;
        const matchesGrade = selectedGrade === "ALL" || r.grade === selectedGrade;
        const matchesSection = selectedSection === "ALL" || r.section === selectedSection;
        const matchesStatus = selectedStatus === "ALL" || r.status === selectedStatus;
        const matchesSearch =
          !searchQuery.trim() ||
          r.studentName.includes(searchQuery) ||
          r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subject.includes(searchQuery);
        return matchesDate && matchesGrade && matchesSection && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
        return a.section.localeCompare(b.section);
      });
  }, [records, selectedDate, selectedGrade, selectedSection, selectedStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const presentCount = filteredRecords.filter((r) => r.status === "present").length;
    const absentCount = filteredRecords.filter((r) => r.status === "absent").length;
    const lateCount = filteredRecords.filter((r) => r.status === "late").length;
    const excusedCount = filteredRecords.filter((r) => r.status === "excused").length;
    const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

    return { total, presentCount, absentCount, lateCount, excusedCount, attendanceRate };
  }, [filteredRecords]);

  const handleUpdateStatus = (newStatus: "present" | "absent" | "late" | "excused", newNote: string) => {
    if (!editingRecord) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === editingRecord.id ? { ...r, status: newStatus, note: newNote } : r
      )
    );
    setEditingRecord(null);
  };

  const getStatusBadge = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-status-success/20 text-status-success border border-status-success/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            حاضر
          </span>
        );
      case "absent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-status-danger/20 text-status-danger border border-status-danger/30">
            <XCircle className="w-3.5 h-3.5" />
            غائب
          </span>
        );
      case "late":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-status-warning/20 text-status-warning border border-status-warning/30">
            <Clock className="w-3.5 h-3.5" />
            متأخر
          </span>
        );
      case "excused":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            <AlertCircle className="w-3.5 h-3.5" />
            بعذر معتمد
          </span>
        );
    }
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
                <CalendarDays className="w-6 h-6 text-brand-cyan" />
                كشوفات الحضور والغياب لجميع الطلاب
              </h1>
              <p className="text-xs text-muted">
                سجلات الحضور اليومية لكافة المراحل والشعب مرتبة بالتاريخ تنازلياً مع إمكانية التعديل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const csvHeader = "التاريخ,اليوم,اسم الطالب,رقم القيد,الصف,الشعبة,المادة,المعلم,الحالة\n";
                const csvRows = filteredRecords.map((r) =>
                  `"${r.date}","${r.dayName}","${r.studentName}","${r.username}","${r.grade}","${r.section}","${r.subject}","${r.teacherName}","${r.status}"`
                );
                const blob = new Blob(["\uFEFF" + csvHeader + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `attendance_${selectedDate}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-brand-teal" />
              <span>تصدير Excel/CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>طباعة الكشف</span>
            </button>
          </div>
        </div>

        {/* Attendance Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">إجمالي السجلات</span>
            <span className="text-2xl font-black text-foreground">{stats.total}</span>
            <span className="text-[11px] text-muted block mt-0.5">سجل يومي</span>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">نسبة الحضور</span>
            <span className="text-2xl font-black text-brand-cyan">{stats.attendanceRate}%</span>
            <span className="text-[11px] text-brand-cyan block mt-0.5">معدل الانضباط</span>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">الحاضرون</span>
            <span className="text-2xl font-black text-status-success">{stats.presentCount}</span>
            <span className="text-[11px] text-status-success block mt-0.5">في الموعد</span>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">الغياب</span>
            <span className="text-2xl font-black text-status-danger">{stats.absentCount}</span>
            <span className="text-[11px] text-status-danger block mt-0.5">بدون عذر</span>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">المتأخرون</span>
            <span className="text-2xl font-black text-status-warning">{stats.lateCount}</span>
            <span className="text-[11px] text-status-warning block mt-0.5">تأخر صباحي</span>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">غياب بعذر</span>
            <span className="text-2xl font-black text-brand-cyan">{stats.excusedCount}</span>
            <span className="text-[11px] text-brand-cyan block mt-0.5">معتمد إدارياً</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم الطالب أو المادة..."
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-semibold focus:outline-none focus:border-brand-cyan"
              >
                <option value="ALL">جميع التواريخ (مرتبة بالأحدث)</option>
                <option value="2026-11-23">اليوم — الإثنين 23 نوفمبر 2026</option>
                <option value="2026-11-22">أمس — الأحد 22 نوفمبر 2026</option>
                <option value="2026-11-21">السبت 21 نوفمبر 2026</option>
              </select>
            </div>

            <div>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-semibold focus:outline-none focus:border-brand-cyan"
              >
                <option value="ALL">جميع المراحل والصفوف</option>
                <option value="الثالث الثانوي">الثالث الثانوي</option>
                <option value="الثاني الثانوي">الثاني الثانوي</option>
                <option value="الأول الثانوي">الأول الثانوي</option>
              </select>
            </div>

            <div>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-semibold focus:outline-none focus:border-brand-cyan"
              >
                <option value="ALL">جميع الشعب</option>
                <option value="الشعبة (أ)">الشعبة (أ)</option>
                <option value="الشعبة (ب)">الشعبة (ب)</option>
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-semibold focus:outline-none focus:border-brand-cyan"
              >
                <option value="ALL">كل حالات الحضور</option>
                <option value="present">حاضر فقط</option>
                <option value="absent">غائب فقط</option>
                <option value="late">متأخر فقط</option>
                <option value="excused">بعذر فقط</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-cyan" />
              كشف الحضور المدرسي المرتب بالتاريخ
            </h3>
            <span className="text-xs text-muted font-bold">
              عرض {filteredRecords.length} سجل
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-surface-secondary/70 border-b border-border text-muted font-bold">
                  <th className="py-3 px-4">التاريخ واليوم</th>
                  <th className="py-3 px-4">الطالب ورقم القيد</th>
                  <th className="py-3 px-4">الصف والشعبة</th>
                  <th className="py-3 px-4">المادة والحصة</th>
                  <th className="py-3 px-4">المعلم الراصد</th>
                  <th className="py-3 px-4 text-center">حالة الحضور</th>
                  <th className="py-3 px-4">الملاحظات</th>
                  <th className="py-3 px-4 text-center">تعديل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted">
                      لا توجد سجلات مطابقة للفلاتر المختارة.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-secondary/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-foreground block">{r.date}</span>
                        <span className="text-[11px] text-muted">{r.dayName}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-foreground block">{r.studentName}</span>
                        <span className="text-[11px] text-brand-cyan font-mono" dir="ltr">
                          @{r.username}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-foreground block">{r.grade}</span>
                        <span className="text-[11px] text-muted">{r.section}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-foreground block">{r.subject}</span>
                        <span className="text-[11px] text-brand-teal">{r.period}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-muted">
                        {r.teacherName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="py-3.5 px-4 text-muted max-w-[200px] truncate">
                        {r.note || "—"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setEditingRecord(r)}
                          className="p-1.5 rounded-lg bg-surface-secondary hover:bg-surface hover:text-brand-cyan border border-border text-muted transition-colors"
                          title="تعديل حالة الحضور"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
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

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-cyan" />
                تعديل حالة الحضور للطالب
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-secondary border border-border">
                <span className="text-muted block">الطالب:</span>
                <span className="font-bold text-foreground text-sm">{editingRecord.studentName}</span>
                <span className="text-muted block mt-1">
                  {editingRecord.grade} • {editingRecord.section} • {editingRecord.date}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  حالة الحضور
                </label>
                <select
                  id="modal-status-select"
                  defaultValue={editingRecord.status}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                >
                  <option value="present">حاضر</option>
                  <option value="absent">غائب بدون عذر</option>
                  <option value="late">متأخر</option>
                  <option value="excused">غياب بعذر معتمد</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  الملاحظات الإدارية
                </label>
                <textarea
                  id="modal-note-input"
                  defaultValue={editingRecord.note || ""}
                  rows={3}
                  placeholder="سبب التعديل أو تفاصيل العذر..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const s = (document.getElementById("modal-status-select") as HTMLSelectElement).value;
                    const n = (document.getElementById("modal-note-input") as HTMLTextAreaElement).value;
                    handleUpdateStatus(s as any, n);
                  }}
                  className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold shadow-glow"
                >
                  حفظ التعديل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation user={admin} />
    </div>
  );
}
