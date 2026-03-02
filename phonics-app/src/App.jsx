import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Play, Eraser, AlertCircle, ImageIcon, HelpCircle, Lightbulb } from 'lucide-react';

const App = () => {
  const [selectedSounds, setSelectedSounds] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadError, setLoadError] = useState(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [isTricky, setIsTricky] = useState(false);
  const [noVowel, setNoVowel] = useState(false);
  const synth = useRef(window.speechSynthesis);

  // GitHub 基礎路徑
  const GITHUB_BASE_URL = "https://raw.githubusercontent.com/katrinawehk-byte/Jolly-1-sound-bank/main/";
  const LOGO_URL = `${GITHUB_BASE_URL}LOGO_WEHK.png`;

  // 指定品牌配色
  const BRAND_BLUE = "#005baf";
  const BRAND_RED = "#e4021d";
  const BRAND_ORANGE = "#f59e0b"; // 橙黃色
  const BRAND_GREEN = "#10b981";  // 綠色

  // Jolly Phonics Tricky Words 清單
  const TRICKY_WORDS = [
    'the', 'he', 'she', 'me', 'we', 'be', 'was', 'to', 'do', 'are', 'all', 
    'you', 'your', 'come', 'some', 'said', 'here', 'there', 'they', 'go', 
    'no', 'so', 'my', 'one', 'by', 'only', 'old', 'like', 'have', 'live', 
    'give', 'little', 'down', 'what', 'when', 'why', 'where', 'who', 'which',
    'any', 'many', 'more', 'before', 'other', 'were', 'because', 'want', 'saw',
    'put', 'could', 'should', 'would', 'right', 'two', 'four', 'goes', 'does',
    'made', 'their', 'once', 'upon', 'always', 'also', 'of', 'eight', 'love',
    'after', 'every', 'father', 'mother'
  ];

  const audioFiles = {
    's': 's.mp3', 'a': 'a.mp3', 't': 't.mp3', 'i': 'i.mp3',
    'p': 'p.mp3', 'n': 'n.mp3', 'c': 'c.mp3', 'k': 'k.mp3',
    'e': 'e.mp3', 'h': 'h.mp3', 'r': 'r.mp3', 'm': 'm.mp3',
    'd': 'd.mp3', 'g': 'g.mp3', 'o': 'o.mp3', 'u': 'u.mp3',
    'l': 'l.mp3', 'f': 'f.mp3', 'b': 'b.mp3', 'j': 'j.mp3'
  };

  const alphabet = [
    { char: 's', type: 'consonant' }, { char: 'a', type: 'vowel' }, { char: 't', type: 'consonant' },
    { char: 'i', type: 'vowel' }, { char: 'p', type: 'consonant' }, { char: 'n', type: 'consonant' },
    { char: 'c', type: 'consonant' }, { char: 'k', type: 'consonant' }, { char: 'e', type: 'vowel' },
    { char: 'h', type: 'consonant' }, { char: 'r', type: 'consonant' }, { char: 'm', type: 'consonant' },
    { char: 'd', type: 'consonant' }, { char: 'g', type: 'consonant' }, { char: 'o', type: 'vowel' },
    { char: 'u', type: 'vowel' }, { char: 'l', type: 'consonant' }, { char: 'f', type: 'consonant' },
    { char: 'b', type: 'consonant' }, { char: 'j', type: 'consonant' }
  ];

  // 狀態偵測：檢查 Tricky Word 與 母音存在性
  useEffect(() => {
    const currentWord = selectedSounds.map(s => s.char).join('').toLowerCase();
    
    // 檢查 Tricky Word
    setIsTricky(TRICKY_WORDS.includes(currentWord));
    
    // 檢查是否有母音：只有在輸入 2 個字母或以上時才檢查
    if (selectedSounds.length >= 2) {
      const hasVowel = selectedSounds.some(s => s.type === 'vowel');
      setNoVowel(!hasVowel);
    } else {
      setNoVowel(false);
    }
  }, [selectedSounds]);

  const playAudio = (char, index = -1) => {
    const url = `${GITHUB_BASE_URL}${audioFiles[char]}`;
    const audio = new Audio();
    audio.src = url;
    
    setIsSpeaking(true);
    if (index !== -1) setActiveIndex(index);
    setLoadError(null);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        setLoadError(`找不到音檔: ${char}.mp3`);
        setIsSpeaking(false);
        setActiveIndex(-1);
      });

      audio.onended = () => {
        setIsSpeaking(false);
        setActiveIndex(-1);
      };
    }
  };

  const speakFullWord = () => {
    // 如果沒有母音，則不執行拼讀邏輯
    if (!synth.current || selectedSounds.length === 0 || noVowel) return;
    
    const fullWord = selectedSounds.map(s => s.char).join('');
    synth.current.cancel();
    const utterance = new SpeechSynthesisUtterance(fullWord);
    const voices = synth.current.getVoices();
    const britishVoice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Female')) || voices.find(v => v.lang === 'en-GB');
    if (britishVoice) utterance.voice = britishVoice;
    utterance.lang = 'en-GB';
    utterance.rate = 0.55; 
    synth.current.speak(utterance);
  };

  const addSound = (sound) => {
    const newSounds = [...selectedSounds, sound];
    setSelectedSounds(newSounds);
    playAudio(sound.char, newSounds.length - 1);
  };

  useEffect(() => {
    const loadVoices = () => synth.current.getVoices();
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-slate-800" style={{ backgroundColor: '#fff5f5' }}>
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border-4" style={{ borderColor: '#fed7d7' }}>
        
        {/* 標題欄 */}
        <div className="bg-white p-6 flex flex-col md:flex-row justify-between items-center border-b-4 gap-6" style={{ borderBottomColor: '#fff5f5' }}>
          <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
            <div className="flex-shrink-0 relative">
              <img 
                src={LOGO_URL} 
                alt="Williams Kingdom Logo" 
                className={`h-20 md:h-24 w-auto object-contain transition-all duration-500 ${logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onLoad={() => setLogoLoaded(true)}
                onError={(e) => { 
                  e.target.style.display = 'none';
                  setLogoLoaded(false);
                }}
              />
              {!logoLoaded && (
                <div className="h-20 w-48 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border-2 border-dashed" style={{ borderColor: '#feb2b2' }}>
                  <div className="text-center p-2">
                    <ImageIcon className="mx-auto mb-1 opacity-50" size={20} />
                    <span className="text-[9px] font-bold block leading-tight tracking-wider" style={{ color: BRAND_BLUE }}>載入中...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block w-1 h-12 rounded-full" style={{ backgroundColor: '#feb2b2' }}></div>
            
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-black tracking-tight leading-tight" style={{ color: BRAND_BLUE }}>
                威廉 Phonics 小助手
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: BRAND_RED }}>
                Williams Kingdom Phonics Tool
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold shadow-inner bg-slate-50 text-slate-500 border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              雲端真人音檔模式
            </div>
            {loadError && (
              <span className="text-[10px] bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1 font-bold" style={{ color: BRAND_RED }}>
                <AlertCircle size={10} /> {loadError}
              </span>
            )}
          </div>
        </div>

        {/* 拼字顯示區域 */}
        <div className="p-10 bg-gradient-to-b from-white to-red-50/30 min-h-[300px] flex flex-col items-center justify-center relative text-center">
          
          {/* Tricky Word 提示與解說 */}
          <div className={`mb-4 flex flex-col items-center transition-all duration-500 ${isTricky ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none absolute'}`}>
            <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-700 font-black animate-bounce shadow-md">
              <HelpCircle size={20} fill="#f59e0b" color="white" />
              Tricky Word!
            </div>
            <div className="mt-4 max-w-xl bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-sm">
                <p className="text-xs leading-relaxed text-amber-900 font-medium text-left">
                    <span className="font-bold">Tricky words（搗蛋字/易混淆詞）</span>是指在英語字母拼讀（Phonics）學習中，無法直接按照常規發音規則拼讀或拼寫的常用字。這些單字通常含有不規則發音、特殊拼寫或靜音字母，初學者需透過整體視覺記憶（Sight words）而非拼音來掌握。
                </p>
            </div>
          </div>

          {/* 無母音提示 */}
          <div className={`mb-4 flex flex-col items-center transition-all duration-500 ${(!isTricky && noVowel) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none absolute'}`}>
            <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-100 border-2 border-blue-400 text-blue-700 font-black shadow-md">
              <Lightbulb size={20} fill="#005baf" color="white" />
              缺少母音！(Missing Vowel!)
            </div>
            <div className="mt-3 max-w-md bg-blue-50/80 p-3 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-800 font-medium">
                英語單字通常需要母音 (a, e, i, o, u) 才能發音喔！暫時無法進行拼讀練習。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            {selectedSounds.length === 0 ? (
              <div className="text-slate-300 select-none py-10">
                <div className="text-6xl mb-4 opacity-40">🇬🇧</div>
                <p className="text-xl font-black text-slate-400">點選下方字母組合單字</p>
                <p className="text-sm mt-1 opacity-60">聽取真人發音</p>
              </div>
            ) : (
              selectedSounds.map((s, index) => (
                <div 
                  key={index}
                  className={`w-24 h-28 flex items-center justify-center text-6xl font-black rounded-3xl shadow-xl border-b-[12px] transform transition-all duration-300 cursor-pointer select-none
                    ${index === activeIndex ? 'scale-110 -translate-y-6 ring-8 z-10' : 'scale-100'}`}
                  style={{ 
                    backgroundColor: s.type === 'vowel' ? '#fff5f5' : '#f0f7ff',
                    color: s.type === 'vowel' ? BRAND_RED : BRAND_BLUE,
                    borderColor: s.type === 'vowel' ? BRAND_RED : BRAND_BLUE,
                    boxShadow: index === activeIndex ? `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 8px ${s.type === 'vowel' ? '#fed7d7' : '#dbeafe'}` : ''
                  }}
                  onClick={() => playAudio(s.char, index)}
                >
                  {s.char}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 控制按鈕區 */}
        <div className="flex flex-wrap justify-center gap-4 p-8 bg-white border-t-2" style={{ borderTopColor: '#fff5f5' }}>
          <button 
            onClick={speakFullWord}
            // 當沒有母音 (noVowel) 或 正在發音 或 沒有字母時，禁用按鈕
            disabled={selectedSounds.length === 0 || isSpeaking || noVowel}
            className="group flex items-center gap-4 px-10 py-6 text-white rounded-3xl font-black transition-all active:translate-y-2 active:shadow-none text-2xl md:text-3xl disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: noVowel ? '#e2e8f0' : BRAND_ORANGE,
              color: noVowel ? '#94a3b8' : '#ffffff',
              boxShadow: (selectedSounds.length > 0 && !noVowel) ? '0 10px 0 0 #b45309' : 'none'
            }}
          >
            <Play size={36} fill={noVowel ? "#94a3b8" : "white"} />
            拼讀！Let's Blend！
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setSelectedSounds(selectedSounds.slice(0, -1))} 
              className="p-6 text-white rounded-3xl transition-all active:translate-y-1 active:shadow-none"
              style={{ 
                backgroundColor: BRAND_GREEN,
                boxShadow: '0 8px 0 0 #047857'
              }}
              title="退格"
            >
              <Trash2 size={32} />
            </button>
            
            <button 
              onClick={() => setSelectedSounds([])} 
              className="p-6 bg-slate-400 text-white rounded-3xl shadow-[0_8px_0_0_#334155] hover:bg-slate-500 transition-all active:translate-y-1 active:shadow-none"
              title="清除"
            >
              <Eraser size={32} />
            </button>
          </div>
        </div>

        {/* 字母網格 */}
        <div className="p-8" style={{ backgroundColor: '#fffcfc' }}>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-5">
            {alphabet.map(a => (
              <button
                key={a.char}
                onClick={() => addSound(a)}
                className="aspect-square flex items-center justify-center text-4xl font-black text-white rounded-3xl transform transition-all hover:-translate-y-2 active:translate-y-1 active:shadow-none"
                style={{ 
                  backgroundColor: a.type === 'vowel' ? BRAND_RED : BRAND_BLUE,
                  boxShadow: `0 10px 0 0 ${a.type === 'vowel' ? '#991b1b' : '#0a3d6d'}`
                }}
              >
                {a.char}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white text-center border-t" style={{ borderTopColor: '#fed7d7' }}>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
            © Williams Kingdom English Classroom - Phonics Assistant v3.4
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
