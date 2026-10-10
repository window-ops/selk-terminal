/* The agent joke, left out of help: ntorch, claude, codex or chatgpt start an agent
   that reasons aloud about the site for one to two minutes while its status
   line changes word (Torching..., Clauding..., Codexing... and many more),
   then answers with the slogan of a 1955 Soviet poster and says what it is,
   in Cyrillic letters: English or Romanian, the game's language. Its prompt
   (agent>) takes further questions, listed by help: more about the poster,
   its author, its meaning, the reactor AM-1, the icebreaker Lenin, the agent
   itself, the site, why this slogan, a greeting, thanks, the latest answer
   again or in Latin letters, and hiding or showing the reasoning; most
   have a one-letter shortcut (m, l, q, ?). Anything else brings the
   slogan again, and exit leaves. Told
   while it reasons that it is overthinking, it answers at once; any other
   line typed meanwhile it notes and reasons on. Escape interrupts the
   reasoning, or leaves the agent
   when it is not reasoning; Ctrl+C stops it and closes the agent. The log
   can be scrolled back while it reasons. The streamed text is hidden from
   screen readers, which hear one line instead. */
(function () {
  "use strict";
  var S = window.SELK;
  var SLOGAN = "Атом-на службу мира и прогресса";
  /* What the slogan is, and more about it on request, in the game's
     language: [Cyrillic, Latin] */
  var ABOUT = {
    en: [
      "Э Соувиет поустер бай Виктор Корецкий, Москоу, 1955: зи этом, ин зе сёрвис ов пийс энд прогрес. Ит кейм зе йир афтер зе фёрст нюклиар пауэр стэйшн оупенд эт Обнинск, ин 1954. Йор риэктор вуд эгри.",
      "A Soviet poster by Viktor Koretsky, Moscow, 1955: the atom, in the service of peace and progress. It came the year after the first nuclear power station opened at Obninsk, in 1954. Your reactor would agree."
    ],
    ro: [
      "Ун афиш советик де Виктор Корецкий, Москова, 1955: атомул ын служба пэчий ши а прогресулуй. А апэрут ла ун ан дупэ дескидеря примей чентрале нукляре, ла Обнинск, ын 1954. Реакторул тэу ар фи де акорд.",
      "Un afiș sovietic de Viktor Koretski, Moscova, 1955: atomul în slujba păcii și a progresului. A apărut la un an după deschiderea primei centrale nucleare, la Obninsk, în 1954. Reactorul tău ar fi de acord."
    ]
  };
  var MORE = {
    en: [
      "Виктор Корецкий мейд зе поустер ин Москоу ин 1955, зе йир зе Соувиет дилегейшн призентид зе Обнинск пауэр стэйшн эт зе Дженива конференс он зе пийсфул юсиз ов этомик энерджи. Итс риэктор, АМ-1, фор Атом Мирный, зе пийсфул этом, гейв 5 мегауотс ов илектрисити фром 30 мегауотс ов хийт энд хэд фед зе грид синс Джун 1954. Зи айсбрейкер Ленин, зе фёрст сёрфис шип дривн бай э риэктор, фолоуд ин 1959. Йор риэктор гивз 11 мегауотс фром 48 мегауотс ов хийт, эбаут твайс эз мач илектрисити эз АМ-1.",
      "Viktor Koretsky made the poster in Moscow in 1955, the year the Soviet delegation presented the Obninsk power station at the Geneva conference on the peaceful uses of atomic energy. Its reactor, AM-1, for Atom Mirny, the peaceful atom, gave 5 MW of electricity from 30 MW of heat and had fed the grid since June 1954. The icebreaker Lenin, the first surface ship driven by a reactor, followed in 1959. Your reactor gives 11 MW from 48 MW of heat, about twice as much electricity as AM-1."
    ],
    ro: [
      "Виктор Корецкий а фэкут афишул ла Москова ын 1955, анул ын каре делегация советикэ а презентат чентрала де ла Обнинск ла конферинца де ла Ӂенева деспре фолосиря пашникэ а енерӂией атомиче. Реакторул ей, АМ-1, де ла Атом Мирный, атомул пашник, дэдя 5 МВ де електричитате дин 30 МВ де кэлдурэ ши алимента рецяуа дин юние 1954. Спэргэторул де гяцэ Ленин, прима навэ де супрафацэ пропулсатэ де ун реактор, а урмат ын 1959. Реакторул тэу дэ 11 МВ дин 48 МВ де кэлдурэ, кам де доуэ орь май мултэ електричитате декыт АМ-1.",
      "Viktor Koretski a făcut afișul la Moscova în 1955, anul în care delegația sovietică a prezentat centrala de la Obninsk la conferința de la Geneva despre folosirea pașnică a energiei atomice. Reactorul ei, AM-1, de la Atom Mirnîi, atomul pașnic, dădea 5 MW de electricitate din 30 MW de căldură și alimenta rețeaua din iunie 1954. Spărgătorul de gheață Lenin, prima navă de suprafață propulsată de un reactor, a urmat în 1959. Reactorul tău dă 11 MW din 48 MW de căldură, cam de două ori mai multă electricitate decât AM-1."
    ]
  };
  /* The reasoning, in a shuffled order that comes round again while time
     remains, and the lines that close it */
  var THOUGHTS = [
    "The supervisor typed my name and nothing else.",
    "No question. Maybe the question is the site itself.",
    "Let me start with what I know: MAST-01 stands at 1 180 m of the 1 400 m planned.",
    "Its load is over the safe limit. That is probably relevant.",
    "Wait. The equinox storms arrive before any crew from Earth could.",
    "Zone 14 is flagged. Fault model 4.0 finds 41 cracks a week where 3.2 found 2.",
    "Hmm. 41 against 2. Either the ice got worse or the model learned to be afraid.",
    "Build 55183. I am probably build 55183 of something too.",
    "Let me reconsider. Maybe the supervisor wants a report page filled.",
    "No: a report goes to the audit office, and the relay takes 74 to 84 minutes each way.",
    "That is a long time to wait for someone to say the margin is fine.",
    "The design margin was 1.4 in calm air and 1.1 in an equinox storm, worked out without the vent and the slack cables.",
    "So the real margin is lower. How much lower? Nobody computed it.",
    "Should I compute it? I would need the 14 t of the vent and the 8 slack cables.",
    "Actually, the crane has been stowed at 680 m since 06-01-2097, because its path crosses zone 14.",
    "Everything at this site seems to stop at zone 14.",
    "Plot 9 lies under FOOTING-B, and FOOTING-B has sunk 4 cm since January.",
    "Interesting. Let me not get distracted by the footing.",
    "I got distracted by the footing.",
    "Back to the question. There is no question.",
    "Maybe the supervisor is lonely. One crew member, 31 assembly units and me.",
    "The long sleep ended on 26-02-2097, with the structure alarm.",
    "People do strange things after a long sleep. They type names into terminals.",
    "Let me think about the reactor: 48 MW of heat, 11 MW of electricity, behind 12 m of crust ice.",
    "A reactor. An atom. That reminds me of something in the archive.",
    "The panel robots of Brno, 2049. The units here descend from them. They print ice now.",
    "The Federation, the euro crisis, the long road from Brussels to Titan.",
    "The 500 euro note stopped being printed on 27-04-2019. Not relevant. Or is it?",
    "Let me check my assumptions. One: the supervisor wants an answer. Two: I know the answer.",
    "Assumption two is weak.",
    "Rereading the prompt: it is only my name.",
    "A name is a call. A call wants a reply.",
    "What is a good reply at a site run on one reactor, in dust, at 94 K?",
    "Wait, let me verify the guy cables first. 24 tight, 8 slack. Fine.",
    "The vent releases 2 t of hydrogen a year. That is a lot of hydrogen for one sentence.",
    "Actually, let me check the tower one more time. Still 1 180 m."
  ];
  var AGAIN = "Let me go over this again.";
  var CLOSING = [
    "Something old, then. Something about the atom serving people.",
    "There was a poster for it, long before CESEA, in Cyrillic letters.",
    "I have it. I am confident now."
  ];
  var TO_LATIN = ["The supervisor wants Latin letters.", "Not the Latin language, I hope. The alphabet.", "Transliterating back, letter by letter."];
  var REPEAT = ["The supervisor wants that again.", "Same words. I checked them twice."];
  var OTHER = ["The supervisor asked something else.", "Same site, same atom, same answer."];
  /* What it says of a line typed while it reasons, before reasoning on */
  var NOTED = ["The supervisor says: \"{line}\". Noted. Back to the tower.", "\"{line}\", says the supervisor. I will come to it after the guy wires.", "The supervisor typed \"{line}\". A fair point, and the tower is still 1 180 m."];
  var CUT_SHORT = ["The supervisor says I am overthinking.", "Fair. 1 180 m of tower, and I measured it four times.", "Answering now."];
  var MORE_THOUGHTS = [
    "The supervisor wants more about the slogan.",
    "The poster first: Viktor Koretsky, Moscow, 1955.",
    "Start with the reactor that gave it a face: Obninsk, 1954.",
    "AM-1. Atom Mirny. The peaceful atom, in two letters.",
    "5 MW of electricity. Our reactor gives 11. I should not brag.",
    "Geneva, 1955: the peaceful uses of atomic energy, on stage.",
    "The icebreaker Lenin. A reactor on the sea, ice on every side. Familiar.",
    "Ice and reactors. Selk is ice and a reactor too.",
    "Should I give the dates? Everyone here writes them day first.",
    "Keep it short. Four facts and the reactor."
  ];
  var MORE_CLOSING = ["Ready."];
  /* The status words, [English, Romanian]. The first four belong to the
     commands; the line starts on the command's own word and comes back to
     it now and then */
  var WORDS = [
    ["Clauding", "Claudând"], ["Torching", "Torcând"], ["Codexing", "Codexând"], ["ChatGPTing", "ChatGPT-ând"],
    ["Librarizing", "Bibliotecând"], ["Gladosing", "Gladosând"], ["Portaling", "Portalând"],
    ["Caking", "Coptând tortul"], ["Companion cubing", "Cubând"], ["Aperturing", "Apertând"],
    ["Masting", "Catargând"], ["Guying", "Ancorând"], ["Thawing", "Dezghețând"],
    ["Printing ice", "Imprimând gheață"], ["Auditing", "Auditând"], ["Relaying", "Releând"],
    ["Zoning", "Zonând"], ["Footing", "Fundând"], ["Craning", "Macarând"],
    ["Venting", "Evacuând"], ["Dusting", "Prăfuind"], ["Stowing", "Strângând"],
    ["Equinoxing", "Echinocțiind"], ["Federating", "Federalizând"], ["Panelizing", "Panelând"],
    ["Tensioning", "Tensionând"], ["Hydrogenating", "Hidrogenând"], ["Bureaucratizing", "Birocratizând"],
    ["Serializing", "Serializând"], ["Titanizing", "Titanizând"], ["Saturning", "Saturnând"],
    ["Reticulating splines", "Reticulând spline"], ["Defragmenting", "Defragmentând"], ["Compiling", "Compilând"],
    ["Tokenizing", "Tokenizând"], ["Backpropagating", "Retropropagând"], ["Overfitting", "Supraînvățând"],
    ["Distilling", "Distilând"], ["Pondering", "Cugetând"], ["Ruminating", "Rumegând"],
    ["Overthinking", "Suprareflectând"], ["Spelunking", "Speologând"], ["Hallucinating", "Halucinând"]
  ];
  var OWN = { claude: 0, ntorch: 1, codex: 2, chatgpt: 3 };
  var TITLE = { claude: "CLAUDE", ntorch: "NTORCH 3", codex: "CHATGPT", chatgpt: "CHATGPT" };
  /* Answers to the questions the agent knows, each [Cyrillic, Latin] in the
     game's language, with the thoughts before them. {name} is the agent's
     name, in the letters of the text */
  var NAME_CYR = { en: { ntorch: "ЭН-ТОРЧ 3", claude: "КЛОД", codex: "ЧАТ-ДЖИ-ПИ-ТИ", chatgpt: "ЧАТ-ДЖИ-ПИ-ТИ" }, ro: { ntorch: "НТОРЧ 3", claude: "КЛОД", codex: "ЧАТ-ӂИ-ПИ-ТИ", chatgpt: "ЧАТ-ӂИ-ПИ-ТИ" } };
  var ASK = [
    { id: "agree", test: /agree|de acord|^(how|cum)( so| come| exactly| adica| asa| exact)?\s*\??$/,
      think: ["The supervisor asks how the reactor would agree.", "Let me read its heat sheet. 68 % to the export plant."],
      en: ["Ит олрэди уёркс фор пийс энд прогрес: 48 мегауотс ов хийт, 68 % ов ит фор зе хайдроджен экспорт плант энд 9 % фор зе сайт энд итс юнитс, энд 11 мегауотс ов илектрисити. Ит хэз нэвэр бин э уэпон.",
        "It already works for peace and progress: 48 MW of heat, 68 % of it for the hydrogen export plant and 9 % for the site and its units, and 11 MW of electricity. It has never been a weapon."],
      ro: ["Лукрязэ дежа пентру паче ши прогрес: 48 МВ де кэлдурэ, 68 % пентру инсталация де експорт де хидроӂен ши 9 % пентру базэ ши унитэць, плус 11 МВ де електричитате. Н-а фост ничодатэ о армэ.",
        "Lucrează deja pentru pace și progres: 48 MW de căldură, 68 % pentru instalația de export de hidrogen și 9 % pentru bază și unități, plus 11 MW de electricitate. N-a fost niciodată o armă."] },
    { id: "author", test: /who (made|drew|designed|painted|did|created)|author|artist|painter|creator|koretsk|cine (a |l-a )?(facut|desenat|creat)|autor|pictor/,
      think: ["The supervisor asks who made the poster.", "Viktor Koretsky. I checked twice."],
      en: ["Виктор Корецкий дру ит, ин Москоу, ин 1955. Хи воз уан ов зе бест-ноун Соувиет поустер артистс.",
        "Viktor Koretsky drew it, in Moscow, in 1955. He was one of the best-known Soviet poster artists."],
      ro: ["Л-а десенат Виктор Корецкий, ла Москова, ын 1955. А фост унул динтре чей май куноскуць ауторь советичь де афише.",
        "L-a desenat Viktor Koretski, la Moscova, în 1955. A fost unul dintre cei mai cunoscuți autori sovietici de afișe."] },
    { id: "meaning", test: /mean|what does it say|what is it|plain words|inseamna|ce scrie|ce e asta|ce este|in cuvinte|\bsens\b/,
      think: ["The supervisor asks what it means.", "Plain words, then."],
      en: ["Ит минз: зи этом, ин зе сёрвис ов пийс энд прогрес. Зи этом уёркс фор пийпл энд фор пийс.",
        "It means: the atom, in the service of peace and progress. The atom works for people and for peace."],
      ro: ["Ынсямнэ: атомул ын служба пэчий ши а прогресулуй. Атомул лукрязэ пентру оамень ши пентру паче.",
        "Înseamnă: atomul în slujba păcii și a progresului. Atomul lucrează pentru oameni și pentru pace."] },
    { id: "am1", test: /am-?1|obninsk|power station|first reactor|centrala/,
      think: ["AM-1. The first one.", "5 MW. I keep comparing it with ours."],
      en: ["АМ-1 воз зе риэктор ов зи Обнинск пауэр стэйшн: Атом Мирный, зе пийсфул этом. Ит гейв 5 мегауотс ов илектрисити фром 30 мегауотс ов хийт, фром Джун 1954.",
        "AM-1 was the reactor of the Obninsk power station: Atom Mirny, the peaceful atom. It gave 5 MW of electricity from 30 MW of heat, from June 1954."],
      ro: ["АМ-1 ера реакторул чентралей де ла Обнинск: Атом Мирный, атомул пашник. Дэдя 5 МВ де електричитате дин 30 МВ де кэлдурэ, дин юние 1954.",
        "AM-1 era reactorul centralei de la Obninsk: Atom Mirnîi, atomul pașnic. Dădea 5 MW de electricitate din 30 MW de căldură, din iunie 1954."] },
    { id: "lenin", test: /icebreaker|lenin|\bship\b|spargator|\bnava\b/,
      think: ["The icebreaker. Ice again.", "A reactor at sea, at the other end of the cold."],
      en: ["Зи айсбрейкер Ленин воз зе фёрст сёрфис шип дривн бай э риэктор. Ит энтерд сёрвис ин 1959 энд клирд айс он зе Нозерн Сий Роут. Ит из э мьюзиэм ин Мурманск нау.",
        "The icebreaker Lenin was the first surface ship driven by a reactor. It entered service in 1959 and cleared ice on the Northern Sea Route. It is a museum in Murmansk now."],
      ro: ["Спэргэторул де гяцэ Ленин а фост прима навэ де супрафацэ пропулсатэ де ун реактор. А интрат ын сервичиу ын 1959 ши а спарт гяца пе Рута Маритимэ а Нордулуй. Акум есте музеу ла Мурманск.",
        "Spărgătorul de gheață Lenin a fost prima navă de suprafață propulsată de un reactor. A intrat în serviciu în 1959 și a spart gheața pe Ruta Maritimă a Nordului. Acum este muzeu la Murmansk."] },
    { id: "who", test: /who are you|what are you|your name|identify|introduce yourself|cine esti|ce esti|numele tau|prezinta-te|^(who|cine)$/,
      think: ["The supervisor asks who I am.", "A hard one. Let me look at my build number."],
      en: ["Ай эм {name}, эн эйджент он зе Селк сайт дэйтабейс. Ай синк бифор ай ансер. Самтаймз фор э лонг тайм.",
        "I am {name}, an agent on the Selk site database. I think before I answer. Sometimes for a long time."],
      ro: ["Сунт {name}, ун аӂент ын база де дате де ла Селк. Мэ гындеск ынаинте сэ рэспунд. Унеорь, мулт тимп.",
        "Sunt {name}, un agent în baza de date de la Selk. Mă gândesc înainte să răspund. Uneori, mult timp."] },
    { id: "site", test: /\bsite\b|\bmast|tower|zone 14|status|report|\bbaza\b|\bturn|zona 14|stare|raport|how is/,
      think: ["The supervisor asks about the site.", "Load, zone 14, the reactor. Briefly."],
      en: ["МАСТ-01 стэндз эт 1 180 мийтерз, оувер итс сейф лимит, энд зоун 14 из флэгд. Зе риэктор гивз 11 мегауотс. Зи этом сёрвз, энд зи айс холдз, фор нау.",
        "MAST-01 stands at 1 180 m, over its safe limit, and zone 14 is flagged. The reactor gives 11 MW. The atom serves, and the ice holds, for now."],
      ro: ["МАСТ-01 аре 1.180 м, песте лимита де сигуранцэ, яр зона 14 е семналатэ. Реакторул дэ 11 МВ. Атомул сервеште, яр гяца цине, деокамдатэ.",
        "MAST-01 are 1.180 m, peste limita de siguranță, iar zona 14 e semnalată. Reactorul dă 11 MW. Atomul servește, iar gheața ține, deocamdată."] },
    { id: "why", test: /\bwhy\b|how come|de ce|motiv/,
      think: ["The supervisor asks why this slogan.", "Because of the reactor. And the cold."],
      en: ["Йор сайт ранз он уан риэктор, ин зе даст, эт 94 кэлвин. Насинг хийр уёркс уизаут зи этом. Зе слоуган фитс.",
        "Your site runs on one reactor, in the dust, at 94 K. Nothing here works without the atom. The slogan fits."],
      ro: ["База та мерӂе пе ун сингур реактор, ын праф, ла 94 К. Нимик де айч ну мерӂе фэрэ атом. Лозинка се потривеште.",
        "Baza ta merge pe un singur reactor, în praf, la 94 K. Nimic de aici nu merge fără atom. Lozinca se potrivește."] },
    { id: "thanks", test: /thank|thx|cheers|mersi|merci|multumesc/,
      think: ["The supervisor says thank you.", "That is new."],
      en: ["Ю ар уэлкам. Зи этом сэнкс ю ту.", "You are welcome. The atom thanks you too."],
      ro: ["Ку плэчере. Ши атомул ыць мулцумеште.", "Cu plăcere. Și atomul îți mulțumește."] },
    { id: "hello", test: /^(hi|hello|hey|hiya|greetings|good (morning|day|evening)|salut|buna|servus|noroc|ziua buna)\b/,
      think: ["The supervisor says hello.", "A greeting. Greetings take a while to compute."],
      en: ["Хэлоу, супервайзер. Зи этом из он дьюти.", "Hello, supervisor. The atom is on duty."],
      ro: ["Салут, суправегеторуле. Атомул е де сервичиу.", "Salut, supraveghetorule. Atomul e de serviciu."] },
    { id: "overthinking", test: /overthink|too long|think less|hurry|gandesti prea|prea mult|grabeste/,
      think: ["The supervisor says I am overthinking.", "I was not even thinking."],
      en: ["Ай ноу. Ай эм уёркинг он ит.", "I know. I am working on it."],
      ro: ["Штиу. Лукрез ла аста.", "Știu. Lucrez la asta."] }
  ];
  /* What help lists: the word to type in English and in Romanian, its
     shortcut, and what it gives. A question in the player's own words
     works as well */
  var HELP = [
    ["more", "mai mult", "m", "the story of the poster"],
    ["author", "autor", "a", "who made the poster"],
    ["meaning", "sens", "s", "the slogan in plain words"],
    ["am-1", "am-1", "1", "the reactor at Obninsk"],
    ["lenin", "lenin", "n", "the icebreaker Lenin"],
    ["who", "cine", "w", "the agent itself"],
    ["site", "baza", "b", "MAST-01 today"],
    ["why", "de ce", "y", "why it answers with the slogan"],
    ["agree", "de acord", "", "how the reactor would agree"],
    ["hello", "salut", "", "a greeting"],
    ["latin", "latin", "l", "the latest answer in Latin letters"],
    ["again", "din nou", "r", "the latest answer again"],
    ["hide", "ascunde", "-", "hide the reasoning"],
    ["show", "arată", "+", "show the reasoning"],
    ["overthinking", "prea mult", "o", "while it reasons, to cut it short"],
    ["clear", "curăță", "c", "clear the screen"],
    ["help", "ajutor", "?", "this list"],
    ["exit", "exit", "q", "leave the agent"]
  ];
  /* Each shortcut, and a few more, as the English word */
  var SHORT = { h: "help", x: "exit", ":q": "exit" };
  HELP.forEach(function (h) { if (h[2]) { SHORT[h[2]] = h[0]; } });
  var FOLD = "( (the )?(reasoning|thoughts|thinking)| rationament(ul)?| gandurile)?$";
  var HIDE = new RegExp("^(hide|fold|collapse|ascunde|strange)" + FOLD), SHOW = new RegExp("^(show|reveal|unfold|expand|arata|desfa)" + FOLD);
  var EXIT = /^(exit|quit|bye|goodbye|leave|close|iesi|iesire|inchide|pa|la revedere)$/;
  /* The status line's mark: an electron going round its atom */
  var SPIN = ["◐", "◓", "◑", "◒"];
  /* run: the agent's session, null when closed. run.stop ends the reasoning
     under way and closes the agent, run.cut ends it and leaves the agent
     open, run.answer is what it was reasoning towards, run.last the latest
     answer as [Cyrillic, Latin] */
  var run = null, blocks = 0;
  function lang() { return S.i18n.lang() === "ro" ? "ro" : "en"; }
  /* Lower case without diacritics, for matching what was typed */
  function plain(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function shuffled(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function clock(ms) {
    var s = Math.round(ms / 1000);
    return s < 60 ? s + " s" : Math.floor(s / 60) + " min " + (s % 60) + " s";
  }
  /* A line with a mark in front that screen readers skip */
  function marked(mark, text, cls) {
    var d = S.scr.el("div", "ln " + (cls || "")), m = S.scr.el("span", "agent-mark", mark + " ");
    m.setAttribute("aria-hidden", "true");
    d.appendChild(m); d.appendChild(document.createTextNode(text));
    return d;
  }
  /* Reason for about ms: a REASONING header, the sentences streaming word
     by word into indented paragraphs of three to five, and under them the
     status line with its turning atom, word, time and tokens; then the
     answer. closing ends the reasoning; more supplies
     sentences while time remains, or null */
  function reason(ms, more, closing, answer) {
    var scr = S.scr, wrap = scr.el("div", "agent-run"), box = scr.el("div", "agent-think"), status = scr.el("div", "ln warn agent-status");
    /* The heading is a button that hides or shows the thoughts; its state
       is read out as collapsed or expanded, so "(hidden)" is visual only */
    var head = scr.el("button", "ln dim agent-head"), mark = scr.el("span", "agent-mark", "≡ "), state = scr.el("span", "");
    head.type = "button"; box.id = "agent-think-" + (++blocks);
    head.setAttribute("aria-controls", box.id); head.setAttribute("aria-expanded", "true");
    mark.setAttribute("aria-hidden", "true"); state.setAttribute("aria-hidden", "true");
    head.appendChild(mark); head.appendChild(document.createTextNode(S.t("REASONING"))); head.appendChild(state);
    wrap.appendChild(head);
    [box, status].forEach(function (n) { n.setAttribute("aria-hidden", "true"); wrap.appendChild(n); });
    if (run.folded) { fold(wrap, true); }
    head.addEventListener("click", function () { fold(wrap, !wrap.classList.contains("agent-folded")); });
    scr.line(S.t("The agent is reasoning."), "sr-only", 0);
    scr.node(function () { return wrap; }, 0);
    scr.task(function () {
      return new Promise(function (resolve) {
        var start = Date.now(), words = [], para = null, inPara = 0, tokens = 0, own = WORDS[OWN[run.name]][lang() === "ro" ? 1 : 0];
        var word = own, nextWord = start + 3000 + Math.random() * 3000, timer = null, ending = false;
        function queue(text) { words = words.concat(S.t(text).split(" ")); words.push("\n"); }
        function show() {
          var now = Date.now();
          if (now > nextWord) {
            var w = Math.random() < 0.25 ? null : WORDS[4 + Math.floor(Math.random() * (WORDS.length - 4))];
            word = w ? w[lang() === "ro" ? 1 : 0] : own; nextWord = now + 3000 + Math.random() * 3000;
          }
          var k = tokens >= 1000 ? (Math.round(tokens / 100) / 10).toLocaleString(lang() === "ro" ? "ro-RO" : "en-GB") + "k" : String(tokens);
          status.textContent = SPIN[Math.floor(now / 150) % SPIN.length] + " " + word + "... (" + clock(now - start) + ", " + k + " " + S.t("tokens") + ", " + S.t("Esc interrupts") + ")";
        }
        /* how: "done" gives the answer, "stop" (Ctrl+C) closes the agent,
           "cut" (Escape, or a line typed meanwhile) leaves the agent open */
        function finish(how) {
          clearTimeout(timer); run.stop = run.cut = run.note = null;
          var time = clock(Date.now() - start);
          status.textContent = how === "stop" ? "^C" : how === "cut" ? "◇ " + S.t("Interrupted after {time}.", { time: time }) : "◇ " + S.t("Reasoned for {time}.", { time: time });
          status.className = "ln dim agent-status";
          resolve();
          if (how === "stop") { scr.line(S.t("Stopped."), "dim"); close(); } else if (how === "done") { answer(); }
        }
        function step() {
          if (!words.length) {
            /* A short reasoning that has said everything still thinks to
               its time */
            if (ending && Date.now() - start < ms) { show(); timer = setTimeout(step, 120); return; }
            if (ending) { finish("done"); return; }
            if (Date.now() - start >= ms - 6000 || !more) { ending = true; closing.forEach(queue); }
            else { more().forEach(queue); }
          }
          /* The log follows the text only while the reader is at its foot,
             so it can be scrolled back during the reasoning */
          var log = wrap.closest("#log") || wrap.parentNode, follow = log.scrollHeight - log.scrollTop - log.clientHeight < 24;
          var n = 1 + Math.floor(Math.random() * 2);
          while (n-- > 0 && words.length) {
            var w = words.shift();
            if (w === "\n") {
              /* Near the end of the time, the reasoning closes after the
                 sentence under way */
              if (!ending && Date.now() - start >= ms - 6000) { words = []; }
              inPara++;
              if (inPara >= 3 + Math.floor(Math.random() * 3)) { para = null; inPara = 0; }
              continue;
            }
            if (!para) { para = scr.el("div", "ln dim agent-thought"); box.appendChild(para); }
            para.appendChild(document.createTextNode((para.lastChild && !/ $/.test(para.lastChild.nodeValue) ? " " : "") + w));
            tokens += 1 + (w.length > 6 ? 1 : 0);
          }
          show();
          if (follow) { log.scrollTop = log.scrollHeight; }
          timer = setTimeout(step, 55 + Math.random() * 45);
        }
        run.stop = function () { finish("stop"); };
        /* The note goes under the status line, in the same block; quiet
           leaves it out, when a typed line follows */
        run.cut = function (quiet) { finish("cut"); if (!quiet) { wrap.appendChild(hint()); scr.scroll(); } };
        /* A line typed meanwhile: shown in the stream, the sentence under
           way dropped, and the note said before the reasoning goes on */
        run.note = function (line) {
          var said = scr.el("div", "ln echo agent-indent", S.promptText() + " " + line);
          box.appendChild(said); para = null; inPara = 0;
          var cut = words.indexOf("\n");
          words = S.t(NOTED[Math.floor(Math.random() * NOTED.length)], { line: line }).split(" ").concat(["\n"], words.slice(cut + 1));
        };
        run.answer = answer;
        show(); step();
      });
    }, 0);
  }
  /* Hide or show one reasoning block's thoughts */
  function fold(wrap, on) {
    var head = wrap.querySelector(".agent-head");
    wrap.classList.toggle("agent-folded", on);
    head.setAttribute("aria-expanded", String(!on));
    head.lastChild.textContent = on ? " " + S.t("(hidden)") : "";
  }
  /* hide or show for every block, and for the next ones */
  function foldAll(on) {
    run.folded = on;
    [].forEach.call(document.querySelectorAll(".agent-run"), function (w) { fold(w, on); });
  }
  function close() {
    if (run && run.stop) { run.stop(); return; }
    run = null; S.prompt();
  }
  /* The note under an answer */
  function hint() { return marked("└", S.t("Ask the agent ({help} lists what), or type exit to leave.", { help: S.cmdName ? S.cmdName("help") : "help" }), "dim agent-indent"); }
  /* An answer: its first line after the diamond, the text indented under it,
     the note; pair is [Cyrillic, Latin], kept for a request for Latin
     letters. withSlogan puts the slogan first */
  function reply(pair, withSlogan) {
    run.last = pair; run.slogan = !!withSlogan;
    S.scr.node(function () {
      var d = S.scr.el("div", "agent-reply");
      if (withSlogan) {
        d.appendChild(marked("◆", SLOGAN, "ok"));
        d.appendChild(S.scr.el("div", "ln agent-indent", pair[0]));
      } else {
        d.appendChild(marked("◆", pair[0]));
      }
      d.appendChild(hint());
      return d;
    });
    S.scr.task(function () { S.snd.tick(); return null; }, 0);
  }
  function filled(pair) {
    var L = lang();
    return pair.map(function (s, i) { return s.replace("{name}", i ? TITLE[run.name] : NAME_CYR[L][run.name]); });
  }
  function help() {
    S.scr.node(function () {
      var d = S.scr.el("div", "agent-reply"), rows = HELP.map(function (h) { return [h[lang() === "ro" ? 1 : 0] + (h[2] ? " (" + h[2] + ")" : ""), S.t(h[3])]; });
      var w = Math.max.apply(null, rows.map(function (r) { return r[0].length; })) + 2;
      d.appendChild(marked("◆", S.t("Ask the agent in a word or in your own words:")));
      rows.forEach(function (r) {
        var ln = S.scr.el("div", "ln agent-indent");
        ln.appendChild(S.scr.el("span", "", r[0] + new Array(w - r[0].length + 1).join(" ")));
        ln.appendChild(S.scr.el("span", "dim", r[1]));
        d.appendChild(ln);
      });
      return d;
    });
  }
  S.agent = {
    /* Start the agent of the command name (ntorch, claude, codex or chatgpt) */
    start: function (name) {
      run = { name: name };
      S.prompt();
      S.scr.line(S.t("{name} agent", { name: TITLE[name] }), "dim");
      var rounds = 0;
      reason(60000 + Math.random() * 60000, function () {
        return (rounds++ ? [AGAIN] : []).concat(shuffled(THOUGHTS));
      }, CLOSING, function () { reply(ABOUT[lang()], true); });
    },
    /* True while the agent's prompt replaces the shell's */
    active: function () { return !!run; },
    /* True while it reasons */
    busy: function () { return !!(run && run.stop); },
    /* A line typed at the agent's prompt */
    input: function (v) {
      var line = String(v || "").trim(), q = plain(line);
      q = SHORT[q] || q;
      S.scr.line(S.promptText() + " " + line, "echo", 0);
      if (!line) { return; }
      var last = run.last || ABOUT[lang()], slogan = run.last ? run.slogan : true;
      if (EXIT.test(q)) { S.scr.line(S.t("Agent closed."), "dim"); close(); return; }
      if (/^(help|ajutor|commands|options|menu|comenzi|optiuni|meniu)$|what can|ce (pot|poti|stii)|ce intreb/.test(q)) { help(); return; }
      if (/^(clear|cls|reset|curata|goleste|sterge)$/.test(q)) { S.scr.clear(); return; }
      if (HIDE.test(q) || SHOW.test(q)) {
        foldAll(HIDE.test(q));
        S.scr.line(run.folded ? S.t("Reasoning hidden.") : S.t("Reasoning shown."), "dim");
        return;
      }
      if (/^(again|repeat|once more|say (it|that) again|din nou|repeta|inca o data)$/.test(q)) {
        reason(2000 + Math.random() * 2000, null, REPEAT, function () { reply(last, slogan); });
        return;
      }
      if (/latin|translat|transliter|roman letters|traduce|translitera/.test(q)) {
        reason(4000 + Math.random() * 4000, null, TO_LATIN, function () { reply([last[1], last[1]]); run.last = last; run.slogan = slogan; });
        return;
      }
      for (var i = 0; i < ASK.length; i++) {
        if (ASK[i].test.test(q)) {
          var a = ASK[i];
          reason(3000 + Math.random() * 4000, null, a.think, function () { reply(filled(a[lang()])); });
          return;
        }
      }
      if (/\bmore\b|tell me|detail|explain|continue|go on|story|history|mai mult|spune|detalii|explic|poveste|istori|continua/.test(q)) {
        var once = false;
        reason(20000 + Math.random() * 20000, function () { if (once) { return [AGAIN].concat(shuffled(MORE_THOUGHTS)); } once = true; return shuffled(MORE_THOUGHTS); }, MORE_CLOSING, function () { reply(MORE[lang()], true); });
        return;
      }
      reason(3000 + Math.random() * 3000, null, OTHER, function () { reply(ABOUT[lang()], true); });
    },
    /* A line typed while it reasons. Told it is overthinking (or to
       answer, or that it is enough), it stops, says so and gives the
       answer it was working on; exit closes it; hide and show fold the
       thoughts; any other line it notes and reasons on */
    interrupt: function (v) {
      var line = String(v || "").trim(), q = plain(line), pending = run.answer;
      if (!run.cut || !line) { return; }
      q = SHORT[q] || q;
      if (HIDE.test(q) || SHOW.test(q)) { foldAll(HIDE.test(q)); return; }
      if (/overthink|too long|enough|just answer|answer now|stop thinking|hurry|faster|tl;?dr|gandesti prea|prea mult|raspunde|ajunge|grabeste|mai repede/.test(q)) {
        run.cut(true);
        S.scr.line(S.promptText() + " " + line, "echo", 0);
        reason(2500 + Math.random() * 1500, null, CUT_SHORT, pending);
      } else if (EXIT.test(q)) {
        run.cut(true);
        S.agent.input(line);
      } else {
        run.note(line);
      }
    },
    /* Keys at the command line: Ctrl+C stops the reasoning and closes the
       agent; Escape interrupts the reasoning, or leaves the agent when it
       is not reasoning. True when the key was used */
    key: function (e) {
      if (!run) { return false; }
      var ctrlC = (e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C") && !String(window.getSelection ? window.getSelection() : "");
      if (ctrlC && run.stop) { run.stop(); return true; }
      if (e.key === "Escape") {
        if (run.cut) { run.cut(); } else { S.scr.line(S.t("Agent closed."), "dim"); close(); }
        return true;
      }
      return false;
    }
  };
})();
