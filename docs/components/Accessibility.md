# Accessibility Testing

Automated accessibility regression tests catch contrast, role, labeling, and semantic issues before they reach production. The project uses [jest-axe](https://github.com/nickcolley/jest-axe) (axe-core integration for Jest) to audit rendered DOM against [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/) success criteria.

## Setup

- **jest-axe** is installed as a dev dependency.
- The custom `toHaveNoViolations` matcher is registered in `jest.setup.js`.
- A shared helper module lives at `src/test-utils/a11y.tsx` with:
  - `testA11y(ui, options?)` — renders a component and asserts zero axe violations.
  - `assertNoA11yViolations(container)` — runs axe on an already-rendered container.
  - `renderWithA11y(ui, options?)` — standard RTL render (alias for convenience).

### Test helper API

```tsx
import { testA11y, renderWithA11y, assertNoA11yViolations } from '@/test-utils/a11y';

// One-shot: render + assert
await testA11y(<MyComponent prop="value" />);

// Two-step: render, run assertions, then check a11y
const { container, getByRole } = renderWithA11y(<MyComponent prop="value" />);
expect(getByRole('heading')).toBeInTheDocument();
await assertNoA11yViolations(container);
```

## Test file

All a11y regression tests are colocated in `src/components/__tests__/a11y.test.tsx`. Each component section covers multiple states that produce meaningfully different DOM output:

| Component | Tested states |
|-----------|---------------|
| `MilestonesList` | Empty, single milestone, multiple statuses, missing optional fields |
| `ContractSummary` | Active + multiple parties, Disputed, Completed with single milestone |
| `ReputationProfile` | No reputation, full score + history, partial (score without history), null score |
| `EmptyState` | Text-only, with illustration variant, with primary action, with both actions |

## Running

```bash
npm test
```

Axe audits run as part of the standard Jest suite. Any violation fails the suite with a detailed report of the rule, selector, and suggested fix.

## CI

The GitHub Actions workflow (`.github/workflows/ci.yml`) already runs `npm test` on every push and pull request to the `main` branch. Adding new a11y tests to `a11y.test.tsx` automatically gates violations in CI.

## Adding a new component

1. Render every distinct state of the component (empty, populated, error, loading, etc.).
2. Call `await testA11y(<Component ... />)` for each state.
3. If the component depends on a context provider, wrap it in the provider before passing to `testA11y`.

## Caveats

- **jest-axe** runs in a JSDOM environment, which does not fully simulate visual rendering. Color-contrast violations are still detected because axe checks computed styles from JSDOM's CSS support.
- Dynamic changes (e.g. after a button click or data fetch) require a separate `testA11y` call after the state change — axe does not auto-observe mutations.
- For full end-to-end a11y coverage, supplement these unit tests with manual screen-reader and keyboard-navigation checks.
