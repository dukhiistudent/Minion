/* =========================================================
   MUSIC
========================================================= */

const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");
const musicBox = document.querySelector(".music-box");

let musicReady = false;

async function startMusic() {
  if (musicReady) return;

  try {
    bgm.volume = 0.38;

    await bgm.play();

    musicReady = true;

    musicBox.classList.add("on");
    musicBtn.textContent = "music on";
  } catch (error) {
    musicBtn.textContent = "tap music";
  }
}

musicBtn.addEventListener("click", async () => {

  if (bgm.paused) {

    await startMusic();

  } else {

    bgm.pause();

    musicBox.classList.remove("on");
    musicBtn.textContent = "music";

  }

});


/* =========================================================
   START EXPERIENCE
========================================================= */

const startButton = document.getElementById("start");

startButton.addEventListener("click", () => {

  startMusic();

  const nextSlide =
    document.querySelector('[data-step="02"]');

  if (nextSlide) {
    nextSlide.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

});


/* =========================================================
   REPLAY
========================================================= */

document.getElementById("replay").addEventListener("click", () => {

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

});


/* =========================================================
   SLIDES / COUNTER
========================================================= */

const slides = [
  ...document.querySelectorAll(".slide")
];

const current = document.getElementById("current");
const progress = document.getElementById("progressFill");

const slideObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (!entry.isIntersecting) return;

      entry.target.classList.add("seen");

      const index =
        slides.indexOf(entry.target);

      if (index !== -1) {

        current.textContent =
          String(index + 1).padStart(2, "0");

      }

    });

  },
  {
    threshold: 0.45
  }
);

slides.forEach((slide) => {
  slideObserver.observe(slide);
});


/* =========================================================
   SCROLL PROGRESS
========================================================= */

function updateProgress() {

  const documentHeight =
    document.documentElement.scrollHeight;

  const viewportHeight =
    window.innerHeight;

  const maxScroll =
    documentHeight - viewportHeight;

  if (maxScroll <= 0) {

    progress.style.width = "0%";
    return;

  }

  const amount =
    (window.scrollY / maxScroll) * 100;

  progress.style.width =
    `${Math.min(100, Math.max(0, amount))}%`;

}

window.addEventListener(
  "scroll",
  updateProgress,
  {
    passive: true
  }
);

window.addEventListener(
  "resize",
  updateProgress
);

updateProgress();


/* =========================================================
   PHOTO REVEALS
========================================================= */

const photoObserver =
  new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) return;

        entry.target.classList.add("revealed");

        photoObserver.unobserve(
          entry.target
        );

      });

    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -35px 0px"
    }
  );

document
  .querySelectorAll(".reveal")
  .forEach((photo) => {

    photoObserver.observe(photo);

  });


/* =========================================================
   SUBTLE PHOTO PARALLAX ON DESKTOP
========================================================= */

const canHover =
  window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

if (canHover) {

  document
    .querySelectorAll(
      ".photo-card, .game-shot, .final-photo"
    )
    .forEach((card) => {

      card.addEventListener(
        "mousemove",
        (event) => {

          const rect =
            card.getBoundingClientRect();

          const x =
            (event.clientX - rect.left) /
            rect.width -
            0.5;

          const y =
            (event.clientY - rect.top) /
            rect.height -
            0.5;

          const rotateX =
            (-y * 1.6).toFixed(2);

          const rotateY =
            (x * 1.6).toFixed(2);

          card.style.setProperty(
            "--pointer-x",
            `${rotateY}deg`
          );

          card.style.setProperty(
            "--pointer-y",
            `${rotateX}deg`
          );

        }
      );

      card.addEventListener(
        "mouseleave",
        () => {

          card.style.removeProperty(
            "--pointer-x"
          );

          card.style.removeProperty(
            "--pointer-y"
          );

        }
      );

    });

}


/* =========================================================
   GENERATIVE HEART
========================================================= */

const canvas =
  document.getElementById("heartCanvas");

const ctx =
  canvas.getContext("2d");

let W = 0;
let H = 0;
let DPR = 1;
let time = 0;

const colors = [
  "#ff9db0",
  "#ffd2dd",
  "#f48ea2",
  "#dcb2e7",
  "#fff1f4",
  "#e8b2a4"
];


function resizeHeart() {

  const rect =
    canvas.getBoundingClientRect();

  W = rect.width;
  H = rect.height;

  DPR =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );

  canvas.width =
    Math.max(1, Math.floor(W * DPR));

  canvas.height =
    Math.max(1, Math.floor(H * DPR));

  ctx.setTransform(
    DPR,
    0,
    0,
    DPR,
    0,
    0
  );

}

resizeHeart();

window.addEventListener(
  "resize",
  resizeHeart
);


/* Parametric heart formula */

function heartPoint(
  angle,
  scale
) {

  const x =
    16 *
    Math.pow(Math.sin(angle), 3);

  const y =
    -(
      13 * Math.cos(angle) -
      5 * Math.cos(angle * 2) -
      2 * Math.cos(angle * 3) -
      Math.cos(angle * 4)
    );

  return {
    x: x * scale,
    y: y * scale
  };

}


/* Deterministic tiny variation */

function pseudoRandom(n) {

  return Math.abs(
    Math.sin(n * 127.17) *
    43758.5453
  ) % 1;

}


/* =========================================================
   HEART LOOP
========================================================= */

function drawHeart() {

  const cx = W / 2;
  const cy = H / 2 + 8;

  const scale =
    Math.min(W, H) / 38;

  const pulse =
    1 +
    0.035 *
    Math.sin(time * 0.9);

  ctx.clearRect(
    0,
    0,
    W,
    H
  );


  /* soft bloom */

  const glow =
    ctx.createRadialGradient(
      cx,
      cy,
      10,
      cx,
      cy,
      Math.min(W, H) * 0.42
    );

  glow.addColorStop(
    0,
    "rgba(238,151,173,.12)"
  );

  glow.addColorStop(
    1,
    "rgba(238,151,173,0)"
  );

  ctx.fillStyle = glow;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* multiple moving heart strands */

  for (let strand = 0; strand < 18; strand++) {

    ctx.beginPath();

    for (let i = 0; i <= 180; i++) {

      const angle =
        (i / 180) *
        Math.PI *
        2;

      const p =
        heartPoint(
          angle + time * 0.0015,
          scale *
          pulse *
          (
            0.92 +
            0.045 *
            Math.sin(
              time * 0.55 +
              strand
            )
          )
        );

      const wobble =
        1.2 *
        Math.sin(
          angle * 7 +
          time * 0.7 +
          strand
        ) +
        0.7 *
        Math.cos(
          angle * 13 -
          time * 0.45 -
          strand
        );

      const x =
        cx +
        p.x +
        wobble *
        Math.cos(
          angle +
          strand * 0.16 +
          time * 0.07
        );

      const y =
        cy +
        p.y +
        wobble *
        Math.sin(
          angle +
          strand * 0.16 +
          time * 0.07
        );

      if (i === 0) {

        ctx.moveTo(x, y);

      } else {

        ctx.lineTo(x, y);

      }

    }

    ctx.strokeStyle =
      colors[
        strand %
        colors.length
      ];

    ctx.globalAlpha =
      0.08 +
      0.018 * strand;

    ctx.lineWidth =
      0.8 +
      (strand % 3) * 0.35;

    ctx.stroke();

  }


  /* animated little rays */

  for (let i = 0; i < 120; i++) {

    const angle =
      i *
      Math.PI *
      2 /
      120;

    const point =
      heartPoint(
        angle,
        scale * pulse
      );

    const length =
      3 +
      8 *
      pseudoRandom(
        i +
        Math.floor(time * 0.45)
      );

    const direction =
      angle +
      time *
      (
        0.13 +
        pseudoRandom(i) *
        0.07
      );

    ctx.beginPath();

    ctx.moveTo(
      cx + point.x,
      cy + point.y
    );

    ctx.lineTo(
      cx +
      point.x +
      Math.cos(direction) *
      length,

      cy +
      point.y +
      Math.sin(direction) *
      length
    );

    ctx.strokeStyle =
      colors[
        i %
        colors.length
      ];

    ctx.globalAlpha = 0.25;

    ctx.lineWidth = 0.8;

    ctx.stroke();

  }


  /* floating particles */

  for (let i = 0; i < 28; i++) {

    const angle =
      i *
      Math.PI *
      2 /
      28 +
      time *
      (
        0.12 +
        pseudoRandom(i) *
        0.04
      );

    const point =
      heartPoint(
        angle,
        scale * 1.01
      );

    const radius =
      0.8 +
      1.6 *
      pseudoRandom(i + 3);

    ctx.fillStyle =
      colors[
        i %
        colors.length
      ];

    ctx.globalAlpha =
      0.45 +
      0.15 *
      Math.sin(
        time + i
      );

    ctx.beginPath();

    ctx.arc(
      cx +
      point.x +
      Math.cos(angle) * 4,

      cy +
      point.y +
      Math.sin(angle) * 4,

      radius,

      0,
      Math.PI * 2
    );

    ctx.fill();

  }


  ctx.globalAlpha = 1;

  time += 0.018;

  requestAnimationFrame(drawHeart);

}

drawHeart();


/* =========================================================
   KEYBOARD NAVIGATION
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    const validKeys = [
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp"
    ];

    if (!validKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    let closestIndex = 0;
    let closestDistance = Infinity;

    slides.forEach(
      (slide, index) => {

        const rect =
          slide.getBoundingClientRect();

        const distance =
          Math.abs(rect.top);

        if (distance < closestDistance) {

          closestDistance =
            distance;

          closestIndex =
            index;

        }

      }
    );

    const goingDown =
      event.key === "ArrowDown" ||
      event.key === "PageDown";

    const targetIndex =
      goingDown
        ? Math.min(
            slides.length - 1,
            closestIndex + 1
          )
        : Math.max(
            0,
            closestIndex - 1
          );

    slides[
      targetIndex
    ].scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }
);
