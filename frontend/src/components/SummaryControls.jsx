const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short', hint: '3-4 sentences' },
  { value: 'medium', label: 'Medium', hint: '1-2 paragraphs' },
  { value: 'long', label: 'Long', hint: '3-4 paragraphs' },
];

export default function SummaryControls({ length, onLengthChange, onSubmit, disabled, isBusy }) {
  return (
    <div>
      <div className="form-group">
        <label htmlFor="summary-length" className="form-label">
          Summary Length
        </label>
        <select
          id="summary-length"
          className="form-select"
          value={length}
          onChange={(e) => onLengthChange(e.target.value)}
          disabled={isBusy}
        >
          {LENGTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} ({opt.hint})
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="btn-primary"
        onClick={onSubmit}
        disabled={disabled || isBusy}
      >
        {isBusy ? 'Processing...' : 'Generate summary'}
      </button>
    </div>
  );
}
