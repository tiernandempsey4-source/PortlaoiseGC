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
  doc,
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
  measurementId: "G-10J79036R3",
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
  "10&8",
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "14px",
    fontFamily: "Arial, sans-serif",
    color: "#0f172a",
  },
  shell: {
    maxWidth: "1180px",
    margin: "0 auto",
  },
  card: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    margin: 0,
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
  },
  select: {
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "16px",
    background: "white",
    width: "100%",
  },
  button: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
  },
  primaryButton: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "none",
    background: "#0f2d52",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
  },
  softButton: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "15px",
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
    cursor: "pointer",
  },
  activeChip: {
    background: "#0f2d52",
    color: "white",
    border: "1px solid #0f2d52",
  },
  badge: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  small: {
    fontSize: "14px",
    color: "#475569",
  },
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
    ...overrides,
  };
}

function defaultMatches() {
  return [1, 2, 3, 4].map((num) => ({
    id: `match-${num}`,
    order: num,
    ourPlayers: `Player ${num}`,
    theirPlayers: `Opponent ${num}`,
    format: "Singles",
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
  if (match.finishedResult === "Our team won") return { us: 1, them: 0 };
  if (match.finishedResult === "Their team won") return { us: 0, them: 1 };
  if (match.finishedResult === "Halved") return { us: 0.5, them: 0.5 };
  return { us: 0, them: 0 };
}

function liveStatus(match) {
  if (match.status === "Finished") {
    if (match.finishedResult === "Halved") return "Match halved";
    if (match.finishedResult === "Our team won")
      return `Won ${match.finishText || ""}`.trim();
    if (match.finishedResult === "Their team won")
      return `Lost ${match.finishText || ""}`.trim();
    return "Finished";
  }
  if (match.status === "Not Started") return "Not started";
  if (match.leader === "All Square")
    return `All Square thru ${Math.max(match.currentHole - 1, 0)}`;
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
      bg = "#dcfce7";
      color = "#166534";
    } else if (match.finishedResult === "Their team won") {
      bg = "#fee2e2";
      color = "#991b1b";
    } else if (match.finishedResult === "Halved") {
      bg = "#fef3c7";
      color = "#92400e";
    }
  } else if (match.leader === "Our team") {
    bg = "#dcfce7";
    color = "#166534";
  } else if (match.leader === "Their team") {
    bg = "#fee2e2";
    color = "#991b1b";
  }
  return { ...styles.badge, background: bg, color };
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "14px",
        textAlign: "center",
      }}
    >
      <div style={styles.small}>{label}</div>
      <div style={{ fontSize: "30px", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState("spectator");
  const [fixtures, setFixtures] = useState([]);
  const [activeFixtureId, setActiveFixtureId] = useState("");
  const [fixture, setFixture] = useState(defaultFixture());
  const [matches, setMatches] = useState(defaultMatches());
  const [selectedMatchId, setSelectedMatchId] = useState("match-1");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [newFixtureTeam, setNewFixtureTeam] = useState("Barton Shield");
  const [newFixtureOpposition, setNewFixtureOpposition] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) =>
      setUser(nextUser || null)
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const fixturesQuery = query(
      collection(db, "fixtures"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      fixturesQuery,
      async (snap) => {
        let nextFixtures = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        if (nextFixtures.length === 0) {
          const fixtureRef = await addDoc(
            collection(db, "fixtures"),
            defaultFixture()
          );
          const batch = writeBatch(db);
          defaultMatches().forEach((match) => {
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
          defaultMatches().forEach((match) => {
            batch.set(
              doc(db, "fixtures", activeFixtureId, "matches", match.id),
              match
            );
          });
          await batch.commit();
          return;
        }
        const nextMatches = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setMatches(nextMatches);
        setSelectedMatchId((current) => current || nextMatches[0]?.id || "");
      },
      (err) => setError(err.message || "Could not load matches.")
    );

    return () => {
      unsubFixture();
      unsubMatches();
    };
  }, [activeFixtureId]);

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
    if (liveTotals.us > liveTotals.them)
      return `${fixture.ourClub} currently leads overall`;
    if (liveTotals.them > liveTotals.us)
      return `${fixture.opposition} currently leads overall`;
    return "Overall match is currently level";
  }, [liveTotals, fixture.ourClub, fixture.opposition]);

  const selectedMatch =
    matches.find((m) => m.id === selectedMatchId) || matches[0] || null;
  const isCaptain = !!user;

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
    await setDoc(doc(db, "fixtures", activeFixtureId, "matches", nextId), {
      id: nextId,
      order: nextOrder,
      ourPlayers: `Player ${nextOrder}`,
      theirPlayers: `Opponent ${nextOrder}`,
      format: "Singles",
      status: "Not Started",
      currentHole: 1,
      leader: "All Square",
      margin: 0,
      finishedResult: "Not decided",
      finishText: "",
      notes: "",
    });
    setSelectedMatchId(nextId);
  }

  async function createFixture() {
    if (!isCaptain) return;
    const fixtureRef = await addDoc(
      collection(db, "fixtures"),
      defaultFixture({
        teamName: newFixtureTeam,
        opposition: newFixtureOpposition || "Opposition",
      })
    );
    const batch = writeBatch(db);
    defaultMatches().forEach((match) => {
      batch.set(doc(db, "fixtures", fixtureRef.id, "matches", match.id), match);
    });
    await batch.commit();
    setActiveFixtureId(fixtureRef.id);
    setSelectedMatchId("match-1");
    setNewFixtureOpposition("");
  }

  async function signInCaptain(e) {
    e.preventDefault();
    setError("");
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
      setViewMode("captain");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function logOutCaptain() {
    await signOut(auth);
    setViewMode("spectator");
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
    if (!selectedMatch || !isCaptain || selectedMatch.leader === "All Square")
      return;
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
      ),
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

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div
          style={{
            ...styles.card,
            background: "linear-gradient(135deg, #0f2d52 0%, #2448d8 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-20px",
              top: "-10px",
              opacity: 0.08,
              transform: "scale(1.8)",
            }}
          >
            <img
              src={CREST_URL}
              alt="Portlaoise Golf Club crest watermark"
              style={{ width: 180 }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: "74px",
                height: "74px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                flexShrink: 0,
              }}
            >
              <img
                src={CREST_URL}
                alt="Portlaoise Golf Club crest"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1.8px",
                  textTransform: "uppercase",
                  opacity: 0.92,
                }}
              >
                Portlaoise Golf Club
              </div>
              <h1 style={{ ...styles.title, color: "white", marginTop: "6px" }}>
                Live Interclub Web App
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.92)",
                  marginTop: "8px",
                  marginBottom: 0,
                }}
              >
                Multiple team fixtures, live scoring and spectator tracking in
                one place.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              ...styles.chip,
              ...(viewMode === "spectator" ? styles.activeChip : {}),
            }}
            onClick={() => setViewMode("spectator")}
          >
            Spectator View
          </button>
          <button
            style={{
              ...styles.chip,
              ...(viewMode === "captain" ? styles.activeChip : {}),
            }}
            onClick={() => setViewMode("captain")}
          >
            Captain View
          </button>
          <button style={styles.button} onClick={copySummary}>
            Copy Summary
          </button>
          {isCaptain ? (
            <button style={styles.button} onClick={logOutCaptain}>
              Log Out
            </button>
          ) : null}
        </div>

        {error ? (
          <div
            style={{
              ...styles.card,
              marginBottom: "16px",
              borderColor: "#fecaca",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ ...styles.card, marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: "#0f2d52" }}>Live Fixtures</h3>
              <div style={styles.small}>
                Tap a fixture card to switch between simultaneous team matches.
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px",
            }}
          >
            {fixtures.map((item) => {
              const isActive = activeFixtureId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveFixtureId(item.id);
                    setSelectedMatchId("");
                  }}
                  style={{
                    ...styles.button,
                    textAlign: "left",
                    borderRadius: "18px",
                    padding: "14px",
                    background: isActive
                      ? "linear-gradient(135deg, #0f2d52 0%, #2448d8 100%)"
                      : "white",
                    color: isActive ? "white" : "#0f172a",
                    border: isActive
                      ? "1px solid #0f2d52"
                      : "1px solid #cbd5e1",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "1.3px",
                      textTransform: "uppercase",
                      opacity: isActive ? 0.9 : 0.7,
                    }}
                  >
                    {item.teamName}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      marginTop: "6px",
                    }}
                  >
                    vs {item.opposition}
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "14px",
                      opacity: isActive ? 0.9 : 0.7,
                    }}
                  >
                    {item.venue} {item.date ? `• ${item.date}` : ""}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "13px",
                      opacity: isActive ? 0.9 : 0.7,
                    }}
                  >
                    {item.status || "Live"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {viewMode === "spectator" ? (
          <div>
            <div style={{ ...styles.card, marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      color: "#0f2d52",
                    }}
                  >
                    {fixture.teamName} • {fixture.competition}
                  </div>
                  <h2 style={{ margin: "6px 0 8px 0", color: "#0f2d52" }}>
                    {fixture.ourClub} vs {fixture.opposition}
                  </h2>
                  <div style={styles.small}>
                    {fixture.venue} {fixture.date ? `• ${fixture.date}` : ""}
                  </div>
                  <div style={styles.small}>
                    Captain: {fixture.captain || "TBC"}
                  </div>
                  <div style={styles.small}>
                    Updated:{" "}
                    {fixture.updatedAt
                      ? new Date(fixture.updatedAt).toLocaleTimeString()
                      : "—"}
                  </div>
                </div>
                <img
                  src={CREST_URL}
                  alt="Club crest"
                  style={{ width: 64, height: 64, objectFit: "contain" }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <StatCard
                label="Official Score"
                value={`${totals.us}-${totals.them}`}
              />
              <StatCard
                label="Live Overall"
                value={`${liveTotals.us}-${liveTotals.them}`}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <StatCard
                label="Matches Leading"
                value={`${liveMatchSummary.ourLeading}-${liveMatchSummary.theirLeading}`}
              />
              <StatCard label="Live Matches" value={totals.live} />
            </div>

            <div
              style={{
                ...styles.card,
                marginBottom: "16px",
                background: "#eff6ff",
                borderColor: "#bfdbfe",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: "#0f2d52",
                  marginBottom: "6px",
                }}
              >
                {liveOverallText}
              </div>
              <div style={styles.small}>
                Portlaoise leading: {liveMatchSummary.ourLeading} • Opposition
                leading: {liveMatchSummary.theirLeading} • All square:{" "}
                {liveMatchSummary.allSquare}
              </div>
            </div>

            <div style={{ ...styles.card, marginBottom: "16px" }}>
              <h3 style={{ marginTop: 0, color: "#0f2d52" }}>
                Live Matchboard
              </h3>
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "14px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                        Match {index + 1}
                      </div>
                      <div style={styles.small}>
                        {match.ourPlayers || "TBC"}
                      </div>
                      <div style={styles.small}>
                        vs {match.theirPlayers || "TBC"}
                      </div>
                      <div style={{ ...styles.small, marginTop: "4px" }}>
                        {match.format}
                      </div>
                    </div>
                    <span style={badgeStyle(match)}>{liveStatus(match)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {!isCaptain ? (
              <div style={{ ...styles.card, marginBottom: "16px" }}>
                <h3 style={{ marginTop: 0, color: "#0f2d52" }}>
                  Captain Login
                </h3>
                <form onSubmit={signInCaptain}>
                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Email</label>
                    <input
                      style={styles.input}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Password</label>
                    <input
                      style={styles.input}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button style={styles.primaryButton} disabled={authLoading}>
                    {authLoading ? "Signing In..." : "Sign In"}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div style={{ ...styles.card, marginBottom: "16px" }}>
                  <h3 style={{ marginTop: 0, color: "#0f2d52" }}>
                    Create New Fixture
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Team</label>
                      <select
                        style={styles.select}
                        value={newFixtureTeam}
                        onChange={(e) => setNewFixtureTeam(e.target.value)}
                      >
                        {TEAM_OPTIONS.map((team) => (
                          <option key={team} value={team}>
                            {team}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Opposition</label>
                      <input
                        style={styles.input}
                        value={newFixtureOpposition}
                        onChange={(e) =>
                          setNewFixtureOpposition(e.target.value)
                        }
                        placeholder="Opposition name"
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "end" }}>
                      <button
                        type="button"
                        style={{ ...styles.primaryButton, width: "100%" }}
                        onClick={createFixture}
                      >
                        Create Fixture
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ ...styles.card, marginBottom: "16px" }}>
                  <h3 style={{ marginTop: 0, color: "#0f2d52" }}>
                    Fixture Setup
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Team Name</label>
                      <select
                        style={styles.select}
                        value={fixture.teamName}
                        onChange={(e) =>
                          saveFixtureField("teamName", e.target.value)
                        }
                      >
                        {TEAM_OPTIONS.map((team) => (
                          <option key={team} value={team}>
                            {team}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Competition</label>
                      <input
                        style={styles.input}
                        value={fixture.competition}
                        onChange={(e) =>
                          setFixture((prev) => ({
                            ...prev,
                            competition: e.target.value,
                          }))
                        }
                        onBlur={(e) =>
                          saveFixtureField("competition", e.target.value)
                        }
                      />
                    </div>
                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Date</label>
                      <input
                        style={styles.input}
                        type="date"
                        value={fixture.date}
                        onChange={(e) =>
                          setFixture((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        onBlur={(e) => saveFixtureField("date", e.target.value)}
                      />
                    </div>
                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Opposition</label>
                      <input
                        style={styles.input}
                        value={fixture.opposition}
                        onChange={(e) =>
                          setFixture((prev) => ({
                            ...prev,
                            opposition: e.target.value,
                          }))
                        }
                        onBlur={(e) =>
                          saveFixtureField("opposition", e.target.value)
                        }
                      />
                    </div>
                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Venue</label>
                      <select
                        style={styles.select}
                        value={fixture.venue}
                        onChange={(e) => {
                          setFixture((prev) => ({
                            ...prev,
                            venue: e.target.value,
                          }));
                          saveFixtureField("venue", e.target.value);
                        }}
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
                        value={fixture.captain}
                        onChange={(e) =>
                          setFixture((prev) => ({
                            ...prev,
                            captain: e.target.value,
                          }))
                        }
                        onBlur={(e) =>
                          saveFixtureField("captain", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.card,
                    background: "#eff6ff",
                    borderColor: "#bfdbfe",
                    marginBottom: "14px",
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#0f2d52",
                      marginBottom: "6px",
                    }}
                  >
                    {liveOverallText}
                  </div>
                  <div style={styles.small}>
                    Live overall: {liveTotals.us}-{liveTotals.them} • Portlaoise
                    leading: {liveMatchSummary.ourLeading} • Opposition leading:{" "}
                    {liveMatchSummary.theirLeading} • All square:{" "}
                    {liveMatchSummary.allSquare}
                  </div>
                </div>

                <div style={{ ...styles.card, marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginBottom: "12px",
                    }}
                  >
                    <h3 style={{ margin: 0, color: "#0f2d52" }}>
                      Captain Match List
                    </h3>
                    <button
                      type="button"
                      style={styles.primaryButton}
                      onClick={addMatch}
                    >
                      Add Match
                    </button>
                  </div>
                  {matches.map((match, index) => (
                    <div
                      key={match.id}
                      style={{
                        border:
                          selectedMatch?.id === match.id
                            ? "2px solid #2448d8"
                            : "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "12px",
                        marginBottom: "10px",
                        background:
                          selectedMatch?.id === match.id ? "#eff6ff" : "white",
                      }}
                    >
                      <button
                        onClick={() => setSelectedMatchId(match.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          textAlign: "left",
                          padding: 0,
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              Match {index + 1}
                            </div>
                            <div style={styles.small}>
                              {match.ourPlayers || "TBC"} vs{" "}
                              {match.theirPlayers || "TBC"}
                            </div>
                          </div>
                          <span style={badgeStyle(match)}>
                            {liveStatus(match)}
                          </span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>

                {selectedMatch ? (
                  <div style={styles.card}>
                    <h3 style={{ marginTop: 0, color: "#0f2d52" }}>
                      Edit Selected Match
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <div style={styles.inputWrap}>
                        <label style={styles.label}>Our Player(s)</label>
                        <input
                          style={styles.input}
                          value={selectedMatch.ourPlayers}
                          onChange={(e) =>
                            setMatches((prev) =>
                              prev.map((m) =>
                                m.id === selectedMatch.id
                                  ? { ...m, ourPlayers: e.target.value }
                                  : m
                              )
                            )
                          }
                          onBlur={(e) =>
                            saveMatchField(
                              selectedMatch.id,
                              "ourPlayers",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div style={styles.inputWrap}>
                        <label style={styles.label}>Their Player(s)</label>
                        <input
                          style={styles.input}
                          value={selectedMatch.theirPlayers}
                          onChange={(e) =>
                            setMatches((prev) =>
                              prev.map((m) =>
                                m.id === selectedMatch.id
                                  ? { ...m, theirPlayers: e.target.value }
                                  : m
                              )
                            )
                          }
                          onBlur={(e) =>
                            saveMatchField(
                              selectedMatch.id,
                              "theirPlayers",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div style={styles.inputWrap}>
                        <label style={styles.label}>Format</label>
                        <select
                          style={styles.select}
                          value={selectedMatch.format}
                          onChange={(e) =>
                            saveMatchField(
                              selectedMatch.id,
                              "format",
                              e.target.value
                            )
                          }
                        >
                          <option>Singles</option>
                          <option>Fourball</option>
                          <option>Foursomes</option>
                        </select>
                      </div>
                      <div style={styles.inputWrap}>
                        <label style={styles.label}>Status</label>
                        <select
                          style={styles.select}
                          value={selectedMatch.status}
                          onChange={(e) =>
                            saveMatchField(
                              selectedMatch.id,
                              "status",
                              e.target.value
                            )
                          }
                        >
                          <option>Not Started</option>
                          <option>In Progress</option>
                          <option>Finished</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                      <div style={{ ...styles.label, marginBottom: "8px" }}>
                        Quick Score Buttons
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        <button
                          type="button"
                          style={styles.softButton}
                          onClick={() => setLeaderQuick("Our team")}
                        >
                          Our Team Up
                        </button>
                        <button
                          type="button"
                          style={styles.button}
                          onClick={() => setLeaderQuick("All Square")}
                        >
                          All Square
                        </button>
                        <button
                          type="button"
                          style={styles.softButton}
                          onClick={() => setLeaderQuick("Their team")}
                        >
                          Their Team Up
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "16px",
                          padding: "14px",
                        }}
                      >
                        <div style={{ ...styles.label, marginBottom: "10px" }}>
                          Current Hole
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                          }}
                        >
                          <button
                            type="button"
                            style={styles.button}
                            onClick={() => adjustHole(-1)}
                          >
                            -
                          </button>
                          <div style={{ fontSize: "28px", fontWeight: 700 }}>
                            {selectedMatch.currentHole}
                          </div>
                          <button
                            type="button"
                            style={styles.button}
                            onClick={() => adjustHole(1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "16px",
                          padding: "14px",
                        }}
                      >
                        <div style={{ ...styles.label, marginBottom: "10px" }}>
                          Margin
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                          }}
                        >
                          <button
                            type="button"
                            style={styles.button}
                            onClick={() => adjustMargin(-1)}
                          >
                            -
                          </button>
                          <div style={{ fontSize: "28px", fontWeight: 700 }}>
                            {selectedMatch.leader === "All Square"
                              ? 0
                              : selectedMatch.margin}
                          </div>
                          <button
                            type="button"
                            style={styles.button}
                            onClick={() => adjustMargin(1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                      <div style={{ ...styles.label, marginBottom: "8px" }}>
                        Match Result
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <button
                          type="button"
                          style={styles.primaryButton}
                          onClick={() =>
                            saveMatchField(
                              selectedMatch.id,
                              "finishedResult",
                              "Our team won"
                            )
                          }
                        >
                          Our Team Won
                        </button>
                        <button
                          type="button"
                          style={styles.button}
                          onClick={() =>
                            saveMatchField(
                              selectedMatch.id,
                              "finishedResult",
                              "Their team won"
                            )
                          }
                        >
                          Their Team Won
                        </button>
                        <button
                          type="button"
                          style={styles.softButton}
                          onClick={() =>
                            saveMatchField(
                              selectedMatch.id,
                              "finishedResult",
                              "Halved"
                            )
                          }
                        >
                          Halved
                        </button>
                      </div>

                      <div style={styles.inputWrap}>
                        <label style={styles.label}>
                          Choose Standard Result
                        </label>
                        <select
                          style={styles.select}
                          value={selectedMatch.finishText}
                          onChange={(e) =>
                            saveMatchField(
                              selectedMatch.id,
                              "finishText",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select a result</option>
                          {STANDARD_RESULTS.map((result) => (
                            <option key={result} value={result}>
                              {result}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.inputWrap}>
                        <label style={styles.label}>
                          Or Type Final Score Manually
                        </label>
                        <input
                          style={styles.input}
                          placeholder="e.g. 3&2, 4&3, 1 up"
                          value={selectedMatch.finishText}
                          onChange={(e) =>
                            setMatches((prev) =>
                              prev.map((m) =>
                                m.id === selectedMatch.id
                                  ? { ...m, finishText: e.target.value }
                                  : m
                              )
                            )
                          }
                          onBlur={(e) =>
                            saveMatchField(
                              selectedMatch.id,
                              "finishText",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        style={{ ...styles.primaryButton, marginTop: "10px" }}
                        onClick={() =>
                          saveMatchField(selectedMatch.id, "status", "Finished")
                        }
                      >
                        Mark Match as Finished
                      </button>
                    </div>

                    <div style={styles.inputWrap}>
                      <label style={styles.label}>Notes</label>
                      <input
                        style={styles.input}
                        value={selectedMatch.notes}
                        onChange={(e) =>
                          setMatches((prev) =>
                            prev.map((m) =>
                              m.id === selectedMatch.id
                                ? { ...m, notes: e.target.value }
                                : m
                            )
                          )
                        }
                        onBlur={(e) =>
                          saveMatchField(
                            selectedMatch.id,
                            "notes",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div style={{ marginTop: "8px" }}>
                      <span style={badgeStyle(selectedMatch)}>
                        {liveStatus(selectedMatch)}
                      </span>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
