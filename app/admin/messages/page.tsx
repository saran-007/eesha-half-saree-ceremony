"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MessageSquare,
  Save,
  Send,
  Loader2,
  ArrowLeft,
  Eye,
  Edit3,
  Info,
  Check,
} from "lucide-react";

interface Template {
  id: string;
  email_subject: string;
  email_body: string;
  whatsapp_text: string;
  updated_at: string;
}

const LABELS: Record<string, { title: string; description: string; audience: string }> = {
  rsvp_nudge: {
    title: "RSVP Nudge",
    description: "Sent to invited guests who haven't RSVP'd yet",
    audience: "Pending RSVP",
  },
  event_reminder: {
    title: "Event Reminder",
    description: "Sent to guests who RSVP'd Yes before the event",
    audience: "Confirmed guests",
  },
  thank_you: {
    title: "Thank You",
    description: "Sent to confirmed guests after the event",
    audience: "Confirmed guests",
  },
};

const PLACEHOLDERS = [
  { key: "{{first_name}}", description: "Guest's first name" },
  { key: "{{event_title}}", description: "Eesha Half Saree Ceremony" },
  { key: "{{event_date}}", description: "Sunday, 29th March 2026" },
  { key: "{{event_time}}", description: "10:30 AM - 2 PM" },
  { key: "{{venue}}", description: "Celebrations Event Center" },
  { key: "{{address}}", description: "11840 Hero Way W Suite #204..." },
  { key: "{{rsvp_link}}", description: "Guest's unique RSVP link" },
  { key: "{{maps_link}}", description: "Google Maps directions" },
  { key: "{{event_details}}", description: "Full event details block" },
];

export default function AdminMessages() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testMobile, setTestMobile] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/templates");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        setMessage("Template saved successfully");
        await fetchTemplates();
        setTimeout(() => setMessage(""), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!editing) return;
    setTesting(true);
    try {
      const res = await fetch("/api/admin/templates/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editing,
          test_email: testEmail || undefined,
          test_mobile: testMobile || undefined,
        }),
      });
      const data = await res.json();
      const parts = [];
      if (data.results?.email) parts.push(`Email: ${data.results.email}`);
      if (data.results?.whatsapp) parts.push(`WhatsApp: ${data.results.whatsapp}`);
      setMessage(parts.join(", ") || "Test sent");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setTesting(false);
    }
  }

  function previewBody(body: string): string {
    return body
      .replace(/\{\{first_name\}\}/g, "Guest Name")
      .replace(/\{\{event_title\}\}/g, "Eesha Half Saree Ceremony")
      .replace(/\{\{event_date\}\}/g, "Sunday, 29th March 2026")
      .replace(/\{\{event_time\}\}/g, "10:30 AM - 2 PM")
      .replace(/\{\{venue\}\}/g, "Celebrations Event Center")
      .replace(/\{\{address\}\}/g, "11840 Hero Way W Suite #204, Leander, TX 78641")
      .replace(/\{\{rsvp_link\}\}/g, "https://www.eesha.info/rsvp/sample")
      .replace(/\{\{maps_link\}\}/g, "https://maps.google.com")
      .replace(/\{\{event_details\}\}/g, "Date: Sunday, 29th March 2026\nTime: 10:30 AM - 2 PM\nVenue: Celebrations Event Center");
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => (editing ? setEditing(null) : router.push("/admin/dashboard"))}
            className="text-cream-200/40 hover:text-cream-200/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-3xl sm:text-4xl text-gold-400">
            {editing ? `Edit: ${LABELS[editing.id]?.title}` : "Message Templates"}
          </h1>
        </div>

        {message && (
          <div className="mb-6 p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg text-gold-400 text-sm font-sans flex items-center gap-2">
            <Check className="w-4 h-4" />
            {message}
          </div>
        )}

        {!editing ? (
          <div className="grid gap-4">
            {templates.map((t) => {
              const label = LABELS[t.id];
              return (
                <div
                  key={t.id}
                  className="bg-navy-900/60 rounded-xl border border-gold-500/15 p-6 hover:border-gold-500/30 transition-all cursor-pointer"
                  onClick={() => setEditing({ ...t })}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-gold-400 mb-1">
                        {label?.title || t.id}
                      </h3>
                      <p className="text-cream-200/50 text-sm font-sans mb-2">
                        {label?.description}
                      </p>
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-sans font-medium border bg-navy-800 border-cream-200/10 text-cream-200/60">
                        Audience: {label?.audience}
                      </span>
                    </div>
                    <Edit3 className="w-5 h-5 text-gold-400/40" />
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-navy-800/40 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-300 font-sans">Email Subject</span>
                      </div>
                      <p className="text-cream-50 text-sm font-sans truncate">
                        {t.email_subject}
                      </p>
                    </div>
                    <div className="bg-navy-800/40 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-300 font-sans">WhatsApp</span>
                      </div>
                      <p className="text-cream-50 text-sm font-sans truncate">
                        {t.whatsapp_text.split("\n")[0]}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {templates.length === 0 && (
              <div className="text-center py-12 text-cream-200/40 font-sans">
                No templates found. Run the schema SQL to seed defaults.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Placeholders Guide */}
            <details className="bg-navy-900/40 rounded-xl border border-gold-500/10 p-4">
              <summary className="flex items-center gap-2 cursor-pointer text-gold-400 font-sans text-sm font-medium">
                <Info className="w-4 h-4" />
                Available Placeholders
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PLACEHOLDERS.map((p) => (
                  <div key={p.key} className="flex items-center gap-2 text-xs font-sans">
                    <code className="bg-navy-800 px-2 py-1 rounded text-gold-400">
                      {p.key}
                    </code>
                    <span className="text-cream-200/50">{p.description}</span>
                  </div>
                ))}
              </div>
            </details>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans transition-all ${
                  !showPreview
                    ? "bg-gold-500 text-navy-950 font-semibold"
                    : "bg-navy-800 text-cream-200/60"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans transition-all ${
                  showPreview
                    ? "bg-gold-500 text-navy-950 font-semibold"
                    : "bg-navy-800 text-cream-200/60"
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>

            {!showPreview ? (
              <div className="space-y-4">
                {/* Email Subject */}
                <div>
                  <label className="block text-cream-200/60 text-sm font-sans uppercase tracking-wider mb-2">
                    <Mail className="w-3 h-3 inline mr-1" /> Email Subject
                  </label>
                  <input
                    value={editing.email_subject}
                    onChange={(e) =>
                      setEditing({ ...editing, email_subject: e.target.value })
                    }
                    className="w-full bg-navy-800 border border-gold-500/20 rounded-lg px-4 py-3 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-cream-200/60 text-sm font-sans uppercase tracking-wider mb-2">
                    <Mail className="w-3 h-3 inline mr-1" /> Email Body
                  </label>
                  <textarea
                    value={editing.email_body}
                    onChange={(e) =>
                      setEditing({ ...editing, email_body: e.target.value })
                    }
                    rows={8}
                    className="w-full bg-navy-800 border border-gold-500/20 rounded-lg px-4 py-3 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 transition-colors resize-y"
                  />
                </div>

                {/* WhatsApp Text */}
                <div>
                  <label className="block text-cream-200/60 text-sm font-sans uppercase tracking-wider mb-2">
                    <MessageSquare className="w-3 h-3 inline mr-1" /> WhatsApp Message
                  </label>
                  <textarea
                    value={editing.whatsapp_text}
                    onChange={(e) =>
                      setEditing({ ...editing, whatsapp_text: e.target.value })
                    }
                    rows={8}
                    className="w-full bg-navy-800 border border-gold-500/20 rounded-lg px-4 py-3 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 transition-colors resize-y"
                  />
                  <p className="text-cream-200/30 text-xs font-sans mt-1">
                    Use *bold* for WhatsApp bold formatting
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Email Preview */}
                <div>
                  <h4 className="text-cream-200/60 text-sm font-sans uppercase tracking-wider mb-3">
                    Email Preview
                  </h4>
                  <div className="bg-navy-800/40 rounded-xl border border-gold-500/10 p-4">
                    <p className="text-cream-50 font-sans font-medium mb-3 border-b border-gold-500/10 pb-3">
                      Subject: {previewBody(editing.email_subject)}
                    </p>
                    <div className="bg-navy-900 rounded-lg p-6 text-cream-200 font-sans text-sm whitespace-pre-wrap leading-relaxed">
                      {previewBody(editing.email_body)}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Preview */}
                <div>
                  <h4 className="text-cream-200/60 text-sm font-sans uppercase tracking-wider mb-3">
                    WhatsApp Preview
                  </h4>
                  <div className="max-w-sm mx-auto bg-[#0b141a] rounded-xl p-4">
                    <div className="bg-[#005c4b] rounded-lg px-3 py-2 text-white text-sm font-sans whitespace-pre-wrap leading-relaxed">
                      {previewBody(editing.whatsapp_text)
                        .replace(/\*(.*?)\*/g, "**$1**")}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gold-500/10">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-lg font-sans font-semibold text-sm transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Template
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <input
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Test email"
                  className="bg-navy-800 border border-gold-500/20 rounded-lg px-3 py-2 text-cream-50 font-sans text-sm placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 transition-colors w-40"
                />
                <input
                  value={testMobile}
                  onChange={(e) => setTestMobile(e.target.value)}
                  placeholder="Test mobile"
                  className="bg-navy-800 border border-gold-500/20 rounded-lg px-3 py-2 text-cream-50 font-sans text-sm placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 transition-colors w-40"
                />
                <button
                  onClick={handleTest}
                  disabled={testing || (!testEmail && !testMobile)}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-700 border border-cream-200/10 text-cream-200 rounded-lg font-sans text-sm transition-all disabled:opacity-40"
                >
                  {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
