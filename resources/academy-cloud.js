/* Sole Academy Studio — cloud layer ------------------------------------------
 *
 * Wraps Supabase for the Studio: the shared curriculum draft (one row per
 * product), immutable published versions, and the media library.
 *
 * Degrades gracefully. If Supabase isn't configured (academy-config.js empty) or
 * the CDN didn't load, everything below still resolves against localStorage — the
 * curriculum is just this-browser-only until the keys are filled in. Publishing
 * is the one thing that genuinely needs the backend (a version nobody can read
 * isn't published), so it rejects in local mode rather than pretending.
 *
 * Exposes window.SoleAcademyCloud. Mirrors resources/studio-cloud.js so the two
 * internal tools stay recognisably the same shape.
 * ------------------------------------------------------------------------- */
(function () {
  var CFG = window.SOLE_ACADEMY_CONFIG || {};
  var authMode = CFG.authMode || 'magic-link';
  var BUCKET = CFG.bucket || 'academy';
  var hasSupabase = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase && window.supabase.createClient);

  var client = null;
  if (hasSupabase) {
    try { client = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey); }
    catch (e) { client = null; }
  }
  var cloud = !!client;
  var currentUser = null;

  // The Studio offers a "work in this browser" escape hatch so the tool is usable
  // before any backend setup. That choice has to reach THIS layer too — otherwise
  // media uploads would still try (and fail against) a project whose tables don't
  // exist yet. The Studio calls forceLocal() whenever that preference changes.
  function forceLocal(on) { cloud = on ? false : !!client; }

  /* ---- localStorage fallback ------------------------------------------- */
  var LS_DRAFTS = 'sole.academy.cloud.drafts.v1';
  var LS_ASSETS = 'sole.academy.cloud.assets.v1';
  var lsGet = function (k, fb) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (_) { return fb; } };
  var lsSet = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  var nowISO = function () { return new Date().toISOString(); };
  var uid = function () { return 'x' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); };
  var hashStr = function (s) { var h = 5381; for (var i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0; return 'h' + h.toString(36); };
  var dataUriToBlob = function (dataUri) {
    var parts = String(dataUri).split(','); var meta = parts[0] || ''; var b64 = parts[1] || '';
    var mime = (meta.match(/data:([^;]+)/) || [])[1] || 'application/octet-stream';
    var bin = atob(b64); var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return { blob: new Blob([arr], { type: mime }), mime: mime };
  };
  var extFor = function (mime, name) {
    var fromName = String(name || '').match(/\.([a-z0-9]{1,5})$/i);
    if (fromName) return fromName[1].toLowerCase();
    if (mime.indexOf('svg') >= 0) return 'svg';
    if (mime.indexOf('jpeg') >= 0) return 'jpg';
    if (mime.indexOf('webp') >= 0) return 'webp';
    if (mime.indexOf('png') >= 0) return 'png';
    if (mime.indexOf('pdf') >= 0) return 'pdf';
    return 'bin';
  };
  var who = function () {
    return {
      id: (currentUser && currentUser.id) || null,
      email: (currentUser && currentUser.email) || null,
    };
  };

  /* ---- auth ------------------------------------------------------------- */
  function needsAuth() { return cloud && authMode === 'magic-link'; }

  function getUser() {
    if (!cloud) { currentUser = { id: 'local', email: 'this browser' }; return Promise.resolve(currentUser); }
    return client.auth.getUser()
      .then(function (r) { currentUser = (r && r.data && r.data.user) ? r.data.user : null; return currentUser; })
      .catch(function () { return null; });
  }
  function onAuth(cb) {
    if (!cloud) return null;
    var r = client.auth.onAuthStateChange(function (_e, session) { currentUser = session ? session.user : null; cb(currentUser); });
    return (r && r.data) ? r.data.subscription : null;
  }
  function signIn(email) {
    if (!cloud) return Promise.resolve();
    var redirect = location.href.split('#')[0];
    // shouldCreateUser:false — only teammates invited in Supabase Auth can sign
    // in; a stranger who finds the link and types their email gets nothing back.
    return client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: redirect, shouldCreateUser: false } })
      .then(function (r) { if (r && r.error) throw r.error; });
  }
  function signOut() { return cloud ? client.auth.signOut() : Promise.resolve(); }

  /* ---- the shared draft (one row per product) ---------------------------
     Writes carry the updated_at we last read. If it no longer matches, someone
     else saved in the meantime and we report a conflict instead of clobbering
     their work. */
  function loadDraft(product) {
    if (!cloud) {
      var all = lsGet(LS_DRAFTS, {});
      return Promise.resolve(all[product] || null);
    }
    return client.from('academy_curricula').select('*').eq('product', product).maybeSingle()
      .then(function (r) {
        if (r.error) throw r.error;
        return r.data || null;
      });
  }

  function saveDraft(product, doc, expectedUpdatedAt) {
    var stamp = nowISO();
    var me = who();
    if (!cloud) {
      var all = lsGet(LS_DRAFTS, {});
      all[product] = { product: product, doc: doc, updated_at: stamp, updated_by_email: me.email };
      lsSet(LS_DRAFTS, all);
      return Promise.resolve({ ok: true, updated_at: stamp });
    }
    var row = { product: product, doc: doc, updated_at: stamp, updated_by: me.id, updated_by_email: me.email };

    // No known stamp → first write from this session; create or take over the row.
    if (!expectedUpdatedAt) {
      return client.from('academy_curricula').upsert(row, { onConflict: 'product' }).select().single()
        .then(function (r) { if (r.error) throw r.error; return { ok: true, updated_at: r.data.updated_at }; });
    }

    return client.from('academy_curricula').update(row).eq('product', product).eq('updated_at', expectedUpdatedAt).select()
      .then(function (r) {
        if (r.error) throw r.error;
        if (r.data && r.data.length) return { ok: true, updated_at: r.data[0].updated_at };
        // Nothing matched — either the row moved on, or it's gone.
        return client.from('academy_curricula').select('updated_at,updated_by_email').eq('product', product).maybeSingle()
          .then(function (cur) {
            if (cur.error) throw cur.error;
            if (!cur.data) {
              return client.from('academy_curricula').upsert(row, { onConflict: 'product' }).select().single()
                .then(function (x) { if (x.error) throw x.error; return { ok: true, updated_at: x.data.updated_at }; });
            }
            return { conflict: true, updated_at: cur.data.updated_at, updated_by_email: cur.data.updated_by_email };
          });
      });
  }

  /* ---- published versions ---------------------------------------------- */
  function listVersions(product) {
    // Local mode has no published versions by design — see publishVersion.
    if (!cloud) return Promise.resolve([]);
    return client.from('academy_versions').select('*').eq('product', product).order('version', { ascending: false })
      .then(function (r) { if (r.error) throw r.error; return r.data || []; });
  }

  function publishVersion(product, doc, note) {
    if (!cloud) return Promise.reject(new Error('Connect the shared backend before publishing'));
    var me = who();
    return client.from('academy_versions').select('version').eq('product', product).order('version', { ascending: false }).limit(1)
      .then(function (r) {
        if (r.error) throw r.error;
        var next = ((r.data && r.data[0] && r.data[0].version) || 0) + 1;
        return client.from('academy_versions').insert({
          product: product, version: next, doc: doc, note: (note || '').trim() || null,
          published_by: me.id, published_by_email: me.email,
        }).select().single();
      })
      .then(function (r) {
        if (r.error) {
          // The unique(product, version) constraint caught a genuine race.
          if (String(r.error.message || '').indexOf('duplicate') >= 0) throw new Error('Someone published at the same moment. Refresh the history and try again.');
          throw r.error;
        }
        return r.data;
      });
  }

  /* ---- media library ---------------------------------------------------- */
  function listAssets() {
    if (!cloud) return Promise.resolve(lsGet(LS_ASSETS, []));
    return client.from('academy_assets').select('*').order('created_at', { ascending: false })
      .then(function (r) {
        if (r.error) throw r.error;
        return (r.data || []).map(function (a) { return Object.assign({}, a, { url: a.public_url }); });
      });
  }

  function saveAsset(rec) {
    var dataUri = rec && rec.dataUri;
    if (!dataUri) return Promise.resolve(null);
    var hash = hashStr(dataUri);
    var me = who();
    if (!cloud) {
      var all = lsGet(LS_ASSETS, []);
      var existing = all.filter(function (a) { return a.hash === hash; })[0];
      if (existing) return Promise.resolve(existing);
      var r = {
        id: uid(), name: rec.name || 'file', kind: rec.kind || 'attachment', product: rec.product || null,
        mime: rec.mime || '', dataUri: dataUri, url: dataUri, hash: hash, tags: rec.tags || null,
        created_by: me.id, created_by_email: me.email, created_at: nowISO(),
      };
      all.unshift(r); lsSet(LS_ASSETS, all);
      return Promise.resolve(r);
    }
    return client.from('academy_assets').select('*').eq('hash', hash).limit(1)
      .then(function (found) {
        if (found.data && found.data.length) {
          var a = found.data[0];
          return Object.assign({}, a, { url: a.public_url });
        }
        var conv = dataUriToBlob(dataUri);
        var path = (rec.product ? rec.product + '/' : 'shared/') + hash + '.' + extFor(conv.mime, rec.name);
        return client.storage.from(BUCKET).upload(path, conv.blob, { contentType: conv.mime, upsert: true })
          .then(function (up) {
            if (up.error) throw up.error;
            var pub = client.storage.from(BUCKET).getPublicUrl(path);
            var publicUrl = (pub && pub.data) ? pub.data.publicUrl : null;
            return client.from('academy_assets').insert({
              name: rec.name || 'file', kind: rec.kind || 'attachment', product: rec.product || null,
              storage_path: path, public_url: publicUrl, mime: conv.mime, bytes: conv.blob.size,
              hash: hash, tags: rec.tags || null, created_by: me.id, created_by_email: me.email,
            }).select().single()
              .then(function (res) { if (res.error) throw res.error; return Object.assign({}, res.data, { url: publicUrl }); });
          });
      });
  }

  function deleteAsset(id) {
    if (!cloud) {
      lsSet(LS_ASSETS, lsGet(LS_ASSETS, []).filter(function (a) { return a.id !== id; }));
      return Promise.resolve();
    }
    return client.from('academy_assets').select('storage_path').eq('id', id).single()
      .then(function (res) {
        var path = res.data && res.data.storage_path;
        var rm = path ? client.storage.from(BUCKET).remove([path]).catch(function () {}) : Promise.resolve();
        return rm.then(function () { return client.from('academy_assets').delete().eq('id', id); });
      })
      .then(function (r) { if (r && r.error) throw r.error; });
  }

  window.SoleAcademyCloud = {
    isConfigured: function () { return hasSupabase; },
    isCloud: function () { return cloud; },
    forceLocal: forceLocal,
    needsAuth: needsAuth,
    getUser: getUser, onAuth: onAuth, signIn: signIn, signOut: signOut,
    loadDraft: loadDraft, saveDraft: saveDraft,
    listVersions: listVersions, publishVersion: publishVersion,
    listAssets: listAssets, saveAsset: saveAsset, deleteAsset: deleteAsset,
    // Handy when debugging the read path engineering will use.
    publicReadUrl: function (product) {
      if (!CFG.supabaseUrl) return '';
      return String(CFG.supabaseUrl).replace(/\/$/, '')
        + '/rest/v1/academy_versions?product=eq.' + encodeURIComponent(product)
        + '&select=version,doc,published_at&order=version.desc&limit=1';
    },
  };
})();
