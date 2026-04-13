import React, { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCzAU2aHHad_NmeCzcN95OcheuWah9tDM",
  authDomain: "portlaoise-golf-club-app.firebaseapp.com",
  projectId: "portlaoise-golf-club-app",
  storageBucket: "portlaoise-golf-club-app.firebasestorage.app",
  messagingSenderId: "55958774219",
  appId: "1:55958774219:web:9e4930603003bffc83564e",
  measurementId: "G-10J79036R3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const CREST_URL =
  "https://irp.cdn-website.com/282f6f7b/dms3rep/multi/Portlaoise+G.C.png";

const TEAM_OPTIONS = [
  "Barton Shield",
  "Irish Senior Cup",
  "Irish Junior Cup",
  "Irish Intermediate Cup",
  "Jimmy Bruen",
  "Pierce Purcell",
  "JB Carr",
  "Central Towns Cup",
  "Duggan Cup",
  "Morrissey Cup",
  "Senior Foursomes",
  "Leinster Fourball",
  "Leinster Clubs",
  "Provincial Towns Cup",
  "Barton Cup (Super Seniors)",
  "Senior Cup (55+)",
  "Super Seniors Interclub",
  "Ladies Senior Cup",
  "Ladies Intermediate Cup",
  "Ladies Junior Cup",
  "Ladies Minor Cup",
  "Ladies Challenge Cup",
  "Ladies Senior Foursomes",
  "Mixed Foursomes",
  "Flogas Mixed Foursomes",
  "Irish Mixed",
  "Mixed Interclub",
  "Fred Daly Trophy",
  "Boys Interclub",
  "Girls Interclub",
  "Minor Cup",
  "Challenge Match",
  "Friendly Match"
];

const STANDARD_RESULTS = [
  "1 up",
  "2&1",
  "3&2",
  "4&3",
  "5&4",
  "6&5",
  "7&6",
  "8&7",
  "9&8",
  "10&8"
];

function getFormatFromCompetition(teamName) {
  const foursomesCompetitions = [
    "Mixed Foursomes",
    "Flogas Mixed Foursomes",
    "Ladies Senior Foursomes",
    "Senior Foursomes"
  ];

  const fourballCompetitions = [
    "JB Carr",
    "Jimmy Bruen",
    "Pierce Purcell",
    "Leinster Fourball"
  ];

  if (foursomesCompetitions.includes(teamName)) return "Foursomes";
  if (fourballCompetitions.includes(teamName)) return "Fourball";
  return "Singles";
}

const colors = {
  navy: "#0f2d52",
  royal: "#2448d8",
  gold: "#d4a64a",
  paleGold: "#fff8e7",
  paleBlue: "#eff6ff",
  borderBlue: "#bfdbfe",
  slate: "#475569",
  light: "#f8fafc",
  greenBg: "#dcfce7",
  greenText: "#166534",
  redBg: "#fee2e2",
  redText: "#991b1b",
  amberBg: "#fef3c7",
  amberText: "#92400e"
};

const styles = {
  page: {
    minHeight: "100vh",
    background: colors.light,
    padding: "12px",
    fontFamily: "Arial, sans-serif",
    color: "#0f172a"
  },
  shell: {
    maxWidth: "1240px",
    margin: "0 auto"
  },
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    margin: 0
  },
  inputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "12px"
  },
  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#334155"
  },
  input: {
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box"
  },
  select: {
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "16px",
    background: "white",
    width: "100%",
    boxSizing: "border-box"
  },
  button: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px"
  },
  primaryButton: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "none",
    background: colors.navy,
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px"
  },
  softButton: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: `1px solid ${colors.borderBlue}`,
    background: colors.paleBlue,
    color: colors.royal,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px"
  },
  dangerButton: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #ef4444",
    background: "white",
    color: "#ef4444",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px"
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 12px",
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    background: "white",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  activeChip: {
    background: colors.navy,
    color: "white",
    border: `1px solid ${colors.gold}`,
    boxShadow: "0 4px 12px rgba(212,166,74,0.25)"
  },
  badge: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700
  },
  small: {
    fontSize: "14px",
    color: colors.slate
  }
};

const uid = () => Math.random().toString(36).slice(2, 9);

function defaultFixture(overrides = {}) {
  return {
    teamName: "Barton Shield",
    competition: "Interclub Match",
    ourClub: "Portlaoise Golf Club",
    opposition: "Opposition",
    venue: "Home",
    date: "",
    captain: "",
    status: "Live",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  };
}

function defaultMatches(format = "Singles") {
  return [1, 2, 3, 4].map((num) => ({
    id: `match-${num}`,
    order: num,
    ourPlayers: `Player ${num}`,
    theirPlayers: `Opponent ${num}`,
    format,
    status: "Not Started",
    currentHole: 1,
    leader: "All Square",
    margin: 0,
    finishedResult: "Not decided",
    finishText: "",
    notes: ""
  }));
}

function resultPoints(match) {
  if (match.status !== "Finished") return { us: 0, them: 0 };
  if (match.finishedResult === "Our team won") return { us: 1, them: 0 };
  if (match.finishedResult === "Their team won") return { us: 0, them: 1 };
  if (match.finishedResult === "Halved") return { us: 0.5, them: 0.5 };
  return { us: 0, them: 0 };
}

function liveStatus(match) {
  if (match.status === "Finished") {
    if (match.finishedResult === "Halved") return "Match halved";
    if (match.finishedResult === "Our team won") {
      return `Won ${match.finishText || ""}`.trim();
    }
    if (match.finishedResult === "Their team won") {
      return `Lost ${match.finishText || ""}`.trim();
    }
    return "Finished";
  }

  if (match.status === "Not Started") return "Not started";

  if (match.leader === "All Square") {
    return `All Square thru ${Math.max(match.currentHole - 1, 0)}`;
  }

  return `${match.leader} ${match.margin} up thru ${Math.max(
    match.currentHole - 1,
    0
  )}`;
}

function badgeStyle(match) {
  let bg = "#e2e8f0";
  let color = "#0f172a";

  if (match.status === "Finished") {
    if (match.finishedResult === "Our team won") {
      bg = colors.greenBg;
      color = colors.greenText;
    } else if (match.finishedResult === "Their team won") {
      bg = colors.redBg;
      color = colors.redText;
    } else if (match.finishedResult === "Halved") {
      bg = colors.amberBg;
      color = colors.amberText;
    }
  } else if (match.leader === "Our team") {
    bg = colors.greenBg;
    color = colors.greenText;
  } else if (match.leader === "Their team") {
    bg = colors.redBg;
    color = colors.redText;
  }

  return { ...styles.badge, background: bg, color };
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${colors.gold}`,
        borderRadius: "14px",
        padding: "14px",
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(212,166,74,0.08)"
      }}
    >
      <div style={styles.small}>{label}</div>
      <div style={{ fontSize: "30px", fontWeight: 700, color: colors.navy }}>
        {value}
      </div>
    </div>
  );
}

function getFixtureSummary(matches = [], ourClub, opposition) {
  const official = matches.reduce(
    (acc, match) => {
      const pts = resultPoints(match);
      acc.us += pts.us;
      acc.them += pts.them;
      return acc;
    },
    { us: 0, them: 0 }
  );

  const live = matches.reduce(
    (acc, match) => {
      if (match.status === "Finished") {
        const pts = resultPoints(match);
        acc.us += pts.us;
        acc.them += pts.them;
      } else if (match.status === "In Progress") {
        if (match.leader === "Our team") {
          acc.us += 1;
        } else if (match.leader === "Their team") {
          acc.them += 1;
        } else {
          acc.us += 0.5;
          acc.them += 0.5;
        }
      }
      return acc;
    },
    { us: 0, them: 0 }
  );

  let text = "Overall level";
  if (live.us > live.them) text = `${ourClub} lead overall`;
  if (live.them > live.us) text = `${opposition} lead overall`;

  const liveCount = matches.filter((m) => m.status === "In Progress").length;

  return {
    official,
    live,
    text,
    liveCount
  };
}

function HomeFixtureCard({ fixture, summary, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.card,
        padding: "14px",
        border: isActive ? `2px solid ${colors.gold}` : "1px solid #e2e8f0",
        background: isActive ? "#fffdf7" : "white",
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        boxShadow: isActive
          ? "0 6px 18px rgba(212,166,74,0.18)"
          : "0 1px 3px rgba(0,0,0,0.05)"
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          color: colors.navy
        }}
      >
        {fixture.teamName}
      </div>

      <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "6px" }}>
        {fixture.ourClub || "Portlaoise Golf Club"} vs {fixture.opposition}
      </div>

      <div style={{ ...styles.small, marginTop: "8px" }}>
        {fixture.venue || "Home"} {fixture.date ? `• ${fixture.date}` : ""}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginTop: "12px"
        }}
      >
        <div
          style={{
            background: colors.paleBlue,
            border: `1px solid ${colors.borderBlue}`,
            borderRadius: "12px",
            padding: "10px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "12px", color: colors.slate }}>Official</div>
          <div style={{ fontWeight: 700 }}>
            {summary.official.us}-{summary.official.them}
          </div>
        </div>

        <div
          style={{
            background: colors.paleGold,
            border: `1px solid ${colors.gold}`,
            borderRadius: "12px",
            padding: "10px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "12px", color: colors.slate }}>Live</div>
          <div style={{ fontWeight: 700 }}>
            {summary.live.us}-{summary.live.them}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "12px",
          fontWeight: 700,
          color: colors.navy
        }}
      >
        {summary.text}
      </div>

      <div style={{ ...styles.small, marginTop: "4px" }}>
        {summary.liveCount} live match{summary.liveCount === 1 ? "" : "es"} •{" "}
        {fixture.status || "Live"}
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "12px",
          fontWeight: 700,
          color: colors.gold
        }}
      >
        {isActive ? "Selected on Home" : "Tap to feature on Home"}
      </div>
    </button>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [fixtures, setFixtures] = useState([]);
  const [activeFixtureId, setActiveFixtureId] = useState("");
  const [fixture, setFixture] = useState(defaultFixture());
  const [matches, setMatches] = useState(defaultMatches());
  const [selectedMatchId, setSelectedMatchId] = useState("match-1");
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newFixtureTeam, setNewFixtureTeam] = useState("Barton Shield");
  const [newFixtureOpposition, setNewFixtureOpposition] = useState("");

  const [fixtureSummaries, setFixtureSummaries] = useState({});
  const [tvHighlightIndex, setTvHighlightIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth < 900;
  const isSmallMobile = windowWidth < 560;

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => setUser(nextUser || null));
  }, []);

  useEffect(() => {
    const fixturesQuery = query(
      collection(db, "fixtures"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      fixturesQuery,
      async (snap) => {
        const nextFixtures = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        if (nextFixtures.length === 0) {
          const baseTeam = "Barton Shield";
          const baseFormat = getFormatFromCompetition(baseTeam);
          const fixtureRef = await addDoc(
            collection(db, "fixtures"),
            defaultFixture({ teamName: baseTeam })
          );

          const batch = writeBatch(db);
          defaultMatches(baseFormat).forEach((match) => {
            batch.set(
              doc(db, "fixtures", fixtureRef.id, "matches", match.id),
              match
            );
          });
          await batch.commit();
          return;
        }

        setFixtures(nextFixtures);
        setActiveFixtureId((current) => current || nextFixtures[0].id);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Could not load fixtures.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!fixtures.length) return;

    const unsubs = fixtures.map((fx) => {
      const matchesQuery = query(
        collection(db, "fixtures", fx.id, "matches"),
        orderBy("order", "asc")
      );

      return onSnapshot(matchesQuery, (snap) => {
        const list = snap.docs.map((d) => d.data());
        setFixtureSummaries((prev) => ({
          ...prev,
          [fx.id]: getFixtureSummary(list, fx.ourClub, fx.opposition)
        }));
      });
    });

    return () => {
      unsubs.forEach((fn) => fn && fn());
    };
  }, [fixtures]);

  useEffect(() => {
    if (!activeFixtureId) return;

    const unsubFixture = onSnapshot(
      doc(db, "fixtures", activeFixtureId),
      (snap) => {
        if (snap.exists()) {
          setFixture({ ...defaultFixture(), id: snap.id, ...snap.data() });
        }
      },
      (err) => setError(err.message || "Could not load selected fixture.")
    );

    const matchesQuery = query(
      collection(db, "fixtures", activeFixtureId, "matches"),
      orderBy("order", "asc")
    );

    const unsubMatches = onSnapshot(
      matchesQuery,
      (snap) => {
        if (snap.empty) {
          setMatches([]);
          setSelectedMatchId("");
          return;
        }

        const nextMatches = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        setMatches(nextMatches);
        setSelectedMatchId((current) => {
          if (nextMatches.find((m) => m.id === current)) return current;
          return nextMatches[0]?.id || "";
        });
      },
      (err) => setError(err.message || "Could not load matches.")
    );

    return () => {
      unsubFixture();
      unsubMatches();
    };
  }, [activeFixtureId]);

  useEffect(() => {
    if (screen !== "tv" || matches.length === 0) return;
    const interval = setInterval(() => {
      setTvHighlightIndex((prev) => (prev + 1) % matches.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [screen, matches.length]);

  const activeFixtureIndex = useMemo(
    () => fixtures.findIndex((f) => f.id === activeFixtureId),
    [fixtures, activeFixtureId]
  );

  const previousFixture =
    activeFixtureIndex > 0 ? fixtures[activeFixtureIndex - 1] : null;
  const nextFixture =
    activeFixtureIndex >= 0 && activeFixtureIndex < fixtures.length - 1
      ? fixtures[activeFixtureIndex + 1]
      : null;

  const totals = useMemo(() => {
    return matches.reduce(
      (acc, match) => {
        const pts = resultPoints(match);
        acc.us += pts.us;
        acc.them += pts.them;
        if (match.status === "Finished") acc.finished += 1;
        if (match.status === "In Progress") acc.live += 1;
        return acc;
      },
      { us: 0, them: 0, finished: 0, live: 0 }
    );
  }, [matches]);

  const liveTotals = useMemo(() => {
    return matches.reduce(
      (acc, match) => {
        if (match.status === "Finished") {
          const pts = resultPoints(match);
          acc.us += pts.us;
          acc.them += pts.them;
        } else if (match.status === "In Progress") {
          if (match.leader === "Our team") {
            acc.us += 1;
          } else if (match.leader === "Their team") {
            acc.them += 1;
          } else {
            acc.us += 0.5;
            acc.them += 0.5;
          }
        }
        return acc;
      },
      { us: 0, them: 0 }
    );
  }, [matches]);

  const liveMatchSummary = useMemo(() => {
    const ourLeading = matches.filter(
      (m) => m.status === "In Progress" && m.leader === "Our team"
    ).length;
    const theirLeading = matches.filter(
      (m) => m.status === "In Progress" && m.leader === "Their team"
    ).length;
    const allSquare = matches.filter(
      (m) => m.status === "In Progress" && m.leader === "All Square"
    ).length;
    return { ourLeading, theirLeading, allSquare };
  }, [matches]);

  const liveOverallText = useMemo(() => {
    if (liveTotals.us > liveTotals.them) {
      return `${fixture.ourClub} currently leads overall`;
    }
    if (liveTotals.them > liveTotals.us) {
      return `${fixture.opposition} currently leads overall`;
    }
    return "Overall match is currently level";
  }, [liveTotals, fixture.ourClub, fixture.opposition]);

  const selectedMatch =
    matches.find((m) => m.id === selectedMatchId) || matches[0] || null;

  const isCaptain = !!user;

  const tickerItems = useMemo(() => {
    return fixtures.map((fx) => {
      const summary = fixtureSummaries[fx.id];
      if (!summary) return `${fx.teamName}: live`;
      return `${fx.teamName}: ${summary.official.us}-${summary.official.them} official | ${summary.live.us}-${summary.live.them} live`;
    });
  }, [fixtures, fixtureSummaries]);

  async function saveFixtureField(key, value) {
    if (!isCaptain || !activeFixtureId) return;
    await setDoc(
      doc(db, "fixtures", activeFixtureId),
      { [key]: value, updatedAt: Date.now() },
      { merge: true }
    );
  }

  async function saveMatchField(matchId, key, value) {
    if (!isCaptain || !activeFixtureId) return;

    const patch = { [key]: value };

    if (key === "leader" && value === "All Square") patch.margin = 0;
    if (key === "status" && value !== "Finished") {
      patch.finishedResult = "Not decided";
      patch.finishText = "";
    }

    await updateDoc(
      doc(db, "fixtures", activeFixtureId, "matches", matchId),
      patch
    );

    await setDoc(
      doc(db, "fixtures", activeFixtureId),
      { updatedAt: Date.now() },
      { merge: true }
    );
  }

  async function addMatch() {
    if (!isCaptain || !activeFixtureId) return;

    const nextOrder = matches.length + 1;
    const nextId = `match-${uid()}`;
    const autoFormat = getFormatFromCompetition(fixture.teamName);

    await setDoc(doc(db, "fixtures", activeFixtureId, "matches", nextId), {
      id: nextId,
      order: nextOrder,
      ourPlayers: `Player ${nextOrder}`,
      theirPlayers: `Opponent ${nextOrder}`,
      format: autoFormat,
      status: "Not Started",
      currentHole: 1,
      leader: "All Square",
      margin: 0,
      finishedResult: "Not decided",
      finishText: "",
      notes: ""
    });

    setSelectedMatchId(nextId);
  }

  async function deleteMatch(matchId) {
    if (!isCaptain || !activeFixtureId || !matchId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this match?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "fixtures", activeFixtureId, "matches", matchId));

      const remainingMatches = matches.filter((m) => m.id !== matchId);
      setMatches(remainingMatches);
      setSelectedMatchId(remainingMatches[0]?.id || "");

      await setDoc(
        doc(db, "fixtures", activeFixtureId),
        { updatedAt: Date.now() },
        { merge: true }
      );
    } catch (err) {
      alert("Could not delete match.");
      console.error("Delete match failed:", err);
    }
  }

  async function deleteFixture() {
    if (!isCaptain || !activeFixtureId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entire fixture and all of its matches?"
    );
    if (!confirmDelete) return;

    try {
      const matchesRef = collection(db, "fixtures", activeFixtureId, "matches");
      const snap = await getDocs(matchesRef);

      const batch = writeBatch(db);

      snap.forEach((docSnap) => {
        batch.delete(doc(db, "fixtures", activeFixtureId, "matches", docSnap.id));
      });

      batch.delete(doc(db, "fixtures", activeFixtureId));

      await batch.commit();

      const remainingFixtures = fixtures.filter((f) => f.id !== activeFixtureId);
      const nextFixtureId = remainingFixtures[0]?.id || "";

      setActiveFixtureId(nextFixtureId);
      setSelectedMatchId("");
      setScreen("home");
    } catch (err) {
      alert("Could not delete fixture.");
      console.error("Delete fixture failed:", err);
    }
  }

  async function createFixture() {
    if (!isCaptain) return;

    const autoFormat = getFormatFromCompetition(newFixtureTeam);

    const fixtureRef = await addDoc(
      collection(db, "fixtures"),
      defaultFixture({
        teamName: newFixtureTeam,
        opposition: newFixtureOpposition || "Opposition"
      })
    );

    const batch = writeBatch(db);
    defaultMatches(autoFormat).forEach((match) => {
      batch.set(doc(db, "fixtures", fixtureRef.id, "matches", match.id), match);
    });
    await batch.commit();

    setActiveFixtureId(fixtureRef.id);
    setSelectedMatchId("match-1");
    setNewFixtureOpposition("");
    setScreen("captain");
  }

  async function signInCaptain(e) {
    e.preventDefault();
    setError("");
    setAuthLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
      setScreen("captain");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function logOutCaptain() {
    await signOut(auth);
    setScreen("home");
  }

  async function setLeaderQuick(leader) {
    if (!selectedMatch || !isCaptain) return;

    await saveMatchField(selectedMatch.id, "status", "In Progress");
    await saveMatchField(selectedMatch.id, "leader", leader);

    if (
      leader !== "All Square" &&
      (!selectedMatch.margin || selectedMatch.margin === 0)
    ) {
      await saveMatchField(selectedMatch.id, "margin", 1);
    }
  }

  async function adjustHole(amount) {
    if (!selectedMatch || !isCaptain) return;
    const next = Math.min(
      19,
      Math.max(1, (selectedMatch.currentHole || 1) + amount)
    );
    await saveMatchField(selectedMatch.id, "currentHole", next);
  }

  async function adjustMargin(amount) {
    if (!selectedMatch || !isCaptain || selectedMatch.leader === "All Square") {
      return;
    }
    const next = Math.min(
      10,
      Math.max(1, (selectedMatch.margin || 1) + amount)
    );
    await saveMatchField(selectedMatch.id, "margin", next);
  }

  async function copySummary() {
    const text = [
      `${fixture.teamName} - ${fixture.competition}`,
      `${fixture.ourClub} vs ${fixture.opposition}`,
      `Venue: ${fixture.venue}`,
      `Date: ${fixture.date || "TBC"}`,
      `Captain: ${fixture.captain || "TBC"}`,
      `Official: ${totals.us}-${totals.them}`,
      `Live Overall: ${liveTotals.us}-${liveTotals.them}`,
      "",
      ...matches.map(
        (m, i) =>
          `${i + 1}. ${m.ourPlayers || "TBC"} vs ${
            m.theirPlayers || "TBC"
          } | ${liveStatus(m)}`
      )
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      alert("Summary copied.");
    } catch {
      alert("Copy failed on this browser.");
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>Loading Portlaoise Interclub App...</div>
        </div>
      </div>
    );
  }

  if (screen === "tv") {
    return (
      <div
        style={{
          background: colors.navy,
          minHeight: "100vh",
          color: "white",
          padding: isMobile ? "16px" : "24px",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img
            src={CREST_URL}
            alt="Portlaoise Golf Club crest"
            style={{
              width: isMobile ? "88px" : "110px",
              height: isMobile ? "88px" : "110px",
              objectFit: "contain",
              marginBottom: "12px",
              filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.25))"
            }}
          />

          <div
            style={{
              fontSize: isMobile ? "14px" : "18px",
              opacity: 0.9,
              color: "#f8e7b9",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              fontWeight: 700
            }}
          >
            {fixture.teamName}
          </div>

          <div
            style={{
              fontSize: isMobile ? "28px" : "54px",
              fontWeight: 800,
              marginTop: "8px",
              lineHeight: 1.15
            }}
          >
            {fixture.ourClub} {liveTotals.us} - {liveTotals.them} {fixture.opposition}
          </div>

          <div
            style={{
              fontSize: isMobile ? "18px" : "24px",
              marginTop: "10px",
              color: "#f8e7b9"
            }}
          >
            {liveOverallText}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "16px",
            marginBottom: "24px"
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "18px",
              padding: "20px",
              border: `1px solid ${colors.gold}`
            }}
          >
            <div style={{ fontSize: "18px", opacity: 0.8, color: "#f8e7b9" }}>
              Official Score
            </div>
            <div style={{ fontSize: isMobile ? "34px" : "46px", fontWeight: 800 }}>
              {totals.us}-{totals.them}
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "18px",
              padding: "20px",
              border: `1px solid ${colors.gold}`
            }}
          >
            <div style={{ fontSize: "18px", opacity: 0.8, color: "#f8e7b9" }}>
              Live Matches
            </div>
            <div style={{ fontSize: isMobile ? "34px" : "46px", fontWeight: 800 }}>
              {totals.live}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "14px" }}>
          {matches.map((m, i) => (
            <div
                                   <div
              key={m.id}
              style={{
                background:
                  i === tvHighlightIndex
                    ? "rgba(212,166,74,0.25)"
                    : "rgba(255,255,255,0.06)",
                borderRadius: "16px",
                padding: "16px",
                border:
                  i === tvHighlightIndex
                    ? `2px solid ${colors.gold}`
                    : "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s ease"
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "16px" : "20px",
                  fontWeight: 700,
                  marginBottom: "6px"
                }}
              >
                Match {i + 1}
              </div>

              <div style={{ fontSize: isMobile ? "15px" : "18px" }}>
                {m.ourPlayers} vs {m.theirPlayers}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: isMobile ? "14px" : "16px",
                  color: "#f8e7b9"
                }}
              >
                {liveStatus(m)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button
            style={styles.button}
            onClick={() => setScreen("home")}
          >
            Exit TV Mode
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>App Running</h1>
      </div>
    </div>
  );
}
