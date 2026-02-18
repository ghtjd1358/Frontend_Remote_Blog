import React from 'react';

export type TabType = 'posts' | 'series' | 'intro';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts?: {
    posts: number;
    series: number;
  };
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  counts
}) => {
  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'posts', label: '글', count: counts?.posts },
    { key: 'series', label: '시리즈', count: counts?.series },
    { key: 'intro', label: '소개' },
  ];

  return (
    <nav className="mypage-tabs">
      <div className="container">
        <div className="mypage-tabs-inner">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`mypage-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="mypage-tab-count">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export { TabNavigation };