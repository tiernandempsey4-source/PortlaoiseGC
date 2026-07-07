import React, { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
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
  writeBatch,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCzAU2aHHad_NmeCzcN95OcheuWah9tDM",
  authDomain: "portlaoise-golf-club-app.firebaseapp.com",
  projectId: "portlaoise-golf-club-app",
  storageBucket: "portlaoise-golf-club-app.firebasestorage.app",
  messagingSenderId: "55958774219",
  appId: "1:55958774219:web:9e4930603003bffc83564e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const CREST_URL =
  "https://irp.cdn-website.com/282f6f7b/dms3rep/multi/Portlaoise+G.C.png";

const CLUB_MESSAGE =
  "Best of luck to all our Portlaoise teams, players and managers. A huge thank you to all our supporters, Captains Betty and Tiernan, and President Eddie.";

const TEAM_OPTIONS = [
  "Barton Shield",
  "Barton Cup",
  "Barton Cup (Super Seniors)",
  "Irish Senior Cup",
  "Irish Intermediate Cup",
  "Irish Junior Cup",
  "Irish Boys Inter-Club",
  "Irish Girls Inter-Club",
  "Fred Daly Trophy",
  "Jimmy Bruen Shield",
  "Pierce Purcell Shield",
  "JB Carr Diamond Trophy",
  "Central Towns Cup",
  "Duggan Cup",
  "Morrissey Cup",
  "Leinster Fourball",
  "Leinster Clubs",
  "Provincial Towns Cup",
  "Senior Foursomes",
  "Junior Foursomes",
  "Fred Perry Trophy",
  "Irish Mixed Foursomes",
  "Flogas Irish Mixed Foursomes",
  "Mixed Foursomes",
  "Mixed Interclub",
  "Men's Senior Cup",
  "Men's Junior Cup",
  "Men's Intermediate Cup",
  "Men's Minor Cup",
  "Men's Challenge Cup",
  "Ladies Senior Cup",
  "Ladies Intermediate Cup",
  "Ladies Junior Cup",
  "Ladies Minor Cup",
  "Ladies Challenge Cup",
  "Ladies Senior Foursomes",
  "Ladies Intermediate Foursomes",
  "Ladies Junior Foursomes",
  "Revive Active Fourball",
  "Australian Spoons",
  "Women's Senior Cup",
  "Women's Intermediate Cup",
  "Women's Junior Cup",
  "Women's Minor Cup",
  "Women's Challenge Cup",
  "Super Seniors Interclub",
  "Senior Cup (55+)",
  "Minor Cup",
  "Challenge Match",
  "Friendly Match",
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
  "10&8",
  "10&9",
  "11&10",
  "12&11",
  "Won on 19th",
  "Won on 20th",
  "Won on 21st",
  "Won on 22nd",
  "Won on 23rd",
  "Won on 24th",
  "Won on 25th",
  "Conceded",
  "Walkover",
];

const colors = {
  navy: "#0f2d52",
  royal: "#2448d8",
  gold: "#d4a64a",
  paleGold: "#fff8e7",
  paleBlue: "#eff6ff",
  border: "#e2e8f0",
  borderBlue: "#bfdbfe",
  text: "#0f172a",
  slate: "#475569",
  light: "#f8fafc",
  greenBg: "#dcfce7",
  greenText: "#166534",
  redBg: "#fee2e2",
  redText: "#991b1b",
  amberBg: "#fef3c7",
  amberText: "#92400e",
};

const baseButton = {
  minHeight: "46px",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "15px",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: colors.light,
    padding: "12px",
    fontFamily: "Arial, sans-serif",
    color: colors.text,
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  shell: {
    width: "100%",
    maxWidth: "1240px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "16px",
    marginBottom: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    boxSizing: "border-box",
  },
  inputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "12px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#334155",
  },
  input: {
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    background: "white",
  },
  select: {
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "16px",
    background: "white",
    width: "100%",
    boxSizing: "border-box",
  },
  button: baseButton,
  primaryButton: {
    ...baseButton,
    border: "none",
    background: colors.navy,
    color: "white",
  },
  softButton: {
    ...baseButton,
    border: `1px solid ${colors.borderBlue}`,
    background: colors.paleBlue,
    color: colors.royal,
  },
  dangerButton: {
    ...baseButton,
    border: "1px solid #ef4444",
    background: "white",
    color: "#ef4444",
  },
  activeButton: {
    background: colors.navy,
    color: "white",
    border: `1px solid ${colors.gold}`,
  },
  small: {
    fontSize: "14px",
    color: colors.slate,
  },
};

const uid = () => Math.random().toString(36).slice(2, 9);

function opponentPlayerName(opposition, num) {
  const club = opposition && opposition.trim() ? opposition.trim() : "Opposition";
  return `${club} Player ${num}`;
}

function getFormatFromCompetition(teamName) {
  const name = teamName || "";

  const foursomesCompetitions = [
    "Mixed Foursomes",
    "Irish Mixed Foursomes",
    "Flogas Irish Mixed Foursomes",
    "Flogas Mixed Foursomes",
    "Ladies Senior Foursomes",
    "Ladies Intermediate Foursomes",
    "Ladies Junior Foursomes",
    "Senior Foursomes",
    "Junior Foursomes",
  ];

  const fourballCompetitions = [
    "JB Carr Diamond Trophy",
    "JB Carr",
    "Jimmy Bruen Shield",
    "Jimmy Bruen",
    "Pierce Purcell Shield",
    "Pierce Purcell",
    "Leinster Fourball",
    "Revive Active Fourball",
  ];

  if (foursomesCompetitions.includes(name)) return "Foursomes";
  if (fourballCompetitions.includes(name)) return "Fourball";
  return "Singles";
}

function defaultFixture(overrides = {}) {
  return {
    teamName: "Barton Shield",
    competition: "Interclub Match",
    ourClub: "Portlaoise Golf Club",
    opposition: "Opposition",
    oppositionLogoUrl: "",
    venue: "Home",
    date: "",
    captain: "",
    status: "Live",
    isArchived: false,
    archivedAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

function defaultMatches(format = "Singles", opposition = "Opposition") {
  return [1, 2, 3, 4].map((num) => ({
    id: `match-${num}`,
    order: num,
    ourPlayers: `Player ${num}`,
    theirPlayers: opponentPlayerName(opposition, num),
    format,
    status: "Not Started",
    currentHole: 1,
    leader: "All Square",
    margin: 0,
    finishedResult: "Not decided",
    finishText: "",
    notes: "",
  }));
}

function resultPoints(match) {
  if (match.status !== "Finished") return { us: 0, them: 0 };

  if (match.finishedResult === "Our team won" || match.leader === "Our team") {
    return { us: 1, them: 0 };
  }
  if (match.finishedResult === "Their team won" || match.leader === "Their team") {
    return { us: 0, them: 1 };
  }
  if (match.finishedResult === "Halved" || match.leader === "All Square") {
    return { us: 0.5, them: 0.5 };
  }
  return { us: 0, them: 0 };
}

function liveStatus(match) {
  if (match.status === "Finished") {
    if (match.finishedResult === "Halved" || match.leader === "All Square") return "Match halved";
    if (match.finishedResult === "Our team won" || match.leader === "Our team") {
      return `Won ${match.finishText || ""}`.trim();
    }
    if (match.finishedResult === "Their team won" || match.leader === "Their team") {
      return `Lost ${match.finishText || ""}`.trim();
    }
    return "Finished";
  }

  if (match.status === "Not Started") return "Not started";

  if (match.leader === "All Square") {
    return `All Square thru ${Math.max((match.currentHole || 1) - 1, 0)}`;
  }

  return `${match.leader} ${match.margin || 1} up thru ${Math.max(
    (match.currentHole || 1) - 1,
    0
  )}`;
}

function badgeStyle(match) {
  let background = "#e2e8f0";
  let color = "#0f172a";

  if (match.status === "Finished") {
    if (match.finishedResult === "Our team won" || match.leader === "Our team") {
      background = colors.greenBg;
      color = colors.greenText;
    } else if (match.finishedResult === "Their team won" || match.leader === "Their team") {
      background = colors.redBg;
      color = colors.redText;
    } else if (match.finishedResult === "Halved" || match.leader === "All Square") {
      background = colors.amberBg;
      color = colors.amberText;
    }
  } else if (match.leader === "Our team") {
    background = colors.greenBg;
    color = colors.greenText;
  } else if (match.leader === "Their team") {
    background = colors.redBg;
    color = colors.redText;
  }

  return {
    display: "inline-block",
    padding: "8px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    background,
    color,
    whiteSpace: "nowrap",
  };
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
      }}
    >
      <div style={{ fontSize: "14px", color: colors.slate }}>{label}</div>
      <div style={{ fontSize: "30px", fontWeight: 700, color: colors.navy }}>
        {value}
      </div>
    </div>
  );
}


function getInitials(name) {
  if (!name) return "GC";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ClubLogo({ src, alt, fallback, size = 44 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "14px",
        border: `1px solid ${colors.gold}`,
        background: src ? "white" : colors.paleGold,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: "5px",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <span style={{ color: colors.navy, fontWeight: 900, fontSize: "13px" }}>
          {fallback || "GC"}
        </span>
      )}
    </div>
  );
}

function getFixtureSummary(matches = [], ourClub = "Portlaoise Golf Club", opposition = "Opposition") {
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
        if (match.leader === "Our team") acc.us += 1;
        else if (match.leader === "Their team") acc.them += 1;
        else {
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

  return {
    official,
    live,
    text,
    liveCount: matches.filter((m) => m.status === "In Progress").length,
  };
}

function HomeFixtureCard({ fixture, summary, isActive, onClick, compact }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.card,
        padding: compact ? "13px" : "14px",
        border: isActive ? `2px solid ${colors.gold}` : "1px solid #e2e8f0",
        background: isActive ? "#fffdf7" : "white",
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        marginBottom: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "8px",
        }}
      >
        <ClubLogo src={CREST_URL} alt="Portlaoise Golf Club crest" fallback="PGC" size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: colors.navy,
            }}
          >
            {fixture.teamName}
          </div>
          <div style={{ ...styles.small, marginTop: "2px" }}>
            {fixture.venue || "Home"} {fixture.date ? `• ${fixture.date}` : ""}
          </div>
        </div>
        <ClubLogo
          src={fixture.oppositionLogoUrl}
          alt={`${fixture.opposition} crest`}
          fallback={getInitials(fixture.opposition)}
          size={42}
        />
      </div>

      <div style={{ fontSize: compact ? "16px" : "18px", fontWeight: 700, marginTop: "6px" }}>
        {fixture.ourClub || "Portlaoise Golf Club"} vs {fixture.opposition}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        <div
          style={{
            background: colors.paleBlue,
            border: `1px solid ${colors.borderBlue}`,
            borderRadius: "12px",
            padding: "10px",
            textAlign: "center",
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
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "12px", color: colors.slate }}>Live</div>
          <div style={{ fontWeight: 700 }}>
            {summary.live.us}-{summary.live.them}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "12px", fontWeight: 700, color: colors.navy }}>
        {summary.text}
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
  const [newFixtureTeam, setNewFixtureTeam] = useState("Barton Shield");
  const [newFixtureCustomTeam, setNewFixtureCustomTeam] = useState("");
  const [newFixtureOpposition, setNewFixtureOpposition] = useState("");
  const [newFixtureOppositionLogoUrl, setNewFixtureOppositionLogoUrl] = useState("");
  const [captainTab, setCaptainTab] = useState("updates");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fixtureSummaries, setFixtureSummaries] = useState({});
  const [tvHighlightIndex, setTvHighlightIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const isMobile = windowWidth < 900;
  const isSmallMobile = windowWidth < 560;
  const activeTeamIsKnown = TEAM_OPTIONS.includes(fixture.teamName || "");

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => setUser(nextUser || null));
  }, []);

  useEffect(() => {
    const fixturesQuery = query(collection(db, "fixtures"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      fixturesQuery,
      async (snap) => {
        const nextFixtures = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        if (nextFixtures.length === 0) {
          const fixtureRef = await addDoc(collection(db, "fixtures"), defaultFixture());
          const batch = writeBatch(db);
          defaultMatches("Singles", "Opposition").forEach((match) => {
            batch.set(doc(db, "fixtures", fixtureRef.id, "matches", match.id), match);
          });
          await batch.commit();
          return;
        }

        setFixtures(nextFixtures);
        setActiveFixtureId((current) => {
          if (current && nextFixtures.find((fx) => fx.id === current && !fx.isArchived)) return current;
          const firstLiveFixture = nextFixtures.find((fx) => !fx.isArchived);
          return firstLiveFixture ? firstLiveFixture.id : nextFixtures[0].id;
        });
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
          [fx.id]: getFixtureSummary(list, fx.ourClub, fx.opposition),
        }));
      });
    });

    return () => unsubs.forEach((fn) => fn && fn());
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
      async (snap) => {
        if (snap.empty) {
          const batch = writeBatch(db);
          defaultMatches(getFormatFromCompetition(fixture.teamName), fixture.opposition).forEach((match) => {
            batch.set(doc(db, "fixtures", activeFixtureId, "matches", match.id), match);
          });
          await batch.commit();
          return;
        }

        const nextMatches = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
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
  }, [activeFixtureId, fixture.teamName]);

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

  const liveFixtures = useMemo(
    () => fixtures.filter((item) => !item.isArchived),
    [fixtures]
  );

  const archivedFixtures = useMemo(
    () => fixtures.filter((item) => item.isArchived),
    [fixtures]
  );

  const previousFixture = activeFixtureIndex > 0 ? fixtures[activeFixtureIndex - 1] : null;
  const nextFixture =
    activeFixtureIndex >= 0 && activeFixtureIndex < fixtures.length - 1
      ? fixtures[activeFixtureIndex + 1]
      : null;

  const selectedMatch = matches.find((m) => m.id === selectedMatchId) || matches[0] || null;
  const isCaptain = !!user;

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
      { us: 0, them: 0, live: 0, finished: 0 }
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
          if (match.leader === "Our team") acc.us += 1;
          else if (match.leader === "Their team") acc.them += 1;
          else {
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
    return {
      ourLeading: matches.filter((m) => m.status === "In Progress" && m.leader === "Our team").length,
      theirLeading: matches.filter((m) => m.status === "In Progress" && m.leader === "Their team").length,
      allSquare: matches.filter((m) => m.status === "In Progress" && m.leader === "All Square").length,
    };
  }, [matches]);

  const liveOverallText = useMemo(() => {
    if (liveTotals.us > liveTotals.them) return `${fixture.ourClub} currently leads overall`;
    if (liveTotals.them > liveTotals.us) return `${fixture.opposition} currently leads overall`;
    return "Overall match is currently level";
  }, [liveTotals, fixture.ourClub, fixture.opposition]);

  const tickerItems = useMemo(() => {
    return liveFixtures.map((fx) => {
      const summary = fixtureSummaries[fx.id];
      if (!summary) return `${fx.teamName}: live`;
      return `${fx.teamName}: ${summary.official.us}-${summary.official.them} official | ${summary.live.us}-${summary.live.them} live`;
    });
  }, [liveFixtures, fixtureSummaries]);

  async function saveFixtureField(key, value) {
    if (!isCaptain || !activeFixtureId) return;
    await setDoc(
      doc(db, "fixtures", activeFixtureId),
      { [key]: value, updatedAt: Date.now() },
      { merge: true }
    );
  }

  async function updateOppositionAndMatchNames(nextOpposition) {
    if (!isCaptain || !activeFixtureId) return;

    const cleanOpposition = nextOpposition || "Opposition";

    const batch = writeBatch(db);
    batch.set(
      doc(db, "fixtures", activeFixtureId),
      { opposition: cleanOpposition, updatedAt: Date.now() },
      { merge: true }
    );

    matches.forEach((match, index) => {
      const order = match.order || index + 1;
      const currentName = match.theirPlayers || "";
      const looksGeneric =
        currentName === "" ||
        currentName.startsWith("Opponent") ||
        currentName.includes(" Player ");

      if (looksGeneric) {
        batch.update(doc(db, "fixtures", activeFixtureId, "matches", match.id), {
          theirPlayers: opponentPlayerName(cleanOpposition, order),
        });
      }
    });

    await batch.commit();
  }

  async function saveMatchField(matchId, key, value) {
    if (!isCaptain || !activeFixtureId) return;
    const patch = { [key]: value };

    if (key === "leader" && value === "All Square") patch.margin = 0;
    if (key === "status" && value !== "Finished") {
      patch.finishedResult = "Not decided";
      patch.finishText = "";
    }

    await updateDoc(doc(db, "fixtures", activeFixtureId, "matches", matchId), patch);
    await setDoc(doc(db, "fixtures", activeFixtureId), { updatedAt: Date.now() }, { merge: true });
  }

  async function addMatch() {
    if (!isCaptain || !activeFixtureId) return;
    const nextOrder = matches.length + 1;
    const nextId = `match-${uid()}`;

    await setDoc(doc(db, "fixtures", activeFixtureId, "matches", nextId), {
      id: nextId,
      order: nextOrder,
      ourPlayers: `Player ${nextOrder}`,
      theirPlayers: opponentPlayerName(fixture.opposition, nextOrder),
      format: getFormatFromCompetition(fixture.teamName),
      status: "Not Started",
      leader: "All Square",
      margin: 0,
      currentHole: 1,
      finishedResult: "Not decided",
      finishText: "",
      notes: "",
    });

    setSelectedMatchId(nextId);
  }

  async function deleteMatch(matchId) {
    if (!isCaptain || !activeFixtureId) return;
    if (!window.confirm("Delete this match?")) return;
    await deleteDoc(doc(db, "fixtures", activeFixtureId, "matches", matchId));
  }

  async function deleteFixture() {
    if (!isCaptain || !activeFixtureId) return;
    if (!window.confirm("Delete this fixture and all matches?")) return;

    const matchesRef = collection(db, "fixtures", activeFixtureId, "matches");
    const snap = await getDocs(matchesRef);
    const batch = writeBatch(db);

    snap.forEach((docSnap) => {
      batch.delete(doc(db, "fixtures", activeFixtureId, "matches", docSnap.id));
    });

    batch.delete(doc(db, "fixtures", activeFixtureId));
    await batch.commit();
    setScreen("home");
  }

  async function archiveFixture() {
    if (!isCaptain || !activeFixtureId) return;
    if (!window.confirm("Move this fixture to the archive? It will be removed from the live Home Screen but kept safely.")) return;

    await setDoc(
      doc(db, "fixtures", activeFixtureId),
      {
        status: "Archived",
        isArchived: true,
        archivedAt: Date.now(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    const nextLiveFixture = liveFixtures.find((item) => item.id !== activeFixtureId);
    if (nextLiveFixture) {
      setActiveFixtureId(nextLiveFixture.id);
    }

    setCaptainTab("archive");
  }

  async function restoreFixture(fixtureId) {
    if (!isCaptain || !fixtureId) return;
    await setDoc(
      doc(db, "fixtures", fixtureId),
      {
        status: "Live",
        isArchived: false,
        archivedAt: null,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    setActiveFixtureId(fixtureId);
    setCaptainTab("updates");
  }


  async function createFixture() {
    if (!isCaptain) return;
    const finalTeamName =
      newFixtureTeam === "__custom__"
        ? newFixtureCustomTeam.trim() || "Custom Competition"
        : newFixtureTeam;

    const opposition = newFixtureOpposition || "Opposition";

    const fixtureRef = await addDoc(
      collection(db, "fixtures"),
      defaultFixture({
        teamName: finalTeamName,
        competition: finalTeamName,
        opposition,
        oppositionLogoUrl: newFixtureOppositionLogoUrl.trim(),
      })
    );

    const batch = writeBatch(db);
    defaultMatches(getFormatFromCompetition(finalTeamName), opposition).forEach((match) => {
      batch.set(doc(db, "fixtures", fixtureRef.id, "matches", match.id), match);
    });
    await batch.commit();

    setActiveFixtureId(fixtureRef.id);
    setSelectedMatchId("match-1");
    setNewFixtureOpposition("");
    setNewFixtureOppositionLogoUrl("");
    setNewFixtureCustomTeam("");
    setNewFixtureTeam("Barton Shield");
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
    if (leader !== "All Square" && (!selectedMatch.margin || selectedMatch.margin === 0)) {
      await saveMatchField(selectedMatch.id, "margin", 1);
    }
  }

  async function adjustHole(amount) {
    if (!selectedMatch || !isCaptain) return;
    const next = Math.min(25, Math.max(1, (selectedMatch.currentHole || 1) + amount));
    await saveMatchField(selectedMatch.id, "currentHole", next);
  }

  async function adjustMargin(amount) {
    if (!selectedMatch || !isCaptain || selectedMatch.leader === "All Square") return;
    const next = Math.min(12, Math.max(1, (selectedMatch.margin || 1) + amount));
    await saveMatchField(selectedMatch.id, "margin", next);
  }

  async function copySummary() {
    const text = [
      `${fixture.teamName}`,
      `${fixture.ourClub} vs ${fixture.opposition}`,
      `Venue: ${fixture.venue}`,
      `Date: ${fixture.date || "TBC"}`,
      `Official: ${totals.us}-${totals.them}`,
      `Live Overall: ${liveTotals.us}-${liveTotals.them}`,
      "",
      ...matches.map(
        (m, i) =>
          `${i + 1}. ${m.ourPlayers || "TBC"} vs ${m.theirPlayers || "TBC"} | ${liveStatus(m)}`
      ),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      alert("Summary copied.");
    } catch {
      alert("Copy failed on this browser.");
    }
  }

  const mobilePageStyle = {
    ...styles.page,
    padding: isMobile ? "10px" : "14px",
  };

  const navButtonStyle = (name) => ({
    ...styles.button,
    ...(screen === name ? styles.activeButton : {}),
    width: "100%",
  });

  if (loading) {
    return (
      <div style={mobilePageStyle}>
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
          fontFamily: "Arial, sans-serif",
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
            }}
          />
          <div style={{ fontSize: isMobile ? "28px" : "54px", fontWeight: 800 }}>
            {fixture.ourClub} {liveTotals.us} - {liveTotals.them} {fixture.opposition}
          </div>
          <div style={{ fontSize: isMobile ? "18px" : "24px", marginTop: "10px", color: "#f8e7b9" }}>
            {liveOverallText}
          </div>
        </div>

        <div style={{ display: "grid", gap: "14px" }}>
          {matches.map((m, i) => (
            <div
              key={m.id}
              style={{
                background:
                  i === tvHighlightIndex
                    ? `linear-gradient(135deg, ${colors.gold} 0%, #e7c46a 100%)`
                    : "rgba(255,255,255,0.08)",
                color: i === tvHighlightIndex ? colors.navy : "white",
                borderRadius: "18px",
                padding: isMobile ? "16px" : "18px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  gap: "10px",
                  alignItems: isMobile ? "flex-start" : "center",
                }}
              >
                <div>
                  <div style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: 700 }}>
                    Match {i + 1}
                  </div>
                  <div style={{ fontSize: isMobile ? "18px" : "24px", marginTop: "4px" }}>
                    {m.ourPlayers} vs {m.theirPlayers}
                  </div>
                </div>
                <div style={{ fontSize: isMobile ? "20px" : "26px", fontWeight: 800 }}>
                  {liveStatus(m)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button type="button" onClick={() => setScreen("home")} style={styles.primaryButton}>
            Exit TV Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={mobilePageStyle}>
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; width: 100%; overflow-x: hidden; }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div style={styles.shell}>
        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${colors.navy} 0%, #173d70 52%, ${colors.royal} 100%)`,
            color: "white",
            position: "relative",
            overflow: "hidden",
            marginBottom: "12px",
            border: `1px solid ${colors.gold}`,
            padding: isMobile ? "14px" : "18px",
            boxShadow: "0 10px 26px rgba(15,45,82,0.16)",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: isMobile ? "-42px" : "-32px",
              top: isMobile ? "-36px" : "-30px",
              width: isMobile ? "150px" : "190px",
              height: isMobile ? "150px" : "190px",
              borderRadius: "50%",
              border: `2px solid ${colors.gold}`,
              opacity: 0.16,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: isMobile ? "-16px" : "18px",
              bottom: isMobile ? "-18px" : "-28px",
              opacity: 0.08,
              transform: isMobile ? "scale(1.15)" : "scale(1.55)",
            }}
          >
            <img
              src={CREST_URL}
              alt="Portlaoise Golf Club crest watermark"
              style={{ width: isMobile ? 120 : 160 }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row",
              gap: "14px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: isMobile ? "64px" : "78px",
                height: isMobile ? "64px" : "78px",
                background: "rgba(255,255,255,0.12)",
                border: `1px solid rgba(212,166,74,0.7)`,
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
                flexShrink: 0,
              }}
            >
              <img
                src={CREST_URL}
                alt="Portlaoise Golf Club crest"
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
            <div style={{ width: "100%" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "1.8px",
                  textTransform: "uppercase",
                  color: "#f8e7b9",
                }}
              >
                Portlaoise Golf Club
              </div>
              <h1
                style={{
                  color: "white",
                  margin: "6px 0 0 0",
                  fontSize: isMobile ? "23px" : "30px",
                  lineHeight: 1.12,
                  letterSpacing: "-0.3px",
                }}
              >
                Live Interclub Web App
              </h1>
              <div
                style={{
                  marginTop: "10px",
                  padding: isMobile ? "10px 11px" : "12px 14px",
                  borderLeft: `4px solid ${colors.gold}`,
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.96)",
                  fontSize: isMobile ? "14px" : "16px",
                  lineHeight: 1.45,
                  maxWidth: "920px",
                }}
              >
                {CLUB_MESSAGE}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            padding: 0,
            overflow: "hidden",
            borderColor: colors.gold,
            background: colors.paleGold,
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", minHeight: "46px" }}>
            <div
              style={{
                background: colors.navy,
                color: "white",
                fontWeight: 700,
                padding: "14px 16px",
                flexShrink: 0,
              }}
            >
              LIVE
            </div>
            <div style={{ overflow: "hidden", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  width: "max-content",
                  animation: "tickerScroll 28s linear infinite",
                }}
              >
                {[...tickerItems, ...tickerItems].map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    style={{
                      padding: "0 24px",
                      lineHeight: "46px",
                      whiteSpace: "nowrap",
                      fontWeight: 700,
                      color: colors.navy,
                      fontSize: isMobile ? "14px" : "16px",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: "9px",
            marginBottom: "12px",
          }}
        >
          <button style={navButtonStyle("home")} onClick={() => setScreen("home")}>Home</button>
          <button style={navButtonStyle("captain")} onClick={() => setScreen("captain")}>Matchday Control</button>
          <button style={navButtonStyle("tv")} onClick={() => setScreen("tv")}>TV Mode</button>
          <button style={{ ...styles.button, width: "100%" }} onClick={copySummary}>Copy Summary</button>
          {isCaptain ? <button style={{ ...styles.button, width: "100%" }} onClick={logOutCaptain}>Log Out</button> : null}
        </div>

        {error ? (
          <div style={{ ...styles.card, borderColor: "#fecaca", color: "#991b1b" }}>{error}</div>
        ) : null}

        {screen === "home" ? (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              {liveFixtures.map((item) => (
                <HomeFixtureCard
                  key={item.id}
                  fixture={item}
                  compact={isMobile}
                  summary={fixtureSummaries[item.id] || getFixtureSummary([], item.ourClub, item.opposition)}
                  isActive={item.id === activeFixtureId}
                  onClick={() => {
                    setActiveFixtureId(item.id);
                    setSelectedMatchId("");
                  }}
                />
              ))}
            </div>

            <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
              <h2 style={{ color: colors.navy, marginTop: 0, fontSize: isMobile ? "22px" : "26px" }}>
                {fixture.teamName}
              </h2>
              <div style={{ marginBottom: "14px", color: colors.slate }}>
                {fixture.ourClub} vs {fixture.opposition}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <StatCard label="Official Score" value={`${totals.us}-${totals.them}`} />
                <StatCard label="Live Overall" value={`${liveTotals.us}-${liveTotals.them}`} />
                <StatCard label="Live Matches" value={totals.live} />
              </div>

              <div
                style={{
                  padding: "13px",
                  borderRadius: "14px",
                  background: colors.paleGold,
                  border: `1px solid ${colors.gold}`,
                  marginBottom: "12px",
                  fontWeight: 700,
                  color: colors.navy,
                }}
              >
                {liveOverallText}
              </div>

              <MatchList matches={matches} fixture={fixture} isMobile={isMobile} />
            </div>
          </div>
        ) : screen === "spectator" ? (
          <div>
            <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
              <h2 style={{ color: colors.navy, marginTop: 0, fontSize: isMobile ? "22px" : "26px" }}>
                {fixture.ourClub} vs {fixture.opposition}
              </h2>

              <div style={styles.inputWrap}>
                <label style={styles.label}>Switch Fixture</label>
                <select
                  style={styles.select}
                  value={activeFixtureId}
                  onChange={(e) => {
                    setActiveFixtureId(e.target.value);
                    setSelectedMatchId("");
                  }}
                >
                  {fixtures.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.teamName} vs {item.opposition}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isSmallMobile ? "1fr" : "1fr 1fr",
                  gap: "9px",
                  marginBottom: "12px",
                }}
              >
                <button
                  type="button"
                  style={styles.button}
                  disabled={!previousFixture}
                  onClick={() => {
                    if (!previousFixture) return;
                    setActiveFixtureId(previousFixture.id);
                    setSelectedMatchId("");
                  }}
                >
                  Previous Fixture
                </button>
                <button
                  type="button"
                  style={styles.button}
                  disabled={!nextFixture}
                  onClick={() => {
                    if (!nextFixture) return;
                    setActiveFixtureId(nextFixture.id);
                    setSelectedMatchId("");
                  }}
                >
                  Next Fixture
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <StatCard label="Official Score" value={`${totals.us}-${totals.them}`} />
                <StatCard label="Live Overall" value={`${liveTotals.us}-${liveTotals.them}`} />
              </div>

              <div
                style={{
                  padding: "13px",
                  borderRadius: "14px",
                  background: colors.paleGold,
                  border: `1px solid ${colors.gold}`,
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontWeight: 700, color: colors.navy }}>{liveOverallText}</div>
                <div style={{ ...styles.small, marginTop: "4px" }}>
                  Portlaoise leading: {liveMatchSummary.ourLeading} • Opposition leading: {liveMatchSummary.theirLeading} • All square: {liveMatchSummary.allSquare}
                </div>
              </div>

              <MatchList matches={matches} fixture={fixture} isMobile={isMobile} />
            </div>
          </div>
        ) : !isCaptain ? (
          <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
            <h3 style={{ marginTop: 0, color: colors.navy }}>Captain Login</h3>
            <form onSubmit={signInCaptain}>
              <div style={styles.inputWrap}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div style={styles.inputWrap}>
                <label style={styles.label}>Password</label>
                <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button style={{ ...styles.primaryButton, width: isMobile ? "100%" : "auto" }} disabled={authLoading}>
                {authLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div
              style={{
                ...styles.card,
                border: `1px solid ${colors.gold}`,
                background: `linear-gradient(135deg, #ffffff 0%, ${colors.paleGold} 100%)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  gap: "14px",
                  alignItems: isMobile ? "stretch" : "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 900,
                      letterSpacing: "1.4px",
                      color: colors.navy,
                      textTransform: "uppercase",
                    }}
                  >
                    Captain Area
                  </div>
                  <h2 style={{ margin: "5px 0 6px 0", color: colors.navy }}>
                    Matchday Control Panel
                  </h2>
                  <div style={styles.small}>
                    Clean setup, live scoring, finishing matches and fixture archive.
                  </div>
                </div>

                <div
                  style={{
                    background: "white",
                    border: `1px solid ${colors.gold}`,
                    borderRadius: "16px",
                    padding: "12px",
                    minWidth: isMobile ? "100%" : "320px",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 800, color: colors.slate }}>
                    Currently Editing
                  </div>
                  <div style={{ fontWeight: 900, color: colors.navy, marginTop: "4px" }}>
                    {fixture.teamName}
                  </div>
                  <div style={{ ...styles.small, marginTop: "3px" }}>
                    {fixture.ourClub} vs {fixture.opposition}
                  </div>
                  <div style={{ ...styles.small, marginTop: "3px" }}>
                    {fixture.venue} {fixture.date ? `• ${fixture.date}` : "• No date set"}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...styles.card, border: `1px solid ${colors.borderBlue}` }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1.2fr 2fr",
                  gap: "12px",
                  alignItems: "end",
                }}
              >
                <div style={styles.inputWrap}>
                  <label style={styles.label}>Choose Fixture to Edit</label>
                  <select
                    style={styles.select}
                    value={activeFixtureId}
                    onChange={(e) => {
                      setActiveFixtureId(e.target.value);
                      setSelectedMatchId("");
                    }}
                  >
                    {liveFixtures.length ? (
                      liveFixtures.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.teamName} vs {item.opposition}
                        </option>
                      ))
                    ) : (
                      <option value={activeFixtureId}>No live fixtures available</option>
                    )}
                  </select>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)",
                    gap: "8px",
                  }}
                >
                  <TabButton active={captainTab === "create"} onClick={() => setCaptainTab("create")}>
                    Create
                  </TabButton>
                  <TabButton active={captainTab === "setup"} onClick={() => setCaptainTab("setup")}>
                    Fixture Setup
                  </TabButton>
                  <TabButton active={captainTab === "updates"} onClick={() => setCaptainTab("updates")}>
                    Match Updates
                  </TabButton>
                  <TabButton active={captainTab === "archive"} onClick={() => setCaptainTab("archive")}>
                    Archive
                  </TabButton>
                </div>
              </div>
            </div>

            {captainTab === "create" ? (
              <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
                <h3 style={{ marginTop: 0, color: colors.navy }}>Create New Fixture</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr auto",
                    gap: "12px",
                  }}
                >
                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Competition / Team</label>
                    <select
                      style={styles.select}
                      value={newFixtureTeam}
                      onChange={(e) => setNewFixtureTeam(e.target.value)}
                    >
                      {TEAM_OPTIONS.map((team) => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                      <option value="__custom__">Other / Type competition name</option>
                    </select>
                    {newFixtureTeam === "__custom__" ? (
                      <input
                        style={styles.input}
                        value={newFixtureCustomTeam}
                        onChange={(e) => setNewFixtureCustomTeam(e.target.value)}
                        placeholder="Type competition name"
                      />
                    ) : null}
                  </div>

                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Opposition</label>
                    <input
                      style={styles.input}
                      value={newFixtureOpposition}
                      onChange={(e) => setNewFixtureOpposition(e.target.value)}
                      placeholder="Opposition name"
                    />
                  </div>

                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Opposition Logo URL</label>
                    <input
                      style={styles.input}
                      value={newFixtureOppositionLogoUrl}
                      onChange={(e) => setNewFixtureOppositionLogoUrl(e.target.value)}
                      placeholder="Paste crest/logo image URL"
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: isMobile ? "stretch" : "end" }}>
                    <button type="button" style={{ ...styles.primaryButton, width: "100%" }} onClick={createFixture}>
                      Create Fixture
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {captainTab === "setup" ? (
              <div>
                <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
                  <h3 style={{ marginTop: 0, color: colors.navy }}>Fixture Setup</h3>
                  <div style={{ ...styles.small, marginBottom: "14px" }}>
                    Use this before matchday. Fixture details, opposition logo and player names live here.
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Competition / Team</label>
                      <select
                        style={styles.select}
                        value={activeTeamIsKnown ? fixture.teamName : "__custom__"}
                        onChange={(e) => {
                          if (e.target.value !== "__custom__") saveFixtureField("teamName", e.target.value);
                        }}
                      >
                        {TEAM_OPTIONS.map((team) => (
                          <option key={team} value={team}>{team}</option>
                        ))}
                        <option value="__custom__">Other / Custom</option>
                      </select>
                      {!activeTeamIsKnown ? (
                        <input
                          style={styles.input}
                          value={fixture.teamName || ""}
                          onChange={(e) => setFixture((prev) => ({ ...prev, teamName: e.target.value }))}
                          onBlur={(e) => saveFixtureField("teamName", e.target.value || "Custom Competition")}
                          placeholder="Type competition name"
                        />
                      ) : null}
                    </div>

                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Opposition</label>
                      <input
                        style={styles.input}
                        value={fixture.opposition || ""}
                        onChange={(e) => setFixture((prev) => ({ ...prev, opposition: e.target.value }))}
                        onBlur={(e) => updateOppositionAndMatchNames(e.target.value)}
                      />
                    </div>

                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Opposition Logo URL</label>
                      <input
                        style={styles.input}
                        value={fixture.oppositionLogoUrl || ""}
                        onChange={(e) => setFixture((prev) => ({ ...prev, oppositionLogoUrl: e.target.value }))}
                        onBlur={(e) => saveFixtureField("oppositionLogoUrl", e.target.value)}
                        placeholder="Paste crest/logo image URL"
                      />
                    </div>

                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Date</label>
                      <input
                        style={styles.input}
                        type="date"
                        value={fixture.date || ""}
                        onChange={(e) => setFixture((prev) => ({ ...prev, date: e.target.value }))}
                        onBlur={(e) => saveFixtureField("date", e.target.value)}
                      />
                    </div>

                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Venue</label>
                      <select
                        style={styles.select}
                        value={fixture.venue || "Home"}
                        onChange={(e) => saveFixtureField("venue", e.target.value)}
                      >
                        <option>Home</option>
                        <option>Away</option>
                        <option>Neutral</option>
                      </select>
                    </div>

                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Captain / Manager</label>
                      <input
                        style={styles.input}
                        value={fixture.captain || ""}
                        onChange={(e) => setFixture((prev) => ({ ...prev, captain: e.target.value }))}
                        onBlur={(e) => saveFixtureField("captain", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: "space-between",
                      gap: "10px",
                      alignItems: isMobile ? "stretch" : "center",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, color: colors.navy }}>Player Setup</h3>
                      <div style={{ ...styles.small, marginTop: "4px" }}>
                        Edit player names directly. No match selector needed.
                      </div>
                    </div>
                    <button type="button" style={styles.primaryButton} onClick={addMatch}>
                      Add Match
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
                    {matches.map((match, index) => (
                      <div
                        key={match.id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "16px",
                          padding: "14px",
                          background: "#fff",
                        }}
                      >
                        <div style={{ fontWeight: 900, color: colors.navy, marginBottom: "10px" }}>
                          Match {index + 1}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 180px", gap: "12px" }}>
                          <div style={styles.inputWrap}>
                            <label style={styles.label}>Our Player(s)</label>
                            <input
                              style={styles.input}
                              value={match.ourPlayers || ""}
                              onChange={(e) => setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, ourPlayers: e.target.value } : m)))}
                              onBlur={(e) => saveMatchField(match.id, "ourPlayers", e.target.value)}
                            />
                          </div>
                          <div style={styles.inputWrap}>
                            <label style={styles.label}>Opposition Player(s)</label>
                            <input
                              style={styles.input}
                              value={match.theirPlayers || ""}
                              onChange={(e) => setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, theirPlayers: e.target.value } : m)))}
                              onBlur={(e) => saveMatchField(match.id, "theirPlayers", e.target.value)}
                            />
                          </div>
                          <div style={styles.inputWrap}>
                            <label style={styles.label}>Format</label>
                            <select
                              style={styles.select}
                              value={match.format || "Singles"}
                              onChange={(e) => saveMatchField(match.id, "format", e.target.value)}
                            >
                              <option>Singles</option>
                              <option>Fourball</option>
                              <option>Foursomes</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {captainTab === "updates" ? (
              <div>
                <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
                  <h3 style={{ marginTop: 0, color: colors.navy }}>Match Updates</h3>
                  <div
                    style={{
                      padding: "13px",
                      borderRadius: "14px",
                      background: colors.paleGold,
                      border: `1px solid ${colors.gold}`,
                      marginBottom: "12px",
                      fontWeight: 700,
                      color: colors.navy,
                    }}
                  >
                    {liveOverallText} — Live: {liveTotals.us}-{liveTotals.them}
                  </div>

                  <div style={{ display: "grid", gap: "14px" }}>
                    {matches.map((match, index) => (
                      <LiveMatchControlCard
                        key={match.id}
                        match={match}
                        index={index}
                        fixture={fixture}
                        isMobile={isMobile}
                        onLeader={(leader) => {
                          saveMatchField(match.id, "status", "In Progress");
                          saveMatchField(match.id, "leader", leader);
                          if (leader !== "All Square" && (!match.margin || match.margin === 0)) {
                            saveMatchField(match.id, "margin", 1);
                          }
                        }}
                        onStatus={(value) => saveMatchField(match.id, "status", value)}
                        onHoleMinus={() => {
                          const next = Math.min(25, Math.max(1, (match.currentHole || 1) - 1));
                          saveMatchField(match.id, "currentHole", next);
                        }}
                        onHolePlus={() => {
                          const next = Math.min(25, Math.max(1, (match.currentHole || 1) + 1));
                          saveMatchField(match.id, "currentHole", next);
                        }}
                        onMarginMinus={() => {
                          if (match.leader === "All Square") return;
                          const next = Math.min(12, Math.max(1, (match.margin || 1) - 1));
                          saveMatchField(match.id, "margin", next);
                        }}
                        onMarginPlus={() => {
                          if (match.leader === "All Square") return;
                          const next = Math.min(12, Math.max(1, (match.margin || 1) + 1));
                          saveMatchField(match.id, "margin", next);
                        }}
                        onFinishedResult={(value) => saveMatchField(match.id, "finishedResult", value)}
                        onFinishText={(value) => saveMatchField(match.id, "finishText", value)}
                        onMarkFinished={() => saveMatchField(match.id, "status", "Finished")}
                        onNotes={(value) => saveMatchField(match.id, "notes", value)}
                      />
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "10px",
                      marginTop: "16px",
                    }}
                  >
                    <button type="button" style={styles.primaryButton} onClick={copySummary}>
                      Copy Match Summary
                    </button>
                    <button type="button" style={styles.softButton} onClick={archiveFixture}>
                      Move Fixture to Archive
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {false ? (
              <div>
                <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
                  <h3 style={{ marginTop: 0, color: colors.navy }}>Results Centre</h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <StatCard label="Official Score" value={`${totals.us}-${totals.them}`} />
                    <StatCard label="Live Overall" value={`${liveTotals.us}-${liveTotals.them}`} />
                    <StatCard label="Finished Matches" value={`${totals.finished}/${matches.length}`} />
                  </div>

                  <div style={{ display: "grid", gap: "14px" }}>
                    {matches.map((match, index) => (
                      <ResultMatchCard
                        key={match.id}
                        match={match}
                        index={index}
                        fixture={fixture}
                        isMobile={isMobile}
                        onFinishedResult={(value) => saveMatchField(match.id, "finishedResult", value)}
                        onFinishText={(value) => saveMatchField(match.id, "finishText", value)}
                        onMarkFinished={() => saveMatchField(match.id, "status", "Finished")}
                        onNotes={(value) => saveMatchField(match.id, "notes", value)}
                      />
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "10px",
                      marginTop: "16px",
                    }}
                  >
                    <button type="button" style={styles.primaryButton} onClick={copySummary}>
                      Copy Match Summary
                    </button>
                    <button type="button" style={styles.softButton} onClick={archiveFixture}>
                      Move Fixture to Archive
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {captainTab === "archive" ? (
              <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
                <h3 style={{ marginTop: 0, color: colors.navy }}>Fixture Archive</h3>
                <div style={{ ...styles.small, marginBottom: "14px" }}>
                  Archived fixtures are removed from the public Home Screen but kept safely for records.
                </div>

                {archivedFixtures.length === 0 ? (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "14px",
                      background: colors.paleBlue,
                      border: `1px solid ${colors.borderBlue}`,
                      color: colors.navy,
                      fontWeight: 700,
                    }}
                  >
                    No archived fixtures yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {archivedFixtures.map((item) => {
                      const summary = fixtureSummaries[item.id] || getFixtureSummary([], item.ourClub, item.opposition);
                      return (
                        <div
                          key={item.id}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "16px",
                            padding: "14px",
                            background: "white",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
                              gap: "12px",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 900, color: colors.navy }}>{item.teamName}</div>
                              <div style={styles.small}>{item.ourClub} vs {item.opposition}</div>
                              <div style={styles.small}>{item.venue || "Home"} {item.date ? `• ${item.date}` : ""}</div>
                              <div style={{ marginTop: "8px", fontWeight: 800 }}>
                                Final/Official: {summary.official.us}-{summary.official.them}
                              </div>
                            </div>
                            <div style={{ display: "grid", gap: "8px" }}>
                              <button
                                type="button"
                                style={styles.button}
                                onClick={() => setActiveFixtureId(item.id)}
                              >
                                Select in Archive
                              </button>
                              <button
                                type="button"
                                style={styles.softButton}
                                onClick={() => restoreFixture(item.id)}
                              >
                                Restore to Live
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            <div style={{ ...styles.card, border: "1px solid #fecaca" }}>
              <details>
                <summary style={{ fontWeight: 900, color: colors.redText, cursor: "pointer" }}>
                  Danger Zone
                </summary>
                <div style={{ ...styles.small, marginTop: "10px", marginBottom: "10px" }}>
                  Only use this if a fixture was created by mistake. Normal completed fixtures should be moved to the Archive instead.
                </div>
                <button type="button" style={styles.dangerButton} onClick={deleteFixture}>
                  Permanently Delete Current Fixture
                </button>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.button,
        ...(active ? styles.activeButton : {}),
        width: "100%",
        minHeight: "44px",
        fontSize: "14px",
      }}
    >
      {children}
    </button>
  );
}

function SmallCounter({ label, value, onMinus, onPlus, disabled }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "10px",
        background: disabled ? "#f8fafc" : "white",
      }}
    >
      <div style={{ ...styles.label, marginBottom: "8px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <button type="button" style={{ ...styles.button, minHeight: "40px", padding: "8px 12px" }} onClick={onMinus} disabled={disabled}>-</button>
        <div style={{ fontSize: "24px", fontWeight: 900, color: disabled ? colors.slate : colors.navy }}>{value}</div>
        <button type="button" style={{ ...styles.button, minHeight: "40px", padding: "8px 12px" }} onClick={onPlus} disabled={disabled}>+</button>
      </div>
    </div>
  );
}

function LiveMatchControlCard({
  match,
  index,
  fixture,
  isMobile,
  onLeader,
  onStatus,
  onHoleMinus,
  onHolePlus,
  onMarginMinus,
  onMarginPlus,
  onFinishedResult,
  onFinishText,
  onMarkFinished,
  onNotes,
}) {
  return (
    <div
      style={{
        border: `1px solid ${colors.gold}`,
        borderRadius: "18px",
        padding: "14px",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
          gap: "12px",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "46px 1fr 46px",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <ClubLogo src={CREST_URL} alt="Portlaoise crest" fallback="PGC" size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, color: colors.navy }}>Match {index + 1}</div>
            <div style={{ ...styles.small, fontWeight: 700 }}>{match.ourPlayers || "TBC"}</div>
            <div style={styles.small}>vs {match.theirPlayers || "TBC"}</div>
          </div>
          <ClubLogo
            src={fixture?.oppositionLogoUrl}
            alt={`${fixture?.opposition || "Opposition"} crest`}
            fallback={getInitials(fixture?.opposition)}
            size={44}
          />
        </div>

        <span style={badgeStyle(match)}>{liveStatus(match)}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap: "9px",
          marginBottom: "12px",
        }}
      >
        <button type="button" style={styles.softButton} onClick={() => onLeader("Our team")}>
          Our Team Up
        </button>
        <button type="button" style={styles.button} onClick={() => onLeader("All Square")}>
          All Square
        </button>
        <button type="button" style={styles.softButton} onClick={() => onLeader("Their team")}>
          Opposition Up
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap: "12px",
        }}
      >
        <div style={styles.inputWrap}>
          <label style={styles.label}>Status</label>
          <select
            style={styles.select}
            value={match.status || "Not Started"}
            onChange={(e) => onStatus(e.target.value)}
          >
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Finished</option>
          </select>
        </div>

        <SmallCounter
          label="Hole / Playoff"
          value={match.currentHole || 1}
          onMinus={onHoleMinus}
          onPlus={onHolePlus}
        />

        <SmallCounter
          label="Margin"
          value={match.leader === "All Square" ? 0 : match.margin || 1}
          onMinus={onMarginMinus}
          onPlus={onMarginPlus}
          disabled={match.leader === "All Square"}
        />
      </div>

      <div
        style={{
          marginTop: "14px",
          paddingTop: "14px",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <div style={{ ...styles.label, marginBottom: "10px" }}>Finish Match</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <button type="button" style={styles.primaryButton} onClick={() => onFinishedResult("Our team won")}>
            Our Team Won
          </button>
          <button type="button" style={styles.button} onClick={() => onFinishedResult("Their team won")}>
            Opposition Won
          </button>
          <button type="button" style={styles.softButton} onClick={() => onFinishedResult("Halved")}>
            Halved
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "12px",
          }}
        >
          <div style={styles.inputWrap}>
            <label style={styles.label}>Final Result / Playoff Result</label>
            <select
              style={styles.select}
              value={match.finishText || ""}
              onChange={(e) => onFinishText(e.target.value)}
            >
              <option value="">Select a result</option>
              {STANDARD_RESULTS.map((result) => (
                <option key={result} value={result}>{result}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputWrap}>
            <label style={styles.label}>Notes</label>
            <input
              style={styles.input}
              defaultValue={match.notes || ""}
              onBlur={(e) => onNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
        </div>

        <button type="button" style={styles.primaryButton} onClick={onMarkFinished}>
          Mark Match as Finished
        </button>
      </div>
    </div>
  );
}

function ResultMatchCard({
  match,
  index,
  fixture,
  isMobile,
  onFinishedResult,
  onFinishText,
  onMarkFinished,
  onNotes,
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "14px",
        background: "white",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
          gap: "12px",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "44px 1fr 44px",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <ClubLogo src={CREST_URL} alt="Portlaoise crest" fallback="PGC" size={42} />
          <div>
            <div style={{ fontWeight: 900, color: colors.navy }}>Match {index + 1}</div>
            <div style={styles.small}>{match.ourPlayers || "TBC"} vs {match.theirPlayers || "TBC"}</div>
            <div style={{ ...styles.small, marginTop: "3px" }}>{match.format || "Singles"}</div>
          </div>
          <ClubLogo
            src={fixture?.oppositionLogoUrl}
            alt={`${fixture?.opposition || "Opposition"} crest`}
            fallback={getInitials(fixture?.opposition)}
            size={42}
          />
        </div>
        <span style={badgeStyle(match)}>{liveStatus(match)}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <button type="button" style={styles.primaryButton} onClick={() => onFinishedResult("Our team won")}>
          Our Team Won
        </button>
        <button type="button" style={styles.button} onClick={() => onFinishedResult("Their team won")}>
          Opposition Won
        </button>
        <button type="button" style={styles.softButton} onClick={() => onFinishedResult("Halved")}>
          Halved
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "12px",
        }}
      >
        <div style={styles.inputWrap}>
          <label style={styles.label}>Final Result / Playoff Result</label>
          <select
            style={styles.select}
            value={match.finishText || ""}
            onChange={(e) => onFinishText(e.target.value)}
          >
            <option value="">Select a result</option>
            {STANDARD_RESULTS.map((result) => (
              <option key={result} value={result}>{result}</option>
            ))}
          </select>
        </div>

        <div style={styles.inputWrap}>
          <label style={styles.label}>Notes</label>
          <input
            style={styles.input}
            defaultValue={match.notes || ""}
            onBlur={(e) => onNotes(e.target.value)}
            placeholder="Optional notes"
          />
        </div>
      </div>

      <button type="button" style={styles.primaryButton} onClick={onMarkFinished}>
        Mark Match as Finished
      </button>
    </div>
  );
}

function MatchList({ matches, fixture, isMobile }) {
  return (
    <div style={{ display: "grid", gap: "10px" }}>
      {matches.map((match, index) => (
        <div
          key={match.id}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "12px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) auto",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "44px 1fr 44px" : "48px 1fr 48px",
              gap: "10px",
              alignItems: "center",
              minWidth: 0,
            }}
          >
            <ClubLogo src={CREST_URL} alt="Portlaoise crest" fallback="PGC" size={isMobile ? 42 : 46} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: colors.navy }}>Match {index + 1}</div>
              <div style={styles.small}>{match.ourPlayers || "TBC"}</div>
              <div style={styles.small}>vs {match.theirPlayers || "TBC"}</div>
              <div style={{ ...styles.small, marginTop: "4px" }}>{match.format || "Singles"}</div>
            </div>
            <ClubLogo
              src={fixture?.oppositionLogoUrl}
              alt={`${fixture?.opposition || "Opposition"} crest`}
              fallback={getInitials(fixture?.opposition)}
              size={isMobile ? 42 : 46}
            />
          </div>
          <span style={badgeStyle(match)}>{liveStatus(match)}</span>
        </div>
      ))}
    </div>
  );
}

function CounterBox({ label, value, onMinus, onPlus }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", padding: "14px" }}>
      <div style={{ ...styles.label, marginBottom: "10px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
        <button type="button" style={styles.button} onClick={onMinus}>-</button>
        <div style={{ fontSize: "28px", fontWeight: 700 }}>{value}</div>
        <button type="button" style={styles.button} onClick={onPlus}>+</button>
      </div>
    </div>
  );
}
