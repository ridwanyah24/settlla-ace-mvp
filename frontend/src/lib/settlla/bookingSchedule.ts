import { Listing } from "@/types/listing";
import { DaySchedule, TimeSlot } from "@/types/booking";

export function generateClientSchedule(item: Listing): DaySchedule[] {
    const baseDate = new Date(2026, 8, 16); // Sep 16, 2026
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const results: DaySchedule[] = [];

    // Parse local storage for previously locked slots
    let lockedIds: string[] = [];
    try {
      const stored = localStorage.getItem(`settlla_locked_${item.id}`);
      if (stored) lockedIds = JSON.parse(stored);
    } catch {}

    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + dayOffset);
      const weekdayName = dayNames[d.getDay()];

      for (const w of item.visiting_windows) {
        const match = w.day.toLowerCase().includes(weekdayName.toLowerCase());
        if (match) {
          const hoursNorm = w.hours.replace(/—|-/g, "–");
          const parts = hoursNorm.split("–").map((p) => p.trim());
          if (parts.length === 2) {
            const startMins = parseTimeToMins(parts[0]);
            const endMins = parseTimeToMins(parts[1]);

            const slots: TimeSlot[] = [];
            let curr = startMins;
            while (curr + 30 <= endMins) {
              const sLabel = formatMinsToTime(curr);
              const eLabel = formatMinsToTime(curr + 30);
              const timeLabel = `${sLabel} - ${eLabel}`;
              const slotId = `${item.id}_${d.toISOString().slice(0, 10)}_${curr}`;
              const isLocked = lockedIds.includes(slotId);

              slots.push({
                slot_id: slotId,
                time_label: timeLabel,
                start_time: sLabel,
                end_time: eLabel,
                is_available: !isLocked,
                is_locked: isLocked,
              });
              curr += 30;
            }

            const dateStr = d.toISOString().slice(0, 10);
            const formatted = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

            results.push({
              date_str: dateStr,
              day_of_week: weekdayName,
              formatted_date: formatted,
              visiting_hours: w.hours,
              slots,
            });
          }
        }
      }
    }
    return results;
  }

function parseTimeToMins(str: string): number {
  const parts = str.trim().toUpperCase().split(" ");
  if (parts.length !== 2) return 0;
  const [t, mer] = parts;
  const [h, m] = t.split(":").map(Number);
  let hrs = h;
  if (mer === "PM" && hrs !== 12) hrs += 12;
  if (mer === "AM" && hrs === 12) hrs = 0;
  return hrs * 60 + (m || 0);
}

function formatMinsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const mer = h < 12 ? "AM" : "PM";
  const dh = h % 12 === 0 ? 12 : h % 12;
  return `${dh}:${m.toString().padStart(2, "0")} ${mer}`;
}