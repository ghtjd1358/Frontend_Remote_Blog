// Remote2 (블로그) LNB 메뉴 구조
export interface LnbItem {
  title: string;
  link: string;
  searchStr?: string;
  subItems?: LnbItem[];
}

export const lnbItems: LnbItem[] = [
  {
    title: '포스트',
    link: '#posts',
    searchStr: '포스트,글,posts',
  },
  {
    title: '시리즈',
    link: '#series',
    searchStr: '시리즈,연재,series',
  },
  {
    title: '카테고리',
    link: '#categories',
    searchStr: '카테고리,분류,categories',
  },
];

export default lnbItems;
