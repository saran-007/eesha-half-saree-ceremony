"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Check,
  X,
  Clock,
  Mail,
  Eye,
  Upload,
  UserPlus,
  Send,
  Trash2,
  Loader2,
  LogOut,
  Leaf,
  Drumstick,
  Download,
  CheckSquare,
  Square,
} from "lucide-react";

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string | null;
  invite_token: string;
  invite_sent_at: string | null;
  invite_opened_at: string | null;
  rsvp_status: string;
  guest_count: number;
  veg_count: number;
  non_veg_count: number;
  rsvp_responded_at: string | null;
  wa_delivery_status: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/guests");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setGuests(data.guests || []);
    } catch {
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const filtered = guests.filter((g) => {
    if (filter === "all") return true;
    if (filter === "invited") return !!g.invite_sent_at;
    if (filter === "not_invited") return !g.invite_sent_at;
    if (filter === "opened") return !!g.invite_opened_at;
    return g.rsvp_status === filter;
  });

  const stats = {
    total: guests.length,
    invited: guests.filter((g) => g.invite_sent_at).length,
    opened: guests.filter((g) => g.invite_opened_at).length,
    accepted: guests.filter((g) => g.rsvp_status === "yes").length,
    declined: guests.filter((g) => g.rsvp_status === "no").length,
    pending: guests.filter((g) => g.rsvp_status === "pending").length,
    totalGuests: guests
      .filter((g) => g.rsvp_status === "yes")
      .reduce((sum, g) => sum + g.guest_count, 0),
    totalVeg: guests
      .filter((g) => g.rsvp_status === "yes")
      .reduce((sum, g) => sum + g.veg_count, 0),
    totalNonVeg: guests
      .filter((g) => g.rsvp_status === "yes")
      .reduce((sum, g) => sum + g.non_veg_count, 0),
  };

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((g) => g.id)));
    }
  }

  async function sendInvites() {
    if (selectedIds.size === 0) return;
    setSending(true);
    try {
      await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestIds: Array.from(selectedIds) }),
      });
      setSelectedIds(new Set());
      await fetchGuests();
    } finally {
      setSending(false);
    }
  }

  async function deleteGuest(id: string) {
    if (!confirm("Remove this guest?")) return;
    await fetch(`/api/admin/guests?id=${id}`, { method: "DELETE" });
    await fetchGuests();
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-navy-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl text-gold-400">
            Guest Management
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-cream-200/40 hover:text-cream-200/70 font-sans text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard icon={Users} label="Total" value={stats.total} color="gold" />
          <StatCard icon={Mail} label="Invited" value={stats.invited} color="blue" />
          <StatCard icon={Eye} label="Opened" value={stats.opened} color="teal" />
          <StatCard icon={Check} label="Accepted" value={stats.accepted} color="green" />
          <StatCard icon={X} label="Declined" value={stats.declined} color="rose" />
          <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
        </div>

        {/* Meal Counts */}
        {stats.totalGuests > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="bg-navy-900/60 rounded-xl border border-gold-500/20 p-4 text-center">
              <p className="text-cream-200/60 text-sm font-sans uppercase tracking-wider">
                Total Attending
              </p>
              <p className="text-3xl font-serif font-bold text-gold-400 mt-1">
                {stats.totalGuests}
              </p>
            </div>
            <div className="bg-navy-900/60 rounded-xl border border-green-600/20 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Leaf className="w-4 h-4 text-green-400" />
                <p className="text-green-300/60 text-sm font-sans uppercase tracking-wider">
                  Vegetarian
                </p>
              </div>
              <p className="text-3xl font-serif font-bold text-green-300 mt-1">
                {stats.totalVeg}
              </p>
            </div>
            <div className="bg-navy-900/60 rounded-xl border border-orange-600/20 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Drumstick className="w-4 h-4 text-orange-400" />
                <p className="text-orange-300/60 text-sm font-sans uppercase tracking-wider">
                  Non-Vegetarian
                </p>
              </div>
              <p className="text-3xl font-serif font-bold text-orange-300 mt-1">
                {stats.totalNonVeg}
              </p>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowCsvUpload(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/50 text-gold-400 rounded-lg font-sans text-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Guest
          </button>
          <button
            onClick={() => {
              setShowCsvUpload(!showCsvUpload);
              setShowAddForm(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/50 text-gold-400 rounded-lg font-sans text-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={sendInvites}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-lg font-sans text-sm font-semibold transition-all"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Invites ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => exportCsv(guests)}
            className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-700 border border-cream-200/10 text-cream-200 rounded-lg font-sans text-sm transition-all ml-auto"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Add Guest Form */}
        {showAddForm && (
          <AddGuestForm
            onAdded={() => {
              setShowAddForm(false);
              fetchGuests();
            }}
          />
        )}

        {/* CSV Upload */}
        {showCsvUpload && (
          <CsvUpload
            onUploaded={() => {
              setShowCsvUpload(false);
              fetchGuests();
            }}
          />
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "all", label: "All" },
            { key: "invited", label: "Invited" },
            { key: "not_invited", label: "Not Invited" },
            { key: "opened", label: "Opened" },
            { key: "yes", label: "Accepted" },
            { key: "no", label: "Declined" },
            { key: "pending", label: "Pending" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-sans transition-all ${
                filter === f.key
                  ? "bg-gold-500 text-navy-950 font-semibold"
                  : "bg-navy-800 text-cream-200/60 hover:text-cream-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Guest Table */}
        <div className="bg-navy-900/40 rounded-xl border border-gold-500/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-gold-500/10">
                  <th className="p-3">
                    <button onClick={toggleSelectAll}>
                      {selectedIds.size === filtered.length && filtered.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-gold-400" />
                      ) : (
                        <Square className="w-4 h-4 text-cream-200/30" />
                      )}
                    </button>
                  </th>
                  <th className="p-3 text-cream-200/60 font-medium">Name</th>
                  <th className="p-3 text-cream-200/60 font-medium hidden sm:table-cell">
                    Email
                  </th>
                  <th className="p-3 text-cream-200/60 font-medium hidden md:table-cell">
                    Mobile
                  </th>
                  <th className="p-3 text-cream-200/60 font-medium">Status</th>
                  <th className="p-3 text-cream-200/60 font-medium hidden sm:table-cell">
                    Invite
                  </th>
                  <th className="p-3 text-cream-200/60 font-medium hidden lg:table-cell">
                    Guests
                  </th>
                  <th className="p-3 text-cream-200/60 font-medium hidden lg:table-cell">
                    Diet
                  </th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((guest) => (
                  <tr
                    key={guest.id}
                    className="border-b border-gold-500/5 hover:bg-navy-800/30 transition-colors"
                  >
                    <td className="p-3">
                      <button onClick={() => toggleSelect(guest.id)}>
                        {selectedIds.has(guest.id) ? (
                          <CheckSquare className="w-4 h-4 text-gold-400" />
                        ) : (
                          <Square className="w-4 h-4 text-cream-200/30" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-cream-50 font-medium">
                      {guest.first_name} {guest.last_name}
                    </td>
                    <td className="p-3 text-cream-200/60 hidden sm:table-cell">
                      {guest.email || "-"}
                    </td>
                    <td className="p-3 text-cream-200/60 hidden md:table-cell">
                      {guest.mobile || "-"}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={guest.rsvp_status} />
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <InviteStatus guest={guest} />
                    </td>
                    <td className="p-3 text-cream-200 hidden lg:table-cell">
                      {guest.rsvp_status === "yes" ? guest.guest_count : "-"}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {guest.rsvp_status === "yes" ? (
                        <span className="text-xs">
                          <span className="text-green-300">
                            {guest.veg_count}V
                          </span>
                          {" / "}
                          <span className="text-orange-300">
                            {guest.non_veg_count}NV
                          </span>
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteGuest(guest.id)}
                        className="text-cream-200/20 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-cream-200/40 font-sans">
              No guests found
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    gold: "border-gold-500/20 text-gold-400",
    blue: "border-blue-500/20 text-blue-400",
    teal: "border-teal-500/20 text-teal-400",
    green: "border-green-500/20 text-green-400",
    rose: "border-rose-500/20 text-rose-400",
    amber: "border-amber-500/20 text-amber-400",
  };

  return (
    <div
      className={`bg-navy-900/60 rounded-xl border p-4 text-center ${colors[color]}`}
    >
      <Icon className="w-5 h-5 mx-auto mb-2 opacity-60" />
      <p className="text-2xl font-serif font-bold">{value}</p>
      <p className="text-xs font-sans uppercase tracking-wider opacity-60 mt-1">
        {label}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    yes: "bg-green-500/15 text-green-300 border-green-500/30",
    no: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  };

  const labels: Record<string, string> = {
    yes: "Accepted",
    no: "Declined",
    pending: "Pending",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-sans font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function InviteStatus({ guest }: { guest: Guest }) {
  const waStatus = guest.wa_delivery_status;
  const waLabel: Record<string, { text: string; color: string }> = {
    sent: { text: "WA Sent", color: "text-blue-300" },
    delivered: { text: "WA Delivered", color: "text-teal-300" },
    read: { text: "WA Read", color: "text-green-300" },
    failed: { text: "WA Failed", color: "text-rose-300" },
  };

  return (
    <div className="flex flex-col gap-1">
      {guest.invite_opened_at ? (
        <span className="text-teal-400 text-xs flex items-center gap-1">
          <Eye className="w-3 h-3" /> Email Opened
        </span>
      ) : guest.invite_sent_at ? (
        <span className="text-blue-400 text-xs flex items-center gap-1">
          <Mail className="w-3 h-3" /> Email Sent
        </span>
      ) : (
        <span className="text-cream-200/30 text-xs">Not sent</span>
      )}
      {waStatus && waStatus !== "none" && waLabel[waStatus] && (
        <span className={`${waLabel[waStatus].color} text-xs flex items-center gap-1`}>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.212l-.29-.175-3.027.793.807-2.95-.192-.304A8 8 0 1112 20z" />
          </svg>
          {waLabel[waStatus].text}
        </span>
      )}
    </div>
  );
}

function AddGuestForm({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.last_name) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: [form] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add guest");
        return;
      }
      if (data.errors?.length) {
        setError(data.errors.join(", "));
        return;
      }
      onAdded();
    } catch {
      setError("Failed to add guest. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-navy-900/60 rounded-xl border border-gold-500/20 p-6 mb-6 animate-fade-in-up">
      <h3 className="font-serif text-xl text-gold-400 mb-4">Add Guest</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          placeholder="First Name *"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          required
          className="bg-navy-800 border border-gold-500/20 rounded-lg px-4 py-2.5 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 transition-colors"
        />
        <input
          placeholder="Last Name *"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          required
          className="bg-navy-800 border border-gold-500/20 rounded-lg px-4 py-2.5 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 transition-colors"
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-navy-800 border border-gold-500/20 rounded-lg px-4 py-2.5 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 transition-colors"
        />
        <input
          placeholder="Mobile"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          className="bg-navy-800 border border-gold-500/20 rounded-lg px-4 py-2.5 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 transition-colors"
        />
        {error && (
          <div className="sm:col-span-2">
            <p className="text-rose-400 text-sm font-sans">{error}</p>
          </div>
        )}
        <div className="sm:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-lg font-sans font-semibold text-sm transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Guest"}
          </button>
          <button
            type="button"
            onClick={onAdded}
            className="px-6 py-2.5 text-cream-200/60 hover:text-cream-200 font-sans text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function CsvUpload({ onUploaded }: { onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<
    { first_name: string; last_name: string; email: string; mobile: string }[]
  >([]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) return;

      const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
      const fnIdx = headers.findIndex((h) =>
        h.includes("first") || h === "firstname"
      );
      const lnIdx = headers.findIndex((h) =>
        h.includes("last") || h === "lastname"
      );
      const emIdx = headers.findIndex((h) => h.includes("email"));
      const moIdx = headers.findIndex((h) =>
        h.includes("mobile") || h.includes("phone")
      );

      const parsed = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        return {
          first_name: cols[fnIdx] || "",
          last_name: cols[lnIdx] || "",
          email: cols[emIdx] || "",
          mobile: cols[moIdx] || "",
        };
      }).filter((g) => g.first_name && g.last_name);

      setPreview(parsed);
    };
    reader.readAsText(file);
  }

  async function handleUpload() {
    if (preview.length === 0) return;
    setUploading(true);
    try {
      await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: preview }),
      });
      onUploaded();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-navy-900/60 rounded-xl border border-gold-500/20 p-6 mb-6 animate-fade-in-up">
      <h3 className="font-serif text-xl text-gold-400 mb-2">Upload CSV</h3>
      <p className="text-cream-200/60 text-sm font-sans mb-4">
        CSV should have columns: first_name, last_name, email, mobile
      </p>
      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="block w-full text-sm text-cream-200/60 font-sans file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gold-500/30 file:text-sm file:font-sans file:font-medium file:bg-navy-800 file:text-gold-400 hover:file:bg-navy-700 file:transition-colors file:cursor-pointer"
      />

      {preview.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-cream-50 font-sans text-sm">
            {preview.length} guest{preview.length > 1 ? "s" : ""} found:
          </p>
          <div className="max-h-40 overflow-y-auto bg-navy-800/40 rounded-lg p-3 text-xs font-sans text-cream-200/70 space-y-1">
            {preview.map((g, i) => (
              <div key={i}>
                {g.first_name} {g.last_name}
                {g.email ? ` (${g.email})` : ""}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-lg font-sans font-semibold text-sm transition-all"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import {preview.length} Guests
                </>
              )}
            </button>
            <button
              onClick={onUploaded}
              className="px-6 py-2.5 text-cream-200/60 hover:text-cream-200 font-sans text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function exportCsv(guests: Guest[]) {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Mobile",
    "RSVP Status",
    "Guest Count",
    "Vegetarian",
    "Non-Vegetarian",
    "Invite Sent",
    "Invite Opened",
    "RSVP Date",
  ];

  const rows = guests.map((g) => [
    g.first_name,
    g.last_name,
    g.email || "",
    g.mobile || "",
    g.rsvp_status,
    g.rsvp_status === "yes" ? g.guest_count : 0,
    g.rsvp_status === "yes" ? g.veg_count : 0,
    g.rsvp_status === "yes" ? g.non_veg_count : 0,
    g.invite_sent_at ? new Date(g.invite_sent_at).toLocaleDateString() : "",
    g.invite_opened_at ? new Date(g.invite_opened_at).toLocaleDateString() : "",
    g.rsvp_responded_at
      ? new Date(g.rsvp_responded_at).toLocaleDateString()
      : "",
  ]);

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "eesha-ceremony-guests.csv";
  a.click();
  URL.revokeObjectURL(url);
}
