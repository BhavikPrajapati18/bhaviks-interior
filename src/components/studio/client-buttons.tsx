"use client";
import { useState } from "react";
export function ConfirmDeleteButton({ label = "Delete permanently" }: { label?: string }) {
  return <button className="cms-danger-button" type="submit" onClick={(event) => {
    if (!window.confirm("Delete this content permanently? You can unpublish instead.")) event.preventDefault();
  }}>{label}</button>;
}
export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="cms-copy-button" type="button" onClick={async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); }
    catch { setCopied(false); }
  }}>{copied ? "URL copied ✓" : "Copy image URL"}</button>;
}
