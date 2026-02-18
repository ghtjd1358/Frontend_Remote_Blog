import React from 'react';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '@/components/loading';
import { useSeriesDetail } from '@/hooks';
import { SeriesHeader, SeriesPostList } from './components';

const SeriesDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { series, isLoading } = useSeriesDetail(slug);

  if (isLoading || !series) {
    return <LoadingSpinner className="series-loading" />;
  }

  const publishedCount = series.posts.filter((p) => p.post.status === 'published').length;

  return (
    <div className="series-detail-page">
      <SeriesHeader series={series} postCount={publishedCount} />
      <SeriesPostList posts={series.posts} />
    </div>
  );
};

export default SeriesDetail;
