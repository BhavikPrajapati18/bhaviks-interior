-- PHASE 2: additive migration for Bhavik's Interior ONLY.
-- Run AFTER 001_studio_foundation.sql, in your newly created project.
-- No historical customer data / third-party credentials are needed.

alter table public.site_config
  add column if not exists about_page_eyebrow text not null default 'OUR POINT OF VIEW',
  add column if not exists about_page_heading text not null default 'A HOME SHOULD FEEL LIKE YOU.',
  add column if not exists about_page_description text not null default 'We believe truly beautiful spaces emerge when everyday living and considered design meet.',
  add column if not exists services_page_eyebrow text not null default 'EXPERTISE & INTENTION',
  add column if not exists services_page_heading text not null default 'WHAT WE DO.',
  add column if not exists services_page_description text not null default 'Every space is different. Our approach combines practicality, texture and timeless design.',
  add column if not exists projects_page_eyebrow text not null default 'THE WORK',
  add column if not exists projects_page_heading text not null default 'SPACES TO REMEMBER.',
  add column if not exists projects_page_description text not null default 'A growing collection of spaces, ideas and thoughtful design decisions.',
  add column if not exists contact_page_eyebrow text not null default 'LET''S BEGIN',
  add column if not exists contact_page_heading text not null default 'EVERY GOOD SPACE STARTS SOMEWHERE.',
  add column if not exists contact_page_description text not null default 'Tell us about your ideas. We''d love to hear what you have in mind.',
  add column if not exists cta_image text not null default 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2000&q=85',
  add column if not exists story_image text not null default 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1300&q=85',
  add column if not exists services_eyebrow text not null default 'WHAT WE DO',
  add column if not exists services_heading text not null default 'DESIGN THAT MAKES ROOM FOR LIFE.',
  add column if not exists services_description text not null default 'From a single room to an entire environment, every detail is thoughtfully connected.',
  add column if not exists projects_eyebrow text not null default 'SELECTED WORK',
  add column if not exists projects_heading text not null default 'SPACES WITH A STORY TO TELL.',
  add column if not exists projects_description text not null default 'A look at the details, materials and moments that shape the work.',
  add column if not exists process_eyebrow text not null default 'HOW WE WORK',
  add column if not exists process_heading text not null default 'A CLEAR PATH FROM IDEA TO HOME.',
  add column if not exists process_description text not null default 'Every great interior starts with listening. Our process keeps the vision focused and the experience personal.',
  add column if not exists faq_eyebrow text not null default 'GOOD TO KNOW',
  add column if not exists faq_heading text not null default 'QUESTIONS, ANSWERED.',
  add column if not exists faq_description text not null default 'A few things to know before beginning your interior journey.',
  add column if not exists cta_heading text not null default 'LET''S DESIGN SOMETHING MEANINGFUL.',
  add column if not exists cta_description text not null default 'Tell us about the space you have in mind. We''ll take it from there.',
  add column if not exists contact_email text not null default '',
  add column if not exists contact_phone text not null default '',
  add column if not exists seo_title text not null default 'Bhavik''s Interior — Thoughtful interior design',
  add column if not exists seo_description text not null default 'Thoughtful interiors shaped around the way you live.';

alter table public.services
  add column if not exists long_description text not null default '',
  add column if not exists features text[] not null default '{}',
  add column if not exists meta_title text not null default '',
  add column if not exists meta_description text not null default '';

alter table public.portfolio_projects
  add column if not exists gallery_images text[] not null default '{}',
  add column if not exists project_year text not null default '',
  add column if not exists meta_title text not null default '',
  add column if not exists meta_description text not null default '';

create table if not exists public.process_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  display_order integer not null default 0,
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Installation is on a new database. Re-running should not duplicate policies/triggers.
do $$ begin
  if not exists (select 1 from pg_trigger where tgname='process_steps_updated' and tgrelid='public.process_steps'::regclass) then
    create trigger process_steps_updated before update on public.process_steps for each row execute function public.touch_updated_at();
  end if;
end $$;
alter table public.process_steps enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='process_steps' and policyname='Public read published process') then
    create policy "Public read published process" on public.process_steps for select to anon, authenticated using (is_published);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='process_steps' and policyname='Editor read all process') then
    create policy "Editor read all process" on public.process_steps for select to authenticated using ((select public.has_content_access()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='process_steps' and policyname='Editor insert process') then
    create policy "Editor insert process" on public.process_steps for insert to authenticated with check ((select public.has_content_access()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='process_steps' and policyname='Editor update process') then
    create policy "Editor update process" on public.process_steps for update to authenticated using ((select public.has_content_access())) with check ((select public.has_content_access()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='process_steps' and policyname='Editor delete process') then
    create policy "Editor delete process" on public.process_steps for delete to authenticated using ((select public.has_content_access()));
  end if;
end $$;

insert into public.process_steps (title, description, display_order, is_published)
select x.title, x.description, x.display_order, true from (values
 ('Discover','We begin by learning how you live, what you need, and what matters most.',1),
 ('Imagine','Ideas take shape through thoughtful layouts, materials and a shared vision.',2),
 ('Refine','Every proportion, finish and detail is considered until it feels just right.',3),
 ('Realise','A clear, collaborative path turns the concept into a space of your own.',4)
) as x(title, description, display_order)
where not exists (select 1 from public.process_steps);

-- Public site photography ONLY. Never upload private floorplans, proposals, or identity documents here.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('studio-media', 'studio-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Public view marketing images') then
    create policy "Public view marketing images" on storage.objects for select to anon, authenticated
    using (bucket_id='studio-media');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Editors upload marketing images') then
    create policy "Editors upload marketing images" on storage.objects for insert to authenticated
    with check (bucket_id='studio-media' and (select public.has_content_access()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Editors delete marketing images') then
    create policy "Editors delete marketing images" on storage.objects for delete to authenticated
    using (bucket_id='studio-media' and (select public.has_content_access()));
  end if;
end $$;
