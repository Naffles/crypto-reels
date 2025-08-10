/**
 * Symbol Renderer Service Tests
 * Tests for Canvas/WebGL-based symbol rendering with Web3-themed visual effects
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

const SymbolRendererService = require('../services/symbolRendererService');

// Mock Canvas and WebGL contexts
class MockCanvas {
  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.contexts = new Map();
  }
  
  getContext(type) {
    if (type === 'webgl' || type === 'webgl2') {
      return this.getMockWebGLContext();
    } else if (type === '2d') {
      return this.getMock2DContext();
    }
    return null;
  }
  
  getMockWebGLContext() {
    if (this.contexts.has('webgl')) {
      return this.contexts.get('webgl');
    }
    
    const mockGL = {
      VERTEX_SHADER: 35633,
      FRAGMENT_SHADER: 35632,
      COMPILE_STATUS: 35713,
      LINK_STATUS: 35714,
      ARRAY_BUFFER: 34962,
      STATIC_DRAW: 35044,
      TRIANGLES: 4,
      TEXTURE_2D: 3553,
      RGBA: 6408,
      UNSIGNED_BYTE: 5121,
      TEXTURE0: 33984,
      TEXTURE_WRAP_S: 10242,
      TEXTURE_WRAP_T: 10243,
      TEXTURE_MIN_FILTER: 10241,
      CLAMP_TO_EDGE: 33071,
      LINEAR: 9729,
      COLOR_BUFFER_BIT: 16384,
      FLOAT: 5126,
      
      createShader: jest.fn(() => ({})),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      getShaderParameter: jest.fn(() => true),
      getShaderInfoLog: jest.fn(() => ''),
      createProgram: jest.fn(() => ({})),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      getProgramParameter: jest.fn(() => true),
      getProgramInfoLog: jest.fn(() => ''),
      getAttribLocation: jest.fn(() => 0),
      getUniformLocation: jest.fn(() => ({})),
      createBuffer: jest.fn(() => ({})),
      createTexture: jest.fn(() => ({})),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      bindTexture: jest.fn(),
      texImage2D: jest.fn(),
      texParameteri: jest.fn(),
      useProgram: jest.fn(),
      uniform2f: jest.fn(),
      uniform1f: jest.fn(),
      uniform1i: jest.fn(),
      uniform3f: jest.fn(),
      uniformMatrix3fv: jest.fn(),
      activeTexture: jest.fn(),
      enableVertexAttribArray: jest.fn(),
      vertexAttribPointer: jest.fn(),
      drawArrays: jest.fn(),
      clearColor: jest.fn(),
      clear: jest.fn()
    };
    
    this.contexts.set('webgl', mockGL);
    return mockGL;
  }
  
  getMock2DContext() {
    if (this.contexts.has('2d')) {
      return this.contexts.get('2d');
    }
    
    const mock2D = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      shadowColor: '',
      shadowBlur: 0,
      globalAlpha: 1,
      fillStyle: '',
      font: '',
      textAlign: '',
      filter: ''
    };
    
    this.contexts.set('2d', mock2D);
    return mock2D;
  }
}

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

describe('SymbolRendererService', () => {
  let symbolRenderer;
  let mockCanvas;

  beforeEach(() => {
    symbolRenderer = new SymbolRendererService();
    mockCanvas = new MockCanvas();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any active rendering contexts
    symbolRenderer.renderingContexts.forEach((context, contextId) => {
      symbolRenderer.destroyRenderingContext(contextId);
    });
  });

  describe('Initialization', () => {
    test('should initialize with proper configuration', () => {
      expect(symbolRenderer.renderingConfig).toBeDefined();
      expect(symbolRenderer.animationEngine).toBeDefined();
      expect(symbolRenderer.particleSystem).toBeDefined();
      expect(symbolRenderer.renderingContexts).toBeInstanceOf(Map);
      expect(symbolRenderer.animationStates).toBeInstanceOf(Map);
    });

    test('should have responsive breakpoints configured', () => {
      // Requirement 10.5: Add responsive design for various screen sizes
      const breakpoints = symbolRenderer.renderingConfig.breakpoints;
      
      expect(breakpoints.mobile).toBeDefined();
      expect(breakpoints.tablet).toBeDefined();
      expect(breakpoints.desktop).toBeDefined();
      expect(breakpoints.ultrawide).toBeDefined();
      
      expect(breakpoints.mobile.symbolScale).toBe(0.8);
      expect(breakpoints.desktop.symbolScale).toBe(1.0);
    });

    test('should have Web3-themed visual effects configured', () => {
      // Requirement 10.3: Implement Web3-themed visual effects
      const effects = symbolRenderer.renderingConfig.web3Effects;
      
      expect(effects.holographic.enabled).toBe(true);
      expect(effects.particles.enabled).toBe(true);
      expect(effects.glow.enabled).toBe(true);
      expect(effects.glow.color).toBe('#00ff88');
    });

    test('should have animation types configured', () => {
      // Requirement 10.2: Build symbol animation engine for spins, wins, and cascades
      const animations = symbolRenderer.animationEngine.animations;
      
      expect(animations.idle).toBeDefined();
      expect(animations.spin).toBeDefined();
      expect(animations.win).toBeDefined();
      expect(animations.cascade).toBeDefined();
      expect(animations.holographic).toBeDefined();
    });
  });

  describe('Rendering Context Creation', () => {
    test('should create WebGL rendering context when available', () => {
      // Requirement 10.1: Create Canvas/WebGL-based symbol renderer
      const context = symbolRenderer.createRenderingContext(mockCanvas);
      
      expect(context).toBeDefined();
      expect(context.renderingMode).toBe('webgl');
      expect(context.canvas).toBe(mockCanvas);
      expect(context.webgl).toBeDefined();
      expect(context.webgl.program).toBeDefined();
      expect(context.webgl.attributes).toBeDefined();
      expect(context.webgl.uniforms).toBeDefined();
    });

    test('should calculate responsive scale correctly', () => {
      // Requirement 10.5: Add responsive design for various screen sizes
      expect(symbolRenderer.calculateResponsiveScale(600)).toBe(0.8); // Mobile
      expect(symbolRenderer.calculateResponsiveScale(900)).toBe(0.9); // Tablet
      expect(symbolRenderer.calculateResponsiveScale(1200)).toBe(1.0); // Desktop
      expect(symbolRenderer.calculateResponsiveScale(2000)).toBe(1.1); // Ultrawide
    });

    test('should store rendering context in map', () => {
      const context = symbolRenderer.createRenderingContext(mockCanvas, { contextId: 'test-context' });
      
      expect(symbolRenderer.renderingContexts.has('test-context')).toBe(true);
      expect(symbolRenderer.renderingContexts.get('test-context')).toBe(context);
    });
  });

  describe('Symbol Rendering', () => {
    let renderingContext;

    beforeEach(() => {
      renderingContext = symbolRenderer.createRenderingContext(mockCanvas, { contextId: 'test-render' });
    });

    test('should render symbol with WebGL', () => {
      const position = { x: 100, y: 100 };
      const animationState = { scale: 1.2, rotation: 45, glow: 0.5 };
      
      symbolRenderer.renderSymbol('test-render', 'btc', position, animationState);
      
      const gl = renderingContext.context;
      expect(gl.useProgram).toHaveBeenCalled();
      expect(gl.uniform2f).toHaveBeenCalled();
      expect(gl.uniformMatrix3fv).toHaveBeenCalled();
      expect(gl.drawArrays).toHaveBeenCalled();
    });

    test('should handle invalid symbol gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      symbolRenderer.renderSymbol('test-render', 'invalid_symbol', { x: 0, y: 0 });
      
      expect(consoleSpy).toHaveBeenCalledWith('Symbol not found: invalid_symbol');
      consoleSpy.mockRestore();
    });
  });

  describe('Animation System', () => {
    let renderingContext;

    beforeEach(() => {
      renderingContext = symbolRenderer.createRenderingContext(mockCanvas, { contextId: 'test-anim' });
    });

    test('should start animation correctly', () => {
      // Requirement 10.2: Build symbol animation engine for spins, wins, and cascades
      const animationId = symbolRenderer.startAnimation('test-anim', 'btc', 'spin', {
        position: { x: 100, y: 100 }
      });
      
      expect(animationId).toBeDefined();
      expect(symbolRenderer.animationStates.has(animationId)).toBe(true);
      
      const animationState = symbolRenderer.animationStates.get(animationId);
      expect(animationState.type).toBe('spin');
      expect(animationState.symbolId).toBe('btc');
      expect(animationState.isActive).toBe(true);
    });

    test('should handle invalid animation type', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const animationId = symbolRenderer.startAnimation('test-anim', 'btc', 'invalid_animation');
      
      expect(animationId).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Animation type not found: invalid_animation');
      consoleSpy.mockRestore();
    });

    test('should interpolate keyframes correctly', () => {
      const keyframes = [
        { time: 0, scale: 1.0, rotation: 0 },
        { time: 0.5, scale: 1.5, rotation: 180 },
        { time: 1.0, scale: 1.0, rotation: 360 }
      ];
      
      const result = symbolRenderer.interpolateKeyframes(keyframes, 0.25, 'linear');
      
      expect(result.scale).toBe(1.25);
      expect(result.rotation).toBe(90);
    });
  });

  describe('Resource Management', () => {
    let renderingContext;

    beforeEach(() => {
      renderingContext = symbolRenderer.createRenderingContext(mockCanvas, { contextId: 'test-cleanup' });
    });

    test('should destroy rendering context and clean up resources', () => {
      // Add some animations
      symbolRenderer.startAnimation('test-cleanup', 'btc', 'spin', { position: { x: 0, y: 0 } });
      
      const initialAnimations = symbolRenderer.animationStates.size;
      
      symbolRenderer.destroyRenderingContext('test-cleanup');
      
      expect(symbolRenderer.renderingContexts.has('test-cleanup')).toBe(false);
      expect(symbolRenderer.animationStates.size).toBeLessThan(initialAnimations);
    });

    test('should provide rendering statistics', () => {
      symbolRenderer.startAnimation('test-cleanup', 'btc', 'spin', { position: { x: 0, y: 0 } });
      
      const stats = symbolRenderer.getRenderingStats();
      
      expect(stats.activeContexts).toBeGreaterThan(0);
      expect(stats.activeAnimations).toBeGreaterThan(0);
      expect(stats.memoryUsage).toBeDefined();
      expect(stats.memoryUsage.contexts).toBeGreaterThan(0);
    });
  });
});