# BuildLink Profile Sections UI/UX Redesign Report

## Modern professional-profile redesign inspired by LinkedIn, but distinctly BuildLink

**Scope:** Skills, Portfolio, Professional Experience, Education & Training, Licences & Certifications, Languages, page layout, responsive behavior, and profile interaction patterns visible in the supplied screenshots.  
**Design direction:** Modern, advanced, responsive professional-network profile experience.  
**Reference model:** LinkedIn-style information architecture and interaction quality, without copying LinkedIn’s visual identity or exact layout.

---

## 1. Executive summary

The current lower profile page has a solid information model. It includes many of the sections expected on a professional profile: skills, projects, experience, education, certifications, and languages. The dark BuildLink theme is distinctive, and the consistent card treatment creates a sense of order.

However, the page currently feels closer to a **stack of database forms** than a polished professional profile. Most sections are visually similar, the content area is narrow, portfolio projects do not yet provide enough visual evidence, and a large amount of the desktop viewport is unused. The interface communicates that information exists, but it does not create enough confidence, momentum, or discovery.

The redesign should preserve the existing dark BuildLink personality while introducing:

- A wider responsive profile layout.
- Stronger hierarchy between featured and supporting information.
- Project-first visual storytelling.
- Timeline-based experience and education components.
- Richer certification and verification treatment.
- Better empty states and completion guidance.
- Clearer editing, sharing, visibility, and profile actions.
- Mobile-first responsive behavior.
- A right-side discovery rail on large screens.

The central design principle should be:

> **Show professional evidence first, then organize supporting credentials around it.**

For BuildLink, professional evidence means projects, project roles, built-environment skills, affiliations, certifications, and collaboration signals.

---

## 2. What the current design does well

### 2.1 Strong structural coverage

The page contains the correct broad categories for a professional profile. A user can present skills, portfolio work, employment, education, certifications, and languages without navigating multiple pages.

### 2.2 Consistent dark visual language

The navy background and blue card surfaces create a recognizable product atmosphere. The warm amber/brown accents provide contrast and can become a valuable BuildLink-specific visual signature.

### 2.3 Clear section boundaries

Each section is separated into its own card, making the page easy to divide into components. This is useful for implementation because each profile area can become a reusable module with its own loading, empty, edit, and read-only states.

### 2.4 Familiar editing pattern

The edit icons in section headers are easy to understand conceptually. The pattern should be retained, but the controls need stronger affordance, accessible labels, and better placement.

### 2.5 Profile completeness potential

The existing completion score from the upper profile area provides a strong mechanism for encouraging users to improve their profiles. The lower sections should connect directly to that score and explain which missing information would most improve visibility.

---

## 3. Main UX and visual problems

| Priority | Problem | Effect on users | Recommended direction |
|---|---|---|---|
| Critical | The desktop content column is too narrow | The profile feels compressed and leaves a large unused area | Use a wider max-width layout and introduce a purposeful right rail |
| High | Portfolio cards contain little visual or descriptive evidence | Users cannot quickly judge the person’s ability or project contribution | Turn projects into image-led featured cards with role, location, type, and outcome |
| High | Every section has almost the same visual weight | Important sections do not stand out from minor metadata | Make Featured Projects and Experience more prominent; make Languages more compact |
| High | Sections feel like static form output | The page lacks the rich, editorial quality expected from a professional network | Add timelines, badges, thumbnails, hover states, visibility cues, and meaningful empty states |
| High | Empty or placeholder content looks unfinished | Visitors may interpret incomplete information as a weak or abandoned profile | Use instructional empty states with clear next actions and examples |
| Medium | The left side and lower page have excessive empty space | The page feels like a centered form rather than a complete product workspace | Use a responsive grid and right-side modules on desktop |
| Medium | Edit controls are small and ambiguous | Users may miss how to update sections | Use consistent icon-button containers, labels/tooltips, and section-level actions |
| Medium | There is no clear distinction between public information and private information | Users may be uncertain who can see credentials or contact details | Add visibility indicators and profile preview mode |
| Medium | Count badges are small and low-value visually | They do not help users understand what is inside each section | Use counts as secondary metadata and pair them with clear section descriptions |
| Low | The chat button visually competes with page content | It draws attention away from profile actions | Reduce its prominence, add a label on hover, and ensure it does not overlap mobile content |

---

## 4. Recommended overall page architecture

### 4.1 Desktop layout

Move from a single narrow column to a three-region layout within a centered container:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Global header: logo · search · notifications · theme · account       │
├───────────────┬───────────────────────────────────┬─────────────────┤
│ App navigation │ Main profile content              │ Profile rail    │
│ 200–220px      │ 720–820px                         │ 280–320px       │
│               │                                    │                 │
│ Home Feed      │ Skills                            │ Profile strength│
│ Create         │ Featured Projects                 │ Suggested people│
│ Resource Hub   │ Experience                         │ Opportunities   │
│ Profile Board  │ Education                          │ Similar projects│
│               │ Certifications                     │                 │
│               │ Languages                          │                 │
└───────────────┴───────────────────────────────────┴─────────────────┘
```

The right rail should not be a dumping ground. It should contain modules that help users act:

- Complete your profile.
- Suggested connections.
- Similar professionals.
- Relevant opportunities or tenders.
- Featured project prompts.
- Profile visibility tips.

### 4.2 Tablet layout

At tablet widths, collapse the right rail below the main content or convert it into a horizontally scrollable set of compact modules. Keep the left navigation as a compact sidebar or drawer.

### 4.3 Mobile layout

At mobile widths:

- Replace the persistent left navigation with a menu drawer or bottom navigation.
- Keep the top header compact with menu, logo, notifications, and avatar.
- Use full-width cards with 16px page padding.
- Turn project grids into a single-column list or horizontal carousel.
- Make section actions reachable but not visually dominant.
- Allow profile tabs to scroll horizontally.
- Consider a sticky “Edit profile” or “Share” action only if it does not hide content.

---

## 5. Recommended profile information hierarchy

The profile should not present every section as equal. Use this order for maximum professional impact:

1. Identity header and professional headline.
2. Profile completion or visibility prompt.
3. About / professional summary.
4. Featured projects.
5. Professional experience.
6. Skills and tools.
7. Education and training.
8. Licences and certifications.
9. Recommendations or endorsements.
10. Languages.
11. Activity.

The current screenshots show Skills near the top of the lower page, followed by Portfolio and then résumé-style sections. Skills are useful, but projects and professional summary should generally carry more visual weight than a small set of skill chips.

---

## 6. Section-by-section redesign recommendations

## 6.1 Skills

### Current issue

The Skills section currently shows two chips, “Claude” and “Copilot,” in a relatively large card. The section is clean but visually sparse and does not communicate proficiency, relevance, or evidence.

### Recommended design

Group skills by category and support evidence:

- **Technical tools:** Claude, Copilot, AutoCAD, Revit, BIM tools, GIS, etc.
- **Professional skills:** Project coordination, site planning, documentation, research.
- **Built-environment disciplines:** Architecture, engineering, construction, planning.
- **Soft skills:** Communication, teamwork, leadership.

Use compact chips, but allow a featured skill treatment for the user’s top three skills. Where possible, connect a skill to a project or experience entry.

### Suggested component

```text
Skills                         Edit
Top skills                     2
[Claude] [Copilot]

Tools & software               4
[AutoCAD] [Revit] [Figma] [+1]

Professional skills            3
[Research] [Coordination] [+1]
```

### Useful interactions

- “Add skill” opens searchable suggestions.
- Users can reorder top skills.
- A skill can be associated with projects.
- Visitors can select a skill to filter relevant projects.
- Skills should have optional proficiency levels, but avoid overly precise self-rated percentages unless there is an endorsement system.

### Empty state

> Add the tools and professional skills you use most. Skills help people discover you for relevant projects and opportunities.

Primary action: **Add skills**.

---

## 6.2 Portfolio / Projects

### Current issue

The portfolio is currently the most underdeveloped section visually. The project blocks appear as small dark/brown placeholders with limited context. Since BuildLink is focused on the built environment, this section should be the profile’s strongest proof of credibility.

### Recommended design direction

Treat projects as **featured case studies**, not simple database records.

Each project should include:

- Cover image or project thumbnail.
- Project name.
- User’s role.
- Project type or discipline.
- Location.
- Date or project status.
- Short description.
- Tools or skills used.
- Collaborators or organization.
- Optional external link or document.

### Desktop card design

Use a two-column project grid within the main profile content. Each card should have:

- Image ratio: 16:10 or 4:3.
- Image overlay for status or project type.
- Clear title below image.
- Metadata row with location and year.
- One-line role or outcome.
- Hover state with “View project.”

Example:

```text
┌────────────────────────────────────────┐
│ [Project cover image]                  │
│  Featured · Residential                │
├────────────────────────────────────────┤
│ Green Court Housing                    │
│ Project Coordinator · Nairobi         │
│ 2025 · Construction & housing         │
│ Coordinated documentation and site...  │
└────────────────────────────────────────┘
```

### Empty project state

The current placeholders should be replaced with a purposeful empty state:

> Showcase the work you are proud of. Add a project with images, your role, location, and the result.

Actions:

- **Add your first project**
- **Use a project template**

### Project detail page

Clicking a project should open a detail view or modal with:

- Image gallery.
- Project summary.
- User contribution.
- Team members.
- Skills used.
- Location and timeline.
- Related projects.
- Share action.

This is one of the main ways BuildLink can go beyond a LinkedIn-style résumé.

---

## 6.3 Professional Experience

### Current issue

The current experience item displays placeholders such as “[Internship/Role],” “[Organization/Company],” and “[Timeline].” This reads like an unfilled form rather than a profile entry.

### Recommended design

Use a vertical timeline with a company or organization logo/avatar, role title, organization, employment dates, location, and accomplishments.

```text
●  Software / Technical Intern
│   Eidolon Technologies
│   Jan 2025 – Present · Nairobi
│
│   Built internal tools and supported project documentation.
│   Skills: Research · Coordination · Product development
│
●  Previous role
    Organization · Dates
```

### Experience card content

- Role title as the strongest text.
- Organization with link to firm/company profile where available.
- Date range and location as metadata.
- Description limited to 2–4 lines by default.
- Expand/collapse for longer content.
- Related projects and skills.
- Edit and visibility controls.

### Empty state

> Add your current role or most relevant experience. Focus on what you contributed and what you learned.

Primary action: **Add experience**.

---

## 6.4 Education & Training

### Current issue

The current Education & Training section is functional but visually flat. The institution, programme, and dates do not have enough hierarchy. “N/A” should not be shown as visible content.

### Recommended design

Use an education card with:

- Institution logo or education icon.
- Programme/degree as the primary title.
- Institution as the secondary line.
- Study period aligned to the right on desktop and below on mobile.
- Field of study.
- Relevant coursework or activities.
- Projects connected to the education entry.

Example:

```text
[Institution icon]  BSc Information Technology
                    KCA University
                    2025–2027 · Nairobi
                    Relevant focus: software, systems, digital tools
```

Replace “N/A” with either a meaningful value or omit the field entirely.

### Useful enhancement

Allow users to attach projects, certificates, or skills to their education. This helps students build credible profiles before they have extensive work experience.

---

## 6.5 Licences & Certifications

### Current issue

The certification content is important, but the design currently presents it as a simple row with a badge icon and a small credential identifier. The verification value is not visually prominent.

### Recommended design

Use certification cards with:

- Credential or certificate icon.
- Certification name.
- Issuing organization.
- Issue date and expiry date if applicable.
- Credential ID in secondary text.
- Verification status.
- “View credential” or verification link.

Example:

```text
[Verified badge]  File Associate
                  OPSWAT
                  Issued 2023 · Credential ID: OPSMAT970
                  ✓ Verified credential
```

### BuildLink-specific opportunity

Create a verified credential system. A verified certificate should receive a distinct badge and be usable as a search filter. This would give BuildLink a trust feature that is especially relevant to construction, engineering, and technical professionals.

### Privacy

Allow the user to control whether credential IDs are publicly visible. Some users may want to show the certification without exposing the full identifier.

---

## 6.6 Languages

### Current issue

The Languages section is appropriately compact, but it currently has limited information beyond a single chip.

### Recommended design

Use language chips or rows with proficiency labels:

- English — Fluent
- Kiswahili — Native or Fluent
- French — Intermediate

Avoid visual complexity for this section. It should remain compact because languages are supporting information, not the main profile evidence.

### Accessibility

Do not communicate proficiency through color alone. Always show a text label.

---

## 7. Improve section consistency without making every section identical

The current cards are consistent, but they are too similar in scale and treatment. Use a component system with controlled variation.

### Standard section header

Each section header should include:

- Section name.
- Optional count badge.
- Optional short descriptor.
- Edit button with tooltip and accessible name.
- “See all” action when content is truncated.

Example:

```text
Professional Experience     2 entries       Edit
Your roles, contributions, and career progress
```

### Card hierarchy

Use three levels:

1. **Featured card:** Portfolio/projects, prominent images, richer content.
2. **Standard card:** Experience, education, certifications.
3. **Compact module:** Languages, small skill groups, supporting metadata.

This prevents the page from looking like a repetitive stack of identical boxes.

---

## 8. Improve the profile editing experience

The small edit icon pattern is useful, but profile editing should be easier and more predictable.

### Recommended edit behavior

- Clicking a section’s edit icon opens an inline editor or side panel.
- Preserve the profile page behind the editor.
- Use autosave only where safe; otherwise provide explicit Save and Cancel actions.
- Show unsaved-change warnings.
- Provide previews for project images and certificates.
- Allow users to reorder sections and portfolio items.
- Add profile preview modes: **Public view**, **Recruiter/partner view**, and **Private draft** if needed.

### Visibility controls

Each section can have a small visibility control:

- Everyone
- Signed-in members
- Connections only
- Only me

Use a small visibility label such as “Public” or “Members” rather than hiding privacy settings inside a distant settings page.

---

## 9. Modern dark-theme design system

### 9.1 Color roles

Avoid assigning many unrelated colors directly to individual cards. Define semantic tokens:

| Token | Purpose |
|---|---|
| `background-page` | Deep navy page background |
| `surface-card` | Standard profile card |
| `surface-elevated` | Modal, dropdown, or highlighted module |
| `surface-selected` | Active navigation or selected tab |
| `border-subtle` | Low-emphasis card borders |
| `text-primary` | Main headings and important values |
| `text-secondary` | Supporting content |
| `text-muted` | Metadata and helper text, with accessible contrast |
| `brand-primary` | BuildLink red/orange actions |
| `brand-warm` | Amber/copper project accents |
| `state-success` | Verified or completed status |
| `state-warning` | Incomplete profile or attention needed |
| `state-danger` | Errors or destructive actions |

### 9.2 Surface treatment

Use subtle borders and restrained shadows. The design should not rely on large color blocks alone to distinguish sections. Recommended characteristics:

- 1px subtle border.
- 12–16px corner radius.
- 16–24px internal padding.
- Slightly lighter hover surface.
- Consistent focus ring using brand color plus sufficient contrast.

### 9.3 Typography

Recommended desktop scale:

| Element | Suggested size | Weight |
|---|---:|---:|
| Profile name | 26–32px | 700 |
| Page title | 20–24px | 700 |
| Section heading | 16–18px | 650–700 |
| Card title | 15–17px | 600–700 |
| Body content | 14–16px | 400–500 |
| Metadata | 12–14px | 400–500 |
| Labels/chips | 12–13px | 500–600 |

The current screenshot appears information-dense partly because the type hierarchy is too compressed. Increasing text size modestly and adding line-height will improve readability without making the page feel oversized.

---

## 10. Responsive behavior requirements

### Desktop: 1280px and above

- Persistent left navigation.
- Wide main content.
- Right-side profile/discovery rail.
- Two-column project grid.
- Timeline entries with aligned metadata.
- Full section actions.

### Tablet: 768–1279px

- Collapsible left navigation.
- Main content approximately 680–760px when available.
- Right rail moves below main content or becomes a horizontal module row.
- Project grid remains two columns only where card width is sufficient.

### Mobile: below 768px

- Single-column profile.
- Full-width cards.
- One project per row or swipeable project carousel.
- Section edit controls remain at the top right with 44px hit areas.
- Dates move below titles.
- Credential IDs and secondary metadata collapse behind “View details.”
- Bottom navigation or menu drawer replaces the desktop side navigation.
- Chat button must not cover Save, Add, or navigation controls.

### Responsive acceptance tests

Test at minimum:

- 375 × 812px.
- 390 × 844px.
- 768 × 1024px.
- 1024 × 768px.
- 1280 × 800px.
- 1440 × 900px.
- 1920 × 1080px.

Check for horizontal overflow, clipped cards, inaccessible edit buttons, awkward text wraps, and excessive empty space.

---

## 11. Accessibility and usability requirements

- All edit icons must have accessible names such as “Edit skills” or “Edit education.”
- Do not use color alone to show verification, completion, or proficiency.
- Use visible keyboard focus states.
- Ensure body and metadata text have sufficient contrast against navy surfaces.
- Keep touch targets approximately 44 × 44px or larger.
- Provide descriptive alt text for project images and institution logos.
- Use semantic heading order for profile sections.
- Announce save success and validation errors to assistive technology.
- Support keyboard navigation through cards, tabs, dialogs, and menus.
- Do not make hover-only functionality necessary for discovering project details.
- Offer reduced-motion behavior for users who request it.

---

## 12. Performance recommendations

A more visual project-first profile can become image-heavy. Protect performance with:

- Responsive image sizes using `srcset`.
- WebP or AVIF project thumbnails.
- Lazy loading below-the-fold images.
- Fixed aspect-ratio containers to prevent layout shifts.
- Skeleton loading for profile cards.
- Pagination or “Load more” for projects and experience when profiles become large.
- Optimistic UI for small profile edits.
- Cached profile summaries and thumbnails.

---

## 13. Suggested component inventory

Build a reusable component library around the profile experience:

- `ProfileShell`
- `ProfileHeader`
- `ProfileCompletionCard`
- `SectionCard`
- `SectionHeader`
- `EditIconButton`
- `VisibilityBadge`
- `SkillGroup`
- `SkillChip`
- `FeaturedProjectCard`
- `ProjectGrid`
- `ExperienceTimeline`
- `ExperienceItem`
- `EducationItem`
- `CertificationCard`
- `LanguageList`
- `EmptyState`
- `ProfileSidebarModule`
- `SuggestedConnectionCard`
- `OpportunityCard`
- `ProfilePreviewToggle`
- `ShareProfileDialog`

Each component should support loading, populated, empty, error, and read-only states.

---

## 14. Suggested revised lower-page wireframe

```text
┌────────────────────────────────────────────────────────────────────┐
│ Skills                                             Edit · See all   │
│ Top skills: [Claude] [Copilot] [Research] [+2]                    │
├────────────────────────────────────────────────────────────────────┤
│ Featured projects                    Add project · See all          │
│ ┌────────────────────┐ ┌────────────────────┐                     │
│ │ Project image      │ │ Project image      │                     │
│ │ Project name       │ │ Project name       │                     │
│ │ Role · Location    │ │ Role · Location    │                     │
│ │ Outcome summary    │ │ Outcome summary    │                     │
│ └────────────────────┘ └────────────────────┘                     │
├────────────────────────────────────────────────────────────────────┤
│ Professional experience                              Edit          │
│ ● Role · Organization · Dates                                        │
│   Contribution summary · Skills                                    │
│ ● Previous role · Organization · Dates                              │
├────────────────────────────────────────────────────────────────────┤
│ Education & training                                  Edit          │
│ [Logo] Degree / Programme · Institution · Dates                    │
├────────────────────────────────────────────────────────────────────┤
│ Licences & certifications                             Edit          │
│ [Verified] Credential · Issuer · Date · View credential             │
├────────────────────────────────────────────────────────────────────┤
│ Languages                                             Edit          │
│ English — Fluent · Kiswahili — Fluent                               │
└────────────────────────────────────────────────────────────────────┘
```

The right rail on desktop should sit alongside this content instead of leaving the page empty.

---

## 15. Product features that would make BuildLink distinct

The professional-profile foundation can become more valuable than a generic résumé by connecting identity to real built-environment work.

### Project collaboration graph

Show collaborators, firms, consultants, or team members connected to each project.

### Verified project contribution

Allow a project owner or organization to confirm a user’s role on a project. This is stronger than an unsupported self-claim.

### Built-environment taxonomy

Use discipline-specific categories such as architecture, civil engineering, structural engineering, quantity surveying, construction management, planning, surveying, real estate, and construction technology.

### Opportunity matching

Use skills, location, project interests, and experience to show relevant tenders, internships, events, and collaboration opportunities.

### Firm and institution relationships

Connect education and experience entries to organization pages where available.

### Project-based recommendations

Allow recommendations to reference a particular project, role, or collaboration rather than being generic testimonials.

---

## 16. Implementation roadmap

### Phase 1: Visual foundation

- Expand the desktop content container.
- Define dark-theme design tokens.
- Standardize section cards and headers.
- Increase typography and metadata readability.
- Improve focus states and icon-button hit areas.
- Replace visible “N/A” and placeholder strings with proper empty states.

### Phase 2: Profile architecture

- Add the right discovery rail.
- Reorder profile sections around summary, projects, and experience.
- Create consistent visibility controls.
- Add public profile preview and share behavior.
- Introduce a responsive navigation strategy.

### Phase 3: Portfolio upgrade

- Create image-led project cards.
- Add project metadata and detail pages.
- Add project image uploads and cropping.
- Add related skills and collaborators.
- Add project verification where possible.

### Phase 4: Credential and career quality

- Implement experience timelines.
- Improve education cards.
- Add credential verification states.
- Add recommendations and endorsements.
- Connect profiles to firms, institutions, and projects.

### Phase 5: Network intelligence

- Suggested connections.
- Related professionals.
- Opportunity matching.
- Search filters.
- Profile analytics.
- Profile visibility recommendations.

---

## 17. Success metrics

Measure whether the redesign improves both appearance and professional utility:

| Metric | What it indicates |
|---|---|
| Profile completion rate | Whether the new prompts motivate users to add information |
| Project creation rate | Whether portfolio design makes users showcase work |
| Project-card click-through | Whether project previews encourage exploration |
| Profile share rate | Whether users see the profile as presentation-ready |
| Connection/follow conversion | Whether the profile builds professional trust |
| Time to first profile action | Whether the hierarchy is clear |
| Mobile completion rate | Whether responsive behavior is working |
| Credential verification rate | Whether trust features are valuable |
| Search-to-profile engagement | Whether profiles are discoverable and compelling |

---

## 18. Final recommendation

The current page should not be redesigned as a simple visual copy of LinkedIn. It should adopt the **quality and information architecture of a mature professional network** while becoming more specific to BuildLink.

The most important transformation is:

> Move from a narrow stack of profile data cards to a wide, visual, project-first professional profile.

Prioritize the following changes:

1. Expand the page layout and use the empty desktop space productively.
2. Make projects image-led and information-rich.
3. Convert experience into a timeline.
4. Improve education and certification hierarchy.
5. Make empty states instructional rather than placeholder-like.
6. Introduce a useful right-side discovery rail.
7. Improve typography, contrast, spacing, and mobile behavior.
8. Add visibility, sharing, verification, and project-collaboration patterns.
9. Use BuildLink’s own dark navy, amber, and burnt-red identity instead of reproducing LinkedIn’s visual language.

If implemented in this order, the profile will feel more modern, more credible, and more useful for recruitment, collaboration, project discovery, and professional networking across Kenya’s built environment.
