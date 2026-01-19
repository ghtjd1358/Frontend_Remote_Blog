import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostDetail, deletePost, PostDetail as PostDetailType } from '../../../network';
import TableOfContents from '../../../components/TableOfContents';
import { enhanceCodeBlocks } from '../../../utils/codeBlockEnhancer';

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        const response = await getPostDetail(slug, true);
        if (response.success && response.data) {
          setPost(response.data);
        } else {
          setError('게시글을 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Enhance code blocks with copy buttons
  useEffect(() => {
    if (post?.content) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        const cleanup = enhanceCodeBlocks('.post-content');
        return cleanup;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [post?.content]);

  const handleDelete = async () => {
    if (!post) return;

    setDeleting(true);
    try {
      const response = await deletePost(post.id);
      if (response.success) {
        navigate('/');
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="post-detail-loading">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail-error">
        <h2>오류</h2>
        <p>{error || '게시글을 찾을 수 없습니다.'}</p>
        <Link to="/" className="btn btn-primary">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <>
      <article className="post-detail">
        {/* 헤더 */}
        <header className="post-header">
          <div className="container">
            <div className="post-header-content">
              <div className="post-meta">
                <span className="post-category">{post.category?.name || '미분류'}</span>
                <span className="post-date">{formatDate(post.published_at)}</span>
              </div>
              <h1 className="post-title">{post.title}</h1>
              {post.excerpt && (
                <p className="post-excerpt">{post.excerpt}</p>
              )}
              <div className="post-stats">
                <span>👀 조회 {post.view_count}</span>
                <span>❤️ 좋아요 {post.like_count}</span>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map(tag => (
                    <span key={tag.id} className="post-tag">#{tag.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 본문 with TOC */}
        <div className="post-content-wrapper">
          <div className="post-detail-layout">
            <div className="post-detail-main">
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            </div>

            {/* Table of Contents */}
            <TableOfContents content={post.content || ''} />
          </div>
        </div>

        {/* 하단 액션 */}
        <footer className="post-footer">
          <div className="container">
            <div className="post-actions">
              <Link to="/" className="btn btn-secondary">
                ← 목록으로
              </Link>
              <div className="post-action-buttons">
                <Link to={`/edit/${post.slug || post.id}`} className="btn btn-secondary">
                  수정
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </footer>
      </article>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>게시글 삭제</h3>
            <p>정말로 이 게시글을 삭제하시겠습니까?<br/>삭제된 글은 복구할 수 없습니다.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                취소
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostDetail;
