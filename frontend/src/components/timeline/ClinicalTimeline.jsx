import { CalendarClock } from "lucide-react";
import TimelineItem from "./TimelineItem.jsx";

export default function ClinicalTimeline({ events }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-kiosk border border-dashed border-border bg-surface py-10 text-center text-muted">
        <CalendarClock size={26} />
        <p className="text-sm">No documents or history recorded yet.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-5">
      {events.map((event, index) => (
        <TimelineItem key={event.id} event={event} isLast={index === events.length - 1} />
      ))}
    </ol>
  );
}
