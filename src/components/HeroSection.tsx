import React from 'react';
import { ScrollIndicator } from './ScrollIndicator';

const HeroSection: React.FC = () => {
  return (
    <section className="hero blog-hero">
      <div className="hero-media">
        <video
          className="hero-media-content"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
      </div>

      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Hello World!
          </h1>
          <p className="hero-desc">
            프론트엔드 개발 경험과 학습 내용을 정리합니다.
          </p>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
};

export { HeroSection };
