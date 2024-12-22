'use strict';

import './popup.css';

document.getElementById('timestampInput')?.addEventListener('input', () => {
  const input = (document.getElementById('timestampInput') as HTMLInputElement)
    .value;
  const timestamp = parseInt(input, 10);

  if (!isNaN(timestamp)) {
    // Detect seconds or milliseconds
    let adjustedTimestamp: number;
    let epochTimestamp: number;
    if (input.length === 10) {
      adjustedTimestamp = timestamp * 1000; // Convert seconds to milliseconds
      epochTimestamp = timestamp;
    } else if (input.length === 13) {
      adjustedTimestamp = timestamp; // Already in milliseconds
      epochTimestamp = Math.floor(timestamp / 1000); // Convert to seconds
    } else {
      document.getElementById('result')!.innerText =
        'Invalid timestamp format. Please enter a valid epoch timestamp.';
      return;
    }

    const date = new Date(adjustedTimestamp);
    const utcString = date.toUTCString();
    const localString = date.toString();

    const resultElement = document.getElementById('result');
    resultElement!.innerHTML = `
      <strong>Epoch timestamp:</strong> ${epochTimestamp}<br>
      <strong>Timestamp in milliseconds:</strong> ${adjustedTimestamp}<br>
      <strong>Date and time (GMT):</strong> ${utcString}<br>
      <strong>Date and time (your time zone):</strong> ${localString}
    `;
  } else {
    document.getElementById('result')!.innerText =
      'Invalid UNIX/Epoch timestamp.';
  }
});
