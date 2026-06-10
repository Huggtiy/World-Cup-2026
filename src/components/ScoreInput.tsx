interface ScoreInputProps {
  homeScore: string;
  awayScore: string;
  onHomeChange: (v: string) => void;
  onAwayChange: (v: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function ScoreInput({ homeScore, awayScore, onHomeChange, onAwayChange, disabled, compact }: ScoreInputProps) {
  const handle = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '' || (/^\d+$/.test(v) && parseInt(v) <= 20)) setter(v);
  };

  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'justify-center'}`}>
      <input
        type="number"
        min={0}
        max={20}
        value={homeScore}
        onChange={handle(onHomeChange)}
        disabled={disabled}
        className="input-score"
        placeholder="0"
      />
      <span className="text-lg font-bold text-gray-400">–</span>
      <input
        type="number"
        min={0}
        max={20}
        value={awayScore}
        onChange={handle(onAwayChange)}
        disabled={disabled}
        className="input-score"
        placeholder="0"
      />
    </div>
  );
}
