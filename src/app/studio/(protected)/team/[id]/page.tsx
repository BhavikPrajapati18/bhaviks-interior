import { EditorialEdit } from "@/components/studio/editorial-pages";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <EditorialEdit kind="team" id={id}/>; }
