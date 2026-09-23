# TECH2PLACE Developer Guide

This guide describes development patterns, monorepo conventions, testing workflows, and best practices for engineers contributing to the TECH2PLACE ecosystem.

---

## 1. Branching & Git Workflow

* **Primary Feature Branch**: All work for the React Native ecosystem must be committed directly to `tech2place-react-native`.
* **Branch Verification**: Always confirm your active branch before committing:
  ```bash
  git branch --show-current
  # Expected: tech2place-react-native
  ```
* **Clean Commits**: Write descriptive commit messages summarizing the module affected (e.g. `feat(student): add minor project booking confirmation dialog`).

---

## 2. Monorepo Working Rules

### 2.1 Centralizing Shared Logic
* **NEVER duplicate types or constants** across apps.
* Put all data interfaces in `shared/types/`.
* Put all design system tokens in `shared/theme/`.
* Put all generic UI components in `shared/components/`.
* Any new utility or formatter goes into `shared/utils/` and must be exported via `shared/index.ts`.

### 2.2 Adding a New Screen
1. Create screen component inside `{app}/src/screens/{feature}/{ScreenName}.tsx`.
2. Use components and theme tokens imported from `@tech2place/shared`:
   ```typescript
   import {
     COLORS,
     SPACING,
     TYPOGRAPHY,
     Header,
     Card,
     Button,
   } from '@tech2place/shared';
   ```
3. Register the screen in `{app}/src/App.tsx` within the appropriate navigation tab or stack.

---

## 3. Automated Testing Suite

All unit and integration tests live in the `tests/` directory and use Node.js's native test runner (`node:test` and `node:assert/strict`).

### Running Tests:
```bash
npm test
```

### Adding New Tests:
Create a file named `tests/{feature}.test.js` following this structure:
```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Feature Test Suite', () => {
  test('validates condition properly', () => {
    assert.equal(true, true);
  });
});
```

---

## 4. UI/UX & Styling Conventions

* **Primary Blue**: `#026fc7` (Gradient / Accent: `#0c8ce9`)
* **Backgrounds**: Light mode `#F8FAFC`, Cards `#FFFFFF`
* **Spacing Scale**:
  * `xs`: 4px
  * `sm`: 8px
  * `md`: 16px
  * `lg`: 24px
  * `xl`: 32px
* **Typography**: Consistent scale defined in `shared/theme/typography.ts`. Never use magic font sizes or inline uncurated hex codes.
