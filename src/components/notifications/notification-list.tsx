import Link from "next/link";
import styles from "./notification-list.module.css";

export type Notice = {
  id: string;
  title: string;
  message: string;
  link_href: string;
  read_at: string | null;
  created_at: string;
};

export function NotificationList({ items, action }: {
  items: Notice[];
  action: (data: FormData) => Promise<void>;
}) {
  const unread = items.filter(item => !item.read_at).length;
  return <section className={styles.panel} aria-label="Notifications">
    <header className={styles.header}>
      <span className={styles.hint}>{unread ? `${unread} unread in recent notifications` : "All recent notifications read"}</span>
      {unread > 0 && <form action={action}><input name="notification_id" type="hidden" value="all"/>
        <button className={styles.action} type="submit">Mark all as read</button></form>}
    </header>
    {items.length ? <ul className={styles.list}>
      {items.map(item => <li key={item.id} className={`${styles.item} ${!item.read_at ? styles.unread : ""}`}>
        <div className={styles.content}>
          <strong>{item.title}</strong>
          <p>{item.message}</p>
          <time className={styles.when} dateTime={item.created_at}>{new Date(item.created_at).toLocaleString("en-IN", {
            dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata"
          })}</time>
          <Link href={item.link_href}>Open related item →</Link>
        </div>
        {!item.read_at && <form action={action}>
          <input type="hidden" name="notification_id" value={item.id}/>
          <button className={styles.action} type="submit">Mark read</button>
        </form>}
      </li>)}
    </ul> : <p className={styles.empty}>You have no notifications yet.</p>}
  </section>;
}
