/* Sole Academy Studio — backend config ---------------------------------------
 *
 * ALL backend coupling for the Studio lives in this one file. That's deliberate:
 * pointing the tool at a different Supabase project (say, engineering's own) is
 * a two-line change here, not a rewrite. See docs/ACADEMY_INTEGRATION.md.
 *
 * Until supabaseUrl + supabaseAnonKey are set, the Studio still works but runs
 * in LOCAL mode: the curriculum lives only in THIS browser and publishing is off.
 * Fill them in and the draft becomes shared across the team.
 *
 * The anon key is PUBLIC-safe to ship in the page — access is enforced by Row
 * Level Security in the database, not by hiding this key. Never put the
 * *service role* key here.
 *
 * Setup (~10 minutes, no coding): docs/ACADEMY_STUDIO_SETUP.md
 * ------------------------------------------------------------------------- */
window.SOLE_ACADEMY_CONFIG = {
  // Project "Sole Academy" (ref lecdrfapvjydknuzjrfs, ap-northeast-2), created
  // 26 Aug 2026 as the Academy's OWN backend. It used to point at the Rebranding
  // Studio's project; the two tools no longer share one. Everything the Academy
  // needs lives here: the curriculum tables, the team's logins, and the `site`
  // bucket the standalone learner page is served out of.
  supabaseUrl: "https://lecdrfapvjydknuzjrfs.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlY2RyZmFwdmp5ZGtudXpqcmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NDI1MDIsImV4cCI6MjEwMzMxODUwMn0.lYT3mWW0iO58YMdYbOA4_dv-LKEKa4PcH3W4oWTQlTI",

  // Access model:
  //   'magic-link' (recommended) — teammates sign in with a one-time email link;
  //                                only people you've invited in Supabase Auth
  //                                can get in.
  //   'open'                     — anyone with the link can edit the curriculum
  //                                (also enable the OPEN MODE policies in
  //                                supabase/migrations/0003_academy_cms.sql).
  authMode: 'magic-link',

  // Storage bucket for lesson attachments (thumbnails, checklists, screenshots).
  // Videos are NEVER uploaded — they live on YouTube/Vimeo/Loom and the lesson
  // stores the link, which is why this stays comfortably inside the free tier.
  bucket: 'academy',
};
