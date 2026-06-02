# SettingsPanel

A full-screen drawer that lets users manage their TalentTrust preferences. Opened by `SettingsTrigger`. Fully accessible (WCAG 2.1 AA): implements dialog semantics, focus trap, Escape key handling, and focus restoration.

---

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls whether the panel is rendered and visible |
| `onClose` | `() => void` | Yes | Callback invoked when the panel should close (Escape, backdrop click, Close button, Done button) |

---

## Usage

```tsx
import { SettingsTrigger } from '@/components/settings/SettingsTrigger';

// SettingsTrigger manages isOpen state and renders SettingsPanel internally.
// Place it once at the app/layout level.
export default function Layout({ children }) {
  return (
    <>
      {children}
      <SettingsTrigger />
    </>
  );
}
```

To use `SettingsPanel` standalone:

```tsx
import { useState } from 'react';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export function MyComponent() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open settings</button>
      <SettingsPanel isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

---

## Keyboard Interactions

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the next interactive element inside the panel. Wraps from the last element back to the first. |
| `Shift + Tab` | Move focus to the previous interactive element. Wraps from the first element to the last. |
| `Escape` | Close the panel and restore focus to the element that opened it. |
| `Enter` / `Space` | Activate the focused button or toggle. |

---

## ARIA Attributes

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `"dialog"` | Identifies the drawer as a modal dialog to assistive technologies |
| `aria-modal` | `"true"` | Tells screen readers that content behind the dialog is inert |
| `aria-labelledby` | `"settings-panel-title"` | Associates the dialog with its visible "Settings" heading |

---

## Focus Management

### On open
- The close button (`aria-label="Close settings"`) receives focus immediately, so keyboard users know where they are.

### Focus trap
- `Tab` and `Shift+Tab` are intercepted via a `keydown` listener on `document`. Focus cycles through all non-disabled focusable elements inside the dialog and never reaches the page behind it.

### On close
- Managed by `SettingsTrigger`: a `useRef` holds a reference to the gear-icon trigger button. After the panel unmounts, `requestAnimationFrame` restores focus to that button, satisfying WCAG 2.4.3 Focus Order.

---

## Preferences Managed

| Preference | Options |
|------------|---------|
| Theme | `light` / `dark` / `system` |
| Currency Display | `usd` / `ngn` / `compact` |
| Toast Density | `relaxed` / `compact` |
| Quiet Mode | on / off (toggle) |

Preferences are persisted to `localStorage` under the key `talenttrust-user-preferences` via the `usePreferences` hook (`@/lib/preferences`).

---

## Testing

Tests live in `src/components/settings/__tests__/SettingsPanel.test.tsx` and cover:

- Visibility (renders nothing when closed, renders when open)
- All preference interactions and localStorage persistence
- Close via button, backdrop, Done button, and Escape key
- Dialog ARIA attributes (`role`, `aria-modal`, `aria-labelledby`)
- Focus trap (Tab wraps forward, Shift+Tab wraps backward)
- Initial focus on close button when panel opens
- `focus-visible` ring classes on all interactive controls

Run:

```bash
npm test -- --testPathPattern=SettingsPanel
```
