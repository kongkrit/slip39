(async () => {
  try {
    await converter.check();   // throws on mismatch
  } catch (e) {
    console.error(e);          // keep console noise
    const pill = document.getElementById('integrity-pill');
    pill.style.display = 'inline-block';   // reveal the red pill
    // optionally freeze the UI
    document.body.style.pointerEvents = 'none';
    document.body.style.opacity = '0.35';
  }
})();