import { humanDate } from "@/lib/admin-data";
import { deleteProjectTimelineUpdate } from "@/lib/actions/client-experience";

export type TimelineEntry = {
  id: string;
  title: string;
  details: string;
  kind: string;
  occurred_at: string;
  visible_to_client?: boolean;
};

export function ProjectTimeline({
  entries,
  adminView = false,
  projectId,
}: {
  entries: TimelineEntry[];
  adminView?: boolean;
  projectId?: string;
}) {
  return <div className="client-timeline">
    {entries.length === 0 ? <p className="client-empty">No project updates yet.</p> : entries.map(entry =>
      <article key={entry.id} className="client-timeline-item">
        <span aria-hidden="true" className="client-timeline-dot"/>
        <div>
          <div className="client-timeline-meta"><span>{humanDate(entry.occurred_at)}</span><span>{entry.kind}</span>
            {adminView && !entry.visible_to_client && <span>Internal only</span>}
          </div>
          <h3>{entry.title}</h3>
          {entry.details && <p className="ops-preserve">{entry.details}</p>}
          {adminView && projectId && <form action={deleteProjectTimelineUpdate} className="client-timeline-delete">
            <input type="hidden" name="project_id" value={projectId}/>
            <input type="hidden" name="update_id" value={entry.id}/>
            <button className="cms-danger-link" type="submit">Delete update</button>
          </form>}
        </div>
      </article>
    )}
  </div>;
}
