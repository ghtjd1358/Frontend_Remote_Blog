// Remote2 (블로그) LNB 메뉴 구조
export interface LnbItem {
  title: string;
  link: string;
  searchStr?: string;
  subItems?: LnbItem[];
}

export const lnbItems: LnbItem[] = [
  {
    title: '전체 글',
    link: '/blog',
    searchStr: '전체,모든글,all',
  },
  {
    title: '카테고리',
    link: '/blog/categories',
    searchStr: '카테고리,분류,category',
    subItems: [
      {
        title: '리액트',
        link: '/blog/category/react',
        searchStr: '리액트,react',
      },
      {
        title: 'TypeScript',
        link: '/blog/category/typescript',
        searchStr: '타입스크립트,typescript',
      },
      {
        title: '아키텍처',
        link: '/blog/category/architecture',
        searchStr: '아키텍처,설계,architecture',
      },
      {
        title: '회고',
        link: '/blog/category/retrospect',
        searchStr: '회고,retrospect',
      },
    ],
  },
  {
    title: '연재 시리즈',
    link: '/blog/series',
    searchStr: '시리즈,연재,series',
    subItems: [
      {
        title: 'MFA 아키텍처 구축기',
        link: '/blog/series/mfa',
        searchStr: 'mfa,마이크로프론트엔드',
      },
      {
        title: 'React 디자인 패턴',
        link: '/blog/series/react-patterns',
        searchStr: '패턴,디자인패턴',
      },
      {
        title: 'TypeScript 실전 가이드',
        link: '/blog/series/typescript-guide',
        searchStr: '타입스크립트,가이드',
      },
    ],
  },
];

export default lnbItems;
