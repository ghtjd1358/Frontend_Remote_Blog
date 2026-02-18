-- =============================================
-- 블로그 시리즈 테이블 (벨로그 스타일)
-- =============================================

-- 시리즈 테이블
CREATE TABLE IF NOT EXISTS blog_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  description TEXT,
  cover_image TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, slug)
);

-- 시리즈-포스트 연결 테이블 (M:N)
CREATE TABLE IF NOT EXISTS blog_series_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES blog_series(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(series_id, post_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_blog_series_user_id ON blog_series(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_series_slug ON blog_series(slug);
CREATE INDEX IF NOT EXISTS idx_blog_series_posts_series_id ON blog_series_posts(series_id);
CREATE INDEX IF NOT EXISTS idx_blog_series_posts_post_id ON blog_series_posts(post_id);

-- RLS (Row Level Security) 정책
ALTER TABLE blog_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_series_posts ENABLE ROW LEVEL SECURITY;

-- 시리즈: 누구나 읽기 가능, 작성자만 수정/삭제
CREATE POLICY "시리즈 공개 읽기" ON blog_series
  FOR SELECT USING (true);

CREATE POLICY "시리즈 작성자만 생성" ON blog_series
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "시리즈 작성자만 수정" ON blog_series
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "시리즈 작성자만 삭제" ON blog_series
  FOR DELETE USING (auth.uid() = user_id);

-- 시리즈-포스트: 누구나 읽기 가능, 시리즈 소유자만 수정/삭제
CREATE POLICY "시리즈 포스트 공개 읽기" ON blog_series_posts
  FOR SELECT USING (true);

CREATE POLICY "시리즈 포스트 소유자만 생성" ON blog_series_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM blog_series
      WHERE id = series_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "시리즈 포스트 소유자만 삭제" ON blog_series_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM blog_series
      WHERE id = series_id AND user_id = auth.uid()
    )
  );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_series_updated_at
  BEFORE UPDATE ON blog_series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 시리즈 포스트 수 조회 함수
CREATE OR REPLACE FUNCTION get_series_post_count(series_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM blog_series_posts WHERE series_id = series_uuid
  );
END;
$$ LANGUAGE plpgsql;
