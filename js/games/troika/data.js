/* TROIKA.RUN (core.js): the figures of each year, the yearly decisions, the
   sets of obstacles, the places, and the text of the 2016 ending. */
(function () {
  var S = window.SELK, T = S.troikaGame;
  var D = T.data = {
    RATINGS: ["BB+", "CC", "SD", "B-", "B", "CCC-"],
    LAWS: ["3845", "4024", "4046", "4172", "4254", "4336"],
    YIELDS: ["12%", "26%", "37%", "11%", "9%", "19%"],
    DEBTS: ["146%", "172%", "160%", "177%", "180%", "177%"],
    DEFICITS: ["-11.2%", "-10.3%", "-8.9%", "-13.2%", "-3.6%", "-5.6%"],
    TRANCHES: ["€20BN", "€8BN", "€34BN", "€7.2BN", "€8.3BN", "€13BN"]
  };
  /* The fragile platforms: [label, description, years they appear in, how
     each is drawn: paper notes, scaffolding, a glass pane, a rope bridge] */
  D.fragiles = function () {
    return [
      [S.t("T-bills"), S.t("Treasury bills: short-term debt rolled over every few months"), [0, 1, 2, 3, 4, 5], "notes"],
      ["HFSF", S.t("Bank recapitalisation through the HFSF fund, 2012 to 2013"), [2, 3], "scaffold"],
      [S.t("Success story"), S.t("The Greek success story of 2014: a primary surplus and a bond sale"), [4], "glass"],
      ["EFSM", S.t("Bridge loan from the EU's EFSM fund, July 2015"), [5], "rope"]
    ];
  };
  /* One gate a year: the event and two choices. Each choice is [label,
     change in gap, speed, spacing of obstacles, lasting effect, what the
     effect does]. The speed and the spacing hold until the next gate. */
  D.gates = function () {
    var laws = S.t("Austerity laws come more often."), runs = S.t("Queues at the cash machines appear on the road.");
    return [
      { text: S.t("May 2010: the first memorandum, 110 billion euros in loans in return for cuts."),
        a: [S.t("Sign the memorandum"), -0.18, 0.9, 1.3, "laws", laws],
        b: [S.t("Refuse and default"), 0.14, 1.15, 0.75, "runs", runs] },
      { text: S.t("October 2011: a referendum on the new deal is announced, then withdrawn within days."),
        a: [S.t("Withdraw the referendum"), -0.12, 0.95, 1.2, "laws", laws],
        b: [S.t("Hold the referendum"), 0.1, 1.1, 0.8, "crowd", S.t("Crowds gather in the squares.")] },
      { text: S.t("March 2012: private creditors take a 53.5% loss on Greek bonds, with a second loan."),
        a: [S.t("Take the second loan"), -0.15, 0.95, 1.25, "laws", laws],
        b: [S.t("Default on the rest"), 0.14, 1.2, 0.75, "runs", runs] },
      { text: S.t("June 2013: the public broadcaster ERT is shut down to cut costs."),
        a: [S.t("Close ERT"), -0.1, 1, 1.15, "ertOff", S.t("ERT's screens go dark.")],
        b: [S.t("Keep ERT on air"), 0.08, 1.1, 0.85, null, S.t("ERT stays on air.")] },
      { text: S.t("April 2014: Greece borrows on the bond markets for the first time since 2010."),
        a: [S.t("Borrow on the markets"), 0.06, 1, 1, "yields", S.t("Bond yield spikes come more often.")],
        b: [S.t("Stay on official loans"), -0.06, 0.95, 1.15, "laws", laws] },
      { text: S.t("July 2015: 61% vote No in the referendum, and the banks stay closed for three weeks."),
        a: [S.t("Sign the third memorandum"), -0.2, 0.9, 1.3, "laws", laws],
        b: [S.t("Leave the euro"), 0.2, 1.3, 0.65, "drachma", S.t("A new drachma: more queues and more yield spikes.")] }
    ];
  };
  /* Obstacles from what Syriza and Yanis Varoufakis documented: Syriza's
     Thessaloniki Programme of September 2014, and Varoufakis's account of
     his months as finance minister, January to July 2015. Each is [shape,
     label, what the row under the canvas says]. */
  D.setItem = function (name) {
    var sets = {
      syriza: [
        ["bill", "300,000", S.t("Syriza: free electricity for 300,000 households in the humanitarian crisis, Thessaloniki Programme, 2014")],
        ["chairs", "26.5%", S.t("Syriza: unemployment of 26.5% in 2014")],
        ["house", "ENFIA", S.t("Syriza: the ENFIA property tax, which the Thessaloniki Programme pledged to abolish")]
      ],
      varoufakis: [
        ["bond", "WAIVER", S.t("Varoufakis: the ECB stops taking Greek bonds as collateral, 4 February 2015")],
        ["table", "20/2", S.t("Varoufakis: the Eurogroup statement of 20 February 2015")],
        ["ice", "ELA", S.t("Varoufakis: the ECB freezes emergency liquidity for Greek banks, 28 June 2015")],
        ["invoice", "€1.6BN", S.t("Varoufakis: the payment to the IMF that Greece misses, 30 June 2015")]
      ]
    };
    var list = sets[name];
    return list[Math.floor(Math.random() * list.length)];
  };
  /* Width, height and height above the pavement of the drawn obstacles */
  D.SIZES = {
    bill: [18, 24, 0], chairs: [48, 16, 0], invoice: [22, 26, 0], house: [26, 26, 0], bond: [28, 20, 0], table: [44, 18, 0],
    ice: [40, 12, 16], gas: [46, 14, 16], coin: [24, 24, 0], ballot: [22, 24, 0],
    vat: [22, 14, 0], calc: [18, 22, 0], tent: [30, 16, 0], envelope: [26, 16, 0], tv: [24, 21, 0], bucket: [20, 20, 0]
  };
  /* Obstacles of one period, jumped: [years they appear in, label,
     description] */
  D.periodItems = function () {
    return {
      vat: [[0], S.t("VAT 23%"), S.t("VAT raised to 23%, July 2010")],
      calc: [[0], S.t("15.4%"), S.t("Eurostat revises the 2009 deficit to 15.4% of GDP, November 2010")],
      tent: [[1], S.t("Indignados"), S.t("The Indignados camp on Syntagma Square, summer 2011")],
      envelope: [[2], S.t("-22%"), S.t("The minimum wage cut by 22%, February 2012")],
      tv: [[3, 4], "ERT", S.t("ERT goes off air, 11 June 2013")],
      bucket: [[3, 4], S.t("Cleaners"), S.t("The finance ministry's dismissed cleaners, protesting from 2013")]
    };
  };
  D.places = function () {
    return [S.t("Syntagma Square, Athens"), S.t("Academy of Athens, Panepistimiou Street"), S.t("Acropolis, Athens"),
      S.t("ERT headquarters, Agia Paraskevi"), S.t("Port of Piraeus"), S.t("Bank branches, Athens")];
  };
  /* The economist's lines in 2016, before the choice. The figures: public
     debt at about 180% of GDP and unemployment at 23.5% in 2016, capital
     controls from June 2015 to September 2019, the primary surplus of 3.5%
     of GDP the third memorandum asked for from 2018, 19 countries in the
     euro, and DiEM25, founded by Varoufakis in Berlin on 9 February 2016. */
  D.talk = function () {
    return [
      S.t("Come in, out of the street. You made it through 2015."),
      S.t("But the crisis is not over. The public debt is about 180% of GDP, nearly one worker in four has no job, and the banks are still under capital controls."),
      S.t("The third memorandum asked for a primary surplus of 3.5% of GDP from 2018. Every euro of it is a euro not spent in Greece."),
      S.t("And the problem is bigger than Greece. The euro has one currency and one central bank, but nineteen treasuries. A country in trouble cannot devalue, and there is no common budget to help it."),
      S.t("That is why Varoufakis still argues about the euro. In February he founded DiEM25, a movement to make the Union democratic before it breaks apart."),
      S.t("So, Greece: what do you push for now?")
    ];
  };
  /* The four ways on, from the economist's question to 2097. level is how
     far each goes, from 0 (nothing changes) to 3 (the eurocrisis ends for
     good), and sets how Athens looks in 2097 (art/ending.js). Each is
     [label, the economist's answer, the end card, level]. The full answer
     is the history of the archive: the Federation of Europe of 2041 and
     the reforms of 2045, which repealed the debt rules. */
  D.ways = function () {
    return [
      [S.t("Keep the status quo: the memorandum, the surpluses and the euro as it is"),
        S.t("Then the rules stay as they are, and the next crisis will find them unchanged. Go and see where it leads."),
        S.t("Athens, 2097. The euro's rules never changed. Greece paid its loans, but every downturn brought back the cuts, the closed shops and the young leaving. The obstacles are gone from the street, and so are many of the people."), 0],
      [S.t("A federal eurozone: a common treasury, eurobonds and a central bank answerable to a parliament"),
        S.t("That would end the eurocrisis once and for all. It takes a new treaty, and every member state has to vote for it. Go and see where it leads."),
        S.t("Athens, 2097. Greece pushed for a federal eurozone. In 2041 the Union became the Federation of Europe, and in 2045 the debt rules were repealed. A federal budget now meets a crisis wherever it hits, and the eurocrisis has not come back."), 3],
      [S.t("Debt relief and a finished banking union, without a common treasury"),
        S.t("That would ease the debt and protect the banks. A shock to the whole euro would still have no common budget to meet it. Go and see where it leads."),
        S.t("Athens, 2097. Greece won debt relief and a finished banking union. Bank runs are history and the debt shrank as the economy grew, but with no common budget each recession still hits the poorer members hardest."), 2],
      [S.t("Longer loans at lower interest, and nothing else"),
        S.t("That buys time. The debt gets cheaper, but the euro stays as it was built. Go and see where it leads."),
        S.t("Athens, 2097. The loans were stretched over decades and paid off. Greece got by, but the euro was never rebuilt, and each crisis since was met the way 2010 was: with loans and cuts."), 1]
    ];
  };
  /* The people of 2097 along the road out of Athens, whom Greece can talk
     to: where each stands, in pixels past the economist's door, how each
     is drawn (art/people.js), the name over the dialogue, the line in the
     bar when Greece is next to them, the pitch of the
     voice (S.snd.troikaVoice), and what each says for each level of the
     answer to the economist, 0 (the status quo) to 3 (a federal
     eurozone). The Athens metro opened its new lines in 2000; the Federation
     of Europe of 2041 is the archive's history. */
  D.people = function () {
    return [
      { rel: 300, kind: "shopkeeper", name: S.t("SHOPKEEPER"), hint: S.t("Talk to the shopkeeper."), pitch: 1.9, lines: [
        S.t("Half the street is shuttered. My children work in Munich and send money home."),
        S.t("We get by. The loans were paid off long ago, but every slump brings the cuts back."),
        S.t("Since the banking union no one queues at the cash machines. My grandmother still keeps cash in a tin, just in case."),
        S.t("In the last recession the federal budget paid half my apprentices' wages. No one on this street lost a job.")] },
      { rel: 720, kind: "teacher", name: S.t("TEACHER"), hint: S.t("Talk to the teacher."), pitch: 1.6, lines: [
        S.t("My school has merged twice. There are fewer children every year."),
        S.t("The school is old, but it stays open. We mend the roof ourselves."),
        S.t("The panels on the roof pay for the heating. The debt is smaller, so the town can plan again."),
        S.t("My students spend some time in Lyon or Kraków and then come back. Leaving no longer means leaving for good.")] },
      { rel: 960, kind: "engineer", name: S.t("ENGINEER"), hint: S.t("Talk to the engineer."), pitch: 1, lines: [
        S.t("My grandfather built the metro. No one has built anything here since."),
        S.t("Every crisis since 2010 was met the same way: loans and cuts. We learned to wait."),
        S.t("They finished the monorail in my lifetime. There is still no common budget, mind you."),
        S.t("In 2041 we voted for the Federation. My grandfather cried; he remembered 2015.")] },
      { rel: 1260, kind: "shepherd", name: S.t("SHEPHERD"), hint: S.t("Talk to the shepherd."), pitch: 1.25, lines: [
        S.t("Water runs short every summer now. I keep fewer sheep than my father did."),
        S.t("The vineyards are smaller than they were, but the wine is still good."),
        S.t("The wind farm on Hymettus pays the village a rent. It keeps the young here."),
        S.t("The young come back to farm. Land is not cheap any more, but there is work.")] },
      { rel: 2560, kind: "fisher", name: S.t("FISHER"), hint: S.t("Talk to the fisher."), pitch: 1.1, lines: [
        S.t("The sea is warmer than when I was a boy. The fish have moved north."),
        S.t("Porto Rafti fills with Athenians every August, as it always did."),
        S.t("The harbor was rebuilt with the investment fund. Half my catch goes to the city by train."),
        S.t("The sea is warmer, but the coast is protected now, and the fish are coming back.")] }
    ];
  };
  /* The economist's office in 2097, kept by his grandson, also an
     economist, who answers Greece's questions: his greeting, the questions
     and each answer for each level of the answer of 2016 (0 to 3), the
     prompt for another question, and the farewell. The level 3 answers are
     the archive's history: the Federation of 2041 and the reforms of 2045,
     which made the Commission elected and the central bank answer to the
     parliament. */
  D.visit = function () {
    return {
      hello: S.t("My grandfather spoke with you in this room in 2016. I kept his office and his books. What would you like to know?"),
      more: S.t("Anything else?"),
      bye: [S.t("Goodbye."), S.t("Go well, Greece.")],
      questions: [
        [S.t("What happened to the euro?"), [
          S.t("It survived, unchanged: one currency, one central bank, and a budget for every country. Each crisis was met with loans and cuts."),
          S.t("It survived. The loans to Greece were stretched out and paid, but the rules stayed as they were."),
          S.t("It survived, with a banking union behind it. Banks no longer fall country by country, but there is still no common budget."),
          S.t("It became the currency of the Federation of Europe, with a federal treasury and a budget that moves money to wherever a crisis hits.")]],
        [S.t("Is the crisis over?"), [
          S.t("The crisis of 2010 ended, but not its causes. Every downturn since has brought the cuts back."),
          S.t("Mostly. Greece paid its debts, but every downturn still hits harder here than in the north."),
          S.t("The debt crisis is over. A deep recession would still leave each country alone with its own budget."),
          S.t("Yes. A recession in one region is met by the federal budget, as between the states of any federation.")]],
        [S.t("What became of the Troika?"), [
          S.t("It never left. The names changed, but a country in trouble still borrows on conditions written elsewhere."),
          S.t("It never left. The names changed, but a country in trouble still borrows on conditions written elsewhere."),
          S.t("The European Stability Mechanism still lends, and the IMF left the European programs long ago."),
          S.t("The Commission has been elected since 2045, the central bank answers to the parliament, and the old rescue fund became part of the federal treasury.")]],
        [S.t("Could I have chosen differently?"), [
          S.t("Every answer had a price. Keeping things as they were cost the least at first and the most in the end."),
          S.t("Every answer had a price. Keeping things as they were cost the least at first and the most in the end."),
          S.t("Every answer had a price. Keeping things as they were cost the least at first and the most in the end."),
          S.t("Every answer had a price. The federation cost a new treaty and twenty-five years of argument, and it held.")]]
      ]
    };
  };
})();
