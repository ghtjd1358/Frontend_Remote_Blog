import { useEffect, useState } from 'react';
import {getPosts, getSeries, PostSummary, SeriesDetail} from "@/network";

interface BlogStats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  daysRunning: number;
}

interface BlogData {
  posts: PostSummary[];
  series: SeriesDetail[];
  stats: BlogStats;
  isLoading: boolean;
}

/**
 * 블로그 데이터(포스트, 시리즈, 통계)를 페칭하는 훅
 */
const useBlogData = (limit: number = 20): BlogData => {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [series, setSeries] = useState<SeriesDetail[]>([]);
  const [stats, setStats] = useState<BlogStats>({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    daysRunning: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    Promise.all([getPosts({ limit }), getSeries()])
      .then(([postsRes, seriesRes]) => {
        if (postsRes.success && postsRes.data) {
          setPosts(postsRes.data.data);
          setStats(postsRes.data.stats);
        } else {
          setError(postsRes.error || '블로그 데이터를 불러올 수 없습니다.');
        }
        if (seriesRes.success && seriesRes.data) {
          setSeries(seriesRes.data);
        }
      })
      .catch(() => setError('블로그 데이터 로딩 중 오류가 발생했습니다.'))
      .finally(() => setIsLoading(false));
  }, [limit]);

  if (error) {
    throw new Error(error);
  }

  return { posts, series, stats, isLoading };
};

export { useBlogData };
