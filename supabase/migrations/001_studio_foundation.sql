-- Bhavik's Interior — first independent database migration.
-- Run ONLY inside a fresh Supabase project. This script is NOT a migration of an older production database.
-- Safe for a new empty project. Review before execution.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'marketing', 'admin')),
  full_name text,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER avoids a recursive RLS lookup on profiles.
create or replace function public.has_content_access()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('marketing','admin')
  );
$$;
revoke all on function public.has_content_access() from public, anon;
grant execute on function public.has_content_access() to authenticated;

create table public.site_config (
  id smallint primary key default 1 check (id = 1),
  brand_name text not null default 'Bhavik''s Interior',
  hero_eyebrow text not null default 'INTERIORS WITH INTENTION',
  hero_heading text not null default 'SPACES SHAPED AROUND LIFE.',
  hero_description text not null default 'Thoughtful materials, quiet details, and a considered approach to every space.',
  hero_image text not null default '',
  introduction_eyebrow text not null default 'THE STUDIO PHILOSOPHY',
  introduction_heading text not null default 'GOOD DESIGN IS FELT, NOT JUST SEEN.',
  introduction_body text not null default 'A room should work beautifully and feel effortless.',
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  image_url text not null default '',
  category text not null default '',
  is_published boolean not null default false,
  display_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  cover_image text not null default '',
  location text not null default '',
  category text not null default '',
  is_published boolean not null default false,
  display_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_published boolean not null default false,
  display_order integer not null default 0
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null,
  phone text,
  message text not null check (char_length(message) between 15 and 3000),
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger site_config_updated before update on public.site_config for each row execute function public.touch_updated_at();
create trigger services_updated before update on public.services for each row execute function public.touch_updated_at();
create trigger projects_updated before update on public.portfolio_projects for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.site_config enable row level security;
alter table public.services enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.faqs enable row level security;
alter table public.inquiries enable row level security;

create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);

create policy "Read site settings" on public.site_config for select to anon, authenticated using (true);
create policy "Editors update site settings" on public.site_config for update to authenticated using ((select public.has_content_access())) with check ((select public.has_content_access()));

create policy "Read published services" on public.services for select to anon, authenticated using (is_published);
create policy "Editors view all services" on public.services for select to authenticated using ((select public.has_content_access()));
create policy "Editors insert services" on public.services for insert to authenticated with check ((select public.has_content_access()));
create policy "Editors update services" on public.services for update to authenticated using ((select public.has_content_access())) with check ((select public.has_content_access()));
create policy "Editors delete services" on public.services for delete to authenticated using ((select public.has_content_access()));

create policy "Read published projects" on public.portfolio_projects for select to anon, authenticated using (is_published);
create policy "Editors view all projects" on public.portfolio_projects for select to authenticated using ((select public.has_content_access()));
create policy "Editors insert projects" on public.portfolio_projects for insert to authenticated with check ((select public.has_content_access()));
create policy "Editors update projects" on public.portfolio_projects for update to authenticated using ((select public.has_content_access())) with check ((select public.has_content_access()));
create policy "Editors delete projects" on public.portfolio_projects for delete to authenticated using ((select public.has_content_access()));

create policy "Read published FAQs" on public.faqs for select to anon, authenticated using (is_published);
create policy "Editors view all FAQs" on public.faqs for select to authenticated using ((select public.has_content_access()));
create policy "Editors insert FAQs" on public.faqs for insert to authenticated with check ((select public.has_content_access()));
create policy "Editors update FAQs" on public.faqs for update to authenticated using ((select public.has_content_access())) with check ((select public.has_content_access()));
create policy "Editors delete FAQs" on public.faqs for delete to authenticated using ((select public.has_content_access()));

-- Public enquiries are write-only; never allow anonymous reads.
-- Add CAPTCHA and server-side rate limiting before enabling this form on a real public domain.
create policy "Visitors submit enquiries" on public.inquiries for insert to anon, authenticated with check (status = 'new');
create policy "Editors see enquiries" on public.inquiries for select to authenticated using ((select public.has_content_access()));
create policy "Editors manage enquiries" on public.inquiries for update to authenticated using ((select public.has_content_access())) with check ((select public.has_content_access()));

insert into public.site_config (id, hero_image, hero_description, introduction_body)
values (1,
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=85',
  'Thoughtful materials, quiet details, and a considered approach to every space. Designed to feel personal, and made to last.',
  'A room should work beautifully and feel effortless. We balance form, function and warmth to create environments with a distinct sense of belonging.'
);

-- Concept/sample content only, not real past work.
insert into public.services (slug,title,description,category,image_url,is_published,display_order) values
('residential-interiors','Residential Interiors','Warm, personal spaces developed around daily life.','HOMES','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',true,1),
('space-planning','Space Planning','Layouts that put the way you live first.','PLANNING','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85',true,2),
('material-curation','Material Curation','Carefully chosen textures and timeless finishes.','DETAILS','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85',true,3);
insert into public.portfolio_projects(slug,title,description,category,location,cover_image,is_published,display_order) values
('the-quiet-residence','The Quiet Residence','Concept exploration of soft light, warm textures and calm living.','Residential','Concept Study','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',true,1),
('a-place-to-unwind','A Place to Unwind','Understated details and everyday comfort.','Living Spaces','Concept Study','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',true,2);
insert into public.faqs(question,answer,is_published,display_order) values
('How does a design project begin?','We start with a discovery conversation about your space, priorities, timeline and budget.',true,1),
('Can you help with a single room?','Yes. A focused room refresh can receive the same attention to detail as an entire home.',true,2);

-- Bootstrap editor account after creating it in Supabase Authentication → Users:
-- INSERT INTO public.profiles(id, role, full_name) VALUES ('NEW_AUTH_USER_UUID', 'admin', 'Site owner');
-- Do NOT run that commented line until a real user has been created in the NEW project.
