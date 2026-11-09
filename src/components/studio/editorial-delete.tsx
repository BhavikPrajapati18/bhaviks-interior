"use client";
import { useState } from "react";
export function EditorialDeleteButton() {
  const [confirm, setConfirm] = useState(false);
  return confirm ? <button type="submit" className="cms-danger-link">Confirm permanent deletion</button>
    : <button type="button" onClick={() => setConfirm(true)} className="cms-danger-link">Delete record</button>;
}
