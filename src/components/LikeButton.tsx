import React, { useState, useEffect, useCallback, useRef } from "react";
import { toggleLike, checkLiked } from "../network";
import { getCurrentUser, useToast } from "@sonhoseong/mfa-lib";
import debounce from "lodash/debounce";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  onLikeChange?: (liked: boolean, count: number) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikeCount,
  onLikeChange,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [animating, setAnimating] = useState(false);
  const isProcessingRef = useRef(false);
  const currentUser = getCurrentUser();
  const toast = useToast();

  useEffect(() => {
    const checkUserLiked = async () => {
      if (!currentUser?.id) return;

      const result = await checkLiked(postId, currentUser.id);
      if (result.success && result.data !== undefined) {
        setLiked(result.data);
      }
    };

    checkUserLiked();
  }, [postId, currentUser?.id]);

  const performLikeToggle = useCallback(
    async (prevLiked: boolean, prevCount: number) => {
      if (!currentUser?.id) return;

      try {
        const result = await toggleLike(postId, currentUser.id);
        if (result.success && result.data) {
          setLiked(result.data.liked);
          setLikeCount(result.data.likeCount);
          onLikeChange?.(result.data.liked, result.data.likeCount);
        } else {
          console.error("Like toggle failed:", result.error);
          setLiked(prevLiked);
          setLikeCount(prevCount);
        }
      } catch (err) {
        console.error("Like error:", err);
        setLiked(prevLiked);
        setLikeCount(prevCount);
      } finally {
        isProcessingRef.current = false;
      }
    },
    [postId, currentUser?.id, onLikeChange]
  );

  const debouncedToggle = useCallback(
    debounce((prevLiked: boolean, prevCount: number) => {
      performLikeToggle(prevLiked, prevCount);
    }, 300),
    [performLikeToggle]
  );

  const handleLike = () => {
    if (!currentUser?.id) {
      toast.info("좋아요를 누르려면 로그인이 필요합니다.");
      return;
    }

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const prevLiked = liked;
    const prevCount = likeCount;
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;

    setLiked(newLiked);
    setLikeCount(newCount);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    debouncedToggle(prevLiked, prevCount);
  };

  return (
    <button
      className={"like-button " + (liked ? "liked " : "") + (animating ? "animating" : "")}
      onClick={handleLike}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
    >
      <span className="like-icon">
        {liked ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="24"
            height="24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )}
      </span>
      <span className="like-count">{likeCount}</span>
    </button>
  );
};

export { LikeButton };
