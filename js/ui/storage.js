/* The Storage page: every key the game keeps in this browser. */
(function () {
  var S = window.SELK, el = S.el, opt = S.setupKit.opt;
  function listKeys(store) {
    var out = [];
    try {
      for (var i = 0; i < store.length; i++) {
        var k = store.key(i); if (k.indexOf("selk") === 0) {
          out.push(k);
        }
      }
    } catch (e) {}
    return out.sort();
  }
  /* Readable names for the keys the game writes */
  var NAMES = {
    "selk-terminal-v1": "Saved game", "selk-save-local": "Save location choice", "selk-lang": "Language",
    "selk-shell-history": "Shell history", "selk-save-nudged": "Save reminder shown", "selk-wipe-on-refresh": "Wipe on refresh"
  };
  function size(v) {
    return v.length > 1024 ? S.num(v.length / 1024, 1) + " KB" : v.length + " B";
  }
  S.storagePage = function (fromSetup) {
    if (fromSetup != null) { S._storageFromSetup = !!fromSetup; }
    var box = el("div", "storage");
    box.appendChild(el("p", "dim", S.t("Data this game keeps in your browser. Nothing leaves this computer.")));
    /* One list: each key once per place it is kept, named for what it
       contains, with a rule between items */
    var rows = [];
    [[window.localStorage, "THIS COMPUTER"], [window.sessionStorage, "THIS TAB"]].forEach(function (pair) {
      listKeys(pair[0]).forEach(function (k) { rows.push({ key: k, store: pair[0], where: pair[1] }); });
    });
    if (!rows.length) {
      box.appendChild(el("div", "dim", S.t("No keys.")));
    }
    rows.forEach(function (item, idx) {
      if (idx) { box.appendChild(el("div", "rule")); }
      var k = item.key, val = item.store.getItem(k) || "";
      var r = el("div", "set-row storage-row");
      var name = el("span", "storage-name");
      name.appendChild(el("span", "", S.t(NAMES[k] || k)));
      name.appendChild(el("span", "dim storage-meta", S.t(item.where) + ", " + size(val) + (NAMES[k] ? ", " + k : "")));
      r.appendChild(name);
      var c = el("span", "set-ctl");
      var pre = el("div", "st-json"); pre.hidden = true;
      c.appendChild(opt("VIEW", false, function () {
        if (pre.hidden) {
          pre.textContent = ""; try {
            pre.appendChild(S.renderJSON(JSON.parse(val)));
          } catch (e) {
            pre.appendChild(el("p", "", val));
          }
        }
        pre.hidden = !pre.hidden;
      }));
      c.appendChild(opt("DELETE", false, function () {
        S.dialog({
          title: S.t("DELETE {key}", { key: S.t(NAMES[k] || k).toUpperCase() }),
          text: k === S.KEY ? "This erases the saved game and restarts." : "Delete this key?",
          buttons: [
            { label: "CANCEL", action: function () { setTimeout(S.storagePage, 0); } },
            { label: "DELETE", action: function () {
              item.store.removeItem(k);
              if (k === S.KEY) {
                S.state.name = ""; location.reload();
              } else {
                /* Return to the Storage page after deleting a key that is not
                   the game save */
                setTimeout(S.storagePage, 0);
              }
            } }
          ]
        });
      }));
      r.appendChild(c); box.appendChild(r); box.appendChild(pre);
    });
    S.save();
    /* Shown as a dialog, like Setup. A confirmation replaces it, and CANCEL
       brings it back. Opened from Setup, it has a SETUP button that returns
       there. */
    var buttons = [{ label: "CLOSE" }];
    if (S._storageFromSetup) {
      buttons.unshift({
        label: "SETUP",
        action: function () { setTimeout(S.settingsDialog, 0); }
      });
    }
    S.dialog({ title: "STORAGE", wide: true, build: function (b) { b.appendChild(box); }, buttons: buttons });
  };
  /* Delete every Selk key this game wrote in the browser, then restart.
     Opened from Setup > Saved data > Reset progress. */
  S.deleteAllGameData = function (onCancel) {
    S.dialog({
      title: "RESET PROGRESS",
      text: "Erase all progress and game data on this computer and restart?",
      buttons: [
        {
          label: "CANCEL",
          action: function () { if (onCancel) { setTimeout(onCancel, 0); } }
        },
        {
          label: "ERASE",
          action: function () {
            listKeys(localStorage).forEach(function (k) {
              localStorage.removeItem(k);
            });
            listKeys(sessionStorage).forEach(function (k) {
              sessionStorage.removeItem(k);
            });
            location.reload();
          }
        }
      ]
    });
  };
})();
