import React, { useMemo, useState } from "react";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function Calendar({ onDateSelect }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState(null);

  const weeks = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);

    // Compute grid start: previous Sunday
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - ((start.getDay() + 7) % 7));

    // Compute grid end: next Saturday
    const gridEnd = new Date(end);
    gridEnd.setDate(end.getDate() + (6 - ((end.getDay() + 7) % 7)));

    const days = [];
    const current = new Date(gridStart);
    while (current <= gridEnd) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const chunked = [];
    for (let i = 0; i < days.length; i += 7) chunked.push(days.slice(i, i + 7));
    return chunked;
  }, [viewDate]);

  const monthLabel = viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-wrap" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 2px rgba(16,24,40,0.05)', padding: 16 }}>
      <div className="calendar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary" type="button" onClick={() => setViewDate(addMonths(viewDate, -1))}>{'<'}</button>
          <div style={{ fontWeight: 700, fontSize: 18, minWidth: 160, textAlign: 'center' }}>{monthLabel}</div>
          <button className="btn btn-secondary" type="button" onClick={() => setViewDate(addMonths(viewDate, 1))}>{'>'}</button>
        </div>
        <button
          className="btn"
          type="button"
          onClick={() => {
            const today = new Date();
            setViewDate(today);
            setSelected(today);
            onDateSelect && onDateSelect(today);
          }}
        >
          Today
        </button>
      </div>

      <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {weekdayLabels.map((w) => (
          <div key={w} style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{w}</div>
        ))}
        {weeks.flat().map((d, idx) => {
          const inMonth = d.getMonth() === viewDate.getMonth();
          const isToday = isSameDay(d, new Date());
          const isSelected = selected && isSameDay(d, selected);
          return (
            <button
              key={idx}
              onClick={() => {
                setSelected(d);
                onDateSelect && onDateSelect(d);
              }}
              type="button"
              style={{
                height: 64,
                borderRadius: 10,
                border: '1px solid ' + (isSelected ? '#1d4ed8' : '#e5e7eb'),
                background: isSelected ? '#eff6ff' : '#f8fafc',
                color: inMonth ? '#0f172a' : '#94a3b8',
                boxShadow: isToday ? 'inset 0 0 0 2px #22c55e' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: 8,
                fontWeight: 600
              }}
              className="calendar-day"
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ marginTop: 12, color: '#334155' }}>
          <strong>Selected:</strong> {selected.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
