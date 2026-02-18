import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/loading';
import { getTags, TagDetail } from '@/network';
import { ManageHeader, TagForm, TagList } from './components';

const ManagePage: React.FC = () => {
  const [tags, setTags] = useState<TagDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTags()
      .then((tagsRes) => {
        if (tagsRes.success && tagsRes.data) {
          setTags(tagsRes.data);
        }
      })
      .catch((error) => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleTagCreated = (newTag: TagDetail) => {
    setTags((prev) => [...prev, newTag]);
  };

  if (loading) {
    return <LoadingSpinner className="manage-page-loading" />;
  }

  return (
    <div className="manage-page">
      <ManageHeader />
      <div className="manage-content">
        <div className="container">
          <div className="manage-section">
            <TagForm onTagCreated={handleTagCreated} />
            <TagList tags={tags} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePage;
