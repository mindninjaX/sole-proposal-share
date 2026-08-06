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
  // Same project the Rebranding Studio uses — the Academy adds its own tables,
  // so there's nothing new to sign up for. Swap these to use a separate project.
  supabaseUrl: "https://eycyiwhhygoiysqymzbp.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3lpd2hoeWdvaXlzcXltemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzYzNzEsImV4cCI6MjEwMTA1MjM3MX0.QeY_0UCEeq0HxnC8ArWj_KPLbuzfJ-hBud64NdUqSJQ",

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
