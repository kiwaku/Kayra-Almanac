// v1: we use <details> embedded in BaseLayout. No fetch needed.
// (In v2 you can inject raw MD at build or fetch the md file to show here.)
document.addEventListener('keydown', (e)=>{
  if (e.key.toLowerCase() !== 'r') return;
  const d = document.querySelector('details.raw');
  if (d) d.open = !d.open;
});
