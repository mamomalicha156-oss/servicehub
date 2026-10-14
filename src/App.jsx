import { useMemo, useState } from "react";
import {
  Search, MapPin, Wrench, Zap, Hammer, Paintbrush, Snowflake, Star,
  Bookmark, MessageCircle, ShieldCheck, ArrowRight, Menu, X, Send,
  ShoppingBag, CheckCircle, ChevronDown, Clock
} from "lucide-react";

const categories = [
  { name: "All services", icon: ShoppingBag }, { name: "Plumbing", icon: Wrench },
  { name: "Electrical", icon: Zap }, { name: "Carpentry", icon: Hammer },
  { name: "Painting", icon: Paintbrush }, { name: "AC & Cooling", icon: Snowflake }
];
const initialProviders = [
  {id:1,name:"Peter Mwenda",role:"Plumbing specialist",category:"Plumbing",location:"Meru Town",rating:4.9,reviews:84,price:"From KSh 800",initials:"PM",color:"sage",verified:true,description:"Repairs, pipe installation, blocked drains, bathroom fittings and water-tank connections.",phone:"254700000001",skills:["Pipe repairs","Drain cleaning","Installations"]},
  {id:2,name:"Faith Nkirote",role:"Licensed electrician",category:"Electrical",location:"Kaaga, Meru",rating:4.8,reviews:67,price:"From KSh 1,000",initials:"FN",color:"peach",verified:true,description:"Home electrical repairs, lighting installation, sockets, wiring checks and troubleshooting.",phone:"254700000002",skills:["Lighting","Wiring","Fault finding"]},
  {id:3,name:"Martin Kinyua",role:"Carpenter & joiner",category:"Carpentry",location:"Makutano, Meru",rating:4.9,reviews:52,price:"From KSh 1,200",initials:"MK",color:"blue",verified:true,description:"Custom shelves, doors, wardrobes, furniture repairs and made-to-measure woodwork.",phone:"254700000003",skills:["Furniture","Doors","Cabinetry"]},
  {id:4,name:"Lydia Karimi",role:"Painter & decorator",category:"Painting",location:"Meru Town",rating:4.7,reviews:43,price:"From KSh 700",initials:"LK",color:"lavender",verified:false,description:"Interior and exterior painting, surface preparation, repainting and finishing.",phone:"254700000004",skills:["Interior","Exterior","Finishing"]},
  {id:5,name:"Dennis Mutuma",role:"AC & refrigeration tech",category:"AC & Cooling",location:"Kaaga, Meru",rating:4.8,reviews:39,price:"From KSh 1,500",initials:"DM",color:"mint",verified:true,description:"Air-conditioner servicing, refrigerator repairs, installation and cooling diagnostics.",phone:"254700000005",skills:["AC service","Repairs","Installation"]},
  {id:6,name:"Beatrice Muthoni",role:"Plumbing & maintenance",category:"Plumbing",location:"Gakoromone, Meru",rating:4.6,reviews:31,price:"From KSh 600",initials:"BM",color:"yellow",verified:false,description:"Small home repairs, tap replacement, leak detection and general maintenance.",phone:"254700000006",skills:["Leaks","Tap repairs","Maintenance"]}
];
function readStorage(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

export default function App() {
  const [providers] = useState(initialProviders);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All services");
  const [sort, setSort] = useState("recommended");
  const [saved, setSaved] = useState(() => readStorage("servicehub-saved", []));
  const [selected, setSelected] = useState(null);
  const [enquiry, setEnquiry] = useState(null);
  const [form, setForm] = useState({name:"",phone:"",details:""});
  const [sent, setSent] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = providers.filter(p =>
      (category === "All services" || p.category === category) &&
      (!term || [p.name,p.role,p.category,p.location,...p.skills].join(" ").toLowerCase().includes(term))
    );
    if (sort === "rating") result.sort((a,b) => b.rating-a.rating);
    if (sort === "price") result.sort((a,b) => Number(a.price.replace(/\\D/g,""))-Number(b.price.replace(/\\D/g,"")));
    return result;
  }, [providers, search, category, sort]);

  function toggleSaved(id) {
    const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved,id];
    setSaved(next);
    localStorage.setItem("servicehub-saved", JSON.stringify(next));
  }
  function openEnquiry(provider = null) {
    setSelected(null); setEnquiry(provider);
    setForm(current => ({...current, details: provider ? `I would like to enquire about ${provider.category.toLowerCase()} services.` : current.details}));
    setSent(false);
  }
  function submitEnquiry(event) {
    event.preventDefault();
    const record = {...form, provider: enquiry?.name || "General enquiry", createdAt:new Date().toISOString()};
    localStorage.setItem("servicehub-enquiries", JSON.stringify([record,...readStorage("servicehub-enquiries",[])]));
    setSent(true);
  }
  const scrollToServices = () => { document.getElementById("services")?.scrollIntoView({behavior:"smooth"}); setMobileMenu(false); };

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#home"><span className="brand-mark"><Wrench size={22}/></span><span>service<span className="brand-accent">hub</span><small>LOCAL HELP. DONE RIGHT.</small></span></a>
      <nav className={mobileMenu ? "nav-links nav-open" : "nav-links"}>
        <a href="#services" onClick={()=>setMobileMenu(false)}>Find a pro</a><a href="#how-it-works" onClick={()=>setMobileMenu(false)}>How it works</a><a href="#about" onClick={()=>setMobileMenu(false)}>About</a>
      </nav>
      <div className="top-actions"><button className="saved-count" onClick={scrollToServices}><Bookmark size={16}/> Saved <span>{saved.length}</span></button><button className="btn btn-dark btn-small" onClick={()=>openEnquiry(null)}>Join as a pro <ArrowRight size={16}/></button></div>
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={()=>setMobileMenu(!mobileMenu)}>{mobileMenu?<X/>:<Menu/>}</button>
    </header>
    <main>
      <section className="hero" id="home">
        <div className="hero-content"><div className="eyebrow"><span className="eyebrow-dot"/> MERU'S LOCAL SERVICE MARKETPLACE</div>
          <h1>Good help is<br/>closer than <em>you think.</em></h1>
          <p className="hero-copy">Find skilled, trusted local professionals for all the jobs that make a house feel like home.</p>
          <div className="search-panel"><div className="search-field"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="What do you need help with?" aria-label="Search services"/></div><div className="search-location"><MapPin size={18}/><span>Meru, Kenya</span><ChevronDown size={15}/></div><button className="btn btn-orange search-button" onClick={scrollToServices}>Find a pro <ArrowRight size={17}/></button></div>
          <div className="hero-trust"><div className="avatar-stack"><span>PM</span><span>FN</span><span>MK</span><span>+</span></div><div><strong>Local people. Real skills.</strong><small>Discover service providers around Meru</small></div></div>
        </div>
        <div className="hero-art"><div className="art-blob"></div><div className="art-card art-card-top"><span className="art-icon"><ShieldCheck size={20}/></span><div><strong>Trusted local pros</strong><small>Profiles you can explore</small></div><CheckCircle size={18} className="green-check"/></div>
          <div className="illustration"><div className="sun"></div><div className="house-shadow"></div><div className="house"><div className="roof"></div><div className="house-body"><div className="window window-left"></div><div className="door"></div><div className="window window-right"></div></div></div><div className="plant plant-left"><i></i><i></i><i></i><b></b></div><div className="plant plant-right"><i></i><i></i><i></i><b></b></div><div className="person"><div className="person-head"></div><div className="person-body"></div><div className="person-arm"></div><div className="toolbox"><Wrench size={20}/></div></div><div className="ground"></div></div>
          <div className="art-card art-card-bottom"><div className="rating-star"><Star size={19} fill="currentColor"/></div><div><strong>Find your next pro</strong><small>Browse skills, ratings & details</small></div></div><span className="decor-dot dot-one"></span><span className="decor-dot dot-two"></span><span className="decor-cross">✳</span>
        </div>
      </section>
      <section className="trust-strip"><div><ShieldCheck size={20}/><span><strong>Clear profiles</strong><small>Know who you're contacting</small></span></div><div><Star size={20}/><span><strong>Ratings at a glance</strong><small>Compare local providers</small></span></div><div><MessageCircle size={20}/><span><strong>Easy enquiries</strong><small>Contact pros directly</small></span></div><div><MapPin size={20}/><span><strong>Made for Meru</strong><small>Local service discovery</small></span></div></section>
      <section className="services-section section-wrap" id="services"><div className="section-heading"><div><div className="eyebrow">YOUR HOME, TAKEN CARE OF</div><h2>Find the right person<br/>for the <em>job.</em></h2></div><p>From quick fixes to bigger projects, explore local talent ready to help.</p></div>
        <div className="category-row">{categories.map(({name,icon:Icon})=><button key={name} className={`category-chip ${category===name?"active":""}`} onClick={()=>setCategory(name)}><Icon size={17}/>{name}</button>)}</div>
        <div className="results-toolbar"><p><strong>{filtered.length} local pros</strong> <span>to explore</span></p><label className="sort-select">Sort by <select value={sort} onChange={e=>setSort(e.target.value)}><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="price">Lowest starting price</option></select><ChevronDown size={14}/></label></div>
        {filtered.length ? <div className="provider-grid">{filtered.map(p=><article className="provider-card" key={p.id}>
          <div className={`provider-portrait ${p.color}`}><span>{p.initials}</span><div className="portrait-label">LOCAL PRO</div><button className={`save-button ${saved.includes(p.id)?"is-saved":""}`} onClick={()=>toggleSaved(p.id)} aria-label={saved.includes(p.id)?"Remove saved provider":"Save provider"}><Bookmark size={17} fill={saved.includes(p.id)?"currentColor":"none"}/></button></div>
          <div className="provider-info"><div className="provider-name-row"><div><h3>{p.name}</h3><p>{p.role}</p></div>{p.verified&&<span className="verified" title="Profile marked as verified"><ShieldCheck size={17}/></span>}</div><div className="provider-meta"><span className="rating"><Star size={14} fill="currentColor"/> {p.rating} <small>({p.reviews})</small></span><span><MapPin size={14}/>{p.location}</span></div><div className="card-bottom"><strong>{p.price}</strong><button onClick={()=>setSelected(p)} className="view-link">View profile <ArrowRight size={15}/></button></div></div>
        </article>)}</div> : <div className="empty-state"><Search size={28}/><h3>No providers found</h3><p>Try another search or choose a different category.</p><button className="btn btn-dark" onClick={()=>{setSearch("");setCategory("All services");}}>Clear filters</button></div>}
        <div className="browse-footer"><span>Showing {filtered.length} of {providers.length} sample providers</span><button className="text-button" onClick={()=>{setCategory("All services");setSearch("");}}>Browse all services <ArrowRight size={16}/></button></div>
      </section>
      <section className="how-section" id="how-it-works"><div className="section-wrap"><div className="center-heading"><div className="eyebrow">SIMPLE FROM START TO FINISH</div><h2>Getting help should be <em>easy.</em></h2><p>Three simple steps to get your to-do list moving.</p></div><div className="steps-grid">
        <div className="step-card"><span className="step-number">01</span><div className="step-icon"><Search size={24}/></div><h3>Search your service</h3><p>Choose a category or search for the exact skill you need.</p></div><div className="step-connector">··········→</div>
        <div className="step-card"><span className="step-number">02</span><div className="step-icon"><ShieldCheck size={24}/></div><h3>Compare local pros</h3><p>Explore provider profiles, locations, ratings and starting prices.</p></div><div className="step-connector">··········→</div>
        <div className="step-card"><span className="step-number">03</span><div className="step-icon"><MessageCircle size={24}/></div><h3>Make an enquiry</h3><p>Send your details and connect with a professional directly.</p></div>
      </div></div></section>
      <section className="cta-section section-wrap" id="about"><div className="cta-inner"><div className="cta-symbol"><Wrench size={28}/></div><div><div className="eyebrow">ARE YOU A SKILLED PROFESSIONAL?</div><h2>Good at what you do?<br/><em>Let Meru know.</em></h2><p>Showcase your skills and help more people discover your services.</p></div><button className="btn btn-orange" onClick={()=>openEnquiry(null)}>Get listed <ArrowRight size={17}/></button><span className="cta-spark">✳</span></div></section>
    </main>
    <footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark"><Wrench size={20}/></span><span>service<span className="brand-accent">hub</span><small>LOCAL HELP. DONE RIGHT.</small></span></a><p>Connecting Meru with skilled local professionals.</p><span>© {new Date().getFullYear()} ServiceHub Marketplace</span></footer>
    {selected && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}><section className="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><button className="modal-close" onClick={()=>setSelected(null)} aria-label="Close"><X/></button><div className={`profile-banner ${selected.color}`}><span className="profile-avatar">{selected.initials}</span><span className="profile-badge"><MapPin size={14}/> {selected.location}</span></div><div className="profile-content"><div className="eyebrow">{selected.category.toUpperCase()} PROFESSIONAL</div><h2 id="profile-title">{selected.name} {selected.verified&&<ShieldCheck className="inline-verified" size={21}/>}</h2><p className="profile-role">{selected.role}</p><div className="profile-stats"><span><Star size={16} fill="currentColor"/> <strong>{selected.rating}</strong> ({selected.reviews} reviews)</span><span><Clock size={16}/> Contact to confirm availability</span></div><p className="profile-description">{selected.description}</p><h4>Skills and services</h4><div className="skill-list">{selected.skills.map(skill=><span key={skill}>{skill}</span>)}</div><div className="profile-price"><span>Starting price</span><strong>{selected.price.replace("From ","")}</strong></div><div className="modal-actions"><button className="btn btn-orange" onClick={()=>openEnquiry(selected)}><Send size={16}/> Send an enquiry</button><a className="btn btn-outline" href={`https://wa.me/${selected.phone}?text=${encodeURIComponent(`Hello ${selected.name}, I found your profile on ServiceHub and would like to enquire about your services.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a></div><p className="demo-note">Demo profile: confirm provider details before arranging a service.</p></div></section></div>}
    {enquiry!==null && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEnquiry(null);}}><section className="modal enquiry-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-title"><button className="modal-close" onClick={()=>setEnquiry(null)} aria-label="Close"><X/></button>{sent ? <div className="success-state"><span><CheckCircle size={34}/></span><h2>Enquiry saved!</h2><p>Your enquiry has been saved in this browser for demonstration. This demo does not send it to a real provider.</p><button className="btn btn-dark" onClick={()=>setEnquiry(null)}>Done</button></div> : <><div className="modal-heading-icon"><Send size={22}/></div><div className="eyebrow">LET'S GET IT SORTED</div><h2 id="enquiry-title">{enquiry?`Contact ${enquiry.name.split(" ")[0]}`:"List your services"}</h2><p className="modal-intro">{enquiry?"Tell the provider a little about the work you need done.":"Are you a professional or looking for help? Leave your details and message."}</p><form onSubmit={submitEnquiry} className="enquiry-form"><label>Your name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Enter your full name"/></label><label>Phone number<input required type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="e.g. 07xx xxx xxx"/></label><label>{enquiry?"What do you need help with?":"Tell us about your services or request"}<textarea required rows="4" value={form.details} onChange={e=>setForm({...form,details:e.target.value})} placeholder="Write a short message..."/></label><button className="btn btn-orange submit-button" type="submit">Submit enquiry <ArrowRight size={17}/></button><p className="form-privacy">Demo only: your details are stored in this browser, not sent to a server.</p></form></>}</section></div>}
  </div>;
}
