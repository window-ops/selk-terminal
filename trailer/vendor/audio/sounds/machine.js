/* The computer: its hum (fans, motor, power supply, whine), the drive's
   seeks with the HDD lamps, spin-up and spin-down, and the relay at boot. */
(function () {
  var S = window.SELK, K = S.snd.kit;
  var mach = null;
  function machine(start) {
    var ctx = K.ctx();
    if (!ctx) {
      return;
    }
    if (start && !K.on()) {
      return;
    }
    var t = ctx.currentTime, out = K.bus("machine");
    if (start && !mach) {
      mach = {
        fan: K.loopNoise(220, 0.6, "bandpass", 0.0001, out),
        fan2: K.loopNoise(900, 1.5, "bandpass", 0.0001, out),
        s1: K.osc(90, "sine", 0.0001, out),
        s2: K.osc(180, "sine", 0.0001, out),
        s3: K.osc(270, "triangle", 0.0001, out),
        psu: K.osc(100, "sine", 0.0001, out),
        whine: K.osc(7200, "sine", 0.0001, out)
      };
      var psuF = ctx.createBiquadFilter(); psuF.type = "lowpass"; psuF.frequency.value = 400;
      mach.psu.g.disconnect(); mach.psu.g.connect(psuF); psuF.connect(out);
      [["s1", 45, 90], ["s2", 60, 180], ["s3", 80, 270]].forEach(function (x) {
        mach[x[0]].o.frequency.setValueAtTime(x[1], t);
        mach[x[0]].o.frequency.exponentialRampToValueAtTime(x[2], t + 3);
      });
      mach.fan.g.gain.setTargetAtTime(0.09, t, 0.8);
      mach.fan2.g.gain.setTargetAtTime(0.018, t, 1.2);
      mach.s1.g.gain.setTargetAtTime(0.05, t + 0.3, 1);
      mach.s2.g.gain.setTargetAtTime(0.02, t + 0.3, 1);
      mach.s3.g.gain.setTargetAtTime(0.008, t + 0.3, 1);
      mach.psu.g.gain.setTargetAtTime(0.006, t, 0.3);
      mach.whine.g.gain.setTargetAtTime(0.0008, t + 1.5, 1);
    } else if (!start && mach) {
      var m = mach; mach = null;
      ["s1", "s2", "s3"].forEach(function (k) {
        try {
          m[k].o.frequency.setTargetAtTime(15, t, 1.2);
        } catch (e) {}
      });
      Object.keys(m).forEach(function (k) {
        try {
          m[k].g.gain.setTargetAtTime(0.0001, t + 0.2, 0.9);
        } catch (e) {}
      });
      setTimeout(function () {
        Object.keys(m).forEach(function (k) {
          try {
            (m[k].src || m[k].o).stop();
          } catch (e) {}
        });
      }, 5000);
    }
  }
  function led() {
    ["led-hdd", "st-led", "wb-led"].forEach(function (id) {
      var n = document.getElementById(id);
      if (!n) {
        return;
      }
      n.classList.add("on");
      clearTimeout(n._t);
      n._t = setTimeout(function () {
        n.classList.remove("on");
      }, 90 + Math.random() * 160);
    });
  }
  S.snd.led = led;
  S.snd.machine = machine;
  S.snd.hdd = function (n) {
    led();
    var ctx = K.ctx();
    if (!ctx || !K.on()) {
      return;
    }
    var t = 0, count = n || (3 + Math.floor(Math.random() * 5)), out = K.bus("machine");
    for (var i = 0; i < count; i++) {
      K.burst(1700 + Math.random() * 900, 1.2, 0.045 + Math.random() * 0.03, 0.009, t, "lowpass", out);
      K.burst(4200, 4, 0.012, 0.006, t + 0.004, null, out);
      t += 0.03 + Math.random() * 0.08;
    }
    if (mach) {
      var c = ctx.currentTime;
      try {
        mach.s2.g.gain.setTargetAtTime(0.045, c, 0.05);
        mach.s2.g.gain.setTargetAtTime(0.02, c + t, 0.2);
      } catch (e) {}
    }
    setTimeout(led, t * 500);
  };
  S.snd.spinup = function () {
    if (!K.on()) {
      return;
    }
    machine(true);
    for (var i = 0; i < 8; i++) {
      K.burst(1900, 1.2, 0.05, 0.009, 2 + i * 0.09, "lowpass", K.bus("machine"));
    }
  };
  S.snd.spindown = function () {
    machine(false);
  };
  S.snd.boot = function () {
    if (!K.on()) return;
    /* The relay sound rises over 40 ms; an instant attack at this level was
       heard as a bang */
    K.burst(120, 0.8, 0.12, 0.5, 0, null, K.bus("machine"), 0.04);
    K.tone(60, 1.2, "sine", 0.05, 0.05, 50, K.bus("machine"));
    K.tone(15700, 1.6, "sine", 0.006, 0.2);
  };
})();
