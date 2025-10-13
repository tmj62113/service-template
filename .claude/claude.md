# Project Instructions for Claude Code

## ⚠️ CRITICAL: Preventing Breaking Changes

### BEFORE Making ANY Code Changes

**MANDATORY CHECKLIST** - Complete these steps EVERY TIME you modify code:

1. **Understand the Full Impact**
   - Search the ENTIRE codebase for all files that import or use the component/function you're modifying
   - Use `Grep` tool to find all references: `grep -r "import.*ComponentName" src/`
   - Identify ALL dependent components, pages, and tests
   - Document the dependency chain

2. **Run ALL Existing Tests FIRST**
   ```bash
   npm run test:run
   ```
   - Note the current test count and pass rate
   - If ANY tests fail before you start, FIX THEM FIRST
   - Baseline: All tests must be green before making changes

3. **Search for Existing Functionality**
   - NEVER duplicate existing code
   - Use `Grep` to search for similar functions/components: `grep -r "functionName" src/`
   - Check stores, utilities, and components for reusable code
   - Ask: "Does this functionality already exist somewhere?"

### AFTER Making Code Changes

**MANDATORY VERIFICATION** - Do this EVERY TIME:

1. **Run Full Test Suite**
   ```bash
   npm run test:run
   ```
   - ALL tests must still pass (not just new ones)
   - Test count should increase (if you added tests)
   - Zero regressions allowed

2. **Test in Browser**
   - Manually verify the changed feature works
   - Check that dependent features still work
   - Test user workflows that use the modified code

3. **Search for Broken References**
   - Use IDE diagnostics or: `npm run lint`
   - Check for TypeScript/import errors
   - Verify all imports are still valid

### Red Flags That Indicate Problems

🚨 **STOP and INVESTIGATE if you see:**
- Test count decreased (tests were deleted)
- Previously passing tests now fail
- Browser console errors
- Duplicate similar code in multiple files
- Unused imports or functions
- Components that look similar but do slightly different things

## Testing Requirements

### Mandatory Test-Driven Development
When creating or modifying any component or feature, you MUST:

1. **Write unit tests FIRST or IMMEDIATELY after implementation**
   - Every new component must have a corresponding `.test.jsx` or `.test.js` file
   - Every new feature must include tests for all new functionality
   - Tests must be placed in the same directory as the component/module being tested

2. **Test Coverage Requirements**
   - Components: Test rendering, props, user interactions, and conditional rendering
   - Pages: Test page content, navigation links, form submissions
   - Stores/State: Test all state mutations, selectors, and side effects
   - Utilities/Functions: Test all function inputs, outputs, and edge cases

3. **Run Tests Before Proceeding**
   - Run `npm run test:run` after creating tests
   - ALL tests must pass before moving to the next step
   - Fix any failing tests immediately
   - Do not create git commits with failing tests

### Test Structure Guidelines
```javascript
// Component tests should include:
- Rendering tests (component displays correctly)
- Props tests (component handles different props)
- User interaction tests (clicks, inputs, form submissions)
- State change tests (component updates correctly)
- Conditional rendering tests (different UI states)
- Integration tests with other components if applicable

// Store tests should include:
- Initial state tests
- Action/mutation tests
- Selector tests
- Side effect tests
```

## Git Commit Requirements

### Mandatory Git Workflow
After completing ANY feature or component AND ensuring all tests pass:

1. **Stage Changes**
   ```bash
   git add .
   ```

2. **Create Detailed Commit Message**
   Every commit MUST follow this format:
   ```
   <type>: <short summary>

   <detailed description of what was added/changed>

   Tests Added:
   - List all test files created/modified
   - Mention number of tests passing

   <optional additional context>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

3. **Commit Types**
   - `feat`: New feature
   - `fix`: Bug fix
   - `test`: Adding or updating tests
   - `refactor`: Code refactoring
   - `style`: Styling changes
   - `docs`: Documentation updates
   - `chore`: Build process or auxiliary tool changes

### Commit Message Examples

```
feat: Add product detail page with modal view

Implemented a detailed product view that opens in a modal when users click on a product card.
Includes product image gallery, full description, specifications, and add to cart functionality.

Tests Added:
- src/components/products/ProductDetail.test.jsx (8 tests)
- All 66 tests passing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
test: Add comprehensive tests for checkout flow

Created integration tests for the complete checkout process including form validation,
payment processing simulation, and order confirmation.

Tests Added:
- src/pages/Checkout.test.jsx (15 tests)
- src/components/checkout/PaymentForm.test.jsx (10 tests)
- All 91 tests passing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Development Workflow

### Step-by-Step Process (MANDATORY ORDER)

#### Phase 1: Discovery & Analysis
1. **Understand Requirements** - What exactly needs to be built/changed?
2. **Search for Existing Code** - Use Grep tool to find:
   - Similar components or functions already built
   - Existing utilities that can be reused
   - Related functionality that might be affected
3. **Run Baseline Tests** - `npm run test:run` (all must pass)
4. **Identify Dependencies** - Search codebase for:
   - Components that import what you're changing
   - Tests that reference the code
   - Pages/routes that use the functionality

#### Phase 2: Implementation
5. **Reuse First, Build Second**
   - Extend existing components instead of creating duplicates
   - Import existing utilities instead of rewriting
   - Document why new code is needed if similar exists
6. **Write/Modify Code**
   - Make targeted changes
   - Update existing components instead of creating parallel ones
   - Keep changes focused and minimal

#### Phase 3: Testing
7. **Write New Tests** - Cover your new/modified functionality
8. **Update Existing Tests** - If you changed signatures/behavior
9. **Run Full Test Suite** - `npm run test:run`
   - ALL tests must pass (not just new ones)
   - Test count should increase (unless refactoring)
   - Document if test count decreased (with reason)

#### Phase 4: Verification
10. **Manual Testing** - Test in browser:
    - Your feature works correctly
    - Related features still work
    - No console errors
    - UI renders correctly
11. **Check Dependencies** - Verify nothing broke:
    - Search for imports of changed code
    - Test workflows that use the modified code
    - Check related pages still load

#### Phase 5: Commit
12. **Stage & Commit** - Follow git commit format
13. **Verify** - `git log --oneline -1`
14. **Document Impact** - In commit message, mention if existing tests were updated

### Before Moving to Next Task - COMPLETE CHECKLIST
- [ ] Searched for existing similar functionality (found none OR reused it)
- [ ] Ran baseline tests before starting (all passing)
- [ ] Identified all dependent code
- [ ] All new tests are written
- [ ] All existing tests still pass (`npm run test:run`)
- [ ] Manually tested in browser (feature works)
- [ ] Manually tested dependent features (nothing broke)
- [ ] No duplicate code created
- [ ] No unused code left behind
- [ ] Code has been committed with detailed message
- [ ] Commit includes test information and impact analysis

## Testing Tools & Commands

### Available Test Commands
- `npm test` - Run tests in watch mode (interactive)
- `npm run test:run` - Run all tests once (CI mode)
- `npm run test:ui` - Open Vitest UI for visual test running
- `npm run test:coverage` - Generate coverage report

### Test File Naming
- Component tests: `ComponentName.test.jsx`
- Store tests: `storeName.test.js`
- Utility tests: `utilityName.test.js`
- Page tests: `PageName.test.jsx`

## Code Quality Standards

### Before Committing
1. Ensure no console.log statements (unless intentional)
2. Remove commented-out code
3. Verify imports are used
4. Check for type errors
5. Run linter if available: `npm run lint`

## Important Notes

⚠️ **NEVER skip writing tests** - Tests are not optional
⚠️ **NEVER commit with failing tests** - All tests must pass
⚠️ **ALWAYS include test information in commits** - Document what was tested
⚠️ **ALWAYS run tests before committing** - Verify nothing broke

## Project-Specific Context

### Technology Stack
- **Frontend**: React 19 + Vite
- **Backend**: Express.js + MongoDB
- **Routing**: React Router v7
- **State Management**: Zustand
- **Styling**: CSS Modules
- **Testing**: Vitest + React Testing Library
- **Database**: MongoDB Atlas
- **Payment**: Stripe
- **Email**: Resend
- **Image Upload**: Cloudinary

### Running the Application

**IMPORTANT**: This application requires THREE processes to be running:

1. **Start the Backend Server** (Port 3001):
   ```bash
   node server.js
   ```
   - Handles API requests
   - Connects to MongoDB Atlas
   - Manages products, orders, and customers
   - Processes Stripe payments

2. **Start the Frontend Server** (Port 5173):
   ```bash
   npm run dev
   ```
   - Serves the React application
   - Connects to backend API on port 3001

3. **Start Stripe Webhook Listener** (REQUIRED for order processing):
   ```bash
   stripe listen --forward-to localhost:3001/api/webhook
   ```
   - Forwards Stripe webhook events to local server
   - **CRITICAL**: Without this, orders will NOT be saved to database
   - **CRITICAL**: Without this, confirmation emails will NOT be sent
   - Copy the webhook signing secret and add to `.env` as `STRIPE_WEBHOOK_SECRET`

**MongoDB Atlas Setup**:
- Ensure your current IP address is whitelisted in MongoDB Atlas
- If products aren't loading, check MongoDB connection in server logs
- Connection errors are usually due to IP whitelist restrictions

**Stripe Webhooks Setup**:
- Order creation depends on Stripe webhooks being forwarded to local server
- Always keep `stripe listen` running during development
- If webhook secret changes, update `.env` and restart backend server

### Key Files
- `/server.js` - Express backend server
- `/src/stores/cartStore.js` - Shopping cart state management
- `/src/config/theme.js` - Whitelabel theming configuration
- `/db/models/Product.js` - Product database model
- `/db/models/Order.js` - Order database model
- `/db/connection.js` - MongoDB connection

### Testing Setup
- Test setup file: `/src/test/setup.js`
- Test configuration: `vite.config.js` (test section)
- All tests use Vitest and React Testing Library

## Style Guide & Design System Reference

### Quick Links
- **Browser Style Guide**: http://localhost:5173/style-guide (when dev server running)
- **Setup Guide**: [NEW_CLIENT.md](../NEW_CLIENT.md)
- **CSS Customization**: [CSS_CUSTOMIZATION.md](../CSS_CUSTOMIZATION.md)
- **Theme Configuration**: [/src/config/theme.js](../src/config/theme.js)
- **Design System CSS**: [/src/styles/design-system.css](../src/styles/design-system.css)
- **Visual Test Page**: http://localhost:5173/test-utilities

### Using the Design System

**ALWAYS check the style guide BEFORE creating new components or styles:**

1. **Search for existing utility classes** in design-system.css:
   - Buttons: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--outline`, `.btn--sm`, `.btn--lg`
   - Cards: `.card`, `.card--sm`, `.card--lg`, `.card--elevated`, `.card--bordered`
   - Typography: `.heading`, `.text`, `.text--muted`, `.text--bold`, `.text--uppercase`
   - Badges: `.badge`, `.badge--success`, `.badge--error`, `.badge--warning`
   - Forms: `.form-input`, `.form-label`, `.form-error`, `.form-group`
   - Containers: `.container`, `.container--sm`, `.container--lg`

2. **Use CSS variables** for all custom styling:
   - Colors: `var(--color-primary)`, `var(--color-secondary)`, `var(--color-dark)`
   - Spacing: `var(--spacing-xs)` through `var(--spacing-2xl)`
   - Radius: `var(--radius-sm)` through `var(--radius-full)`
   - Shadows: `var(--shadow-sm)` through `var(--shadow-xl)`
   - Transitions: `var(--transition-fast)`, `var(--transition-base)`, `var(--transition-slow)`

3. **Customize brand colors** in `/src/config/theme.js` (NOT in CSS files):
   - Edit the `colors` object to change primary, secondary, accent colors
   - Changes automatically apply to all CSS variables

4. **Add client-specific overrides** ONLY in `/src/styles/client.css`:
   - ❌ DON'T edit `design-system.css` or `template.css`
   - ✅ DO override utility classes in `client.css`
   - ✅ DO use CSS variables for consistency

## Code Reusability & Preventing Duplication

### BEFORE Creating ANY New Component/Function

**Ask yourself these questions:**

1. **Does this already exist?**
   ```bash
   # Search for similar components
   grep -r "ComponentName" src/components/

   # Search for similar functions
   grep -r "functionName" src/

   # Search for similar functionality keywords
   grep -r "cart\|shopping\|basket" src/

   # Search for existing utility classes in design-system.css
   grep -r "btn\|card\|badge" src/styles/design-system.css
   ```

2. **Can I extend an existing component?**
   - Check if existing component accepts props for customization
   - Can you add an optional prop instead of creating a new component?
   - Example: Instead of `<PrimaryButton>` and `<SecondaryButton>`, use `<Button variant="primary" />`

3. **Can I extract shared logic into a utility?**
   - Look for repeated code patterns
   - Create utilities in `/src/utils/` for reusable functions
   - Import and reuse instead of copy-paste

### Red Flags for Code Duplication

🚨 **STOP if you notice:**
- Copy-pasting code from another file
- Creating components with names like `ComponentName2`, `ComponentNameNew`, `ComponentNameV2`
- Similar CSS classes in multiple files (`.button-primary`, `.primary-button`, `.btn-primary`)
- Writing the same logic with slight variations
- Multiple components that "look similar but do X differently"

### How to Handle Discovered Duplication

If you find existing code that does something similar:

1. **Analyze the Existing Code**
   - Read the implementation
   - Check its tests to understand expected behavior
   - Look at how it's currently used

2. **Decide: Extend or Create New?**
   - **Extend** if: The existing code can handle your use case with minor changes
   - **Create New** if: Your use case is fundamentally different AND would break existing usage
   - **Document** your decision in a code comment

3. **If Extending:**
   - Add optional props/parameters
   - Update existing tests
   - Add new tests for new functionality
   - Verify all existing usages still work

4. **If Creating New:**
   - Extract shared logic to a utility
   - Import that utility in both places
   - Document why separate implementations are needed
   - Add tests for both implementations

### Commit Message for Refactoring

When you consolidate duplicate code:
```
refactor: Consolidate duplicate button components into unified Button component

Removed PrimaryButton and SecondaryButton components which had ~80% duplicate code.
Created single Button component with 'variant' prop supporting 'primary' and 'secondary'.

Changes:
- Removed: src/components/PrimaryButton.jsx
- Removed: src/components/SecondaryButton.jsx
- Added: src/components/Button.jsx with variant support
- Updated: All imports across 12 files

Tests Updated:
- Migrated PrimaryButton.test.jsx and SecondaryButton.test.jsx to Button.test.jsx
- All 58 tests still passing

Breaking Changes: None (backward compatible via variant prop)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## When Adding New Features

### Discovery Checklist (Do this FIRST)

1. **Search for existing implementations:**
   ```bash
   # Search components
   ls src/components/
   grep -r "ComponentName" src/

   # Search utilities
   ls src/utils/
   grep -r "functionName" src/

   # Search for keywords related to your feature
   grep -ri "keyword" src/
   ```

2. **Check if existing components can be reused**
   - Review component props and flexibility
   - Look for composition opportunities
   - Consider HOCs or hooks for shared behavior

3. **Follow existing file structure and naming conventions**
   - Match the pattern of existing code
   - Use consistent naming (e.g., all tests end in `.test.jsx`)
   - Place files in appropriate directories

4. **Use theme variables from `/src/config/theme.js`**
   - Never hardcode colors, spacing, or fonts
   - Always reference theme variables
   - Maintain whitelabel flexibility

5. **Write tests that cover happy path AND edge cases**
   - Test normal usage
   - Test error conditions
   - Test boundary conditions
   - Test integration with other components

6. **Mock external dependencies (APIs, stores, etc.)**
   - Keep tests isolated and fast
   - Use vi.mock() for external dependencies
   - Test component logic, not dependencies

7. **Test user interactions with `@testing-library/user-event`**
   - Simulate real user behavior
   - Test clicks, typing, form submissions
   - Verify UI updates correctly

---

## Final Reminders

⚠️ **CRITICAL RULES:**
- **ALWAYS run `npm run test:run` BEFORE and AFTER changes**
- **NEVER duplicate code** - Search first, reuse or extend existing
- **NEVER commit with failing tests** - All tests must pass
- **ALWAYS verify dependent code still works** - Run full test suite
- **ALWAYS search for existing functionality** - Use Grep tool extensively
- **ALWAYS update existing tests** when modifying code
- **ALWAYS document why new code is needed** if similar exists

**Remember**:
- Quality over speed
- Reuse over rewrite
- Test everything that matters
- Break nothing that works
- Well-tested, DRY code is maintainable code
- Every feature should be production-ready with comprehensive tests before moving forward

---

## Design & Visual Development

### Design System Documentation

**Mark J Peterson Art Brand Assets:**
- **Design System Reference**: `/context/design/design-system/DESIGN_SYSTEM.md`
- **Brand Analysis**: `/context/design/design-system/mjpeterson-art_analysis.json`
- **Style Guide**: `/context/design/design-system/mjpeterson-art_style_guide.html`
- **Design Principles**: `/context/design/design-principles.md`
- **Design Tokens**: `/context/design/design-system/*.json` (colors, typography, spacing, components)

**When making visual (front-end, UI/UX) changes, ALWAYS refer to these files for guidance.**

### Quick Visual Verification

IMMEDIATELY after implementing any front-end change:

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against design system documentation
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review

Invoke the `design-review` agent for thorough design validation when:

- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing
- Want to ensure world-class design quality

**Usage:**
```bash
# Use the agent directly
@design-review

# Or use the slash command
/design-review
```

The design review agent will systematically test:
- ✅ User interaction flows
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Visual polish and consistency
- ✅ Accessibility (WCAG 2.1 AA compliance)
- ✅ Robustness and edge cases
- ✅ Code quality and design token usage
- ✅ Console errors and warnings

### CSS Styling Workflow

**Design System Architecture:**
- `/src/styles/design-system.css` - Core utility classes and design tokens (DO NOT EDIT directly)
- `/src/styles/client.css` - Mark J Peterson Art specific overrides (EDIT HERE)
- `/src/config/theme.js` - Whitelabel configuration including colors, fonts, spacing

**When Adding Styles:**

1. **First, search for existing utility classes:**
   ```bash
   grep -r "btn\|card\|badge" src/styles/design-system.css
   ```

2. **Use existing utilities when possible:**
   ```css
   /* ✅ GOOD: Use existing utility classes */
   <button className="btn btn--primary">

   /* ❌ BAD: Create duplicate styles */
   <button className="custom-button">
   ```

3. **For client-specific styles, add to client.css:**
   ```css
   /* /src/styles/client.css */

   /* Override design system variables */
   :root {
     --color-primary: #8E44AD;  /* Mark's purple */
   }

   /* Add client-specific classes */
   .artwork-card {
     /* Use design system variables */
     padding: var(--spacing-md);
     border-radius: var(--radius-md);
   }
   ```

4. **Never hardcode values - use CSS variables:**
   ```css
   /* ✅ GOOD */
   padding: var(--spacing-md);
   color: var(--color-primary);

   /* ❌ BAD */
   padding: 16px;
   color: #8E44AD;
   ```

### Design Iteration Process

1. **Review Design Context** - Read relevant files in `/context/design/`
2. **Implement Changes** - Make CSS/component changes following design system
3. **Quick Verification** - Follow quick visual check steps above
4. **Run Tests** - Ensure no regressions: `npm run test:run`
5. **Design Review** - Use `design-review` agent for comprehensive validation
6. **Iterate** - Address any issues found in review
7. **Commit** - Follow git commit requirements with design changes documented

### Accessibility Requirements

All UI changes MUST meet WCAG 2.1 AA standards:

- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Focus States**: Visible focus indicators on all interactive elements
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Semantic HTML**: Use proper HTML elements (`<button>`, `<nav>`, etc.)
- **Alt Text**: All images must have descriptive alt attributes
- **Form Labels**: All form inputs must have associated labels
- **ARIA**: Use ARIA attributes only when semantic HTML insufficient

The `design-review` agent will automatically test for these requirements.

### Responsive Design Standards

Test all changes at these breakpoints:

- **Desktop**: 1440px (primary development viewport)
- **Tablet**: 768px (verify layout adaptation)
- **Mobile**: 375px (ensure touch optimization)

**Requirements:**
- No horizontal scrolling at any breakpoint
- Touch targets minimum 44x44px on mobile
- Readable text without zooming
- Proper spacing and layout at all sizes

### Browser Testing

Test in multiple browsers before finalizing:
- Chrome (primary)
- Firefox
- Safari
- Edge

Use `mcp__playwright__browser_console_messages` to catch browser-specific issues.

---

## Design Review Agent Usage

The `design-review` agent conducts systematic reviews following Silicon Valley best practices (Stripe, Airbnb, Linear standards).

### When to Use

- After completing UI features
- Before merging visual changes
- When unsure about design quality
- To validate accessibility compliance
- To test responsive behavior

### What It Tests

**Phase 1: Interaction & User Flow**
- Primary user workflows
- Interactive states (hover, active, disabled)
- Destructive action confirmations
- Perceived performance

**Phase 2: Responsiveness**
- Desktop (1440px) viewport
- Tablet (768px) adaptation
- Mobile (375px) optimization
- No overlap or scrolling issues

**Phase 3: Visual Polish**
- Layout alignment
- Spacing consistency
- Typography hierarchy
- Color palette usage
- Image quality

**Phase 4: Accessibility**
- Keyboard navigation (Tab order)
- Focus states visibility
- Keyboard operability (Enter/Space)
- Semantic HTML
- Form labels
- Alt text
- Color contrast ratios

**Phase 5: Robustness**
- Form validation
- Content overflow scenarios
- Loading states
- Empty states
- Error states
- Edge cases

**Phase 6: Code Health**
- Component reuse
- Design token usage
- Pattern adherence

**Phase 7: Content & Console**
- Grammar and clarity
- Console errors/warnings

### Report Structure

The agent provides categorized feedback:

- **[Blocker]**: Critical failures requiring immediate fix
- **[High-Priority]**: Significant issues to fix before merge
- **[Medium-Priority]**: Improvements for follow-up
- **[Nitpick]**: Minor aesthetic details

All issues include screenshots for visual problems.

---

## Final Design Workflow Checklist

When completing any UI/UX work:

- [ ] Reviewed design system documentation in `/context/design/`
- [ ] Used existing utility classes from `design-system.css`
- [ ] Added client-specific styles only to `client.css`
- [ ] Used CSS variables (no hardcoded values)
- [ ] Tested manually in browser at all breakpoints
- [ ] Ran quick visual verification steps
- [ ] Used `design-review` agent for comprehensive validation
- [ ] Addressed all blockers and high-priority issues
- [ ] Verified keyboard accessibility
- [ ] Checked color contrast ratios
- [ ] Tested in multiple browsers
- [ ] Ran full test suite (`npm run test:run`)
- [ ] All tests passing
- [ ] Committed with detailed message including design changes

---