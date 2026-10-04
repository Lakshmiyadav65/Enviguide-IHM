// Minimal markdown → HTML for chat bubbles. The text is HTML-escaped first,
// so the only tags in the output are the ones added here.
export function formatMarkdown(text) {
  if (!text) return ''
  let s = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  // [label](url) links become pill buttons; WhatsApp links open in a new tab.
  s = s.replace(/\[(.*?)\]\((https?:\/\/wa\.me[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="chat-action-pill wa">$1</a>')
  s = s.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+|\/book-demo)\)/g, '<a href="$2" class="chat-action-pill">$1</a>')

  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*(.*?)\*/g, '<em>$1</em>')
  s = s.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 5px;border-radius:4px;font-size:0.85em;">$1</code>')
  s = s.replace(/\n•\s*(.*?)(?=\n|$)/g, '<div style="margin-left:8px;padding-left:8px;border-left:2px solid #0099e6;margin-top:4px;">• $1</div>')
  s = s.replace(/\n/g, '<br>')

  return s
}
