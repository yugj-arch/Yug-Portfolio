import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** Yug's local time in Mumbai, so visitors in other time zones know when he'll reply. */
const LocalTime = ({ className }: { className?: string }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }).format(now)
  );
  const awake = hour >= 9 && hour < 23;
  return (
    <span className={className}>
      <span className={`lt-dot ${awake ? "lt-awake" : "lt-asleep"}`} aria-hidden="true" />
      {fmt.format(now)} IST in Mumbai{awake ? "" : " (probably asleep)"}
    </span>
  );
};

export default LocalTime;
