const STAGE_LABELS = {
  extracting: 'Pulling text off the page…',
  summarizing: 'Finding the important parts…',
};

export default function Loader({ stage }) {
  return (
    <div className="loader-container" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{STAGE_LABELS[stage] || 'Working on it…'}</p>
    </div>
  );
}
