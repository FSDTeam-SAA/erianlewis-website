"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Minus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import { Calendar } from "@/components/ui/calendar";

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

type AvailabilityRecord = Record<
  string,
  {
    available: boolean;
    reason?: string;
    slots: SlotItem[];
    bookedTimes?: string[];
  }
>

const DATE_RANGE_DAYS = 30;

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDateKey = () => getDateKey(new Date());

const toLocalDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

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

  const availabilityQuery = useQuery({
    queryKey: ["available-dates", propertyId],
    queryFn: async () => {
      const start = new Date();
      const dates = Array.from({ length: DATE_RANGE_DAYS }, (_, index) => addDays(start, index));

      const results = await Promise.all(
        dates.map(async (date) => {
          const dateKey = getDateKey(date);
          const params = new URLSearchParams({
            propertyId,
            date: dateKey,
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
            return {
              dateKey,
              available: false,
              reason: payload?.message || "Failed to load available slots",
              slots: [],
              bookedTimes: [],
            };
          }

          return {
            dateKey,
            ...(payload.data as AvailableSlotsResponse),
          };
        }),
      );

      return results.reduce<AvailabilityRecord>((accumulator, item) => {
        accumulator[item.dateKey] = {
          available: item.available,
          reason: item.reason,
          slots: item.slots,
          bookedTimes: item.bookedTimes,
        };
        return accumulator;
      }, {});
    },
    enabled: isOpen && Boolean(propertyId),
  });

  const selectedDate = useMemo(
    () => (formData.date ? toLocalDate(formData.date) ?? undefined : undefined),
    [formData.date],
  );

  const selectedDateAvailability = formData.date
    ? availabilityQuery.data?.[formData.date]
    : undefined;

  const availableDateKeys = useMemo(
    () =>
      Object.entries(availabilityQuery.data || {})
        .filter(([, value]) => value.available && value.slots.length > 0)
        .map(([dateKey]) => dateKey),
    [availabilityQuery.data],
  );

  const unavailableDateKeys = useMemo(
    () =>
      Object.entries(availabilityQuery.data || {})
        .filter(([, value]) => !value.available || !value.slots.length)
        .map(([dateKey]) => dateKey),
    [availabilityQuery.data],
  );

  const availableSlots = useMemo(
    () => selectedDateAvailability?.slots || [],
    [selectedDateAvailability?.slots],
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
      availabilityQuery.refetch();
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

  const todayDate = toLocalDate(getTodayDateKey()) || new Date();

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-x-4 top-1/2 z-50 w-auto max-w-[calc(100vw-32px)] -translate-y-1/2 rounded-3xl border border-[#e8edf3] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.16)] max-h-[calc(100vh-32px)] overflow-y-auto md:left-1/2 md:right-auto md:w-[520px] md:-translate-x-1/2">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-extrabold tracking-tight text-[#111827]">
              Schedule Viewing
            </h3>
            <p className="mt-1 text-[13px] font-medium text-[#6b7280]">
              Book a preferred date and time for {propertyTitle || "this property"}.
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
          <div className="mb-4 rounded-2xl border border-[#dfe5ec] bg-[#f8fafc] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="block text-[13px] font-bold text-[#6b7280]">
                Preferred Date*
              </label>
              <div className="flex items-center gap-3 text-[11px] font-medium text-[#6b7280]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                  Available
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                  Unavailable
                </span>
              </div>
            </div>

            {availabilityQuery.isLoading ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-2xl bg-white">
                <div className="flex items-center gap-2 text-sm font-medium text-[#6b7280]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#8BCCE6]" />
                  Loading availability...
                </div>
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    date: date ? getDateKey(date) : "",
                    time: "",
                  }))
                }
                disabled={(date) =>
                  date < todayDate ||
                  unavailableDateKeys.includes(getDateKey(date))
                }
                modifiers={{
                  available: availableDateKeys.map(toLocalDate).filter(Boolean) as Date[],
                  unavailable: unavailableDateKeys.map(toLocalDate).filter(Boolean) as Date[],
                }}
                modifiersClassNames={{
                  available:
                    "bg-[#e8f7ee] text-[#166534] ring-1 ring-[#22c55e]/20 hover:bg-[#d9f0e2] data-[selected=true]:bg-[#22c55e] data-[selected=true]:text-white",
                  unavailable:
                    "bg-[#fff1e8] text-[#9a3412] opacity-80 ring-1 ring-[#f97316]/15",
                }}
                className="w-full rounded-2xl bg-white p-2 shadow-sm"
              />
            )}
          </div>

          <label className="mb-1.5 block text-[13px] font-bold text-[#6b7280]">
            Preferred Time*
          </label>
          <select
            value={formData.time}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, time: event.target.value }))
            }
            disabled={
              !formData.date || availabilityQuery.isLoading || !availableSlots.length
            }
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
                Pick a highlighted date to load available time slots.
              </p>
            ) : availabilityQuery.isLoading ? (
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#6b7280]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading available slots...
              </div>
            ) : availabilityQuery.isError ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#f3c7ba] bg-[#fff7f2] px-3 py-2">
                <p className="text-[12px] font-medium text-[#6b7280]">
                  {availabilityQuery.error instanceof Error
                    ? availabilityQuery.error.message
                    : "Failed to load available slots."}
                </p>
                <button
                  type="button"
                  onClick={() => availabilityQuery.refetch()}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#f6855c]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            ) : selectedDateAvailability?.available === false ? (
              <p className="rounded-xl border border-[#eef2f6] bg-[#f8fafc] px-3 py-2 text-[12px] font-medium text-[#6b7280]">
                {selectedDateAvailability.reason || "No slots available for this date."}
              </p>
            ) : availableSlots.length ? (
              <p className="text-[12px] font-medium text-[#6b7280]">
                {availableSlots.length} slot{availableSlots.length > 1 ? "s" : ""} available for the selected date.
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
            inputMode="numeric"
            pattern="[0-9]*"
            value={formData.phone}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                phone: event.target.value.replace(/\D/g, ""),
              }))
            }
            placeholder="5551234567"
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
                availabilityQuery.isLoading ||
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
