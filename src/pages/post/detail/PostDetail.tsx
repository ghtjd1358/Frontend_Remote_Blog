import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfirmModal, useToast } from '@sonhoseong/mfa-lib';
import { useDeletePost, usePostDetail } from '@/hooks';
import { CommentSection, LoadingSpinner } from '@/components';
import { PREFIX } from '@/config/constants';
import { PostHeader, PostContent, PostFooter } from './components';

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const confirmModal = useConfirmModal();
  const { post, parsedContent, isLoading } = usePostDetail(slug);
  const { deletePost } = useDeletePost({
    onSuccess: () => navigate(`${PREFIX}/`),
    onError: (err) => toast.error(err),
  });

  const handleDelete = async () => {
    if (!post) return;
    const confirmed = await confirmModal.show({
      title: '게시글 삭제',
      message: '정말로 이 게시글을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
    });
    if (confirmed) {
      await deletePost(post.id);
    }
  };

  if (isLoading || !post) {
    return <LoadingSpinner className="post-detail-loading" />;
  }

  return (
    <article className="post-detail">
      <PostHeader post={post} />
      <PostContent postId={post.id} content={parsedContent} />
      <PostFooter
        postSlug={post.slug}
        postId={post.id}
        onDelete={handleDelete}
      />
      {/* comment */}
      <div className="post-comments-wrapper">
        <div className="container">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </article>
  );
};

export default PostDetail;
