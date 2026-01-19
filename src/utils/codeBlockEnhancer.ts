/**
 * Code Block Enhancer
 * - Adds copy buttons to code blocks
 * - Adds language labels
 * - Applies syntax highlighting classes
 */

export function enhanceCodeBlocks(containerSelector: string = '.post-content'): () => void {
  const container = document.querySelector(containerSelector);
  if (!container) return () => {};

  const codeBlocks = container.querySelectorAll('pre');
  const cleanupFunctions: (() => void)[] = [];

  codeBlocks.forEach((pre, index) => {
    // Skip if already enhanced
    if (pre.querySelector('.code-copy-btn')) return;

    // Get language from class or data attribute
    const code = pre.querySelector('code');
    let language = 'code';

    if (code) {
      const classMatch = code.className.match(/language-(\w+)/);
      if (classMatch) {
        language = classMatch[1];
      }
    }

    // Set data-language attribute for CSS ::before content
    pre.setAttribute('data-language', language);

    // Create copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy-btn';
    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>복사</span>
    `;

    const handleClick = async () => {
      const codeText = code?.textContent || pre.textContent || '';

      try {
        await navigator.clipboard.writeText(codeText);

        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>완료!</span>
        `;

        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>복사</span>
          `;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span>실패</span>
        `;

        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>복사</span>
          `;
        }, 2000);
      }
    };

    copyBtn.addEventListener('click', handleClick);
    pre.style.position = 'relative';
    pre.appendChild(copyBtn);

    // Cleanup function
    cleanupFunctions.push(() => {
      copyBtn.removeEventListener('click', handleClick);
      copyBtn.remove();
    });
  });

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(fn => fn());
  };
}

/**
 * Language display names mapping
 */
export const languageNames: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  jsx: 'JSX',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  json: 'JSON',
  python: 'Python',
  py: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  cs: 'C#',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  sql: 'SQL',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  markdown: 'Markdown',
  md: 'Markdown',
  dockerfile: 'Dockerfile',
  docker: 'Docker',
  graphql: 'GraphQL',
  gql: 'GraphQL'
};
