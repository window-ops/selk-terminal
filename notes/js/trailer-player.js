/* The player of the trailers page (notes/trailers.html). The page's address
   picks the trailer, #feature or #gameplay, so each can be linked to. The
   video loads only its metadata until it is played, and the game itself
   never loads the trailers. The controls are the page's own: play, the
   position, mute, the volume, the download of the video file and full
   screen; in full screen the bar hides while the trailer plays and the
   pointer rests. On the player, Space or K
   plays and pauses, the arrows move 5 seconds, M mutes and F switches full
   screen. The labels come from the page, so a translated page brings its
   own (data-play, data-pause, data-mute, data-unmute). Runs after
   page-i18n.js has put the translated page in place. */
(function () {
  "use strict";
  function init() {
    var player = document.querySelector(".trailer-player");
    if (!player) { return; }
    var video = player.querySelector(".trailer-video"), big = player.querySelector(".trailer-big");
    var play = player.querySelector(".trailer-play"), time = player.querySelector(".trailer-time");
    var seek = player.querySelector(".trailer-seek"), mute = player.querySelector(".trailer-mute");
    var volume = player.querySelector(".trailer-volume"), full = player.querySelector(".trailer-full");
    var download = player.querySelector(".trailer-download");
    var tabs = [].slice.call(document.querySelectorAll(".trailer-tabs [data-trailer]"));
    var infos = [].slice.call(document.querySelectorAll(".trailer-info"));
    var dragging = false;
    function clock(s) {
      s = Math.max(0, Math.floor(s || 0));
      return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
    }
    /* The trailer named by id, or the first one */
    function pick(id) {
      var tab = tabs.filter(function (t) { return t.dataset.trailer === id; })[0] || tabs[0];
      tabs.forEach(function (t) {
        if (t === tab) { t.setAttribute("aria-current", "page"); } else { t.removeAttribute("aria-current"); }
      });
      infos.forEach(function (i) { i.hidden = i.dataset.trailer !== tab.dataset.trailer; });
      if (video.getAttribute("src") !== tab.dataset.src) {
        video.pause();
        video.setAttribute("src", tab.dataset.src);
        video.load();
      }
      player.setAttribute("data-trailer", tab.dataset.trailer);
      download.setAttribute("href", tab.dataset.src);
    }
    function paint() {
      var playing = !video.paused && !video.ended;
      [play, big].forEach(function (b) { b.textContent = playing ? b.dataset.pause : b.dataset.play; });
      big.hidden = playing;
      player.classList.toggle("playing", playing);
      var d = video.duration || 0;
      time.textContent = clock(video.currentTime) + " / " + clock(d);
      if (!dragging) { seek.value = d ? Math.round(video.currentTime / d * 1000) : 0; }
      seek.setAttribute("aria-valuetext", clock(video.currentTime) + " / " + clock(d));
      mute.textContent = video.muted ? mute.dataset.unmute : mute.dataset.mute;
      mute.setAttribute("aria-pressed", video.muted ? "true" : "false");
    }
    function toggle() {
      if (video.paused || video.ended) { video.play(); } else { video.pause(); }
    }
    function fullScreen() {
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else if (player.requestFullscreen) { player.requestFullscreen(); }
      else if (video.webkitEnterFullscreen) { video.webkitEnterFullscreen(); }
    }
    play.addEventListener("click", toggle);
    big.addEventListener("click", toggle);
    video.addEventListener("click", toggle);
    full.addEventListener("click", fullScreen);
    mute.addEventListener("click", function () { video.muted = !video.muted; paint(); });
    volume.addEventListener("input", function () {
      video.volume = volume.value / 100;
      if (video.volume > 0 && video.muted) { video.muted = false; }
      paint();
    });
    seek.addEventListener("input", function () {
      dragging = true;
      if (video.duration) { video.currentTime = seek.value / 1000 * video.duration; }
      paint();
    });
    seek.addEventListener("change", function () { dragging = false; });
    ["play", "pause", "ended", "timeupdate", "loadedmetadata", "volumechange", "seeked"].forEach(function (e) { video.addEventListener(e, paint); });
    player.addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { return; }
      var k = e.key.toLowerCase();
      if (k === " " || k === "k") { if (e.target.tagName === "BUTTON" && k === " ") { return; } toggle(); }
      else if (k === "arrowleft") { video.currentTime = Math.max(0, video.currentTime - 5); }
      else if (k === "arrowright") { video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); }
      else if (k === "m") { video.muted = !video.muted; }
      else if (k === "f") { fullScreen(); }
      else { return; }
      e.preventDefault();
    });
    /* Full screen: the bar fades after 2.5 s without a move, a touch or a
       key while the trailer plays, and comes back with any of them. It
       stays while the trailer is paused or a control has the focus */
    var idleTimer = null, controls = player.querySelector(".trailer-controls");
    function wake() {
      player.classList.remove("idle");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        var held = controls.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
        if (document.fullscreenElement === player && !video.paused && !held) { player.classList.add("idle"); }
      }, 2500);
    }
    ["mousemove", "pointerdown", "touchstart", "keydown"].forEach(function (e) { player.addEventListener(e, wake, { passive: true }); });
    ["play", "pause"].forEach(function (e) { video.addEventListener(e, wake); });
    document.addEventListener("fullscreenchange", wake);
    tabs.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        history.replaceState(null, "", "#" + t.dataset.trailer);
        pick(t.dataset.trailer);
      });
    });
    window.addEventListener("hashchange", function () { pick(location.hash.slice(1)); });
    video.volume = volume.value / 100;
    pick(location.hash.slice(1));
    paint();
  }
  var S = window.SELK;
  if (S && S.i18n && S.i18n.ready) { S.i18n.ready.then(init); } else { init(); }
})();
