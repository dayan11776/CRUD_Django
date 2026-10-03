import React, { useState, useEffect } from "react";
import { UserProfile, ProfileFormData } from "./types/profile";
import {
  createProfile,
  deleteProfile,
  fetchProfiles,
  fetchProfileStats,
  ProfileStats,
  updateProfile,
} from "./api/profileApi";
import { Navbar } from "./components/Navbar";
import { ProfileForm } from "./components/ProfileForm";
import { ProfileTable } from "./components/ProfileTable";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import {
  NotificationToast,
  ToastMessage,
} from "./components/NotificationToast";
import { Users, UserCheck, Clock, Activity } from "lucide-react";

export default function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(
    null,
  );
  const [deletingProfile, setDeletingProfile] = useState<UserProfile | null>(
    null,
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const [nextProfiles, nextStats] = await Promise.all([
          fetchProfiles(),
          fetchProfileStats(),
        ]);
        setProfiles(nextProfiles);
        setProfileStats(nextStats);
      } catch (error) {
        showToast(
          "error",
          "Unable to load profiles",
          error instanceof Error
            ? error.message
            : "The backend API request failed.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const refreshProfileStats = async () => {
    try {
      setProfileStats(await fetchProfileStats());
    } catch (error) {
      showToast(
        "error",
        "Unable to refresh statistics",
        error instanceof Error
          ? error.message
          : "The backend API request failed.",
      );
    }
  };

  const showToast = (
    type: "success" | "error" | "info",
    title: string,
    message?: string,
  ) => {
    setToast({
      id: Math.random().toString(),
      type,
      title,
      message,
    });
  };

  const handleSaveProfile = async (formData: ProfileFormData) => {
    try {
      if (editingProfile) {
        const updatedProfile = await updateProfile(editingProfile.id, formData);
        setProfiles((prev) =>
          prev.map((profile) =>
            profile.id === updatedProfile.id ? updatedProfile : profile,
          ),
        );
        void refreshProfileStats();
        showToast(
          "success",
          "Profile Updated",
          `${formData.fullName}'s profile was updated successfully.`,
        );
        setEditingProfile(null);
      } else {
        const newProfile = await createProfile(formData);
        setProfiles((prev) => [newProfile, ...prev]);
        void refreshProfileStats();
        showToast(
          "success",
          "Profile Saved",
          `${formData.fullName} has been added to the directory.`,
        );
      }

      const tableElem = document.getElementById("profile-directory");
      if (tableElem) {
        setTimeout(() => {
          tableElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch (error) {
      showToast(
        "error",
        "Save failed",
        error instanceof Error ? error.message : "Unable to save the profile.",
      );
    }
  };

  const handleEditProfile = (profile: UserProfile) => {
    setEditingProfile(profile);
    const formElem = document.getElementById("profile-form");
    if (formElem) {
      formElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    showToast(
      "info",
      "Edit Mode Active",
      `Editing ${profile.fullName}. Make adjustments above.`,
    );
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    showToast(
      "info",
      "Edit Cancelled",
      "Form returned to new profile entry mode.",
    );
  };

  const handleDeleteProfile = (profile: UserProfile) => {
    setDeletingProfile(profile);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProfile) return;

    try {
      await deleteProfile(deletingProfile.id);
      const name = deletingProfile.fullName;
      setProfiles((prev) =>
        prev.filter((profile) => profile.id !== deletingProfile.id),
      );
      void refreshProfileStats();
      if (editingProfile?.id === deletingProfile.id) {
        setEditingProfile(null);
      }
      setDeletingProfile(null);
      showToast(
        "success",
        "Profile Deleted",
        `${name} has been removed from the directory.`,
      );
    } catch (error) {
      showToast(
        "error",
        "Delete failed",
        error instanceof Error
          ? error.message
          : "Unable to delete the profile.",
      );
    }
  };

  const scrollToForm = () => {
    setEditingProfile(null);
    const formElem = document.getElementById("profile-form");
    if (formElem) {
      formElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        profileCount={profileStats?.total ?? 0}
        onNewProfileClick={scrollToForm}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <section
          aria-label="Overview"
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              User Profile Management
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Create, update, search, and manage user profile entries. Fill in
              user credentials, upload a circular profile portrait, and view
              dynamic directory records.
            </p>
          </div>
        </section>

        {/* Metric Cards - 4 Key Stats */}
        <section
          aria-label="Key statistics"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Total Profiles
              </p>
              <p className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {isLoading ? "—" : (profileStats?.total ?? "—")}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Active Members
              </p>
              <p className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                {isLoading ? "—" : (profileStats?.active ?? "—")}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Pending Review
              </p>
              <p className="text-xl font-bold font-mono text-amber-700 tabular-nums">
                {isLoading ? "—" : (profileStats?.pending ?? "—")}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Inactive Review
              </p>
              <p className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {isLoading ? "—" : (profileStats?.inactive ?? "—")}
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Profile Form (At the top) */}
        <ProfileForm
          editingProfile={editingProfile}
          onSave={handleSaveProfile}
          onCancelEdit={handleCancelEdit}
        />

        {/* Section 2: Submitted Profiles Table (Below the form) */}
        <ProfileTable
          profiles={profiles}
          onEdit={handleEditProfile}
          onDelete={handleDeleteProfile}
          onAddNew={scrollToForm}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 ProfileCraft. All user rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Responsive Dashboard</span>
            <span>·</span>
            <span>Accessibility Checked</span>
            <span>·</span>
            <span>WCAG AA Contrast</span>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal for Delete */}
      <DeleteConfirmModal
        profile={deletingProfile}
        isOpen={!!deletingProfile}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProfile(null)}
      />

      {/* Toast Feedback */}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
