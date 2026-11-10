/* The page itself: the mode switch, the state it remembers, the controls in the bar, and the
 * start-up that hands the dataset to the modules.
 *
 * This module is loaded last, because it is the one that starts the page. It holds:
 *   - the mode switch, matrix or C4, and the choice this browser remembers
 *   - the Explanations chip, and the choice this browser remembers
 *   - the subject chips, the filter chips and the entry toggle
 *   - the header line, which counts only the subjects switched on
 *   - Escape, which closes whatever is open, innermost first
 *   - the dataset: the block inlined in the standalone copy, or territory.json beside a copy
 *     served from a folder
 *
 *   - the lens written into the address, so a member can send somebody the exact view they are
 *     looking at, and so the comment button and the Layers link can both name it
 *   - the comment button, which opens a prefilled email, and the Layers link to the atlas
 *
 * The address carries the lens: mode, the diagram's view, the filter, the entry toggle and which
 * subjects the coverage metric counts. It is written with replaceState, so it never adds a step
 * to the browser's back button, and every touch of history and of the address is wrapped, because
 * a copy of this page inside another page is not always allowed either. The address wins over
 * what the browser remembers; with no address to read, localStorage answers as it did before.
 */
(function(){
  "use strict";

  var MAP = window.MAP;

  // ---- what this browser remembers -----------------------------------------
  // Storage can be absent or refuse to answer (a private window, blocked site data), so every
  // touch of it is wrapped: Matrix is the answer whenever the mode cannot be read, and the
  // explanations are on whenever their setting cannot be read.
  var MODE_KEY = "msf-map-mode";
  var EXPL_KEY = "msf-map-explanations";
  var EXPL_HINT = "Hover or tab to any name, chip or number for a written explanation.";

  function readMode(){
    try{
      return window.localStorage.getItem(MODE_KEY) === "c4" ? "c4" : "matrix";
    }catch(e){ return "matrix"; }
  }
  function saveMode(value){
    try{ window.localStorage.setItem(MODE_KEY, value); }catch(e){}
  }

  // ---- the explanations switch ---------------------------------------------
  // Off means no explanation box opens anywhere, on hover or on keyboard focus, and no item
  // carries aria-describedby, so a screen reader is not pointed at one either. The chip that
  // does the switching keeps its own explanation in both states, so the way back is explained.
  // The box itself is tooltips.js; this is only the switch.
  function readExpl(){
    try{ return window.localStorage.getItem(EXPL_KEY) !== "off"; }catch(e){ return true; }
  }
  function saveExpl(value){
    try{ window.localStorage.setItem(EXPL_KEY, value ? "on" : "off"); }catch(e){}
  }
  function syncExpl(){
    var chip = MAP.el.explChip, hint = MAP.el.explHint;
    if(chip) chip.setAttribute("aria-pressed", String(MAP.explOn));
    if(hint) hint.textContent = MAP.explOn ? EXPL_HINT : "Explanations are off.";
    if(!MAP.explOn) MAP.hideTip();
  }
  function setExplanations(next){
    MAP.explOn = !!next;
    saveExpl(MAP.explOn);
    syncExpl();
  }
  function wireExplanations(){
    var chip = MAP.el.explChip;
    if(!chip) return;
    chip.addEventListener("click", function(){ setExplanations(!MAP.explOn); });
  }

  // ---- the lens in the address ----------------------------------------------
  // Written with replaceState so it never adds a step to the back button, and wrapped because a
  // copy of this page inside another page can be refused the history object altogether.
  var FILTERS = {all:1, overlap:1, thin:1, gap:1, conflict:1, connect:1, interop:1};

  function lensHash(){
    var parts = ["mode=" + MAP.mode];
    if(MAP.mode === "c4") parts.push("view=" + MAP.c4View);
    parts.push("lens=" + MAP.filter);
    if(MAP.hasEntry) parts.push("entry=1");
    parts.push("count=" + MAP.metricBasis);
    return "#" + parts.join("&");
  }

  function readHash(){
    var out = {}, raw = "";
    try{ raw = String(window.location.hash || "").replace(/^#/, ""); }catch(e){ return out; }
    if(!raw) return out;
    raw.split("&").forEach(function(part){
      var i = part.indexOf("=");
      if(i <= 0) return;
      try{
        out[decodeURIComponent(part.slice(0, i))] = decodeURIComponent(part.slice(i + 1));
      }catch(e){}
    });
    return out;
  }

  // The two links both quote the address, so they are rewritten wherever it is, and nowhere
  // else: one place changes the address, one place follows it.
  function writeHash(){
    try{
      if(window.history && window.history.replaceState){
        var l = window.location;
        window.history.replaceState(null, "", l.pathname + l.search + lensHash());
      }
    }catch(e){}
    syncLinks();
  }

  // ---- the way out of this page ----------------------------------------------
  // The Atlas link goes to the atlas as it opens; the Layers link goes to the same page at its
  // top level with the shores hidden. Both carry the lens in force, so the picture there opens on
  // the same question. The comment button opens a prefilled email naming the page and the address
  // the member was looking at. No form, no store, nothing sent from here.
  // The atlas is the address the map lands on, so both go to /msf/map/ itself.
  var ATLAS_PAGE = "https://openspatials.com/msf/map/";
  var ATLAS = ATLAS_PAGE + "#level=territory&layers=1";
  // Where a comment goes. One constant, and it is empty on purpose: no address ships on this
  // page. While it is empty the button carries the hidden attribute and nothing is written into
  // the markup for anybody, or any scanner, to find. The submissions work fills it in with the submissions
  // address. A value that begins with http is opened as it stands; anything else is read as an
  // email address and opened as a prefilled message.
  var COMMENT_TO = "";
  var PAGE_NAME = "Territory matrix";

  function here(){
    try{ return String(window.location.href || ""); }catch(e){ return ""; }
  }

  function commentHref(){
    if(!COMMENT_TO) return "";
    var hash = lensHash();
    var subject = "Map comment: " + PAGE_NAME + " " + hash;
    var body = "I was looking at " + (here() || PAGE_NAME) + "\n\n" +
               "What I noticed:\n\n";
    if(COMMENT_TO.indexOf("http") === 0) return COMMENT_TO;
    return "mailto:" + COMMENT_TO + "?subject=" + encodeURIComponent(subject) +
           "&body=" + encodeURIComponent(body);
  }

  // The lens both links carry, written the way this page writes it.
  function lensTail(){
    return "lens=" + encodeURIComponent(MAP.filter) + (MAP.hasEntry ? "&entry=1" : "");
  }

  function layersHref(){
    return ATLAS + "&" + lensTail();
  }

  function atlasHref(){
    return ATLAS_PAGE + "#" + lensTail();
  }

  // With nowhere to send a comment, the button and the line under it are both hidden, so the
  // page never offers a way out that goes nowhere.
  function syncLinks(){
    if(MAP.el.layersLink) MAP.el.layersLink.setAttribute("href", layersHref());
    if(MAP.el.atlasLink) MAP.el.atlasLink.setAttribute("href", atlasHref());
    var btn = MAP.el.commentBtn, note = MAP.el.commentNote;
    if(btn){
      var href = commentHref();
      btn.hidden = !href;
      if(href) btn.setAttribute("href", href); else btn.removeAttribute("href");
    }
    if(note) note.hidden = !COMMENT_TO;
  }

  // ---- the header line ------------------------------------------------------
  // It counts only what is on screen. Claims, conflicts and unverified claims add up per subject;
  // sources are unioned by source id, so a source two subjects share is counted once. Falls back
  // to the whole-database counts if an older payload carries no per-subject source list.
  function selectionCounts(shown){
    var D = MAP.D;
    var first = D.subjects[0];
    if(!first || first.source_ids === undefined)
      return {claims:D.counts.claims, sources:D.counts.sources, conflicts:D.counts.conflicts,
              unverified:D.counts.unverified || 0};
    var claims = 0, conflicts = 0, unverified = 0, sources = 0, seen = Object.create(null);
    shown.forEach(function(s){
      claims     += s.scored || 0;
      conflicts  += s.conflicts || 0;
      unverified += s.unverified || 0;
      (s.source_ids || []).forEach(function(id){
        if(!seen[id]){ seen[id] = 1; sources++; }
      });
    });
    return {claims:claims, sources:sources, conflicts:conflicts, unverified:unverified};
  }

  // The unverified part always prints, including when it is zero. A number that disappears when it
  // is zero and a number that was never on the line look the same to a reader, and only one of them
  // is honest.
  function updateStat(shown){
    var sel = selectionCounts(shown);
    function part(id, text){
      return '<span class="statpart" tabindex="0" data-tip="'+id+'">'+text+'</span>';
    }
    MAP.el.stat.innerHTML = part("count.claims", sel.claims+" claims") + " / " +
                       part("count.sources", sel.sources+" sources") + " / " +
                       part("count.conflicts", sel.conflicts+" conflicts") + " / " +
                       part("count.unverified", sel.unverified+" unverified") + " / " +
                       part("count.subjects", shown.length+" of "+MAP.D.subjects.length+
                            " subjects shown");
  }

  // Whichever mode is showing, redraw it. Both read the same selection, the same filter and
  // the same toggle; the header line above them counts the same subjects either way.
  function refresh(){
    MAP.hideTip();
    var shown = MAP.shown();
    updateStat(shown);
    MAP.updateMetric();
    writeHash();
    if(MAP.mode === "c4") MAP.drawC4();
    else MAP.renderMatrix(shown);
  }

  // ---- the mode switch ------------------------------------------------------
  var modeButtons = [];

  function syncModes(){
    modeButtons.forEach(function(b){
      var isOn = b.dataset.mode === MAP.mode;
      b.setAttribute("aria-checked", String(isOn));
      b.tabIndex = isOn ? 0 : -1;
    });
    MAP.el.body.className = MAP.mode === "c4" ? "hidden" : "";
    MAP.el.panel.className = MAP.mode === "c4" ? "" : "hidden";
  }

  function setMode(next){
    if(next !== "matrix" && next !== "c4") return;
    if(next === MAP.mode){ syncModes(); return; }
    MAP.closeClaim();
    MAP.hideTip();
    MAP.mode = next;
    saveMode(MAP.mode);
    syncModes();
    refresh();
  }

  function wireModes(){
    var modesEl = MAP.el.modes;
    modeButtons = Array.prototype.slice.call(modesEl.querySelectorAll("[data-mode]"));
    modesEl.addEventListener("click", function(e){
      var b = e.target.closest("[data-mode]");
      if(b) setMode(b.dataset.mode);
    });
    // A radiogroup moves with the arrow keys; Home and End jump to the ends. Enter and space
    // are the button's own, so they need nothing here.
    modesEl.addEventListener("keydown", function(e){
      var i = modeButtons.indexOf(document.activeElement);
      if(i < 0) return;
      var last = modeButtons.length - 1, j = -1, k = e.key;
      if(k === "ArrowRight" || k === "ArrowDown") j = i === last ? 0 : i + 1;
      else if(k === "ArrowLeft" || k === "ArrowUp") j = i === 0 ? last : i - 1;
      else if(k === "Home") j = 0;
      else if(k === "End") j = last;
      else return;
      e.preventDefault();
      setMode(modeButtons[j].dataset.mode);
      modeButtons[j].focus();
    });
  }

  // ---- Escape ---------------------------------------------------------------
  document.addEventListener("keydown", function(e){
    if(e.key !== "Escape" && e.keyCode !== 27) return;
    MAP.hideTip();
    if(MAP.exportIsOpen()){ MAP.closeExport(true); return; }
    if(MAP.openCell){
      var b = MAP.openCell;
      MAP.closeDetail();
      b.focus();
      return;
    }
    // With no claim open, Escape closes the claim panel the C4 drawing put on screen.
    var claimEl = MAP.el.claim;
    if(MAP.mode === "c4" && claimEl && claimEl.className.indexOf("hidden") < 0) MAP.closeClaim();
  });

  // ---- the subject chips ----------------------------------------------------
  function groupsOf(){
    var D = MAP.D;
    if(D.display_groups) return D.display_groups;
    var byKind = {};
    D.subjects.forEach(function(s){ (byKind[s.kind] = byKind[s.kind] || []).push(s.id); });
    return Object.keys(byKind).map(function(k){ return {id:k, name:k, subjects:byKind[k]}; });
  }

  function syncChips(){
    var subsEl = MAP.el.subs;
    Array.prototype.forEach.call(subsEl.querySelectorAll("[data-s]"), function(b){
      b.setAttribute("aria-pressed", String(!!MAP.on[b.dataset.s]));
    });
    Array.prototype.forEach.call(subsEl.querySelectorAll("[data-g]"), function(h){
      var ids = h.dataset.g === "*" ? MAP.D.subjects.map(function(s){ return s.id; })
                                    : h.dataset.g.split(",");
      var n = ids.filter(function(id){ return MAP.on[id]; }).length;
      h.dataset.state = n === 0 ? "none" : (n === ids.length ? "all" : "some");
    });
  }

  // ---- start-up -------------------------------------------------------------
  function build(){
    var D = MAP.D, esc = MAP.esc, subsEl = MAP.el.subs;
    // Every module adds itself to window.MAP as it loads, and this one cannot draw without
    // them. The standalone copy carries all of them inside the file; a copy served from a
    // folder needs them beside it.
    if(!MAP.rowHits || !MAP.renderMatrix || !MAP.showTip || !MAP.drawC4 || !MAP.wireExport ||
       !MAP.wireSearch || !MAP.wireMetric){
      MAP.el.body.innerHTML = '<p class="lede">This page could not load its modules. It needs '+
        '<code>predicates.js</code>, <code>tooltips.js</code>, <code>matrix.js</code>, '+
        '<code>c4.js</code>, <code>export.js</code>, <code>search.js</code>, '+
        '<code>metric.js</code> and <code>switch.js</code>. The standalone copy carries them '+
        'inside the file; a copy served from a folder needs them in the same folder.</p>';
      return;
    }
    var byId = MAP.subjById;
    D.subjects.forEach(function(s){ byId[s.id] = s; MAP.on[s.id] = s.scored > 0; });
    D.capabilities.forEach(function(c){ MAP.capById[c.id] = c; });
    var html = '<div class="sgroup"><button class="ghead" data-g="*" data-tip="chipgroup.all">'+
               'All subjects</button></div>';
    groupsOf().forEach(function(g){
      html += '<div class="sgroup"><button class="ghead" data-g="'+g.subjects.join(",")+
              '" data-tip="chipgroup.'+esc(g.id)+'">'+g.name+'</button>';
      g.subjects.forEach(function(id){
        var s = byId[id]; if(!s) return;
        var has = s.scored > 0;
        html += '<button class="chip'+(has?"":" off")+'" data-s="'+s.id+'" aria-pressed="'+has+
                '" data-tip="'+esc(s.id)+'"'+
                (has?"":' title="not scored yet"')+'>'+s.name+'</button>';
      });
      html += '</div>';
    });
    subsEl.innerHTML = html;
    subsEl.addEventListener("click", function(e){
      var h = e.target.closest("[data-g]");
      if(h){
        var ids = h.dataset.g === "*" ? D.subjects.map(function(s){ return s.id; })
                                      : h.dataset.g.split(",");
        var allOn = ids.every(function(id){ return MAP.on[id]; });
        ids.forEach(function(id){ MAP.on[id] = !allOn; });
        syncChips(); refresh(); return;
      }
      var b = e.target.closest("[data-s]"); if(!b) return;
      var id = b.dataset.s; MAP.on[id] = !MAP.on[id];
      syncChips(); refresh();
    });
    syncChips();
    MAP.el.filters.addEventListener("click", function(e){
      var b = e.target.closest("[data-f]"); if(!b) return;
      MAP.filter = b.dataset.f;
      Array.prototype.forEach.call(this.querySelectorAll("[data-f]"), function(x){
        x.setAttribute("aria-pressed", String(x.dataset.f === MAP.filter));
      });
      refresh();
    });
    // The toggle is not one of the filter buttons: it carries no data-f, so the handler above
    // ignores it, and it stays on while any of them is chosen.
    var he = MAP.el.hasentry;
    he.addEventListener("click", function(){
      MAP.hasEntry = !MAP.hasEntry;
      he.setAttribute("aria-pressed", String(MAP.hasEntry));
      refresh();
    });
    wireExplanations();
    MAP.wireExport();
    MAP.wireSearch();
    MAP.wireMetric();
    wireModes();
    MAP.buildC4Views();
    MAP.explOn = readExpl();
    syncExpl();

    // The address wins over what the browser remembers, so a link somebody was sent opens on the
    // view it names. Anything the address does not say keeps its own default.
    var h = readHash();
    MAP.mode = (h.mode === "matrix" || h.mode === "c4") ? h.mode : readMode();
    // This page writes the filter as "lens="; the atlas writes the same choice as "filter=".
    // Each page reads the other's word, so the lens survives the walk from one to the other.
    var lensWord = h.lens || h.filter;
    if(lensWord && FILTERS[lensWord]){
      MAP.filter = lensWord;
      Array.prototype.forEach.call(MAP.el.filters.querySelectorAll("[data-f]"), function(x){
        x.setAttribute("aria-pressed", String(x.dataset.f === MAP.filter));
      });
    }
    if(h.entry === "1"){
      MAP.hasEntry = true;
      MAP.el.hasentry.setAttribute("aria-pressed", "true");
    }
    if(h.count === "all" || h.count === "production" || h.count === "must")
      MAP.metricBasis = h.count;
    if(h.view && MAP.el.views.querySelector('[data-v="' +
       String(h.view).replace(/["\\]/g, "\\$&") + '"]')) MAP.c4View = h.view;
    Array.prototype.forEach.call(MAP.el.views.querySelectorAll("[data-v]"), function(x){
      x.setAttribute("aria-pressed", String(x.dataset.v === MAP.c4View));
    });

    syncModes();
    refresh();
  }

  MAP.refresh = refresh;
  MAP.setMode = setMode;
  MAP.writeHash = writeHash;
  MAP.syncLinks = syncLinks;
  MAP.lensHash = lensHash;
  MAP.commentHref = commentHref;
  MAP.layersHref = layersHref;
  MAP.atlasHref = atlasHref;

  // The links do not wait for the data: the address they quote is known as soon as the page
  // stands up, and the comment link must never be left as the placeholder in the markup.
  syncLinks();

  var inline = document.getElementById("territory-data");
  if(inline){
    MAP.D = JSON.parse(inline.textContent);
    build();
  } else {
    fetch("territory.json")
      .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
      .then(function(d){ MAP.D = d; build(); })
      .catch(function(err){
        MAP.el.body.innerHTML = '<p class="lede">Could not load the data file next to this page ('+
          err.message+'). This copy reads <code>territory.json</code> from the same folder, so it '+
          'needs a web address rather than being opened straight from disk. The standalone copy '+
          'carries its data inside it and works either way.</p>';
      });
  }
})();
