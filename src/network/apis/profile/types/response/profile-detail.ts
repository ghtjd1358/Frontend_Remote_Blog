/**
 * 사용자 프로필 상세 정보
 */
export interface ProfileDetail {
  /** 사용자 ID */
  id: string;
  /** 이름 */
  name: string;
  /** 이메일 */
  email: string;
  /** 아바타 URL */
  avatar_url: string | null;
  /** 긴 소개글 */
  bio: string | null;
  /** 짧은 한줄 소개 */
  short_bio: string | null;
  /** 생성일시 */
  created_at: string;
  /** 수정일시 */
  updated_at: string;
}
