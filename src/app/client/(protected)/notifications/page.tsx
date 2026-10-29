import Link from "next/link";
import { requireClient } from "@/lib/access";
import { markClientNotificationsRead } from "@/lib/actions/notifications";
import { NotificationList } from "@/components/notifications/notification-list";

export default async function ClientNotifications() {
  const { supabase, user } = await requireClient();
  const { data, error } = await supabase.from("notifications")
    .select("id,title,message,link_href,read_at,created_at")
    .eq("recipient_user_id", user.id)
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error("Unable to load notifications. Apply migration 006 first.");
  return <>
    <Link href="/client" className="cms-back">← Overview</Link>
    <h1 className="client-title">Notifications</h1>
    <p className="client-lede">Updates on your quotations, projects, and private documents.</p>
    <NotificationList items={data ?? []} action={markClientNotificationsRead}/>
  </>;
}
