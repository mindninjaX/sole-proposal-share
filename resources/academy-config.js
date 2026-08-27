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
  //   'password'   (what we ship) - email + password, set from the Supabase
  //                dashboard and handed to the person directly. No email is
  //                sent at any point, which matters: Supabase's built-in mail
  //                service is capped at 2 messages an hour and the cap cannot
  //                be raised without wiring up custom SMTP, so magic links
  //                locked the team out of their own tool.
  //   'magic-link' one-time email link. Still implemented, needs custom SMTP
  //                before it is usable by more than one person an hour.
  //   'open'       no sign-in at all. Anyone with the URL can edit.
  authMode: 'password',

  // Storage bucket for lesson attachments (thumbnails, checklists, screenshots).
  // Videos are NEVER uploaded — they live on YouTube/Vimeo/Loom and the lesson
  // stores the link, which is why this stays comfortably inside the free tier.
  bucket: 'academy',
};
