export function exportChatAsText(messages, modeName, userName) {
  let text = `Eva Chat Export - ${modeName} Mode\n`;
  text += `User: ${userName || 'Anonymous'}\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n`;
  text += `${'='.repeat(50)}\n\n`;

  messages.forEach((msg) => {
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sender = msg.role === 'user' ? (userName || 'You') : 'Eva';
    text += `[${time}] ${sender}: ${msg.content}\n`;
    if (msg.reaction) text += `  ${msg.reaction}\n`;
    text += '\n';
  });

  text += `${'='.repeat(50)}\n`;
  text += `Exported from Eva - Your Personal Voice Companion\n`;

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eva-chat-${modeName.toLowerCase()}-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
