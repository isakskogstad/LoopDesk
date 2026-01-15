"use client";

import { useState, useEffect } from "react";
import { X, MessageSquare, BarChart3, Inbox, Mail } from "lucide-react";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = "slack" | "analytics" | "inbox";

const slackMessages = [
  {
    id: "1",
    avatar: "anna",
    author: "Anna Karlsson",
    initials: "AK",
    time: "14:32",
    text: "Northvolt-konkursen bekraftad! @alla vi behover snabbt fa ut en push pa detta",
  },
  {
    id: "2",
    avatar: "erik",
    author: "Erik Lindqvist",
    initials: "EL",
    time: "14:35",
    text: "Jag tar kontakt med DN for kommentar. Har en kalla dar.",
  },
  {
    id: "3",
    avatar: "lisa",
    author: "Lisa Svensson",
    initials: "LS",
    time: "14:38",
    text: "Har uppdaterat tidslinjen pa Northvolt-sidan. @Anna kan du granska?",
  },
  {
    id: "4",
    avatar: "johan",
    author: "Johan Andersson",
    initials: "JA",
    time: "14:42",
    text: "Heads up: Wallenberg har postat pa LinkedIn om detta.",
  },
];

const inboxMessages = [
  {
    id: "1",
    sender: "Maria Johansson",
    time: "14:45",
    subject: "Problem med inloggning",
    preview: "Hej! Jag kan inte logga in pa mitt konto sedan igar...",
    tag: "urgent",
    unread: true,
    quickReplies: [
      { text: "Vi kollar pa det!", message: "Vi undersoker detta och aterkommer inom 1 timme!" },
      { text: "Rensa cache", message: "Prova att rensa webblasarens cache och cookies." },
    ],
  },
  {
    id: "2",
    sender: "Peter Eriksson",
    time: "13:22",
    subject: "Fakturafr\u00e5ga - foretagskonto",
    preview: "Vi har inte fatt faktura for december annu...",
    tag: "billing",
    unread: true,
    quickReplies: [
      { text: "Skickar ny faktura", message: "Tack! Vi skickar en ny faktura inom 24 timmar." },
      { text: "Bekrafta e-post", message: "Kan du bekrafta vilken e-post fakturan ska skickas till?" },
    ],
  },
  {
    id: "3",
    sender: "Karin Nilsson",
    time: "11:08",
    subject: "Forslag pa ny funktion",
    preview: "Skulle det vara mojligt att lagga till mojligheten att exportera...",
    tag: "feedback",
    unread: true,
    quickReplies: [
      { text: "Tack for feedback!", message: "Tack for forslaget! Vi har noterat det och skickar det till produktteamet." },
      { text: "Finns redan!", message: "Det finns redan! Ga till Installningar - Export." },
    ],
  },
  {
    id: "4",
    sender: "Anders Berg",
    time: "Igar",
    subject: "Tack for snabb hjalp!",
    preview: "Ville bara tacka for den snabba supporten igar...",
    unread: false,
  },
];

export function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("slack");
  const [visitorCount, setVisitorCount] = useState(847);
  const [sentReplies, setSentReplies] = useState<Set<string>>(new Set());

  // Live visitor count update
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount((prev) => {
        const change = Math.floor(Math.random() * 21) - 10;
        return Math.max(500, Math.min(1200, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickReply = (messageId: string, replyIndex: number) => {
    setSentReplies((prev) => new Set(prev).add(`${messageId}-${replyIndex}`));
  };

  return (
    <aside className={`right-panel ${isOpen ? "open" : ""}`}>
      <div className="panel-header">
        <span className="panel-title">Redaktionspanel</span>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="panel-tabs p-4">
        <button
          className={`panel-tab ${activeTab === "slack" ? "active" : ""}`}
          onClick={() => setActiveTab("slack")}
        >
          <MessageSquare size={14} />
          Chatt
          <span className="tab-badge">4</span>
        </button>
        <button
          className={`panel-tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <BarChart3 size={14} />
          Live
        </button>
        <button
          className={`panel-tab ${activeTab === "inbox" ? "active" : ""}`}
          onClick={() => setActiveTab("inbox")}
        >
          <Inbox size={14} />
          Mail
          <span className="tab-badge">3</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Slack Section */}
        {activeTab === "slack" && (
          <>
            <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border-subtle">
              <SlackLogo />
              <div className="flex-1">
                <div className="font-semibold text-sm text-foreground"># redaktionen</div>
                <div className="text-xs text-muted-foreground">4 online</div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border-subtle overflow-hidden">
              {slackMessages.map((msg) => (
                <div key={msg.id} className="slack-message">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`slack-avatar ${msg.avatar}`}>{msg.initials}</div>
                    <span className="font-semibold text-sm text-foreground">{msg.author}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <div className="text-sm text-secondary-foreground leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-card rounded-lg border border-border-subtle">
              <textarea
                className="w-full p-3 bg-muted border border-border rounded-md text-sm text-foreground resize-none focus:outline-none focus:border-[var(--slack-purple)]"
                rows={2}
                placeholder="Skriv ett meddelande till #redaktionen..."
              />
            </div>
          </>
        )}

        {/* Analytics Section */}
        {activeTab === "analytics" && (
          <div className="bg-card rounded-lg border border-border-subtle p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                impactloop.se
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-500">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="analytics-big-number">{visitorCount}</div>
            <div className="text-sm text-muted-foreground mb-4">besokare just nu</div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-md">
                <div className="text-lg font-semibold text-green-500">+23%</div>
                <div className="text-xs text-muted-foreground">vs igar</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-lg font-semibold text-foreground">12,4k</div>
                <div className="text-xs text-muted-foreground">idag totalt</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-lg font-semibold text-foreground">3:42</div>
                <div className="text-xs text-muted-foreground">snitt session</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-lg font-semibold text-green-500">68%</div>
                <div className="text-xs text-muted-foreground">bounce rate</div>
              </div>
            </div>

            <div className="analytics-chart">
              {[45, 32, 58, 42, 75, 63, 88, 72, 95].map((h, i) => (
                <div
                  key={i}
                  className={`chart-bar ${i === 8 ? "current" : ""}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Inbox Section */}
        {activeTab === "inbox" && (
          <>
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border-subtle">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Mail size={18} className="text-accent" />
                Kundtjanst
              </div>
              <span className="px-2 py-1 bg-accent text-white text-xs font-bold rounded">
                3 nya
              </span>
            </div>

            <div className="bg-card rounded-lg border border-border-subtle overflow-hidden">
              {inboxMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`inbox-message ${msg.unread ? "unread" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`font-semibold text-sm ${msg.unread ? "text-accent" : "text-foreground"}`}>
                      {msg.sender}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {msg.time}
                    </span>
                  </div>
                  <div className="text-sm text-secondary-foreground mb-1">{msg.subject}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{msg.preview}</div>
                  {msg.tag && (
                    <span className={`inbox-tag ${msg.tag}`}>
                      {msg.tag === "urgent" ? "Bradskande" : msg.tag === "billing" ? "Fakturering" : "Feedback"}
                    </span>
                  )}
                  {msg.quickReplies && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {msg.quickReplies.map((reply, i) => {
                        const key = `${msg.id}-${i}`;
                        const isSent = sentReplies.has(key);
                        return (
                          <button
                            key={i}
                            className={`quick-reply-btn ${isSent ? "sent" : ""}`}
                            onClick={() => handleQuickReply(msg.id, i)}
                            disabled={isSent}
                          >
                            {isSent ? "Skickat!" : reply.text}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function SlackLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
      <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
      <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
      <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
    </svg>
  );
}
