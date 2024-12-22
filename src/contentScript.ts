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
      alert('Invalid timestamp format. Please select a valid epoch timestamp.');
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
});

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
