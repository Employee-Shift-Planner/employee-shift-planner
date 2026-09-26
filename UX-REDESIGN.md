# Shiftly UX redesign specification

## Product direction

Shiftly should optimize for two modes: high-density weekly planning for supervisors on desktop and fast, focused actions for employees and supervisors on phones. The UI should feel calm and operational: the current task is prominent, exceptions are visible, and secondary configuration stays out of the way.

## Audit findings

| Priority | Problem | Impact | Recommended solution |
| --- | --- | --- | --- |
| High | The previous mobile header contained the full desktop navigation in a horizontal strip. | Destinations were hidden off-screen and content lost vertical space. | Use a persistent five-item bottom bar and a modal More sheet; keep the desktop sidebar and collapse it to icons on tablet. |
| High | The supervisor schedule used a minimum 1,080px employee grid at every viewport. | Phone users had to pan in two dimensions and could not compare or open shifts reliably. | Use a daily mobile view with day tabs, shift cards, status, employee identity, and previous/next controls. |
| High | Page actions wrap without a primary-action hierarchy. | Create/publish/copy compete visually and become hard to tap. | Keep one primary action, render others as secondary/overflow actions, and use a contextual mobile FAB for creation. |
| High | Many controls depend on color and compact text. | Status is harder to scan and some information is inaccessible to low-vision users. | Pair color with labels/icons, maintain 4.5:1 text contrast, and retain visible focus rings. |
| High | Tables and matrices generally use desktop minimum widths. | Availability, reports, users, attendance, and audit data overflow on phones. | Provide card/list renderers below 768px; reserve horizontal scrolling for genuinely comparative matrices. |
| Medium | Global spacing, radii, borders, and shadows are inconsistent. | Screens appear assembled rather than part of one system. | Use shared 4px-grid tokens, surface borders, three radii, and two elevations. |
| Medium | Forms are long and expose all fields at once. | Creation takes longer and validation errors appear far from decisions. | Group related fields into cards; use a stepper for multi-part shift/employee creation; validate inline on blur and submit. |
| Medium | Schedule warnings, readiness, publication, holidays, and coverage appear as separate full-width blocks. | Operational signal is diluted by repeated banners. | Use one exception summary with counts and expandable detail; keep publication status in the sticky action bar. |
| Medium | Buttons often use large minimum widths and gray filled secondary actions. | Dense toolbars wrap early and destructive actions can look primary. | Use content-width secondary buttons, outline destructive buttons, and icon-only actions with tooltips where unambiguous. |
| Medium | Empty/loading/error states vary by page. | Users cannot predict recovery actions. | Standardize EmptyState, Skeleton, and AlertBanner with a clear next action. |
| Low | Icons were absent from primary navigation. | Navigation required slower text-only scanning. | Use a consistent 20px outline icon set with text labels. |

## Design system

### Color

| Token | Value | Usage |
| --- | --- | --- |
| Primary | `#2563EB` | Primary actions, selected navigation, links, focus context |
| Primary hover | `#1D4ED8` | Hover/pressed primary actions |
| Secondary | `#475569` | Secondary emphasis and neutral actions |
| Success | `#16855B` | Published, approved, available |
| Warning | `#B76E00` | Drafts, pending review, coverage risk |
| Danger | `#CF3542` | Conflicts, cancellation, destructive actions |
| Background | `#F5F7FB` | Application canvas |
| Surface | `#FFFFFF` | Cards, menus, controls |
| Text | `#172033` | Headings and body text |
| Muted text | `#64748B` | Supporting copy; avoid below 12px |
| Border | `#E2E8F0` | Surface and control boundaries |

Status mapping: Draft = warning; Published/Approved = success; Cancelled/Conflict = danger; Pending = warning; Open shift = primary; unavailable/off = neutral. Every status includes visible text, not color alone.

### Typography and spacing

- Font stack: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Display/page title: 34/37 desktop, 28/31 tablet, 26/29 mobile; weight 700.
- Section title: 20/28; weight 700. Card title: 16/24; weight 700.
- Body: 14/21. Supporting text: 12/18. Avoid essential text below 11px.
- Base grid: 4px. Common spacing: 8, 12, 16, 20, 24, 32, and 48px.
- Mobile page gutter: 16px; tablet: 28px; desktop: 32–48px.
- Radius: controls 8px, compact cards 12px, primary surfaces 16px.
- Elevation: borders by default; small shadow for raised cards; medium shadow only for menus, sticky tools, and dialogs.

### Responsive rules

- `320–700px`: bottom navigation, single-column forms, card-based records, daily schedule.
- `701–1100px`: collapsed 76px icon rail, two-column content where useful.
- `1101px+`: 240px sidebar and dense weekly planning workspace.
- Test explicitly at 320, 375, 414, 768, 1024, 1280, and 1440px.

## Information architecture and page recommendations

### Supervisor dashboard

Add `/dashboard` as the default manager route.

```text
[Good morning, Miriam]                         [Create shift]
[Week status / exceptions summary............................]
[Scheduled 42] [Open 3] [Coverage 94%] [Weekly cost $18.4k]
[Weekly forecast chart................] [Approvals 6........]
[Coverage risks.......................] [Upcoming leave.....]
[Conflicts and overtime warnings.............................]
```

Each metric links to the filtered workflow that resolves it. Alerts should say what happened, who is affected, and the next action.

### Schedule

- Desktop: sticky date/action header, sticky employee column, virtualized week grid, resize/reassign drag interactions, and keyboard alternatives.
- Tablet: three-day window with date paging and collapsible filters.
- Mobile: implemented daily tabs and shift cards; next add swipe gestures and a create-shift FAB.
- Shift card content: avatar/initials, employee, position, time, status, and labeled conflict/overtime indicators.
- Quick menu: Edit (`Pencil`), Duplicate (`Copy`), Reassign (`UserRoundCog`), Publish (`Send`), Cancel (`Ban`).

### Employees and employee profile

- Replace the mobile table with EmployeeCard: avatar, name, position, availability summary, phone/email actions, and overflow menu.
- Profile layout: identity/contacts, current role and rate, availability, upcoming shifts, leave, then notes/audit.
- Create/edit flow: Basics → Employment → Availability → Review. Keep a visible draft summary and inline validation.

### Availability

- Desktop retains a matrix with sticky names and dates.
- Mobile uses an employee/day selector and editable time blocks rather than a compressed matrix.
- Clearly distinguish unavailable, preferred, and available states with labels/patterns.

### Time off

- Use a date-range picker, leave-type choice, calculated duration, and remaining-balance card.
- Supervisor cards show requester, dates, coverage impact, balance, note, and Approve/Decline.
- Detail includes a timeline: Submitted → Reviewed → Approved/Declined.

### Operations

- Separate Swaps, Attendance, and Audit into tabs with URL state.
- Put pending work first and history second. Use bulk approval only when the action is reversible or confirmed.

### Reports

- Begin with KPI cards and plain-language insights; charts follow; detailed tables are last.
- Mobile tables become labeled summary cards with an Export action in the page menu.

### Notifications and settings

- Group settings by outcome, not implementation. Show save state next to the changed section.
- Use toggles only for immediate binary settings; use checkboxes for batch selection.
- User access now uses a compact creation form and full-width account list.

### Employee mobile schedule

```text
[Today, Fri 25]                      [notifications]
[Next shift: 9:00 AM–5:00 PM / Cashier / Main branch]
[View details] [Request swap]

This week
[Mon  shift card]
[Tue  Off]
[Wed  shift card]
```

Keep the next shift, venue, manager contact, and swap/time-off actions within one thumb reach.

## Shared component architecture

```text
src/components/
  layout/       AppShell, Sidebar, BottomNav, PageHeader, ActionBar
  schedule/     ScheduleGrid, DailySchedule, ShiftCard, ShiftQuickMenu
  employees/    EmployeeCard, EmployeeProfileHeader
  dashboard/    StatCard, ExceptionSummary, CostForecast
  reports/      ResponsiveTable, ChartCard, InsightCard
  forms/        FormSection, Stepper, DateRangeField, EmployeeSearch
  mobile/       BottomSheet, FloatingActionButton, SwipeTabs
  ui/           Button, Icon, AlertBanner, EmptyState, Skeleton, Badge
```

Use semantic variants (`primary`, `secondary`, `danger`) instead of page-specific color classes. Shared components own focus, disabled, loading, empty, and error behavior.

## Accessibility acceptance criteria

- Every interactive control is keyboard reachable with a visible focus indicator.
- Touch targets are at least 44×44px; adjacent icon actions have at least 8px separation.
- Text contrast meets WCAG 2.2 AA (4.5:1 normal, 3:1 large text and controls).
- Icon-only buttons have accessible names; decorative SVGs are hidden from assistive technology.
- Dialogs trap focus, close with Escape, restore focus, and expose title/description relationships.
- Drag/drop features have keyboard Move/Reassign alternatives and announce results via `aria-live`.
- Tables retain real headers on desktop; mobile card equivalents expose the same labels and data.
- Status and validation never rely on color alone; errors link to their fields.
- Motion respects `prefers-reduced-motion`.

## Delivery plan

### Phase 1 — quick wins (high impact / low–medium effort)

- Shared tokens, surfaces, focus treatment, buttons, responsive sidebar/bottom navigation. **Implemented.**
- Daily mobile supervisor schedule and shift cards. **Implemented.**
- Convert remaining mobile tables to cards; normalize PageHeader, alerts, empty states, and form controls.
- Add icons to page actions and status summaries.

### Phase 2 — workflow improvements (high impact / medium effort)

- Supervisor dashboard and exception routing.
- Shift and employee form steppers with searchable employee assignment.
- Time-off balance/coverage context and approval timeline.
- Sticky schedule header/employee column and consolidated exception summary.

### Phase 3 — advanced scheduling (high impact / high effort)

- Accessible drag-to-reassign, drag-to-resize, quick actions, and hover/focus previews.
- Tablet three-day schedule; mobile swipe gestures and contextual FABs.
- Virtualization/performance work for large teams and audit histories.

### Phase 4 — enterprise polish (medium impact / medium effort)

- Skeleton loading, optimistic transitions with undo, motion/reduced-motion pass.
- Full WCAG audit, browser/device matrix, visual regression tests, and analytics on workflow completion.
- Final copy, empty-state illustration, icon, and cross-page consistency pass.

## Production checks

For every phase: run unit tests and a production build; test keyboard-only navigation; test zoom at 200%; run axe; verify 320/375/414/768/1024 widths; test loading, empty, error, offline, long-name, high-record-count, and reduced-motion states.
