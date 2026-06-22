# Security Policy

## Supported Project Status

Neiki's Page Editor is currently under active development.

Security reports are welcome for the current development version and any public release distributed by the project maintainer.

Until a stable release is published, security fixes may be applied directly to the main development branch.

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues, discussions, pull requests, or social media.

To report a possible security vulnerability, email:

dev@neikiri.dev

Please include as much relevant detail as possible:

* A clear description of the vulnerability
* Steps to reproduce
* A minimal proof of concept if available
* Affected files, APIs, options, or browser behavior
* Browser and operating system
* Potential impact
* Whether the issue is already public
* Your preferred contact information

Please avoid including sensitive user data, private credentials, or live exploit targets in your report.

## What Counts as a Security Issue

Security issues may include, but are not limited to:

* Cross-site scripting through unsanitized HTML
* Unsafe iframe sandbox behavior
* Accidental script execution inside the editor canvas
* Unsafe handling of `javascript:` or `data:` URLs
* Sanitizer bypasses
* Unsafe paste or drag-drop behavior
* Unsafe Source View behavior
* Unsafe stylesheet URL injection
* Leakage between iframe page content and host editor UI
* Exposure of private data through autosave or metadata handling
* Vulnerabilities in upload handling integration
* Build or package issues that could compromise users

## Security Model

Neiki's Page Editor is designed around these security principles:

* Page content is rendered inside a sandboxed iframe.
* The iframe must not include `allow-scripts` by default.
* All untrusted HTML must be sanitized before rendering or saving.
* Toolbar, modals, dropdowns, and overlays are editor UI and must stay outside page content.
* Page CSS must not affect the editor UI.
* Editor CSS must not affect page content.
* External stylesheets must be explicitly provided and validated.
* Client-side sanitization is a UX safeguard, not a full security boundary.
* Applications using the editor should also sanitize on the server before storing content.

## Out of Scope

The following are usually not considered security vulnerabilities by themselves:

* Bugs that require disabling the sanitizer intentionally
* Issues caused only by unsafe custom upload handlers
* Issues caused only by unsafe server-side integration code
* Missing security headers on a user's own website
* Browser extensions modifying editor behavior
* Social engineering attacks unrelated to the editor
* Denial of service through extremely large trusted input
* Visual layout bugs without security impact
* Reports without a reproducible scenario or clear impact

If you are unsure whether something is security-related, please report it privately anyway.

## Expected Response

After receiving a report, the maintainer will try to:

1. Acknowledge the report.
2. Review and reproduce the issue.
3. Assess severity and affected versions.
4. Prepare a fix when appropriate.
5. Credit the reporter if desired.
6. Publish a security note or release when appropriate.

Response times may vary depending on project availability, but serious reports will be prioritized.

## Coordinated Disclosure

Please give the maintainer reasonable time to investigate and fix the issue before publicly disclosing details.

Do not publicly share exploit code, proof-of-concept payloads, or vulnerability details before a fix or mitigation is available, unless the maintainer has agreed to disclosure.

## Security Fixes

Security fixes should be:

* Minimal and focused
* Covered by tests when practical
* Consistent with the sanitizer policy
* Consistent with iframe isolation
* Documented in the changelog or release notes when appropriate

## Pull Requests for Security Issues

For minor hardening changes, a normal pull request is acceptable.

For vulnerabilities with real exploit potential, please report privately first instead of opening a public pull request.

## Attribution

Security researchers may be credited in release notes or advisories if they want credit.

If you prefer to remain anonymous, say so in your report.

## Contact

Security contact:

dev@neikiri.dev