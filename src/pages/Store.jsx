import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { getDoc, doc, updateDoc, increment } from 'firebase/firestore';
import "./store.css";
import BatongiLoader from "../components/Loader/BatongiLoader";
/* ===== 데이터(기존 유지) ===== */
const titles = [
  "초고수","명인 (名人)","대가 (大家)","국수 (國手)","신의 한 수",
  "입신","바둑 마스터","대마 불사","반상을 지배하는자","불멸의 전략가","바둑 신","임경호의 제자","임경호의 호적수",
  "천하제일사수","바둑의 대성인","무적의 바둑왕","흑백의 마법사","수읽기의 달인",
  "전장의 지휘관","끝판왕","바둑의 현자","철벽 방어자","사활의 달인",
  "계산기천재","반상계의 영웅","전략의 귀재","불패의 신기","신수(神手)",
  "착점의 달인","승리의 화신","바둑의 사도","명경지수","대국의 천재"
];

const colors = [ /* (기존 배열 그대로) */ 
  "#FF5F6D","#FFC371","#24C6DC","#514A9D","#FF512F","#DD2476","#8A2387","#00F260","#0575E6","#7F00FF","#E100FF",
  "linear-gradient(to right, #FF5F6D, #FFC371)",
  "linear-gradient(to right, #24C6DC, #514A9D)",
  "linear-gradient(135deg, #667eea, #764ba2)",
  "radial-gradient(circle, #ff9a9e, #fad0c4)",
  "rgba(255, 95, 109, 0.7)",
  "linear-gradient(to right, rgba(255, 95, 109, 0.8), rgba(255, 195, 113, 0.8))",
  "linear-gradient(90deg, #ff6a00 0%, #ee0979 50%, #ff6a00 100%)",
  "rgba(5, 117, 230, 0.6)",
  "linear-gradient(to right, #141E30, #243B55)",
  "linear-gradient(45deg, #00FF00, #00B300)",
  "linear-gradient(to right, #a1c4fd, #c2e9fb)",
  "rgba(128, 0, 128, 0.8)",
  "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
  "linear-gradient(to right, #ff9966, #ff5e62)",
  "linear-gradient(to right, #f953c6, #b91d73)",
  "linear-gradient(to right, #d4fc79, #96e6a1)",
  "linear-gradient(to right, #000000, #434343)",
  "linear-gradient(120deg, #89f7fe, #66a6ff)",
  "linear-gradient(to right, #f6d365, #fda085)",
  "linear-gradient(to right, #bdc3c7, #2c3e50)",
  "rgba(0, 255, 255, 0.7)",
  "linear-gradient(to right, #1D976C, #93F9B9)",
  "linear-gradient(to right, #83a4d4, #b6fbff)",
  "linear-gradient(135deg, #1f1c2c, #928dab)",
  "linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)",
  "linear-gradient(to right, #74ebd5, #ACB6E5)",
  "linear-gradient(to right, #fc466b, #3f5efb)",
  "linear-gradient(120deg, #2c3e50, #4ca1af)",
  "linear-gradient(to right, #c2e9fb, #a1c4fd, #d4fc79)",
  "linear-gradient(to right, #232526, #414345)",
  "linear-gradient(135deg, #00c6ff, #0072ff)",
  "linear-gradient(to right, #1e130c, #9a8478)",
  "linear-gradient(to right, #fdfbfb, #ebedee, #a1ffce)",
  "linear-gradient(90deg, #000000, #434343, #ffffff)",
  "linear-gradient(to right, #fdfcfb, #e2d1c3)",
  "linear-gradient(to right, #00c9ff, #92fe9d)",
  "linear-gradient(135deg, #f6ff00, #00ff87, #ff00f7)",
  "linear-gradient(135deg, #e0eafc, #cfdef3)",
];

const borders = [ /* (기존 배열 그대로) */ 
  { id:"default_border", name:"⚫ 기본 테두리", description:"검은색 실선 테두리 (무료/기본)", style:{ border:"2px solid black" }, cost:0 },
  { id:"gold_border", name:"🌕 금빛 테두리", description:"황금색 고급 테두리", style:{ border:"3px solid gold" }, cost:200 },
  { id:"shining_border", name:"✨ 빛나는 테두리", style:{ boxShadow:"0 0 10px 4px rgba(0,255,255,.6)" }, description:"빛나는 청록색 그림자", cost:300 },
  { id:"rainbow_border", name:"🌈 무지개 테두리", style:{ background:"linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)", borderRadius:"8px" }, description:"그라데이션 무지개 테두리", cost:500 },
  { id:"dotted_border", name:"🎲 점선 테두리", style:{ border:"2px dashed #555" }, description:"스타일리시한 회색 점선", cost:150 },
  { id:"ice_border", name:"🧊 아이스 테두리", style:{ border:"2px solid #4fd1c5", boxShadow:"0 0 8px #81e6d9" }, description:"푸른빛 입체 효과", cost:250 },
  { id:"fire_border", name:"🔥 불꽃 테두리", style:{ background:"linear-gradient(45deg, red, orange)", borderRadius:"8px" }, description:"빨강+주황 불꽃 테마", cost:500 },
  { id:"shadow_border", name:"🖤 그림자 테두리", style:{ border:"2px solid #333", boxShadow:"0 2px 10px rgba(0,0,0,.3)" }, description:"어두운 테두리 + 강한 그림자", cost:200 },
  { id:"neon_border", name:"🌟 네온 테두리", style:{ border:"2px solid #0ff", boxShadow:"0 0 8px #0ff, 0 0 20px #0ff, 0 0 40px #0ff", borderRadius:"10px" }, description:"형광빛 네온사인 느낌의 반짝이는 테두리", cost:400 },
  { id:"double_stripe_border", name:"〰️ 더블 스트라이프 테두리", style:{ border:"4px double #ff6f61", borderRadius:"6px" }, description:"얇은 두 줄 선으로 된 세련된 테두리", cost:250 },
  { id:"glitch_border", name:"🎮 글리치 테두리", style:{ border:"2px solid #ff005a", boxShadow:"2px 0 #00fff7, -2px 0 #ff005a", borderRadius:"6px", animation:"glitch 1s infinite" }, description:"레트로 게임 글리치 효과가 가미된 테두리", cost:600 },
  { id:"dotted_glow_border", name:"✨ 점선 + 빛나는 테두리", style:{ border:"2px dotted #a78bfa", boxShadow:"0 0 12px 2px #a78bfa88", borderRadius:"8px" }, description:"작은 점선과 은은한 빛 효과가 어우러진 테두리", cost:350 },
  { id:"engraved_border", name:"🪓 조각된 돌 테두리", style:{ border:"3px solid #888", boxShadow:"inset 0 0 5px #444", borderRadius:"12px" }, description:"돌에 새겨진 듯한 음각 느낌의 테두리", cost:450 },
  { id:"gold_fleck_border", name:"🌟 금가루 테두리", style:{ border:"2px solid #b8860b", backgroundImage:"radial-gradient(circle at 20% 20%, #ffd700 10%, transparent 11%), radial-gradient(circle at 80% 80%, #ffec8b 10%, transparent 11%)", backgroundRepeat:"no-repeat", borderRadius:"10px", boxShadow:"0 0 8px #b8860b88" }, description:"금가루가 반짝이는 듯한 불규칙 테두리", cost:550 },
  { id:"pixelated_border", name:"🟦 픽셀 아트 테두리", style:{ border:"4px solid transparent", boxShadow:"0 0 0 2px #00f, 4px 4px 0 2px #00f, 8px 8px 0 2px #00f", borderRadius:"4px" }, description:"복고풍 8비트 픽셀 스타일 테두리", cost:500 },
  { id:"galaxy_border", name:"🌌 은하계 테두리", description:"멋진 은하계 느낌의 반짝임과 그라데이션", style:{ borderRadius:"12px", border:"3px solid transparent", backgroundImage:`linear-gradient(white, white), radial-gradient(circle at top left, #7f00ff, #e100ff, #00ffff)`, backgroundOrigin:"border-box", backgroundClip:"content-box, border-box", boxShadow:`0 0 10px 2px #7f00ff, 0 0 20px 4px #e100ff, 0 0 30px 6px #00ffff`, position:"relative", animation:"galaxyGlow 4s linear infinite" }, cost:700 },
  { id:"hologram_border", name:"🪩 홀로그램 테두리", description:"빛에 따라 색이 변하는 오로라 느낌의 테두리", style:{ border:"2px solid transparent", borderRadius:"12px", backgroundImage:"linear-gradient(135deg, #ff9a9e, #fad0c4, #fad0c4, #a18cd1, #fbc2eb)", backgroundClip:"padding-box", boxShadow:"0 0 12px rgba(255, 255, 255, 0.5)", animation:"hologramShift 6s infinite linear" }, cost:600 },
  { id:"cyberpunk_border", name:"🕶️ 사이버펑크 테두리", description:"디지털 세계에서 튀어나온 듯한 강렬한 컬러 조합", style:{ border:"2px solid #ff005a", boxShadow:"0 0 10px #0ff, inset 0 0 5px #ff005a", borderRadius:"10px", backgroundColor:"#111", color:"#0ff", animation:"neonPulse 2s infinite ease-in-out" }, cost:650 },
  { id:"kuromi_border", name:"💜 쿠로미 테두리", description:"보라색과 검정색의 귀여운 반항 스타일", style:{ border:"2px dashed #6b21a8", boxShadow:"0 0 10px #9333ea", borderRadius:"14px", backgroundColor:"#1f1b24", color:"#f3e8ff" }, cost:400 },
  { id:"cozy_border", name:"☕ 코지 무드 테두리", description:"따뜻한 브라운톤과 크림 배경으로 아늑한 분위기", style:{ border:"3px solid #d2b48c", backgroundColor:"#fdf6ec", borderRadius:"10px", boxShadow:"0 0 8px #cbbeb5" }, cost:300 },
  { id:"ai_border", name:"🤖 AI 테두리", description:"디지털 신세계, ChatGPT 스타일의 프리즘 테두리", style:{ border:"2px solid #10a37f", borderRadius:"10px", boxShadow:"0 0 6px #10a37f88, 0 0 12px #7de2d1", background:"linear-gradient(135deg, #0f766e, #14b8a6, #67e8f9)", color:"#fff" }, cost:550 },
];

const Store = () => {
  const [items, setItems] = useState([]);
  const [mileage, setMileage] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedBorder, setSelectedBorder] = useState(null);

  const [isChoosingTitle, setIsChoosingTitle] = useState(false);
  const [isChoosingColor, setIsChoosingColor] = useState(false);
  const [isChoosingBorder, setIsChoosingBorder] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchStoreAndUserData = async () => {
      if (!user) return;
      try {
        setItems([
          { id:"title_choice", name:"바둑 칭호 선택권", description:"희귀 칭호 중에서 원하는 칭호를 골라서 사용할 수 있습니다.", cost:500, type:"titleChoice" },
          { id:"color_change", name:"닉네임 컬러 변경권", description:"닉네임 색상을 다양한 그라데이션 및 단색으로 변경할 수 있습니다. (한 달 지속)", cost:300, type:"colorChange" },
          { id:"border_change", name:"테두리 변경권", description:"다양한 테두리 스타일 중에서 원하는 테두리를 골라서 사용할 수 있습니다.", cost:200, type:"borderChange" },
        ]);

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setMileage(data.mileage || 0);
          setUserName(data.name || "알 수 없음");
        } else {
          console.error('사용자 데이터가 없습니다.');
        }
      } catch (e) {
        console.error('데이터 불러오기 오류:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreAndUserData();
  }, [user]);

  const handlePurchase = (item) => {
    if (!user || mileage === null) return;
    if (mileage < item.cost) { alert('마일리지가 부족합니다.'); return; }
    if (item.type === "titleChoice") { setIsChoosingTitle(true); setIsChoosingColor(false); setIsChoosingBorder(false); return; }
    if (item.type === "colorChange") { setIsChoosingColor(true); setIsChoosingTitle(false); setIsChoosingBorder(false); return; }
    if (item.type === "borderChange"){ setIsChoosingBorder(true); setIsChoosingTitle(false); setIsChoosingColor(false); return; }
  };

  const confirmTitleChoice = async () => {
    if (!selectedTitle) { alert('칭호를 선택해주세요.'); return; }
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { mileage: increment(-500), chosenTitle: selectedTitle });
      setMileage(prev => prev - 500);
      alert(`'${selectedTitle}' 칭호를 선택했습니다!`);
      setIsChoosingTitle(false); setSelectedTitle(null);
    } catch (e) { console.error('칭호 선택 오류:', e); alert('오류가 발생했습니다.'); }
  };

  const confirmColorChoice = async () => {
    if (!selectedColor) { alert('색상을 선택해주세요.'); return; }
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { mileage: increment(-300), nameColor: selectedColor });
      setMileage(prev => prev - 300);
      alert('닉네임 색상이 변경되었습니다!');
      setIsChoosingColor(false); setSelectedColor(null);
    } catch (e) { console.error('색상 변경 오류:', e); alert('오류가 발생했습니다.'); }
  };

  const confirmBorderChoice = async () => {
    if (!selectedBorder) { alert('테두리를 선택해주세요.'); return; }
    try {
      const userRef = doc(db, 'users', user.uid);
      const borderCost = borders.find(b => b.id === selectedBorder)?.cost || 0;
      if (borderCost > mileage) { alert('마일리지가 부족합니다.'); return; }
      await updateDoc(userRef, { mileage: increment(-borderCost), borderStyle: selectedBorder });
      setMileage(prev => prev - borderCost);
      alert(`'${borders.find(b => b.id === selectedBorder)?.name}' 테두리를 선택했습니다!`);
      setIsChoosingBorder(false); setSelectedBorder(null);
    } catch (e) { console.error('테두리 선택 오류:', e); alert('오류가 발생했습니다.'); }
  };

  if (loading) return <BatongiLoader fullscreen text="상점 불러오는 중..." />;
  if (!user) return <p className="text-center text-red-500">로그인이 필요합니다.</p>;

  return (
    <div className="store-wrap" role="region" aria-label="마일리지 상점">
      {/* 헤더 */}
      <div className="store-header" style={{ marginBottom: 14 }}>
        <h1 className="store-title">
          🎁 마일리지 상점
          <span className="store-badge">NEW</span>
        </h1>
        <div className="store-stats" aria-live="polite">
          💰 {userName}님의 마일리지: <strong>{mileage}점</strong>
        </div>
      </div>

      {/* 선택 패널: 칭호 */}
      {isChoosingTitle && (
        <div className="selector-panel" aria-live="polite">
          <div className="selector-title">원하는 칭호를 선택하세요</div>
          {/* 미리보기 */}
          <div className="preview-box" aria-hidden={!selectedTitle}>
            <span>미리보기:</span>
            <span style={{ fontWeight: 900, color: '#facc15' }}>{selectedTitle || '—'}</span>
          </div>
          <div className="selector-grid" role="listbox" aria-label="칭호 목록">
            {titles.map((title) => {
              const isSelected = selectedTitle === title;
              return (
                <button
                  key={title}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`token ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedTitle(title)}
                >
                  {title}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <button onClick={confirmTitleChoice} className="sparkle-button">선택 완료</button>
            <button onClick={() => { setIsChoosingTitle(false); setSelectedTitle(null); }} className="token">취소</button>
          </div>
        </div>
      )}

      {/* 선택 패널: 닉네임 색상 */}
      {isChoosingColor && (
        <div className="selector-panel" aria-live="polite">
          <div className="selector-title">닉네임 색상을 선택하세요</div>
          {/* 미리보기 */}
          <div className="preview-box">
            <span>미리보기:</span>
            <span style={{
              fontWeight: 900,
              padding: '4px 8px',
              borderRadius: 8,
              background: selectedColor || 'linear-gradient(90deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              color: selectedColor?.startsWith('linear-gradient') ? 'transparent' : '#fff',
              textShadow: selectedColor?.startsWith('#') ? '0 2px 10px rgba(0,0,0,.25)' : 'none'
            }}>
              {userName}
            </span>
          </div>
          <div className="selector-grid colors" role="listbox" aria-label="색상 선택">
            {colors.map((color, idx) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={idx}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`swatch ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(color)}
                  title={typeof color === 'string' ? color : 'gradient'}
                  style={{ background: color }}
                />
              );
            })}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <button onClick={confirmColorChoice} className="sparkle-button">선택 완료</button>
            <button onClick={() => { setIsChoosingColor(false); setSelectedColor(null); }} className="token">취소</button>
          </div>
        </div>
      )}

      {/* 선택 패널: 테두리 */}
      {isChoosingBorder && (
        <div className="selector-panel" aria-live="polite">
          <div className="selector-title">테두리를 선택하세요</div>
          {/* 미리보기 */}
          <div className="preview-box" style={{ height: 64 }}>
            <div style={{
              width: 140, height: 40, display:'flex', alignItems:'center', justifyContent:'center',
              ...(selectedBorder ? (borders.find(b=>b.id===selectedBorder)?.style || {}) : { border:'2px dashed #94a3b8', borderRadius:10, color:'#94a3b8' })
            }}>
              {selectedBorder ? borders.find(b=>b.id===selectedBorder)?.name : '미리보기'}
            </div>
          </div>
          <div className="selector-grid" role="listbox" aria-label="테두리 목록">
            {borders.map((border) => {
              const isSelected = selectedBorder === border.id;
              return (
                <button
                  key={border.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`token ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedBorder(border.id)}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}
                >
                  <div style={{ width: 90, height: 54, ...border.style }} />
                  <span>{border.name}</span>
                  <small style={{ color:'#64748b' }}>{border.description}</small>
                  <small style={{ fontWeight: 800 }}>{border.cost === 0 ? '무료' : `${border.cost}점`}</small>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <button onClick={confirmBorderChoice} className="sparkle-button">선택 완료</button>
            <button onClick={() => { setIsChoosingBorder(false); setSelectedBorder(null); }} className="token">취소</button>
          </div>
        </div>
      )}

      {/* 기본 상품 목록 */}
      <div className="store-grid">
        {items.map((item, index) => (
          <div key={item.id} className="product-card" role="region" aria-label={item.name}>
            {index >= 1 && <div className="new-badge">NEW</div>}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8 }}>
              <h2 className="product-title">{item.name}</h2>
              <span className="price-chip">{item.cost > 0 ? `${item.cost}점` : '무료'}</span>
            </div>
            <p className="product-desc">{item.description}</p>
            <button
              onClick={() => handlePurchase(item)}
              className="sparkle-button"
              aria-label={`구매하기: ${item.name}`}
            >
              구매하기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;
