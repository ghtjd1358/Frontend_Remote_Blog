import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCurrentUser } from '@sonhoseong/mfa-lib';
import { LoadingSpinner } from '@/components/loading';
import { useMyPageData, useScrollAnimation } from '@/hooks';
import {
  ProfileHeader,
  UserStats,
  TabNavigation,
  PostsTab,
  SeriesTab,
  IntroTab,
  ProfileEditModal,
  TabType
} from '@/components';

const MyPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const currentUser = getCurrentUser();

  // 대상 유저 결정 (파라미터 없으면 현재 로그인 유저)
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const { profile, posts, series, stats, isLoading, refetch } = useMyPageData(targetUserId);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [editModalOpen, setEditModalOpen] = useState(false);

  // 스크롤 애니메이션
  useScrollAnimation([posts.length]);

  const handleProfileSave = () => {
    refetch();
  };

  if (isLoading) {
    return <LoadingSpinner className="mypage-loading-full" />;
  }

  return (
    <div className="mypage">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setEditModalOpen(true)}
      />

      <UserStats stats={stats} />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          posts: posts.length,
          series: series.length
        }}
      />

      {activeTab === 'posts' && <PostsTab posts={posts} />}
      {activeTab === 'series' && (
        <SeriesTab
          series={series}
          isOwnProfile={isOwnProfile}
          onRefresh={refetch}
        />
      )}
      {activeTab === 'intro' && <IntroTab profile={profile} />}

      {isOwnProfile && (
        <ProfileEditModal
          isOpen={editModalOpen}
          profile={profile}
          onClose={() => setEditModalOpen(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
};

export default MyPage;