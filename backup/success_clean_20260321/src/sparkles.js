import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

/**
 * Initialize sparkles effect using tsParticles
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - ID of the container element
 * @param {string} [options.background='transparent'] - Background color
 * @param {number} [options.particleSize=1] - Base particle size
 * @param {number} [options.minSize=0.6] - Minimum particle size
 * @param {number} [options.maxSize=1.4] - Maximum particle size
 * @param {number} [options.speed=1] - Particle movement speed
 * @param {string} [options.particleColor='#ffffff'] - Particle color
 * @param {number} [options.particleDensity=120] - Number of particles
 */
export async function initSparkles(options = {}) {
  const {
    containerId,
    background = 'transparent',
    particleSize = 1,
    minSize = 0.6,
    maxSize = 1.4,
    speed = 1,
    particleColor = '#ffffff',
    particleDensity = 120
  } = options;

  // Load tsParticles slim preset
  await loadSlim(tsParticles);

  // Initialize particles
  await tsParticles.load({
    id: containerId,
    options: {
      background: {
        color: {
          value: background,
        },
      },
      fullScreen: {
        enable: false,
        zIndex: 1,
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: false,
            mode: "repulse",
          },
          resize: {
            enable: true,
            delay: 0.5,
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: particleColor,
        },
        move: {
          enable: true,
          speed: speed,
          direction: "none",
          random: false,
          straight: false,
          outModes: {
            default: "out",
          },
        },
        number: {
          value: particleDensity,
          density: {
            enable: true,
          },
        },
        opacity: {
          value: {
            min: 0.1,
            max: 1,
          },
          animation: {
            enable: true,
            speed: 3,
            sync: false,
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: {
            min: minSize,
            max: maxSize,
          },
        },
      },
      detectRetina: true,
    },
  });
}
