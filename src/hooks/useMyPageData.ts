import { useState, useEffect, useCallback } from 'react';
import {
  getProfile,
  getUserStats,
  ProfileDetail,
  UserStats,
  getPosts,
  PostSummary,
  getSeries,
  SeriesDetail
} from '@/network';

interface MyPageData {
  profile: ProfileDetail | null;
  posts: PostSummary[];
  series: SeriesDetail[];
  stats: UserStats | null;
  isLoading: boolean;
  refetch: () => void;
}

export const useMyPageData = (userId: string | undefined): MyPageData => {
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [series, setSeries] = useState<SeriesDetail[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      setError('사용자 ID가 없습니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    Promise.all([
      getProfile(userId),
      getPosts({ userId, limit: 50 }),
      getSeries(userId),
      getUserStats(userId),
    ])
      .then(([profileRes, postsRes, seriesRes, statsRes]) => {
        if (profileRes.success) setProfile(profileRes.data || null);
        if (postsRes.success && postsRes.data) setPosts(postsRes.data.data);
        if (seriesRes.success) setSeries(seriesRes.data || []);
        if (statsRes.success) setStats(statsRes.data || null);

        if (!profileRes.success) {
          setError(profileRes.error || '프로필을 불러올 수 없습니다.');
        }
      })
      .catch(() => setError('데이터 로딩 중 오류가 발생했습니다.'))
      .finally(() => setIsLoading(false));
  }, [userId, refreshKey]);

  // 에러가 있으면 throw → ErrorBoundary가 처리
  if (error) {
    throw new Error(error);
  }

  return { profile, posts, series, stats, isLoading, refetch };
};
