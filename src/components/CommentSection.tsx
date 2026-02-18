import React, { useState, useEffect } from 'react';
import { getComments, createComment, updateComment, deleteComment, CommentDetail, CreateCommentRequest } from '@/network';
import { getCurrentUser, useToast } from '@sonhoseong/mfa-lib';

interface CommentSectionProps {
  postId: string;
}

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSubmit: () => void;
  onCancel?: () => void;
  placeholder?: string;
  onWarning: (msg: string) => void;
  onError: (msg: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentId,
  onSubmit,
  onCancel,
  placeholder = '댓글을 작성하세요...',
  onWarning,
  onError,
}) => {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const currentUser = getCurrentUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      onWarning('댓글 내용을 입력해주세요.');
      return;
    }

    if (!currentUser && !authorName.trim()) {
      onWarning('이름을 입력해주세요.');
      return;
    }

    setSubmitting(true);

    const params: CreateCommentRequest = {
      post_id: postId,
      content: content.trim(),
      parent_id: parentId || null,
      author_name: currentUser ? null : authorName.trim(),
    };

    createComment(params, currentUser?.id)
      .then((result) => {
        if (result.success) {
          setContent('');
          setAuthorName('');
          onSubmit();
        } else {
          onError(result.error || '댓글 작성에 실패했습니다.');
        }
      })
      .catch(() => onError('댓글 작성 중 오류가 발생했습니다.'))
      .finally(() => setSubmitting(false));
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      {!currentUser && (
        <input
          type="text"
          className="comment-author-input"
          placeholder="이름"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={50}
        />
      )}
      <textarea
        className="comment-textarea"
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={1000}
      />
      <div className="comment-form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            disabled={submitting}
          >
            취소
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={submitting}
        >
          {submitting ? '등록 중...' : '댓글 등록'}
        </button>
      </div>
    </form>
  );
};

interface CommentItemProps {
  comment: CommentDetail;
  postId: string;
  onRefresh: () => void;
  onWarning: (msg: string) => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onRefresh,
  onWarning,
  onError,
  onSuccess,
  depth = 0,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const currentUser = getCurrentUser();

  // 본인 댓글만 수정/삭제 가능 (게스트 댓글은 로그인 유저가 삭제 가능)
  const isOwner = currentUser?.id === comment.user_id;
  const canEdit = isOwner;
  const canDelete = currentUser && (isOwner || !comment.user_id);

  const handleDelete = () => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    setDeleting(true);
    deleteComment(comment.id)
      .then((result) => {
        if (result.success) {
          onSuccess('댓글이 삭제되었습니다.');
          onRefresh();
        } else {
          onError(result.error || '댓글 삭제에 실패했습니다.');
        }
      })
      .catch(() => onError('댓글 삭제 중 오류가 발생했습니다.'))
      .finally(() => setDeleting(false));
  };

  const handleEdit = () => {
    if (!editContent.trim()) {
      onWarning('댓글 내용을 입력해주세요.');
      return;
    }

    setUpdating(true);
    updateComment(comment.id, editContent.trim())
      .then((result) => {
        if (result.success) {
          onSuccess('댓글이 수정되었습니다.');
          setIsEditing(false);
          onRefresh();
        } else {
          onError(result.error || '댓글 수정에 실패했습니다.');
        }
      })
      .catch(() => onError('댓글 수정 중 오류가 발생했습니다.'))
      .finally(() => setUpdating(false));
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className={`comment-item ${depth > 0 ? 'comment-reply' : ''}`} style={{ marginLeft: depth * 24 }}>
      <div className="comment-header">
        <div className="comment-author">
          {comment.author?.avatar_url ? (
            <img
              src={comment.author.avatar_url}
              alt={comment.author.name}
              className="comment-avatar"
            />
          ) : (
            <div className="comment-avatar-placeholder">
              {(comment.author?.name || comment.author_name || '익명').charAt(0)}
            </div>
          )}
          <span className="comment-author-name">
            {comment.author?.name || comment.author_name || '익명'}
          </span>
        </div>
        <span className="comment-date">{formatDate(comment.created_at)}</span>
      </div>

      {isEditing ? (
        <div className="comment-edit-form">
          <textarea
            className="comment-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            maxLength={1000}
          />
          <div className="comment-form-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCancelEdit}
              disabled={updating}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleEdit}
              disabled={updating}
            >
              {updating ? '수정 중...' : '수정'}
            </button>
          </div>
        </div>
      ) : (
        <div className="comment-content">{comment.content}</div>
      )}

      <div className="comment-actions">
        {depth === 0 && !isEditing && (
          <button
            type="button"
            className="comment-action-btn"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            {showReplyForm ? '취소' : '답글'}
          </button>
        )}
        {canEdit && !isEditing && (
          <button
            type="button"
            className="comment-action-btn"
            onClick={() => setIsEditing(true)}
          >
            수정
          </button>
        )}
        {canDelete && !isEditing && (
          <button
            type="button"
            className="comment-action-btn comment-delete-btn"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="comment-reply-form">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSubmit={() => {
              setShowReplyForm(false);
              onRefresh();
            }}
            onCancel={() => setShowReplyForm(false)}
            placeholder="답글을 작성하세요..."
            onWarning={onWarning}
            onError={onError}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onRefresh={onRefresh}
              onWarning={onWarning}
              onError={onError}
              onSuccess={onSuccess}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchComments = () => {
    getComments(postId)
      .then((result) => {
        if (result.success && result.data) {
          setComments(result.data);
        }
      })
      .catch((err) => console.error('Failed to fetch comments:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const totalCount = comments.reduce((acc, comment) => {
    return acc + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <section className="comment-section">
      <div className="comment-section-header">
        <h3>
          댓글 <span className="comment-count">{totalCount}</span>
        </h3>
      </div>

      <CommentForm
        postId={postId}
        onSubmit={fetchComments}
        onWarning={toast.warning}
        onError={toast.error}
      />

      <div className="comment-list">
        {loading ? (
          <div className="comment-loading">댓글을 불러오는 중...</div>
        ) : comments.length === 0 ? (
          <div className="comment-empty">
            <p>아직 댓글이 없습니다.</p>
            <p>첫 번째 댓글을 남겨보세요!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onRefresh={fetchComments}
              onWarning={toast.warning}
              onError={toast.error}
              onSuccess={toast.success}
            />
          ))
        )}
      </div>
    </section>
  );
};

export { CommentSection };
