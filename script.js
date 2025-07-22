const API_BASE = 'https://nlp-postprocessing-backend.onrender.com';

function showToast(msg, success = true) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  msgEl.textContent = msg;

  toast.classList.remove('error');
  if (!success) toast.classList.add('error');

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Download file using Blob
async function downloadFile(url, filename) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${filename}`);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error(`Download error for ${filename}:`, err);
    showToast(`Failed to download ${filename}`, false);
  }
}

document.getElementById('uploadBtn').addEventListener('click', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('fileInput');
  const output = document.getElementById('fileOutput');
  output.textContent = '';

  if (!fileInput.files.length) {
    return showToast('Please select a file to upload', false);
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    console.log('Server response:', data);

    if (res.ok) {
      showToast('File processed! Downloading ZIP...');
      await downloadFile(`${API_BASE}${data.zipFile}`, 'processed_bundle.zip');
    } else {
      output.textContent = data.error || 'Failed to process file';
      showToast('Error processing file', false);
    }
  } catch (err) {
    console.error('Upload error:', err);
    output.textContent = 'Error uploading file';
    showToast('Error uploading file', false);
  }
});
