// src/components/SEO.jsx
import { useEffect } from "react";

// 사이트 공통 설정
const SITE_NAME = "복현기우회 동아리 사이트";
const SITE_URL  = "https://baduk-web-sstatements-projects.vercel.app";
const DEFAULT_DESC = "경북대 복현기우회 공식 사이트 — 리그전, 토너먼트, 강의, 마일리지 상점까지!";
const DEFAULT_IMAGE = `${SITE_URL}/logo192.png`;

export default function SEO({
  title,
  description = DEFAULT_DESC,
  url = SITE_URL,
  image = DEFAULT_IMAGE,
  canonical,
  keywords = [],
  noindex = false,
  jsonLd = null,
}) {
  useEffect(() => {
    // 페이지 제목 설정
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    // description
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", description);

    // keywords
    let keywordTag = document.querySelector('meta[name="keywords"]');
    if (!keywordTag) {
      keywordTag = document.createElement("meta");
      keywordTag.setAttribute("name", "keywords");
      document.head.appendChild(keywordTag);
    }
    keywordTag.setAttribute("content", keywords.join(", "));

    // canonical
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute("href", canonical || url);

    // noindex
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement("meta");
      robotsTag.setAttribute("name", "robots");
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute("content", noindex ? "noindex,nofollow" : "index,follow");

    // og/meta 태그
    const setOG = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setOG("og:site_name", SITE_NAME);
    setOG("og:title", fullTitle);
    setOG("og:description", description);
    setOG("og:type", "website");
    setOG("og:url", url);
    setOG("og:image", image);

    // Twitter
    const setTwitter = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setTwitter("twitter:card", "summary_large_image");
    setTwitter("twitter:title", fullTitle);
    setTwitter("twitter:description", description);
    setTwitter("twitter:image", image);

    // JSON-LD
    if (jsonLd) {
      let scriptTag = document.getElementById("seo-jsonld");
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "seo-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, url, image, canonical, keywords, noindex, jsonLd]);

  return null;
}
