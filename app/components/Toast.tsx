import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  duration?: number;
  onClose: () => void;
};

export function Toast({ message, duration = 2000, onClose }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const ANIMATION_DURATION = 150;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
    }, duration - ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleAnimationEnd = () => {
    if (isLeaving) {
      onClose();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes toastIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes toastOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `}
      </style>
      <div
        style={{
          position: "fixed",
          bottom: "120px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          zIndex: 1000,
          animation: `${
            isLeaving ? "toastOut" : "toastIn"
          } ${ANIMATION_DURATION}ms ease-out`,
          animationFillMode: "forwards",
          pointerEvents: "none",
        }}
        onAnimationEnd={handleAnimationEnd}
      >
        {message}
      </div>
    </>
  );
}
