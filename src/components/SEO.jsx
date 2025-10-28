// src/components/SEO.jsx
import React from "react";
import { Helmet } from "react-helmet-async";

// 사이트 공통 기본값 (필요 시 수정)
const SITE_NAME = "복현기우회 동아리 사이트";
const SITE_URL  = "https://baduk-web-sstatements-projects.vercel.app";
const DEFAULT_DESC = "경북대 복현기우회 공식 사이트 — 리그전, 토너먼트, 강의, 마일리지 상점까지!";
const DEFAULT_IMAGE = `${SITE_URL}/logo192.png`; // og 기본 이미지(있다면 배너로 교체 권장)

export default function SEO({
  title,
  description = DEFAULT_DESC,
  url = SITE_URL,
  image = DEFAULT_IMAGE,
  canonical,            // 지정 안 하면 url 사용
  keywords = [],
  noindex = false,      // 검색 제외 페이지에만 true로
  jsonLd = null,        // JSON-LD 스키마 객체 넣기
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = canonical || url;

  return (
    <Helmet prioritizeSeoTags>
      {/* 기본 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD 구조화 데이터 */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
