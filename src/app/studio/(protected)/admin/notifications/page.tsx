import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { markAdminNotificationsRead } from "@/lib/actions/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { CmsHeading } from "@/components/studio/ui";

export default async function AdminNotifications() {
  const { supabase, user } = await requireAdmin();
  const { data, error } = await supabase.from("notifications")
    .select("id,title,message,link_href,read_at,created_at")
    .eq("recipient_user_id", user.id)
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error("Unable to load notifications. Apply migration 006 first.");
  return <>
    <Link href="/studio/admin" className="cms-back">← Admin dashboard</Link>
    <CmsHeading title="Notifications" description="Client quotation responses and operations updates."/>
    <NotificationList items={data ?? []} action={markAdminNotificationsRead}/>
  </>;
}
