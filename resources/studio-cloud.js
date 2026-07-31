/* Sole Rebranding Studio — cloud layer --------------------------------------
 *
 * Wraps Supabase (shared archive of saved brandings + a shared logo/asset
 * gallery) and Brandfetch (logo lookup, via a Supabase Edge Function).
 *
 * Degrades gracefully: if Supabase isn't configured (studio-config.js empty),
 * everything below still works against localStorage — the archive + logo gallery
 * are just this-browser-only until the keys are filled in. So the Studio never
 * hard-breaks on a missing backend.
 *
 * Exposes window.SoleStudioCloud with a small promise-based API the React app
 * calls. See docs/STUDIO_BACKEND_SETUP.md.
 * ------------------------------------------------------------------------- */
(function () {
  var CFG = window.SOLE_STUDIO_CONFIG || {};
  var authMode = CFG.authMode || 'magic-link';
  var hasSupabase = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase && window.supabase.createClient);

  var client = null;
  if (hasSupabase) {
    try { client = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey); }
    catch (e) { client = null; }
  }
  var cloud = !!client;
  var currentUser = null;   // cached signed-in user, for ownership stamping

  /* ---- localStorage fallback (this-browser-only mode) ------------------- */
  var LS_ARCHIVE = 'sole.toolkit.archive.v2';
  var LS_ASSETS = 'sole.toolkit.assets.v2';
  var lsGet = function (k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (_) { return []; } };
  var lsSet = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  var uid = function () { return 'x' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); };
  var nowISO = function () { return new Date().toISOString(); };
  var hashStr = function (s) { var h = 5381; for (var i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0; return 'h' + h.toString(36); };
  var dataUriToBlob = function (dataUri) {
    var parts = String(dataUri).split(','); var meta = parts[0] || ''; var b64 = parts[1] || '';
    var mime = (meta.match(/data:([^;]+)/) || [])[1] || 'image/png';
    var bin = atob(b64); var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return { blob: new Blob([arr], { type: mime }), mime: mime };
  };
  var extFor = function (mime) { return mime.indexOf('svg') >= 0 ? 'svg' : mime.indexOf('jpeg') >= 0 ? 'jpg' : mime.indexOf('webp') >= 0 ? 'webp' : 'png'; };

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
    // shouldCreateUser:false — only teammates you've invited in Supabase Auth can sign
    // in; a stranger's email gets no link. This is what makes the archive team-only.
    return client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: redirect, shouldCreateUser: false } })
      .then(function (r) { if (r && r.error) throw r.error; });
  }
  function signOut() { return cloud ? client.auth.signOut() : Promise.resolve(); }

  /* ---- brands (the archive) -------------------------------------------- */
  function listBrands() {
    if (!cloud) return Promise.resolve(lsGet(LS_ARCHIVE).slice().sort(function (a, b) { return String(b.updated_at || '').localeCompare(String(a.updated_at || '')); }));
    return client.from('brands').select('*').order('updated_at', { ascending: false })
      .then(function (r) { if (r.error) throw r.error; return r.data || []; });
  }
  function saveBrand(rec) {
    var row = { name: rec.name, config: rec.config, swatch: rec.swatch || null, export_count: rec.export_count || 0, last_exported_at: rec.last_exported_at || null,
      created_by: (currentUser && currentUser.id) || null, created_by_email: (currentUser && currentUser.email) || null };
    if (!cloud) {
      var all = lsGet(LS_ARCHIVE);
      var r = { id: uid(), name: row.name, config: row.config, swatch: row.swatch, export_count: row.export_count, last_exported_at: row.last_exported_at, created_by: row.created_by, created_by_email: row.created_by_email, created_at: nowISO(), updated_at: nowISO() };
      all.unshift(r); lsSet(LS_ARCHIVE, all); return Promise.resolve(r);
    }
    return client.from('brands').insert(row).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  }
  function updateBrand(id, patch) {
    var p = {}; for (var k in patch) p[k] = patch[k]; p.updated_at = nowISO();
    if (!cloud) { lsSet(LS_ARCHIVE, lsGet(LS_ARCHIVE).map(function (r) { return r.id === id ? Object.assign({}, r, p) : r; })); return Promise.resolve(); }
    return client.from('brands').update(p).eq('id', id).then(function (r) { if (r.error) throw r.error; });
  }
  function deleteBrand(id) {
    if (!cloud) { lsSet(LS_ARCHIVE, lsGet(LS_ARCHIVE).filter(function (r) { return r.id !== id; })); return Promise.resolve(); }
    return client.from('brands').delete().eq('id', id).then(function (r) { if (r.error) throw r.error; });
  }
  function bumpExport(id) {
    if (!cloud) {
      lsSet(LS_ARCHIVE, lsGet(LS_ARCHIVE).map(function (r) { return r.id === id ? Object.assign({}, r, { export_count: (r.export_count || 0) + 1, last_exported_at: nowISO() }) : r; }));
      return Promise.resolve();
    }
    // read-modify-write — fine for a low-traffic 2-person tool.
    // Abort on a read error/miss so a transient failure can't clobber the real count back to 1.
    return client.from('brands').select('export_count').eq('id', id).single()
      .then(function (res) {
        if (res.error || !res.data) return;
        var n = (res.data.export_count || 0) + 1;
        return client.from('brands').update({ export_count: n, last_exported_at: nowISO() }).eq('id', id);
      });
  }

  /* ---- assets (the shared logo gallery) -------------------------------- */
  function listAssets() {
    if (!cloud) return Promise.resolve(lsGet(LS_ASSETS));
    return client.from('assets').select('*').order('created_at', { ascending: false })
      .then(function (r) { if (r.error) throw r.error; return (r.data || []).map(function (a) { return Object.assign({}, a, { url: a.public_url }); }); });
  }
  function saveAsset(rec) {
    var dataUri = rec.dataUri; if (!dataUri) return Promise.resolve(null);
    var hash = rec.hash || hashStr(dataUri);
    if (!cloud) {
      var all = lsGet(LS_ASSETS);
      var ex = all.filter(function (a) { return a.hash === hash; })[0]; if (ex) return Promise.resolve(ex);
      var r = { id: uid(), name: rec.name || 'logo', domain: rec.domain || null, dataUri: dataUri, url: dataUri, source: rec.source || 'upload', hash: hash, tags: rec.tags || null, created_by: (currentUser && currentUser.id) || null, created_by_email: (currentUser && currentUser.email) || null, created_at: nowISO() };
      all.unshift(r); lsSet(LS_ASSETS, all); return Promise.resolve(r);
    }
    return client.from('assets').select('*').eq('hash', hash).limit(1)
      .then(function (found) {
        if (found.data && found.data.length) { var a = found.data[0]; return Object.assign({}, a, { url: a.public_url }); }
        var conv = dataUriToBlob(dataUri);
        var path = (rec.source === 'brandfetch' ? 'brandfetch/' : 'uploads/') + hash + '.' + extFor(conv.mime);
        return client.storage.from('logos').upload(path, conv.blob, { contentType: conv.mime, upsert: true })
          .then(function (up) {
            if (up.error) throw up.error;
            var pub = client.storage.from('logos').getPublicUrl(path);
            var publicUrl = (pub && pub.data) ? pub.data.publicUrl : null;
            return client.from('assets').insert({ name: rec.name || 'logo', domain: rec.domain || null, storage_path: path, public_url: publicUrl, mime: conv.mime, bytes: conv.blob.size, source: rec.source || 'upload', hash: hash, tags: rec.tags || null, created_by: (currentUser && currentUser.id) || null, created_by_email: (currentUser && currentUser.email) || null }).select().single()
              .then(function (res) { if (res.error) throw res.error; return Object.assign({}, res.data, { url: publicUrl }); });
          });
      });
  }
  function deleteAsset(id) {
    if (!cloud) { lsSet(LS_ASSETS, lsGet(LS_ASSETS).filter(function (a) { return a.id !== id; })); return Promise.resolve(); }
    return client.from('assets').select('storage_path').eq('id', id).single()
      .then(function (res) {
        var path = res.data && res.data.storage_path;
        var rm = path ? client.storage.from('logos').remove([path]).catch(function () {}) : Promise.resolve();
        return rm.then(function () { return client.from('assets').delete().eq('id', id); });
      });
  }
  function updateAsset(id, patch) {
    if (!cloud) { lsSet(LS_ASSETS, lsGet(LS_ASSETS).map(function (a) { return a.id === id ? Object.assign({}, a, patch) : a; })); return Promise.resolve(); }
    return client.from('assets').update(patch).eq('id', id).then(function (r) { if (r.error) throw r.error; });
  }
  // Return a data-URI for an asset so it can be baked into a fully-offline export.
  function assetDataUri(asset) {
    if (asset && asset.dataUri && /^data:/.test(asset.dataUri)) return Promise.resolve(asset.dataUri);
    var url = asset && (asset.url || asset.public_url); if (!url) return Promise.resolve(null);
    return fetch(url).then(function (r) { return r.blob(); }).then(function (blob) {
      return new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.onerror = function () { res(null); }; fr.readAsDataURL(blob); });
    });
  }

  /* ---- Brandfetch (via the Supabase Edge Function) --------------------- */
  function authHeader() {
    var base = { apikey: CFG.supabaseAnonKey };
    if (!cloud) return Promise.resolve(Object.assign({ Authorization: 'Bearer ' + CFG.supabaseAnonKey }, base));
    return client.auth.getSession().then(function (r) {
      var token = (r && r.data && r.data.session && r.data.session.access_token) || CFG.supabaseAnonKey;
      return Object.assign({ Authorization: 'Bearer ' + token }, base);
    });
  }
  function fnUrl(qs) { return String(CFG.supabaseUrl).replace(/\/$/, '') + '/functions/v1/brandfetch?' + qs; }
  function searchBrand(q) {
    if (!cloud) return Promise.reject(new Error('Connect Supabase to use Brandfetch'));
    return authHeader().then(function (h) {
      return fetch(fnUrl('action=search&q=' + encodeURIComponent(q)), { headers: h })
        .then(function (r) { if (!r.ok) throw new Error('search failed (' + r.status + ')'); return r.json(); });
    });
  }
  function importLogo(opts) {
    if (!cloud) return Promise.reject(new Error('Connect Supabase to use Brandfetch'));
    var qs = 'action=logo&domain=' + encodeURIComponent(opts.domain || '')
      + (opts.src ? '&src=' + encodeURIComponent(opts.src) : '')
      + (opts.name ? '&name=' + encodeURIComponent(opts.name) : '');
    return authHeader().then(function (h) {
      return fetch(fnUrl(qs), { headers: h })
        .then(function (r) { if (!r.ok) throw new Error('logo import failed (' + r.status + ')'); return r.json(); });
    });
  }

  window.SoleStudioCloud = {
    isConfigured: function () { return hasSupabase; },
    isCloud: function () { return cloud; },
    needsAuth: needsAuth,
    getUser: getUser, onAuth: onAuth, signIn: signIn, signOut: signOut,
    listBrands: listBrands, saveBrand: saveBrand, updateBrand: updateBrand, deleteBrand: deleteBrand, bumpExport: bumpExport,
    listAssets: listAssets, saveAsset: saveAsset, updateAsset: updateAsset, deleteAsset: deleteAsset, assetDataUri: assetDataUri,
    searchBrand: searchBrand, importLogo: importLogo,
  };
})();
