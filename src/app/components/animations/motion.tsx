import { Variants } from "motion/react";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

export const slideInFromRight: Variants = {
  hidden: { x: "100%" },
  visible: { x: "0%", transition: { duration: 0.4, ease: "easeInOut" } },
};

export const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
};

export const zoomIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const zoomOut: Variants = {
  hidden: { scale: 1.2, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export const rotateIn: Variants = {
  hidden: { rotate: -90, opacity: 0 },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export const slideInFromLeft: Variants = {
  hidden: { x: "-100%" },
  visible: { x: "0%", transition: { duration: 0.8, ease: "easeInOut" } },
};

export const bounce: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [0, -20, 0],
    transition: {
      duration: 0.6,
      ease: "easeOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

export const scaleOnHover: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 35,
    },
  },
};

export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

export const sidebarSlide: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: "0%",
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 30,
    },
  },
};

export const carouselItemEnter: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

export const carouselTransition = {
  type: "spring" as const,
  stiffness: 140,
  damping: 18,
  mass: 0.6,
};

export const carouselRing: Variants = {
  left: {
    x: "-50%",
    y: "6%",
    scale: 0.86,
    opacity: 0.65,
    zIndex: 1,
    transition: carouselTransition,
  },
  center: {
    x: "0%",
    y: "-30%",
    scale: 1,
    opacity: 1,
    zIndex: 3,
    transition: carouselTransition,
  },
  right: {
    x: "50%",
    y: "6%",
    scale: 0.9,
    opacity: 0.8,
    zIndex: 2,
    transition: carouselTransition,
  },
  back: {
    x: "0%",
    y: "62%",
    scale: 0.8,
    opacity: 0,
    zIndex: 0,
    transition: carouselTransition,
  },
};

export const hCarouselSlide: Variants = {
  enter: { x: "100%", opacity: 0 },
  center: { x: "0%", opacity: 1, transition: carouselTransition },
  exit: { x: "-100%", opacity: 0, transition: carouselTransition },
};

export const bgFloat: Variants = {
  hidden: { opacity: 0.95, y: 0 },
  visible: {
    opacity: 1,
    y: [0, -8, 0, 6, 0],
    transition: {
      duration: 8,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

export const sunBounceRotate: Variants = {
  hidden: { y: 0, rotate: 0 },
  visible: {
    y: [0, -14, 0],
    rotate: [0, 6, 0, -6, 0],
    transition: {
      duration: 2.4,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

export const chevronRotate: Variants = {
  closed: { rotate: 0 },
  open: { rotate: 180, transition: { duration: 0.28, ease: "easeInOut" } },
};

export const dropdownMenu: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};
