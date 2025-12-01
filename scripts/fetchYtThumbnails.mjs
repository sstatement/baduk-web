// scripts/fetchYtThumbnails.mjs
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { YOUTUBERS } from "../src/data/goYoutubers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public/yt-thumbs 경로
const outDir = path.join(__dirname, "../public/yt-thumbs");

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // already exists
  }
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) {
    throw new Error(`HTML 요청 실패: ${url} (${res.status})`);
  }
  return await res.text();
}

async function downloadImage(url, filepath) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) {
    throw new Error(`이미지 다운로드 실패: ${url} (${res.status})`);
  }
  const arrayBuffer = await res.arrayBuffer();
  await fs.writeFile(filepath, Buffer.from(arrayBuffer));
}

async function main() {
  await ensureDir(outDir);

  for (const ch of YOUTUBERS) {
    try {
      console.log(`▶ 채널 처리 중: ${ch.name} (${ch.url})`);

      const html = await fetchHtml(ch.url);
      const $ = cheerio.load(html);

      // og:image 메타 태그에서 썸네일 URL 찾기
      let imgUrl =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="og:image"]').attr("content") ||
        "";

      if (!imgUrl) {
        console.warn(`  ⚠ og:image를 찾지 못했습니다. 스킵.`);
        continue;
      }

      // 혹시나 URL에 쿼리 많으면 그냥 그대로 써도 되고,
      // 필요하면 사이즈를 고정해도 됨. (여기서는 그대로 사용)
      const extMatch = imgUrl.match(/\.(jpg|jpeg|png|webp)/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";

      const filename = `${ch.id}.${ext}`;
      const filepath = path.join(outDir, filename);

      await downloadImage(imgUrl, filepath);
      console.log(`  ✅ 저장 완료: public/yt-thumbs/${filename}`);
    } catch (err) {
      console.error(`  ❌ 실패: ${ch.name} - ${err.message}`);
    }
  }

  console.log("\n모든 채널 처리 완료.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
