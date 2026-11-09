export const editorialKinds = {
  testimonials: { table: "site_testimonials", singular: "testimonial", plural: "Testimonials", label: "client_name", description: "Client-approved reviews and feedback" },
  team: { table: "site_team_members", singular: "team member", plural: "Team", label: "full_name", description: "People behind the studio" },
  showcase: { table: "site_showcase_media", singular: "gallery item", plural: "Showcase", label: "title", description: "Published photos, curated galleries and videos" }
} as const;
export type EditorialKind = keyof typeof editorialKinds;
