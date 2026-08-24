import { useCallback, useRef, useState } from 'react';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE_MB = 15;

export default function UploadZone({ file, onFileSelected, isBusy }) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);

  const validateAndSet = useCallback(
    (candidate) => {
      if (!candidate) return;

      if (!ACCEPTED_TYPES.includes(candidate.type)) {
        setLocalError('Please upload a PDF, PNG, or JPEG file.');
        return;
      }

      if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
        setLocalError(`That file is over the ${MAX_SIZE_MB}MB limit.`);
        return;
      }

      setLocalError('');
      onFileSelected(candidate);
    },
    [onFileSelected]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isBusy) return;
    validateAndSet(e.dataTransfer.files?.[0]);
  };

  const handleBrowseClick = () => {
    if (!isBusy) inputRef.current?.click();
  };

  return (
    <div className="form-group">
      <label className="form-label">Document File</label>
      
      {!file ? (
        <div
          className={`upload-box ${isDragging ? 'upload-box--dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isBusy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleBrowseClick();
          }}
          aria-label="Click or drag a file to upload"
        >
          <svg
            className="upload-box__icon"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 4v11m0-11 4 4m-4-4-4 4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="upload-box__title">Choose a file or drag it here</div>
          <div className="upload-box__subtitle">Supports PDF, PNG, or JPG (up to {MAX_SIZE_MB}MB)</div>
        </div>
      ) : (
        <div className="file-selected-info">
          <div className="file-selected-details">
            <span className="file-selected-name" title={file.name}>{file.name}</span>
            <span className="file-selected-size">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
          <button
            type="button"
            className="btn-remove-file"
            onClick={() => onFileSelected(null)}
            disabled={isBusy}
          >
            Remove
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        onChange={(e) => validateAndSet(e.target.files?.[0])}
        disabled={isBusy}
      />

      {localError && <div className="alert-danger" role="alert">{localError}</div>}
    </div>
  );
}
