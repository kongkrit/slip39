(function (root){
  root.icons = root.icons || {};
  
  // --- eyeOpen ---
  root.icons.eyeOpen = `

<!-- eye.svg (auto light/dark) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <style>
    svg { color:#0b0b0c; }
    @media (prefers-color-scheme: dark) { svg { color:#e8e8ea; } }
    @media (forced-colors: active) { svg { color: CanvasText; } }
  </style>
  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"/>
    <circle cx="12" cy="12" r="3"/>
  </g>
</svg>

`;

  // --- eyeClosed ---
  root.icons.eyeClosed = `

<!-- eye-off.svg (auto light/dark) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <style>
    svg { color:#0b0b0c; }
    @media (prefers-color-scheme: dark) { svg { color:#e8e8ea; } }
    @media (forced-colors: active) { svg { color: CanvasText; } }
  </style>
  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </g>
</svg>

`;

  // --- copy to clipboard ---
  root.icons.copy = `

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <style>
    svg { color:#0b0b0c; }
    @media (prefers-color-scheme: dark) { svg { color:#e8e8ea; } }
    @media (forced-colors: active) { svg { color: CanvasText; } }
  </style>
  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
	<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
	<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </g>
</svg>

`;

})(globalThis);