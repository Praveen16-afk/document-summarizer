export default function SummaryResult({ result }) {
  if (!result) return null;

  const { fileName, wordCount, pageCount, engine, summary, keyPoints } = result;

  return (
    <div className="result-section">
      <h2 className="result-title">Summary Result</h2>
      
      <table className="meta-table">
        <tbody>
          <tr>
            <th>File Name</th>
            <td>{fileName}</td>
          </tr>
          <tr>
            <th>Word Count</th>
            <td>{wordCount.toLocaleString()}</td>
          </tr>
          {pageCount && (
            <tr>
              <th>Page Count</th>
              <td>{pageCount}</td>
            </tr>
          )}
          <tr>
            <th>Summary Engine</th>
            <td>{engine === 'gemini' ? 'Gemini AI' : 'Local Extractive'}</td>
          </tr>
        </tbody>
      </table>

      <div className="summary-box">
        <h3>Summary Text</h3>
        <p className="summary-text">{summary}</p>
      </div>

      {keyPoints?.length > 0 && (
        <div className="keypoints-box">
          <h3>Key Points</h3>
          <ul className="keypoints-list">
            {keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
