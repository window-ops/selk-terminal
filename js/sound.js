/* All sound, synthesised with the Web Audio API: the machine hum, drive seeks,
   wind, structure creaks and interface tones, mixed on separate volume buses. */
(function () {
  var S = window.SELK;
  var ctx = null, master = null, bus = {}, noiseBuf = null, amb = null, mach = null, on = true, lastKey = 0, wind = 0.2;
  function set() {
    return S.state.settings;
  }
  var BUS = {
    ui: "vUi",
    machine: "vMachine",
    wind: "vWind",
    struct: "vStruct"
  };
  function init() {
    if (ctx) {
      if (ctx.state === "suspended" && on) {
        ctx.resume();
      } return;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      return;
    }
    ctx = new AC();
    master = ctx.createGain();
    master.connect(ctx.destination);
    Object.keys(BUS).forEach(function (k) {
      bus[k] = ctx.createGain(); bus[k].connect(master);
    });
    apply();
    if (!on) {
      try {
        ctx.suspend();
      } catch (e) {}
    }
    var len = ctx.sampleRate * 3;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0), b0 = 0, b1 = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + 0.03 * w; b1 = (b1 + 0.02 * w) / 1.02;
      d[i] = i % 3 === 0 ? w : (i % 3 === 1 ? b1 * 3.5 : b0 * 2);
    }
  }
  function apply() {
    if (!ctx) {
      return;
    }
    var t = ctx.currentTime || 0;
    var masterVol = on ? set().vol / 100 : 0;
    try {
      master.gain.cancelScheduledValues(0);
      master.gain.value = masterVol;
      master.gain.setValueAtTime(masterVol, t);
    } catch (e) {
      master.gain.value = masterVol;
    }
    Object.keys(BUS).forEach(function (k) {
      var busVol = on ? (set()[BUS[k]] != null ? set()[BUS[k]] : 100) / 100 : 0;
      try {
        bus[k].gain.cancelScheduledValues(0);
        bus[k].gain.setValueAtTime(busVol, t);
        bus[k].gain.value = busVol;
      } catch (e) {
        bus[k].gain.value = busVol;
      }
    });
  }
  function tone(freq, dur, type, vol, when, glideTo, dest) {
    if (!ctx || !on) {
      return;
    }
    var t = ctx.currentTime + (when || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) {
      o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.04, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || bus.ui);
    o.start(t); o.stop(t + dur + 0.03);
  }
  function burst(freq, q, vol, dur, when, type, dest) {
    if (!ctx || !on) {
      return;
    }
    var t = ctx.currentTime + (when || 0);
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = type || "bandpass"; f.frequency.value = freq; f.Q.value = q;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.004, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || bus.ui);
    s.start(t, Math.random() * 2, dur + 0.05);
  }
  function loopNoise(freq, q, type, gain, dest) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    var g = ctx.createGain(); g.gain.value = gain;
    s.connect(f); f.connect(g); g.connect(dest); s.start();
    return {
      src: s,
      f: f,
      g: g
    };
  }
  function osc(freq, type, gain, dest) {
    var o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    var g = ctx.createGain(); g.gain.value = gain;
    o.connect(g); g.connect(dest); o.start();
    return {
      o: o,
      g: g
    };
  }
  function machine(start) {
    if (!ctx) {
      return;
    }
    if (start && !on) {
      return;
    }
    var t = ctx.currentTime;
    if (start && !mach) {
      mach = {
        fan: loopNoise(220, 0.6, "bandpass", 0.0001, bus.machine),
        fan2: loopNoise(900, 1.5, "bandpass", 0.0001, bus.machine),
        s1: osc(90, "sine", 0.0001, bus.machine),
        s2: osc(180, "sine", 0.0001, bus.machine),
        s3: osc(270, "triangle", 0.0001, bus.machine),
        psu: osc(100, "sine", 0.0001, bus.machine),
        whine: osc(7200, "sine", 0.0001, bus.machine)
      };
      var psuF = ctx.createBiquadFilter(); psuF.type = "lowpass"; psuF.frequency.value = 400;
      mach.psu.g.disconnect(); mach.psu.g.connect(psuF); psuF.connect(bus.machine);
      [
        [
          "s1",
          20,
          90
        ],
        [
          "s2",
          20,
          180
        ],
        [
          "s3",
          20,
          270
        ]
      ].forEach(function (x) {
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
      [
        "s1",
        "s2",
        "s3"
      ].forEach(function (k) {
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
  function ambient(start) {
    if (!ctx) {
      return;
    }
    if (start && !on) {
      return;
    }
    if (start && !amb) {
      amb = {
        low: loopNoise(300, 0.7, "lowpass", 0.1 + 0.25 * wind, bus.wind),
        howl: loopNoise(900, 6, "bandpass", 0.02 + 0.12 * wind, bus.wind),
        hiss: loopNoise(3500, 0.8, "bandpass", 0.004 + 0.03 * wind, bus.wind)
      };
      var l1 = ctx.createOscillator(), l1g = ctx.createGain();
      l1.frequency.value = 0.07; l1g.gain.value = 220; l1.connect(l1g); l1g.connect(amb.low.f.frequency); l1.start();
      var l2 = ctx.createOscillator(), l2g = ctx.createGain();
      l2.frequency.value = 0.13; l2g.gain.value = 380; l2.connect(l2g); l2g.connect(amb.howl.f.frequency); l2.start();
      var l3 = ctx.createOscillator(), l3g = ctx.createGain();
      l3.frequency.value = 0.031; l3g.gain.value = 0.05; l3.connect(l3g); l3g.connect(amb.howl.g.gain); l3.start();
      amb.lfos = [
        l1,
        l2,
        l3
      ];
    } else if (!start && amb) {
      [
        amb.low,
        amb.howl,
        amb.hiss
      ].forEach(function (n) {
        try {
          n.src.stop();
        } catch (e) {}
      });
      amb.lfos.forEach(function (n) {
        try {
          n.stop();
        } catch (e) {}
      });
      amb = null;
    }
  }
  function led() {
    [
      "led-hdd",
      "st-led",
      "wb-led"
    ].forEach(function (id) {
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
  S.snd = {
    init: init,
    apply: apply,
    ambient: ambient,
    machine: machine,
    setOn: function (v) {
      on = !!v;
      if (ctx && !on) {
        try {
          master.gain.cancelScheduledValues(0);
          master.gain.value = 0;
        } catch (e) {}
      }
      apply();
      if (ctx) {
        if (!on) {
          try {
            ctx.suspend();
          } catch (e) {}
        } else {
          try {
            ctx.resume();
          } catch (e) {}
        }
      }
    },
    setWind: function (w) {
      wind = Math.max(0, Math.min(1, w));
      if (ctx && amb && on) {
        var t = ctx.currentTime;
        try {
          amb.low.g.gain.cancelScheduledValues(t);
          amb.low.g.gain.setValueAtTime(0.1 + 0.25 * wind, t);
          amb.low.f.frequency.setValueAtTime(260 + 500 * wind, t);
          amb.howl.g.gain.cancelScheduledValues(t);
          amb.howl.g.gain.setValueAtTime(0.02 + 0.12 * wind, t);
          amb.hiss.g.gain.cancelScheduledValues(t);
          amb.hiss.g.gain.setValueAtTime(0.004 + 0.03 * wind, t);
        } catch (e) {}
      }
    },
    key: function () {
      if (!on) {
        return;
      }
      var now = Date.now();
      if (now - lastKey < 25) {
        return;
      }
      lastKey = now;
      burst(1800 + Math.random() * 1800, 1.4, 0.2, 0.035);
      tone(140 + Math.random() * 40, 0.03, "triangle", 0.03);
    },
    click: function () {
      if (!on) return; burst(3200, 2.5, 0.16, 0.018); burst(900, 1.2, 0.08, 0.03, 0.035);
    },
    hdd: function (n) {
      led();
      if (!ctx || !on) {
        return;
      }
      var t = 0, count = n || (3 + Math.floor(Math.random() * 5));
      for (var i = 0; i < count; i++) {
        burst(1700 + Math.random() * 900, 1.2, 0.045 + Math.random() * 0.03, 0.009, t, "lowpass", bus.machine);
        burst(4200, 4, 0.012, 0.006, t + 0.004, null, bus.machine);
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
    },
    spinup: function () {
      if (!on) {
        return;
      }
      machine(true);
      for (var i = 0; i < 8; i++) {
        burst(1900, 1.2, 0.05, 0.009, 2 + i * 0.09, "lowpass", bus.machine);
      }
    },
    spindown: function () {
      machine(false);
    },
    creak: function (strength) {
      if (!ctx || !on) {
        return;
      }
      var s = strength || 0.5;
      tone(70 + Math.random() * 40, 1.2 + s, "sawtooth", 0.02 + 0.03 * s, 0, 45 + Math.random() * 20, bus.struct);
      burst(180 + Math.random() * 120, 6, 0.15 * s, 0.9 + s * 0.6, 0.05, null, bus.struct);
      if (Math.random() < 0.35 * s) {
        tone(55, 0.7, "sine", 0.12 * s, 0.9, 32, bus.struct);
      }
    },
    gust: function (strength) {
      if (!ctx || !on) {
        return;
      }
      var s = strength || 0.5;
      burst(400 + 600 * s, 0.5, 0.35 * s, 2.5 + s, 0, "lowpass", bus.wind);
      burst(1100 + 400 * s, 5, 0.12 * s, 2.2, 0.3, null, bus.wind);
      burst(3000, 0.8, 0.05 * s, 1.8, 0.2, null, bus.wind);
    },
    tick: function () {
      if (!on) return; tone(1320, 0.03, "square", 0.025);
    },
    ok: function () {
      if (!on) return; tone(880, 0.06, "square", 0.04); tone(1320, 0.08, "square", 0.04, 0.07);
    },
    error: function () {
      if (!on) return; tone(220, 0.16, "square", 0.06); tone(165, 0.2, "square", 0.05, 0.13);
    },
    chime: function () {
      if (!on) return; tone(988, 0.14, "sine", 0.09); tone(1319, 0.22, "sine", 0.08, 0.12); tone(1976, 0.3, "sine", 0.04, 0.26);
    },
    unlock: function () {
      if (!on) return; [
        523,
        659,
        784,
        1047
      ].forEach(function (f, i) {
        tone(f, 0.12, "square", 0.04, i * 0.08);
      });
    },
    blip: function () {
      led(); if (!on) return; tone(1600 + Math.random() * 900, 0.05, "square", 0.025);
    },
    sweep: function () {
      if (!on) return; tone(300, 0.5, "sawtooth", 0.025, 0, 2400);
    },
    boot: function () {
      if (!on) return;
      burst(120, 0.8, 0.3, 0.4, 0, null, bus.machine);
      tone(60, 1.2, "sine", 0.06, 0.05, 50, bus.machine);
      tone(15700, 1.6, "sine", 0.006, 0.2);
    },
    thud: function () {
      if (!on) return; tone(90, 0.5, "sine", 0.12, 0, 40, bus.struct); burst(200, 0.6, 0.3, 0.5, 0, null, bus.struct);
    }
  };
})();
