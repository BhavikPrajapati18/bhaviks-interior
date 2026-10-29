/** Render a restricted human-readable text format without interpreting raw HTML. */
export function JournalContent({ body }: { body: string }) {
  const blocks = body.replace(/\r\n?/g, "\n").split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  return <div className="journal-article-body">{blocks.map((block, index) => {
    const heading = block.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const title = heading[2];
      return heading[1].length === 1 ? <h2 key={index}>{title}</h2> : <h3 key={index}>{title}</h3>;
    }
    const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
    if (lines.length && lines.every(line => /^[-*]\s+/.test(line))) {
      return <ul key={index}>{lines.map((line, i) => <li key={i}>{line.replace(/^[-*]\s+/, "")}</li>)}</ul>;
    }
    return <p key={index}>{block}</p>;
  })}</div>;
}
