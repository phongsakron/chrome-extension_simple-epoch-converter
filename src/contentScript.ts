'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts
import { createPopper } from '@popperjs/core';
let _popupElement: HTMLElement | null = null; // Track the current popup
let _mousePositionElement: HTMLElement | null = null; // Track the current popup
let _setTimeoutRef: NodeJS.Timeout | null = null; // Track the timeout event
document.addEventListener('mouseup', (event) => {
  const selection = window.getSelection()?.toString().trim();
  if (selection && !isNaN(parseInt(selection, 10))) {
    // Remove any existing popup if a new selection is made
    if (_popupElement) {
      removePopup();
    }

    const timestamp = parseInt(selection, 10);

    // Detect seconds or milliseconds
    let adjustedTimestamp: number;
    let epochTimestamp: number;
    if (selection.length === 10) {
      adjustedTimestamp = timestamp * 1000; // Convert seconds to milliseconds
      epochTimestamp = timestamp;
    } else if (selection.length === 13) {
      adjustedTimestamp = timestamp; // Already in milliseconds
      epochTimestamp = Math.floor(timestamp / 1000); // Convert to seconds
    } else {
      console.error('Invalid timestamp format. Please select a valid epoch timestamp.');
      return;
    }

    const date = new Date(adjustedTimestamp);
    const utcString = date.toUTCString();
    const localString = date.toString();

    _popupElement = document.createElement('div');
    _popupElement.id = 'timestamp-popup';
    _popupElement.style.background = '#fff';
    _popupElement.style.padding = '0.25rem';
    _popupElement.style.border = '1px solid #ccc';
    _popupElement.style.borderRadius = '4px';
    _popupElement.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    _popupElement.innerHTML = `
      <strong>Epoch timestamp:</strong> ${epochTimestamp}<br>
      <strong>Timestamp in milliseconds:</strong> ${adjustedTimestamp}<br>
      <strong>Date and time (GMT):</strong> ${utcString}<br>
      <strong>Date and time (your time zone):</strong> ${localString}
    `;
    document.body.appendChild(_popupElement);

    _mousePositionElement = document.createElement('span');
    _mousePositionElement.style.position = 'absolute';
    _mousePositionElement.style.left = `${event.pageX}px`;
    _mousePositionElement.style.top = `${event.pageY}px`;
    document.body.appendChild(_mousePositionElement);

    createPopper(_mousePositionElement, _popupElement, {
      placement: 'top',
    });
  }
});
// Remove popup if user clicks outside
document.addEventListener('mousedown', (e) => {
  if (_popupElement && !_popupElement.contains(e.target as Node)) {
    removePopup();
  }
  if (_bottomLeftModal && !_bottomLeftModal.contains(e.target as Node)) {
    removeModal();
  }
});

function removeModal() {
  _bottomLeftModal?.remove();
  _bottomLeftModal = null;
}
function removePopup() {
  if (_popupElement) {
    _mousePositionElement?.remove();
    _mousePositionElement = null;
    _popupElement.remove();
    _popupElement = null;
  }
  if (_setTimeoutRef) {
    clearTimeout(_setTimeoutRef);
  }
}

// A variable to store or reference our bottom-left modal
let _bottomLeftModal: HTMLDivElement | null = null;

// Listen to the "copy" event
document.addEventListener('copy', () => {
  let copiedText = '';
  try {
    copiedText = window.getSelection()?.toString() || '';
  } catch (e) {
    console.error('Error reading clipboard text:', e);
  }
  if (!copiedText) return;

  // Check if it might be a timestamp (seconds or milliseconds)
  const numericValue = parseInt(copiedText, 10);
  if (isNaN(numericValue)) return; // Not a number at all

  // Now determine if it's 10-digit (seconds) or 13-digit (milliseconds)
  let epochSeconds: number;
  if (copiedText.length === 10) {
    epochSeconds = numericValue;
  } else if (copiedText.length === 13) {
    epochSeconds = Math.floor(numericValue / 1000);
  } else {
    return; // Not recognized as a standard epoch
  }

  // Create or update our bottom-left modal
  if (!_bottomLeftModal) {
    _bottomLeftModal = document.createElement('div');
    _bottomLeftModal.id = 'simple-epoch-modal';
    _bottomLeftModal.style.position = 'fixed';
    _bottomLeftModal.style.left = '20px';
    _bottomLeftModal.style.bottom = '20px';
    _bottomLeftModal.style.padding = '10px';
    _bottomLeftModal.style.border = '1px solid #ccc';
    _bottomLeftModal.style.borderRadius = '4px';
    _bottomLeftModal.style.backgroundColor = '#fff';
    _bottomLeftModal.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    _bottomLeftModal.style.zIndex = '999999'; // Ensure it's on top

    document.body.appendChild(_bottomLeftModal);
  }

  // Convert the epochSeconds to local date
  const date = new Date(epochSeconds * 1000);
  const utcString = date.toUTCString();
  const localString = date.toString();

  // Fill the modal content
  _bottomLeftModal.innerHTML = `
    <b>Timestamp:</b> ${copiedText}<br/>
    <b>Epoch (seconds):</b> ${epochSeconds}<br/>
    <b>UTC:</b> ${utcString}<br/>
    <b>Local:</b> ${localString}
  `;
});
// Remove popup if user clicks outside
document.addEventListener('mousedown', (e) => {
  if (_bottomLeftModal && !_bottomLeftModal.contains(e.target as Node)) {
    _bottomLeftModal.remove();
    _bottomLeftModal = null;
  }
});
