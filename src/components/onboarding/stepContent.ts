import { OnboardingField, OnboardingStep } from '@/lib/stores/onboardingStore'

export const getStepField = (
  stepConfig: OnboardingStep,
  key: string,
): OnboardingField | undefined =>
  stepConfig.content.fields?.find(field => field.key === key)

export const isStepFieldEnabled = (
  stepConfig: OnboardingStep,
  key: string,
  fallback = true,
) => getStepField(stepConfig, key)?.enabled ?? fallback

export const getStepFieldLabel = (
  stepConfig: OnboardingStep,
  key: string,
  fallback: string,
) => getStepField(stepConfig, key)?.label || fallback

export const getStepFieldPlaceholder = (
  stepConfig: OnboardingStep,
  key: string,
  fallback: string,
) => getStepField(stepConfig, key)?.placeholder || fallback

export const getStepFieldHelperText = (
  stepConfig: OnboardingStep,
  key: string,
  fallback = '',
) => getStepField(stepConfig, key)?.helperText || fallback

export const isStepFieldRequired = (
  stepConfig: OnboardingStep,
  key: string,
  fallback = false,
) => getStepField(stepConfig, key)?.required ?? fallback
