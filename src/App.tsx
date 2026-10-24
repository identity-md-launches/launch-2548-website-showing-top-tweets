import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronRight, CircleHelp, Cpu, Flame, Heart, Info, MessageCircle, Radio, Repeat2, Search, Share2, Sparkles, Users, X } from 'lucide-react';
import postData from './posts.json';

type Post = (typeof postData)[number];
type View = 'top' | 'latest' | 'saved';
type Topic = 'All posts' | 'Protocol' | 'Builders' | 'Culture' | 'Community';
const topics: Topic[] = ['All posts', 'Protocol', 'Builders', 'Culture', 'Community'];
const storageKey = 'swamp:saved:v1';
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);
const dateFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });

function XMark({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.4l8.1-9.3L.8 2h6.5l5.8 7.3L18.9 2ZM17.8 20h1.7L6.3 3.9H4.5L17.8 20Z" /></svg>;
}

function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && postData.some(p => p.id === id)))] : [];
  } catch { return []; }
}

function PostCard({ post, rank, saved, onSave, onShare }: { post: Post; rank: number; saved: boolean; onSave: (id: string) => void; onShare: (post: Post) => void }) {
  return <article className="post-card" data-post-id={post.id}>
    <div className="post-heading">
      <a className="author-link" href={`https://x.com/${post.handle}`} target="_blank" rel="noopener noreferrer" aria-label={`${post.author} on X (opens in new tab)`}>
        <img className="avatar" src={asset(post.avatar)} width="40" height="40" alt="" loading="lazy" />
        <span className="author-text"><strong>{post.author === 'Kalle Grabowski (His Dudeness)' ? 'Kalle Grabowski' : post.author}</strong><span>@{post.handle}</span></span>
      </a>
      <XMark className="post-x" />
    </div>
    <div className="post-content">
      <div className="post-meta"><span className={`topic-label topic-${post.topic.toLowerCase()}`}>{post.topic}</span><span className="post-date"><time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time><span aria-hidden="true"> · </span>2026</span></div>
      <h3>{post.title}</h3>
      <blockquote>“{post.quote}”</blockquote>
      <p className="post-summary">{post.summary}</p>
      <a className="read-post" href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`Read ${post.author}’s post on X (opens in new tab)`}>Read on X <ArrowUpRight size={15} /></a>
    </div>
    <div className="post-bottom">
      <div className="post-metrics" aria-label="Engagement at snapshot">
        <span title={`${post.likes} likes`}><Heart size={15} /><span>{formatCount(post.likes)}</span><span className="sr-only"> likes</span></span>
        <span title={`${post.reposts} reposts`}><Repeat2 size={15} /><span>{formatCount(post.reposts)}</span><span className="sr-only"> reposts</span></span>
        <span title={`${post.replies} replies`}><MessageCircle size={15} /><span>{formatCount(post.replies)}</span><span className="sr-only"> replies</span></span>
      </div>
      <div className="post-actions"><button className="icon-button share-button" onClick={() => onShare(post)} aria-label={`Copy link to ${post.title}`} title="Copy post link"><Share2 size={17} /></button><button className={`icon-button ${saved ? 'is-saved' : ''}`} onClick={() => onSave(post.id)} aria-label={`${saved ? 'Unsave' : 'Save'} ${post.title}`} aria-pressed={saved} title={saved ? 'Remove bookmark' : 'Save post'}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} /></button></div>
    </div>
    {rank === 1 && <span className="top-corner" title="Most liked in this snapshot"><Flame size={12} /> Top post</span>}
  </article>;
}

export default function App() {
  const [view, setView] = useState<View>('top');
  const [topic, setTopic] = useState<Topic>('All posts');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<string[]>(readSaved);
  const [status, setStatus] = useState('');
  const [copyFallback, setCopyFallback] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const aboutRef = useRef<HTMLDialogElement>(null);
  const copyRef = useRef<HTMLDialogElement>(null);
  const topRank = useMemo(() => [...postData].sort((a, b) => b.likes - a.likes || a.id.localeCompare(b.id)), []);
  const posts = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const filtered = postData.filter(post => (view !== 'saved' || saved.includes(post.id)) && (topic === 'All posts' || post.topic === topic) && (!q || `${post.author} ${post.handle} ${post.quote} ${post.summary} ${post.title} ${post.topic} ${post.tag}`.toLocaleLowerCase().includes(q)));
    return filtered.sort((a, b) => view === 'latest' ? Date.parse(b.date) - Date.parse(a.date) : b.likes - a.likes || a.id.localeCompare(b.id));
  }, [query, topic, view, saved]);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !(event.target instanceof HTMLElement && (event.target.closest('input, textarea, select, [contenteditable="true"], dialog')))) {
        event.preventDefault(); searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', shortcut);
    const syncSaved = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) setSaved(readSaved()); };
    window.addEventListener('storage', syncSaved);
    return () => { window.removeEventListener('keydown', shortcut); window.removeEventListener('storage', syncSaved); };
  }, []);

  function navigate(next: View) { setView(next); setTopic('All posts'); setQuery(''); }
  function toggleSave(id: string) {
    const isSaved = saved.includes(id);
    const next = isSaved ? saved.filter(item => item !== id) : [...saved, id];
    setSaved(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStatus(isSaved ? 'Post removed from saved.' : 'Post saved in this browser.'); }
    catch { setStatus(isSaved ? 'Post removed for this visit.' : 'Post saved for this visit. Browser storage is unavailable.'); }
  }
  async function sharePost(post: Post) {
    try {
      await navigator.clipboard.writeText(post.url);
      setStatus(`Link copied: ${post.title}.`);
    } catch {
      setCopyFallback(post.url);
      copyRef.current?.showModal();
    }
  }
  function resetFilters() { setQuery(''); setTopic('All posts'); searchRef.current?.focus(); }
  function filterTopic(next: Topic) { setTopic(next); setQuery(''); document.getElementById('feed')?.scrollIntoView({ block: 'start' }); }

  return <>
    <a className="skip-link" href="#feed">Skip to the feed</a>
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="#" onClick={() => navigate('top')} aria-label="The Swamp home"><img src={asset('favicon.svg')} width="36" height="36" alt="" /><span>the swamp<span className="wordmark-dot">.</span></span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#feed" className={view !== 'saved' ? 'active' : ''} onClick={() => navigate('top')} aria-current={view !== 'saved' ? 'page' : undefined}>Explore</a>
          <a href="#feed" className={view === 'saved' ? 'active' : ''} onClick={() => navigate('saved')} aria-current={view === 'saved' ? 'page' : undefined}>Saved<span className="nav-count">{saved.length}</span></a>
          <button onClick={() => aboutRef.current?.showModal()}>About</button>
        </nav>
        <a className="header-link" href="https://imd.fun" target="_blank" rel="noopener noreferrer">Visit identity.md <ArrowUpRight size={16} /></a>
      </div>
    </header>

    <main className="page-shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy"><h1 id="hero-title">Signal from<br />the <span>swamp.</span></h1><p>Top tweets from the identity.md ecosystem.</p><a className="primary-button" href="#feed">Explore the feed <ArrowDown size={17} /></a></div>
        <img className="hero-art" src={asset('assets/pepe-squad.svg')} width="680" height="360" alt="Two armored Pepe agents with a neural visor, a drone, and an AI computation module." fetchPriority="high" />
      </section>

      <div className="content-layout">
        <section className="feed-section" id="feed" aria-labelledby="feed-title">
          <div className="feed-heading"><h2 id="feed-title">{view === 'saved' ? 'Saved posts' : 'The feed'}<span className="heading-dot" /></h2><span className="snapshot-label"><span /> Snapshot · Oct 24, 2026</span></div>
          <div className="feed-toolbar">
            <div className="view-switch" role="group" aria-label="Feed order"><button aria-pressed={view === 'top'} onClick={() => setView('top')}><Flame size={16} />Top</button><button aria-pressed={view === 'latest'} onClick={() => setView('latest')}><Radio size={16} />Latest</button><button aria-pressed={view === 'saved'} onClick={() => setView('saved')}><Bookmark size={16} />Saved<span className="tab-count">{saved.length}</span></button></div>
            <div className="search-field"><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="post-search">Search posts, people, or topics</label><input id="post-search" ref={searchRef} type="search" name="search" placeholder="Search the swamp…" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" />{query ? <button onClick={() => { setQuery(''); searchRef.current?.focus(); }} aria-label="Clear search"><X size={16} /></button> : <kbd aria-hidden="true">/</kbd>}</div>
          </div>
          <div className="topic-filters" role="group" aria-label="Filter by topic">{topics.map(item => <button key={item} onClick={() => setTopic(item)} aria-pressed={topic === item}>{item}</button>)}</div>
          <div className="results-line"><span role="status" aria-live="polite" aria-atomic="true">{posts.length} {posts.length === 1 ? 'post' : 'posts'}{query.trim() ? ` matching “${query.trim()}”` : topic !== 'All posts' ? ` in ${topic.toLowerCase()}` : ''}</span><button className="method-button" onClick={() => aboutRef.current?.showModal()}>{view === 'latest' ? 'Newest first' : 'Ranked by likes'}<CircleHelp size={14} /></button></div>
          <div className={`status-notice ${status ? 'visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{status && <><Check size={17} /><span>{status}</span><button onClick={() => setStatus('')} aria-label="Dismiss notification"><X size={16} /></button></>}</div>
          {view === 'saved' && <p className="saved-note"><Info size={15} /> Bookmarks stay in this browser.</p>}
          {posts.length ? <div className="post-grid">{posts.map(post => <PostCard key={post.id} post={post} rank={topRank.findIndex(p => p.id === post.id) + 1} saved={saved.includes(post.id)} onSave={toggleSave} onShare={sharePost} />)}</div> : <div className="empty-state"><span className="empty-icon">{view === 'saved' && !saved.length ? <Bookmark size={28} /> : <Search size={28} />}</span><h3>{view === 'saved' && !saved.length ? 'Keep the good ones.' : 'No posts found'}</h3><p>{view === 'saved' && !saved.length ? 'Save a post using its bookmark button. Find it here whenever you come back.' : 'Try another name or topic, or clear your filters to see more posts.'}</p><button className="primary-button" onClick={() => { resetFilters(); if (view === 'saved' && !saved.length) setView('top'); }}>{view === 'saved' && !saved.length ? 'Explore posts' : 'Clear filters'}<ArrowRight size={16} /></button></div>}
          {posts.length > 0 && <div className="feed-end"><span className="end-line" /><span><Check size={16} /> You’re all caught up</span><span className="end-line" /></div>}
          <div className="feed-footnote"><p>A snapshot of public posts, with short excerpts and summaries.</p><button onClick={() => aboutRef.current?.showModal()}>How this feed works <ArrowUpRight size={14} /></button></div>
        </section>

        <aside className="sidebar" aria-label="Explore the ecosystem">
          <section className="briefing"><div className="aside-heading"><Sparkles size={18} /><h2>Welcome to the swamp</h2></div><p>A little less scrolling.<br />A little more signal.</p><p className="secondary-copy">Follow the builders, ideas, and onchain experiments around identity.md.</p><a href="https://imd.fun" target="_blank" rel="noopener noreferrer">Meet identity.md <ArrowUpRight size={16} /></a></section>
          <section className="topic-section"><div className="aside-heading"><h2>In the conversation</h2><span className="small-label">Topics</span></div><div className="topic-list">{([{ label: 'AI agents', topic: 'Protocol', icon: Cpu }, { label: 'Build on IMD', topic: 'Builders', icon: Sparkles }, { label: 'Onchain culture', topic: 'Culture', icon: Flame }, { label: 'The community', topic: 'Community', icon: Users }] as const).map(({ label, topic: next, icon: Icon }, index) => <button key={label} onClick={() => filterTopic(next)}><span className="topic-number">0{index + 1}</span><span><strong>{label}</strong><span>{postData.filter(p => p.topic === next).length} posts</span></span><Icon size={18} /></button>)}</div></section>
          <section className="people-section"><div className="aside-heading"><h2>Voices in the swamp</h2></div><div className="people-list">{['surfcoderepeat', 'imdradar', 'swarmpepes', 'cryptokarlheinz'].map(handle => { const person = postData.find(p => p.handle === handle)!; return <a key={handle} href={`https://x.com/${handle}`} target="_blank" rel="noopener noreferrer"><img className="avatar" src={asset(person.avatar)} alt="" width="36" height="36" loading="lazy" /><span><strong>{handle === 'cryptokarlheinz' ? 'Kalle Grabowski' : person.author}</strong><span>@{handle}</span></span><ArrowUpRight size={16} /></a>; })}</div></section>
          <a className="x-search-link" href="https://x.com/search?q=%22identity.md%22%20OR%20%22imd.fun%22&f=top" target="_blank" rel="noopener noreferrer"><XMark /><span>Keep exploring on X</span><ChevronRight size={16} /></a>
          <p className="independent-note">An independent community feed.<br />Built for the frogs, by the swamp.</p>
        </aside>
      </div>
    </main>

    <footer className="site-footer"><div><a className="footer-brand" href="#" onClick={() => navigate('top')}>the swamp.</a><span>identity.md, in conversation.</span></div><span>Stay curious. Stay amphibious.</span><button onClick={() => aboutRef.current?.showModal()}>Sources & about <ArrowUpRight size={14} /></button></footer>

    <dialog ref={aboutRef} className="info-dialog" aria-labelledby="about-title"><div className="dialog-heading"><img src={asset('favicon.svg')} width="36" height="36" alt="" /><button className="icon-button" onClick={() => aboutRef.current?.close()} aria-label="Close about"><X size={20} /></button></div><h2 id="about-title">A little context.</h2><p>The Swamp is an independent reader for the identity.md conversation.</p><h3>What “top” means</h3><p>These {postData.length} selected public posts are ranked by their observed likes. This is a snapshot collected on October 24, 2026, not a complete ranking of X or a live feed. “Latest” sorts this same collection by publication date.</p><h3>Go straight to the source</h3><p>Each card includes a short excerpt, our summary, and a direct link to the original post. Engagement counts were read from public X pages and may have changed. Summaries describe authors’ claims, not independently verified project results.</p><h3>Saved means saved here</h3><p>Bookmarks are stored in this browser. There’s no sign-in or account sync. Clearing browser storage removes them.</p><div className="dialog-footer"><a href="https://x.com/search?q=%22identity.md%22%20OR%20%22imd.fun%22&f=top" target="_blank" rel="noopener noreferrer">Search identity.md on X <ArrowUpRight size={16} /></a><button className="primary-button" onClick={() => aboutRef.current?.close()}>Back to the feed</button></div></dialog>
    <dialog ref={copyRef} className="info-dialog copy-dialog" aria-labelledby="copy-title"><div className="dialog-heading"><Share2 size={24} /><button className="icon-button" onClick={() => copyRef.current?.close()} aria-label="Close copy link"><X size={20} /></button></div><h2 id="copy-title">Copy this post link</h2><p>Automatic copying isn’t available. Select and copy the link below.</p><label>Post link<input readOnly value={copyFallback} onFocus={e => e.currentTarget.select()} /></label><button className="primary-button" onClick={() => copyRef.current?.close()}>Done</button></dialog>
  </>;
}
