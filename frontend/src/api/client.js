const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Uploads a document and returns the extracted text + generated summary.
 * Throws an Error with a user-facing message if the request fails.
 */
export async function summarizeDocument(file, length) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('length', length);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/summarize`, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    throw new Error('Could not reach the server. Is the backend running?');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong while summarizing your document.');
  }

  return data;
}
