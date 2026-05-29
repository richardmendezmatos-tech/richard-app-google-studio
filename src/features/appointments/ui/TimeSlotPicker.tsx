'use client';

interface TimeSlotPickerProps {
  selected: string;
  onChange: (time: string) => void;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30',
];

export function TimeSlotPicker({ selected, onChange }: TimeSlotPickerProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
      {TIME_SLOTS.map((time) => {
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const label = hour >= 12
          ? `${hour === 12 ? 12 : hour - 12}:${m} PM`
          : `${hour}:${m} AM`;

        return (
          <button
            key={time}
            type="button"
            onClick={() => onChange(time)}
            className={`px-3 py-2.5 text-xs font-bold rounded-xl border transition-all ${
              selected === time
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
