import { useEffect, useMemo, useRef, useState } from "react";
import { getUser, handleAuthCallback, login, logout, requestPasswordRecovery, signup, updateUser } from "@netlify/identity";
import {
  Search, MapPin, Wrench, Zap, Hammer, Paintbrush, Snowflake, Star,
  Bookmark, MessageCircle, ShieldCheck, ArrowRight, Menu, X, Send,
  CheckCircle, ChevronDown, HardHat, LayoutDashboard, SlidersHorizontal,
  ShoppingBag, Package, LogOut
} from "lucide-react";

const categories = [
  { name: "All services", icon: Wrench }, { name: "Plumbers", icon: Wrench },
  { name: "Electricians", icon: Zap }, { name: "Carpenters", icon: Hammer },
  { name: "Painters", icon: Paintbrush }, { name: "AC & Fridge", icon: Snowflake }
];
const initialProviders = [
  {id:1,name:"Kamau Plumbing Works",role:"Plumbing & water systems",category:"Plumbers",location:"Meru Town",rating:4.9,reviews:86,price:"From KSh 800",verified:true,image:"/images/plumbing.jpg",description:"Home and business plumbing, leak repairs and bathroom installations.",skills:["Pipe repairs","Water tanks"],products:[{name:"Kitchen mixer tap",price:2400},{name:"PVC pipe set",price:850}]},
  {id:2,name:"BrightSpark Electricals",role:"Electrical installation & repair",category:"Electricians",location:"Kaaga, Meru",rating:4.8,reviews:64,price:"From KSh 1,000",verified:true,image:"/images/electrical.jpg",description:"Electrical installation, troubleshooting, lighting upgrades and maintenance.",skills:["Wiring","Lighting"],products:[{name:"LED security light",price:1800}]},
  {id:3,name:"Muriithi Woodcraft",role:"Custom furniture & carpentry",category:"Carpenters",location:"Makutano, Meru",rating:4.9,reviews:51,price:"From KSh 1,500",verified:true,image:"/images/carpentry.jpg",description:"Custom furniture, door fitting, shelves and home woodwork.",skills:["Wardrobes","Doors"],products:[{name:"Floating wall shelf",price:1500}]},
  {id:4,name:"FreshCoat Painting",role:"Interior & exterior painting",category:"Painters",location:"Gakoromone, Meru",rating:4.7,reviews:42,price:"From KSh 600 / room",verified:false,image:"/images/painting.jpg",description:"Residential painting, colour advice and clean finishes.",skills:["House painting","Waterproofing"],products:[{name:"Paint roller kit",price:950}]},
  {id:5,name:"CoolPoint Appliance Care",role:"Fridge & air conditioner repair",category:"AC & Fridge",location:"Meru Town",rating:4.8,reviews:37,price:"From KSh 1,200",verified:true,image:"/images/cooling.jpg",description:"Appliance diagnostics, AC servicing and refrigeration maintenance.",skills:["AC servicing","Fridge repair"],products:[{name:"Universal AC remote",price:1200}]},
  {id:6,name:"SecureHome Installers",role:"CCTV & security systems",category:"Electricians",location:"Kianjai, Meru",rating:4.6,reviews:29,price:"From KSh 2,000",verified:true,image:"/images/security.jpg",description:"Security camera and alarm installations for homes and small businesses.",skills:["CCTV cameras","Alarm systems"],products:[{name:"Wi-Fi security camera",price:3200}]}
];
const featuredProducts = [initialProviders[1], initialProviders[3], initialProviders[5]];
const currency = value => `KSh ${Number(value).toLocaleString("en-KE")}`;
let authCallbackPromise;

function Brand({ onClick }) {
  return <a className="brand" href="#home" onClick={onClick}><span className="brand-mark"><HardHat size={25}/></span><span>service<span className="brand-accent">hub</span><small>LOCAL PROS, ONE PLACE</small></span></a>;
}

function Modal({ titleId, className, onClose, children }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    dialog.querySelector("input:not([type=hidden]), button, a[href]")?.focus();
    function handleKey(event) {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab") return;
      const controls = [...dialog.querySelectorAll("button:not(:disabled), a[href], input:not([type=hidden]), select, textarea")].filter(control => control.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, []);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className={className} role="dialog" aria-modal="true" aria-labelledby={titleId}><button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={20}/></button>{children}</section></div>;
}

export default function App() {
  const [providers] = useState(() => [1,3,5,2,0,4].map(index => initialProviders[index]));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All services");
  const [sort, setSort] = useState("recommended");
  const [saved, setSaved] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [enquiry, setEnquiry] = useState(null);
  const [form, setForm] = useState({name:"",phone:"",category:"Plumbers",location:"",details:""});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    let active = true;
    authCallbackPromise ??= handleAuthCallback();
    authCallbackPromise.then(async callback => {
      const currentUser = callback?.user ?? await getUser();
      if (!active) return;
      setUser(currentUser);
      if (callback?.type === "recovery") { setAuthMode("reset"); setAuthOpen(true); }
      if (callback?.type === "confirmation") setToast("Email confirmed. You are now signed in.");
    }).catch(() => {
      if (active) { setAuthError("This account link could not be verified. Request a new link or sign in."); setAuthOpen(true); }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = providers.filter(provider =>
      (category === "All services" || provider.category === category) &&
      (!savedOnly || saved.includes(provider.id)) &&
      (!term || [provider.name,provider.role,provider.category,provider.location,...provider.skills,...provider.products.map(product => product.name)].join(" ").toLowerCase().includes(term))
    );
    if (sort === "rating") result.sort((first,second) => second.rating-first.rating || second.reviews-first.reviews);
    else if (sort === "price") result.sort((first,second) => Number(first.price.replace(/\D/g,""))-Number(second.price.replace(/\D/g,"")));
    return result;
  }, [providers, search, category, sort, savedOnly, saved]);

  function scrollToServices() {
    document.getElementById("services")?.scrollIntoView({behavior:"smooth"});
    setMobileMenu(false);
  }
  function clearFilters() { setSearch(""); setCategory("All services"); setSavedOnly(false); }
  function toggleSaved(id) {
    const isSaved = saved.includes(id);
    setSaved(current => isSaved ? current.filter(item => item !== id) : [...current,id]);
    setToast(isSaved ? "Contractor removed from saved list." : "Contractor saved for this visit.");
  }
  function openEnquiry(provider = null, kind = "enquiry", product = null) {
    setSelected(null); setEnquiry({provider,kind}); setSent(false); setFormError("");
    setForm({name:user?.name || "",phone:"",category:provider?.category || "Plumbers",location:"",details:product ? `I would like to enquire about ${product.name} (${currency(product.price)}).` : ""});
  }
  async function submitEnquiry(event) {
    event.preventDefault();
    if (submitting) return;
    if (!form.name.trim() || !form.phone.trim() || !form.details.trim()) { setFormError("Please enter your name, phone number and a message."); return; }
    setSubmitting(true); setFormError("");
    try {
      const fields = new FormData(event.currentTarget);
      const response = await fetch("/__forms.html", {
        method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"},
        body:new URLSearchParams(fields).toString()
      });
      if (!response.ok) throw new Error("Submission failed");
      setSent(true);
    } catch { setFormError("Your request could not be sent. Please check your connection and try again."); }
    finally { setSubmitting(false); }
  }
  function openAuth() { setAuthMode("login"); setAuthMessage(""); setAuthError(""); setAuthOpen(true); setMobileMenu(false); }
  async function submitAuth(event) {
    event.preventDefault();
    if (authBusy) return;
    const fields = new FormData(event.currentTarget);
    setAuthBusy(true); setAuthMessage(""); setAuthError("");
    try {
      if (authMode === "recover") {
        await requestPasswordRecovery(fields.get("email"));
        setAuthMessage("If an account exists for that email, a password reset link is on its way.");
      } else if (authMode === "reset") {
        const updatedUser = await updateUser({password:fields.get("password")});
        setUser(updatedUser); setAuthOpen(false); setToast("Your password has been updated.");
      } else if (authMode === "signup") {
        const newUser = await signup(fields.get("email"),fields.get("password"),{full_name:fields.get("name")});
        if (newUser.emailVerified) { setUser(newUser); setAuthOpen(false); }
        else setAuthMessage("Check your email to confirm your account before signing in.");
      } else {
        setUser(await login(fields.get("email"),fields.get("password"))); setAuthOpen(false); setToast("Welcome to ServiceHub.");
      }
    } catch { setAuthError(authMode === "login" ? "Unable to sign in. Check your email and password, and confirm your email first." : "Unable to complete this request. Please try again shortly."); }
    finally { setAuthBusy(false); }
  }
  async function signOut() {
    setAuthBusy(true); setAuthError("");
    try { await logout(); setUser(null); setAuthOpen(false); setToast("You are signed out."); }
    catch { setAuthError("Unable to sign out. Please try again."); }
    finally { setAuthBusy(false); }
  }

  return <div className="site-shell" id="home">
    <a href="#services" className="skip-link">Skip to contractors</a>
    <div className="topbar"><div className="wrap topbar-inner"><span><MapPin size={14}/> Serving Meru and nearby communities</span><span className="top-note">Local skills. Trusted hands. Better homes.</span><button className="top-contact" onClick={()=>openEnquiry(null,"contact")}>Contact us</button></div></div>
    <header className="header"><div className="wrap header-inner">
      <Brand onClick={clearFilters}/>
      <nav className={mobileMenu ? "nav nav-open" : "nav"} aria-label="Main navigation">
        <a href="#services" onClick={()=>setMobileMenu(false)}>Find a pro</a><a href="#how-it-works" onClick={()=>setMobileMenu(false)}>How it works</a><a href="#products" onClick={()=>setMobileMenu(false)}>Shop products</a>
        <button className="nav-saved" aria-pressed={savedOnly} onClick={()=>{setSavedOnly(!savedOnly);setCategory("All services");setSearch("");scrollToServices();}}><Bookmark size={16}/> Saved <span>{saved.length}</span></button>
        <button className="btn btn-dark nav-cta" onClick={openAuth}><LayoutDashboard size={15}/>{user ? "My account" : "Sign in / Join"}</button>
      </nav>
      <button className="mobile-toggle" aria-label="Toggle menu" aria-expanded={mobileMenu} onClick={()=>setMobileMenu(!mobileMenu)}>{mobileMenu?<X/>:<Menu/>}</button>
    </div></header>
    <main>
      <section className="hero">
        <div className="wrap hero-grid"><div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> YOUR LOCAL SERVICE MARKETPLACE</div>
          <h1>Find the right hands for <span>every job.</span></h1>
          <p className="hero-lead">From a leaking tap to a fresh coat of paint, meet skilled local contractors and discover the tools and products they use.</p>
          <form className="search-panel" onSubmit={event=>{event.preventDefault();scrollToServices();}}><div className="search-input"><Search size={20}/><input value={search} onChange={event=>{setSearch(event.target.value);setSavedOnly(false);}} placeholder="Try plumber, wiring, painting…" aria-label="Search contractors, services or products"/></div><div className="search-location"><MapPin size={17}/><span>Meru, Kenya</span><ChevronDown size={15}/></div><button className="btn btn-orange" type="submit">Find a pro <ArrowRight size={17}/></button></form>
          <div className="hero-proof"><div className="avatar-stack" aria-hidden="true"><span>J</span><span>M</span><span>A</span><span>K</span></div><div><strong>Made for local businesses</strong><small>Discover services, compare ratings, contact directly.</small></div><div className="hero-rating"><Star size={15} fill="currentColor"/> 4.8 <small>average rating</small></div></div>
        </div><div className="hero-visual"><img className="hero-photo" src="/images/contractor.jpg" alt="Contractor working on a home improvement project" fetchPriority="high"/><div className="photo-label"><span className="photo-icon"><CheckCircle size={21}/></span><div><strong>Good work starts here</strong><small>Find the right local expert</small></div></div><div className="floating-card"><span className="float-icon"><ShieldCheck size={20}/></span><div><strong>Quality-minded pros</strong><small>Ratings help you choose</small></div></div><div className="hero-sticker">BUILT FOR<br/><b>YOUR COMMUNITY</b></div></div></div>
        <div className="wrap category-strip">{categories.slice(1).map(({name,icon:Icon})=><button key={name} className="category-shortcut" onClick={()=>{setCategory(name);setSavedOnly(false);scrollToServices();}}><span className="shortcut-icon"><Icon size={23}/></span><span><strong>{name}</strong><small>Local experts</small></span><ArrowRight size={15} className="shortcut-arrow"/></button>)}</div>
      </section>
      <section className="services-section section" id="services"><div className="wrap">
        <div className="section-heading"><div><div className="eyebrow">MEET YOUR LOCAL EXPERTS</div><h2>{savedOnly ? "Your saved contractors" : "Who can help you today?"}</h2><p>Browse local service providers, compare their work and reach out directly.</p></div><button className="text-link" onClick={clearFilters}>Explore all pros <ArrowRight size={16}/></button></div>
        <div className="filter-row"><div className="category-pills" aria-label="Filter by trade">{categories.map(item=><button key={item.name} className={category===item.name ? "pill active" : "pill"} aria-pressed={category===item.name} onClick={()=>setCategory(item.name)}>{item.name}</button>)}</div><label className="sort-select"><SlidersHorizontal size={15}/><select aria-label="Sort contractors" value={sort} onChange={event=>setSort(event.target.value)}><option value="recommended">Recommended</option><option value="rating">Top rated</option><option value="price">Lowest starting price</option></select></label></div>
        {filtered.length ? <div className="contractor-grid">{filtered.map(provider=><article key={provider.id} className="pro-card"><div className="pro-image-wrap"><img src={provider.image} alt={provider.role} className="pro-image" loading="lazy"/><span className="pro-category">{provider.category}</span><button className={saved.includes(provider.id)?"save-btn is-saved":"save-btn"} onClick={()=>toggleSaved(provider.id)} aria-label={`${saved.includes(provider.id)?"Unsave":"Save"} ${provider.name}`} aria-pressed={saved.includes(provider.id)}><Bookmark size={17} fill={saved.includes(provider.id)?"currentColor":"none"}/></button></div><div className="pro-body"><div className="pro-name-row"><h3>{provider.name}</h3>{provider.verified&&<span className="verified" title="Sample verification badge"><ShieldCheck size={16}/></span>}</div><p className="pro-service">{provider.role}</p><div className="pro-meta"><span className="rating"><Star size={15} fill="currentColor"/><b>{provider.rating}</b> <small>({provider.reviews})</small></span><span><MapPin size={14}/>{provider.location}</span></div><div className="tag-row">{provider.skills.map(skill=><span key={skill}>{skill}</span>)}</div><div className="pro-footer"><div><small>Typical starting price</small><strong>{provider.price}</strong></div><button className="round-arrow" onClick={()=>setSelected(provider)} aria-label={`View ${provider.name}`}><ArrowRight size={19}/></button></div></div></article>)}</div> : <div className="empty-state"><Search size={30}/><h3>{savedOnly?"No saved contractors yet":"No matching contractors yet"}</h3><p>{savedOnly?"Save a contractor using the bookmark on their profile card.":"Try another search or clear your filters."}</p><button className="btn btn-dark" onClick={clearFilters}>Clear filters</button></div>}
        <div className="directory-bottom"><span aria-live="polite">Showing <b>{filtered.length}</b> contractor profiles</span><button className="text-link" onClick={()=>openEnquiry(null,"listing")}>Are you a contractor? Join ServiceHub <ArrowRight size={16}/></button></div>
      </div></section>
      <section className="product-section" id="products"><div className="wrap product-layout"><div className="product-copy"><div className="eyebrow">THE RIGHT TOOLS FOR THE JOB</div><h2>More than a service.<br/><span>Find the products, too.</span></h2><p>Explore products listed by local pros—from taps and lighting to paint kits and home security essentials.</p><button className="btn btn-dark" onClick={()=>setSelected(featuredProducts[0])}>Explore contractor products <ArrowRight size={17}/></button><div className="product-note"><ShoppingBag size={17}/> Product prices are indicative; confirm availability with the seller.</div></div><div className="product-showcase">{featuredProducts.map((provider,index)=>{const Icon=[Wrench,Zap,Hammer][index];return <button key={provider.id} className="product-mini" onClick={()=>setSelected(provider)}><span className={`product-mini-icon product-icon-${index}`}><Icon/></span><span className="product-mini-text"><strong>{provider.products[0].name}</strong><small>Listed by {provider.name}</small><b>{currency(provider.products[0].price)}</b></span><ArrowRight size={17}/></button>;})}</div></div></section>
      <section className="how-section section" id="how-it-works"><div className="wrap"><div className="center-heading"><div className="eyebrow">SIMPLE FROM START TO FINISH</div><h2>Good work begins with a connection.</h2><p>Three easy steps to get your next job moving.</p></div><div className="steps-grid"><div className="step-card"><span className="step-number">01</span><div className="step-icon"><Search size={25}/></div><h3>Find your expert</h3><p>Search by trade, service or location to discover the right person for the job.</p></div><div className="step-card"><span className="step-number">02</span><div className="step-icon"><MessageCircle size={25}/></div><h3>Compare &amp; connect</h3><p>Review ratings, services and product listings, then contact the contractor directly.</p></div><div className="step-card"><span className="step-number">03</span><div className="step-icon"><CheckCircle size={25}/></div><h3>Get it done</h3><p>Discuss your budget and timeline with your chosen pro and agree on the next steps.</p></div></div></div></section>
      <section className="join-banner"><div className="wrap join-inner"><div className="join-icon"><HardHat size={31}/></div><div className="join-copy"><div className="eyebrow">FOR LOCAL TRADESPEOPLE</div><h2>Good at what you do? Let more people find you.</h2><p>Create a service listing and show customers what you offer.</p></div><button className="btn btn-orange" onClick={()=>openEnquiry(null,"listing")}>List your services <ArrowRight size={17}/></button></div></section>
    </main>
    <footer className="footer"><div className="wrap"><div className="footer-main"><div className="footer-brand"><Brand onClick={clearFilters}/><p>Helping local skills meet local needs. Discover contractors and products for everyday projects.</p></div><div><h4>Explore</h4><a href="#services">Find a contractor</a><a href="#products">Products</a><a href="#how-it-works">How it works</a></div><div><h4>Popular services</h4>{categories.slice(1,5).map(item=><button key={item.name} onClick={()=>{setCategory(item.name);setSavedOnly(false);setSearch("");scrollToServices();}}>{item.name}</button>)}</div><div><h4>For contractors</h4><p>Reach new customers and showcase your services.</p><button className="footer-join" onClick={()=>openEnquiry(null,"listing")}>Get listed <ArrowRight size={14}/></button></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ServiceHub Marketplace</span><span>Built to connect local communities <ShieldCheck size={12}/></span><span>Sample profiles are for demonstration.</span></div></div></footer>
    {selected && <Modal titleId="profile-title" className="detail-modal" onClose={()=>setSelected(null)}><img className="detail-cover" src={selected.image} alt={selected.role}/><div className="detail-content"><span className="pro-category static-badge">{selected.category}</span><div className="detail-title-row"><div><h2 id="profile-title">{selected.name}</h2><p>{selected.role}</p></div><span className="rating detail-rating"><Star size={15} fill="currentColor"/> {selected.rating} ({selected.reviews})</span></div><div className="detail-location"><MapPin size={15}/>{selected.location}</div><p className="detail-bio">{selected.description}</p><div className="tag-row">{selected.skills.map(skill=><span key={skill}>{skill}</span>)}</div><h3 className="detail-subheading">Products from this contractor</h3><div className="detail-products">{selected.products.map(product=><button key={product.name} className="detail-product" onClick={()=>openEnquiry(selected,"product",product)} aria-label={`Enquire about ${product.name}`}><span className="detail-product-icon"><Package size={17}/></span><span><strong>{product.name}</strong><small>Ask about availability</small></span><b>{currency(product.price)}</b><ArrowRight size={16}/></button>)}</div><div className="detail-actions"><button className="btn btn-green" onClick={()=>openEnquiry(selected)}><Send size={16}/> Make an enquiry</button><button className="btn btn-outline" onClick={()=>toggleSaved(selected.id)}><Bookmark size={16}/>{saved.includes(selected.id)?"Saved":"Save contractor"}</button></div><small className="contact-disclaimer">Sample profile and prices. Enquiries go to the ServiceHub team, not a verified contractor. No purchase or booking is confirmed.</small></div></Modal>}
    {enquiry && <Modal titleId="enquiry-title" className="request-modal" onClose={()=>{if(!submitting)setEnquiry(null);}}>{sent ? <div className="confirmation" role="status"><CheckCircle size={36}/><h2 id="enquiry-title">Request received</h2><p>Your message has been submitted to the ServiceHub team. {enquiry.kind==="listing"?"Your listing request needs review before it appears on the site.":"Sample contractors are not contacted automatically, and no booking or purchase has been confirmed."}</p><button className="btn btn-dark" onClick={()=>setEnquiry(null)}>Done</button></div> : <><div className="eyebrow">{enquiry.kind==="listing"?"FOR LOCAL TRADESPEOPLE":"LET’S GET YOUR JOB MOVING"}</div><h2 id="enquiry-title">{enquiry.kind==="listing"?"List your services":enquiry.provider?`Contact ${enquiry.provider.name}`:"Contact ServiceHub"}</h2><p className="request-intro">{enquiry.kind==="listing"?"Tell the ServiceHub team about your trade, products and services. Listings are reviewed before publication.":"Share a few details about what you need. Your message is sent to the ServiceHub team for review."}</p><form name="servicehub-enquiry" method="POST" data-netlify="true" netlify-honeypot="bot-field" className="request-form" onSubmit={submitEnquiry}><input type="hidden" name="form-name" value="servicehub-enquiry"/><input type="hidden" name="provider" value={enquiry.provider?.name||"ServiceHub team"}/><input type="hidden" name="request-type" value={enquiry.kind}/><div hidden><label>Leave this empty<input name="bot-field" tabIndex={-1} autoComplete="off"/></label></div><label>Your name<input name="name" required maxLength={100} autoComplete="name" value={form.name} onChange={event=>setForm({...form,name:event.target.value})} placeholder="Your full name"/></label><label>Phone number<input name="phone" required type="tel" maxLength={30} autoComplete="tel" value={form.phone} onChange={event=>setForm({...form,phone:event.target.value})} placeholder="e.g. 07xx xxx xxx"/></label><label>Service category<select name="category" value={form.category} onChange={event=>setForm({...form,category:event.target.value})}>{categories.slice(1).map(item=><option key={item.name}>{item.name}</option>)}</select></label><label>Your location<input name="location" maxLength={150} value={form.location} onChange={event=>setForm({...form,location:event.target.value})} placeholder="Town or neighbourhood"/></label><label className="full-field">{enquiry.kind==="listing"?"Tell us about your services and products":"What do you need help with?"}<textarea name="details" required maxLength={3000} rows={4} value={form.details} onChange={event=>setForm({...form,details:event.target.value})} placeholder="Describe your services or the work you need…"/></label>{formError&&<p className="form-error full-field" role="alert">{formError}</p>}<button className="btn btn-orange full-field" disabled={submitting} type="submit">{submitting?"Sending…":"Send request"}<ArrowRight size={17}/></button><p className="form-disclaimer full-field">Your details are submitted securely to ServiceHub via Netlify Forms. They are not published on this page.</p></form></>}</Modal>}
    {authOpen && <Modal titleId="auth-title" className="request-modal" onClose={()=>{if(!authBusy)setAuthOpen(false);}}><div className="eyebrow">YOUR SERVICEHUB ACCOUNT</div><h2 id="auth-title">{user&&authMode!=="reset"?"Welcome to ServiceHub":authMode==="signup"?"Join your local community":authMode==="recover"?"Reset your password":authMode==="reset"?"Choose a new password":"Sign in to ServiceHub"}</h2>{user&&authMode!=="reset"?<><p className="request-intro">Signed in as {user.name || user.email}. Submit your services for review to get started.</p><div className="account-actions"><button className="btn btn-orange" onClick={()=>{setAuthOpen(false);openEnquiry(null,"listing");}}>List your services <ArrowRight size={17}/></button><button className="btn btn-outline" disabled={authBusy} onClick={signOut}><LogOut size={16}/> Sign out</button></div></>:<><p className="request-intro">{authMode==="signup"?"Create an account with your email. Confirm your email address before signing in.":"Connect with your local service community."}</p><form className="request-form" key={authMode} onSubmit={submitAuth}>{authMode==="signup"&&<label className="full-field">Your name<input name="name" autoComplete="name" required maxLength={100}/></label>}{authMode!=="reset"&&<label className="full-field">Email address<input name="email" type="email" autoComplete="email" required/></label>}{authMode!=="recover"&&<label className="full-field">Password<input name="password" type="password" required minLength={authMode==="login"?1:8} autoComplete={authMode==="login"?"current-password":"new-password"}/></label>}<button className="btn btn-dark full-field" type="submit" disabled={authBusy}>{authBusy?"Please wait…":authMode==="signup"?"Create account":authMode==="recover"?"Send reset link":authMode==="reset"?"Update password":"Sign in"}<ArrowRight size={17}/></button></form>{authMode!=="reset"&&<div className="auth-links"><button className="text-link" onClick={()=>{setAuthMode(authMode==="signup"?"login":"signup");setAuthError("");setAuthMessage("");}}>{authMode==="signup"?"Already have an account? Sign in":"New here? Join ServiceHub"}</button>{authMode==="login"&&<button className="text-link" onClick={()=>{setAuthMode("recover");setAuthError("");setAuthMessage("");}}>Forgot password?</button>}</div>}</>}{authError&&<p className="form-error" role="alert">{authError}</p>}{authMessage&&<p className="auth-message" role="status">{authMessage}</p>}</Modal>}
    {toast&&<div className="toast" role="status"><CheckCircle size={16}/>{toast}</div>}
  </div>;
}
