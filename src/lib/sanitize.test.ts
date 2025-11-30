import { describe, it, expect } from 'vitest'
import { sanitizeHTML, sanitizeText, sanitizeMarkdown } from './sanitize'

describe('sanitize', () => {
  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script><p>Safe content</p>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('Safe content')
    })

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('onclick')
    })

    it('should allow safe HTML tags', () => {
      const input = '<p>This is <strong>bold</strong> and <em>italic</em></p>'
      const result = sanitizeHTML(input)
      expect(result).toContain('<strong>')
      expect(result).toContain('<em>')
    })

    it('should remove iframe tags', () => {
      const input = '<iframe src="malicious.com"></iframe><p>Content</p>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('<iframe>')
    })
  })

  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const input = '<p><strong>Bold</strong> text</p>'
      const result = sanitizeText(input)
      expect(result).toBe('Bold text')
      expect(result).not.toContain('<')
    })

    it('should remove scripts completely', () => {
      const input = '<script>alert("XSS")</script>Hello'
      const result = sanitizeText(input)
      expect(result).not.toContain('script')
      expect(result).toContain('Hello')
    })
  })

  describe('sanitizeMarkdown', () => {
    it('should allow markdown formatting', () => {
      const input = '<h1>Title</h1><p>Paragraph</p><code>code</code>'
      const result = sanitizeMarkdown(input)
      expect(result).toContain('<h1>')
      expect(result).toContain('<code>')
    })

    it('should still remove dangerous tags', () => {
      const input = '<script>alert(1)</script><h1>Title</h1>'
      const result = sanitizeMarkdown(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('<h1>')
    })
  })
})
