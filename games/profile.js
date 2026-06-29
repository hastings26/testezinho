/* PROFILE / TROPHY ROOM — the player's progression across the whole library. */
(function () {
  const GAMES = [
    ["quiz", "Quiz Quest", "🎯"], ["wheel", "Trivia Wheel", "🎡"], ["bingo", "Bingo", "🅱"],
    ["jeopardy", "Jeopardy", "📺"], ["feud", "Family Feud", "👪"], ["weakest", "Weakest Link", "⛓"],
    ["wordle", "Word Recall", "🔤"], ["hangman", "Hangman", "💀"], ["memory", "Memory Match", "🧠"],
    ["wordsearch", "Word Search", "🔎"], ["crossword", "Crossword", "📝"], ["countdown", "Countdown", "🔢"],
    ["tictactoe", "Tic Tac Toe", "⭕"], ["connect4", "Connect Four", "🔴"], ["snakes", "Snakes & Ladders", "🐍"],
    ["dominoes", "Process Chains", "🁢"], ["judge", "Judge Mode", "⚖️"], ["tool", "Choose the Right Tool", "🎯"],
    ["detective", "Detective Mode", "🕵️"], ["redteam", "Red Team", "🔴"], ["aihuman", "AI vs Human", "🎭"],
    ["build", "Build the Prompt", "🧩"], ["repair", "Repair the Prompt", "🛠"], ["escape", "AI Escape Room", "🗺"]
  ];

  function bestForGame(id) {
    let best = 0, played = false;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf("lgl:best:" + id + ":") === 0) { played = true; best = Math.max(best, parseInt(localStorage.getItem(k) || "0", 10)); }
    }
    return { best, played };
  }

  function render() {
    const p = Engine.getProfile();
    const lp = Engine.levelProgress(p.xp);

    document.getElementById("lvNum").textContent = lp.level;
    document.getElementById("xpFill").style.width = lp.pct + "%";
    document.getElementById("xpText").textContent = p.xp + " XP · " + lp.into + " / " + lp.need + " to level " + (lp.level + 1);

    const distinctGames = Object.keys(p.games || {}).length;
    const distinctTopics = Object.keys(p.topics || {}).length;
    const badgeOwned = Object.keys(p.badges || {}).length;
    document.getElementById("stats").innerHTML = [
      ["🎮", p.plays, "games played"],
      ["🗂", distinctGames + "/24", "games tried"],
      ["🌍", distinctTopics, "topics explored"],
      ["🔥", (p.streak && p.streak.count) || 0, "day streak"],
      ["🏅", badgeOwned + "/" + Engine.BADGES.length, "badges"],
      ["✨", p.perfects || 0, "perfect runs"]
    ].map(([i, v, l]) => "<div class='stat'><b>" + i + " " + v + "</b><span>" + l + "</span></div>").join("");

    const quests = Engine.dailyQuests(p);
    Engine.saveProfile(p); // dailyQuests may have rolled a new day
    document.getElementById("quests").innerHTML = quests.map(q =>
      "<div class='quest" + (q.done ? " done" : "") + "'><div class='qd'>" + (q.done ? "✓ " : "") + q.desc + "</div>" +
      "<div class='qbar'><span style='width:" + Math.round(q.progress / q.goal * 100) + "%'></span></div>" +
      "<div class='qf'><span>" + q.progress + " / " + q.goal + "</span><span class='rw'>+" + q.reward + " XP</span></div></div>").join("");

    document.getElementById("badgeCount").textContent = "(" + badgeOwned + "/" + Engine.BADGES.length + ")";
    document.getElementById("badges").innerHTML = Engine.BADGES.map(b => {
      const owned = !!(p.badges && p.badges[b.id]);
      return "<div class='badge" + (owned ? "" : " locked") + "'><div class='bi'>" + b.icon + "</div>" +
        "<div class='bn'>" + b.name + "</div><div class='bd'>" + b.desc + "</div></div>";
    }).join("");

    let triedCount = 0;
    const coll = GAMES.map(([id, name, ico]) => {
      const best = bestForGame(id).best;
      const played = !!(p.games && p.games[id]);
      if (played) triedCount++;
      const sub = played ? (best > 0 ? "Best: " + best : "Played") : "Not played yet";
      return "<a class='card live' href='" + id + ".html' style='" + (played ? "" : "opacity:.5") + "'>" +
        "<div class='ico'>" + ico + "</div><div class='name'>" + name + "</div>" +
        "<div class='for'>" + sub + "</div>" +
        "<div class='meta'><span class='state " + (played ? "play" : "wip") + "'>" + (played ? "▶ PLAY" : "TRY IT") + "</span></div></a>";
    }).join("");
    document.getElementById("collCount").textContent = "(" + triedCount + "/24 tried)";
    document.getElementById("collection").innerHTML = coll;
  }

  document.getElementById("reset").addEventListener("click", () => {
    if (confirm("Reset all progress, scores and badges? This cannot be undone.")) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.indexOf("lgl:") === 0) localStorage.removeItem(k);
      }
      render();
    }
  });

  render();
})();
