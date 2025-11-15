let input = document.querySelector("input");
let button = document.querySelector("#searchBtn");
let place = document.querySelector("#location");

// 시간, 아이콘, 설명, 기온 요소
let timeEls = document.querySelectorAll("li .time");
let iconEls = document.querySelectorAll("li .iconWrap img");
let descEls = document.querySelectorAll("li .iconWrap .desc");
let tempEls = document.querySelectorAll("li .temp");

let liEls = document.querySelectorAll("ul li");

let APIkey = "e62600eea10cc3f1c1755f3360075d0c";
let chart = null;

// 좌표(lat, lon)로 forecast 가져오기
async function fetchWeatherByCoords(lat, lon) {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric&lang=kr`
  );
  let data = await response.json();
  render(data);
}
// -----------------------------------
// input focus효과
// -----------------------------------
input.addEventListener("focusin", () => {
  input.classList.add("focused");
});
input.addEventListener("focusout", () => {
  input.classList.remove("focused");
});

//---------------------------------------------
// 아이콘 d/n 보정 함수 (dt_txt 기준, 아주 단순 버전)
//---------------------------------------------
function getCorrectIcon(iconCode, dtText) {
  // iconCode 예: "02d" 또는 "02n"
  // dtText 예: "2025-11-15 15:00:00"

  // 1) 기본 코드 (앞의 2자리만 사용: "02")
  const base = iconCode.slice(0, 2);

  // 2) 시간 파싱
  const hour = parseInt(dtText.slice(11, 13), 10); // "15" → 15

  // 3) 낮/밤 기준
  const isDay = hour >= 6 && hour < 18;

  // 4) 강제로 "02d" 또는 "02n" 같은 식으로 재조합
  return `${base}${isDay ? "d" : "n"}`;
}

//---------------------------------------------
// 시간에 따라 bg 변경 (사용자 로컬 기준)
//---------------------------------------------
function updateBackgroundByLocalTime() {
  const hour = new Date().getHours();
  const body = document.body;
  const dayBg = document.querySelector("#dayBg");
  const nightBg = document.querySelector("#nightBg");
  //낮
  if (hour >= 6 && hour < 18) {
    body.classList.add("day");
    body.classList.remove("night");
    if (body.classList.contains("day")) {
      dayBg.classList.add("on");
    }
  } else {
    body.classList.add("night");
    body.classList.remove("day");
    if (body.classList.contains("night")) {
      nightBg.classList.add("on");
    }
  }
}

//---------------------------------------------
//  날씨 아이콘,날씨설명 변경용 맵
//---------------------------------------------
updateBackgroundByLocalTime();
const iconMap = {
  "01d": "img/01d.png",
  "01n": "img/01n.png",
  "02d": "img/02d.png",
  "02n": "img/02n.png",
  "03d": "img/03d.png",
  "03n": "img/03n.png",
  "04d": "img/04d.png",
  "04n": "img/04n.png",
  "09d": "img/09d.png",
  "09n": "img/09n.png",
  "10d": "img/10d.png",
  "10n": "img/10n.png",
  "11d": "img/11d.png",
  "11n": "img/11n.png",
  "13d": "img/13d.png",
  "13n": "img/13n.png",
  "50d": "img/50d.png",
  "50n": "img/50n.png",
};
const descMap = {
  // 맑음
  맑음: "맑음",

  // 구름 단계
  "구름 조금": "구름 조금", // few clouds
  "약간의 구름이 낀 하늘": "구름 보통", // scattered clouds
  튼구름: "구름 많음", // broken clouds
  온흐림: "흐림", // overcast clouds

  // 비
  "실 비": "이슬비", // light intensity drizzle (번역이 종종 이렇게 나옴)
  "약한 비": "약한 비", // light rain
  "보통 비": "비", // moderate rain
  "강한 비": "강한 비", // heavy intensity rain
  소나기: "소나기", // shower rain

  // 눈
  "가벼운 눈": "약한 눈", // light snow
  "보통 눈": "눈", // snow
  "강한 눈": "강한 눈", // heavy snow

  // 기타
  안개: "안개",
};

getLocation();
function getLocation() {
  navigator.geolocation.getCurrentPosition(success);
}

async function success(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  fetchWeatherByCoords(lat, lon);
}

// 도시 이름(한글/영문)으로 좌표 찾기 + 날씨 가져오기
async function fetchWeatherByCityName(cityname) {
  if (!cityname.trim()) return;

  const encodedCity = encodeURIComponent(cityname.trim());

  // Geocoding API: 도시 후보 리스트 가져오기
  const geoRes = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodedCity}&limit=5&appid=${APIkey}`
  );
  const geoData = await geoRes.json();

  if (!geoData || geoData.length === 0) {
    alert("일치하는 도시를 찾을 수 없어요. 다른 이름으로 검색해볼까요?");
    return;
  }

  // 일단 1순위(가장 첫 번째 결과) 기준으로 날씨 가져오기
  const { lat, lon } = geoData[0];
  fetchWeatherByCoords(lat, lon);
}

// ---------------------------------------------
// 검색 이벤트 (버튼/엔터) + 검색 후 input 비우기
// ---------------------------------------------
button.addEventListener("click", () => {
  const city = input.value;
  fetchWeatherByCityName(city);
  input.value = ""; // 검색 후 비우기
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = input.value;
    fetchWeatherByCityName(city);
    input.value = ""; // 검색 후 비우기
  }
});

//---------------------------------------------
// 렌더 함수
//---------------------------------------------
function render(data) {
  gsap.killTweensOf(liEls); // 이전 트윈 정리(선택 사항)

  liEls.forEach((li, i) => {
    gsap.fromTo(
      li,
      {
        marginTop: 50, // ← transform 대신 margin으로
        opacity: 0,
      },
      {
        marginTop: 0,
        opacity: 1,
        duration: 0.4,
        delay: i * 0.1,
        ease: "power2.out",
      }
    );
  });

  place.innerHTML = `<i class="fa-solid fa-location-dot"></i>현재위치 : ${data.city.name}`;

  let temps = [];
  let labels = [];

  // ★ 현재 시간 & 가장 가까운 인덱스 찾기용 변수 (사용자 기준)
  const now = new Date();
  let nearestIndex = 0;
  let nearestDiff = Infinity;

  for (let i = 0; i < tempEls.length; i++) {
    let temp = Math.round(data.list[i].main.temp);
    tempEls[i].textContent = `현재 기온 : ${temp}℃`;

    // 원본 아이콘 코드
    let rawIconCode = data.list[i].weather[0].icon;
    let dtText = data.list[i].dt_txt; // "2025-11-15 15:00:00"

    // ★ dt_txt 기준으로 d/n 교정
    let fixedIconCode = getCorrectIcon(rawIconCode, dtText);

    // 맵에서 실제 이미지 경로 가져오기 (혹시 맵에 없으면 rawIconCode로 fallback)
    let iconUrl = iconMap[fixedIconCode] || iconMap[rawIconCode];
    iconEls[i].src = iconUrl;

    let label = data.list[i].dt_txt.slice(11, 16); // "12:00"
    timeEls[i].textContent = label;

    // ★ 여기 추가: 날씨 설명 넣기
    let rawDesc = data.list[i].weather[0].description;

    // 매핑된 짧은 설명 가져오기
    let shortDesc = descMap[rawDesc] || rawDesc; // 매핑 없으면 원본 사용

    descEls[i].textContent = shortDesc;

    temps.push(temp);
    labels.push(label);

    // ★ 이 예보 시간과 "지금" 시간 차이 계산 (사용자 기준)
    const forecastTime = new Date(data.list[i].dt_txt); // "2025-01-01 12:00:00"
    const diff = Math.abs(forecastTime.getTime() - now.getTime());

    if (diff < nearestDiff) {
      nearestDiff = diff;
      nearestIndex = i;
    }
  }

  // ★ for문 다 돈 후, li 강조 상태 반영
  liEls.forEach((li) => li.classList.remove("current"));
  if (liEls[nearestIndex]) {
    liEls[nearestIndex].classList.add("current");
  }

  console.log("nearestIndex:", nearestIndex, data);

  //---------------------------------------------
  // 차트
  //---------------------------------------------
  /*
  drawChart(labels, temps);
  */

  function drawChart(labels, temps) {
    let ctx = document.querySelector("#weatherChart").getContext("2d");

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "시간별 기온",
            data: temps,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 10,
            max: 20,
            ticks: {
              stepSize: 2,
            },
            title: {
              display: true,
              text: "기온",
              color: "orange",
              font: {
                size: 14,
              },
            },
          },
        },
      },
    });
  }
}

// ---------------------------------------------
// li 카드 젤리 / 물결 효과 (GSAP)
// ---------------------------------------------
const cards = document.querySelectorAll("ul li");

// 카드마다 기본 스케일 계산 함수
function getBaseScale(el) {
  return el.classList.contains("current") ? 1.2 : 1;
}

cards.forEach((card) => {
  // 마우스가 올라왔을 때 한 번 "통통" 튕기는 젤리 효과
  card.addEventListener("mouseenter", () => {
    const base = getBaseScale(card);

    gsap.fromTo(
      card,
      { scaleX: base, scaleY: base },
      {
        scaleX: base * 1.06,
        scaleY: base * 0.94,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: "power1.out",
      }
    );
  });

  // 카드 위에서 마우스를 움직일 때 살짝 기울어지는 느낌
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const relX = (e.clientX - centerX) / (rect.width / 2); // -1 ~ 1
    const relY = (e.clientY - centerY) / (rect.height / 2); // -1 ~ 1

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const x = clamp(relX, -1, 1);
    const y = clamp(relY, -1, 1);
    const base = getBaseScale(card);

    gsap.to(card, {
      rotation: x * 4,
      skewX: x * 6,
      skewY: y * -4,
      scaleX: base + x * 0.03,
      scaleY: base - y * 0.03,
      transformOrigin: "center",
      duration: 0.25,
      ease: "power2.out",
    });
  });

  // 카드 밖으로 나가면 원래대로 복귀
  card.addEventListener("mouseleave", () => {
    const base = getBaseScale(card);

    gsap.to(card, {
      rotation: 0,
      skewX: 0,
      skewY: 0,
      scaleX: base,
      scaleY: base,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  });
});

// ---------------------------------------------
// div.bg 아이콘 눈동자: 커서를 따라가는 눈알 효과
// ---------------------------------------------
const eyeEls = document.querySelectorAll(".bg .eye");

document.addEventListener("mousemove", (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  eyeEls.forEach((eye) => {
    const pupil = eye.querySelector(".pupil");
    if (!pupil) return;

    const rect = eye.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    if (dx > 0) {
      gsap.to(pupil, {
        x: 0,
        y: 0,
        duration: 0.15,
        ease: "power2.out",
      });
      return; // 이 눈은 여기서 처리 끝
    }
    // 눈동자가 움직일 수 있는 최대 반경 (눈 크기에 비례)
    const maxOffset = rect.width * 0.4; // 눈 안에서만 움직이도록

    const angle = Math.atan2(dy, dx);
    const distance = Math.min(Math.hypot(dx, dy), maxOffset);

    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    // pupil은 이미 CSS에서 중앙 기준(translate(-50%, -50%))이라
    // GSAP의 x, y로 추가적인 이동만 줌
    gsap.to(pupil, {
      x: offsetX,
      y: offsetY,
      duration: 0.15,
      ease: "power2.out",
    });
  });
});

// ---------------------------------------------
// UL 가로 드래그 스크롤
// ---------------------------------------------
const weatherList = document.querySelector("ul");

let isDown = false;
let startX;
let scrollLeft;

if (weatherList) {
  weatherList.addEventListener("mousedown", (e) => {
    isDown = true;
    weatherList.classList.add("dragging");
    startX = e.pageX - weatherList.offsetLeft;
    scrollLeft = weatherList.scrollLeft;
  });

  weatherList.addEventListener("mouseleave", () => {
    isDown = false;
    weatherList.classList.remove("dragging");
  });

  weatherList.addEventListener("mouseup", () => {
    isDown = false;
    weatherList.classList.remove("dragging");
  });

  weatherList.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - weatherList.offsetLeft;
    const walk = (x - startX) * 1.5; // 숫자 키우면 더 빠르게 이동
    weatherList.scrollLeft = scrollLeft - walk;
  });

  // 터치(모바일) 지원
  weatherList.addEventListener("touchstart", (e) => {
    isDown = true;
    weatherList.classList.add("dragging");
    startX = e.touches[0].pageX - weatherList.offsetLeft;
    scrollLeft = weatherList.scrollLeft;
  });

  weatherList.addEventListener("touchend", () => {
    isDown = false;
    weatherList.classList.remove("dragging");
  });

  weatherList.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - weatherList.offsetLeft;
    const walk = (x - startX) * 1.5;
    weatherList.scrollLeft = scrollLeft - walk;
  });
}
