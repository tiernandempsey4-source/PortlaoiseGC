
import React, { useEffect, useMemo, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
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
  appId: "1:55958774219:web:9e4930603003bffc83564e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const CREST_URL =
  "https://irp.cdn-website.com/282f6f7b/dms3rep/multi/Portlaoise+G.C.png";

const colors = {
  navy: "#0f2d52",
  gold: "#d4a64a",
  light: "#f8fafc"
};

const styles = {
  page: {
    minHeight: "100vh",
    background: colors.light,
    padding: "12px",
    fontFamily: "Arial"
  },
  card: {
    background: "white",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "12px"
  }
};

const uid = () => Math.random().toString(36).slice(2, 9);

function defaultFixture() {
  return {
    teamName: "Barton Shield",
    opposition: "Opposition",
    venue: "Home",
    createdAt: Date.now()
  };
}

function defaultMatches() {
  return [1, 2, 3, 4].map((i) => ({
    id: `match-${i}`,
    ourPlayers: `Player ${i}`,
    theirPlayers: `Opponent ${i}`,
    status: "Not Started",
    leader: "All Square",
    margin: 0,
    currentHole: 1
  }));
}
function liveStatus(match) {
  if (match.status === "Finished") {
    if (match.leader === "Our team") return "Won";
    if (match.leader === "Their team") return "Lost";
    return "Halved";
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

function resultPoints(match) {
  if (match.status !== "Finished") return { us: 0, them: 0 };
  if (match.leader === "Our team") return { us: 1, them: 0 };
  if (match.leader === "Their team") return { us: 0, them: 1 };
  return { us: 0.5, them: 0.5 };
}

function badgeStyle(match) {
  let background = "#e2e8f0";
  let color = "#0f172a";

  if (match.status === "Finished") {
    if (match.leader === "Our team") {
      background = "#dcfce7";
      color = "#166534";
    } else if (match.leader === "Their team") {
      background = "#fee2e2";
      color = "#991b1b";
    } else {
      background = "#fef3c7";
      color = "#92400e";
    }
  } else if (match.leader === "Our team") {
    background = "#dcfce7";
    color = "#166534";
  } else if (match.leader === "Their team") {
    background = "#fee2e2";
    color = "#991b1b";
  }

  return {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    background,
    color
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
        textAlign: "center"
      }}
    >
      <div style={{ fontSize: "14px", color: "#475569" }}>{label}</div>
      <div style={{ fontSize: "30px", fontWeight: 700, color: colors.navy }}>
        {value}
      </div>
    </div>
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
  const [newFixtureTeam, setNewFixtureTeam] = useState("Barton Shield");
  const [newFixtureOpposition, setNewFixtureOpposition] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const isMobile = windowWidth < 900;

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
          ...docSnap.data()
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

  const selectedMatch =
    matches.find((m) => m.id === selectedMatchId) || matches[0] || null;

  const totals = useMemo(() => {
    return matches.reduce(
      (acc, match) => {
        const pts = resultPoints(match);
        acc.us += pts.us;
        acc.them += pts.them;
        if (match.status === "In Progress") acc.live += 1;
        return acc;
      },
      { us: 0, them: 0, live: 0 }
    );
  }, [matches]);

  async function saveFixtureField(key, value) {
    if (!user || !activeFixtureId) return;
    await setDoc(
      doc(db, "fixtures", activeFixtureId),
      { [key]: value, updatedAt: Date.now() },
      { merge: true }
    );
  }

  async function saveMatchField(matchId, key, value) {
    if (!user || !activeFixtureId) return;
    const patch = { [key]: value };

    if (key === "leader" && value === "All Square") patch.margin = 0;

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
    if (!user || !activeFixtureId) return;
    const nextOrder = matches.length + 1;
    const nextId = `match-${uid()}`;

    await setDoc(doc(db, "fixtures", activeFixtureId, "matches", nextId), {
      id: nextId,
      order: nextOrder,
      ourPlayers: `Player ${nextOrder}`,
      theirPlayers: `Opponent ${nextOrder}`,
      status: "Not Started",
      leader: "All Square",
      margin: 0,
      currentHole: 1
    });

    setSelectedMatchId(nextId);
  }

  async function deleteMatch(matchId) {
    if (!user || !activeFixtureId) return;
    if (!window.confirm("Delete this match?")) return;

    await deleteDoc(doc(db, "fixtures", activeFixtureId, "matches", matchId));
  }

  async function deleteFixture() {
    if (!user || !activeFixtureId) return;
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

  async function createFixture() {
    if (!user) return;

    const fixtureRef = await addDoc(
      collection(db, "fixtures"),
      defaultFixture({
        teamName: newFixtureTeam,
        opposition: newFixtureOpposition || "Opposition"
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
    setScreen("captain");
  }

  async function signInCaptain(e) {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
      setScreen("captain");
    } catch (err) {
      setError(err.message || "Login failed.");
    }
  }

  async function logOutCaptain() {
    await signOut(auth);
    setScreen("home");
  }

  async function copySummary() {
    const text = [
      `${fixture.teamName}`,
      `${fixture.ourClub} vs ${fixture.opposition}`,
      `Venue: ${fixture.venue}`,
      "",
      ...matches.map(
        (m, i) =>
          `${i + 1}. ${m.ourPlayers || "TBC"} vs ${
            m.theirPlayers || "TBC"
          } | ${liveStatus(m)}`
      )
    ].join("\\n");

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
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
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
              marginBottom: "12px"
            }}
          />
          <div style={{ fontSize: isMobile ? "28px" : "54px", fontWeight: 800 }}>
            {fixture.ourClub} {totals.us} - {totals.them} {fixture.opposition}
          </div>
        </div>

        <div style={{ display: "grid", gap: "14px" }}>
          {matches.map((m, i) => (
            <div
              key={m.id}
              style={{
                background: i === 0 ? `linear-gradient(135deg, ${colors.gold} 0%, #e7c46a 100%)` : "rgba(255,255,255,0.08)",
                color: i === 0 ? colors.navy : "white",
                borderRadius: "18px",
                padding: isMobile ? "16px" : "18px 22px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  gap: "10px",
                  alignItems: isMobile ? "flex-start" : "center"
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
          <button
            type="button"
            onClick={() => setScreen("home")}
            style={{
              padding: "12px 18px",
              borderRadius: "12px",
              border: `1px solid ${colors.gold}`,
              background: "white",
              color: colors.navy,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Exit TV Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div style={styles.shell}>
        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${colors.navy} 0%, #2448d8 100%)`,
            color: "white",
            position: "relative",
            overflow: "hidden",
            marginBottom: "16px",
            border: `1px solid ${colors.gold}`
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row",
              gap: "14px"
            }}
          >
            <div
              style={{
                width: isMobile ? "64px" : "74px",
                height: isMobile ? "64px" : "74px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px"
              }}
            >
              <img
                src={CREST_URL}
                alt="Portlaoise Golf Club crest"
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1.8px",
                  textTransform: "uppercase",
                  opacity: 0.92
                }}
              >
                Portlaoise Golf Club
              </div>
              <h1 style={{ ...styles.title, color: "white", marginTop: "6px" }}>
                Live Interclub Web App
              </h1>
              <p style={{ color: "rgba(255,255,255,0.95)", marginTop: "8px", marginBottom: 0 }}>
                Best of luck to all Portlaoise teams, players and managers. Thank you to all our supporters. Captains Betty and Tiernan, and President Eddie.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            padding: "0",
            overflow: "hidden",
            borderColor: colors.gold,
            background: "#fff8e7",
            marginBottom: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", minHeight: "48px" }}>
            <div
              style={{
                background: colors.navy,
                color: "white",
                fontWeight: 700,
                padding: "14px 16px",
                flexShrink: 0
              }}
            >
              LIVE
            </div>
            <div style={{ overflow: "hidden", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  width: "max-content",
                  animation: "tickerScroll 28s linear infinite"
                }}
              >
                {[...fixtures, ...fixtures].map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    style={{
                      padding: "0 24px",
                      lineHeight: "48px",
                      whiteSpace: "nowrap",
                      fontWeight: 700,
                      color: colors.navy
                    }}
                  >
                    {item.teamName} vs {item.opposition}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "10px",
            marginBottom: "16px"
          }}
        >
          <button style={{ ...styles.button, ...(screen === "home" ? styles.activeChip : {}) }} onClick={() => setScreen("home")}>
            Home
          </button>
          <button style={{ ...styles.button, ...(screen === "spectator" ? styles.activeChip : {}) }} onClick={() => setScreen("spectator")}>
            Spectator
          </button>
          <button style={{ ...styles.button, ...(screen === "captain" ? styles.activeChip : {}) }} onClick={() => setScreen("captain")}>
            Captain
          </button>
          <button style={{ ...styles.button, ...(screen === "tv" ? styles.activeChip : {}) }} onClick={() => setScreen("tv")}>
            TV Mode
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
          <div style={{ ...styles.card, marginBottom: "16px", borderColor: "#fecaca", color: "#991b1b" }}>
            {error}
          </div>
        ) : null}

        {screen === "home" ? (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "12px",
                marginBottom: "16px"
              }}
            >
              {fixtures.map((item) => (
                <HomeFixtureCard
                  key={item.id}
                  fixture={item}
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
              <h2 style={{ color: colors.navy, marginTop: 0 }}>{fixture.teamName}</h2>
              <div style={{ marginBottom: "14px", color: "#475569" }}>
                {fixture.ourClub} vs {fixture.opposition}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px"
                }}
              >
                <StatCard label="Official Score" value={`${totals.us}-${totals.them}`} />
                <StatCard label="Live Matches" value={totals.live} />
                <StatCard label="Fixture Matches" value={matches.length} />
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                {matches.map((match, index) => (
                  <div
                    key={match.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: colors.navy }}>
                        Match {index + 1}
                      </div>
                      <div style={{ fontSize: "14px", color: "#475569" }}>
                        {match.ourPlayers || "TBC"}
                      </div>
                      <div style={{ fontSize: "14px", color: "#475569" }}>
                        vs {match.theirPlayers || "TBC"}
                      </div>
                    </div>
                    <span style={badgeStyle(match)}>{liveStatus(match)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : screen === "spectator" ? (
          <div>
            <div style={{ ...styles.card, marginBottom: "16px", border: `1px solid ${colors.gold}` }}>
              <h2 style={{ color: colors.navy, marginTop: 0 }}>
                {fixture.ourClub} vs {fixture.opposition}
              </h2>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ ...styles.label, display: "block", marginBottom: "6px" }}>
                  Switch Fixture
                </label>
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
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px"
                }}
              >
                <StatCard label="Official Score" value={`${totals.us}-${totals.them}`} />
                <StatCard label="Live Overall" value={`${totals.us}-${totals.them}`} />
              </div>

              {matches.map((match, index) => (
                <div
                  key={match.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "14px",
                    marginBottom: "10px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: "space-between",
                      gap: "10px",
                      alignItems: isMobile ? "flex-start" : "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                        Match {index + 1}
                      </div>
                      <div style={{ fontSize: "14px", color: "#475569" }}>
                        {match.ourPlayers || "TBC"}
                      </div>
                      <div style={{ fontSize: "14px", color: "#475569" }}>
                        vs {match.theirPlayers || "TBC"}
                      </div>
                    </div>
                    <span style={badgeStyle(match)}>{liveStatus(match)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !isCaptain ? (
          <div style={{ ...styles.card, marginBottom: "16px", border: `1px solid ${colors.gold}` }}>
            <h3 style={{ marginTop: 0, color: colors.navy }}>Captain Login</h3>
            <form onSubmit={signInCaptain}>
              <div style={styles.inputWrap}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
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
              <button style={styles.primaryButton}>
                {authLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div style={{ ...styles.card, marginBottom: "16px", border: `1px solid ${colors.gold}` }}>
              <h3 style={{ marginTop: 0, color: colors.navy }}>Create New Fixture</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr auto",
                  gap: "12px"
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
                    onChange={(e) => setNewFixtureOpposition(e.target.value)}
                    placeholder="Opposition name"
                  />
                </div>

                <div style={{ display: "flex", alignItems: "end" }}>
                  <button type="button" style={{ ...styles.primaryButton, width: "100%" }} onClick={createFixture}>
                    Create Fixture
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "320px 1fr",
                gap: "16px"
              }}
            >
              <div>
                <div style={{ ...styles.card, marginBottom: "16px", border: `1px solid ${colors.gold}` }}>
                  <h3 style={{ marginTop: 0, color: colors.navy }}>Fixtures</h3>
                  {fixtures.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: activeFixtureId === item.id ? `2px solid ${colors.gold}` : "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "12px",
                        marginBottom: "10px",
                        background: activeFixtureId === item.id ? "#fffdf7" : "white"
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          border: "none",
                          background: "transparent",
                          textAlign: "left",
                          padding: 0,
                          cursor: "pointer",
                          width: "100%"
                        }}
                        onClick={() => {
                          setActiveFixtureId(item.id);
                          setSelectedMatchId("");
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{item.teamName}</div>
                        <div style={{ fontSize: "14px", color: "#475569" }}>vs {item.opposition}</div>
                        <div style={{ fontSize: "14px", color: "#475569" }}>{item.date || "No date set"}</div>
                      </button>
                    </div>
                  ))}

                  <button type="button" style={{ ...styles.dangerButton, width: "100%" }} onClick={deleteFixture}>
                    Delete Fixture
                  </button>
                </div>

                <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
                  <h3 style={{ marginTop: 0, color: colors.navy }}>Match List</h3>
                  <button type="button" style={{ ...styles.primaryButton, width: "100%", marginBottom: "12px" }} onClick={addMatch}>
                    Add Match
                  </button>

                  {matches.map((match, index) => (
                    <div
                      key={match.id}
                      style={{
                        border: selectedMatch?.id === match.id ? `2px solid ${colors.gold}` : "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "12px",
                        marginBottom: "10px",
                        background: selectedMatch?.id === match.id ? "#fffdf7" : "white"
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedMatchId(match.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          textAlign: "left",
                          padding: 0,
                          cursor: "pointer",
                          width: "100%"
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>Match {index + 1}</div>
                        <div style={{ fontSize: "14px", color: "#475569" }}>
                          {match.ourPlayers || "TBC"} vs {match.theirPlayers || "TBC"}
                        </div>
                        <div style={{ marginTop: "6px" }}>
                          <span style={badgeStyle(match)}>{liveStatus(match)}</span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ ...styles.card, border: `1px solid ${colors.gold}` }}>
                  <h3 style={{ marginTop: 0, color: colors.navy }}>Edit Selected Match</h3>

                  {selectedMatch ? (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                          gap: "12px"
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
                            onBlur={(e) => saveMatchField(selectedMatch.id, "ourPlayers", e.target.value)}
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
                            onBlur={(e) => saveMatchField(selectedMatch.id, "theirPlayers", e.target.value)}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                          gap: "10px",
                          marginBottom: "12px"
                        }}
                      >
                        <button type="button" style={styles.softButton} onClick={() => saveMatchField(selectedMatch.id, "leader", "Our team")}>
                          Our Team Up
                        </button>
                        <button type="button" style={styles.button} onClick={() => saveMatchField(selectedMatch.id, "leader", "All Square")}>
                          All Square
                        </button>
                        <button type="button" style={styles.softButton} onClick={() => saveMatchField(selectedMatch.id, "leader", "Their team")}>
                          Their Team Up
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                          gap: "12px",
                          marginBottom: "12px"
                        }}
                      >
                        <div style={styles.inputWrap}>
                          <label style={styles.label}>Status</label>
                          <select
                            style={styles.select}
                            value={selectedMatch.status}
                            onChange={(e) => saveMatchField(selectedMatch.id, "status", e.target.value)}
                          >
                            <option>Not Started</option>
                            <option>In Progress</option>
                            <option>Finished</option>
                          </select>
                        </div>

                        <div style={styles.inputWrap}>
                          <label style={styles.label}>Margin</label>
                          <input
                            style={styles.input}
                            type="number"
                            value={selectedMatch.margin || 0}
                            onChange={(e) =>
                              saveMatchField(selectedMatch.id, "margin", Number(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>

                      <div style={styles.inputWrap}>
                        <label style={styles.label}>Current Hole</label>
                        <input
                          style={styles.input}
                          type="number"
                          value={selectedMatch.currentHole || 1}
                          onChange={(e) =>
                            saveMatchField(selectedMatch.id, "currentHole", Number(e.target.value) || 1)
                          }
                        />
                      </div>

                      <div style={styles.inputWrap}>
                        <label style={styles.label}>Final Result</label>
                        <select
                          style={styles.select}
                          value={selectedMatch.finishText || ""}
                          onChange={(e) => saveMatchField(selectedMatch.id, "finishText", e.target.value)}
                        >
                          <option value="">Select a result</option>
                          {STANDARD_RESULTS.map((result) => (
                            <option key={result} value={result}>
                              {result}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        style={{ ...styles.dangerButton, marginTop: "12px" }}
                        onClick={() => deleteMatch(selectedMatch.id)}
                      >
                        Delete Match
                      </button>
                    </>
                  ) : (
                    <div>No match selected.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Analytics />
    </div>
  );
}
