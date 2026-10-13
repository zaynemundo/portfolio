// Case study content taken from public/case-studies.docx, shaped the way
// Monili Jewellers is already stored (Project.richContent).

const m = (value, label) => ({ value, label });
const b = (heading, body) => ({ heading, body });
const sec = (title, bullets) => ({ title, bullets });
const group = (label, metrics) => ({ label, metrics });
const disc = (name, items, visual) => ({ name, items, visual });

export const existing = {
  "scandinavian-physio": {
    shortDescription:
      "Rebuilt an established clinic website from the ground up — fixing broken infrastructure, restructuring content, and improving discoverability to turn organic search into the clinic's primary patient acquisition channel.",
    challenge:
      "By 2025, the clinic's website suffered from critical technical and design debt that affected both users and search visibility.",
    approach:
      "The SEO specialist defined the strategy. The frontend implementation made it executable. By translating complex requirements into clear editorial layouts and fast, stable pages, users could move naturally from discovery to booking.",
    outcome:
      "Rebuilt the frontend foundation, transformed treatment pages into scalable patient entry points, and created a healthcare platform focused on discoverability, performance, and patient conversion.",
    rich: {
      disciplines: ["UX/UI Design", "Frontend Development", "Email Marketing", "WordPress"],
      typography: "Aboreto (Display) · Inter (Body)",
      heroMetrics: [
        m("15K", "Organic sessions/month"),
        m("+67.9%", "Key conversion events"),
        m("3.1K", "Active users/month"),
      ],
      problemIntro:
        "By 2025, the clinic's website suffered from critical technical and design debt that affected both users and search visibility.",
      problemSections: [
        sec("An established clinic. A site that wasn't keeping up.", [
          b("Poor URL Structure", "Legacy routing like ‘/the-team’ compromised organic discoverability."),
          b("Thin Treatment Content", "Fragmented paragraphs lacked depth for search engines and retention."),
          b("Broken Infrastructure", "Legacy code caused layout shifts; broken forms dropped patient submissions."),
          b("No Conversion Path", "Visitors had no clear next step toward booking an enquiry."),
        ]),
      ],
      compare: {
        beforeLabel: "2021 — before",
        afterLabel: "2025 — rebuild",
        caption: "Drag to compare 2021 vs the 2025 rebuild.",
      },
      transformationHeadline: "What I changed.",
      transformationSections: [
        sec("Structure & Discoverability", [
          b("Clean URLs", "Restructured site routing into clean URLs based on SEO audit."),
          b("Editorial treatment pages", "Transformed short treatment pages into structured editorial content."),
          b("Technical fixes", "Fixed blog templates, heading hierarchy, indexing, and broken links."),
        ]),
        sec("Brand & Design System", [
          b("Typography", "Introduced Aboreto for headline contrast paired with Inter body layouts."),
          b("Colour & texture", "Added marble texture and a blue healthcare-focused color system."),
          b("Homepage drafts", "Built 8 homepage drafts in Figma to refine the final direction."),
        ]),
        sec("Performance & Frontend Engineering", [
          b("Images", "Converted legacy images to modern formats with lazy loading."),
          b("Asset clean-up", "Removed render-blocking assets and unused plugin CSS/JS."),
          b("Core Web Vitals", "Reduced LCP from 11.1s to 0.6s — CLS dropped to 0."),
        ]),
        sec("Conversion & UX Architecture", [
          b("About page", "Rebuilt About page with clinic positioning and CTAs."),
          b("FAQ & Deep Dive", "Added FAQ filtering / search and Deep Dive case studies page."),
          b("Booking entry points", "Standardized booking entry points across all key pages."),
        ]),
        sec("Custom Email Design & Code", [
          b("Newsletters", "Designed and coded responsive HTML newsletters from scratch."),
          b("Client rendering", "Ensured rendering consistency across Outlook, Gmail, Apple Mail."),
          b("Retention channel", "Built email marketing templates as a recurring retention channel."),
        ]),
      ],
      executionHeadline: "Three disciplines. One system.",
      executionDisciplines: [
        disc("Web & UX Design", ["Treatment Pages", "FAQ System", "About Page", "Video Integration", "Welcome Party Page", "8 Homepage Drafts"], "Figma canvas, UI kit, layout iterations, homepage drafts"),
        disc("Frontend Development", ["Responsive Layouts", "Form Fixes", "URL Architecture", "Core Web Vitals", "Image Optimization"], "Responsive screenshots, before/after, performance scores"),
        disc("Email Design & Code", ["Custom Templates", "Clinic Newsletters", "Campaign Emails"], "Newsletter mockups, device rendering, template variants"),
      ],
      resultsHeadline: "The site isn’t just being found. It’s converting.",
      resultGroups: [
        group("Business Outcomes", [
          m("15K", "Organic sessions/month — leads all channels including paid"),
          m("+67.9%", "Key conversion events — appointment actions growing MoM"),
          m("+57.1%", "Deep Tissue page growth — targeted editorial traffic spike"),
          m("+162.5%", "Paid search growth — organic foundation made paid more effective"),
        ]),
      ],
      performanceAudit: [
        { metric: "LCP", before: "11.1s", after: "0.6s", status: "Fast" },
        { metric: "CLS", before: "Erratic", after: "0", status: "Stable" },
        { metric: "Performance Score", before: "<50", after: "80", status: "Improved" },
        { metric: "SEO Score", before: "Low", after: "92", status: "Excellent" },
        { metric: "Accessibility", before: "-", after: "94", status: "Excellent" },
        { metric: "Best Practices", before: "-", after: "96", status: "Excellent" },
      ],
      whyItWorked: [
        "The project wasn’t just cosmetic. It fixed structural problems that limited both discoverability and conversion — poor URLs, thin content, broken forms, and slow pages.",
        "The SEO specialist defined the strategy. The frontend implementation made it executable. By translating complex requirements into clear editorial layouts and fast, stable pages, users could move naturally from discovery to booking.",
        "When fast loading, balanced typography, and persistent conversion paths work together, the path from discovery to enquiry becomes frictionless.",
      ],
      takeaway:
        "Rebuilt the frontend foundation, transformed treatment pages into scalable patient entry points, and created a healthcare platform focused on discoverability, performance, and patient conversion.",
    },
  },

  "pno-marinas": {
    shortDescription:
      "Revamped, then fully rebuilt a marina website from scratch — implementing a new brand system, identifying a core business gap, and delivering a custom interactive berth map as the centrepiece of a clearer, more conversion-focused digital presence.",
    client: "P&O Marinas — A DP World Company",
    challenge:
      "P&O Marinas — a DP World company operating Dubai’s premium berthing facilities including Mina Rashid — had a website that presented the brand but buried the service.",
    approach:
      "The Phase 2 rebuild was driven by two things working together — a new corporate brand system and a major structural business gap. Both were addressed at the same time.",
    outcome:
      "Identified a core business gap, implemented a new brand system, rebuilt the platform from scratch, and delivered a custom interactive berth map — transforming a static marina website into a service-focused digital platform.",
    rich: {
      disciplines: ["Website", "Interactive Map", "Social Media", "WordPress"],
      heroMetrics: [
        m("8K", "Total users — organic traffic dominant"),
        m("2", "Phases: revamp → brand-driven full rebuild"),
        m("1", "Custom interactive berth map, signed off"),
      ],
      metricGroups: [
        group("Platform & Product", [
          m("8K", "Total users — organic traffic dominant"),
          m("Organic", "Primary acquisition channel"),
          m("2", "Phases: revamp → brand-driven full rebuild"),
          m("1", "Custom interactive berth map, signed off"),
        ]),
        group("Social & Brand", [
          m("481", "Social media posts redesigned"),
          m("1,760", "Instagram followers"),
          m("SailGP", "Significant engagement boost during event periods"),
        ]),
      ],
      problemIntro:
        "P&O Marinas — a DP World company operating Dubai’s premium berthing facilities including Mina Rashid — had a website that presented the brand but buried the service.",
      problemSections: [
        sec("A world-class marina. A website that didn’t show what it actually offered.", [
          b("Hidden Core Service", "Berth rental — the marina’s primary commercial offering — wasn’t clearly surfaced within the website structure."),
          b("Unclear Booking Journey", "Potential customers had no dedicated berth page, onboarding flow, or clear understanding of how enquiries and booking worked."),
          b("No Interactive Availability System", "There was no digital interface for users to explore berth availability or for the marina team to manage berth visibility online."),
          b("Fragmented Brand Experience", "News, events, and lifestyle content existed, but layouts, visuals, and user experience lacked consistency across the platform."),
        ]),
      ],
      compare: {
        beforeLabel: "2023 — before",
        afterLabel: "2024 — rebuild",
        caption: "Drag to compare 2023 vs the 2024 rebuild.",
      },
      transformationHeadline: "What I changed.",
      transformationSections: [
        sec("Phase 1 — 2023: Revamp", [
          b("Website revamp", "Revamped the inherited website within the existing brand direction."),
          b("Social media graphics", "Designed and managed social media graphics across Instagram, LinkedIn, and Facebook."),
          b("Event content", "Created SailGP event content and lifestyle visuals."),
          b("Trend research", "Researched platform trends to improve visual execution without a dedicated social strategy team."),
        ]),
        sec("Phase 2 — Brand Implementation", [
          b("New brand identity", "Implemented the client’s new brand identity system across the website."),
          b("Design system", "Translated updated branding into typography, color systems, layout structure, and reusable components."),
          b("Full rebuild", "Rebuilt every page from scratch aligned to the new visual direction."),
          b("Interactive homepage", "Introduced a more interactive homepage experience."),
        ]),
        sec("Phase 2 — Strategic Expansion", [
          b("Core service", "Identified berth rental as the platform’s core commercial service."),
          b("Service-led structure", "Restructured the website around the service instead of static brand presentation."),
          b("Expanded experiences", "Expanded the site with clearer commercial and lifestyle-focused experiences."),
        ]),
        sec("Interactive Berth Map — Product Ownership", [
          b("SVG integration", "Integrated the client-supplied SVG marina layout into the frontend as an interactive berth map."),
          b("Berth data", "Defined berth data fields: berth length, shore power, availability status, booking actions."),
          b("Backend reference", "Provided SVG structure to the backend developer as the implementation reference."),
          b("QA", "QA’d the completed map against the actual marina layout."),
          b("Sign-off", "Signed off the final interactive system prior to deployment."),
        ]),
        sec("New Pages Built", [
          b("Berth page", "The platform’s core service hub."),
          b("Berth process page", "Step-by-step onboarding flow."),
          b("Cruise terminal page", ""),
          b("Mina Rashid lifestyle page", "Positioning the destination, not just the service."),
          b("News and events", "Reworked news and events layouts for better readability and consistency."),
        ]),
      ],
      executionHeadline: "Three disciplines. One system.",
      executionDisciplines: [
        disc("Web & UX Design", ["Full Site Redesign", "Brand Implementation", "Homepage Interactions", "Berth Page", "Lifestyle Page", "News & Events", "Cruise Terminal"], "Site redesign, brand system implementation, page layouts, Figma designs"),
        disc("Interactive Berth Map", ["SVG Integration", "Berth Popups", "Availability Status", "Backend Coordination", "QA & Sign-off"], "Map screenshot, berth popup detail, occupied/vacant legend, mobile view"),
        disc("Social Media Design", ["481 Posts", "Instagram", "LinkedIn", "Facebook", "SailGP Content"], "Social media grid, SailGP event posts, lifestyle visuals, brand-aligned graphics"),
      ],
      resultsHeadline: "A brand brochure, turned service platform.",
      resultGroups: [
        group("Platform & Engagement", [
          m("8K", "Total users, with organic traffic as the dominant source"),
          m("1", "Custom interactive berth map connected to live berth availability"),
          m("4", "New core pages launched: Berth · Berth Process · Cruise Terminal · Mina Rashid Lifestyle"),
          m("2", "Successful execution phases: revamp → full rebuild"),
        ]),
        group("Brand & Social Presence", [
          m("481", "Assets designed — social media assets across two years"),
          m("1,760", "Instagram followers — consistent brand presence maintained"),
          m("SailGP", "Engagement spikes — strong uplift during every event period"),
        ]),
      ],
      resultsNote:
        "The website shifted from a static brand presence into a clearer service-focused platform centered around berth rental and enquiry flow. The interactive berth map created a more usable experience for both potential clients and the marina team by making berth information easier to understand and navigate.",
      whyItWorked: [
        "The site wasn't just redesigned — it was restructured around what the business actually sells. Berth rental is P&O Marinas' core commercial service, but the previous website didn't reflect that clearly.",
        "The Phase 2 rebuild was driven by two things working together — a new corporate brand system and a major structural business gap. Both were addressed at the same time.",
        "The interactive berth map became the project's most complex deliverable because it required acting as the product bridge between the client's operational knowledge and backend implementation. Defining the data, coordinating implementation, validating against the real marina, and signing off on completion ensured the final system reflected operational reality — not an approximation.",
      ],
      takeaway:
        "Identified a core business gap, implemented a new brand system, rebuilt the platform from scratch, and delivered a custom interactive berth map — transforming a static marina website into a service-focused digital platform.",
    },
  },

  "vijit-pillai-art": {
    shortDescription:
      "Designed a complete art-commerce platform from scratch for an internationally recognised contemporary artist — covering the full customer journey, a custom admin system, and the operational workflows required to manage artwork sales globally.",
    challenge:
      "Vijit Pillai — a contemporary artist with over 750 artworks collected across India, the UAE, USA, UK, and Australia — lacked a dedicated digital platform to manage and sell printed editions of his work globally.",
    approach:
      "The storefront was designed to feel like a gallery, not a generic e-commerce store. Large imagery, generous spacing, and a focused purchase flow gave the artwork room to lead the experience.",
    outcome:
      "Designed a complete art-commerce platform balancing gallery-style presentation with operational simplicity — while acting as the product bridge between design and development throughout implementation.",
    rich: {
      disciplines: ["UI/UX Design", "Frontend Development", "React / TSX"],
      engineeringStack: "React / TSX (Frontend) · Custom Backend",
      heroMetrics: [
        m("35+", "Total high-fidelity screens designed"),
        m("20+", "Customer-facing storefront screens"),
        m("15+", "Admin platform interfaces"),
        m("1", "Complete e-commerce ecosystem — zero to live"),
      ],
      problemIntro:
        "Vijit Pillai — a contemporary artist with over 750 artworks collected across India, the UAE, USA, UK, and Australia — lacked a dedicated digital platform to manage and sell printed editions of his work globally.",
      problemSections: [
        sec("An internationally recognised artist. No dedicated channel to scale.", [
          b("Absence of Digital Infrastructure", "Artwork sales, enquiries, and customer communication were handled through fragmented informal channels."),
          b("Complex Product Requirements", "Multiple artwork sizes, edition types, global shipping, and secure checkout all needed from launch."),
          b("Operational Simplicity Needed", "The artist required a clear system to manage inventory, collections, customers, and orders without technical complexity."),
          b("Built for Future Expansion", "The platform architecture needed to support VIP early access and artwork resell functionality later."),
        ]),
      ],
      compare: {
        beforeLabel: "Wireframe",
        afterLabel: "Final design",
        caption: "Drag to compare wireframe vs final design.",
      },
      transformationHeadline: "What I designed.",
      transformationSections: [
        sec("Visual System & Gallery Experience", [
          b("UI system", "Extended the artist's existing logo identity into a complete UI system."),
          b("Foundations", "Established typography, spacing, color palette, and reusable component patterns in Figma."),
          b("Artwork-led layouts", "Designed layouts that allowed large-format artwork imagery to lead the experience."),
          b("Gallery direction", "Created a minimalist visual direction inspired by physical gallery environments rather than generic e-commerce stores."),
        ]),
        sec("End-to-End Storefront Journey", [
          b("Homepage", "Hero banners, collections grid, featured artworks, how it works, newsletter."),
          b("Collections", "Browse all, single collection page with artwork grid."),
          b("Shop", "Filtering by collection, size, orientation, price, availability."),
          b("Single artwork", "Image gallery, details, sizing, pricing, CTA, similar artworks."),
          b("Cart & checkout", "Cart, checkout, payment, thank you, failed state."),
          b("Account", "Order history, profile, address book, wishlist."),
          b("Authentication", "Sign in, sign up, forgot password, reset password."),
          b("Supporting pages", "About, Contact, Testimonials, Custom Commissions."),
        ]),
        sec("Custom Admin Platform", [
          b("Dashboard", "Real-time stats, orders, users, revenue overview."),
          b("Inventory", "Add, edit, delete artworks with images, SKU, sizing, pricing, stock."),
          b("Collections", "Create, manage, assign artworks."),
          b("Orders", "View, filter, update status, add tracking."),
          b("Customers", "View profiles, order history, export."),
          b("Users & Roles", "Role-based access control (Admin, Manager, Viewer)."),
          b("Newsletter", "Subscriber management, API integration."),
          b("Site Settings", "Banners, contact info, social links, VAT, shipping, SMTP."),
        ]),
        sec("Frontend Development & Product Bridge", [
          b("Storefront build", "Built the full storefront frontend in React/TSX based on Figma designs."),
          b("Backend pairing", "Worked closely with the backend developer throughout implementation."),
          b("States & edge cases", "Defined interaction states, responsive behaviour, and edge cases in Figma."),
          b("Implementation review", "Reviewed backend implementation continuously during development."),
          b("QA", "QA'd the final platform against designs before launch."),
        ]),
      ],
      executionHeadline: "Two platforms. One unified system.",
      executionDisciplines: [
        disc("Storefront Design", ["Homepage", "Collections", "Shop", "Artwork Pages", "Cart & Checkout", "Customer Accounts", "Wishlist", "Authentication"], "Figma canvas — storefront screens, customer journey, page layouts"),
        disc("Admin Platform", ["Dashboard", "Inventory", "Collections", "Orders", "Customers", "Newsletter", "User Roles", "Site Settings"], "Figma canvas — admin panel screens, management interfaces"),
        disc("Product Collaboration", ["Developer Handoff", "QA", "Edge Cases", "Implementation Review", "Sign-off"], "Design-to-build comparison, Figma prototype, QA documentation"),
      ],
      resultsHeadline: "A gallery platform, built to scale.",
      resultGroups: [
        group("Platform Scope", [
          m("35+", "Total screens designed across storefront and admin panel"),
          m("1", "Complete art-commerce platform launched from scratch"),
          m("Full", "Customer purchase journey designed end to end"),
        ]),
      ],
      resultsNote:
        "The platform foundation was designed to support future VIP access systems and artwork resell functionality as the business expands.",
      deliverables: [
        { label: "Core platform features", items: ["Collections", "Artwork filtering", "Cart & checkout", "Customer accounts", "Wishlist", "Inventory management", "Orders", "Newsletter system", "User roles"] },
        {
          label: "Customer experience outcomes",
          items: [
            "Browse & discover — filter artworks by collection, orientation, size, and availability",
            "Purchase flow — complete purchases through dedicated cart, checkout, and order confirmation",
            "Account management — manage orders, addresses, wishlists, and profiles independently",
          ],
        },
        {
          label: "Artist management capabilities",
          items: [
            "Inventory & collections — manage artworks, editions, sizing, pricing, and collections without developer assistance",
            "Orders & customers — view, update, and export orders and customer data from a centralized admin system",
            "Platform controls — update settings, newsletter subscribers, user roles, and content from one interface",
          ],
        },
      ],
      whyItWorked: [
        "The platform succeeded because every design decision considered two users simultaneously — the collector browsing artwork and the artist managing the business behind it.",
        "The storefront was designed to feel like a gallery, not a generic e-commerce store. Large imagery, generous spacing, and a focused purchase flow gave the artwork room to lead the experience.",
        "The admin platform focused on operational clarity — inventory, collections, orders, and customer management designed to be straightforward without technical knowledge.",
        "Working closely with the development team throughout implementation ensured the platform wasn't just visually aligned in Figma — it translated accurately into the final build through ongoing QA, edge-case definition, and implementation review.",
      ],
      takeaway:
        "Designed a complete art-commerce platform balancing gallery-style presentation with operational simplicity — while acting as the product bridge between design and development throughout implementation.",
    },
  },

  "rocky-real-estate": {
    shortDescription:
      "Rebuilt a high-traffic Dubai property platform on a clean custom WordPress foundation — removing years of legacy bloat, implementing technical SEO requirements, and restructuring the platform around the high-consideration buyer journey to turn organic search into a measurable enquiry channel.",
    challenge:
      "Rocky Real Estate was operating on a WordPress platform carrying years of technical debt. Bloated plugins, fragmented structure, and outdated page architecture created friction across both search visibility and buyer experience.",
    approach:
      "The SEO specialist defined the strategy. The technical implementation — clean URLs, schema markup, optimized page structure, and removal of bloated plugins — made it executable. The result was a cleaner search foundation that helped organic traffic become the platform's primary acquisition channel.",
    outcome:
      "Rebuilt a high-traffic property platform around search visibility, buyer experience, and scalable campaign infrastructure — transforming a bloated legacy site into a cleaner, faster, and conversion-focused system.",
    rich: {
      disciplines: ["Frontend Engineering", "Technical SEO", "Campaign Systems", "WordPress"],
      engineeringStack: "WordPress (Custom Theme) · CRM Integration (Backend)",
      heroMetrics: [
        m("48K", "Total users across the platform"),
        m("43K", "Organic users — 89% of all inbound traffic"),
        m("36", "High-intent enquiries from organic and campaign traffic"),
        m("4 years", "Continuous platform management and optimization"),
      ],
      metricGroups: [
        group("Platform & SEO Infrastructure", [
          m("Lightweight", "Removed bloated plugins and unnecessary legacy overhead"),
          m("CRM", "Live property listings pulled directly from backend integration"),
          m("Modular", "Reusable landing page templates for future development launches"),
        ]),
      ],
      problemIntro:
        "Rocky Real Estate was operating on a WordPress platform carrying years of technical debt. Bloated plugins, fragmented structure, and outdated page architecture created friction across both search visibility and buyer experience.",
      problemSections: [
        sec("44 years of market presence. A digital platform trapping its value.", [
          b("Legacy Code Bloat", "Accumulated plugins and unnecessary legacy code slowed the platform and increased maintenance overhead."),
          b("Weak SEO Foundation", "URL structure, heading hierarchy, and page architecture were not aligned with how Dubai property buyers actually search."),
          b("No Clear Enquiry Journey", "Visitors could browse listings, but the platform lacked structured pathways guiding users toward contact and enquiry."),
          b("No Scalable Launch System", "New property developments required dedicated landing pages, but there was no modular system to launch campaigns efficiently."),
        ]),
      ],
      compare: {
        beforeLabel: "Before — old platform",
        afterLabel: "After — rebuilt version",
        caption: "Drag to compare the old platform vs the rebuilt version.",
      },
      transformationHeadline: "What I rebuilt.",
      transformationSections: [
        sec("Frontend Architecture & Platform Rebuild", [
          b("Custom theme", "Rebuilt the entire platform from scratch using a custom WordPress theme."),
          b("Lightweight codebase", "Removed unnecessary plugins and legacy code to establish a lightweight, maintainable codebase."),
          b("WordPress retained", "Retained WordPress as the CMS while rebuilding the frontend architecture properly — no shortcuts."),
          b("CRM listings", "Worked alongside a backend developer who connected the CRM to pull live property listings into frontend templates."),
          b("Scalable templates", "Structured frontend templates to support scalable listing management and long-term maintainability."),
        ]),
        sec("Technical SEO & Funnel Implementation", [
          b("Semantic URLs", "Implemented clean semantic URL structures based on SEO specialist recommendations."),
          b("Schema & sitemap", "Added schema markup, XML sitemap structure, and redirect handling."),
          b("Page structure", "Maintained clean heading hierarchy and structured page architecture across the platform."),
          b("Funnel tracking", "Integrated GA4 funnel tracking for scroll depth, listing engagement, and enquiry submissions."),
        ]),
        sec("Modular Campaign Page System", [
          b("Reusable templates", "Built reusable landing page templates for property launches and development campaigns."),
          b("Flexible layouts", "Designed flexible layouts supporting both paid campaign traffic and organic search visibility."),
          b("Launch system", "Created a scalable launch system allowing future development pages to be deployed without rebuilding from scratch."),
        ]),
        sec("Visual Design", [
          b("Campaign visuals", "Designed campaign visuals and marketing banners aligned with the Rocky brand direction."),
          b("Supporting graphics", "Created supporting graphics for listings, landing pages, and promotional campaigns."),
        ]),
        sec("Ongoing Platform Management (2021–2025)", [
          b("Four years", "Managed the platform continuously for four years."),
          b("Content updates", "Updated listings, agents, area pages, and property content regularly."),
          b("SEO improvements", "Applied ongoing SEO improvements based on specialist recommendations."),
          b("Performance", "Performed continuous performance optimization and frontend improvements."),
        ]),
      ],
      executionHeadline: "Built for search, structured for conversion.",
      executionDisciplines: [
        disc("Frontend Engineering", ["Custom WordPress Theme", "CRM-Connected Templates", "Property Detail Pages", "Search & Filtering", "Enquiry Flow"], "Homepage or listing page, property grid, search filters, enquiry flow"),
        disc("Technical SEO & Analytics", ["Semantic URL Structure", "Schema Markup", "XML Sitemap", "GA4 Funnel Tracking", "Redirect Handling"], "GA4 dashboard, organic traffic, funnel events, acquisition channels"),
        disc("Campaign Systems & Design", ["Reusable Landing Pages", "Marketing Banners", "Promotional Visuals", "Development Campaign Layouts"], "Campaign landing page, development visuals, marketing banners, promotional graphics"),
      ],
      resultsHeadline: "Cleaner foundation. Stronger performance.",
      resultGroups: [
        group("Traffic & Conversion", [
          m("48K", "Total users across the platform"),
          m("43K", "Organic users — 89% of all inbound traffic"),
          m("36", "High-intent enquiries from organic and campaign traffic"),
          m("Tracked", "Scroll depth and contact events monitored throughout the buyer journey"),
        ]),
        group("Platform & SEO Infrastructure", [
          m("Lightweight", "Removed bloated plugins and unnecessary legacy overhead"),
          m("CRM connected", "Live property data integrated into frontend listing templates"),
          m("4 years managed", "Ongoing platform management and optimization"),
          m("Reusable system", "Modular campaign templates supporting future launches"),
        ]),
      ],
      resultsNote:
        "Organic search became the platform's primary acquisition channel through a cleaner technical foundation and search-focused site structure.",
      whyItWorked: [
        "The rebuild wasn't just technical cleanup — it restructured the platform around how property buyers actually search, compare, and enquire.",
        "Property purchases are high-consideration decisions. Buyers revisit listings, compare locations, research communities, and explore options long before submitting an enquiry. The platform needed to support that behaviour through clearer navigation, stronger listing structure, and a more natural path toward contact.",
        "The SEO specialist defined the strategy. The technical implementation — clean URLs, schema markup, optimized page structure, and removal of bloated plugins — made it executable. The result was a cleaner search foundation that helped organic traffic become the platform's primary acquisition channel.",
        "The modular landing page system solved a recurring operational problem. Instead of rebuilding layouts for every new property launch, the platform could scale future campaigns through reusable templates built once and reused repeatedly.",
      ],
      takeaway:
        "Rebuilt a high-traffic property platform around search visibility, buyer experience, and scalable campaign infrastructure — transforming a bloated legacy site into a cleaner, faster, and conversion-focused system.",
    },
  },

  tip2gether: {
    shortDescription:
      "Designed and built a football tipping platform from brief to launch — defining how predictions, scoring, live match updates, and leaderboards work while developing the frontend systems that supported an active Bundesliga 2 season.",
    challenge:
      "The client wanted a platform where users could predict Bundesliga 2 match results, earn points, and compete against other participants through a live leaderboard. What didn't exist yet was the product itself.",
    approach:
      "The three-state match system became the key product decision. By structuring the experience around upcoming, live, and completed matches, the platform gained a clear and consistent logic that guided both design and development.",
    outcome:
      "Designed and built a football tipping platform from brief to launch — defining the product experience, developing the frontend systems, and collaborating with backend development to support an active Bundesliga 2 season.",
    rich: {
      disciplines: ["Product Design", "Frontend Development", "Laravel", "Football"],
      engineeringStack: "Laravel · Backend Developer Collaboration",
      heroMetrics: [
        m("1", "Complete football tipping platform designed and built"),
        m("3", "Match states: Upcoming · Live · Completed"),
        m("6 mo", "Design and development collaboration"),
        m("1 season", "Active Bundesliga 2 competition supported"),
      ],
      problemIntro:
        "The client wanted a platform where users could predict Bundesliga 2 match results, earn points, and compete against other participants through a live leaderboard. What didn't exist yet was the product itself. There were no wireframes, no established user flows, and no predefined rules for how predictions, points, rankings, or match updates should behave. Every major product decision had to be defined before development could begin.",
      problemSections: [
        sec("An idea, a football season, and no product yet.", [
          b("No Existing Product", "The platform had to be designed from scratch — no previous version, design system, or reference interface to build from."),
          b("Multiple Match States", "The experience needed to handle upcoming fixtures, live matches, and completed results without confusing users."),
          b("Competitive Experience", "Rankings, points, and leaderboard movement needed to feel motivating while remaining easy to understand."),
          b("Frontend & Backend Alignment", "The frontend needed to integrate cleanly with backend scoring logic, live match data, and leaderboard calculations."),
        ]),
      ],
      transformationHeadline: "What I designed and built.",
      transformationSections: [
        sec("Product design & user experience", [
          b("Blank brief", "Designed the platform from a blank brief — no wireframes or flows handed over."),
          b("User journey", "Defined the complete user journey from prediction submission to leaderboard results."),
          b("Match lifecycle", "Structured the experience around the lifecycle of a football match."),
          b("Visual language", "Created a consistent visual language across fixtures, scores, rankings, and results."),
        ]),
        sec("Three-state match system", [
          b("Upcoming", "Users can submit and update predictions before kickoff."),
          b("Live", "Scores update dynamically while predictions remain visible for comparison."),
          b("Completed", "Results are finalised, points are awarded, and leaderboard rankings are updated."),
          b("Core product decision", "This structure became the core product decision that allowed the platform to remain intuitive throughout the season."),
        ]),
        sec("Tipping & leaderboard experience", [
          b("Prediction flow", "Designed the prediction flow and score submission process."),
          b("Leaderboard views", "Structured leaderboard views to clearly display rankings, points, and position changes."),
          b("Simple competition", "Focused on creating competition without introducing unnecessary complexity."),
          b("Engagement & usability", "Balanced engagement and usability across both casual and returning users."),
        ]),
        sec("Frontend systems & implementation", [
          b("Match components", "Developed reusable match components adapting to upcoming, live, and completed states."),
          b("Interfaces", "Built frontend interfaces for fixtures, predictions, results, and rankings."),
          b("Laravel integration", "Integrated frontend systems with Laravel backend data."),
          b("Responsive layouts", "Designed responsive layouts for both desktop and mobile."),
        ]),
        sec("Backend collaboration", [
          b("Six-month build", "Worked closely with a backend developer throughout the six-month build."),
          b("Real states", "Designed components around real application states rather than static screens."),
          b("Edge scenarios", "Considered loading states, error handling, and live data scenarios during implementation."),
          b("Scoring logic", "Ensured frontend behaviour aligned with scoring logic and backend functionality."),
        ]),
      ],
      executionHeadline: "Designed and built as one continuous system.",
      executionDisciplines: [
        disc("Product Design", ["User Flows", "Match Lifecycle", "Prediction Experience", "Leaderboard UX"], "Wireframe or user flow diagram showing the prediction journey from fixture browse to leaderboard"),
      ],
      deliverablesHeadline: "A complete football tipping platform — from brief to live season.",
      deliverables: [
        {
          label: "Platform delivered",
          items: [
            "Football tipping interface — prediction submission, editing, and locking at kickoff",
            "Live score display — real-time match updates integrated with backend data",
            "Points system — automated scoring based on prediction accuracy",
            "Leaderboard — live rankings, points totals, and position movement",
            "Match history — completed fixtures with results and awarded points",
          ],
        },
      ],
      whyItWorked: [
        "The platform required more than interface design — it required product thinking.",
        "There was no specification defining how the experience should work. The design process had to answer fundamental product questions: how users submit predictions, how points are awarded, how rankings are surfaced, and how match information changes as games progress.",
        "The three-state match system became the key product decision. By structuring the experience around upcoming, live, and completed matches, the platform gained a clear and consistent logic that guided both design and development.",
        "Working alongside a backend developer for six months meant the frontend had to be designed around real application behaviour. Components weren't created as isolated screens — they were built to handle changing data, live match updates, and ongoing competition throughout an active football season.",
      ],
      takeaway:
        "Designed and built a football tipping platform from brief to launch — defining the product experience, developing the frontend systems, and collaborating with backend development to support an active Bundesliga 2 season.",
    },
  },
};

// Not in the database yet. Created as drafts (not published).
export const fresh = [
  {
    slug: "nuraya-properties",
    name: "Nuraya Properties",
    tagline: "Built to establish presence, not just fill a page.",
    shortDescription:
      "Established the digital foundation for a new Dubai real estate brand — developing the visual direction from a single logo, building a bilingual WordPress platform, deploying the production environment, configuring business email infrastructure, and implementing analytics from day one.",
    role: "Visual Design · Frontend Development · Bilingual · Analytics · Deployment & Email",
    category: "Real Estate",
    year: "",
    technologies: ["WordPress", "VS Code", "Adobe CC", "GA4"],
    challenge:
      "Nuraya Properties entered the Dubai real estate market without a website, brand guidelines, analytics, hosting infrastructure, or business email systems. The challenge wasn't redesigning an existing platform — it was creating an entire digital foundation from nothing.",
    approach:
      "Starting with only a logo meant the visual system had to do more work. Typography, spacing, colour hierarchy, and layout structure were all designed to create a sense of confidence and stability without relying on an established brand identity.",
    outcome:
      "Starting with only a logo, I established Nuraya Properties' digital foundation — creating the visual direction, building a bilingual website, deploying the platform, configuring business email infrastructure, and implementing analytics from day one.",
    imageAlt: "Nuraya Properties — bilingual real estate website",
    images: ["/case-studies/nuraya.jpg"],
    theme: { bg: "#ece8e1" },
    logo: { initials: "NP", bg: "#d8d3ca" },
    rich: {
      disciplines: ["Visual Design", "Frontend Development", "Bilingual Build", "WordPress"],
      engineeringStack: "WordPress (Custom Theme)",
      heroMetrics: [
        m("69", "Active users (+30%)"),
        m("273", "Events tracked (+54%)"),
        m("92", "Page views (+61%)"),
        m("+117%", "User engagement"),
      ],
      metricGroups: [
        group("Reach & Discovery", [
          m("5+", "Countries — UAE, France, US, UK, Poland"),
          m("FR", "France — top 5 country, month one"),
          m("+50%", "Organic search sessions, zero paid"),
        ]),
      ],
      problemIntro:
        "Nuraya Properties entered the Dubai real estate market without a website, brand guidelines, analytics, hosting infrastructure, or business email systems. The challenge wasn't redesigning an existing platform — it was creating an entire digital foundation from nothing.",
      problemSections: [
        sec("A logo, a brief, and an absolute infrastructure vacuum.", [
          b("No Existing Platform", "No website, codebase, or prior digital infrastructure to build upon — everything started from zero."),
          b("No Brand System", "Beyond a logo, no guidelines existed for typography, colour hierarchy, layout, or visual communication."),
          b("Bilingual Requirements", "English and French audiences needed equal priority without creating two disconnected experiences."),
          b("No Core Infrastructure", "No hosting environment, analytics setup, domain configuration, or business email system in place."),
        ]),
      ],
      compare: {
        beforeLabel: "Before — logo only",
        afterLabel: "After — live homepage",
        caption: "Before: logo only, no digital presence. After: live homepage.",
      },
      transformationHeadline: "What I built.",
      transformationSections: [
        sec("Building a brand system from a logo", [
          b("Logo as foundation", "Used the logo as the foundation for typography, spacing, colour hierarchy, and overall visual direction."),
          b("Market research", "Researched modern Dubai real estate platforms to validate design decisions against market expectations."),
          b("Visual system", "Developed a complete visual system focused on trust, clarity, and premium presentation."),
          b("Design language", "Created a consistent design language despite starting without formal brand guidelines."),
        ]),
        sec("Frontend design & development", [
          b("Custom theme", "Built a custom WordPress theme without page builders or pre-built templates."),
          b("Discovery-led layouts", "Designed layouts around property discovery and enquiry rather than visual decoration."),
          b("Content hierarchy", "Structured content hierarchy to support user trust and lead generation."),
          b("Responsive", "Built responsive layouts across mobile, tablet, and desktop devices."),
        ]),
        sec("Bilingual architecture", [
          b("One installation", "Managed English and French content within a single WordPress installation."),
          b("Language switching", "Integrated language switching naturally into the navigation experience."),
          b("Consistency", "Maintained consistency across both language versions without compromising usability."),
          b("Validated", "France appeared among the top visitor countries within the first tracked month — validating the investment."),
        ]),
        sec("Analytics from day one", [
          b("GA4 at launch", "Configured GA4 at launch to avoid losing valuable early-stage data."),
          b("Event tracking", "Implemented event tracking for page views, engagement, scroll depth, and form interactions."),
          b("Channel attribution", "Established channel attribution across Direct, Organic Search, Organic Social, and Referral traffic."),
          b("Baseline", "Created a measurable baseline for future growth and optimisation."),
        ]),
        sec("Website launch & infrastructure", [
          b("Deployment", "Deployed the website to a live production environment."),
          b("Hosting & DNS", "Configured hosting, domain, and DNS settings."),
          b("Forms", "Connected contact forms and enquiry flows to the appropriate inboxes."),
          b("Operational from launch", "Ensured analytics, forms, and email systems were fully operational from launch."),
          b("Launch-ready", "Delivered a launch-ready digital platform — not just a completed website."),
        ]),
      ],
      executionHeadline: "Built to perform from first publish.",
      executionDisciplines: [
        disc("Visual Design", ["Brand Interpretation", "Typography System", "Colour Hierarchy", "Real Estate UI Direction"], "Logo mark → colour palette → homepage UI, side by side"),
        disc("Frontend Development", ["Custom WordPress Theme", "Responsive Layouts", "Bilingual Implementation", "Mobile-First Structure"], "Desktop homepage and mobile view side by side"),
        disc("Analytics Setup", ["GA4 Implementation", "Event Tracking", "Acquisition Reporting", "Engagement Monitoring"], "GA4 overview — active users, event count, and acquisition chart"),
        disc("Website Launch", ["Website Deployment", "Domain & DNS Configuration", "Form Routing", "Production Launch"], "Hosting panel, DNS configuration, or email setup confirmation"),
      ],
      resultsHeadline: "A live, bilingual, measurable property platform — built from a logo.",
      resultGroups: [
        group("Traffic & Engagement", [
          m("69", "Active users (+30%)"),
          m("273", "Events tracked (+54%)"),
          m("92", "Page views (+61%)"),
          m("+117%", "User engagement"),
        ]),
        group("Reach & Discovery", [
          m("5+", "Countries — UAE, France, US, UK, Poland"),
          m("FR", "France — top 5 country, month one"),
          m("+50%", "Organic search sessions, zero paid"),
        ]),
      ],
      resultsNote:
        "The numbers are modest because the platform was new. What mattered was establishing measurable traction immediately and validating the foundation from launch.",
      whyItWorked: [
        "The challenge wasn't building a website. It was establishing credibility for a brand that had no digital presence.",
        "When users discover a real estate company for the first time, they make decisions quickly. They judge trust, professionalism, and legitimacy within seconds. Every design decision needed to support that first impression.",
        "Starting with only a logo meant the visual system had to do more work. Typography, spacing, colour hierarchy, and layout structure were all designed to create a sense of confidence and stability without relying on an established brand identity.",
        "The bilingual structure was not treated as an afterthought. It was built into the platform from the beginning so English and French-speaking audiences could experience the same level of quality and consistency without maintaining separate websites.",
        "Analytics were also implemented from day one. Instead of launching first and measuring later, the platform was built with measurement in mind, ensuring every visit, interaction, and enquiry could contribute to future decision-making.",
        "Just as importantly, the project extended beyond design and development. The website, analytics, hosting environment, and business email infrastructure were all launched together, giving Nuraya Properties a complete digital foundation from its first day online.",
      ],
      takeaway:
        "Starting with only a logo, I established Nuraya Properties' digital foundation — creating the visual direction, building a bilingual website, deploying the platform, configuring business email infrastructure, and implementing analytics from day one.",
    },
  },
  {
    slug: "althea-diamonds",
    name: "Althea Diamonds",
    tagline: "Built to make lab-grown diamonds feel like an obvious choice.",
    shortDescription:
      "Created the complete brand and e-commerce experience for a new Dubai lab-grown diamond jewellery company — developing the visual identity, building the Shopify storefront, and helping establish a cohesive visual presence that brought the brand to life.",
    role: "Brand Identity · Visual Design · Shopify Development · Theme Customisation · Visual Production Support",
    category: "E-commerce",
    year: "",
    technologies: ["Shopify", "Liquid", "VS Code", "Adobe CC"],
    challenge:
      "Althea Diamonds entered the competitive Dubai jewellery market specialising in lab-grown diamonds — a category that still requires education, trust, and strong brand positioning. The mandate was not to redesign an existing store. It was to launch a company from zero.",
    approach:
      "Because the brand and website were developed simultaneously, the final experience felt cohesive from launch. Visitors weren't interacting with separate pieces of work — they were interacting with a single brand experience.",
    outcome:
      "Created Althea Diamonds from the ground up — developing the brand identity, building the Shopify storefront, and helping establish a cohesive visual presence for launch.",
    imageAlt: "Althea Diamonds — brand identity and Shopify storefront",
    images: ["/case-studies/althea.jpg"],
    theme: { bg: "#f1ece6" },
    logo: { initials: "AD", bg: "#ddd6cc" },
    rich: {
      disciplines: ["Brand Identity", "Shopify Development", "Visual Design", "Jewellery"],
      engineeringStack: "Shopify · Liquid Theme Customisation · Custom CSS",
      heroMetrics: [
        m("1", "Jewellery brand created from scratch"),
        m("1", "Shopify storefront designed and launched"),
        m("1", "Visual identity system, complete and documented"),
        m("4", "Product categories: Rings · Earrings · Bracelets · Necklaces"),
      ],
      problemIntro:
        "Althea Diamonds entered the competitive Dubai jewellery market specialising in lab-grown diamonds — a category that still requires education, trust, and strong brand positioning. The mandate was not to redesign an existing store. It was to launch a company from zero. No logo existed. No visual identity had been established. No photography assets were available. No e-commerce infrastructure was in place.",
      problemSections: [
        sec("A luxury market opportunity with nothing but an idea.", [
          b("No Brand Identity", "No logo, colour system, typography, or visual language to build from."),
          b("High-Consideration Purchase", "Fine jewellery requires trust and credibility from the first visit — before a buyer reaches a product page."),
          b("No E-commerce Platform", "The entire shopping experience — from product discovery to checkout — needed to be designed and built."),
          b("No Visual Assets", "The website required product imagery and visual assets that felt aligned with the premium positioning of the brand."),
        ]),
      ],
      compare: {
        beforeLabel: "Before — brand concept",
        afterLabel: "After — live homepage",
        caption: "Before: brand concept, nothing built. After: live homepage.",
      },
      transformationHeadline: "What I designed and built.",
      transformationSections: [
        sec("Building the brand identity", [
          b("Logo", "Designed the logo from scratch."),
          b("Identity system", "Created a complete visual identity system — typography, colour palette, spacing, and hierarchy."),
          b("Brand direction", "Developed a brand direction that positioned lab-grown diamonds as a premium and credible alternative."),
          b("Consistency", "Applied the identity consistently across every customer touchpoint."),
        ]),
        sec("Shopify storefront development", [
          b("Storefront", "Built and customised the Shopify storefront around the brand system."),
          b("Liquid templates", "Modified Liquid templates to align layouts with the visual identity rather than relying on theme defaults."),
          b("Customer experience", "Structured collection pages, product pages, cart, and checkout around a consistent customer experience."),
          b("Hierarchy", "Applied typography, spacing, and visual hierarchy across the entire storefront."),
        ]),
        sec("Product experience", [
          b("Purchase confidence", "Structured product pages around trust, clarity, and purchase confidence."),
          b("Storytelling", "Balanced technical information, product imagery, and storytelling throughout the shopping journey."),
          b("Balanced layouts", "Designed layouts that gave product details and visuals equal importance."),
          b("Consistent browsing", "Created a consistent browsing experience across collections and product categories."),
        ]),
        sec("Visual production support", [
          b("Photography", "Participated in the product photography production process."),
          b("Visual execution", "Supported the visual execution of the brand across website and photography assets."),
          b("Imagery consistency", "Assisted in maintaining consistency between the storefront and product imagery."),
          b("Launch assets", "Contributed to the creation of launch-ready assets used throughout the website."),
        ]),
      ],
      executionHeadline: "Identity, store, and visual presence — built as one.",
      executionDisciplines: [
        disc("Brand Identity", ["Logo Design", "Typography", "Colour Palette", "Visual System"], "Logo mark, colour palette, and typography side by side — brand system overview"),
        disc("Shopify Development", ["Liquid Customisation", "Product Pages", "Collection Pages", "Cart Experience"], "Homepage and product page side by side"),
        disc("Visual Production Support", ["Photography Coordination", "Brand Consistency", "Launch Asset Preparation"], "Product photography used in context on the storefront"),
      ],
      deliverablesHeadline: "A complete brand and e-commerce platform — logo to live store.",
      deliverables: [
        { label: "Brand foundation", items: ["Logo designed from scratch", "Complete visual identity system", "Consistent brand direction across digital touchpoints"] },
        {
          label: "E-commerce platform",
          items: [
            "Shopify storefront launched",
            "Product pages, collection pages, cart, and checkout customised",
            "Theme customised through Liquid edits and frontend styling",
            "Product catalogue structured across rings, earrings, bracelets, and necklaces",
          ],
        },
        {
          label: "Visual assets",
          items: [
            "Product photography assets integrated throughout the storefront",
            "Launch-ready imagery prepared for web and marketing use",
            "Consistent visual language maintained across photography and website design",
          ],
        },
      ],
      whyItWorked: [
        "The challenge wasn't building a Shopify store. It was building trust.",
        "Lab-grown diamonds are still a relatively new category for many buyers. Before customers compare specifications, pricing, or designs, they decide whether the brand feels credible enough to purchase from.",
        "That meant every part of the experience needed to work together. The logo established the first impression. The visual identity created consistency. The storefront provided clarity. The photography supported the premium positioning of the brand and helped create a cohesive shopping experience.",
        "Because the brand and website were developed simultaneously, the final experience felt cohesive from launch. Visitors weren't interacting with separate pieces of work — they were interacting with a single brand experience.",
        "Shopify provided the platform, but the brand shaped the experience. Rather than adapting the identity to fit a theme, the storefront was customised to support the brand's visual direction and customer journey.",
      ],
      takeaway:
        "Created Althea Diamonds from the ground up — developing the brand identity, building the Shopify storefront, and helping establish a cohesive visual presence for launch.",
    },
  },
];
