import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowUpRight, Check, ChevronRight, Clock3, Mail, MapPin, Menu, Send, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { gallery, services, text } from './data';
import type { Language } from './data';
import { AnimIcon, FooterWaves, Panorama, Plane } from './art';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') { node.classList.add('is-visible'); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { node.classList.add('is-visible'); observer.disconnect(); }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function Brand({ lang }: { lang: Language }) {
  return (
    <Link href="/" className="brand" data-testid="link-brand">
      <img src="/logo.png" alt="The International Route Logistics Company" className="brand-mark" />
      <span className="brand-copy">
        <span className="brand-name">{lang === 'en' ? 'The International Route' : 'المسار الدولي'}</span>
        <span className="brand-ar arabic" dir="rtl">{lang === 'en' ? 'المسار الدولي للحلول اللوجيستية' : 'للحلول اللوجيستية'}</span>
      </span>
    </Link>
  );
}

export function Header({ lang, onLanguageChange }: { lang: Language; onLanguageChange: () => void }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const nav = [
    { href: '/', en: 'About us', ar: 'من نحن' },
    { href: '/services', en: 'Our services', ar: 'خدماتنا' },
    { href: '/contact', en: 'Contact', ar: 'تواصل معنا' },
  ];
  useEffect(() => setOpen(false), [location]);
  return (
    <header className="header">
      <div className="container-wide header-inner">
        <Brand lang={lang} />
        <nav className={`nav ${open ? 'open' : ''}`} aria-label={lang === 'en' ? 'Main navigation' : 'التنقل الرئيسي'}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={`nav-link ${location === item.href ? 'active' : ''}`} data-testid={`link-nav-${item.href.slice(1) || 'home'}`}>{lang === 'en' ? item.en : item.ar}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="language-switch arabic" onClick={onLanguageChange} data-testid="button-language-switch" aria-label={lang === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}>{lang === 'en' ? 'العربية' : 'English'}</button>
          <Link href="/contact" className="button-primary header-cta" data-testid="link-header-contact">{lang === 'en' ? 'Start a conversation' : 'ابدأ محادثة'} <ArrowUpRight size={15} className="arrow-icon" /></Link>
          <button className="menu-button" onClick={() => setOpen((current) => !current)} data-testid="button-mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </div>
    </header>
  );
}

export function Footer({ lang }: { lang: Language }) {
  return (
    <footer className="footer">
      <FooterWaves />
      <div className="container-wide">
        <div className="footer-grid">
          <div>
            <Brand lang={lang} />
            <p className="footer-text" style={{ maxWidth: 300, marginTop: 22 }}>{lang === 'en' ? 'Dependable freight movement, coordinated with care from the first mile to the final handover.' : 'حركة شحن موثوقة، بتنسيق دقيق من الميل الأول حتى التسليم النهائي.'}</p>
          </div>
          <div>
            <div className="footer-heading">{lang === 'en' ? 'Explore' : 'استكشف'}</div>
            <Link href="/" className="footer-link" data-testid="link-footer-home">{lang === 'en' ? 'About us' : 'من نحن'}</Link>
            <Link href="/services" className="footer-link" data-testid="link-footer-services">{lang === 'en' ? 'Our services' : 'خدماتنا'}</Link>
            <Link href="/contact" className="footer-link" data-testid="link-footer-contact">{lang === 'en' ? 'Contact' : 'تواصل معنا'}</Link>
          </div>
          <div>
            <div className="footer-heading">{lang === 'en' ? 'Connect' : 'تواصل'}</div>
            <a className="footer-link" href="mailto:ezzaldein1980@gmail.com" data-testid="link-footer-email">ezzaldein1980@gmail.com</a>
            <span className="footer-text">{lang === 'en' ? 'Amman · Jordan · Global' : 'عمّان · الأردن · حول العالم'}</span>
          </div>
          <div>
            <div className="footer-heading">{lang === 'en' ? 'Operating hours' : 'ساعات العمل'}</div>
            <span className="footer-text">{lang === 'en' ? 'Sunday — Thursday' : 'الأحد — الخميس'}</span>
            <span className="footer-text">08:00 — 18:00 AST</span>
            <span className="footer-text">{lang === 'en' ? '24/7 shipment desk' : 'مكتب الشحن متاح 24/7'}</span>
          </div>
        </div>
        <div className="footer-bottom"><span>© 2026 {lang === 'en' ? 'THE INTERNATIONAL ROUTE LOGISTICS' : 'المسار الدولي للحلول اللوجيستية'}</span><span>{lang === 'en' ? 'Built for the routes ahead.' : 'نبني مسارات الغد.'}</span></div>
      </div>
    </footer>
  );
}

function Cta({ lang }: { lang: Language }) {
  return (
    <section className="cta-band">
      <div className="cta-sky" dir="ltr" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><g transform="translate(0 40)"><g className="cta-plane vehicle"><g transform="scale(.6)"><Plane /></g></g></g></svg>
      </div>
      <div className="container-wide cta-inner">
        <h2>{lang === 'en' ? 'Have a route in mind? Let’s give it a reliable shape.' : 'لديك مسار في ذهنك؟ دعنا نحوله إلى خطة موثوقة.'}</h2>
        <Link href="/contact" className="button-dark button-primary" data-testid="link-cta-contact">{lang === 'en' ? 'Start with a conversation' : 'ابدأ محادثة'} <ArrowUpRight size={16} className="arrow-icon" /></Link>
      </div>
    </section>
  );
}

export function Home({ lang }: { lang: Language }) {
  const stats: [string, string][] = [
    ['2026', lang === 'en' ? 'year we began moving cargo' : 'سنة انطلاقنا'],
    ['6', lang === 'en' ? 'core services' : 'خدمات رئيسية'],
    ['3', lang === 'en' ? 'modes: sea · air · land' : 'وسائل نقل: بحر · جو · بر'],
    ['24/7', lang === 'en' ? 'shipment desk' : 'مكتب متابعة'],
  ];
  return (
    <main className="page-enter" key="home">
      <section className="hero2">
        <div className="hero2-photo" />
        <div className="container-wide hero2-copy">
          <div className="eyebrow">{lang === 'en' ? 'Global freight, locally accountable' : 'شحن عالمي بمسؤولية محلية'}</div>
          <h1>{lang === 'en' ? <>The shortest distance between <em>promise</em> and delivery.</> : <>أقصر مسافة بين <em>الوعد</em> والتسليم.</>}</h1>
          <p className={`hero-lede ${lang === 'ar' ? 'arabic' : ''}`}>{lang === 'en' ? 'The International Route is the logistics partner behind businesses that cannot afford uncertainty. We move cargo across borders with clear thinking, capable hands and one accountable view.' : 'المسار الدولي هو شريك الخدمات اللوجيستية للشركات التي لا تقبل عدم اليقين. ننقل شحناتك عبر الحدود برؤية واضحة وأيدٍ خبيرة ومسؤولية واحدة.'}</p>
          <div className="hero-actions">
            <Link href="/services" className="button-primary" data-testid="link-hero-services">{lang === 'en' ? 'See how we move' : 'اكتشف خدماتنا'} <ArrowUpRight size={16} className="arrow-icon" /></Link>
            <Link href="/contact" className="button-quiet" data-testid="link-hero-contact">{lang === 'en' ? 'Talk to our team' : 'تحدث مع فريقنا'} <ChevronRight size={16} className="arrow-icon" /></Link>
          </div>
        </div>
        <Panorama lang={lang} variant="full" />
      </section>

      <section className="stats-bar">
        <div className="container-wide stats-grid">
          {stats.map(([number, label], index) => <div className="stat" key={number} data-testid={`stat-${index}`}><div className="stat-number">{number}</div><span className="stat-label">{label}</span></div>)}
        </div>
      </section>

      <section className="section section-light">
        <div className="container-wide split">
          <Reveal>
            <div className="section-kicker">{lang === 'en' ? 'The International Route difference' : 'ما يميز المسار الدولي'}</div>
            <h2 className="section-title">{lang === 'en' ? <>Movement is easy.<br /><em>Momentum</em> takes care.</> : <>النقل سهل.<br /><em>الزخم</em> يحتاج عناية.</>}</h2>
          </Reveal>
          <Reveal>
            <p className={`copy ${lang === 'ar' ? 'arabic' : ''}`}>{lang === 'en' ? <>Every shipment carries more than cargo. It carries a deadline, a reputation and a next decision. <strong>Our job is to keep all three on course.</strong> We pair regional fluency with an international operating standard, so your people see fewer surprises and more progress.</> : <>كل شحنة تحمل أكثر من مجرد بضاعة. تحمل موعداً وسمعة وقراراً تالياً. <strong>مهمتنا أن نحافظ على مسارها.</strong> نجمع بين المعرفة الإقليمية والمعايير التشغيلية العالمية، لتمنح فريقك مفاجآت أقل وتقدماً أكبر.</>}</p>
            <div className="intro-aside"><span>{lang === 'en' ? 'A PARTNER, NOT A PORTAL' : 'شريك، لا مجرد منصة'}</span><span>01 / 03</span></div>
          </Reveal>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container-wide">
          <Reveal className="services-heading">
            <div>
              <div className="section-kicker">{lang === 'en' ? 'Capabilities' : 'قدراتنا'}</div>
              <h2 className="section-title">{lang === 'en' ? <>Whatever the route,<br /><em>we own the details.</em></> : <>مهما كان المسار،<br /><em>نحن ندير التفاصيل.</em></>}</h2>
            </div>
            <Link href="/services" className="button-quiet" data-testid="link-capabilities">{lang === 'en' ? 'All capabilities' : 'كل القدرات'} <ArrowUpRight size={15} className="arrow-icon" /></Link>
          </Reveal>
          <Reveal>
            <div className="service-list">
              {services.map((service) => (
                <Link href="/services" className="service-row" key={service.no} data-testid={`link-service-${service.no}`}>
                  <span className="service-index">{service.no}</span>
                  <div><h3>{text(service.title, lang)}</h3><p className={lang === 'ar' ? 'arabic' : ''}>{text(service.body, lang)}</p></div>
                  <AnimIcon kind={service.kind} />
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-light">
        <div className="container-wide">
          <Reveal>
            <div className="section-kicker">{lang === 'en' ? 'A wider view' : 'رؤية أوسع'}</div>
            <div className="image-card image-card-wide image-card-port">
              <div className="image-card-label">
                <div><strong>{lang === 'en' ? 'At the port' : 'في الميناء'}</strong><span>{lang === 'en' ? 'Container terminal · Sea freight' : 'محطة الحاويات · الشحن البحري'}</span></div>
                <span>02 / 03</span>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="gallery-grid">
              {gallery.map((item) => <figure className="gallery-item" key={item.src}><img src={item.src} alt={text(item.label, lang)} loading="lazy" /><figcaption>{text(item.label, lang)}</figcaption></figure>)}
            </div>
          </Reveal>
          <Reveal>
            <div className="process">
              <div className="process-step"><span className="step-no">01 / LISTEN</span><h3>{lang === 'en' ? 'Read the brief' : 'نفهم احتياجك'}</h3><p>{lang === 'en' ? 'We start with your business reality, not a rate card.' : 'نبدأ بفهم واقع أعمالك، لا بقائمة أسعار جاهزة.'}</p></div>
              <div className="process-step"><span className="step-no">02 / BUILD</span><h3>{lang === 'en' ? 'Shape the route' : 'نبني المسار'}</h3><p>{lang === 'en' ? 'The right mode, handoffs and contingencies — mapped before movement.' : 'نحدد الوسيلة والمراحل والبدائل قبل بدء الحركة.'}</p></div>
              <div className="process-step"><span className="step-no">03 / MOVE</span><h3>{lang === 'en' ? 'Keep you close' : 'نبقيك على اطلاع'}</h3><p>{lang === 'en' ? 'Milestones stay visible, questions get answered, cargo keeps moving.' : 'تبقى المراحل واضحة، وتحصل على إجابات، وتستمر الشحنة في الحركة.'}</p></div>
            </div>
          </Reveal>
        </div>
      </section>
      <Cta lang={lang} />
    </main>
  );
}

export function Services({ lang }: { lang: Language }) {
  return (
    <main className="page-enter">
      <section className="page-hero2">
        <div className="container-wide">
          <div className="eyebrow">{lang === 'en' ? 'Our services / 02' : 'خدماتنا / 02'}</div>
          <h1>{lang === 'en' ? <>Built around <em>your</em> next move.</> : <>مصممة حول <em>خطوتك</em> القادمة.</>}</h1>
          <p className={`hero-lede ${lang === 'ar' ? 'arabic' : ''}`}>{lang === 'en' ? 'The best logistics plan is the one that makes the rest of your operation feel simpler. We connect the modes, people and decisions behind every movement.' : 'أفضل خطة لوجيستية هي التي تجعل بقية عملياتك أكثر بساطة. نربط بين وسائل النقل والأشخاص والقرارات خلف كل حركة.'}</p>
        </div>
        <Panorama lang={lang} variant="slim" />
      </section>

      <section className="section section-light">
        <div className="container-wide">
          <Reveal>
            <div className="section-kicker">{lang === 'en' ? 'One operating standard' : 'معيار تشغيلي واحد'}</div>
            <h2 className="section-title" style={{ maxWidth: 760 }}>{lang === 'en' ? <>Six capabilities.<br /><em>One accountable partner.</em></> : <>ست قدرات.<br /><em>شريك واحد مسؤول.</em></>}</h2>
          </Reveal>
          <div className="service-cards">
            {services.map((service) => (
              <Reveal key={service.no}>
                <article className="service-card" data-testid={`service-detail-${service.no}`}>
                  <div className="service-card-top"><AnimIcon kind={service.kind} /><span className="service-no">{service.no}</span></div>
                  <h3>{text(service.title, lang)}</h3>
                  <p className={lang === 'ar' ? 'arabic' : ''}>{text(service.body, lang)}</p>
                  <div className="service-meta"><strong>{lang === 'en' ? 'Typically includes' : 'يشمل عادةً'}</strong>{text(service.meta, lang)}</div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal className="reveal-gap">
            <div className="image-card image-card-wide image-card-air">
              <div className="image-card-label">
                <div><strong>{lang === 'en' ? 'Sea and air, one partner' : 'البحر والجو، شريك واحد'}</strong><span>{lang === 'en' ? 'Every mode coordinated by one team' : 'كل وسائل النقل بتنسيق فريق واحد'}</span></div>
                <span>02 / 02</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container-wide split">
          <Reveal>
            <div className="section-kicker">{lang === 'en' ? 'Designed to connect' : 'مصمم ليربط'}</div>
            <h2 className="section-title">{lang === 'en' ? <>A chain is only as strong as its <em>handoffs.</em></> : <>قوة السلسلة في جودة <em>مراحلها.</em></>}</h2>
          </Reveal>
          <Reveal>
            <p className={`copy ${lang === 'ar' ? 'arabic' : ''}`} style={{ color: 'rgba(246,244,237,.7)' }}>{lang === 'en' ? 'That is why we treat the space between modes as seriously as the modes themselves. Documents checked. Customs anticipated. Stakeholders briefed. Your shipment never disappears into the gaps.' : 'لهذا نتعامل مع المسافة بين وسائل النقل بجدية توازي التعامل مع الوسائل نفسها. مستندات مدققة، وجمارك متوقعة، وأطراف مطلعة. شحنتك لا تختفي في الفراغات.'}</p>
          </Reveal>
        </div>
      </section>
      <Cta lang={lang} />
    </main>
  );
}

export function Contact({ lang }: { lang: Language }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(false);
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    formData.append('access_key', 'e5656eb1-6ef1-4506-a2f5-0cdda0ebc106');
    formData.append('subject', `International Route inquiry from ${formData.get('name')}`);
    formData.append('from_name', 'The International Route — Website');
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setSent(true);
        formEl.reset();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="page-enter">
      <section className="page-hero2">
        <div className="container-wide">
          <div className="eyebrow">{lang === 'en' ? 'Contact us / 03' : 'تواصل معنا / 03'}</div>
          <h1>{lang === 'en' ? <>Let’s put your cargo on a <em>clearer course.</em></> : <>لنضع شحنتك على <em>مسار أوضح.</em></>}</h1>
          <p className={`hero-lede ${lang === 'ar' ? 'arabic' : ''}`}>{lang === 'en' ? 'Tell us where you are starting and where you need to go. One of our specialists will come back with a practical next step.' : 'أخبرنا من أين تبدأ وإلى أين تريد الوصول. سيعود إليك أحد مختصي المسار بخطوة عملية تالية.'}</p>
        </div>
        <Panorama lang={lang} variant="slim" />
      </section>

      <section className="section section-light">
        <div className="container-wide contact-grid">
          <Reveal>
            <div>
              <div className="section-kicker">{lang === 'en' ? 'The human line' : 'خط التواصل المباشر'}</div>
              <h2 className="section-title">{lang === 'en' ? <>Good routes<br /><em>start with a question.</em></> : <>المسارات الجيدة<br /><em>تبدأ بسؤال.</em></>}</h2>
              <div className="contact-card">
                <div className="contact-item"><MapPin size={19} /><div><strong>{lang === 'en' ? 'Amman office' : 'مكتب عمّان'}</strong><span>{lang === 'en' ? 'King Abdullah II Street, Amman, Jordan' : 'شارع الملك عبدالله الثاني، عمّان، الأردن'}</span></div></div>
                <div className="contact-item"><Mail size={19} /><div><strong>{lang === 'en' ? 'Write to us' : 'راسلنا'}</strong><a href="mailto:ezzaldein1980@gmail.com" data-testid="link-contact-email">ezzaldein1980@gmail.com</a></div></div>
                <div className="contact-item"><Clock3 size={19} /><div><strong>{lang === 'en' ? 'Shipment desk' : 'مكتب متابعة الشحنات'}</strong><span>{lang === 'en' ? 'Available 24 hours, 7 days a week' : 'متاح 24 ساعة، 7 أيام في الأسبوع'}</span></div></div>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="contact-form">
              {sent ? (
                <div className="form-success">
                  <Check size={28} />
                  <h3>{lang === 'en' ? 'Inquiry sent.' : 'تم إرسال الاستفسار.'}</h3>
                  <p className={lang === 'ar' ? 'arabic' : ''}>{lang === 'en' ? 'Thanks — your inquiry has been sent directly to our team. We will get back to you shortly.' : 'شكراً لك — تم إرسال استفسارك مباشرة إلى فريقنا. سنعاود التواصل معك قريباً.'}</p>
                  <button className="button-primary" onClick={() => setSent(false)} data-testid="button-send-another">{lang === 'en' ? 'Send another inquiry' : 'إرسال استفسار آخر'}</button>
                </div>
              ) : (
                <>
                  <h2 className="form-title">{lang === 'en' ? 'Tell us about the move.' : 'أخبرنا عن شحنتك.'}</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                      <div className="field"><label htmlFor="contact-name">{lang === 'en' ? 'Your name' : 'الاسم'}</label><input id="contact-name" name="name" required placeholder={lang === 'en' ? 'Full name' : 'الاسم الكامل'} data-testid="input-contact-name" /></div>
                      <div className="field"><label htmlFor="contact-company">{lang === 'en' ? 'Company' : 'الشركة'}</label><input id="contact-company" name="company" required placeholder={lang === 'en' ? 'Company name' : 'اسم الشركة'} data-testid="input-contact-company" /></div>
                      <div className="field"><label htmlFor="contact-email">{lang === 'en' ? 'Work email' : 'البريد الإلكتروني'}</label><input id="contact-email" name="email" type="email" required placeholder="name@company.com" data-testid="input-contact-email" /></div>
                      <div className="field"><label htmlFor="contact-service">{lang === 'en' ? 'Service needed' : 'الخدمة المطلوبة'}</label><select id="contact-service" name="service" defaultValue="" data-testid="select-contact-service"><option value="" disabled>{lang === 'en' ? 'Select one' : 'اختر الخدمة'}</option>{services.map((service) => <option value={service.no} key={service.no}>{text(service.title, lang)}</option>)}</select></div>
                      <div className="field full"><label htmlFor="contact-message">{lang === 'en' ? 'The brief' : 'التفاصيل'}</label><textarea id="contact-message" name="message" required placeholder={lang === 'en' ? 'Origin, destination, timing and anything we should know...' : 'بلد المنشأ، الوجهة، الموعد وأي تفاصيل مهمة...'} data-testid="textarea-contact-message" /></div>
                    </div>
                    {error ? <p className={`form-error ${lang === 'ar' ? 'arabic' : ''}`} role="alert">{lang === 'en' ? <>Something went wrong sending your inquiry. Please try again, or email us directly at <a href="mailto:ezzaldein1980@gmail.com">ezzaldein1980@gmail.com</a>.</> : <>حدث خطأ أثناء إرسال استفسارك. حاول مرة أخرى، أو راسلنا مباشرة على <a href="mailto:ezzaldein1980@gmail.com">ezzaldein1980@gmail.com</a>.</>}</p> : null}
                    <button type="submit" className="button-primary form-submit" disabled={submitting} data-testid="button-submit-contact">{submitting ? (lang === 'en' ? 'Sending…' : 'جارٍ الإرسال…') : <>{lang === 'en' ? 'Send inquiry' : 'إرسال الاستفسار'} <Send size={15} className="arrow-icon" /></>}</button>
                  </form>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
