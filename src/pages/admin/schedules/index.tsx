import { useEffect, useMemo, useState } from "react";
import supabase from "../../../config/supabaseClient";

interface ScheduleRule {
  id: string;
  start_date: string;
  end_date: string;
  is_blocked: boolean;
  custom_times: string[] | null;
  reason: string | null;
}

type Filter = "all" | "blocked" | "custom";

/* ───────────────────────────── helpers ───────────────────────────── */

// "14:30" -> "2:30 PM"
const to12Hour = (time24: string): string => {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

// "2:30 PM" -> minutes since midnight (used for chronological sorting)
const toMinutes = (time12: string): number => {
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + parseInt(match[2], 10);
};

const sortTimes = (list: string[]) =>
  [...list].sort((a, b) => toMinutes(a) - toMinutes(b));

const parseDate = (d: string) => new Date(d + "T00:00:00");

const fmt = (d: string, opts: Intl.DateTimeFormatOptions) =>
  parseDate(d).toLocaleDateString("en-US", opts);

const todayISO = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const PRESETS = {
  morning: ["9:00 AM", "10:00 AM", "11:00 AM"],
  afternoon: ["1:00 PM", "2:00 PM", "3:00 PM"],
  evening: ["4:00 PM", "5:00 PM", "6:00 PM"],
} as const;

/* ───────────────────────────── shared styles ───────────────────────────── */

const inputCls =
  "w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 " +
  "transition-colors focus:outline-none focus:border-[#FF007F] focus:ring-2 focus:ring-[#FF007F]/30";

const labelCls = "block text-sm font-semibold text-gray-300 mb-2";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF007F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]";

/* ───────────────────────────── component ───────────────────────────── */

export default function ScheduleRulesAdmin() {
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [isRange, setIsRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [times, setTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState(""); // 24h from <input type="time">
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // List state
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from("schedule_rules")
      .select("*")
      .order("start_date", { ascending: true });
    if (error) setLoadError(error.message);
    else if (data) setRules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  /* ── times ── */
  const handleAddTime = () => {
    if (!newTime) return;
    const formatted = to12Hour(newTime);
    if (times.includes(formatted)) {
      setFormError(`${formatted} is already added.`);
      return;
    }
    setFormError(null);
    setTimes((prev) => sortTimes([...prev, formatted]));
    setNewTime("");
  };

  const handleRemoveTime = (time: string) =>
    setTimes((prev) => prev.filter((t) => t !== time));

  const applyPreset = (preset: keyof typeof PRESETS) => {
    setFormError(null);
    setTimes((prev) => sortTimes([...new Set([...prev, ...PRESETS[preset]])]));
  };

  /* ── form ── */
  const resetForm = () => {
    setIsRange(false);
    setStartDate("");
    setEndDate("");
    setTimes([]);
    setNewTime("");
    setReason("");
    setIsBlocked(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalEndDate = isRange ? endDate : startDate;
    if (!startDate) return setFormError("Pick a date to continue.");
    if (isRange && !endDate) return setFormError("Pick an end date.");
    if (isRange && parseDate(endDate) < parseDate(startDate)) {
      return setFormError("End date can't be before the start date.");
    }

    const payload = {
      start_date: startDate,
      end_date: finalEndDate,
      is_blocked: isBlocked,
      custom_times: isBlocked ? null : times.length > 0 ? times : null,
      reason: reason.trim() || null,
    };

    setIsSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("schedule_rules")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("schedule_rules").insert(payload);
        if (error) throw error;
      }
      resetForm();
      fetchRules();
    } catch (error: any) {
      setFormError(error.message ?? "Something went wrong. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (rule: ScheduleRule) => {
    setEditingId(rule.id);
    setIsRange(rule.start_date !== rule.end_date);
    setStartDate(rule.start_date);
    setEndDate(rule.end_date || rule.start_date);
    setIsBlocked(rule.is_blocked);
    setTimes(sortTimes(rule.custom_times || []));
    setReason(rule.reason || "");
    setFormError(null);
    setConfirmDeleteId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("schedule_rules").delete().eq("id", id);
    if (error) {
      setLoadError(error.message);
      return;
    }
    setRules((prev) => prev.filter((r) => r.id !== id));
    setConfirmDeleteId(null);
    if (editingId === id) resetForm();
  };

  /* ── derived ── */
  const datePreview = useMemo(() => {
    if (!startDate) return null;
    if (!isRange) {
      return {
        main: fmt(startDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
        sub: null as string | null,
      };
    }
    if (!endDate) return { main: "Choose an end date", sub: null };
    const days =
      Math.round((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / 86400000) + 1;
    return {
      main: `${fmt(startDate, { month: "short", day: "numeric" })} – ${fmt(endDate, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
      sub: days > 0 ? `${days} day${days > 1 ? "s" : ""}` : null,
    };
  }, [startDate, endDate, isRange]);

  const today = todayISO();

  const counts = useMemo(
    () => ({
      all: rules.length,
      blocked: rules.filter((r) => r.is_blocked).length,
      custom: rules.filter((r) => !r.is_blocked).length,
    }),
    [rules]
  );

  const visibleRules = useMemo(
    () =>
      rules.filter((r) =>
        filter === "all" ? true : filter === "blocked" ? r.is_blocked : !r.is_blocked
      ),
    [rules, filter]
  );

  /* ───────────────────────────── render ───────────────────────────── */

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Schedule rules
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mt-1 max-w-xl">
          Close off dates or offer different booking times for specific periods.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
        {/* ═══════════════════════════ FORM ═══════════════════════════ */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-2 lg:sticky lg:top-6 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-white/10">
            <h2 className="text-white font-bold text-lg">
              {editingId ? "Edit rule" : "New rule"}
            </h2>
            {editingId && (
              <span className="text-xs font-semibold text-[#FF007F] bg-[#FF007F]/10 border border-[#FF007F]/30 rounded-full px-2.5 py-1">
                Editing
              </span>
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Rule type */}
            <fieldset>
              <legend className={labelCls}>Applies to</legend>
              <div
                role="radiogroup"
                aria-label="Applies to"
                className="grid grid-cols-2 p-1 bg-black border border-white/10 rounded-xl"
              >
                {[
                  { value: false, label: "Single day" },
                  { value: true, label: "Date range" },
                ].map((opt) => {
                  const active = isRange === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setIsRange(opt.value);
                        if (opt.value) {
                          if (!endDate) setEndDate(startDate);
                        } else {
                          setEndDate("");
                        }
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${focusRing} ${
                        active
                          ? "bg-[#FF007F] text-white shadow-lg shadow-[#FF007F]/20"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Dates */}
            <div className={`grid gap-4 ${isRange ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
              <div>
                <label htmlFor="start-date" className={labelCls}>
                  {isRange ? "Start date" : "Date"}
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStartDate(v);
                    if (!isRange) setEndDate(v);
                    else if (!endDate || parseDate(v) > parseDate(endDate)) setEndDate(v);
                  }}
                  className={`${inputCls} [color-scheme:dark]`}
                  required
                />
              </div>
              {isRange && (
                <div>
                  <label htmlFor="end-date" className={labelCls}>
                    End date
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`${inputCls} [color-scheme:dark]`}
                    required
                  />
                </div>
              )}
            </div>

            {/* Preview */}
            <div
              className={`rounded-xl border px-4 py-3 transition-colors ${
                datePreview
                  ? "bg-[#FF007F]/5 border-[#FF007F]/20"
                  : "bg-black/40 border-dashed border-white/10"
              }`}
              aria-live="polite"
            >
              {datePreview ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white font-semibold">{datePreview.main}</p>
                  {datePreview.sub && (
                    <span className="shrink-0 text-xs font-semibold text-[#FF007F] bg-[#FF007F]/10 rounded-full px-2.5 py-1">
                      {datePreview.sub}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Pick a date to see a summary here.</p>
              )}
            </div>

            {/* Block toggle (switch) */}
            <label
              className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                isBlocked
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-white/10 bg-black/30 hover:border-white/20"
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Close these dates</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Clients won't be able to book at all.
                </p>
              </div>
              <span className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={isBlocked}
                  onChange={(e) => setIsBlocked(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="block w-11 h-6 rounded-full bg-white/10 transition-colors peer-checked:bg-red-500 peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF007F] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#1A1A1A]" />
                <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

            {/* Time builder */}
            {!isBlocked && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`${labelCls} mb-0`}>Custom times</span>
                  <span className="text-xs text-gray-500">
                    {times.length === 0 ? "Using default times" : `${times.length} added`}
                  </span>
                </div>

                {times.length > 0 && (
                  <ul className="flex flex-wrap gap-2 p-3 bg-black/30 rounded-xl border border-white/5">
                    {times.map((t) => (
                      <li
                        key={t}
                        className="flex items-center gap-1 bg-[#FF007F]/15 text-[#FF007F] pl-3 pr-1 py-1 rounded-full text-sm font-semibold border border-[#FF007F]/30"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTime(t)}
                          aria-label={`Remove ${t}`}
                          className={`w-6 h-6 grid place-items-center rounded-full hover:bg-[#FF007F] hover:text-white transition-colors ${focusRing}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2">
                  <input
                    type="time"
                    aria-label="Time to add"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTime();
                      }
                    }}
                    className={`${inputCls} flex-1 min-w-0 [color-scheme:dark]`}
                  />
                  <button
                    type="button"
                    onClick={handleAddTime}
                    disabled={!newTime}
                    className={`px-5 py-3 rounded-xl bg-[#FF007F] text-white font-semibold hover:bg-[#ff1a8c] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 mr-1">Quick add</span>
                  {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 transition-all capitalize ${focusRing}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-gray-500">
                  Leave empty to use your default times.
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <label htmlFor="reason" className={labelCls}>
                Reason <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <input
                id="reason"
                type="text"
                placeholder="e.g., Christmas holiday, vacation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Error */}
            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                <span aria-hidden>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={`sm:flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all ${focusRing}`}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving || !startDate}
                className={`sm:flex-1 py-3 rounded-xl bg-[#FF007F] text-white font-bold hover:bg-[#ff1a8c] active:scale-[0.99] shadow-lg shadow-[#FF007F]/20 transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed ${focusRing}`}
              >
                {isSaving ? "Saving…" : editingId ? "Save changes" : "Save rule"}
              </button>
            </div>
          </div>
        </form>

        {/* ═══════════════════════════ LIST ═══════════════════════════ */}
        <section className="lg:col-span-3 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-white font-bold text-lg">
              Your rules <span className="text-gray-500 font-medium">({rules.length})</span>
            </h2>

            <div
              role="tablist"
              aria-label="Filter rules"
              className="inline-flex self-start p-1 bg-[#1A1A1A] border border-white/10 rounded-xl"
            >
              {(
                [
                  ["all", "All"],
                  ["blocked", "Closed"],
                  ["custom", "Custom times"],
                ] as [Filter, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={filter === key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    filter === key ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF007F]`}
                >
                  {label}
                  <span className="ml-1.5 text-gray-500">{counts[key]}</span>
                </button>
              ))}
            </div>
          </div>

          {loadError && (
            <div
              role="alert"
              className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              <span>{loadError}</span>
              <button
                onClick={fetchRules}
                className="shrink-0 font-semibold text-white underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <ul className="space-y-3" aria-busy="true" aria-label="Loading rules">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="h-24 rounded-2xl bg-[#1A1A1A] border border-white/5 animate-pulse"
                />
              ))}
            </ul>
          ) : visibleRules.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-dashed border-white/10 rounded-2xl px-6 py-14 text-center">
              <div className="mx-auto mb-4 w-12 h-12 grid place-items-center rounded-2xl bg-[#FF007F]/10 text-xl">
                📅
              </div>
              <p className="text-white font-semibold">
                {rules.length === 0 ? "No rules yet" : "No rules match this filter"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {rules.length === 0
                  ? "Use the form to close a date or set custom times."
                  : "Try a different filter."}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {visibleRules.map((r) => {
                const isSpan = r.start_date !== r.end_date;
                const isPast = r.end_date < today;
                const isActiveNow = r.start_date <= today && r.end_date >= today;
                const isConfirming = confirmDeleteId === r.id;
                const isEditing = editingId === r.id;

                return (
                  <li
                    key={r.id}
                    className={`group bg-[#1A1A1A] border rounded-2xl p-4 transition-all ${
                      isEditing
                        ? "border-[#FF007F]/60 shadow-lg shadow-[#FF007F]/10"
                        : "border-white/10 hover:border-white/20"
                    } ${isPast ? "opacity-60 hover:opacity-100" : ""}`}
                  >
                    <div className="flex gap-4">
                      {/* Date block */}
                      <div
                        className={`shrink-0 w-14 rounded-xl border text-center py-2 ${
                          r.is_blocked
                            ? "bg-red-500/10 border-red-500/20 text-red-300"
                            : "bg-[#FF007F]/10 border-[#FF007F]/20 text-[#FF007F]"
                        }`}
                      >
                        <p className="text-xs font-semibold leading-none">
                          {fmt(r.start_date, { month: "short" })}
                        </p>
                        <p className="text-xl font-bold leading-tight mt-1 text-white">
                          {parseDate(r.start_date).getDate()}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-white font-bold">
                            {isSpan
                              ? `${fmt(r.start_date, { month: "short", day: "numeric" })} – ${fmt(r.end_date, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}`
                              : fmt(r.start_date, {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                          </p>
                          <span
                            className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                              r.is_blocked
                                ? "bg-red-500/10 text-red-300"
                                : "bg-emerald-500/10 text-emerald-300"
                            }`}
                          >
                            {r.is_blocked ? "Closed" : "Custom times"}
                          </span>
                          {isActiveNow && (
                            <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-white/10 text-white">
                              Active now
                            </span>
                          )}
                          {isPast && (
                            <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-white/5 text-gray-400">
                              Past
                            </span>
                          )}
                        </div>

                        {r.reason && (
                          <p className="text-sm text-gray-400 mt-1 break-words">{r.reason}</p>
                        )}

                        {!r.is_blocked && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {r.custom_times && r.custom_times.length > 0 ? (
                              sortTimes(r.custom_times).map((t) => (
                                <span
                                  key={t}
                                  className="text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 rounded-full px-2.5 py-1"
                                >
                                  {t}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">Uses default times</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      {isConfirming ? (
                        <>
                          <span className="mr-auto text-sm text-gray-300">Remove this rule?</span>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF007F]"
                          >
                            Keep
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(r)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF007F]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(r.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}