import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, MapPin, Wrench, Zap, Hammer, Paintbrush, Snowflake, Star,
  Bookmark, MessageCircle, ShieldCheck, ArrowRight, Menu, X, Send,
  ShoppingBag, CheckCircle, ChevronDown, SlidersHorizontal, HardHat, LayoutGrid,
} from "lucide-react";

const categories = [
  { name: "All services", icon: Wrench },
  { name: "Plumbers", icon: Wrench },
  { name: "Electricians", icon: Zap },
  { name: "Carpenters", icon: Hammer },
  { name: "Painters", icon: Paintbrush },
  { name: "AC & Fridge", icon: Snowflake },
];

const initialProviders = [
  { id: 2, name: "BrightSpark Electricals", category: "Electricians", service: "Electrical installation & repair", location: "Kaaga, Meru", rating: 4.8, reviews: 64, price: "From KSh 1,000", verified: true, image: "/images/electrical.jpg", tags: ["Wiring", "Lighting"], bio: "Electrical installation, troubleshooting, lighting upgrades and maintenance.", phone: "254712345602", products: [{ name: "LED security light", price: 1800 }] },
  { id: 4, name: "FreshCoat Painting", category: "Painters", service: "Interior & exterior painting", location: "Gakoromone, Meru", rating: 4.7, reviews: 42, price: "From KSh 600 / room", verified: false, image: "/images/painting.jpg", tags: ["House painting", "Waterproofing"], bio: "Residential painting, colour advice and clean finishes.", phone: "254712345604", products: [{ name: "Paint roller kit", price: 950 }] },
  { id: 6, name: "SecureHome Installers", category: "Electricians", service: "CCTV & security systems", location: "Kianjai, Meru", rating: 4.6, reviews: 29, price: "From KSh 2,000", verified: true, image: "/images/security.jpg", tags: ["CCTV cameras", "Alarm systems"], bio: "Security camera and alarm installations for homes and small businesses.", phone: "254712345606", products: [{ name: "Wi-Fi security camera", price: 3200 }] },
  { id: 3, name: "Muriithi Woodcraft", category: "Carpenters", service: "Custom furniture & carpentry", location: "Makutano, Meru", rating: 4.9, reviews: 51, price: "From KSh 1,500", verified: true, image: "/images/carpentry.jpg", tags: ["Wardrobes", "Doors"], bio: "Custom furniture, door fitting, shelves and home woodwork.", phone: "254712345603", products: [{ name: "Floating wall shelf", price: 1500 }] },
  { id: 1, name: "Kamau Plumbing Works", category: "Plumbers", service: "Plumbing & water systems", location: "Meru Town", rating: 4.9, reviews: 86, price: "From KSh 800", verified: true, image: "/images/plumbing.jpg", tags: ["Pipe repairs", "Water tanks"], bio: "Home and business plumbing, leak repairs and bathroom installations.", phone: "254712345601", products: [{ name: "Kitchen mixer tap", price: 2400 }, { name: "PVC pipe set", price: 850 }] },
  { id: 5, name: "CoolPoint Appliance Care", category: "AC & Fridge", service: "Fridge & air conditioner repair", location: "Meru Town", rating: 4.8, reviews: 37, price: "From KSh 1,200", verified: true, image: null, tags: ["AC servicing", "Fridge repair"], bio: "Appliance diagnostics, AC servicing and refrigeration maintenance.", phone: "254712345605", products: [{ name: "Universal AC remote", price: 1200 }] },
];

function Brand() {
  return <><span className="brand-mark"><HardHat size={25} /></span><span>service<span className="brand-accent">hub</span><small>LOCAL PROS, ONE PLACE</small></span></>;
}

function ProviderImage({ provider, className }) {
  const [failed, setFailed] = useState(false);
  return provider.image && !failed
    ? <img className={className} src={provider.image} alt={provider.service} loading="lazy" onError={() => setFailed(true)} />
    : <div className={`${className} image-placeholder`} role="img" aria-label={provider.service}><Snowflake size={42} strokeWidth={1.2} /><span>{provider.service}</span></div>;
}

function Modal({ children, className, titleId, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current.focus();
    function handleKey(event) {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab") return;
      const controls = [...dialogRef.current.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(control => !control.disabled && !control.hidden && control.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className={className} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
      <button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
      {children}
    </section>
  </div>;
}

export default function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All services");
  const [sort, setSort] = useState("recommended");
  const [saved, setSaved] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [productsTab, setProductsTab] = useState(false);
  const [enquiry, setEnquiry] = useState(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = initialProviders.filter(provider =>
      (category === "All services" || provider.category === category) &&
      (!savedOnly || saved.includes(provider.id)) &&
      (!term || [provider.name, provider.service, provider.category, provider.location, ...provider.tags].join(" ").toLowerCase().includes(term))
    );
    if (sort === "rating") result.sort((first, second) => second.rating - first.rating);
    return result;
  }, [search, category, sort, saved, savedOnly]);

  function scrollToServices() {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  }

  function clearFilters() {
    setSearch("");
    setCategory("All services");
    setSavedOnly(false);
  }

  function chooseCategory(name) {
    setCategory(name);
    setSavedOnly(false);
    scrollToServices();
  }

  function toggleSaved(id) {
    setSaved(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  function openProfile(provider, showProducts = false) {
    setSelected(provider);
    setProductsTab(showProducts);
  }

  function openEnquiry(provider = null) {
    setSelected(null);
    setEnquiry({ provider });
    setSent(false);
    setSubmitError("");
    setMobileMenu(false);
  }

  async function submitEnquiry(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });
      if (!response.ok) throw new Error("Submission failed");
      setSent(true);
    } catch {
      setSubmitError("Your request could not be sent. Please try again when your connection is available.");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="site-shell" id="home">
    <div className="topbar"><div className="wrap topbar-inner">
      <span><MapPin size={14} /> Serving Meru and nearby communities</span>
      <span className="top-note">Local skills. Trusted hands. Better homes.</span>
      <button className="topbar-contact" onClick={() => openEnquiry()}>Contact us</button>
    </div></div>
    <header className="header"><div className="wrap header-inner">
      <a className="brand" href="#home" onClick={clearFilters}><Brand /></a>
      <nav id="main-navigation" className={mobileMenu ? "nav nav-open" : "nav"} aria-label="Main navigation">
        <a href="#services" onClick={() => setMobileMenu(false)}>Find a pro</a>
        <a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a>
        <a href="#products" onClick={() => setMobileMenu(false)}>Shop products</a>
        <button className="nav-saved" aria-pressed={savedOnly} onClick={() => { setSavedOnly(!savedOnly); setCategory("All services"); setSearch(""); scrollToServices(); }}><Bookmark size={16} /> Saved <span>{saved.length}</span></button>
        <button className="btn btn-dark nav-cta" onClick={() => openEnquiry()}><LayoutGrid size={15} /> Sign in / Join</button>
      </nav>
      <button className="mobile-toggle" aria-label="Toggle menu" aria-expanded={mobileMenu} aria-controls="main-navigation" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button>
    </div></header>
    <main>
      <section className="hero"><div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR LOCAL SERVICE MARKETPLACE</div>
          <h1>Find the right hands for <span>every job.</span></h1>
          <p className="hero-lead">From a leaking tap to a fresh coat of paint, meet skilled local contractors and discover the tools and products they use.</p>
          <form className="search-panel" role="search" onSubmit={event => { event.preventDefault(); setSavedOnly(false); scrollToServices(); }}>
            <div className="search-input"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Try plumber, wiring, painting..." aria-label="Search contractors by trade, service or location" /></div>
            <div className="search-location"><MapPin size={17} /><span>Meru, Kenya</span><ChevronDown size={15} /></div>
            <button className="btn btn-orange" type="submit">Find a pro <ArrowRight size={17} /></button>
          </form>
          <div className="hero-proof"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>K</span></div><div><strong>Made for local businesses</strong><small>Discover services, compare ratings, contact directly.</small></div><div className="hero-rating"><Star size={15} fill="currentColor" /> 4.8 <small>average rating</small></div></div>
        </div>
        <div className="hero-visual">
          <img className="hero-photo" src="/images/hero.jpg" alt="Contractor working on a home improvement project" fetchPriority="high" />
          <div className="photo-label"><span className="photo-icon"><CheckCircle size={21} /></span><div><strong>Good work starts here</strong><small>Find the right local expert</small></div></div>
          <div className="floating-card"><span className="float-icon"><ShieldCheck size={20} /></span><div><strong>Quality-minded pros</strong><small>Ratings help you choose</small></div></div>
          <div className="hero-sticker">BUILT FOR<br /><b>YOUR COMMUNITY</b></div>
        </div>
      </div><div className="wrap category-strip">{categories.slice(1).map(({ name, icon: Icon }) => <button key={name} className="category-shortcut" onClick={() => chooseCategory(name)}><span className="shortcut-icon"><Icon size={21} /></span><span><strong>{name}</strong><small>Local experts</small></span><ArrowRight size={15} className="shortcut-arrow" /></button>)}</div></section>

      <section className="section services-section" id="services"><div className="wrap">
        <div className="section-heading"><div><div className="eyebrow">MEET YOUR LOCAL EXPERTS</div><h2>{savedOnly ? "Your saved contractors" : "Who can help you today?"}</h2><p>Browse local service providers, compare their work and reach out directly.</p></div><button className="text-link" onClick={clearFilters}>Explore all pros <ArrowRight size={17} /></button></div>
        <div className="filter-row"><div className="category-pills" aria-label="Service categories">{categories.map(({ name }) => <button key={name} className={category === name ? "pill active" : "pill"} aria-pressed={category === name} onClick={() => { setCategory(name); setSavedOnly(false); }}>{name}</button>)}</div><label className="sort-select"><SlidersHorizontal size={16} /><select aria-label="Sort contractors" value={sort} onChange={event => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="rating">Top rated</option></select></label></div>
        {filtered.length ? <div className="contractor-grid">{filtered.map(provider => <article key={provider.id} className="pro-card">
          <div className="pro-image-wrap"><ProviderImage provider={provider} className="pro-image" /><span className="pro-category">{provider.category}</span><button className={saved.includes(provider.id) ? "save-btn is-saved" : "save-btn"} onClick={() => toggleSaved(provider.id)} aria-pressed={saved.includes(provider.id)} aria-label={`${saved.includes(provider.id) ? "Unsave" : "Save"} ${provider.name}`}><Bookmark size={17} fill={saved.includes(provider.id) ? "currentColor" : "none"} /></button></div>
          <div className="pro-body"><div className="pro-name-row"><h3><button className="provider-name" onClick={() => openProfile(provider)}>{provider.name}</button></h3>{provider.verified && <span className="verified" title="Verified sample profile"><ShieldCheck size={16} /></span>}</div><p className="pro-service">{provider.service}</p><div className="pro-meta"><span className="rating"><Star size={15} fill="currentColor" /><b>{provider.rating}</b> <small>({provider.reviews})</small></span><span><MapPin size={14} />{provider.location}</span></div><div className="tag-row">{provider.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="pro-footer"><div><small>Typical starting price</small><strong>{provider.price}</strong></div><button className="round-arrow" onClick={() => openProfile(provider)} aria-label={`View ${provider.name}`}><ArrowRight size={19} /></button></div></div>
        </article>)}</div> : <div className="empty-state" role="status"><Search size={30} /><h3>{savedOnly ? "No saved contractors yet" : "No matching contractors yet"}</h3><p>{savedOnly ? "Use the bookmark on a contractor to save them for this visit." : "Try another search or clear your filters."}</p><button className="btn btn-dark" onClick={clearFilters}>Clear filters</button></div>}
        <div className="directory-bottom"><span role="status">Showing <b>{filtered.length}</b> contractor profiles</span><button className="text-link" onClick={() => openEnquiry()}>Are you a contractor? Join ServiceHub <ArrowRight size={16} /></button></div>
      </div></section>

      <section className="product-section" id="products"><div className="wrap product-layout">
        <div className="product-copy"><div className="eyebrow">THE RIGHT TOOLS FOR THE JOB</div><h2>More than a service.<br /><span>Find the products, too.</span></h2><p>Explore products listed by local pros—from taps and lighting to paint kits and home security essentials.</p><button className="btn btn-dark" onClick={() => openProfile(initialProviders[0], true)}>Explore contractor products <ArrowRight size={17} /></button><div className="product-note"><ShoppingBag size={17} /> Product prices are indicative; confirm availability with the seller.</div></div>
        <div className="product-showcase">{initialProviders.slice(0, 3).map((provider, index) => { const Icon = [Wrench, Zap, Hammer][index]; const product = provider.products[0]; return <button key={provider.id} className="product-mini" onClick={() => openProfile(provider, true)}><span className={`product-mini-icon product-icon-${index}`}><Icon /></span><span className="product-mini-text"><strong>{product.name}</strong><small>Listed by {provider.name}</small><b>KSh {product.price.toLocaleString("en-KE")}</b></span><ArrowRight size={17} /></button>; })}</div>
      </div></section>

      <section className="how-section section" id="how-it-works"><div className="wrap"><div className="center-heading"><div className="eyebrow">SIMPLE FROM START TO FINISH</div><h2>Good work begins with a connection.</h2><p>Three easy steps to get your next job moving.</p></div><div className="steps-grid">
        <div className="step-card"><span className="step-number">01</span><div className="step-icon"><Search size={25} /></div><h3>Find your expert</h3><p>Search by trade, service or location to discover the right person for the job.</p></div>
        <div className="step-card"><span className="step-number">02</span><div className="step-icon"><MessageCircle size={25} /></div><h3>Compare &amp; connect</h3><p>Review ratings, services and product listings, then contact the contractor directly.</p></div>
        <div className="step-card"><span className="step-number">03</span><div className="step-icon"><CheckCircle size={25} /></div><h3>Get it done</h3><p>Discuss your budget and timeline with your chosen pro and agree on the next steps.</p></div>
      </div></div></section>

      <section className="join-banner"><div className="wrap join-inner"><div className="join-icon"><HardHat size={31} /></div><div><div className="eyebrow">FOR LOCAL TRADESPEOPLE</div><h2>Good at what you do? Let more people find you.</h2><p>Create a service listing and show customers what you offer.</p></div><button className="btn btn-orange" onClick={() => openEnquiry()}>List your services <ArrowRight size={17} /></button></div></section>
    </main>

    <footer className="footer"><div className="wrap footer-main">
      <div className="footer-brand"><a href="#home" className="brand"><Brand /></a><p>Helping local skills meet local needs. Discover contractors and products for everyday projects.</p></div>
      <div><h4>Explore</h4><a href="#services">Find a contractor</a><a href="#products">Products</a><a href="#how-it-works">How it works</a></div>
      <div><h4>Popular services</h4>{categories.slice(1, 5).map(({ name }) => <button key={name} onClick={() => chooseCategory(name)}>{name}</button>)}</div>
      <div><h4>For contractors</h4><p>Reach new customers and showcase your services.</p><button className="footer-join" onClick={() => openEnquiry()}>Get listed <ArrowRight size={15} /></button></div>
    </div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} ServiceHub Marketplace</span><span>Built to connect local communities <MapPin size={13} /></span><span>Sample profiles are for demonstration.</span></div></footer>

    {selected && <Modal className="detail-modal" titleId="profile-title" onClose={() => setSelected(null)}>
      <ProviderImage provider={selected} className="detail-cover" />
      <div className="detail-content"><span className="pro-category static-badge">{selected.category}</span><div className="detail-title-row"><div><h2 id="profile-title">{selected.name}</h2><p>{selected.service}</p></div><span className="rating detail-rating"><Star size={16} fill="currentColor" />{selected.rating} <small>({selected.reviews} reviews)</small></span></div><div className="detail-location"><MapPin size={16} />{selected.location}<span>•</span><strong>{selected.price}</strong></div><p className="detail-bio">{selected.bio}</p><h3>Services offered</h3><div className="detail-tags">{selected.tags.map(tag => <span key={tag}><CheckCircle size={14} />{tag}</span>)}</div>
        <div className="detail-tabs" role="tablist" aria-label="Contractor details"><button id="about-tab" role="tab" aria-controls="about-panel" aria-selected={!productsTab} className={!productsTab ? "tab-active" : ""} onClick={() => setProductsTab(false)}>About &amp; services</button><button id="products-tab" role="tab" aria-controls="products-panel" aria-selected={productsTab} className={productsTab ? "tab-active" : ""} onClick={() => setProductsTab(true)}>Products ({selected.products.length})</button></div>
        {productsTab ? <div className="detail-products" id="products-panel" role="tabpanel" aria-labelledby="products-tab">{selected.products.map(product => <div className="detail-product" key={product.name}><span className="detail-product-icon"><ShoppingBag /></span><span><strong>{product.name}</strong><small>Listed by contractor</small></span><b>KSh {product.price.toLocaleString("en-KE")}</b></div>)}</div> : <div className="profile-note" id="about-panel" role="tabpanel" aria-labelledby="about-tab"><ShieldCheck size={20} /><span><strong>Discuss your project directly</strong><small>Confirm scope, materials, final pricing and timing before work begins.</small></span></div>}
        <div className="detail-actions"><a className="btn btn-green" href={`https://wa.me/${selected.phone}?text=${encodeURIComponent(`Hello ${selected.name}, I found your listing on ServiceHub and would like to enquire about ${selected.service}.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp contractor</a><button className="btn btn-outline" onClick={() => openEnquiry(selected)}><Send size={16} /> Send enquiry</button></div><small className="contact-disclaimer">Sample profile. Confirm contractor contact details before arranging work.</small>
      </div>
    </Modal>}

    {enquiry && <Modal className="request-modal" titleId="enquiry-title" onClose={() => setEnquiry(null)}>
      <div className="eyebrow">LET’S CONNECT</div><h2 id="enquiry-title">{enquiry.provider ? `Enquire with ${enquiry.provider.name}` : "Join the local community"}</h2>
      <p className="request-intro">{enquiry.provider ? "Tell us about the work you need done. Your enquiry is sent to the ServiceHub site team." : "Request a contractor listing or contact the ServiceHub team. Account sign-in and self-service listings are not available on this site yet."}</p>
      {sent ? <div className="confirmation" role="status"><CheckCircle size={36} /><h3>Request received!</h3><p>Your request has been sent to the ServiceHub site team. Sample contractor profiles do not receive enquiries directly.</p><button className="btn btn-dark" onClick={() => setEnquiry(null)}>Done</button></div> : <form className="request-form" name="servicehub-enquiry" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submitEnquiry}>
        <input type="hidden" name="form-name" value="servicehub-enquiry" /><input type="hidden" name="provider" value={enquiry.provider?.name || "Listing request / general enquiry"} /><p hidden><label>Leave this field empty<input name="bot-field" /></label></p>
        <label>Your name *<input name="name" required maxLength={120} autoComplete="name" placeholder="Full name" /></label>
        <label>Phone number *<input name="phone" required type="tel" maxLength={30} autoComplete="tel" placeholder="07xx xxx xxx" /></label>
        <label className="full-field">{enquiry.provider ? "What do you need help with? *" : "Your services or message *"}<textarea name="message" required maxLength={4000} rows={4} placeholder="Tell us a little about your request..." defaultValue={enquiry.provider ? `I would like to enquire about ${enquiry.provider.service.toLowerCase()}.` : ""} /></label>
        {submitError && <p className="submission-error full-field" role="alert">{submitError}</p>}
        <button className="btn btn-orange full-field" type="submit" disabled={submitting}>{submitting ? "Sending request…" : "Send request"}<ArrowRight size={17} /></button><small className="form-disclaimer full-field">Your contact details are shared with the site team only to respond to your request.</small>
      </form>}
    </Modal>}
  </div>;
}
