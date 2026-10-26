import type { FormStatus } from "@/lib/actions/cms";
export function SaveNotice({ state }: { state: FormStatus }) {
  return <div aria-live="polite" className="cms-notice" role="status">
    {state.error ? <span className="cms-error">{state.error}</span> : state.message ? <span className="cms-success">{state.message}</span> : null}
  </div>;
}
export function CmsHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="cms-heading"><div><span className="cms-eyebrow">CONTENT MANAGEMENT</span><h1>{title}</h1><p>{description}</p></div>{action && <div>{action}</div>}</div>;
}
