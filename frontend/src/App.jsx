import { useState } from 'react';
import UploadZone from './components/UploadZone.jsx';
import SummaryControls from './components/SummaryControls.jsx';
import SummaryResult from './components/SummaryResult.jsx';
import Loader from './components/Loader.jsx';
import { summarizeDocument } from './api/client.js';
import './App.css';

export default function App() {
  const [file, setFile] = useState(null);
  const [length, setLength] = useState('medium');
  const [status, setStatus] = useState('idle'); // idle | busy | error | done
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);

  const handleFileSelected = (selected) => {
    setFile(selected);
    setResult(null);
    setStatus('idle');
    setErrorMessage('');
  };

  const handleGenerate = async () => {
    if (!file) return;

    setStatus('busy');
    setErrorMessage('');

    try {
      const data = await summarizeDocument(file, length);
      setResult(data);
      setStatus('done');
    } catch (err) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-container">
          <span className="navbar-brand">Document Summary Assistant</span>
        </div>
      </nav>

      <div className="container">
        <header className="page-header">
          <h1>Document Summarizer</h1>
          <p>Upload a PDF document or image (PNG, JPEG) to extract text and generate a clean, structured summary.</p>
        </header>

        <main className="main-layout">
          <section className="card">
            <UploadZone file={file} onFileSelected={handleFileSelected} isBusy={status === 'busy'} />

            <SummaryControls
              length={length}
              onLengthChange={setLength}
              onSubmit={handleGenerate}
              disabled={!file}
              isBusy={status === 'busy'}
            />

            {status === 'error' && (
              <div className="alert-danger" role="alert">
                {errorMessage}
              </div>
            )}
          </section>

          <section className="card card--output">
            {status === 'busy' && <Loader stage="summarizing" />}
            {status === 'done' && result && <SummaryResult result={result} />}
            {status === 'idle' && !result && (
              <div className="empty-state">
                <p>Your summary will show up here once you upload a document and click "Generate summary".</p>
              </div>
            )}
          </section>
        </main>

        <footer className="footer">
          <p>Practice Application. Uses local PDF/OCR extraction and Gemini AI summary services.</p>
        </footer>
      </div>
    </div>
  );
}
