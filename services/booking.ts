// The booking handoff — the honest first step towards real bookings.
//
// We never pretend a reservation happened. Instead we open the estate's OWN
// booking system with as much prefilled as that system's URL accepts (date,
// party size, time where supported), and hand the guest a calendar hold for
// the slot they chose. Providers we recognise get deep-linked; everything
// else opens plainly. When commercial API integrations land, this module is
// where they plug in.

export interface BookingIntent {
  date: string;   // YYYY-MM-DD
  time?: string;  // HH:MM
  party: number;
}

export interface BookingHandoff {
  url: string;
  provider: string;      // human label: 'SevenRooms', 'the estate's site', …
  prefilled: boolean;    // did we manage to carry date/party into the URL?
}

const withParams = (base: string, params: Record<string, string | undefined>): string => {
  try {
    const u = new URL(base);
    for (const [k, v] of Object.entries(params)) {
      if (v) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return base;
  }
};

export const buildBookingHandoff = (
  bookingUrl: string | undefined,
  website: string | undefined,
  intent: BookingIntent
): BookingHandoff | null => {
  const target = bookingUrl || website;
  if (!target) return null;
  const t = target.toLowerCase();

  if (t.includes('sevenrooms.com')) {
    return {
      url: withParams(target, {
        date: intent.date,
        party_size: String(intent.party),
        start_time: intent.time,
      }),
      provider: 'SevenRooms',
      prefilled: true,
    };
  }
  if (t.includes('nowbookit.com')) {
    return {
      url: withParams(target, { date: intent.date, people: String(intent.party) }),
      provider: 'NowBookIt',
      prefilled: true,
    };
  }
  if (t.includes('exploretock.com')) {
    return {
      url: withParams(target, {
        date: intent.date,
        size: String(intent.party),
        time: intent.time,
      }),
      provider: 'Tock',
      prefilled: true,
    };
  }
  if (t.includes('opentable')) {
    return {
      url: withParams(target, {
        dateTime: intent.time ? `${intent.date}T${intent.time}` : intent.date,
        partySize: String(intent.party),
      }),
      provider: 'OpenTable',
      prefilled: true,
    };
  }
  if (t.includes('rezdy')) {
    return {
      url: withParams(target, { date: intent.date }),
      provider: 'Rezdy',
      prefilled: true,
    };
  }
  if (t.includes('obee')) {
    return {
      url: withParams(target, { date: intent.date, guests: String(intent.party) }),
      provider: 'Obee',
      prefilled: true,
    };
  }
  return { url: target, provider: bookingUrl ? 'their booking page' : 'their website', prefilled: false };
};

// The next fourteen days, for the date chips.
export const nextDays = (count = 14): { iso: string; label: string; weekday: string }[] =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      iso,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    };
  });

// A calendar hold for the chosen slot — Google link + downloadable .ics.
export const calendarHold = (
  title: string,
  location: string,
  details: string,
  date: string,
  startTime: string,
  durationMinutes = 60
): { gcalUrl: string; icsUrl: string; when: string } | null => {
  const start = new Date(`${date}T${startTime}:00`);
  if (isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const stamp = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T` +
    `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
  const gcalUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}&dates=${stamp(start)}/${stamp(end)}` +
    `&location=${encodeURIComponent(location)}&details=${encodeURIComponent(details)}`;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Somm//EN', 'BEGIN:VEVENT',
    `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`, `LOCATION:${location}`, `DESCRIPTION:${details.replace(/\n/g, ' ')}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return {
    gcalUrl,
    icsUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
    when: start.toLocaleString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }),
  };
};
