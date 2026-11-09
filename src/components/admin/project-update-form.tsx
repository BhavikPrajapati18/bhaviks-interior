"use client";

import { useActionState } from "react";
import { addProjectTimelineUpdate, type ClientExperienceState } from "@/lib/actions/client-experience";

const initialState: ClientExperienceState = { error: "", message: "" };
export function ProjectUpdateForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(addProjectTimelineUpdate, initialState);
  return <form action={action} className="cms-surface ops-form">
    <input type="hidden" name="project_id" value={projectId}/>
    <h2>Project timeline update</h2>
    <p className="cms-hint">Publish a milestone, meeting summary, or delivery update. Clients see only published entries.</p>
    <div className="cms-fields">
      <label className="cms-field"><span>Update type</span><select name="kind" defaultValue="update">
        <option value="update">General update</option><option value="milestone">Milestone</option><option value="meeting">Meeting</option><option value="handover">Handover</option>
      </select></label>
      <label className="cms-field"><span>Visibility</span><select name="visible_to_client" defaultValue="yes"><option value="yes">Visible to client</option><option value="no">Internal only</option></select></label>
      <label className="cms-field ops-span"><span>Title</span><input name="title" required minLength={2} maxLength={160} placeholder="e.g. Material selection approved"/></label>
      <label className="cms-field ops-span"><span>Details (optional)</span><textarea name="details" rows={4} maxLength={3000} placeholder="Explain what happened and what comes next"/></label>
    </div>
    <div className="cms-form-footer"><button disabled={pending} type="submit" className="btn btn-primary">{pending ? "Saving…" : "Add update"}</button>
      {(state.error || state.message) && <p role="status" aria-live="polite" className={state.error ? "cms-error" : "cms-success"}>{state.error || state.message}</p>}
    </div>
  </form>;
}
