(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function createSvgElement(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    return el;
  }

  function createEyeballSvg() {
    const svg = createSvgElement("svg", {
      class: "eyeball",
      viewBox: "0 0 100 100",
      "aria-hidden": "true",
    });

    svg.appendChild(
      createSvgElement("circle", {
        cx: "50",
        cy: "50",
        r: "40",
        stroke: "black",
        "stroke-width": "3",
        fill: "white",
      })
    );

    svg.appendChild(
      createSvgElement("ellipse", {
        class: "iris",
        cx: "50",
        cy: "50",
        rx: "20",
        ry: "20",
        stroke: "black",
        "stroke-width": "1",
        fill: "var(--eyeball-red)",
      })
    );

    svg.appendChild(
      createSvgElement("ellipse", {
        class: "pupil",
        cx: "50",
        cy: "50",
        rx: "10",
        ry: "10",
        stroke: "black",
        "stroke-width": "1",
        fill: "black",
      })
    );

    svg.appendChild(
      createSvgElement("circle", {
        cx: "42",
        cy: "42",
        r: "9",
        stroke: "white",
        "stroke-width": "0",
        fill: "white",
        "fill-opacity": "0.8",
      })
    );

    return svg;
  }

  function mountEyeball(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return null;

    const svg = createEyeballSvg();
    root.appendChild(svg);

    const iris = svg.querySelector(".iris");
    const pupil = svg.querySelector(".pupil");

    const randomOffset = () => 50 + Math.floor(Math.random() * 25 - 12);
    let x = randomOffset();
    let y = randomOffset();

    const apply = (nx, ny) => {
      x = nx;
      y = ny;
      iris.setAttribute("cx", x);
      iris.setAttribute("cy", y);
      pupil.setAttribute("cx", x);
      pupil.setAttribute("cy", y);
    };

    const tick = () => apply(randomOffset(), randomOffset());
    let timer = setInterval(
      tick,
      Math.floor(Math.random() * (3000 - 1500 + 1) + 1500)
    );

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    let centerX = 50;
    let centerY = 50;

    const updateCenter = () => {
      const rect = svg.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    };

    updateCenter();

    const handleMove = (ev) => {
      const dx = clamp(ev.clientX - centerX, -120, 120);
      const dy = clamp(ev.clientY - centerY, -120, 120);
      const lookX = 50 + (dx / 120) * 12;
      const lookY = 50 + (dy / 120) * 12;
      apply(lookX, lookY);
    };

    window.addEventListener("mousemove", handleMove, { capture: true });
    window.addEventListener("resize", updateCenter);
    window.addEventListener("scroll", updateCenter, { passive: true });

    const cleanup = () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", handleMove, { capture: true });
      window.removeEventListener("resize", updateCenter);
      window.removeEventListener("scroll", updateCenter, { passive: true });
    };

    window.addEventListener("beforeunload", cleanup);

    return cleanup;
  }

  window.createEyeballSvg = createEyeballSvg;
  window.mountEyeball = mountEyeball;
})();
