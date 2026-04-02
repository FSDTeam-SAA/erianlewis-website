"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Minus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

interface ScheduleViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle?: string;
}

interface SlotItem {
  start: string;
  end: string;
}

interface AvailableSlotsResponse {
  available: boolean;
  reason?: string;
  slots: SlotItem[];
  bookedTimes?: string[];
}

const getTodayDate = () => new Date().toISOString().split("T")[0];

const formatTimeLabel = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export function ScheduleViewingModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
}: ScheduleViewingModalProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    customerName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData((prev) => ({
      ...prev,
      customerName: session?.user?.name || prev.customerName,
      email: session?.user?.email || prev.email,
      notes:
        prev.notes ||
        `I am interested in viewing ${propertyTitle || "this property"}.`,
    }));
  }, [isOpen, propertyTitle, session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        date: "",
        time: "",
        customerName: "",
        email: "",
        phone: "",
        notes: "",
      });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const slotsQuery = useQuery({
    queryKey: ["available-slots", propertyId, formData.date],
    queryFn: async () => {
      const params = new URLSearchParams({
        propertyId,
        date: formData.date,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/available-slots?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      const payload = await response.json();
      if (!response.ok || !payload?.status) {
        throw new Error(payload?.message || "Failed to load available slots");
      }

      return payload.data as AvailableSlotsResponse;
    },
    enabled: isOpen && Boolean(propertyId) && Boolean(formData.date),
  });

  const availableSlots = useMemo(
    () => slotsQuery.data?.slots || [],
    [slotsQuery.data?.slots],
  );

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.date ||
      !formData.time ||
      !formData.customerName ||
      !formData.email ||
      !formData.phone
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            propertyId,
            date: formData.date,
            time: formData.time,
            customerName: formData.customerName,
            email: formData.email,
            phone: formData.phone,
            notes: formData.notes,
          }),
        },
      );

      const payload = await response.json();
      if (!response.ok || !payload?.status) {
        throw new Error(payload?.message || "Failed to book appointment");
      }

      toast.success("Viewing request submitted successfully");
      slotsQuery.refetch();
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to book appointment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-x-4 top-1/2 z-50 w-auto max-w-[calc(100vw-32px)] -translate-y-1/2 rounded-3xl border border-[#e8edf3] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.16)] md:left-1/2 md:right-auto md:w-[460px] md:-translate-x-1/2">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-extrabold tracking-tight text-[#111827]">
              Schedule Viewing
            </h3>
            <p className="mt-1 text-[13px] font-medium text-[#6b7280]">
              Book a preferred date and time for{" "}
              {propertyTitle || "this property"}.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 transition-colors hover:text-gray-900"
              aria-label="Minimize modal"
            >
              <Minus size={20} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 transition-colors hover:text-gray-900"
              aria-label="Close modal"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="mb-1.5 block text-[13px] font-bold text-[#6b7280]">
            Preferred Date*
          </label>
          <input
            type="date"
            min={getTodayDate()}
            value={formData.date}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                date: event.target.value,
                time: "",
              }))
            }
            className="mb-4 w-full rounded-xl border border-[#dfe5ec] px-4 py-3 text-[14px] font-medium text-[#111827] outline-none transition-all focus:border-[#8BCCE6] focus:ring-2 focus:ring-[#8BCCE6]/15"
          />

          <label className="mb-1.5 block text-[13px] font-bold text-[#6b7280]">
            Preferred Time*
          </label>
          <select
            value={formData.time}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, time: event.target.value }))
            }
            disabled={!formData.date || slotsQuery.isLoading || !availableSlots.length}
            className="mb-2 w-full cursor-pointer rounded-xl border border-[#dfe5ec] bg-white px-4 py-3 text-[14px] font-medium text-[#111827] outline-none transition-all focus:border-[#8BCCE6] focus:ring-2 focus:ring-[#8BCCE6]/15 disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:text-[#9ca3af]"
          >
            <option value="">
              {formData.date ? "Select a time" : "Select a date first"}
            </option>
            {availableSlots.map((slot) => (
              <option key={`${slot.start}-${slot.end}`} value={slot.start}>
                {formatTimeLabel(slot.start)} - {formatTimeLabel(slot.end)}
              </option>
            ))}
          </select>

          <div className="mb-4 min-h-[40px]">
            {!formData.date ? (
              <p className="text-[12px] font-medium text-[#9ca3af]">
                Pick a date to load available time slots.
              </p>
            ) : slotsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#6b7280]">
                <Loader2 className="h-4 w-4 animate-spin text-[#8BCCE6]" />
                Loading available slots...
              </div>
            ) : slotsQuery.isError ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#f3c7ba] bg-[#fff7f2] px-3 py-2">
                <p className="text-[12px] font-medium text-[#6b7280]">
                  {slotsQuery.error instanceof Error
                    ? slotsQuery.error.message
                    : "Failed to load available slots."}
                </p>
                <button
                  type="button"
                  onClick={() => slotsQuery.refetch()}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#f6855c]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            ) : slotsQuery.data?.available === false ? (
              <p className="rounded-xl border border-[#eef2f6] bg-[#f8fafc] px-3 py-2 text-[12px] font-medium text-[#6b7280]">
                {slotsQuery.data.reason || "No slots available for this date."}
              </p>
            ) : availableSlots.length ? (
              <p className="text-[12px] font-medium text-[#6b7280]">
                {availableSlots.length} slot
                {availableSlots.length > 1 ? "s" : ""} available for the selected
                date.
              </p>
            ) : (
              <p className="rounded-xl border border-[#eef2f6] bg-[#f8fafc] px-3 py-2 text-[12px] font-medium text-[#6b7280]">
                No slots available for this date yet.
              </p>
            )}
          </div>

          <label className="mb-1.5 block text-[13px] font-bold text-[#6b7280]">
            Your Name*
          </label>
          <input
            value={formData.customerName}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                customerName: event.target.value,
              }))
            }
            placeholder="John Doe"
            className="mb-4 w-full rounded-xl border border-[#dfe5ec] px-4 py-3 text-[14px] font-medium text-[#111827] outline-none transition-all placeholder:font-normal focus:border-[#8BCCE6] focus:ring-2 focus:ring-[#8BCCE6]/15"
          />

          <label className="mb-1.5 block text-[13px] font-bold text-[#6b7280]">
            Email*
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="john@example.com"
            className="mb-4 w-full rounded-xl border border-[#dfe5ec] px-4 py-3 text-[14px] font-medium text-[#111827] outline-none transition-all placeholder:font-normal focus:border-[#8BCCE6] focus:ring-2 focus:ring-[#8BCCE6]/15"
          />

          <label className="mb-1.5 block text-[13px] font-bold text-[#6b7280]">
            Phone*
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, phone: event.target.value }))
            }
            placeholder="(555) 123-4567"
            className="mb-4 w-full rounded-xl border border-[#dfe5ec] px-4 py-3 text-[14px] font-medium text-[#111827] outline-none transition-all placeholder:font-normal focus:border-[#8BCCE6] focus:ring-2 focus:ring-[#8BCCE6]/15"
          />

          <label className="mb-1.5 block text-[13px] font-bold text-[#6b7280]">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, notes: event.target.value }))
            }
            placeholder="Any special requests or questions..."
            rows={3}
            className="mb-6 w-full resize-none rounded-xl border border-[#dfe5ec] px-4 py-3 text-[14px] font-medium text-[#111827] outline-none transition-all placeholder:font-normal focus:border-[#8BCCE6] focus:ring-2 focus:ring-[#8BCCE6]/15"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-[#dfe5ec] py-3.5 text-[14px] font-bold text-[#4b5563] transition-colors hover:bg-[#f9fafb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                slotsQuery.isLoading ||
                (Boolean(formData.date) && !availableSlots.length)
              }
              className="flex-[1.5] rounded-xl py-3.5 text-[14px] font-bold tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)",
              }}
            >
              {isSubmitting ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
