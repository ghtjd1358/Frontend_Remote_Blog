import { marked } from 'marked';
import { createHighlighter, Highlighter } from 'shiki';

// Shiki highlighter 싱글톤
let highlighter: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

// Shiki 초기화
async function getHighlighter(): Promise<Highlighter> {
  if (highlighter) return highlighter;
  
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['one-dark-pro'],
      langs: [
        'javascript', 'typescript', 'tsx', 'jsx', 'json',
        'html', 'css', 'scss', 'python', 'java', 'c', 'cpp',
        'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql',
        'bash', 'shell', 'yaml', 'xml', 'markdown', 'graphql'
      ],
    });
  }
  
  highlighter = await highlighterPromise;
  return highlighter;
}

// 페이지 로드 시 미리 초기화
getHighlighter().catch(console.error);

// marked 설정
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Heading index 추적
let headingIndex = 0;

function resetHeadingIndex() {
  headingIndex = 0;
}

// Custom renderer
const renderer = new marked.Renderer();

// 코드 블록은 나중에 shiki로 처리하기 위해 placeholder 사용
renderer.code = function({ text, lang }) {
  const language = lang || 'text';
  const escapedCode = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<pre data-shiki-lang="${language}"><code>${escapedCode}</code></pre>`;
};

renderer.heading = function({ text, depth }) {
  const id = `heading-${headingIndex++}`;
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

marked.use({ renderer });

// 이미지 URL 패턴
const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;

/**
 * 콘텐츠를 파싱하여 HTML로 변환 (동기 버전 - 기본 하이라이팅)
 */
export function parseContent(content: string): string {
  if (!content) return '';
  
  resetHeadingIndex();
  
  let parsed = content;
  
  const hasMarkdownCodeBlocks = /```[\s\S]*?```/.test(content);
  const hasMarkdownHeaders = /^#{1,6}\s+/m.test(content);
  const hasMarkdownLists = /^[\s]*[-*+]\s+/m.test(content);
  
  if (hasMarkdownCodeBlocks || hasMarkdownHeaders || hasMarkdownLists) {
    parsed = marked.parse(content, { async: false }) as string;
  } else {
    const isFullHtml = content.trim().startsWith('<') && content.trim().endsWith('>');
    if (!isFullHtml) {
      parsed = marked.parse(content, { async: false }) as string;
    }
  }
  
  parsed = convertImageUrls(parsed);
  
  return parsed;
}

/**
 * Shiki로 코드 하이라이팅 적용 (비동기)
 */
export async function applyShikiHighlighting(html: string): Promise<string> {
  try {
    const hl = await getHighlighter();
    
    // data-shiki-lang 속성이 있는 pre 태그 찾아서 하이라이팅 적용
    const codeBlockRegex = /<pre data-shiki-lang="([^"]*)"[^>]*><code>([\s\S]*?)<\/code><\/pre>/g;
    
    let result = html;
    let match;
    
    const replacements: { original: string; highlighted: string }[] = [];
    
    while ((match = codeBlockRegex.exec(html)) !== null) {
      const [fullMatch, lang, code] = match;
      
      // HTML 엔티티 디코딩
      const decodedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'");
      
      // 언어 확인 및 하이라이팅
      const loadedLangs = hl.getLoadedLanguages();
      const language = loadedLangs.includes(lang as any) ? lang : 'text';
      
      let highlighted: string;
      try {
        highlighted = hl.codeToHtml(decodedCode, {
          lang: language,
          theme: 'one-dark-pro',
        });
        
        // shiki 출력에 복사 버튼용 클래스 추가
        highlighted = highlighted.replace(
          '<pre',
          `<pre data-language="${lang}"`
        );
      } catch (e) {
        // 하이라이팅 실패 시 기본 스타일
        highlighted = `<pre data-language="${lang}" style="background-color: #282c34"><code style="color: #abb2bf">${code}</code></pre>`;
      }
      
      replacements.push({ original: fullMatch, highlighted });
    }
    
    // 치환 적용
    for (const { original, highlighted } of replacements) {
      result = result.replace(original, highlighted);
    }
    
    return result;
  } catch (error) {
    console.error('Shiki highlighting failed:', error);
    return html;
  }
}

/**
 * 텍스트로 된 이미지 URL을 img 태그로 변환
 */
function convertImageUrls(html: string): string {
  return html.replace(
    /(?<!<img[^>]*src=["'])(?<!<a[^>]*href=["'])(?<!["'])(https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?[^\s<>"]*)?)/gi,
    '<img src="$1" alt="image" loading="lazy" />'
  );
}

/**
 * 벨로그 스타일 콘텐츠 정리
 */
export function cleanVelogContent(content: string): string {
  if (!content) return '';
  
  let cleaned = content;
  
  cleaned = cleaned.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'text';
    return `<pre data-shiki-lang="${language}"><code>${escapeHtml(code.trim())}</code></pre>`;
  });
  
  cleaned = cleaned.replace(/`([^`]+)`/g, '<code>$1</code>');
  cleaned = cleaned.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  cleaned = cleaned.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  cleaned = cleaned.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  cleaned = cleaned.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  cleaned = cleaned.replace(/\n\n/g, '</p><p>');
  cleaned = cleaned.replace(/\n/g, '<br />');
  
  if (!cleaned.startsWith('<')) {
    cleaned = `<p>${cleaned}</p>`;
  }
  
  return cleaned;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
