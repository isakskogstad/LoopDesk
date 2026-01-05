"use client";

import { useState, useEffect } from "react";
import { X, Newspaper, Building2, Bell, Rss, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "news",
    title: "Följ nyheter i realtid",
    description: "Lägg till RSS-källor och bevaka nyheter från de medier du bryr dig om. Filtrera på bolag och nyckelord.",
    icon: <Newspaper className="w-8 h-8" />,
    action: { label: "Utforska nyheter", href: "/nyheter" },
  },
  {
    id: "companies",
    title: "Bevaka bolag",
    description: "Håll koll på hundratals svenska bolag med finansiell data, ägande och kungörelser.",
    icon: <Building2 className="w-8 h-8" />,
    action: { label: "Se bevakningslistan", href: "/bevakning" },
  },
  {
    id: "alerts",
    title: "Få notiser",
    description: "Skapa nyckelord för att markera artiklar som matchar dina intressen automatiskt.",
    icon: <Bell className="w-8 h-8" />,
  },
  {
    id: "feeds",
    title: "Anpassa dina källor",
    description: "Lägg till egna RSS-flöden eller importera från Folo/FreshRSS för en personlig nyhetsupplevelse.",
    icon: <Rss className="w-8 h-8" />,
  },
];

const STORAGE_KEY = "loopdesk_onboarding_completed";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay for smoother UX
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Stäng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className={`transition-opacity duration-150 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center mb-3">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-center mb-8 leading-relaxed">
            {step.description}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {step.action?.href ? (
              <Button asChild className="w-full">
                <a href={step.action.href}>
                  {step.action.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full">
                {isLastStep ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Kom igång
                  </>
                ) : (
                  <>
                    Nästa
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}

            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Hoppa över introduktionen
              </button>
            )}
          </div>
        </div>

        {/* Step indicator */}
        <div className="onboarding-step-indicator">
          {ONBOARDING_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`onboarding-step-dot ${index === currentStep ? "active" : ""}`}
              aria-label={`Steg ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to reset onboarding (for testing/settings)
 */
export function useResetOnboarding() {
  return () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };
}
