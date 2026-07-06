/* ══════════════════════════════════════════════
   STRIPE GRADIENT SHADER — WebGL vanilla
   ══════════════════════════════════════════════ */
(function () {

  function init() {
    var canvas = document.getElementById('gradient-canvas');
    if (!canvas) return;

    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { canvas.style.display = 'none'; return; }

    /* ── Shaders ── */
    var vsSource =
      'attribute vec2 a_pos;\n' +
      'void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }';

    var fsSource =
      'precision mediump float;\n' +
      'uniform float u_time;\n' +
      'uniform vec2  u_res;\n' +

      'float hash(vec2 p){\n' +
      '  return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453);\n' +
      '}\n' +

      'float noise(vec2 p){\n' +
      '  vec2 i=floor(p); vec2 f=fract(p);\n' +
      '  f=f*f*(3.0-2.0*f);\n' +
      '  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),\n' +
      '             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);\n' +
      '}\n' +

      'float fbm(vec2 p){\n' +
      '  float v=0.0,a=0.5;\n' +
      '  vec2 q=p;\n' +
      '  v+=a*noise(q); q*=2.1; a*=0.5;\n' +
      '  v+=a*noise(q); q*=2.1; a*=0.5;\n' +
      '  v+=a*noise(q);\n' +
      '  return v;\n' +
      '}\n' +

      'void main(){\n' +
      '  vec2 uv = gl_FragCoord.xy / u_res;\n' +
      '  float t = u_time * 0.38;\n' +
      '  float n = fbm(uv*2.8 + vec2(t*0.18,t*0.09)) * 0.08;\n' +
      '  float s1 = sin((uv.x - uv.y*0.6)*7.0 + t      + n*18.0)*0.5+0.5;\n' +
      '  float s2 = sin((uv.x*0.5+uv.y)  *5.5 - t*0.75 + n*14.0)*0.5+0.5;\n' +
      '  float s3 = sin((uv.x + uv.y*1.2)*4.0 + t*0.5  + n*10.0)*0.5+0.5;\n' +
      '  vec3 c1 = vec3(1.0,   1.0,   1.0  );\n' +
      '  vec3 c2 = vec3(0.027, 0.788, 0.675);\n' +
      '  vec3 c3 = vec3(0.514, 0.408, 0.973);\n' +
      '  vec3 c4 = vec3(0.996, 0.275, 0.424);\n' +
      '  vec3 col = mix(c1, c2, s1);\n' +
      '  col = mix(col, c3, s2*0.72);\n' +
      '  col = mix(col, c4, s3*0.45);\n' +
      '  gl_FragColor = vec4(col, 1.0);\n' +
      '}';

    /* ── Compilar com verificação de erro ── */
    function compileShader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    var vs = compileShader(gl.VERTEX_SHADER,   vsSource);
    var fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    /* ── Quad fullscreen ── */
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, 1,1]),
      gl.STATIC_DRAW
    );
    var posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    var uTime = gl.getUniformLocation(prog, 'u_time');
    var uRes  = gl.getUniformLocation(prog, 'u_res');

    /* ── Resize — garante dimensões corretas ── */
    function resize() {
      var w = canvas.offsetWidth  || window.innerWidth;
      var h = canvas.offsetHeight || window.innerHeight;
      if (canvas.width === w && canvas.height === h) return;
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    resize();
    window.addEventListener('resize', resize);

    /* ── Loop de renderização — só roda enquanto o canvas está visível ── */
    var start = performance.now();
    var rafId = null;

    function frame() {
      rafId = requestAnimationFrame(frame);
      resize(); /* corrige tamanho se o layout mudar */
      var t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function startLoop() { if (rafId === null) frame(); }
    function stopLoop()  { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

    if ('IntersectionObserver' in window) {
      var visObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.isIntersecting ? startLoop() : stopLoop();
        });
      }, { threshold: 0 });
      visObserver.observe(canvas);
    } else {
      startLoop();
    }
  }

  /* Aguarda layout completo */
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();
