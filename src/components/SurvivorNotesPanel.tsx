import React, { useState, useRef, useEffect } from 'react';
import { SurvivorNote, SurvivorNoteTag } from '../types';
import { audio } from '../audio/soundEngine';

interface SurvivorNotesPanelProps {
  notes: SurvivorNote[];
  chamber: number;
  mapId: number;
  onAddNote: (text: string, tag: SurvivorNoteTag) => void;
  onDeleteNote: (id: string) => void;
  onClearNotes: () => void;
  isOpen: boolean;
  onClose: () => void;
  hapticsEnabled?: boolean;
}

const TAG_CONFIG: Record<
  SurvivorNoteTag,
  { label: string; icon: string; badgeClass: string; borderClass: string }
> = {
  general: {
    label: 'GENERAL',
    icon: '📋',
    badgeClass: 'bg-slate-900 text-slate-300 border-slate-700',
    borderClass: 'border-slate-700'
  },
  code: {
    label: 'CIPHER / CODE',
    icon: '🔢',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-700',
    borderClass: 'border-amber-700/80'
  },
  entity: {
    label: 'ENTITY SIGHTING',
    icon: '👁️',
    badgeClass: 'bg-red-950 text-red-300 border-red-700',
    borderClass: 'border-red-700/80'
  },
  survivor: {
    label: 'SURVIVOR CLUE',
    icon: '👥',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    borderClass: 'border-emerald-700/80'
  },
  frequency: {
    label: 'FREQUENCY',
    icon: '📻',
    badgeClass: 'bg-purple-950 text-purple-300 border-purple-700',
    borderClass: 'border-purple-700/80'
  }
};

export const SurvivorNotesPanel: React.FC<SurvivorNotesPanelProps> = ({
  notes,
  chamber,
  mapId,
  onAddNote,
  onDeleteNote,
  onClearNotes,
  isOpen,
  onClose,
  hapticsEnabled
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTag, setActiveTag] = useState<SurvivorNoteTag>('general');
  const [filterTag, setFilterTag] = useState<SurvivorNoteTag | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [viewMode, setViewMode] = useState<'log' | 'scratchpad'>('log');
  const [scratchpadText, setScratchpadText] = useState(() => {
    try {
      return localStorage.getItem('abyssal_scratchpad_cache') || '';
    } catch {
      return '';
    }
  });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const currentDepth = ((chamber * 65.4) + (mapId * 120)).toFixed(1);

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(len);
      } catch {
        /* ignore */
      }
    }
  };

  // Sync scratchpad to localStorage during run
  useEffect(() => {
    try {
      localStorage.setItem('abyssal_scratchpad_cache', scratchpadText);
    } catch {
      /* ignore */
    }
  }, [scratchpadText]);

  const handleSubmitNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    triggerHaptic(15);
    audio.playClick();
    onAddNote(trimmed, activeTag);
    setInputText('');

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey || !e.shiftKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitNote();
    }
  };

  const handleCopyNote = (text: string, id: string) => {
    triggerHaptic(10);
    audio.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(current => (current === id ? null : current));
    }, 1500);
  };

  const filteredNotes = notes.filter(n => {
    const matchesTag = filterTag === 'all' || n.tag === filterTag;
    const matchesSearch =
      searchQuery === '' ||
      n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(n.chamber).includes(searchQuery) ||
      n.depth.includes(searchQuery);
    return matchesTag && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <aside
      id="survivor-notes-panel"
      aria-label="Survivor Notes Panel"
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 md:w-[420px] bg-[#070a14] border-l-2 border-cyan-700/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col font-mono text-slate-200 backdrop-blur-md animate-in slide-in-from-right duration-200"
    >
      {/* Top Header Bar */}
      <div className="p-3.5 bg-[#0d1222] border-b border-cyan-900/60 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-lg">📝</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black tracking-wider uppercase text-cyan-300">
                SURVIVOR NOTES
              </h2>
              <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-700 rounded text-[9px] font-bold">
                {notes.length} RECORDED
              </span>
            </div>
            <p className="text-[9px] text-[#7888b0]">
              SUB-OCEANIC TACTICAL SCRATCHPAD // VOLATILE EXPEDITION RAM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              audio.playClick();
              onClose();
            }}
            className="w-7 h-7 flex items-center justify-center bg-[#151b30] hover:bg-cyan-950 text-cyan-400 hover:text-white rounded border border-cyan-800 transition cursor-pointer text-xs font-bold"
            title="Collapse Notes Panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Mode Switcher & Quick Status */}
      <div className="px-3 pt-2 pb-1 bg-[#090e1c] border-b border-[#1b233d] flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(5);
              setViewMode('log');
            }}
            className={`px-2.5 py-1 rounded font-bold uppercase transition cursor-pointer border ${
              viewMode === 'log'
                ? 'bg-cyan-900/80 text-white border-cyan-500 shadow-sm'
                : 'bg-[#101529] text-[#717c9e] border-[#202947] hover:text-white'
            }`}
          >
            📋 LOG ENTRIES ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(5);
              setViewMode('scratchpad');
            }}
            className={`px-2.5 py-1 rounded font-bold uppercase transition cursor-pointer border ${
              viewMode === 'scratchpad'
                ? 'bg-amber-900/80 text-amber-200 border-amber-500 shadow-sm'
                : 'bg-[#101529] text-[#717c9e] border-[#202947] hover:text-white'
            }`}
          >
            ✏️ FIELD SCRATCHPAD
          </button>
        </div>

        <span className="text-[#627094] font-mono text-[9px] flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ACTIVE DESCENT
        </span>
      </div>

      {/* Main Panel Content Area */}
      {viewMode === 'log' ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Note Composer Box */}
          <div className="p-3 bg-[#0a0f21] border-b border-[#1b2440] space-y-2 shrink-0">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>➕</span> RECORD NOTE (CH.{chamber} • {currentDepth}m)
              </span>
              <span className="text-[9px] text-[#6b7b9e]">Press Enter to Save</span>
            </div>

            {/* Note Textarea */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Log cipher code (e.g. 7491), frequency (94.2 MHz), entity behavior, survivor whisper..."
              rows={2}
              maxLength={280}
              className="w-full p-2.5 bg-[#050711] border border-cyan-900/80 focus:border-cyan-400 text-xs rounded font-mono text-cyan-100 placeholder-[#475579] outline-none transition resize-none shadow-inner"
            />

            {/* Tag Selection Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#607094] uppercase font-bold">SELECT TAG:</span>
                <span className="text-[9px] text-[#556488]">{inputText.length}/280</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(['general', 'code', 'entity', 'survivor', 'frequency'] as SurvivorNoteTag[]).map(
                  tag => {
                    const cfg = TAG_CONFIG[tag];
                    const isSelected = activeTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          triggerHaptic(5);
                          setActiveTag(tag);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? `${cfg.badgeClass} ring-1 ring-cyan-400 font-black`
                            : 'bg-[#0e1426] text-[#717e9e] border-[#222a45] hover:text-white'
                        }`}
                      >
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Quick Template Buttons for Fast Input During Tension */}
            <div className="flex flex-wrap gap-1 pt-1 border-t border-[#161f38]">
              <span className="text-[8px] text-[#556488] uppercase self-center mr-1">SNIPPETS:</span>
              {[
                { label: '🔢 CODE: ', tag: 'code' as SurvivorNoteTag },
                { label: '📻 FREQ: ', tag: 'frequency' as SurvivorNoteTag },
                { label: '👁️ WEAKNESS: ', tag: 'entity' as SurvivorNoteTag },
                { label: '🚪 SAFE ROUTE: ', tag: 'general' as SurvivorNoteTag }
              ].map(snip => (
                <button
                  key={snip.label}
                  type="button"
                  onClick={() => {
                    triggerHaptic(5);
                    setActiveTag(snip.tag);
                    setInputText(prev => (prev ? `${prev} ${snip.label}` : snip.label));
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                  className="px-1.5 py-0.5 bg-[#12182d] hover:bg-[#1a2342] text-[#8fa0c9] hover:text-white rounded border border-[#232f52] text-[9px] transition cursor-pointer"
                >
                  {snip.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={!inputText.trim()}
                onClick={() => handleSubmitNote()}
                className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-black font-black uppercase text-[10px] tracking-wider rounded border border-cyan-400 transition cursor-pointer shadow flex items-center justify-center gap-1"
              >
                <span>➕ RECORD ENTRY</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-2.5 bg-[#080c1a] border-b border-[#18213b] flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notes or depth..."
                className="flex-1 px-2 py-1 bg-[#050711] border border-[#222d4c] focus:border-cyan-500 rounded text-[10px] font-mono text-cyan-200 placeholder-[#435172] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-1.5 py-1 bg-[#141b30] text-[#717c9e] hover:text-white rounded text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setFilterTag('all')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer shrink-0 border ${
                  filterTag === 'all'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-black'
                    : 'bg-[#0f1426] text-[#697699] border-[#1e2642]'
                }`}
              >
                ALL ({notes.length})
              </button>
              {(['code', 'entity', 'survivor', 'frequency', 'general'] as SurvivorNoteTag[]).map(
                tag => {
                  const cfg = TAG_CONFIG[tag];
                  const count = notes.filter(n => n.tag === tag).length;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFilterTag(tag)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer shrink-0 border ${
                        filterTag === tag
                          ? `${cfg.badgeClass} ring-1 ring-cyan-500`
                          : 'bg-[#0f1426] text-[#697699] border-[#1e2642]'
                      }`}
                    >
                      {cfg.icon} {cfg.label} ({count})
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Notes History List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredNotes.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-2 my-auto">
                <div className="text-2xl opacity-40">📓</div>
                <p className="text-xs font-bold text-slate-400">
                  {notes.length === 0
                    ? 'NO NOTES LOGGED THIS DESCENT'
                    : 'NO NOTES MATCH CURRENT FILTER'}
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {notes.length === 0
                    ? 'Use this tactical log to jot down cipher digits, entity warnings, radio frequencies, and survival cues. Notes persist until your run concludes.'
                    : 'Clear search query or switch tags to review previously logged observations.'}
                </p>
              </div>
            ) : (
              filteredNotes.map(n => {
                const cfg = TAG_CONFIG[n.tag] || TAG_CONFIG.general;
                const isCopied = copiedId === n.id;
                return (
                  <div
                    key={n.id}
                    className={`bg-[#0b1021] border p-2.5 rounded-lg space-y-1.5 transition hover:bg-[#0f162e] relative group ${cfg.borderClass} shadow-sm`}
                  >
                    {/* Note Meta Header */}
                    <div className="flex items-center justify-between text-[9px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded font-black uppercase border text-[8px] flex items-center gap-1 ${cfg.badgeClass}`}
                        >
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </span>
                        <span className="text-cyan-400 font-bold">CH.{n.chamber}</span>
                        <span className="text-[#556488]">•</span>
                        <span className="text-amber-300">{n.depth}m</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[#64749a]">{n.timestamp}</span>

                        <button
                          type="button"
                          onClick={() => handleCopyNote(n.text, n.id)}
                          className="px-1.5 py-0.5 bg-[#141b30] hover:bg-cyan-950 text-cyan-300 rounded text-[8px] font-bold uppercase transition cursor-pointer border border-cyan-800/60"
                          title="Copy text to clipboard"
                        >
                          {isCopied ? '✓ COPIED' : 'COPY'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic(10);
                            onDeleteNote(n.id);
                          }}
                          className="w-4 h-4 flex items-center justify-center bg-[#17101a] hover:bg-red-950 text-red-400 rounded text-[9px] transition cursor-pointer border border-red-900/60"
                          title="Delete note"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Note Body Text */}
                    <p className="text-xs text-slate-100 font-mono leading-relaxed whitespace-pre-wrap select-text break-words">
                      {n.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Continuous Field Scratchpad View */
        <div className="flex-1 flex flex-col p-3 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
              <span>✏️</span> CONTINUOUS FIELD LOGBOOK
            </span>
            <span className="text-[#69799e] text-[9px]">Auto-saved to device buffer</span>
          </div>

          <textarea
            value={scratchpadText}
            onChange={e => setScratchpadText(e.target.value)}
            placeholder="Continuous tactical scratchpad...
- Chamber 2: Keypad code 4829
- Chamber 3: Frequency 94.2 MHz broadcast mentions Sector 4
- The Listener reacts violently to acoustic noise
- Mira in Sector 2 wants 1 Wire"
            className="flex-1 w-full p-3 bg-[#050711] border border-amber-900/80 focus:border-amber-400 rounded text-xs font-mono text-amber-100 placeholder-[#524434] outline-none transition resize-none leading-relaxed shadow-inner"
          />

          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className="text-[#64749a] text-[9px]">{scratchpadText.length} characters</span>
            <button
              type="button"
              onClick={() => {
                if (scratchpadText.trim()) {
                  triggerHaptic(10);
                  audio.playClick();
                  onAddNote(scratchpadText.trim(), 'general');
                  setViewMode('log');
                }
              }}
              disabled={!scratchpadText.trim()}
              className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-30 text-black font-bold uppercase rounded text-[9px] transition cursor-pointer"
            >
              SAVE AS NOTE CARD ➔
            </button>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="p-3 bg-[#090d1c] border-t border-[#1a2340] flex items-center justify-between shrink-0 text-xs">
        {confirmClear ? (
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-[10px] text-red-400 font-bold shrink-0">PURGE ALL NOTES?</span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                onClearNotes();
                setConfirmClear(false);
              }}
              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[9px] font-black uppercase cursor-pointer"
            >
              CONFIRM PURGE
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="px-2 py-1 bg-[#1a2035] text-slate-300 hover:text-white rounded text-[9px] cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={notes.length === 0}
              onClick={() => setConfirmClear(true)}
              className="px-2 py-1 text-[10px] text-red-400 hover:text-red-300 disabled:opacity-20 transition cursor-pointer font-bold flex items-center gap-1"
            >
              <span>🗑️</span>
              <span>PURGE NOTES</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                audio.playClick();
                onClose();
              }}
              className="px-3 py-1 bg-[#141a30] hover:bg-cyan-900 text-cyan-300 hover:text-white rounded border border-cyan-800 text-[10px] font-bold uppercase transition cursor-pointer"
            >
              CLOSE DRAWER
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
