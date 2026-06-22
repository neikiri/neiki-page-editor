# Contributing to Neiki's Page Editor

Thank you for your interest in contributing to Neiki's Page Editor.

Neiki's Page Editor is a source-available, framework-agnostic visual page/CMS editor focused on accurate HTML and CSS rendering inside an isolated iframe canvas.

This project welcomes bug reports, documentation improvements, tests, accessibility improvements, translations, and carefully scoped feature contributions.

## Code of Conduct

By participating in this project, you agree to follow the project's Code of Conduct.

Please be respectful, constructive, and patient when discussing issues, pull requests, and implementation decisions.

## Project Goals

Before contributing, please keep these goals in mind:

* The editor should remain lightweight and framework-agnostic.
* Core runtime code should use vanilla JavaScript.
* The editor canvas must use iframe isolation.
* Page CSS must not leak into editor chrome.
* Editor UI CSS must not leak into page content.
* The toolbar should visually and behaviorally match the original Neiki Editor toolbar experience.
* Security and sanitization are core requirements, not optional features.
* The public API should remain clean, stable, and easy to integrate.

## What You Can Contribute

Good contribution areas include:

* Bug fixes
* Tests
* Documentation
* Accessibility improvements
* Browser compatibility fixes
* Toolbar behavior fixes
* Modal and dropdown improvements
* i18n improvements for existing supported languages
* Security hardening
* Build and demo improvements

Large features should be discussed in an issue before implementation.

## What Not to Contribute Without Discussion

Please open an issue first before working on:

* Major architecture changes
* New runtime dependencies
* Framework-specific integrations
* Breaking API changes
* Large UI redesigns
* New built-in languages
* Changes to the license
* Changes to the sanitizer policy
* Changes to iframe sandbox behavior
* Replacing the command or selection architecture

## Development Setup

Clone the repository:

```bash
git clone https://github.com/neikiri/neiki-page-editor.git
cd neiki-page-editor
```

Install dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run all available tests:

```bash
npm run test:all
```

Start or open the demo according to the project README.

## Project Structure

Main source files live in:

```text
src/
```

Generated build files live in:

```text
dist/
```

Do not manually edit generated files in `dist/`. Update the source files and run the build instead.

Specs and project guidance live in:

```text
.kiro/specs/
.kiro/steering/
```

These files should be treated as the source of truth for architecture, feature scope, and implementation priorities.

## Coding Guidelines

Please follow these conventions:

* Use vanilla JavaScript.
* Do not add runtime dependencies unless clearly justified.
* Use `const` and `let`; do not use `var`.
* Keep modules focused and small.
* Keep editor-generated CSS classes prefixed with `npe-`.
* Do not use generic class names that may conflict with page content.
* Do not hardcode user-facing strings; use the i18n system.
* Do not use `console.log` in production paths.
* Guard iframe access because `contentDocument` may be unavailable during init or after destroy.
* Make cleanup methods idempotent where possible.
* Keep toolbar, modals, dropdowns, and overlays in the host document.
* Keep edited page content inside the iframe document.

## Security Guidelines

Security-sensitive code must follow these rules:

* Never add `allow-scripts` to the iframe sandbox by default.
* Do not execute scripts from loaded page HTML.
* Sanitize all HTML before rendering or saving.
* Remove unsafe tags, event handlers, and unsafe protocols.
* Block `data:` URLs by default unless explicitly allowed by configuration.
* Validate external stylesheet URLs before injecting them.
* Do not inject arbitrary `<link rel="stylesheet">` tags from untrusted HTML.
* Do not bypass the sanitizer for paste, drag-drop, source view, or API-loaded content.

If you find a security vulnerability, do not open a public issue. Follow `SECURITY.md`.

## Toolbar and UX Contributions

The toolbar should match the original Neiki Editor experience from the user's perspective.

This means:

* Similar visual layout
* Similar grouping
* Similar icon style
* Similar button sizing
* Similar hover, active, disabled, and dropdown states
* Similar Insert and More menu behavior

Internal names do not need to match the old editor. The new project should keep its own architecture.

Do not copy the old implementation directly. Use it only as UX and behavior reference.

## Testing

Please add or update tests when changing behavior.

Recommended test areas:

* Sanitizer behavior
* Style injection order
* HTML/CSS round-trip behavior
* iframe isolation
* Selection save/restore
* Toolbar state
* Insert modals
* Source view
* Multiple editor instances
* Destroy cleanup

Before opening a pull request, run:

```bash
npm test
npm run build
```

If available, also run:

```bash
npm run test:property
npm run test:integration
```

## Commit Style

Use clear, conventional commit-style messages where possible:

```text
fix: repair insert dropdown actions
feat: add source view modal layout
test: add sanitizer protocol tests
docs: update API examples
refactor: simplify toolbar button rendering
```

## Pull Request Checklist

Before submitting a pull request, please check:

* [ ] The change is consistent with the project specs.
* [ ] The change does not break iframe isolation.
* [ ] The change does not introduce unnecessary runtime dependencies.
* [ ] User-facing text goes through i18n.
* [ ] New or changed behavior is tested where practical.
* [ ] The project builds successfully.
* [ ] Generated files are not manually edited.
* [ ] Security-sensitive changes are documented.
* [ ] The change does not copy old Neiki Editor implementation code directly.

## Reporting Bugs

When reporting a bug, please include:

* A clear description of the issue
* Steps to reproduce
* Expected behavior
* Actual behavior
* Browser and operating system
* Minimal HTML/CSS example if relevant
* Console errors if any
* Screenshots or screen recordings if useful

## Feature Requests

Feature requests are welcome, but they should fit the project's goals.

Please include:

* The use case
* Why the feature belongs in the core editor
* Whether it can be a plugin instead
* Any accessibility or security implications
* Example UI or API usage if relevant

## License

By contributing to this project, you agree that your contributions are provided under the project's license and contribution terms.

Please review the `LICENSE` file before submitting contributions.