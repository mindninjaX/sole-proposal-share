/* Sole Rebranding Studio — backend config -----------------------------------
 *
 * Fill these in AFTER you've provisioned Supabase + Brandfetch.
 * Full step-by-step: docs/STUDIO_BACKEND_SETUP.md
 *
 * Until supabaseUrl + supabaseAnonKey are set, the Studio still works but runs in
 * LOCAL mode: the archive + saved logos live only in THIS browser (not shared).
 * Fill them in and the archive becomes shared across your team.
 *
 * The anon key is PUBLIC-safe to ship in the page — access is enforced by
 * Row Level Security in the database, not by hiding this key.
 * ------------------------------------------------------------------------- */
window.SOLE_STUDIO_CONFIG = {
  supabaseUrl: "https://eycyiwhhygoiysqymzbp.supabase.co",        // e.g. 'https://abcdefgh.supabase.co'
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3lpd2hoeWdvaXlzcXltemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzYzNzEsImV4cCI6MjEwMTA1MjM3MX0.QeY_0UCEeq0HxnC8ArWj_KPLbuzfJ-hBud64NdUqSJQ",    // the project's public anon/publishable key

  // Access model:
  //   'magic-link' (recommended) — teammates sign in with a one-time email link;
  //                                only allow-listed emails can see/edit the archive.
  //   'open'                     — anyone with the link can use the shared archive
  //                                (also add the anon RLS policies from the SQL file).
  authMode: 'magic-link',

  // Brandfetch logo lookup runs through the Supabase Edge Function (the client ID
  // is a server-side secret there), so nothing extra is needed here — it turns on
  // automatically once Supabase is configured and the function is deployed.
};
