import React from 'react';
import { ProfileDetail } from '@/network';

interface IntroTabProps {
  profile: ProfileDetail | null;
}

const IntroTab: React.FC<IntroTabProps> = ({ profile }) => {
  return (
    <div className="mypage-content">
      <div className="container">
        <div className="mypage-intro">
          <h2>소개</h2>
          {profile?.bio ? (
            <div className="mypage-intro-content">
              {profile.bio}
            </div>
          ) : (
            <div className="mypage-empty">
              <p>소개글이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { IntroTab };