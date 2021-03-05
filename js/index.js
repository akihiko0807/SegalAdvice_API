const startBtn = document.getElementById("start-btn")
const cageBtn = document.getElementById("cage-btn")
const segalImg = document.getElementById("segal-img-inner")
const cageImg = document.getElementById("cage-img-inner")
const adviceText = document.getElementById("advice-text")
const jpText = document.getElementById("advice-translate-text")
const kanaText = document.getElementById("advice-hiragana-text")
const cageText = document.getElementById("reply-text-inner")
const voiceSelect = document.getElementById("voice-select")
const cageVoiceSelect = document.getElementById("cage-voice-select")
let advice;
let jpAdvice;
let que;

// セレクトタグの中身を声の名前が入ったoptionタグで埋めるための関数を定義
function appendVoices(){
  // ①使える声の配列を取得
  // 配列の中身はSpeechSynthesisVoiceオブジェクト
  let voices = speechSynthesis.getVoices()
  voiceSelect.innerHTML = ''
  voices.forEach(voice => {
    // ジョージの声以外の声は選択肢に追加しない
    if(!voice.name.match('Jorge')) return;
    const option = document.createElement('option')
    option.value = voice.name
    option.text = `${voice.name} (${voice.lang})`
    option.setAttribute('selected', voice.default)
    voiceSelect.appendChild(option)
  });
}
// ケイジ用の声をあとから追加（上の分を条件分岐などでも出来そう）
function appendVoicesForCage(){
  // ①使える声の配列を取得
  // 配列の中身はSpeechSynthesisVoiceオブジェクト
  let voices = speechSynthesis.getVoices()
  cageVoiceSelect.innerHTML = ''
  voices.forEach(voice => {
    // ジョージの声以外の声は選択肢に追加しない
    if(!voice.name.match('Google UK English Male')) return;
    const option = document.createElement('option')
    option.value = voice.name
    option.text = `${voice.name} (${voice.lang})`
    option.setAttribute('selected', voice.default)
    cageVoiceSelect.appendChild(option)
  });
}
// 発火させる
appendVoices();
appendVoicesForCage();


// ②使える声が追加された時に発火するイベントハンドラ。
// Chromeは非同期に（一個ずつ）声を読み込む仕様のためこれが必要らしい
speechSynthesis.onvoiceschanged = e => {
  appendVoices();
  appendVoicesForCage();
}

// ランダムにセガールを呼び出す関数を定義
async function callSegal(){
  let min = 300 ;
  let max = 400 ;
  let a = Math.floor( Math.random() * (max + 1 - min) ) + min ;
  let b = Math.floor( Math.random() * (max + 1 - min) ) + min ;
  segalImg.src = `https://stevensegallery.com/${a}/${b}`
}

// ランダムにアドバイスを呼び出す関数を定義。翻訳APIに回すためにPromiseを使用。
async function callAdvice(){
  const res = await fetch('https://api.adviceslip.com/advice');
  const adviceJson = await res.json();
  const adviceEn = adviceJson.slip.advice;
  console.log(adviceEn)
  $(".advice-text").html(adviceEn);
  return adviceEn;
}

// 英語のアドバイスを日本語に翻訳する関数を定義。
async function translateAdvice(){
  const adviceTextInner = adviceText.innerHTML;
  const res = await fetch(`https://script.google.com/macros/s/AKfycbzZtvOvf14TaMdRIYzocRcf3mktzGgXvlFvyczo/exec?text=${adviceTextInner}&source=en&target=ja`);
  const translatedJson = await res.json();
  let jpAdvice = translatedJson.text;
  $(".advice-translate-text").html(jpAdvice);
  return jpAdvice;
}

// 外国人音声だと漢字が発音されなかったので翻訳後の文章の漢字をひらがなに、「は」を「わ」に変える。
async function kanaTranslate(url = 'https://labs.goo.ne.jp/api/hiragana', data={
  // 上記URLよりappIDの取得が必要です ひとまず制限など特になさそうだったので削除せず自分のIDそのままになっております
  "app_id":"930968fcbf5132c85712075960c9f80b4a2a862577a86c7858221f2457a52901",
  "sentence": jpText.innerHTML,
  "output_type":"hiragana"
}){
  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  })
  const kanaJson = await res.json();
  let kanaAdvice = kanaJson.converted;
  let removePunc = kanaAdvice.replace(/は/g, 'わ');
  console.log(removePunc);
  $(".advice-hiragana-text").html(removePunc);
  return removePunc;
}

// 日本語テキスト部分の内容を読み上げる関数を定義。
async function readAdvice(){
  // 発言を作成
  const uttr = new SpeechSynthesisUtterance(kanaText.innerHTML)
  // ③選択された声を指定
  uttr.voice = speechSynthesis
    .getVoices()
    .filter(voice => voice.name === voiceSelect.value)[0]
  uttr.rate = 0.7;
    // 発言を再生
  speechSynthesis.speak(uttr)
}

// スタートボタンのクリックイベントを定義
startBtn.onclick = function(){
  // セガールの表示
  callSegal();
  $("#segal-img-inner").removeClass("close");
  // アドバイス、翻訳、読み上げを順番に行う
  callAdvice().then(abcd => {
    translateAdvice().then(jpAdvice => {
      kanaTranslate().then(removePunc => {
        readAdvice();
        $(".cage-btn").removeClass('close');
      });
    });
  });
};

cageBtn.onclick = function(){
  callCage();
  cageReply();
  readCage();
};

// ランダムにケイジを呼び出す関数を定義
function callCage(){
  $("#cage-img-inner").removeClass("close");
  let min = 300 ;
  let max = 400 ;
  let a = Math.floor( Math.random() * (max + 1 - min) ) + min ;
  let b = Math.floor( Math.random() * (max + 1 - min) ) + min ;
  cageImg.src = `https://www.placecage.com/gif/${a}/${b}`
  return cageImg;
}

// ランダムにケイジのリアクションを呼び出す関数を定義
function cageReply(){
  let min = 1 ;
  let max = 10 ;
  let r = Math.floor( Math.random() * (max + 1 - min) ) + min ;
  if(r == 1){
    $(".reply-text-inner").html("さすがセガール、いいこといいますね")
  }
  if(r == 2){
    $(".reply-text-inner").html("ちょっと、セガール、いみがわからないですね")
  }
  if(r == 3){
    $(".reply-text-inner").html("たいへんです、あせでまえがみえないです")
  }
  if(r == 4){
    $(".reply-text-inner").html("セガールのはなしはとても、おもしろいです")
  }
  if(r == 5){
    $(".reply-text-inner").html("さすがセガール、わたしもそのように、おもいます")
  }
  if(r == 6){
    $(".reply-text-inner").html("あなた、ほんとうにとってもすばらしいです")
  }
  if(r == 7){
    $(".reply-text-inner").html("セガールのことばにすくわれました。ほんとうにありがとうございます。")
  }
  if(r == 8){
    $(".reply-text-inner").html("それよりはらへらねぇか、セガール")
  }
  if(r == 9){
    $(".reply-text-inner").html("あなた、もしかして、セガールのにせものですか？")
  }
  if(r == 10){
    $(".reply-text-inner").html("きこえませんでした、なにかいったですか？")
  }
}

// ニコラスケイジの返答部分の内容を読み上げる関数を定義。
function readCage(){
  // 発言を作成
  const uttr = new SpeechSynthesisUtterance(cageText.innerHTML)
  // ③選択された声を指定
  uttr.voice = speechSynthesis
    .getVoices()
    .filter(voice => voice.name === cageVoiceSelect.value)[0]
    // 発言を再生
  speechSynthesis.speak(uttr)
}


