/**
 * CryptoReels Symbol Renderer Service
 * Implements Canvas/WebGL-based symbol rendering with Web3-themed visual effects
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

const SymbolConfigurationService = require('./symbolConfigurationService');

class SymbolRendererService {
  constructor() {
    this.symbolConfig = new SymbolConfigurationService();
    this.animationFrames = new Map(); // Store animation frame data
    this.particleSystems = new Map(); // Store particle systems for effects
    this.renderingContexts = new Map(); // Store canvas contexts
    this.animationStates = new Map(); // Track animation states
    
    // Initialize rendering configurations
    this.initializeRenderingConfig();
    this.initializeAnimationEngine();
    this.initializeParticleSystem();
  }

  /**
   * Initialize rendering configuration for different screen sizes and devices
   * Requirement 10.5: Add responsive design for various screen sizes
   */
  initializeRenderingConfig() {
    this.renderingConfig = {
      // Base symbol dimensions (will be scaled based on screen size)
      baseSymbolSize: {
        width: 120,
        height: 120
      },
      
      // Responsive breakpoints
      breakpoints: {
        mobile: { maxWidth: 768, symbolScale: 0.8 },
        tablet: { maxWidth: 1024, symbolScale: 0.9 },
        desktop: { maxWidth: 1920, symbolScale: 1.0 },
        ultrawide: { maxWidth: 9999, symbolScale: 1.1 }
      },
      
      // Animation settings
      animation: {
        spinDuration: 2000, // 2 seconds
        cascadeDuration: 800, // 0.8 seconds
        winCelebrationDuration: 1500, // 1.5 seconds
        particleLifetime: 3000, // 3 seconds
        frameRate: 60
      },
      
      // Web3 visual effects configuration
      web3Effects: {
        holographic: {
          enabled: true,
          shimmerSpeed: 0.02,
          colorShift: 0.1,
          intensity: 0.7
        },
        particles: {
          enabled: true,
          maxParticles: 100,
          emissionRate: 20,
          gravity: 0.1
        },
        glow: {
          enabled: true,
          intensity: 0.5,
          radius: 20,
          color: '#00ff88'
        }
      }
    };
  }

  /**
   * Initialize animation engine for symbol animations
   * Requirement 10.2: Build symbol animation engine for spins, wins, and cascades
   */
  initializeAnimationEngine() {
    this.animationEngine = {
      // Animation types and their configurations
      animations: {
        idle: {
          type: 'loop',
          duration: 4000,
          easing: 'ease-in-out',
          keyframes: [
            { time: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
            { time: 0.5, scale: 1.05, rotation: 2, opacity: 0.9 },
            { time: 1.0, scale: 1.0, rotation: 0, opacity: 1.0 }
          ]
        },
        
        spin: {
          type: 'once',
          duration: 2000,
          easing: 'ease-out',
          keyframes: [
            { time: 0, scale: 1.0, rotation: 0, blur: 0 },
            { time: 0.3, scale: 0.8, rotation: 180, blur: 5 },
            { time: 0.7, scale: 0.8, rotation: 540, blur: 5 },
            { time: 1.0, scale: 1.0, rotation: 720, blur: 0 }
          ]
        },
        
        win: {
          type: 'once',
          duration: 1500,
          easing: 'ease-out',
          keyframes: [
            { time: 0, scale: 1.0, glow: 0, bounce: 0 },
            { time: 0.2, scale: 1.3, glow: 1.0, bounce: 10 },
            { time: 0.4, scale: 1.1, glow: 0.8, bounce: -5 },
            { time: 0.6, scale: 1.2, glow: 1.0, bounce: 3 },
            { time: 1.0, scale: 1.0, glow: 0.5, bounce: 0 }
          ]
        },
        
        cascade: {
          type: 'once',
          duration: 800,
          easing: 'ease-in',
          keyframes: [
            { time: 0, scale: 1.0, opacity: 1.0, y: 0 },
            { time: 0.3, scale: 0.9, opacity: 0.8, y: 10 },
            { time: 0.7, scale: 0.7, opacity: 0.3, y: 50 },
            { time: 1.0, scale: 0.0, opacity: 0.0, y: 100 }
          ]
        },
        
        // Special animation for NFT characters with holographic effects
        holographic: {
          type: 'loop',
          duration: 3000,
          easing: 'linear',
          keyframes: [
            { time: 0, hologramShift: 0, rainbow: 0 },
            { time: 0.33, hologramShift: 1, rainbow: 0.33 },
            { time: 0.66, hologramShift: 0, rainbow: 0.66 },
            { time: 1.0, hologramShift: -1, rainbow: 1.0 }
          ]
        }
      },
      
      // Easing functions
      easingFunctions: {
        'linear': t => t,
        'ease-in': t => t * t,
        'ease-out': t => 1 - Math.pow(1 - t, 2),
        'ease-in-out': t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
        'bounce': t => {
          const n1 = 7.5625;
          const d1 = 2.75;
          if (t < 1 / d1) return n1 * t * t;
          if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
          if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      }
    };
  }

  /**
   * Initialize particle system for Web3 visual effects
   * Requirement 10.3: Implement Web3-themed visual effects (particles, glows, holographic effects)
   */
  initializeParticleSystem() {
    this.particleSystem = {
      // Particle types for different effects
      particleTypes: {
        crypto_sparkle: {
          texture: 'sparkle',
          color: '#ffd700',
          size: { min: 2, max: 8 },
          velocity: { min: 50, max: 150 },
          lifetime: { min: 1000, max: 3000 },
          gravity: -0.1,
          fadeOut: true
        },
        
        blockchain_bits: {
          texture: 'square',
          color: '#00ff88',
          size: { min: 3, max: 6 },
          velocity: { min: 30, max: 100 },
          lifetime: { min: 2000, max: 4000 },
          gravity: 0.05,
          rotation: true
        },
        
        nft_hologram: {
          texture: 'diamond',
          color: '#ff00ff',
          size: { min: 4, max: 12 },
          velocity: { min: 20, max: 80 },
          lifetime: { min: 3000, max: 5000 },
          gravity: 0,
          holographic: true,
          rainbow: true
        },
        
        win_explosion: {
          texture: 'star',
          color: '#ffff00',
          size: { min: 8, max: 16 },
          velocity: { min: 100, max: 300 },
          lifetime: { min: 1500, max: 2500 },
          gravity: 0.2,
          fadeOut: true,
          burst: true
        }
      },
      
      // Active particle instances
      activeParticles: [],
      
      // Particle pool for performance
      particlePool: [],
      maxPoolSize: 500
    };
  }

  /**
   * Create rendering context for a canvas element
   * Requirement 10.1: Create Canvas/WebGL-based symbol renderer
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Object} options - Rendering options
   * @returns {Object} Rendering context
   */
  createRenderingContext(canvas, options = {}) {
    const contextId = options.contextId || `ctx_${Date.now()}`;
    
    // Try to get WebGL context first, fallback to 2D
    let context;
    let renderingMode = 'webgl';
    
    try {
      context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!context) {
        context = canvas.getContext('2d');
        renderingMode = '2d';
      }
    } catch (error) {
      context = canvas.getContext('2d');
      renderingMode = '2d';
    }
    
    const renderingContext = {
      id: contextId,
      canvas,
      context,
      renderingMode,
      dimensions: {
        width: canvas.width,
        height: canvas.height
      },
      scale: this.calculateResponsiveScale(canvas.width),
      lastFrameTime: 0,
      animationId: null,
      isActive: true
    };
    
    // Initialize WebGL-specific settings
    if (renderingMode === 'webgl') {
      this.initializeWebGLContext(renderingContext);
    }
    
    this.renderingContexts.set(contextId, renderingContext);
    return renderingContext;
  }

  /**
   * Initialize WebGL context with shaders and buffers
   * @param {Object} renderingContext - Rendering context
   */
  initializeWebGLContext(renderingContext) {
    const gl = renderingContext.context;
    
    // Vertex shader for symbol rendering
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      uniform mat3 u_transform;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 position = (u_transform * vec3(a_position, 1.0)).xy;
        vec2 clipSpace = ((position / u_resolution) * 2.0) - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_texCoord = a_texCoord;
      }
    `;
    
    // Fragment shader with Web3 effects
    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      uniform float u_time;
      uniform float u_hologramShift;
      uniform float u_glowIntensity;
      uniform vec3 u_glowColor;
      uniform bool u_holographicEffect;
      varying vec2 v_texCoord;
      
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        
        // Holographic effect
        if (u_holographicEffect) {
          float shift = sin(v_texCoord.y * 10.0 + u_time * 2.0) * u_hologramShift * 0.01;
          vec2 shiftedCoord = v_texCoord + vec2(shift, 0.0);
          vec4 shiftedColor = texture2D(u_texture, shiftedCoord);
          
          // Rainbow effect
          float rainbow = sin(v_texCoord.y * 5.0 + u_time) * 0.5 + 0.5;
          color.rgb = mix(color.rgb, vec3(
            sin(rainbow * 6.28) * 0.5 + 0.5,
            sin(rainbow * 6.28 + 2.09) * 0.5 + 0.5,
            sin(rainbow * 6.28 + 4.18) * 0.5 + 0.5
          ), 0.3);
        }
        
        // Glow effect
        if (u_glowIntensity > 0.0) {
          float glow = u_glowIntensity * (1.0 - length(v_texCoord - 0.5) * 2.0);
          color.rgb += u_glowColor * glow;
        }
        
        gl_FragColor = color;
      }
    `;
    
    // Compile and link shaders
    const program = this.createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    
    // Store WebGL resources
    renderingContext.webgl = {
      program,
      attributes: {
        position: gl.getAttribLocation(program, 'a_position'),
        texCoord: gl.getAttribLocation(program, 'a_texCoord')
      },
      uniforms: {
        transform: gl.getUniformLocation(program, 'u_transform'),
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        texture: gl.getUniformLocation(program, 'u_texture'),
        time: gl.getUniformLocation(program, 'u_time'),
        hologramShift: gl.getUniformLocation(program, 'u_hologramShift'),
        glowIntensity: gl.getUniformLocation(program, 'u_glowIntensity'),
        glowColor: gl.getUniformLocation(program, 'u_glowColor'),
        holographicEffect: gl.getUniformLocation(program, 'u_holographicEffect')
      },
      buffers: {
        position: gl.createBuffer(),
        texCoord: gl.createBuffer()
      },
      textures: new Map()
    };
    
    // Set up vertex data for a quad
    const positions = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1
    ]);
    
    const texCoords = new Float32Array([
      0, 1,  1, 1,  0, 0,
      0, 0,  1, 1,  1, 0
    ]);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, renderingContext.webgl.buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, renderingContext.webgl.buffers.texCoord);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  }

  /**
   * Create and compile shader program
   * @param {WebGLRenderingContext} gl - WebGL context
   * @param {string} vertexSource - Vertex shader source
   * @param {string} fragmentSource - Fragment shader source
   * @returns {WebGLProgram} Compiled shader program
   */
  createShaderProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Shader program linking failed: ' + gl.getProgramInfoLog(program));
    }
    
    return program;
  }

  /**
   * Compile individual shader
   * @param {WebGLRenderingContext} gl - WebGL context
   * @param {number} type - Shader type
   * @param {string} source - Shader source code
   * @returns {WebGLShader} Compiled shader
   */
  compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('Shader compilation failed: ' + gl.getShaderInfoLog(shader));
    }
    
    return shader;
  }

  /**
   * Calculate responsive scale based on screen width
   * Requirement 10.5: Add responsive design for various screen sizes
   * @param {number} screenWidth - Screen width in pixels
   * @returns {number} Scale factor
   */
  calculateResponsiveScale(screenWidth) {
    const breakpoints = this.renderingConfig.breakpoints;
    
    if (screenWidth <= breakpoints.mobile.maxWidth) {
      return breakpoints.mobile.symbolScale;
    } else if (screenWidth <= breakpoints.tablet.maxWidth) {
      return breakpoints.tablet.symbolScale;
    } else if (screenWidth <= breakpoints.desktop.maxWidth) {
      return breakpoints.desktop.symbolScale;
    } else {
      return breakpoints.ultrawide.symbolScale;
    }
  }

  /**
   * Render a symbol with specified animation state
   * @param {string} contextId - Rendering context ID
   * @param {string} symbolId - Symbol identifier
   * @param {Object} position - Position {x, y}
   * @param {Object} animationState - Current animation state
   * @param {number} timestamp - Current timestamp
   */
  renderSymbol(contextId, symbolId, position, animationState = {}, timestamp = Date.now()) {
    const renderingContext = this.renderingContexts.get(contextId);
    if (!renderingContext || !renderingContext.isActive) {
      return;
    }
    
    const symbol = this.symbolConfig.getSymbol(symbolId);
    if (!symbol) {
      console.warn(`Symbol not found: ${symbolId}`);
      return;
    }
    
    if (renderingContext.renderingMode === 'webgl') {
      this.renderSymbolWebGL(renderingContext, symbol, position, animationState, timestamp);
    } else {
      this.renderSymbol2D(renderingContext, symbol, position, animationState, timestamp);
    }
  }

  /**
   * Render symbol using WebGL
   * @param {Object} renderingContext - Rendering context
   * @param {Object} symbol - Symbol configuration
   * @param {Object} position - Position {x, y}
   * @param {Object} animationState - Animation state
   * @param {number} timestamp - Current timestamp
   */
  renderSymbolWebGL(renderingContext, symbol, position, animationState, timestamp) {
    const gl = renderingContext.context;
    const webgl = renderingContext.webgl;
    
    gl.useProgram(webgl.program);
    
    // Set uniforms
    gl.uniform2f(webgl.uniforms.resolution, renderingContext.dimensions.width, renderingContext.dimensions.height);
    gl.uniform1f(webgl.uniforms.time, timestamp * 0.001);
    
    // Apply animation transforms
    const transform = this.calculateTransformMatrix(position, animationState, renderingContext.scale);
    gl.uniformMatrix3fv(webgl.uniforms.transform, false, transform);
    
    // Set up holographic effects for NFT characters
    if (symbol.type === 'nft_premium' && symbol.specialBehavior?.holographicEffect) {
      gl.uniform1f(webgl.uniforms.hologramShift, animationState.hologramShift || 0);
      gl.uniform1i(webgl.uniforms.holographicEffect, true);
    } else {
      gl.uniform1i(webgl.uniforms.holographicEffect, false);
    }
    
    // Set up glow effects
    const glowIntensity = animationState.glow || 0;
    gl.uniform1f(webgl.uniforms.glowIntensity, glowIntensity);
    gl.uniform3f(webgl.uniforms.glowColor, 0.0, 1.0, 0.5); // Web3 green glow
    
    // Bind texture (would load from symbol.imageUrl in real implementation)
    const texture = this.getOrCreateTexture(gl, symbol.imageUrl, webgl.textures);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(webgl.uniforms.texture, 0);
    
    // Set up vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl.buffers.position);
    gl.enableVertexAttribArray(webgl.attributes.position);
    gl.vertexAttribPointer(webgl.attributes.position, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl.buffers.texCoord);
    gl.enableVertexAttribArray(webgl.attributes.texCoord);
    gl.vertexAttribPointer(webgl.attributes.texCoord, 2, gl.FLOAT, false, 0, 0);
    
    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Render symbol using 2D canvas
   * @param {Object} renderingContext - Rendering context
   * @param {Object} symbol - Symbol configuration
   * @param {Object} position - Position {x, y}
   * @param {Object} animationState - Animation state
   * @param {number} timestamp - Current timestamp
   */
  renderSymbol2D(renderingContext, symbol, position, animationState, timestamp) {
    const ctx = renderingContext.context;
    const scale = renderingContext.scale;
    const symbolSize = this.renderingConfig.baseSymbolSize;
    
    ctx.save();
    
    // Apply transforms
    ctx.translate(position.x, position.y);
    
    if (animationState.rotation) {
      ctx.rotate((animationState.rotation * Math.PI) / 180);
    }
    
    const currentScale = (animationState.scale || 1.0) * scale;
    ctx.scale(currentScale, currentScale);
    
    // Apply visual effects
    if (animationState.glow && animationState.glow > 0) {
      ctx.shadowColor = this.renderingConfig.web3Effects.glow.color;
      ctx.shadowBlur = this.renderingConfig.web3Effects.glow.radius * animationState.glow;
    }
    
    if (animationState.opacity !== undefined) {
      ctx.globalAlpha = animationState.opacity;
    }
    
    // Apply blur effect for spin animation
    if (animationState.blur && animationState.blur > 0) {
      ctx.filter = `blur(${animationState.blur}px)`;
    }
    
    // Draw symbol (placeholder - would load actual image in real implementation)
    ctx.fillStyle = this.getSymbolColor(symbol);
    ctx.fillRect(-symbolSize.width / 2, -symbolSize.height / 2, symbolSize.width, symbolSize.height);
    
    // Add symbol text for identification
    ctx.fillStyle = '#ffffff';
    ctx.font = `${12 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(symbol.id.toUpperCase(), 0, 5);
    
    ctx.restore();
  }

  /**
   * Get or create WebGL texture for symbol
   * @param {WebGLRenderingContext} gl - WebGL context
   * @param {string} imageUrl - Image URL
   * @param {Map} textureCache - Texture cache
   * @returns {WebGLTexture} WebGL texture
   */
  getOrCreateTexture(gl, imageUrl, textureCache) {
    if (textureCache.has(imageUrl)) {
      return textureCache.get(imageUrl);
    }
    
    // Create placeholder texture (in real implementation, would load from imageUrl)
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Create a 1x1 colored pixel as placeholder
    const pixel = new Uint8Array([255, 100, 0, 255]); // Orange placeholder
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    textureCache.set(imageUrl, texture);
    return texture;
  }

  /**
   * Calculate transform matrix for WebGL rendering
   * @param {Object} position - Position {x, y}
   * @param {Object} animationState - Animation state
   * @param {number} scale - Scale factor
   * @returns {Float32Array} Transform matrix
   */
  calculateTransformMatrix(position, animationState, scale) {
    const symbolSize = this.renderingConfig.baseSymbolSize;
    const currentScale = (animationState.scale || 1.0) * scale;
    const rotation = (animationState.rotation || 0) * Math.PI / 180;
    
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    
    const scaleX = symbolSize.width * currentScale;
    const scaleY = symbolSize.height * currentScale;
    
    return new Float32Array([
      cos * scaleX, sin * scaleX, position.x,
      -sin * scaleY, cos * scaleY, position.y + (animationState.bounce || 0),
      0, 0, 1
    ]);
  }

  /**
   * Get color for symbol (placeholder for actual image loading)
   * @param {Object} symbol - Symbol configuration
   * @returns {string} Color string
   */
  getSymbolColor(symbol) {
    const colorMap = {
      'btc': '#f7931a',
      'eth': '#627eea',
      'sol': '#9945ff',
      'wild': '#ffd700',
      'scatter': '#ff6b6b',
      'nft_character': '#ff00ff'
    };
    
    return colorMap[symbol.id] || '#888888';
  }

  /**
   * Start animation for a symbol
   * @param {string} contextId - Rendering context ID
   * @param {string} symbolId - Symbol identifier
   * @param {string} animationType - Animation type
   * @param {Object} options - Animation options
   * @returns {string} Animation ID
   */
  startAnimation(contextId, symbolId, animationType, options = {}) {
    const animationId = `${contextId}_${symbolId}_${animationType}_${Date.now()}`;
    const animation = this.animationEngine.animations[animationType];
    
    if (!animation) {
      console.warn(`Animation type not found: ${animationType}`);
      return null;
    }
    
    const animationState = {
      id: animationId,
      contextId,
      symbolId,
      type: animationType,
      startTime: Date.now(),
      duration: animation.duration,
      easing: animation.easing,
      keyframes: animation.keyframes,
      loop: animation.type === 'loop',
      position: options.position || { x: 0, y: 0 },
      onComplete: options.onComplete,
      isActive: true
    };
    
    this.animationStates.set(animationId, animationState);
    
    // Start particle effects if specified
    if (options.particles) {
      this.startParticleEffect(contextId, options.particles, options.position);
    }
    
    return animationId;
  }

  /**
   * Update animation state and render frame
   * @param {string} animationId - Animation ID
   * @param {number} timestamp - Current timestamp
   */
  updateAnimation(animationId, timestamp) {
    const animationState = this.animationStates.get(animationId);
    if (!animationState || !animationState.isActive) {
      return;
    }
    
    const elapsed = timestamp - animationState.startTime;
    const progress = Math.min(elapsed / animationState.duration, 1.0);
    
    // Calculate current animation values
    const currentValues = this.interpolateKeyframes(animationState.keyframes, progress, animationState.easing);
    
    // Render symbol with current animation state
    this.renderSymbol(animationState.contextId, animationState.symbolId, animationState.position, currentValues, timestamp);
    
    // Check if animation is complete
    if (progress >= 1.0) {
      if (animationState.loop) {
        animationState.startTime = timestamp; // Restart loop
      } else {
        animationState.isActive = false;
        if (animationState.onComplete) {
          animationState.onComplete(animationId);
        }
      }
    }
  }

  /**
   * Interpolate between keyframes
   * @param {Array} keyframes - Animation keyframes
   * @param {number} progress - Animation progress (0-1)
   * @param {string} easing - Easing function name
   * @returns {Object} Interpolated values
   */
  interpolateKeyframes(keyframes, progress, easing) {
    const easingFunc = this.animationEngine.easingFunctions[easing] || this.animationEngine.easingFunctions.linear;
    const easedProgress = easingFunc(progress);
    
    // Find surrounding keyframes
    let prevFrame = keyframes[0];
    let nextFrame = keyframes[keyframes.length - 1];
    
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (easedProgress >= keyframes[i].time && easedProgress <= keyframes[i + 1].time) {
        prevFrame = keyframes[i];
        nextFrame = keyframes[i + 1];
        break;
      }
    }
    
    // Calculate interpolation factor
    const frameProgress = prevFrame.time === nextFrame.time ? 0 : 
      (easedProgress - prevFrame.time) / (nextFrame.time - prevFrame.time);
    
    // Interpolate values
    const result = {};
    const allKeys = new Set([...Object.keys(prevFrame), ...Object.keys(nextFrame)]);
    
    allKeys.forEach(key => {
      if (key === 'time') return;
      
      const prevValue = prevFrame[key] || 0;
      const nextValue = nextFrame[key] || 0;
      result[key] = prevValue + (nextValue - prevValue) * frameProgress;
    });
    
    return result;
  }

  /**
   * Start particle effect
   * @param {string} contextId - Rendering context ID
   * @param {string} particleType - Particle type
   * @param {Object} position - Emission position
   * @param {Object} options - Particle options
   */
  startParticleEffect(contextId, particleType, position, options = {}) {
    const particleConfig = this.particleSystem.particleTypes[particleType];
    if (!particleConfig) {
      console.warn(`Particle type not found: ${particleType}`);
      return;
    }
    
    const emissionCount = options.count || (particleConfig.burst ? 20 : 5);
    
    for (let i = 0; i < emissionCount; i++) {
      const particle = this.createParticle(contextId, particleConfig, position);
      this.particleSystem.activeParticles.push(particle);
    }
  }

  /**
   * Create individual particle
   * @param {string} contextId - Rendering context ID
   * @param {Object} config - Particle configuration
   * @param {Object} position - Initial position
   * @returns {Object} Particle instance
   */
  createParticle(contextId, config, position) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = config.velocity.min + Math.random() * (config.velocity.max - config.velocity.min);
    
    return {
      contextId,
      x: position.x,
      y: position.y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      size: config.size.min + Math.random() * (config.size.max - config.size.min),
      color: config.color,
      lifetime: config.lifetime.min + Math.random() * (config.lifetime.max - config.lifetime.min),
      age: 0,
      rotation: config.rotation ? Math.random() * Math.PI * 2 : 0,
      rotationSpeed: config.rotation ? (Math.random() - 0.5) * 0.1 : 0,
      gravity: config.gravity || 0,
      fadeOut: config.fadeOut || false,
      holographic: config.holographic || false,
      rainbow: config.rainbow || false,
      isActive: true
    };
  }

  /**
   * Update all active particles
   * @param {number} deltaTime - Time since last update
   */
  updateParticles(deltaTime) {
    this.particleSystem.activeParticles = this.particleSystem.activeParticles.filter(particle => {
      if (!particle.isActive) return false;
      
      // Update particle physics
      particle.age += deltaTime;
      particle.x += particle.vx * deltaTime * 0.001;
      particle.y += particle.vy * deltaTime * 0.001;
      particle.vy += particle.gravity * deltaTime * 0.001;
      
      if (particle.rotation !== undefined) {
        particle.rotation += particle.rotationSpeed * deltaTime * 0.001;
      }
      
      // Check lifetime
      if (particle.age >= particle.lifetime) {
        particle.isActive = false;
        return false;
      }
      
      // Render particle
      this.renderParticle(particle);
      
      return true;
    });
  }

  /**
   * Render individual particle
   * @param {Object} particle - Particle to render
   */
  renderParticle(particle) {
    const renderingContext = this.renderingContexts.get(particle.contextId);
    if (!renderingContext || renderingContext.renderingMode !== '2d') {
      return;
    }
    
    const ctx = renderingContext.context;
    const lifeProgress = particle.age / particle.lifetime;
    
    ctx.save();
    
    ctx.translate(particle.x, particle.y);
    
    if (particle.rotation !== undefined) {
      ctx.rotate(particle.rotation);
    }
    
    // Apply fade out
    if (particle.fadeOut) {
      ctx.globalAlpha = 1.0 - lifeProgress;
    }
    
    // Apply rainbow effect
    let color = particle.color;
    if (particle.rainbow) {
      const hue = (lifeProgress * 360) % 360;
      color = `hsl(${hue}, 100%, 50%)`;
    }
    
    // Apply holographic effect
    if (particle.holographic) {
      ctx.shadowColor = color;
      ctx.shadowBlur = particle.size;
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    
    ctx.restore();
  }

  /**
   * Start main rendering loop for a context
   * @param {string} contextId - Rendering context ID
   */
  startRenderLoop(contextId) {
    const renderingContext = this.renderingContexts.get(contextId);
    if (!renderingContext) {
      return;
    }
    
    const renderFrame = (timestamp) => {
      if (!renderingContext.isActive) {
        return;
      }
      
      const deltaTime = timestamp - renderingContext.lastFrameTime;
      renderingContext.lastFrameTime = timestamp;
      
      // Clear canvas
      if (renderingContext.renderingMode === 'webgl') {
        const gl = renderingContext.context;
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      } else {
        const ctx = renderingContext.context;
        ctx.clearRect(0, 0, renderingContext.dimensions.width, renderingContext.dimensions.height);
      }
      
      // Update animations
      this.animationStates.forEach((animationState, animationId) => {
        if (animationState.contextId === contextId) {
          this.updateAnimation(animationId, timestamp);
        }
      });
      
      // Update particles
      this.updateParticles(deltaTime);
      
      renderingContext.animationId = requestAnimationFrame(renderFrame);
    };
    
    renderingContext.animationId = requestAnimationFrame(renderFrame);
  }

  /**
   * Stop rendering loop for a context
   * @param {string} contextId - Rendering context ID
   */
  stopRenderLoop(contextId) {
    const renderingContext = this.renderingContexts.get(contextId);
    if (renderingContext && renderingContext.animationId) {
      cancelAnimationFrame(renderingContext.animationId);
      renderingContext.isActive = false;
    }
  }

  /**
   * Clean up resources for a rendering context
   * @param {string} contextId - Rendering context ID
   */
  destroyRenderingContext(contextId) {
    this.stopRenderLoop(contextId);
    
    const renderingContext = this.renderingContexts.get(contextId);
    if (renderingContext && renderingContext.renderingMode === 'webgl') {
      const gl = renderingContext.context;
      const webgl = renderingContext.webgl;
      
      // Clean up WebGL resources
      gl.deleteProgram(webgl.program);
      gl.deleteBuffer(webgl.buffers.position);
      gl.deleteBuffer(webgl.buffers.texCoord);
      
      webgl.textures.forEach(texture => {
        gl.deleteTexture(texture);
      });
    }
    
    // Remove animations for this context
    this.animationStates.forEach((animationState, animationId) => {
      if (animationState.contextId === contextId) {
        this.animationStates.delete(animationId);
      }
    });
    
    // Remove particles for this context
    this.particleSystem.activeParticles = this.particleSystem.activeParticles.filter(
      particle => particle.contextId !== contextId
    );
    
    this.renderingContexts.delete(contextId);
  }

  /**
   * Get rendering statistics
   * @returns {Object} Rendering statistics
   */
  getRenderingStats() {
    return {
      activeContexts: this.renderingContexts.size,
      activeAnimations: this.animationStates.size,
      activeParticles: this.particleSystem.activeParticles.length,
      particlePoolSize: this.particleSystem.particlePool.length,
      memoryUsage: {
        contexts: this.renderingContexts.size * 1024, // Rough estimate
        animations: this.animationStates.size * 512,
        particles: this.particleSystem.activeParticles.length * 256
      }
    };
  }
}

module.exports = SymbolRendererService;