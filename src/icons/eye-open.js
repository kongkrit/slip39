(function (root){
  root.icons = root.icons || {};
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
})(globalThis);