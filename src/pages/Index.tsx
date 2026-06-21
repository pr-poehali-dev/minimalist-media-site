import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

type MediaType = 'image' | 'video';

interface Post {
  id: string;
  type: MediaType;
  url: string;
  title: string;
  description: string;
}

interface LinkButton {
  id: string;
  label: string;
  href: string;
  image: string;
}

interface Comment {
  id: string;
  postId: string;
  author: string;
  text: string;
  likes: number;
  likedBy: string[];
  createdAt: number;
}

const IMG_1 = 'https://cdn.poehali.dev/projects/6920125d-6db0-4d12-9613-3be209c696e0/files/fcc963d7-0fe6-47ac-8a3e-a3d556a77bd5.jpg';
const IMG_2 = 'https://cdn.poehali.dev/projects/6920125d-6db0-4d12-9613-3be209c696e0/files/444006cb-e488-49af-8e52-dbc023add220.jpg';
const IMG_3 = 'https://cdn.poehali.dev/projects/6920125d-6db0-4d12-9613-3be209c696e0/files/601267cb-9521-4deb-a624-1f781c94cdd8.jpg';

const DEFAULT_POSTS: Post[] = [
  { id: '1', type: 'image', url: IMG_1, title: 'Тишина бетона', description: 'Архитектурная серия. Свет и форма.' },
  { id: '2', type: 'image', url: IMG_2, title: 'Объём', description: 'Минимализм предметной съёмки.' },
  { id: '3', type: 'image', url: IMG_3, title: 'Туман', description: 'Утро в горах. Покой и пространство.' },
  { id: '4', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Движение', description: 'Видео со звуком — раскройте на весь экран.' },
];

const DEFAULT_LINKS: LinkButton[] = [
  { id: 'l1', label: 'Telegram', href: 'https://t.me', image: IMG_3 },
  { id: 'l2', label: 'Instagram', href: 'https://instagram.com', image: IMG_2 },
  { id: 'l3', label: 'Behance', href: 'https://behance.net', image: IMG_1 },
];

const ADMIN_PASSWORD = 'Iwaqq2';

const nav = [
  { id: 'home', label: 'Главная' },
  { id: 'gallery', label: 'Галерея' },
  { id: 'about', label: 'О нас' },
  { id: 'contacts', label: 'Контакты' },
];

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getVisitorId(): string {
  let id = localStorage.getItem('mg_visitor_id');
  if (!id) { id = Math.random().toString(36).slice(2); localStorage.setItem('mg_visitor_id', id); }
  return id;
}

export default function Index() {
  const [section, setSection] = useState('home');
  const [prevSection, setPrevSection] = useState('home');

  const goSection = (s: string) => { setPrevSection(section); setSection(s); };

  const [posts, setPosts] = useState<Post[]>(() => load('mg_posts', DEFAULT_POSTS));
  const [links, setLinks] = useState<LinkButton[]>(() => load('mg_links', DEFAULT_LINKS));
  const [likes, setLikes] = useState<Record<string, number>>(() => load('mg_likes', {}));
  const [liked, setLiked] = useState<Record<string, boolean>>(() => load('mg_liked', {}));
  const [comments, setComments] = useState<Comment[]>(() => load('mg_comments', []));
  const [lightbox, setLightbox] = useState<Post | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pwd, setPwd] = useState('');

  const visitorId = getVisitorId();

  useEffect(() => { localStorage.setItem('mg_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('mg_links', JSON.stringify(links)); }, [links]);
  useEffect(() => { localStorage.setItem('mg_likes', JSON.stringify(likes)); }, [likes]);
  useEffect(() => { localStorage.setItem('mg_liked', JSON.stringify(liked)); }, [liked]);
  useEffect(() => { localStorage.setItem('mg_comments', JSON.stringify(comments)); }, [comments]);

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const now = !prev[id];
      setLikes((l) => ({ ...l, [id]: Math.max(0, (l[id] || 0) + (now ? 1 : -1)) }));
      return { ...prev, [id]: now };
    });
  };

  const addComment = (postId: string, author: string, text: string) => {
    const c: Comment = { id: Date.now().toString(), postId, author: author.trim() || 'Гость', text: text.trim(), likes: 0, likedBy: [], createdAt: Date.now() };
    setComments((prev) => [...prev, c]);
  };

  const likeComment = (cid: string) => {
    setComments((prev) => prev.map((c) => {
      if (c.id !== cid) return c;
      const already = c.likedBy.includes(visitorId);
      return { ...c, likes: already ? c.likes - 1 : c.likes + 1, likedBy: already ? c.likedBy.filter((x) => x !== visitorId) : [...c.likedBy, visitorId] };
    }));
  };

  const deleteComment = (cid: string) => setComments((prev) => prev.filter((c) => c.id !== cid));

  const fileToData = (file: File): Promise<string> =>
    new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(file); });

  const saveDraft = (draftPosts: Post[], draftLinks: LinkButton[]) => {
    setPosts(draftPosts);
    setLinks(draftLinks);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md border-b border-border" style={{ backgroundColor: 'rgba(220, 237, 225, 0.85)' }}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => setSection('home')} className="font-display text-2xl tracking-wide">
            STUDIO<span className="opacity-40">.M</span>
          </button>
          <nav className="hidden md:flex items-center gap-10 text-sm tracking-widest uppercase">
            {nav.map((n) => (
              <button key={n.id} onClick={() => goSection(n.id)}
                className={`transition-opacity ${section === n.id ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}>
                {n.label}
              </button>
            ))}
          </nav>
          <button onClick={() => goSection('admin')} className="text-xs tracking-widest uppercase opacity-50 hover:opacity-100 flex items-center gap-2">
            <Icon name="Lock" size={14} /> Админ
          </button>
        </div>
      </header>

      <main className="pt-20">
        {section === 'home' && (
          <Home posts={posts} links={links} go={goSection} openBox={setLightbox}
            likes={likes} liked={liked} toggleLike={toggleLike}
            comments={comments} addComment={addComment} likeComment={likeComment}
            deleteComment={deleteComment} isAdmin={isAdmin} visitorId={visitorId} />
        )}
        {section === 'gallery' && (
          <Gallery posts={posts} likes={likes} liked={liked} like={toggleLike}
            openBox={setLightbox} onBack={() => goSection(prevSection)}
            comments={comments} addComment={addComment} likeComment={likeComment}
            deleteComment={deleteComment} isAdmin={isAdmin} visitorId={visitorId} />
        )}
        {section === 'about' && <About />}
        {section === 'contacts' && <Contacts links={links} />}
        {section === 'admin' && (
          <Admin isAdmin={isAdmin} pwd={pwd} setPwd={setPwd}
            login={() => setIsAdmin(pwd === ADMIN_PASSWORD)}
            posts={posts} links={links} onSave={saveDraft} fileToData={fileToData} />
        )}
      </main>

      <footer className="border-t border-border mt-32 py-12 text-center text-xs tracking-widest uppercase opacity-40">
        STUDIO.M — {new Date().getFullYear()}
      </footer>

      {lightbox && <Lightbox post={lightbox} close={() => setLightbox(null)} />}
    </div>
  );
}

interface PostCardProps {
  p: Post;
  likes: Record<string, number>;
  liked: Record<string, boolean>;
  toggleLike: (id: string) => void;
  openBox: (p: Post) => void;
  comments: Comment[];
  addComment: (postId: string, author: string, text: string) => void;
  likeComment: (cid: string) => void;
  deleteComment: (cid: string) => void;
  isAdmin: boolean;
  visitorId: string;
}

function PostCard({ p, likes, liked, toggleLike, openBox, comments, addComment, likeComment, deleteComment, isAdmin, visitorId }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const postComments = comments.filter((c) => c.postId === p.id);

  const submit = () => {
    if (!text.trim()) return;
    addComment(p.id, author, text);
    setText('');
  };

  return (
    <div className="break-inside-avoid bg-muted overflow-hidden">
      <button onClick={() => openBox(p)} className="block w-full relative group">
        {p.type === 'image' ? (
          <img src={p.url} alt={p.title} className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <div className="relative">
            <video src={p.url} muted className="w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                <Icon name="Play" size={20} className="text-black ml-0.5" />
              </span>
            </div>
          </div>
        )}
        {p.type === 'video' && (
          <>
            <span className="absolute bottom-0 right-0 w-0 h-0"
              style={{ borderLeft: '28px solid transparent', borderBottom: '28px solid white', opacity: 0.85 }} />
            <span className="absolute top-3 left-3 bg-black/60 rounded-full p-1.5 flex items-center justify-center">
              <Icon name="Video" size={14} className="text-white" />
            </span>
          </>
        )}
      </button>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl leading-none">{p.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => toggleLike(p.id)} className="flex items-center gap-1.5 text-sm">
              <Icon name="Heart" size={18} className={liked[p.id] ? 'fill-current text-red-500' : 'opacity-50'} />
              <span className="tabular-nums opacity-70">{likes[p.id] || 0}</span>
            </button>
            <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1.5 text-sm opacity-50 hover:opacity-100 transition-opacity">
              <Icon name="MessageCircle" size={18} />
              <span className="tabular-nums">{postComments.length}</span>
            </button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 border-t border-border pt-4 space-y-3">
            {postComments.length === 0 && (
              <p className="text-xs text-muted-foreground">Пока нет комментариев</p>
            )}
            {postComments.map((c) => (
              <div key={c.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <span className="text-xs font-medium opacity-70">{c.author}</span>
                  <p className="text-sm mt-0.5">{c.text}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => likeComment(c.id)} className="flex items-center gap-1 text-xs opacity-50 hover:opacity-100 transition-opacity">
                    <Icon name="Heart" size={13} className={c.likedBy.includes(visitorId) ? 'fill-current text-red-500' : ''} />
                    {c.likes > 0 && <span>{c.likes}</span>}
                  </button>
                  {isAdmin && (
                    <button onClick={() => deleteComment(c.id)} className="opacity-30 hover:opacity-100 hover:text-red-500 transition-colors">
                      <Icon name="Trash2" size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Имя"
                className="w-24 border border-border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-foreground shrink-0" />
              <input value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Комментарий..."
                className="flex-1 border border-border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-foreground" />
              <button onClick={submit} className="px-3 py-1.5 bg-foreground text-background text-xs hover:opacity-80 transition-opacity shrink-0">
                <Icon name="Send" size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface HomeProps {
  posts: Post[];
  links: LinkButton[];
  go: (s: string) => void;
  openBox: (p: Post) => void;
  likes: Record<string, number>;
  liked: Record<string, boolean>;
  toggleLike: (id: string) => void;
  comments: Comment[];
  addComment: (postId: string, author: string, text: string) => void;
  likeComment: (cid: string) => void;
  deleteComment: (cid: string) => void;
  isAdmin: boolean;
  visitorId: string;
}

function Home({ posts, links, go, openBox, likes, liked, toggleLike, comments, addComment, likeComment, deleteComment, isAdmin, visitorId }: HomeProps) {
  return (
    <div className="animate-fade-in">
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <p className="text-xs tracking-luxe uppercase opacity-50 mb-8">Фото · Видео · Gif</p>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.95] max-w-4xl">
          Хороший контент
        </h1>
        <p className="mt-8 max-w-md text-muted-foreground leading-relaxed">
          Коллекция визуальных работ. Раскройте любую — фото на весь экран, видео со звуком.
        </p>
        <button onClick={() => go('gallery')}
          className="mt-10 inline-flex items-center gap-3 border-b border-foreground pb-1 text-sm tracking-widest uppercase hover:gap-5 transition-all">
          Смотреть галерею <Icon name="ArrowRight" size={16} />
        </button>
      </section>

      <section className="max-w-6xl mx-auto px-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
          {posts.slice(0, 3).map((p, i) => (
            <div key={p.id} className="animate-scale-in" style={{ animationDelay: `${i * 80}ms` }}>
              <PostCard p={p} likes={likes} liked={liked} toggleLike={toggleLike} openBox={openBox}
                comments={comments} addComment={addComment} likeComment={likeComment}
                deleteComment={deleteComment} isAdmin={isAdmin} visitorId={visitorId} />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-28">
        <h2 className="font-display text-4xl mb-8">Найти нас</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {links.map((l) => (
            <a key={l.id} href={l.href} target="_blank" rel="noreferrer"
              className="group relative h-44 overflow-hidden hover-lift">
              <img src={l.image} alt={l.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white tracking-widest uppercase text-sm flex items-center gap-2">
                  {l.label} <Icon name="ArrowUpRight" size={16} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

interface GalleryProps {
  posts: Post[];
  likes: Record<string, number>;
  liked: Record<string, boolean>;
  like: (id: string) => void;
  openBox: (p: Post) => void;
  onBack: () => void;
  comments: Comment[];
  addComment: (postId: string, author: string, text: string) => void;
  likeComment: (cid: string) => void;
  deleteComment: (cid: string) => void;
  isAdmin: boolean;
  visitorId: string;
}

function Gallery({ posts, likes, liked, like, openBox, onBack, comments, addComment, likeComment, deleteComment, isAdmin, visitorId }: GalleryProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-20 pb-10 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-xs tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity mb-10">
        <Icon name="ArrowLeft" size={14} /> Вернуться
      </button>
      <h1 className="font-display text-5xl md:text-7xl mb-12">Галерея</h1>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
        {posts.map((p, i) => (
          <div key={p.id} className="animate-scale-in" style={{ animationDelay: `${i * 60}ms` }}>
            <PostCard p={p} likes={likes} liked={liked} toggleLike={like} openBox={openBox}
              comments={comments} addComment={addComment} likeComment={likeComment}
              deleteComment={deleteComment} isAdmin={isAdmin} visitorId={visitorId} />
          </div>
        ))}
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-10 animate-fade-in">
      <h1 className="font-display text-5xl md:text-7xl mb-10">О нас</h1>
      <p className="text-xl leading-relaxed text-muted-foreground">
        STUDIO.M — независимая визуальная студия. Мы собираем фотографии и видео в тихие,
        выверенные композиции, где каждому кадру дано пространство.
      </p>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        Меньше — значит точнее. Мы верим в чистую форму, естественный свет и истории,
        рассказанные без лишнего шума.
      </p>
      <div className="grid grid-cols-3 gap-6 mt-14 border-t border-border pt-10">
        {[['120+', 'Работ'], ['8', 'Лет опыта'], ['∞', 'Идей']].map(([n, t]) => (
          <div key={t}>
            <p className="font-display text-4xl">{n}</p>
            <p className="text-xs tracking-widest uppercase opacity-50 mt-2">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Contacts({ links }: { links: LinkButton[] }) {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-10 animate-fade-in">
      <h1 className="font-display text-5xl md:text-7xl mb-10">Контакты</h1>
      <div className="space-y-6 text-lg">
        <a href="mailto:hello@studio.m" className="flex items-center gap-4 hover:opacity-60 transition-opacity">
          <Icon name="Mail" size={20} /> hello@studio.m
        </a>
        <p className="flex items-center gap-4"><Icon name="MapPin" size={20} /> Москва, Россия</p>
        <p className="flex items-center gap-4"><Icon name="Phone" size={20} /> +7 999 000 00 00</p>
      </div>
      <div className="flex flex-wrap gap-4 mt-12">
        {links.map((l) => (
          <a key={l.id} href={l.href} target="_blank" rel="noreferrer"
            className="text-xs tracking-widest uppercase border border-border px-5 py-3 hover:bg-foreground hover:text-background transition-colors">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

interface AdminProps {
  isAdmin: boolean;
  pwd: string;
  setPwd: (v: string) => void;
  login: () => void;
  posts: Post[];
  links: LinkButton[];
  onSave: (posts: Post[], links: LinkButton[]) => void;
  fileToData: (f: File) => Promise<string>;
}

function Admin(props: AdminProps) {
  const { isAdmin, pwd, setPwd, login, posts, links, onSave, fileToData } = props;
  const [showPwd, setShowPwd] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draftPosts, setDraftPosts] = useState<Post[]>(posts);
  const [draftLinks, setDraftLinks] = useState<LinkButton[]>(links);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setDraftPosts(posts); }, [isAdmin]);
  useEffect(() => { setDraftLinks(links); }, [isAdmin]);

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwd(e.target.value);
    setShowPwd(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowPwd(false), 5000);
  };

  const handleSave = () => {
    onSave(draftPosts, draftLinks);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 3000);
  };

  const draftAddPost = async (file: File) => {
    const url = await fileToData(file);
    const type: MediaType = file.type.startsWith('video') ? 'video' : 'image';
    setDraftPosts((p) => [{ id: Date.now().toString(), type, url, title: 'Новый пост', description: 'Описание' }, ...p]);
  };

  const draftUpdatePost = (id: string, patch: Partial<Post>) =>
    setDraftPosts((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const draftRemovePost = (id: string) => setDraftPosts((p) => p.filter((x) => x.id !== id));
  const draftUpdateLink = (id: string, patch: Partial<LinkButton>) =>
    setDraftLinks((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const draftRemoveLink = (id: string) => setDraftLinks((l) => l.filter((x) => x.id !== id));
  const draftAddLink = () =>
    setDraftLinks((l) => [...l, { id: Date.now().toString(), label: 'Ссылка', href: 'https://', image: IMG_1 }]);
  const onLinkImage = async (id: string, file: File) => draftUpdateLink(id, { image: await fileToData(file) });

  if (!isAdmin) {
    return (
      <div className="max-w-sm mx-auto px-6 pt-32 pb-10 animate-fade-in text-center">
        <Icon name="Lock" size={32} className="mx-auto opacity-40" />
        <h1 className="font-display text-4xl mt-6 mb-8">Вход для админа</h1>
        <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={handlePwdChange}
          onKeyDown={(e) => e.key === 'Enter' && login()} placeholder="•••"
          className="w-full border border-border bg-transparent px-4 py-3 text-center outline-none focus:border-foreground transition-colors" />
        <button onClick={login} className="mt-4 w-full bg-foreground text-background py-3 tracking-widest uppercase text-sm hover:opacity-80 transition-opacity">
          Войти
        </button>
        <p className="text-xs text-muted-foreground mt-4">Зритель видит сайт без этой панели.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-20 pb-24 animate-fade-in">
      <h1 className="font-display text-5xl mb-10">Админ-панель</h1>

      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <h2 className="font-display text-3xl">Посты</h2>
        <label className="text-xs tracking-widest uppercase border border-foreground px-4 py-2.5 cursor-pointer hover:bg-foreground hover:text-background transition-colors flex items-center gap-2">
          <Icon name="Upload" size={14} /> Загрузить фото / видео
          <input type="file" accept="image/*,video/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && draftAddPost(e.target.files[0])} />
        </label>
      </div>

      <div className="space-y-4 mb-16">
        {draftPosts.map((p) => (
          <div key={p.id} className="flex gap-4 border border-border p-4">
            <div className="w-24 h-24 bg-muted shrink-0 overflow-hidden">
              {p.type === 'image' ? <img src={p.url} className="w-full h-full object-cover" alt="" />
                : <video src={p.url} muted className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 space-y-2">
              <input value={p.title} onChange={(e) => draftUpdatePost(p.id, { title: e.target.value })}
                className="w-full border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-foreground" />
              <input value={p.description} onChange={(e) => draftUpdatePost(p.id, { description: e.target.value })}
                className="w-full border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-foreground" />
            </div>
            <button onClick={() => draftRemovePost(p.id)} className="opacity-50 hover:opacity-100 hover:text-red-500 transition-colors self-start">
              <Icon name="Trash2" size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <h2 className="font-display text-3xl">Кнопки-ссылки</h2>
        <button onClick={draftAddLink} className="text-xs tracking-widest uppercase border border-foreground px-4 py-2.5 hover:bg-foreground hover:text-background transition-colors flex items-center gap-2">
          <Icon name="Plus" size={14} /> Добавить ссылку
        </button>
      </div>

      <div className="space-y-4 mb-16">
        {draftLinks.map((l) => (
          <div key={l.id} className="flex gap-4 border border-border p-4 items-center">
            <label className="w-20 h-20 bg-muted shrink-0 overflow-hidden cursor-pointer relative group">
              <img src={l.image} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Icon name="Camera" size={18} className="text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && onLinkImage(l.id, e.target.files[0])} />
            </label>
            <div className="flex-1 space-y-2">
              <input value={l.label} onChange={(e) => draftUpdateLink(l.id, { label: e.target.value })} placeholder="Название"
                className="w-full border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-foreground" />
              <input value={l.href} onChange={(e) => draftUpdateLink(l.id, { href: e.target.value })} placeholder="https://..."
                className="w-full border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-foreground" />
            </div>
            <button onClick={() => draftRemoveLink(l.id)} className="opacity-50 hover:opacity-100 hover:text-red-500 transition-colors">
              <Icon name="Trash2" size={18} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={handleSave}
        className="w-full py-4 bg-foreground text-background tracking-widest uppercase text-sm hover:opacity-80 transition-opacity flex items-center justify-center gap-3">
        <Icon name="Save" size={16} /> Сохранить изменения
      </button>

      {saved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-8 py-3 text-sm tracking-widest uppercase flex items-center gap-3 animate-fade-in shadow-xl">
          <Icon name="Check" size={16} /> Успешно ✓
        </div>
      )}
    </div>
  );
}

function Lightbox({ post, close }: { post: Post; close: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [close]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={close}>
      <button onClick={close} className="absolute top-6 right-6 text-white/70 hover:text-white z-10">
        <Icon name="X" size={28} />
      </button>
      <div className="max-w-6xl max-h-[88vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        {post.type === 'image' ? (
          <img src={post.url} alt={post.title} className="max-h-[80vh] w-auto object-contain animate-scale-in" />
        ) : (
          <video src={post.url} controls autoPlay className="max-h-[80vh] w-auto animate-scale-in" />
        )}
        <p className="text-white/80 font-display text-2xl mt-5">{post.title}</p>
      </div>
    </div>
  );
}
