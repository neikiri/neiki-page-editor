<?php
/**
 * NeikiPageEditorSanitizer — server-side complement to the JS sanitizer.
 * Uses PHP's built-in DOMDocument. No Composer dependencies.
 *
 * Usage:
 *   $safe = NeikiPageEditorSanitizer::sanitize($untrustedHtml);
 *
 * This is a stub — full implementation in Task 3.
 */
class NeikiPageEditorSanitizer
{
    /**
     * Sanitize untrusted HTML using an allowlist approach.
     *
     * @param string $html Untrusted HTML input
     * @return string Sanitized HTML safe for rendering and storage
     */
    public static function sanitize(string $html): string
    {
        // Stub — returns input unchanged until full implementation in Task 3.
        return $html;
    }
}
