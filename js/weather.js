/* ---------------------------------------------
   DOM 요소 분리 (메인 / 디테일)
--------------------------------------------- */

// 메인 영역
const main = document.querySelector("#view-main");
const mainInput = main.querySelector("input");
const mainBtn = main.querySelector("#searchBtn");
const mainPlace = main.querySelector("#location");
const mainList = main.querySelectorAll("ul li");
const mainTimes = main.querySelectorAll("ul li .time");
const mainIcons = main.querySelectorAll("ul li .iconWrap img");
const mainDescs = main.querySelectorAll("ul li .desc");
const mainTemps = main.querySelectorAll("ul li .temp");

// 디테일 영역
const detail = document.querySelector("#view-detail");
const detailInput = detail.querySelector("input");
const detailBtn = detail.querySelector("#searchBtn");
const detailPlace = detail.querySelector("#location");

const detailCity = detail.querySelector(".city");
const detailIcon = detail.querySelector(".icon");
const detailDesc = detail.querySelector(".desc");
const detailCurrentTemp = detail.querySelector(".currentTemp");
const detailMin = detail.querySelector(".min");
const detailMax = detail.querySelector(".max");
const detailWind = detail.querySelector(".wind");
const detailHumidity = detail.querySelector(".humidity");

const detailList = detail.querySelectorAll("ul li");
const detailTimes = detail.querySelectorAll("ul li .time");
const detailIcons = detail.querySelectorAll("ul li .iconWrap img");
const detailDescs = detail.querySelectorAll("ul li .desc");
const detailTemps = detail.querySelectorAll("ul li .temp");

// back 버튼 (처음엔 main 안에 있음)
const backBtn = document.querySelector("#back");

// 차트
const chartCanvas = detail.querySelector("#weatherChart");
let chart = null;

// API 키
const APIkey = "e62600eea10cc3f1c1755f3360075d0c";

/* ---------------------------------------------
   input focus 효과 (메인/디테일 공통)
--------------------------------------------- */

[mainInput, detailInput].forEach((el) => {
  el.addEventListener("focusin", () => el.classList.add("focused"));
  el.addEventListener("focusout", () => el.classList.remove("focused"));
});

/* ---------------------------------------------
   아이콘 d/n 보정
--------------------------------------------- */

function getCorrectIcon(iconCode, dtText) {
  const base = iconCode.slice(0, 2);
  const hour = parseInt(dtText.slice(11, 13), 10);
  const isDay = hour >= 6 && hour < 18;
  return `${base}${isDay ? "d" : "n"}`;
}

/* ---------------------------------------------
   시간대별 배경 변경 (메인/디테일 모두)
--------------------------------------------- */

function updateBackgroundByLocalTime() {
  const hour = new Date().getHours();
  const body = document.body;

  const mainDay = main.querySelector("#dayBg");
  const mainNight = main.querySelector("#nightBg");

  const detailDay = detail.querySelector("#dayBg");
  const detailNight = detail.querySelector("#nightBg");

  const isDay = hour >= 6 && hour < 18;

  body.classList.toggle("day", isDay);
  body.classList.toggle("night", !isDay);

  mainDay.classList.toggle("on", isDay);
  mainNight.classList.toggle("on", !isDay);

  detailDay.classList.toggle("on", isDay);
  detailNight.classList.toggle("on", !isDay);
}
updateBackgroundByLocalTime();

/* ---------------------------------------------
   아이콘 맵 + 한글 설명 맵
--------------------------------------------- */

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
  맑음: "맑음",
  "구름 조금": "구름 조금",
  "약간의 구름이 낀 하늘": "구름 보통",
  튼구름: "구름 많음",
  온흐림: "흐림",
  "실 비": "이슬비",
  "약한 비": "약한 비",
  "보통 비": "비",
  "강한 비": "강한 비",
  소나기: "소나기",
  "가벼운 눈": "약한 눈",
  "보통 눈": "눈",
  "강한 눈": "강한 눈",
  안개: "안개",
};

/* ---------------------------------------------
   현재 위치 기준 초기 호출
--------------------------------------------- */

getLocation();

function getLocation() {
  navigator.geolocation.getCurrentPosition(success);
}

async function success(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  fetchWeatherByCoords(lat, lon);
}

/* ---------------------------------------------
   API 호출 (좌표 / 도시명)
--------------------------------------------- */

async function fetchWeatherByCoords(lat, lon) {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric&lang=kr`
  );
  let data = await response.json();

  renderMain(data);
  renderDetail(data);
}

async function fetchWeatherByCityName(cityname) {
  if (!cityname.trim()) return;
  const encodedCity = encodeURIComponent(cityname.trim());

  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodedCity}&limit=5&appid=${APIkey}`
  );
  const geo = await res.json();

  if (!geo.length) {
    alert("일치하는 도시를 찾을 수 없어요.");
    return;
  }

  const { lat, lon } = geo[0];
  fetchWeatherByCoords(lat, lon);
}

/* ---------------------------------------------
   검색 공통 함수 + 이벤트
--------------------------------------------- */

function search(city) {
  if (!city.trim()) return;
  fetchWeatherByCityName(city);
  openDetailView();
}

mainBtn.addEventListener("click", () => search(mainInput.value));
detailBtn.addEventListener("click", () => search(detailInput.value));

mainInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") search(mainInput.value);
  input = "";
});
detailInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") search(detailInput.value);

  input = "";
});
function search(city) {
  if (!city.trim()) return;

  fetchWeatherByCityName(city);
  openDetailView();

  // ✔ 검색 후 양쪽 인풋 모두 비우기
  mainInput.value = "";
  detailInput.value = "";
}

/* ---------------------------------------------
   메인 렌더
--------------------------------------------- */

function renderMain(data) {
  mainList.forEach((list, i) => {
    gsap.fromTo(
      list,
      {
        opacity: 0,
        marginTop: 0,
      },
      {
        opacity: 1,
        marginTop: -20,
        delay: i * 0.15,
      }
    );
  });

  mainPlace.innerHTML = `<i class="fa-solid fa-location-dot"></i>${data.city.name}`;

  const now = new Date();
  let nearest = 0;
  let nearestDiff = Infinity;

  data.list.slice(0, 8).forEach((item, i) => {
    const temp = Math.round(item.main.temp);
    const rawIcon = item.weather[0].icon;
    const fixed = getCorrectIcon(rawIcon, item.dt_txt);

    mainTemps[i].textContent = `${temp}℃`;
    mainIcons[i].src = iconMap[fixed];
    mainTimes[i].textContent = item.dt_txt.slice(11, 16);

    const desc =
      descMap[item.weather[0].description] || item.weather[0].description;
    mainDescs[i].textContent = desc;

    const diff = Math.abs(new Date(item.dt_txt) - now);
    if (diff < nearestDiff) {
      nearestDiff = diff;
      nearest = i;
    }
  });

  mainList.forEach((li) => li.classList.remove("current"));
  mainList[nearest].classList.add("current");
}

/* ---------------------------------------------
   디테일 렌더 (상단 detail 박스 + 리스트 + 차트)
--------------------------------------------- */

function renderDetail(data) {
  detailList.forEach((list, i) => {
    gsap.fromTo(
      list,
      {
        opacity: 0,
        marginTop: 0,
      },
      {
        opacity: 1,
        marginTop: -20,
        delay: i * 0.1,
      }
    );
  });
  const cityName = data.city.name;
  const item = data.list[0]; // 가장 가까운 시간대 기준

  // 상단 detail 박스
  const temp = Math.round(item.main.temp);
  const tempMin = Math.round(item.main.temp_min);
  const tempMax = Math.round(item.main.temp_max);
  const humidity = item.main.humidity;
  const windSpeed = item.wind.speed;

  const rawIcon = item.weather[0].icon;
  const fixedIcon = getCorrectIcon(rawIcon, item.dt_txt);

  detailCity.textContent = cityName;
  detailIcon.src = iconMap[fixedIcon];
  detailDesc.textContent =
    descMap[item.weather[0].description] || item.weather[0].description;
  detailCurrentTemp.textContent = `${temp}℃`;
  detailMin.textContent = `${tempMin}℃`;
  detailMax.textContent = `${tempMax}℃`;
  detailWind.textContent = `${windSpeed} m/s`;
  detailHumidity.textContent = `${humidity}%`;

  // 리스트 8개 + 차트용 데이터
  let labels = [];
  let temps = [];

  data.list.slice(0, 8).forEach((item, i) => {
    const t = Math.round(item.main.temp);
    const raw = item.weather[0].icon;
    const fixed = getCorrectIcon(raw, item.dt_txt);

    detailTemps[i].textContent = `:${t}℃`;
    detailIcons[i].src = iconMap[fixed];
    detailTimes[i].textContent = item.dt_txt.slice(11, 16);

    const desc =
      descMap[item.weather[0].description] || item.weather[0].description;
    detailDescs[i].textContent = desc;

    temps.push(t);
    labels.push(item.dt_txt.slice(11, 16));
  });

  drawChart(labels, temps);
}

/* ---------------------------------------------
   차트
--------------------------------------------- */

function drawChart(labels, temps) {
  const ctx = chartCanvas.getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "시간별 기온",
          data: temps,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

/* ---------------------------------------------
   디테일 뷰 열기 / 닫기 + back 버튼 이동
--------------------------------------------- */

function openDetailView() {
  if (document.body.classList.contains("searched")) return;

  document.body.classList.add("searched");

  // back 버튼을 디테일 섹션 쪽으로 옮겨서 항상 위에 보이게
  detail.prepend(backBtn);

  gsap.to("#view-detail", {
    y: "-100vh",
    duration: 0.6,
    ease: "power2.out",
  });
}

function closeDetailView() {
  gsap.to("#view-detail", {
    y: "0",
    duration: 0.6,
    ease: "power2.out",
    onComplete: () => {
      document.body.classList.remove("searched");
      // back 버튼을 다시 메인 섹션으로 되돌림
      main.prepend(backBtn);
    },
  });
}

/* ---------------------------------------------
   back 버튼 동작
   - 디테일뷰 열려 있을 때: 메인으로 복귀
   - 메인뷰일 때: 포트폴리오로 돌아가기(history.back)
--------------------------------------------- */

backBtn.addEventListener("click", () => {
  if (document.body.classList.contains("searched")) {
    // 디테일 뷰 상태 → 닫기
    closeDetailView();
  } else {
    // 메인 상태 → 이전 페이지(포트폴리오)로 돌아가기
    history.back();
    // 필요하면 아래처럼 직접 URL 지정도 가능:
    // location.href = "../index.html";
  }
});
// ---------------------------------------------
// 메인뷰 - "자세히보기" 버튼 클릭 시 디테일뷰 열기
// ---------------------------------------------
const currentDetailBtn = document.querySelector("#currentDetailBtn");

if (currentDetailBtn) {
  currentDetailBtn.addEventListener("click", () => {
    openDetailView();
  });
}
/* ---------------------------------------------
   눈동자 효과 (메인 / 디테일 공용)
--------------------------------------------- */

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

    const angle = Math.atan2(dy, dx);
    const maxOffset = rect.width * 0.35;
    const distance = Math.min(Math.hypot(dx, dy), maxOffset);

    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    gsap.to(pupil, {
      x: offsetX,
      y: offsetY,
      duration: 0.15,
      ease: "power2.out",
    });
  });
});

/* ---------------------------------------------
   가로 드래그 스크롤 (메인 / 디테일 각각)
--------------------------------------------- */

function enableDragScroll(ul) {
  let isDown = false;
  let startX;
  let scrollLeft;

  ul.addEventListener("mousedown", (e) => {
    isDown = true;
    ul.classList.add("dragging");
    startX = e.pageX - ul.offsetLeft;
    scrollLeft = ul.scrollLeft;
  });

  ul.addEventListener("mouseleave", () => {
    isDown = false;
    ul.classList.remove("dragging");
  });

  ul.addEventListener("mouseup", () => {
    isDown = false;
    ul.classList.remove("dragging");
  });

  ul.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const x = e.pageX - ul.offsetLeft;
    ul.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });

  // 터치 지원
  ul.addEventListener("touchstart", (e) => {
    isDown = true;
    ul.classList.add("dragging");
    startX = e.touches[0].pageX - ul.offsetLeft;
    scrollLeft = ul.scrollLeft;
  });

  ul.addEventListener("touchend", () => {
    isDown = false;
    ul.classList.remove("dragging");
  });

  ul.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - ul.offsetLeft;
    ul.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
}

enableDragScroll(main.querySelector("ul"));
enableDragScroll(detail.querySelector("ul"));
