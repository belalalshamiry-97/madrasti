"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  UserPlus,
  KeyRound,
  CheckCircle2,
  ChevronRight,
  Search,
  Filter,
  GraduationCap,
  BookOpen,
  X,
  CheckSquare,
  Square,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  Key,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { UserRole } from "@/types/database.types";
import { AppUser, getActiveUser } from "@/lib/user-store";
import {
  getProfilesFromDB,
  createUserInDB,
  updateUserStatusInDB,
  deleteUserFromDB,
  updateStudentAction,
  updateUserAction,
  getEnrolledStudentsFromDB,
  EnrolledStudentData,
} from "@/lib/services/users-service";
import {
  getGradeLevelsFromDB,
  getSectionsFromDB,
  AcademicGradeData,
  AcademicSectionData,
} from "@/lib/services/academic-service";
import { cn } from "@/lib/utils";

// Available granular permissions in the school LMS
const SYSTEM_PERMISSIONS = [
  { id: "manage_classes", label: "إدارة الصفوف والشعب" },
  { id: "view_attendance", label: "كشوفات الحضور والغياب" },
  { id: "manage_grades", label: "رصد واعتماد الدرجات" },
  { id: "broadcast_announcements", label: "إرسال الإعلانات والتعاميم" },
  { id: "manage_users", label: "إدارة حسابات وصلاحيات المستخدمين" },
  { id: "assign_teachers", label: "إسناد المعلمين للمناهج" },
  { id: "view_reports", label: "عرض التقارير والمؤشرات" },
] as const;

export default function AdminUsersPermissionsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>({
    full_name: "مدير المدرسة",
    role: "ADMIN",
  });

  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [gradesList, setGradesList] = useState<AcademicGradeData[]>([]);
  const [sectionsList, setSectionsList] = useState<AcademicSectionData[]>([]);
  const [enrolledStudentsMap, setEnrolledStudentsMap] = useState<Record<string, EnrolledStudentData>>({});

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [dbProfiles, dbGrades, dbSections, dbEnrolled] = await Promise.all([
        getProfilesFromDB(),
        getGradeLevelsFromDB(),
        getSectionsFromDB(),
        getEnrolledStudentsFromDB(),
      ]);

      setGradesList(dbGrades);
      setSectionsList(dbSections);

      const enrolledMap: Record<string, EnrolledStudentData> = {};
      dbEnrolled.forEach((s) => {
        enrolledMap[s.id] = s;
      });
      setEnrolledStudentsMap(enrolledMap);

      if (dbGrades.length > 0) {
        setNewGradeId(dbGrades[0].id);
        const matchSec = dbSections.filter((s) => s.grade_level_id === dbGrades[0].id);
        if (matchSec.length > 0) setNewSectionId(matchSec[0].id);
      }

      const mapped: AppUser[] = dbProfiles.map((p) => {
        const studentInfo = enrolledMap[p.id];
        return {
          id: p.id,
          full_name: p.full_name,
          username: p.username,
          role: p.role,
          phone: p.phone || "",
          password: "",
          grade: studentInfo?.grade_name,
          section: studentInfo?.section_name,
          permissions:
            p.role === "ADMIN"
              ? SYSTEM_PERMISSIONS.map((sp) => sp.id)
              : ["view_attendance", "manage_grades"],
          status: p.is_active ? "active" : "suspended",
          created_at: p.created_at,
        };
      });
      setUsersList(mapped);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const active = getActiveUser("ADMIN");
    if (active) setAdminUser(active);
    loadUsers();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<AppUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AppUser | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");

  // Edit User Modal State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGradeId, setEditGradeId] = useState("");
  const [editSectionId, setEditSectionId] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // New User Form State with Password
  const [newFullName, setNewFullName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>("TEACHER");
  const [newPhone, setNewPhone] = useState("");
  const [newGradeId, setNewGradeId] = useState("");
  const [newSectionId, setNewSectionId] = useState("");
  const [newSelectedPermissions, setNewSelectedPermissions] = useState<string[]>([
    "view_attendance",
    "manage_grades",
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTogglePermissionInNew = (permId: string) => {
    setNewSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleTogglePermissionInEdit = (permId: string) => {
    if (!editingPermissionsUser) return;
    const current = editingPermissionsUser.permissions || [];
    const updated = current.includes(permId)
      ? current.filter((p) => p !== permId)
      : [...current, permId];

    setEditingPermissionsUser({
      ...editingPermissionsUser,
      permissions: updated,
    });
  };

  const handleOpenEditUser = (u: AppUser) => {
    setEditingUser(u);
    setEditFullName(u.full_name);
    setEditPhone(u.phone || "");
    setEditIsActive(u.status === "active");

    if (u.role === "STUDENT") {
      const studentInfo = enrolledStudentsMap[u.id];
      const targetGradeId = studentInfo?.grade_level_id || (gradesList.length > 0 ? gradesList[0].id : "");
      setEditGradeId(targetGradeId);

      const matching = sectionsList.filter((s) => s.grade_level_id === targetGradeId);
      if (studentInfo?.section_id && matching.some((s) => s.id === studentInfo.section_id)) {
        setEditSectionId(studentInfo.section_id);
      } else if (matching.length > 0) {
        setEditSectionId(matching[0].id);
      } else {
        setEditSectionId("");
      }
    }

    setModalError(null);
    setIsEditUserModalOpen(true);
  };

  const handleEditGradeChange = (gradeId: string) => {
    setEditGradeId(gradeId);
    const matching = sectionsList.filter((s) => s.grade_level_id === gradeId);
    if (matching.length > 0) {
      setEditSectionId(matching[0].id);
    } else {
      setEditSectionId("");
    }
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editFullName.trim()) {
      setModalError("اسم المستخدم مطلوب.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      if (editingUser.role === "STUDENT") {
        if (!editSectionId) {
          setModalError("يرجى اختيار الشعبة المحددة للطالب.");
          setIsSubmitting(false);
          return;
        }

        const res = await updateStudentAction({
          student_id: editingUser.id,
          full_name: editFullName.trim(),
          phone: editPhone.trim(),
          section_id: editSectionId,
          is_active: editIsActive,
        });

        if (!res.success) {
          setModalError(res.error || "فشل تحديث بيانات الطالب.");
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await updateUserAction({
          user_id: editingUser.id,
          full_name: editFullName.trim(),
          phone: editPhone.trim(),
          is_active: editIsActive,
        });

        if (!res.success) {
          setModalError(res.error || "فشل تحديث بيانات المستخدم.");
          setIsSubmitting(false);
          return;
        }
      }

      showToast(`✅ تم تحديث بيانات "${editFullName.trim()}" بنجاح في Supabase!`);
      setIsEditUserModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      setModalError(err.message || "حدث خطأ أثناء حفظ التعديلات.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEditedPermissions = () => {
    if (!editingPermissionsUser) return;
    showToast(`تم تحديث صلاحيات "${editingPermissionsUser.full_name}" بنجاح!`);
    setEditingPermissionsUser(null);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newPasswordValue.trim()) return;
    showToast(`تم تغيير كلمة المرور لـ "${resetPasswordUser.full_name}" بنجاح!`);
    setResetPasswordUser(null);
    setNewPasswordValue("");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newFullName.trim() || !newUsername.trim()) {
      setModalError("يرجى إدخال الاسم الرباعي واسم المستخدم.");
      return;
    }

    if (!newPassword.trim()) {
      setModalError("يرجى إدخال كلمة المرور الأولية للحساب.");
      return;
    }

    if (newPassword.trim().length < 6) {
      setModalError("كلمة المرور قصيرة جداً: تشترط منصة Supabase أن تتكون كلمة المرور من 6 خانات أو أحرف على الأقل.");
      return;
    }

    if (newRole === "STUDENT" && !newSectionId) {
      setModalError("يرجى اختيار الصف والشعبة الدراسية للطالب.");
      return;
    }

    const cleanUsername = newUsername.trim().toLowerCase();

    // Check if username already exists
    if (usersList.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setModalError("اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم مستخدم آخر.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createUserInDB({
        full_name: newFullName.trim(),
        username: cleanUsername,
        password: newPassword.trim(),
        role: newRole,
        phone: newPhone.trim() || "770000000",
        grade_id: newRole === "STUDENT" ? newGradeId : undefined,
        section_id: newRole === "STUDENT" ? newSectionId : undefined,
        permissions: newRole === "ADMIN" ? SYSTEM_PERMISSIONS.map((p) => p.id) : newSelectedPermissions,
        status: "active",
      });

      if (!result.success) {
        setModalError(result.error || "فشل إنشاء المستخدم في قاعدة البيانات.");
        return;
      }

      await loadUsers();
      setIsAddModalOpen(false);
      setModalError(null);
      setNewFullName("");
      setNewUsername("");
      setNewPassword("");
      setNewPhone("");
      setNewSelectedPermissions(["view_attendance", "manage_grades"]);
      showToast(`✅ تم إنشاء المستخدم "${result.user?.full_name}" بنجاح وحفظه في Supabase!`);
    } catch (err: any) {
      setModalError(err.message || "حدث خطأ غير متوقع أثناء حفظ المستخدم.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={adminUser} onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={adminUser} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
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
                <Shield className="w-6 h-6 text-status-warning" />
                إدارة المستخدمين، كلمات المرور، والصلاحيات
              </h1>
              <p className="text-xs text-muted">
                إضافة المعلمين والطلاب وتعيين كلمات المرور المباشرة وتحديد الصلاحيات المتعددة
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-glow transition-all"
          >
            <UserPlus className="w-4 h-4" />
            إضافة مستخدم وتعيين كلمة المرور
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم أو اسم المستخدم..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setRoleFilter("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-colors",
                roleFilter === "ALL"
                  ? "bg-brand-cyan text-background font-bold shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              )}
            >
              الكل ({usersList.length})
            </button>
            <button
              onClick={() => setRoleFilter("ADMIN")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1",
                roleFilter === "ADMIN"
                  ? "bg-status-warning text-background font-bold shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              المديرون ({usersList.filter((u) => u.role === "ADMIN").length})
            </button>
            <button
              onClick={() => setRoleFilter("TEACHER")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1",
                roleFilter === "TEACHER"
                  ? "bg-brand-teal text-background font-bold shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              المعلمون ({usersList.filter((u) => u.role === "TEACHER").length})
            </button>
            <button
              onClick={() => setRoleFilter("STUDENT")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1",
                roleFilter === "STUDENT"
                  ? "bg-brand-cyan text-background font-bold shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              )}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              الطلاب ({usersList.filter((u) => u.role === "STUDENT").length})
            </button>
          </div>
        </div>

        {/* Users List Card */}
        <div className="p-4 sm:p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <div className="hidden sm:grid sm:grid-cols-12 text-xs font-bold text-muted pb-3 border-b border-border">
            <span className="col-span-4">المستخدم والحساب</span>
            <span className="col-span-2 text-center">الدور وكلمة المرور</span>
            <span className="col-span-3 text-center">الصلاحيات المحددة</span>
            <span className="col-span-3 text-left">إجراءات الإدارة</span>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((userItem) => (
              <div
                key={userItem.id}
                className="p-4 rounded-2xl bg-surface-secondary/50 border border-border flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-3 transition-colors hover:border-brand-cyan/30"
              >
                {/* User Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                      userItem.role === "ADMIN"
                        ? "bg-status-warning/20 text-status-warning border border-status-warning/40"
                        : userItem.role === "TEACHER"
                        ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/40"
                        : "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40"
                    )}
                  >
                    {userItem.role === "ADMIN" ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      userItem.full_name.slice(0, 1)
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      {userItem.full_name}
                      {userItem.role === "ADMIN" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-status-warning/20 text-status-warning font-black">
                          مدير
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-muted block" dir="ltr">
                      @{userItem.username} • {userItem.phone || "لا يوجد هاتف"}
                      {userItem.role === "STUDENT" && userItem.grade && (
                        <span className="font-semibold text-brand-cyan mr-1.5" dir="rtl">
                          • {userItem.grade} {userItem.section ? `(شعبة ${userItem.section})` : ""}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Role Pill & Password indicator */}
                <div className="col-span-2 text-center space-y-1">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-bold inline-block",
                      userItem.role === "ADMIN"
                        ? "bg-status-warning/20 text-status-warning border border-status-warning/40"
                        : userItem.role === "TEACHER"
                        ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/40"
                        : "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40"
                    )}
                  >
                    {userItem.role}
                  </span>
                  <span className="block text-[10px] text-muted font-mono" dir="ltr">
                    كلمة المرور: ••••
                  </span>
                </div>

                {/* Multiple Permissions Badges */}
                <div className="col-span-3 flex flex-wrap gap-1 justify-center sm:justify-start">
                  {userItem.role === "STUDENT" ? (
                    <span className="text-[11px] text-muted">صلاحيات التعلم الأساسية</span>
                  ) : userItem.role === "ADMIN" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-warning/15 text-status-warning border border-status-warning/30">
                      كامل الصلاحيات (7)
                    </span>
                  ) : (
                    (userItem.permissions || []).map((pId) => {
                      const pObj = SYSTEM_PERMISSIONS.find((p) => p.id === pId);
                      return (
                        <span
                          key={pId}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-surface border border-border text-brand-cyan"
                        >
                          {pObj ? pObj.label : pId}
                        </span>
                      );
                    })
                  )}
                </div>

                {/* Action Buttons */}
                <div className="col-span-3 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditUser(userItem)}
                    className="px-2.5 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground text-xs font-bold flex items-center gap-1 transition-colors"
                    title="تعديل البيانات والصف والشعبة"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-brand-teal" />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => setResetPasswordUser(userItem)}
                    className="px-2.5 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-muted hover:text-foreground text-xs font-bold flex items-center gap-1 transition-colors"
                    title="تغيير كلمة المرور"
                  >
                    <Key className="w-3.5 h-3.5 text-status-warning" />
                    <span>تغيير المرور</span>
                  </button>

                  {userItem.role !== "STUDENT" && (
                    <button
                      onClick={() => setEditingPermissionsUser(userItem)}
                      className="px-2.5 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>الصلاحيات</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DeveloperFooter />
      </main>

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-status-warning" />
                <h3 className="text-base font-bold text-foreground">
                  تغيير كلمة المرور
                </h3>
              </div>
              <button
                onClick={() => setResetPasswordUser(null)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-secondary border border-border">
                <span className="text-muted block">المستخدم:</span>
                <span className="font-bold text-foreground text-sm">
                  {resetPasswordUser.full_name} (@{resetPasswordUser.username})
                </span>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="text"
                  required
                  placeholder="أدخل كلمة المرور الجديدة..."
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-brand-cyan"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold shadow-glow"
                >
                  تحديث كلمة المرور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editingPermissionsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-status-warning" />
                <h3 className="text-base font-bold text-foreground">
                  تحديد الصلاحيات الممنوحة
                </h3>
              </div>
              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-secondary border border-border">
                <span className="text-muted block">المستخدم:</span>
                <span className="font-bold text-foreground text-sm">
                  {editingPermissionsUser.full_name} (@{editingPermissionsUser.username})
                </span>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-2">
                  اختر الصلاحيات المتاحة لهذا الحساب (تحديد متعدد):
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {SYSTEM_PERMISSIONS.map((perm) => {
                    const isChecked = (editingPermissionsUser.permissions || []).includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermissionInEdit(perm.id)}
                        className={cn(
                          "p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                          isChecked
                            ? "bg-brand-cyan/15 border-brand-cyan/40 text-foreground"
                            : "bg-surface-secondary/50 border-border text-muted hover:border-brand-cyan/20"
                        )}
                      >
                        <span className="font-semibold">{perm.label}</span>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-brand-cyan" />
                        ) : (
                          <Square className="w-4 h-4 text-muted" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingPermissionsUser(null)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedPermissions}
                  className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold shadow-glow"
                >
                  حفظ الصلاحيات المحددة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal with Mandatory Password */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-cyan" />
                إضافة مستخدم جديد وتعيين كلمة المرور
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setModalError(null);
                }}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  الاسم الرباعي الكامل
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أ. سالم محمد باوزير"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    اسم المستخدم (Login Username)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="salem2026"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-brand-cyan"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    placeholder="777123456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-brand-cyan"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password Field - Clear & Explicit */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  تعيين كلمة المرور الأولية للحساب (6 خانات أو أكثر)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="اكتب 6 أحرف أو أرقام على الأقل..."
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    className="w-full pr-3 pl-10 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-brand-cyan"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-muted block mt-1">
                  * متطلب أمني: كلمة المرور في Supabase يجب ألا تقل عن 6 أحرف/أرقام.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  نوع الحساب الأساسي والصلاحية
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                >
                  <option value="TEACHER">معلم (كادر تعليمي وتدريس)</option>
                  <option value="ADMIN">مدير المدرسة (إدارة عامة وصلاحيات كاملة)</option>
                  <option value="STUDENT">طالب (بوابة التعلم والواجبات)</option>
                </select>
              </div>

              {newRole === "STUDENT" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      الصف الدراسي *
                    </label>
                    <select
                      required
                      value={newGradeId}
                      onChange={(e) => {
                        const gId = e.target.value;
                        setNewGradeId(gId);
                        const matchSecs = sectionsList.filter((s) => s.grade_level_id === gId);
                        if (matchSecs.length > 0) setNewSectionId(matchSecs[0].id);
                        else setNewSectionId("");
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                    >
                      {gradesList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      الشعبة الدراسية *
                    </label>
                    <select
                      required
                      value={newSectionId}
                      onChange={(e) => setNewSectionId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                    >
                      {sectionsList
                        .filter((s) => !newGradeId || s.grade_level_id === newGradeId)
                        .map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            شعبة {sec.name} {sec.track_name ? `(${sec.track_name})` : ""}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {newRole === "TEACHER" && (
                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    الصلاحيات الإضافية الممنوحة للمعلم:
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {SYSTEM_PERMISSIONS.map((perm) => {
                      const isChecked = newSelectedPermissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleTogglePermissionInNew(perm.id)}
                          className={cn(
                            "p-2 rounded-xl border flex items-center justify-between cursor-pointer text-[11px]",
                            isChecked
                              ? "bg-brand-cyan/15 border-brand-cyan/40 text-foreground"
                              : "bg-surface-secondary/40 border-border text-muted"
                          )}
                        >
                          <span>{perm.label}</span>
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-brand-cyan" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-muted" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ في قاعدة البيانات...</span>
                    </>
                  ) : (
                    <span>حفظ المستخدم وتعيين كلمة المرور</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal (Personal info & Grade/Section transfer for students) */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-brand-teal" />
                تعديل بيانات المستخدم ({editingUser.role === "STUDENT" ? "طالب" : editingUser.role === "TEACHER" ? "معلم" : "مدير"})
              </h3>
              <button
                onClick={() => {
                  setIsEditUserModalOpen(false);
                  setEditingUser(null);
                  setModalError(null);
                }}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-surface-secondary border border-border text-xs flex justify-between">
              <span className="text-muted">اسم المستخدم:</span>
              <span className="font-mono font-bold text-brand-cyan" dir="ltr">@{editingUser.username}</span>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  الاسم الرباعي الكامل *
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-brand-teal"
                  dir="ltr"
                />
              </div>

              {editingUser.role === "STUDENT" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      الصف الدراسي *
                    </label>
                    <select
                      required
                      value={editGradeId}
                      onChange={(e) => handleEditGradeChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                    >
                      {gradesList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      الشعبة الدراسية *
                    </label>
                    <select
                      required
                      value={editSectionId}
                      onChange={(e) => setEditSectionId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                    >
                      {sectionsList
                        .filter((s) => !editGradeId || s.grade_level_id === editGradeId)
                        .map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            شعبة {sec.name} {sec.track_name ? `(${sec.track_name})` : ""}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-teal focus:ring-0"
                />
                <label htmlFor="userIsActive" className="text-foreground font-medium cursor-pointer">
                  حساب نشط ويمكنه الدخول للمنصة
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditUserModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-teal text-background font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التحديث في Supabase...</span>
                    </>
                  ) : (
                    <span>تأكيد التعديل</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavigation user={adminUser} />
    </div>
  );
}
