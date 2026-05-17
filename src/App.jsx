import React, { useEffect, useMemo, useState } from "react";
import privacyCleanerText from "./legal/privacy-cleaner.txt?raw";
import privacyDrawioText from "./legal/privacy-drawio.txt?raw";
import privacyHermesText from "./legal/privacy-hermes.txt?raw";
import privacyPlannerText from "./legal/privacy-planner.txt?raw";
import termsCleanerText from "./legal/terms-cleaner.txt?raw";
import termsDrawioText from "./legal/terms-drawio.txt?raw";
import termsHermesText from "./legal/terms-hermes.txt?raw";
import termsPlannerText from "./legal/terms-planner.txt?raw";

const projects = [
  {
    slug: "drawio-ai-drawing-sketches",
    title: "Drawio: AI Drawing & Sketches",
    teaser: "Transform your sketches into stunning artworks with AI.",
    appStore: "https://apps.apple.com/cy/app/drawio-ai-drawing-sketches/id6476892184",
    legal: { terms: "/terms-drawio", privacy: "/privacy-drawio" },
    hero: "/assets/drawio-hero.jpg",
    images: ["/assets/drawio-detail-1.jpg", "/assets/drawio-detail-2.jpg", "/assets/drawio-detail-3.jpg"],
    next: "plan-post",
    sections: [
      {
        title: "About Product",
        body: [
          "Drawio is an innovative app that makes AI-driven art creation accessible to everyone, regardless of their skill level or technical background.",
          "Why Choose Drawio?",
          "1. Democratizing Creativity: Drawio empowers users to create unique, AI-generated artwork effortlessly. There’s no need for complex knowledge of models or prompts. It’s an easy and enjoyable way for anyone to dive into generative content, opening new horizons for personal creativity.",
          "2. User-Friendly Learning: With Drawio’s interactive learning mode, users can enhance their drawing skills in a fun and engaging way. The AI provides real-time feedback on the accuracy of lines, making the learning process straightforward and rewarding, perfect for beginners and casual artists.",
          "3. Relaxing ASMR Experience: Drawio offers a unique ASMR drawing mode that combines creativity with relaxation. Users can create art while enjoying soothing sounds, making it a perfect choice for those seeking a calming and enjoyable pastime.",
          "Drawio is more than just an app; it’s a platform that invites everyone to explore the world of generative content in a fun and accessible way. It’s ideal for anyone looking to experience the joy of creating without the barriers typically associated with professional tools.",
          "Experience the future of art creation with Drawio and discover how easy and enjoyable it can be to bring your creative visions to life!"
        ]
      },
      {
        title: "Competitors and Market Analysis",
        body: [
          "Our competitors have achieved significant success with creative and relaxation apps, boasting hundreds of thousands of downloads recently. Their user-friendly designs and clear monetization strategies have been key to their popularity.",
          "The market for such apps is rapidly expanding, and the rise of AI generative tools is making art creation more accessible and enjoyable. This market is still in its early stages, presenting enormous opportunities for new entrants.",
          "We aim to stand out by leveraging AI technology to simplify the creative process, introducing gamification elements like challenges and leaderboards, and employing a targeted marketing strategy on platforms like TikTok. With a thorough understanding of the market, we are well-positioned to capitalize on this growing trend and offer innovative solutions in this emerging space."
        ]
      },
      {
        title: "Product Growth and Future Vision",
        body: [
          "We envision our product becoming the “Duolingo of drawing,” a leading platform that democratizes art creation through intuitive AI tools and engaging gamification elements. Just as Duolingo has revolutionized language learning, we aim to transform the way people engage with art, making drawing accessible, enjoyable, and rewarding for everyone. By continually enhancing user experience and expanding our reach, we aspire to lead the burgeoning market for creative AI applications, turning everyday users into confident and inspired artists."
        ]
      },
      {
        title: "Investment Opportunity",
        body: [
          "Stage: First Clients",
          "We are currently raising $200,000 in a pre-seed round through a SAFE (Simple Agreement for Future Equity) instrument. This investment round aims to accelerate our growth as we onboard our initial clients and continue to develop our platform.",
          "Investment Details:",
          "• Amount: $200,000",
          "• Minimum Investment: $50,000",
          "• Instrument: SAFE (Simple Agreement for Future Equity)",
          "This funding will enable us to scale our operations, enhance our AI capabilities, and expand our market presence. Join us in revolutionizing the way people create and experience art, making it accessible to all."
        ]
      }
    ]
  },
  {
    slug: "plan-post",
    title: "Plan Post Social Networks Aide",
    teaser: "Master Social Media Engagement with Plan Post: Your Ultimate Tool for Content Mastery",
    appStore: "https://apps.apple.com/us/app/plan-post-social-networks-aide/id6451217515?l=ru",
    legal: { terms: "/terms-planner", privacy: "/privacy-planner" },
    hero: "/assets/plan-post-hero.jpg",
    images: [
      "/assets/plan-post-detail-1.jpg",
      "/assets/plan-post-detail-2.jpg",
      "/assets/plan-post-detail-3.jpg",
      "/assets/plan-post-detail-4.jpg"
    ],
    next: "drawio-ai-drawing-sketches",
    sections: [
      {
        title: "About Product",
        body: [
          "Plan Post is designed for influencers, marketers, and content creators to streamline their social media strategy. It features efficient scheduling, organized content planning, and AI-driven content generation, providing a dynamic calendar and personalized planning tools to enhance social media engagement."
        ]
      },
      {
        title: "Competitors and Market Analysis",
        body: [
          "The development of Plan Post involved extensive market research to understand the needs of social media influencers and marketers. The design process focused on creating an intuitive interface that simplifies the planning and scheduling of content. Features such as AI-driven content generation and a dynamic calendar were developed to provide users with powerful tools to enhance their social media strategy."
        ]
      },
      {
        title: "Product Growth and Future Vision",
        body: [
          "Plan Post has successfully helped numerous influencers and marketers achieve consistent social media engagement and strategic audience growth. The app’s analytics tools have provided users with valuable insights, leading to optimized social media strategies and increased digital presence."
        ]
      },
      { title: "Investment Opportunity", body: [] }
    ]
  },
  {
    slug: "hermes",
    title: "Hermes : AI Characters Chatbot",
    teaser: "Chat with Historical Figures and Unlock the Secrets of the Past",
    appStore: "https://apps.apple.com/us/app/hermes-ai-characters-chatbot/id6447547239?l=ru",
    legal: { terms: "/terms-hermes", privacy: "/privacy-hermes" },
    hero: "/assets/hermes-hero.jpg",
    images: ["/assets/hermes-detail-1.jpg", "/assets/hermes-detail-2.jpg", "/assets/hermes-detail-3.jpg", "/assets/hermes-detail-4.jpg"],
    next: "drawio-ai-drawing-sketches",
    sections: [
      {
        title: "About Product",
        body: [
          "Hermes allows you to immerse yourself in history by engaging in conversations with legendary figures from various fields such as science, art, and culture. This app provides a unique and engaging way to learn from the past, offering insights into historical events and eras through interactive chats."
        ]
      },
      {
        title: "Competitors and Market Analysis",
        body: [
          "The development of Hermes involved deep research into historical figures and events to create a vast database for the AI to draw from. The team focused on creating a seamless user experience that allows users to effortlessly initiate conversations and explore various historical periods and figures. Premium features such as personalized queries and ad-free experiences were developed to enhance user engagement."
        ]
      },
      {
        title: "Product Growth and Future Vision",
        body: [
          "Hermes has captivated users with its innovative approach to learning history, offering an engaging and educational platform to explore different eras. The app’s premium features have been particularly appreciated for their ability to offer a tailored and uninterrupted exploration of history, leading to a significant increase in user satisfaction and subscription rates."
        ]
      },
      { title: "Investment Opportunity", body: [] }
    ]
  },
  {
    slug: "smart-photo-cleaner",
    title: "Smart Photo Cleaner",
    teaser: "Clean Up Your Gallery and Free Up Space with One Click",
    appStore: "https://apps.apple.com/us/app/smart-o%D1%87%D0%B8%D1%81%D1%82%D0%BA%D0%B0-photo-cleaner/id1540103598?l=ru",
    legal: { terms: "/terms-cleaner", privacy: "/privacy-cleaner" },
    hero: "/assets/smart-cleaner-hero.jpg",
    images: [
      "/assets/smart-cleaner-detail-1.jpg",
      "/assets/smart-cleaner-detail-2.jpg",
      "/assets/smart-cleaner-detail-3.jpg",
      "/assets/smart-cleaner-detail-4.jpg"
    ],
    next: "drawio-ai-drawing-sketches",
    sections: [
      {
        title: "About Product",
        body: [
          "Frustrated with running out of phone storage or managing duplicate photos? Smart Photo Cleaner streamlines your photo library by swiftly identifying and removing duplicates, allowing you to keep only the best photos and save significant storage space."
        ]
      },
      {
        title: "Competitors and Market Analysis",
        body: [
          "The creation of Smart Photo Cleaner involved extensive user interface planning to ensure ease of use. The development focused on a powerful algorithm capable of quickly identifying duplicates. The app was designed to provide clear feedback about the amount of space being freed up, and the photo recovery feature was implemented to add an extra layer of security for users."
        ]
      },
      {
        title: "Product Growth and Future Vision",
        body: [
          "Smart Photo Cleaner has successfully helped users manage their photo storage more efficiently. The app has significantly reduced the need for additional cloud storage or larger memory phones, leading to high user satisfaction and decreased ongoing costs for our customers."
        ]
      },
      { title: "Investment Opportunity", body: [] }
    ]
  }
];

const legalPages = {
  "/terms-drawio": { text: termsDrawioText },
  "/privacy-drawio": { text: privacyDrawioText },
  "/terms-hermes": { text: termsHermesText },
  "/privacy-hermes": { text: privacyHermesText },
  "/terms-planner": { text: termsPlannerText },
  "/privacy-planner": { text: privacyPlannerText },
  "/terms-cleaner": { text: termsCleanerText },
  "/privacy-cleaner": { text: privacyCleanerText }
};

function App() {
  const [locationKey, setLocationKey] = useState(() => window.location.pathname + window.location.hash);

  useEffect(() => {
    const sync = () => setLocationKey(window.location.pathname + window.location.hash);
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const currentProject = useMemo(() => {
    const match = window.location.pathname.match(/^\/work\/([^/]+)\/?$/);
    return match ? projects.find((project) => project.slug === match[1]) : null;
  }, [locationKey]);
  const currentLegalPage = useMemo(() => {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    return legalPages[path] ?? null;
  }, [locationKey]);

  useEffect(() => {
    const legalTitle = currentLegalPage ? getLegalBlocks(currentLegalPage.text)[0] : null;
    const title = currentProject ? `${currentProject.title} · am2` : legalTitle || "Remione - Mobile Apps for iOS";
    document.title = title;

    if (!currentProject && !currentLegalPage && window.location.hash) {
      window.requestAnimationFrame(() => {
        document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" });
      });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [currentProject, locationKey]);

  return (
    <>
      <Header />
      <main>{currentLegalPage ? <LegalPage page={currentLegalPage} /> : currentProject ? <ProjectPage project={currentProject} /> : <HomePage />}</main>
    </>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="logo-link" href="/" aria-label="Remione home">
        <Logo />
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        <a href="/#work">Work</a>
        <a href="/#about">About</a>
        <a href="/#contact">Contact</a>
      </nav>
    </header>
  );
}

function Logo() {
  return (
    <svg width="36" height="38" viewBox="0 0 36 38" fill="none" aria-hidden="true">
      <path
        d="M35.646 27.284c.236.179.354.467.354.865 0 .398-.128.836-.383 1.314-.256.457-.58.845-.974 1.164-.393.298-.777.448-1.15.448-.827 0-1.358-.767-1.594-2.299a13.54 13.54 0 0 1-.118-1.88c0-.359.02-.916.06-1.672l.029-1.672c0-.875.02-2.189.059-3.94.059-1.771.088-3.532.088-5.284-.491 1.334-1.11 3.165-1.858 5.493a12.31 12.31 0 0 1-.65 1.671 3.515 3.515 0 0 1-.943 1.165c-.394.338-.787.507-1.18.507-.748 0-1.367-.507-1.859-1.522-.492-1.015-.914-2.16-1.268-3.433l-.266 2.209c-.256 1.99-.492 3.582-.708 4.776a23.808 23.808 0 0 1-.885 3.582c-.295.896-.64 1.662-1.032 2.299-.374.617-.866.925-1.476.925-.688 0-1.032-.358-1.032-1.075 0-.497.147-1.064.442-1.701l-.058.12c0 .02-.01.03-.03.03l.177-.568a18.21 18.21 0 0 0 .472-2.12 89.73 89.73 0 0 0 .826-5.104l.708-5.224c.216-1.87.452-3.671.708-5.403.138-1.015.285-1.81.443-2.388.177-.597.491-1.164.944-1.701a2.76 2.76 0 0 1 .737-.627c.295-.16.57-.239.826-.239.433 0 .757.199.974.597.157.299.255.786.295 1.463l.088.716c.138.736.315 1.542.531 2.418.531 2.15 1.013 3.801 1.446 4.955.157-.477.255-.766.295-.865a77.492 77.492 0 0 1 1.475-4.06 16.66 16.66 0 0 1 1.622-2.985c.295-.418.63-.776 1.003-1.075.374-.318.748-.477 1.121-.477.413 0 .709.149.886.447.196.279.314.567.354.866.058.279.117.756.176 1.433.08.895.119 1.93.119 3.104 0 .856-.04 2.16-.118 3.91-.02.359-.04.807-.06 1.344a51.52 51.52 0 0 0-.029 1.88l-.03 2.03c0 .657.02 1.622.06 2.896l-.03.955c0 .916.138 1.493.413 1.732Zm-25.262-6.926c.315.12.669.289 1.062.508-.59-2.15-1.042-3.98-1.357-5.493-.767 1.552-1.78 3.443-3.038 5.672-.099.219-.266.527-.502.925.787-1.234 1.682-1.85 2.685-1.85.393 0 .777.079 1.15.238Zm4.72-4.239c.807 2.767 1.76 5.344 2.862 7.732l.325.657c.275.477.481.885.62 1.223.137.319.206.647.206.985 0 .518-.217 1.055-.65 1.612-.432.538-.904.936-1.415 1.194-.315.18-.65.269-1.003.269-.59 0-1.18-.18-1.77-.537-.57-.378-1.26-.916-2.066-1.612-.57-.478-1.003-.816-1.298-1.015-.196-.14-.61-.358-1.239-.657-1.101-.557-1.957-1.055-2.566-1.492-.59-.438-.885-.956-.885-1.553 0-.159.069-.398.206-.716-.373.677-.895 1.711-1.563 3.104-.826 1.692-1.298 2.637-1.416 2.836-.236.438-.62.926-1.15 1.463-.532.517-1.024.776-1.476.776a.844.844 0 0 1-.62-.269C.07 29.98 0 29.761 0 29.463c0-.836.63-2.319 1.888-4.448.079-.16.207-.388.384-.687l.649-1.253c1.337-2.548 2.31-4.468 2.92-5.762.354-.756.866-1.89 1.534-3.403l1.062-2.418c.433-.935.866-1.71 1.298-2.328a4.407 4.407 0 0 1 1.623-1.463c.334-.179.649-.268.944-.268.393 0 .678.189.855.567.177.358.335.896.472 1.612.354 2.05.846 4.219 1.476 6.507Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HomePage() {
  return (
    <>
      <section className="home-hero">
        <h1>
          <span>Remione LTD.</span>
          <span>Mobile Apps</span>
          <span>Development Studio</span>
        </h1>
      </section>

      <section className="intro-section">
        <p>
          With over a decade of experience specializing in iOS applications, our team leads with{" "}
          <a href="https://apps.apple.com/cy/app/drawio-ai-drawing-sketches/id6476892184">“Drawio: AI Drawing & Sketches,”</a>{" "}
          a revolutionary app transforming sketches into detailed artworks using AI. In addition to “Drawio,” our recent projects include{" "}
          <a href="https://apps.apple.com/cy/app/plan-post-social-networks-aide/id6451217515">“Plan Post,”</a> which enhances social
          media scheduling, <a href="https://apps.apple.com/app/id6447547239">“Hermes,”</a> an AI-driven chat app that connects users with
          historical figures, and{" "}
          <a href="https://apps.apple.com/cy/app/1photo-cleanup-phone-gallery/id1540103598">“Smart Cleaner,”</a> designed for efficient
          photo and storage management on iOS devices. Each app showcases our innovation and dedication to enhancing user experience across
          various needs.
        </p>
      </section>

      <section id="work" className="page-section work-section">
        <div className="section-rule">
          <h2>Work</h2>
        </div>
        <div className="work-grid">
          {projects.map((project, index) => (
            <a className={`work-card ${index === 0 ? "featured" : ""}`} href={`/work/${project.slug}`} key={project.slug}>
              <img src={project.hero} alt="Project image" />
              <h3>
                {project.title} <span aria-hidden="true">→</span>
              </h3>
              <p>{project.teaser}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="about" className="page-section about-section">
        <div className="section-rule">
          <h2>About Remione LTD.</h2>
        </div>
        <div className="about-grid">
          <p className="about-kicker">iOS App Design & Development Team</p>
          <div className="about-copy">
            <p>Remione LTD., based in Limassol, Cyprus, have a decade of experience in developing impactful iOS apps.</p>
            <p>
              Our portfolio includes “<a href="https://apps.apple.com/us/app/plan-post-social-networks-aide/id6451217515?l=ru">Plan Post</a>”
              for social media scheduling, “
              <a href="https://apps.apple.com/us/app/hermes-ai-characters-chatbot/id6447547239?l=ru">Hermes</a>” for AI-driven historical
              interactions, and “
              <a href="https://apps.apple.com/us/app/smart-o%D1%87%D0%B8%D1%81%D1%82%D0%BA%D0%B0-photo-cleaner/id1540103598?l=ru">
                Smart Cleaner
              </a>
              ” for efficient storage management. We specialize in tailored applications across various sectors, showcasing our commitment to
              innovation and excellence in mobile app development.
            </p>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </>
  );
}

function ContactSection() {
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      setStatus({ message: "Please fill in all fields.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setStatus({ message: "", type: "" });

    try {
      const [{ addDoc, collection, getFirestore, serverTimestamp }, { app }] = await Promise.all([
        import("firebase/firestore"),
        import("./firebase.js")
      ]);
      const db = getFirestore(app);

      await addDoc(collection(db, "contactRequests"), {
        name,
        email,
        message,
        createdAt: serverTimestamp()
      });
      form.reset();
      setStatus({ message: "Message sent. I will get back to you soon.", type: "success" });
    } catch {
      setStatus({ message: "Could not send the message. Please email info@remione.ltd.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="contact-section">
      <h2>Contact Us</h2>
      <a className="email-button" href="mailto:info@remione.ltd">
        Email Us
      </a>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input type="text" name="name" placeholder="Name" aria-label="Name" maxLength="120" required />
          <input type="email" name="email" placeholder="Email" aria-label="Email" maxLength="180" required />
        </div>
        <textarea name="message" placeholder="Message" aria-label="Message" maxLength="2000" required />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send"}
        </button>
        <p className={`form-status ${status.type}`} aria-live="polite">
          {status.message}
        </p>
      </form>
    </section>
  );
}

function ProjectPage({ project }) {
  const nextProject = projects.find((item) => item.slug === project.next) ?? projects[0];

  return (
    <>
      <section className="project-hero">
        <img src={project.hero} alt="Project image" />
      </section>
      <section className="project-title-band">
        <div className="narrow-content">
          <h1>{project.title}</h1>
          <div className="breadcrumbs">
            <a href="/">Home</a>
            <span>→</span>
            <a href="/#work">Work</a>
            <span>→</span>
            <span>{project.title}</span>
          </div>
        </div>
      </section>
      <section className="project-content">
        <div className="narrow-content">
          {project.sections.map((section, index) => (
            <article className="project-copy-block" key={section.title}>
              <h2>{section.title}</h2>
              <div>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {(index === 0 || section.title === "Investment Opportunity") && <AppStoreButton href={project.appStore} />}
              </div>
            </article>
          ))}
        </div>
      </section>
      <ProjectLegalLinks legal={project.legal} />
      <section className="project-gallery">
        <div className="wide-content">
          {[project.hero, ...project.images].map((image) => (
            <img src={image} alt="Project image" key={image} />
          ))}
        </div>
      </section>
      <section className="next-project">
        <div className="wide-content">
          <p>Next project</p>
          <a href={`/work/${nextProject.slug}`}>
            {nextProject.title} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      <Footer />
    </>
  );
}

function ProjectLegalLinks({ legal }) {
  if (!legal) {
    return null;
  }

  return (
    <section className="project-legal-links">
      <div className="narrow-content">
        <h2>Legal</h2>
        <div className="project-legal-list">
          <a href={legal.terms}>Terms &amp; Conditions</a>
          <a href={legal.privacy}>Privacy Policy</a>
        </div>
      </div>
    </section>
  );
}

function AppStoreButton({ href }) {
  return (
    <a className="app-store-button" href={href} aria-label="Download on the App Store">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.7 1.6c.1 1.2-.4 2.4-1.1 3.2-.8.9-2 1.5-3.1 1.4-.1-1.1.4-2.3 1.1-3.1.8-.9 2.1-1.5 3.1-1.5ZM20.2 17.6c-.5 1.1-.7 1.6-1.4 2.6-.9 1.3-2.2 3-3.8 3-1.4 0-1.8-.9-3.7-.9s-2.3.9-3.8.9c-1.6 0-2.8-1.5-3.7-2.8-2.5-3.7-2.8-8-.1-10.3 1-1 2.4-1.5 3.7-1.5 1.5 0 2.8 1 3.7 1s2.5-1.2 4.2-1c.7 0 2.7.3 4 2.2-3.5 1.9-2.9 6.4.9 6.8Z"
        />
      </svg>
      <span>
        <small>Download on the </small>
        <strong>App Store</strong>
      </span>
    </a>
  );
}

function LegalPage({ page }) {
  const [title, date, ...blocks] = getLegalBlocks(page.text);

  return (
    <>
      <section className="legal-page">
        <div className="legal-content">
          <a className="back-link" href="/">
            Home
          </a>
          <h1>{title}</h1>
          {date && <p className="legal-date">{date}</p>}
          <LegalBlocks blocks={blocks} />
        </div>
      </section>
      <Footer />
    </>
  );
}

function LegalBlocks({ blocks }) {
  const rendered = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (block.startsWith("-")) {
      const items = [];
      while (index < blocks.length && blocks[index].startsWith("-")) {
        items.push(blocks[index].replace(/^-\s+/, ""));
        index += 1;
      }
      index -= 1;
      rendered.push(
        <ul key={`list-${index}`}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    } else if (isLegalHeading(block)) {
      rendered.push(<h2 key={block}>{block}</h2>);
    } else {
      rendered.push(<p key={`${index}-${block.slice(0, 24)}`}>{block}</p>);
    }
  }

  return <div className="legal-body">{rendered}</div>;
}

function getLegalBlocks(text) {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function isLegalHeading(block) {
  return block.length <= 70 && !block.startsWith("-") && !/[.!?]$/.test(block) && /^[A-Z0-9]/.test(block);
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <a href="/" aria-label="Remione home">
          <Logo />
        </a>
        <div>
          <p>Remione LTD. Mobile applications development studio based in Limassol (Cyprus)</p>
          <small>Made with love in 2025. Probably all rights reserved</small>
        </div>
      </div>
    </footer>
  );
}

export default App;
