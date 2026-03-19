import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function AdminPanel({ setIsAdmin, setAdminAuth }) {
  const [logs, setLogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState(null);
  const [stats, setStats] = useState({ total_chats: 0, total_faqs: 0 });
  const [chartData, setChartData] = useState([]);

  const adminHeader = {
    headers: { admin: "true" }
  };

  useEffect(() => {
    fetchLogs();
    fetchFaqs();
    fetchStats();
  }, []);

const fetchLogs = async () => {
  try {
    const res = await axios.get("http://localhost:5000/admin/logs", adminHeader);
    setLogs(res.data);

    // ========================
    // 📊 CHART LOGIC (ADDED)
    // ========================
    const grouped = {};

    res.data.forEach((log) => {
      const rawTime = log.timestamp?.$date || log.timestamp;

      const dateObj = new Date(rawTime);
      if (isNaN(dateObj)) return;

      const key = dateObj.toISOString().split("T")[0];

      if (!grouped[key]) {
        grouped[key] = 0;
      }

      grouped[key]++;
    });

    const formatted = Object.keys(grouped)
      .map((key) => {
        const d = new Date(key);

        return {
          date: d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
          }),
          fullDate: d,
          messages: grouped[key],
        };
      })
      .sort((a, b) => a.fullDate - b.fullDate);

    setChartData(formatted);

  } catch (err) {
    console.error("Logs error", err);
  }
};

  const fetchFaqs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/faqs", adminHeader);
      setFaqs(res.data);
    } catch (err) {
      console.error("FAQ error", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/stats", adminHeader);
      setStats(res.data);
    } catch (err) {
      console.error("Stats error", err);
    }
  };

  const handleSubmit = async () => {
    if (!question || !answer) return;

    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/admin/update-faq/${editId}`,
          { question, answer },
          adminHeader
        );
      } else {
        await axios.post(
          "http://localhost:5000/admin/add-faq",
          { question, answer },
          adminHeader
        );
      }

      setQuestion("");
      setAnswer("");
      setEditId(null);
      fetchFaqs();
      fetchStats();
    } catch (err) {
      console.error("Submit error", err);
    }
  };

  const deleteFaq = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/admin/delete-faq/${id}`,
        adminHeader
      );
      fetchFaqs();
      fetchStats();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const editFaq = (faq) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditId(faq._id);
  };

  // ========================
  // 📥 EXPORT CSV (ADDED)
  // ========================
  const exportCSV = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/admin/export-csv",
        {
          ...adminHeader,
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "chat_logs.csv");
      document.body.appendChild(link);
      link.click();

      link.remove();
    } catch (err) {
      console.error("Export error", err);
      alert("Failed to export CSV");
    }
  };

  return (
    <div style={{ ...styles.container, position: "relative", paddingTop: "70px" }}>

      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => {
          setIsAdmin(false);
          setAdminAuth(false);
        }}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 16px",
          borderRadius: "20px",
          border: "none",
          background: "#d90429",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "600",
          zIndex: 1000,
        }}
      >
        ← Back
      </button>

      <h2 style={styles.title}>Admin Panel</h2>

      {/* STATS */}
      <div style={styles.statsRow}>
        <div style={styles.glassCard}>
          <h4 style={styles.heading}>Total Chats</h4>
          <p style={styles.statText}>{stats.total_chats}</p>
        </div>

        <div style={styles.glassCard}>
          <h4 style={styles.heading}>Total FAQs</h4>
          <p style={styles.statText}>{stats.total_faqs}</p>
        </div>
      </div>

      {/* 📊 CHART */}
      <div style={styles.glassCard}>
        <h3 style={styles.heading}>Chat Activity</h3>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#d90429"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📥 EXPORT BUTTON */}
      <button style={styles.primaryBtn} onClick={exportCSV}>
        Download Chat Logs (CSV)
      </button>

      {/* FORM */}
      <div style={styles.glassCard}>
        <h3 style={styles.heading}>{editId ? "Edit FAQ" : "Add FAQ"}</h3>

        <input
          style={styles.input}
          placeholder="Enter question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Enter answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button style={styles.primaryBtn} onClick={handleSubmit}>
          {editId ? "Update" : "Add"}
        </button>
      </div>

      {/* FAQ LIST */}
      <div style={styles.glassCard}>
        <h3 style={styles.heading}>FAQs</h3>

        {faqs.map((f) => (
          <div key={f._id} style={styles.item}>
            <div>
              <b style={styles.question}>{f.question}</b>
              <p style={styles.answer}>{f.answer}</p>
            </div>

            <div>
              <button style={styles.editBtn} onClick={() => editFaq(f)}>
                Edit
              </button>

              <button style={styles.deleteBtn} onClick={() => deleteFaq(f._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* LOGS */}
      <div style={styles.glassCard}>
        <h3 style={styles.heading}>Chat Logs</h3>

        {logs.map((log, i) => (
          <div key={i} style={styles.item}>
            <p style={styles.text}><b>User:</b> {log.user_message}</p>
            <p style={styles.text}><b>Bot:</b> {log.bot_response}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default AdminPanel;

const styles = {
  container: {
    padding: "30px",
    minHeight: "100vh",
    fontFamily: "Arial",
  },

  title: {
    marginBottom: "25px",
    color: "#111",
    fontWeight: "bold",
  },

  statsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
  },

  glassCard: {
    flex: 1,
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },

  heading: {
    color: "#111",
    fontWeight: "600",
    marginBottom: "10px",
  },

  statText: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#222",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    color: "#111",
    fontWeight: "500",
    background: "rgba(255,255,255,0.9)",
  },

  primaryBtn: {
    padding: "10px 18px",
    background: "#d90429",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    padding: "12px 0",
  },

  question: {
    color: "#111",
    fontWeight: "600",
  },

  answer: {
    color: "#444",
  },

  text: {
    color: "#222",
  },

  editBtn: {
    marginRight: "10px",
    background: "rgba(4,110,217,0.15)",
    border: "1px solid rgba(4,110,217,0.3)",
    padding: "6px 12px",
    borderRadius: "8px",
    color: "#046ed9",
    cursor: "pointer",
    fontWeight: "500",
  },

  deleteBtn: {
    background: "rgba(217,4,41,0.15)",
    border: "1px solid rgba(217,4,41,0.3)",
    padding: "6px 12px",
    borderRadius: "8px",
    color: "#d90429",
    cursor: "pointer",
    fontWeight: "500",
  },
};