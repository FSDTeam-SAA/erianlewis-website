"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  Home,
  Loader2,
  Lock,
  Plus,
  Settings,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { LogoutConfirmDialog } from "@/components/shared/LogoutConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DashboardRole = "LANDLORD" | "AGENT";

type DashboardStat = {
  label: string;
  value: string;
  helper?: string;
  icon: typeof Home;
  iconClassName: string;
};

type QuickAction = {
  title: string;
  description: string;
  icon: typeof Home;
  iconClassName: string;
};

type AppointmentDay = {
  day: string;
  date: string;
  label: string;
  appointments: string;
  isToday?: boolean;
  isActive?: boolean;
};

const dashboardContent: Record<
  DashboardRole,
  {
    subtitle: string;
    tabs: Array<{ label: string; icon: typeof Home }>;
    stats: DashboardStat[];
    quickActions: QuickAction[];
    analyticsText: string;
    activities: string[];
  }
> = {
  LANDLORD: {
    subtitle: "Monitor listings, bookings, and renter activity in one place.",
    tabs: [
      { label: "Overview", icon: BarChart3 },
      { label: "Rentals", icon: Home },
      { label: "Sales", icon: BriefcaseBusiness },
      { label: "Appointments", icon: CalendarDays },
      { label: "Inquiries", icon: ClipboardList },
      { label: "Profile", icon: UserRound },
    ],
    stats: [
      {
        label: "Total Properties",
        value: "0",
        icon: Home,
        iconClassName: "text-[#8BCCE6]",
      },
      {
        label: "Active Listing",
        value: "0",
        icon: CheckCircle2,
        iconClassName: "text-[#66D59A]",
      },
      {
        label: "Total Views",
        value: "---",
        helper: "Upgrade to Unlock",
        icon: Eye,
        iconClassName: "text-[#98A2B3]",
      },
      {
        label: "Pending Appointment",
        value: "0",
        icon: CalendarDays,
        iconClassName: "text-[#F2B94B]",
      },
    ],
    quickActions: [
      {
        title: "Add Rental Property",
        description: "List a new rental",
        icon: Home,
        iconClassName: "bg-[#EAF7FD] text-[#79C5E7]",
      },
      {
        title: "Add Sale Property",
        description: "List a property for sale",
        icon: BriefcaseBusiness,
        iconClassName: "bg-[#FFF1E8] text-[#F6855C]",
      },
      {
        title: "View all Properties",
        description: "Manage your listings",
        icon: Eye,
        iconClassName: "bg-[linear-gradient(135deg,#8BCCE6,#F6855C)] text-white",
      },
    ],
    analyticsText: "More reporting and deeper insights.",
    activities: [
      "No recent activity",
      "New inquiries and approvals will appear here once listings go live.",
    ],
  },
  AGENT: {
    subtitle: "Track managed properties, lead activity, and appointments at a glance.",
    tabs: [
      { label: "Overview", icon: BarChart3 },
      { label: "Properties", icon: Home },
      { label: "Clients", icon: UserRound },
      { label: "Appointments", icon: CalendarDays },
      { label: "Reports", icon: ClipboardList },
      { label: "Profile", icon: Settings },
    ],
    stats: [
      {
        label: "Managed Properties",
        value: "0",
        icon: Home,
        iconClassName: "text-[#8BCCE6]",
      },
      {
        label: "Active Deals",
        value: "0",
        icon: CheckCircle2,
        iconClassName: "text-[#66D59A]",
      },
      {
        label: "Client Views",
        value: "---",
        helper: "Upgrade to Unlock",
        icon: Eye,
        iconClassName: "text-[#98A2B3]",
      },
      {
        label: "Pending Appointment",
        value: "0",
        icon: CalendarDays,
        iconClassName: "text-[#F2B94B]",
      },
    ],
    quickActions: [
      {
        title: "Add Client Listing",
        description: "Publish a managed property",
        icon: Home,
        iconClassName: "bg-[#EAF7FD] text-[#79C5E7]",
      },
      {
        title: "Schedule Showing",
        description: "Create a client appointment",
        icon: CalendarDays,
        iconClassName: "bg-[#FFF1E8] text-[#F6855C]",
      },
      {
        title: "View Pipeline",
        description: "Follow open opportunities",
        icon: BriefcaseBusiness,
        iconClassName: "bg-[linear-gradient(135deg,#8BCCE6,#F6855C)] text-white",
      },
    ],
    analyticsText: "Pipeline reporting and client engagement metrics.",
    activities: [
      "No recent activity",
      "Client interactions and report updates will appear here.",
    ],
  },
};

const appointmentDays: AppointmentDay[] = [
  { day: "WED", date: "18", label: "Feb 18", appointments: "0 appointments", isToday: true, isActive: true },
  { day: "WED", date: "18", label: "Feb 18", appointments: "0 appointments" },
  { day: "THU", date: "19", label: "Feb 19", appointments: "0 appointments" },
  { day: "FRI", date: "20", label: "Feb 20", appointments: "0 appointments" },
  { day: "SAT", date: "21", label: "Feb 21", appointments: "0 appointments" },
  { day: "SUN", date: "22", label: "Feb 22", appointments: "No appointments" },
  { day: "MON", date: "23", label: "Feb 23", appointments: "0 appointments" },
  { day: "TUE", date: "24", label: "Feb 24", appointments: "0 appointments" },
  { day: "WED", date: "25", label: "Feb 25", appointments: "0 appointments" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    if (session.user?.role === "USER") {
      router.replace("/account");
    }
  }, [router, session, status]);

  const dashboardRole = useMemo(() => {
    const role = session?.user?.role;
    return role === "AGENT" ? "AGENT" : "LANDLORD";
  }, [session?.user?.role]) as DashboardRole;

  const content = dashboardContent[dashboardRole];

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#E8825A]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
        <div className="w-full max-w-md rounded-[24px] border border-[#e6e8ec] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#98a2b3]">
            Dashboard
          </p>
          <h1 className="mt-3 text-2xl font-bold text-[#111827]">
            Sign in to continue
          </h1>
          <p className="mt-2 text-sm text-[#667085]">
            You need an account to access your dashboard.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white"
            style={{
              background:
                "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)",
            }}
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const displayName = session.user?.name || session.user?.email || "Welcome back";

  const handleLogout = async () => {
    try {
      setLogoutDialogOpen(false);
      toast.success("Logout successful!");
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f5f7] px-3 py-4 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <p className="mb-3 text-xs font-medium tracking-[0.08em] text-[#98a2b3]">
          Dashboard ( Overview )
        </p>

        <section className="overflow-hidden rounded-[28px] border border-[#e7eaef] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 border-b border-[#eef2f6] px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[#eceef2] bg-[#fbfcfd]">
                <Image src="/logo.png" alt="Alora" fill className="object-contain p-2" />
              </div>
              <div>
                <h1 className="text-[24px] font-bold leading-none text-[#111827]">
                  Dashboard
                </h1>
                <p className="mt-2 text-sm font-medium text-[#475467]">
                  Welcome back, {displayName}
                </p>
                <p className="mt-1 text-xs text-[#98a2b3]">{content.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-[#e5e7eb] bg-white px-4 text-xs font-semibold text-[#475467]"
              >
                <BookOpenCheck className="mr-2 h-4 w-4" />
                Saved Search
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-[#e5e7eb] bg-white px-4 text-xs font-semibold text-[#475467]"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                type="button"
                onClick={() => setLogoutDialogOpen(true)}
                className="h-10 rounded-xl px-4 text-xs font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)",
                }}
              >
                Logout
              </Button>
            </div>
          </div>

          <div className="border-b border-[#eef2f6] bg-[#fcfcfd] px-5 py-4 lg:px-8">
            <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#667085]">
              {content.tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = index === 0;

                return (
                  <button
                    key={tab.label}
                    type="button"
                    className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
                      isActive ? "text-[#8BCCE6]" : "hover:text-[#111827]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 bg-[#f8fafc] px-4 py-5 md:px-6 lg:px-8 lg:py-6">
            <section>
              <h2 className="mb-4 text-[22px] font-bold text-[#111827]">Overview</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {content.stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <article
                      key={stat.label}
                      className="rounded-[18px] border border-[#e5e7eb] bg-white px-4 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-[#667085]">
                            {stat.label}
                          </p>
                          <p className="mt-3 text-[32px] font-bold leading-none text-[#111827]">
                            {stat.value}
                          </p>
                          {stat.helper ? (
                            <p className="mt-2 text-[11px] font-medium text-[#98a2b3]">
                              {stat.helper}
                            </p>
                          ) : null}
                        </div>
                        <div className="rounded-full border border-[#eef2f6] p-2">
                          <Icon className={`h-4 w-4 ${stat.iconClassName}`} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-bold text-[#111827]">Quick Action</h2>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {content.quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.title}
                      type="button"
                      className="flex items-center gap-3 rounded-[18px] border border-[#e5e7eb] bg-white px-4 py-4 text-left shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-transform hover:-translate-y-0.5"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${action.iconClassName}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">
                          {action.title}
                        </p>
                        <p className="text-xs text-[#667085]">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[18px] border border-[#e5e7eb] bg-white px-4 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">Advanced analytics</h2>
                  <p className="mt-1 text-xs text-[#667085]">{content.analyticsText}</p>
                </div>
                <Button
                  type="button"
                  className="h-9 rounded-xl bg-[#111111] px-4 text-xs font-semibold text-white hover:bg-[#222222]"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Upgrade
                </Button>
              </div>
            </section>

            <section className="rounded-[18px] border border-[#e5e7eb] bg-white px-4 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">Weekly Appointments</h2>
                  <p className="mt-1 text-xs text-[#667085]">Next 7 days overview</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setAppointmentDialogOpen(true)}
                    className="h-9 rounded-xl bg-[#8BCCE6] px-4 text-xs font-semibold text-white hover:bg-[#75bddc]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-xl border-[#d8e4ec] bg-white px-4 text-xs font-semibold text-[#5d7285]"
                  >
                    View all
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {appointmentDays.map((day, index) => (
                  <div
                    key={`${day.label}-${index}`}
                    className={`grid grid-cols-[72px_1fr] items-center rounded-[14px] border px-3 py-3 ${
                      day.isActive
                        ? "border-[#bfe6f5] bg-[#eef8ff]"
                        : "border-[#edf1f5] bg-[#fbfcfd]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-[22px] rounded-md bg-[#89d3ef] px-1 py-1 text-center text-[9px] font-bold text-white">
                        <div>{day.day}</div>
                        <div>{day.date}</div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#111827]">
                          {day.label} {day.isToday ? <span className="text-[#8BCCE6]">Today</span> : null}
                        </p>
                        <p className="text-[11px] text-[#667085]">{day.appointments}</p>
                      </div>
                    </div>
                    <p className="text-center text-[12px] text-[#667085]">
                      {day.isActive ? "No appointment" : day.appointments}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-bold text-[#111827]">Recent Activity</h2>
              <div className="rounded-[18px] border border-[#e5e7eb] bg-white px-5 py-6 text-center shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-semibold text-[#111827]">{content.activities[0]}</p>
                <p className="mt-2 text-sm text-[#667085]">{content.activities[1]}</p>
              </div>
            </section>
          </div>
        </section>
      </div>

      <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
        <DialogContent className="max-w-[480px] rounded-[24px] border border-[#e6e8ec] bg-white p-0">
          <div className="px-6 pb-6 pt-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#111827]">
                Add Appointment
              </DialogTitle>
            </DialogHeader>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                Property*
                <select className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none">
                  <option>Select a property</option>
                </select>
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                  Date*
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                  Time*
                  <select className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none">
                    <option>Select a time</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                Your Name*
                <input
                  type="text"
                  placeholder="John Doe"
                  className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                Email*
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                Phone*
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                Notes (Optional)
                <textarea
                  placeholder="Any special requests or questions..."
                  className="min-h-[92px] rounded-xl border border-[#d0d5dd] px-3 py-3 text-sm text-[#667085] outline-none"
                />
              </label>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-[#d0d5dd] bg-white text-[#475467]"
                onClick={() => setAppointmentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-11 rounded-xl text-white"
                style={{
                  background:
                    "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)",
                }}
              >
                Add Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />
    </main>
  );
}
