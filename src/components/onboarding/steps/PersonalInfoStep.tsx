'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  useOnboardingStore,
  OnboardingStep,
} from '@/lib/stores/onboardingStore'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import {
  getStepFieldHelperText,
  getStepFieldLabel,
  getStepFieldPlaceholder,
  isStepFieldEnabled,
  isStepFieldRequired,
} from '@/components/onboarding/stepContent'

interface StepProps {
  stepConfig: OnboardingStep
}

const countryOptions = [
  { label: '+1', value: '+1' },
  { label: '+1-242', value: '+1-242' },
  { label: '+1-246', value: '+1-246' },
  { label: '+1-876', value: '+1-876' },
  { label: '+1-868', value: '+1-868' },
]

export function PersonalInfoStep({ stepConfig }: StepProps) {
  const router = useRouter()
  const { currentStepIndex, formData, setFormData, goNext, goBack } = useOnboardingStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { title, subtitle } = stepConfig.content
  const showFirstName = isStepFieldEnabled(stepConfig, 'firstName')
  const showLastName = isStepFieldEnabled(stepConfig, 'lastName')
  const showPhone = isStepFieldEnabled(stepConfig, 'phone')
  const showEmail = isStepFieldEnabled(stepConfig, 'email')
  const showPasswordField = isStepFieldEnabled(stepConfig, 'password')
  const showConfirmPasswordField = isStepFieldEnabled(stepConfig, 'confirmPassword')
  const firstNameRequired = isStepFieldRequired(stepConfig, 'firstName', true)
  const lastNameRequired = isStepFieldRequired(stepConfig, 'lastName', true)
  const emailRequired = isStepFieldRequired(stepConfig, 'email', true)
  const passwordRequired = isStepFieldRequired(stepConfig, 'password', true)
  const confirmPasswordRequired = isStepFieldRequired(
    stepConfig,
    'confirmPassword',
    true,
  )

  const schema = z
    .object({
      firstName:
        showFirstName && firstNameRequired
          ? z.string().min(1, 'Please enter your first name')
          : z.string().optional(),
      lastName:
        showLastName && lastNameRequired
          ? z.string().min(1, 'Please enter your last name')
          : z.string().optional(),
      countryCode: z.string().optional(),
      phone: z.string().optional(),
      email:
        showEmail && emailRequired
          ? z.string().min(1, 'Please enter your email').email('Invalid email')
          : z.string().optional(),
      password:
        showPasswordField && passwordRequired
          ? z.string().min(6, 'Password too short')
          : z.string().optional(),
      confirmPassword:
        showConfirmPasswordField && confirmPasswordRequired
          ? z.string().min(1, 'Please confirm your password')
          : z.string().optional(),
      agreePolicy: z
        .boolean()
        .refine(val => val === true, 'You must agree to the Privacy Policy'),
      agreeTerms: z
        .boolean()
        .refine(val => val === true, 'You must agree to the Terms of Service'),
    })
    .refine(
      data =>
        !showPasswordField ||
        !showConfirmPasswordField ||
        data.password === data.confirmPassword,
      {
        message: "Passwords don't match",
        path: ['confirmPassword'],
      },
    )

  type FormDataSchema = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormDataSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      countryCode: formData.countryCode || '+1',
      email: formData.email || '',
      phone: formData.phone || '',
      agreePolicy: false,
      agreeTerms: false,
    },
  })

  const onSubmit = (data: FormDataSchema) => {
    setFormData({
      ...data,
      countryCode: data.countryCode || '+1',
    })
    goNext()
  }

  const agreePolicy = watch('agreePolicy')
  const agreeTerms = watch('agreeTerms')
  const handleGoogleSignUp = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (!apiBaseUrl) {
      return
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('pending-google-onboarding', '1')
    }

    window.location.href = `${apiBaseUrl}/auth/google`
  }

  return (
    <div className="auth-card animate-in w-full p-8 duration-500 fade-in slide-in-from-bottom-4 md:p-10">
      <div className="mb-8 text-center">
        <h2 className="auth-title mb-3">
          {(title || 'Create Your Account').replace(/0+$/, '')}
        </h2>
        <p className="auth-subtitle text-[18px]">
          {subtitle || "Let's get started with your Alora account."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="auth-button-secondary h-12 w-full text-[16px] font-semibold"
        >
          Sign up with Google
        </button>

        {(showFirstName || showLastName) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {showFirstName && (
              <div className="flex flex-col space-y-1.5">
                <label className="auth-label">
                  {getStepFieldLabel(stepConfig, 'firstName', 'First Name')}
                  {isStepFieldRequired(stepConfig, 'firstName', true) && (
                    <span className="text-[#E8825A]">*</span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder={getStepFieldPlaceholder(
                    stepConfig,
                    'firstName',
                    'Enter your first name',
                  )}
                  {...register('firstName')}
                  className="auth-input"
                />
              </div>
            )}
            {showLastName && (
              <div className="flex flex-col space-y-1.5">
                <label className="auth-label">
                  {getStepFieldLabel(stepConfig, 'lastName', 'Last Name')}
                  {isStepFieldRequired(stepConfig, 'lastName', true) && (
                    <span className="text-[#E8825A]">*</span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder={getStepFieldPlaceholder(
                    stepConfig,
                    'lastName',
                    'Enter your last name',
                  )}
                  {...register('lastName')}
                  className="auth-input"
                />
              </div>
            )}
          </div>
        )}

        {showPhone && (
          <div className="space-y-1.5">
            <label className="auth-label">
              {getStepFieldLabel(stepConfig, 'phone', 'Phone Number')}
              {isStepFieldRequired(stepConfig, 'phone') && (
                <span className="text-[#E8825A]">*</span>
              )}
            </label>
            <div className="flex gap-4">
              <div className="relative w-[150px] shrink-0">
                <select
                  {...register('countryCode')}
                  className="h-12 w-full appearance-none rounded-lg border border-[#d7dde7] bg-white px-3 pr-10 text-left text-[14px] font-normal leading-[120%] text-[#202124] outline-none transition-colors focus:border-[#8BCCE6]"
                >
                  {countryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#202124]" />
              </div>
              <input
                type="tel"
                placeholder={getStepFieldPlaceholder(stepConfig, 'phone', 'Digits only')}
                inputMode="numeric"
                pattern="[0-9]*"
                {...register('phone', {
                  onChange: event => {
                    setValue('phone', event.target.value.replace(/\D/g, ''))
                  },
                })}
                className="auth-input auth-input-left flex-1 bg-white text-left"
              />
            </div>
            <div className="text-[14px] font-normal leading-[120%] text-[#7b8595]">
              {getStepFieldHelperText(
                stepConfig,
                'phone',
                'Select your island/ area code, then enter digits only',
              )}
            </div>
          </div>
        )}

        {showEmail && (
          <div className="space-y-1.5 pt-1">
            <label className="auth-label">
              {getStepFieldLabel(stepConfig, 'email', 'Email Address')}
              {isStepFieldRequired(stepConfig, 'email', true) && (
                <span className="text-[#E8825A]">*</span>
              )}
            </label>
            <input
              type="email"
              placeholder={getStepFieldPlaceholder(stepConfig, 'email', 'you@gmail.com')}
              {...register('email')}
              className="auth-input"
            />
          </div>
        )}

        {showPasswordField && (
          <div className="space-y-1.5">
            <label className="auth-label">
              {getStepFieldLabel(stepConfig, 'password', 'Password')}
              {isStepFieldRequired(stepConfig, 'password', true) && (
                <span className="text-[#E8825A]">*</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={getStepFieldPlaceholder(stepConfig, 'password', '••••••••')}
                {...register('password')}
                className="auth-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {showConfirmPasswordField && (
          <div className="space-y-1.5">
            <label className="auth-label">
              {getStepFieldLabel(stepConfig, 'confirmPassword', 'Confirm Password')}
              {isStepFieldRequired(stepConfig, 'confirmPassword', true) && (
                <span className="text-[#E8825A]">*</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={getStepFieldPlaceholder(
                  stepConfig,
                  'confirmPassword',
                  'Re-enter your password',
                )}
                {...register('confirmPassword')}
                className="auth-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124]"
                aria-label={
                  showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 px-1 py-2">
          <input type="hidden" {...register('agreePolicy')} />
          <input type="hidden" {...register('agreeTerms')} />

          <label className="group flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={agreePolicy}
              onCheckedChange={checked =>
                setValue('agreePolicy', Boolean(checked), {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              className="size-[18px] rounded border-[#E8825A] data-checked:border-[#E8825A] data-checked:bg-[#E8825A] data-checked:text-white"
            />
            <span className="text-xs font-medium text-[#5f6368] group-hover:text-[#202124]">
              I agree to the{' '}
              <Link
                href="/support/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#202124] underline underline-offset-2 hover:text-[#E8825A]"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <label className="group flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={agreeTerms}
              onCheckedChange={checked =>
                setValue('agreeTerms', Boolean(checked), {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              className="size-[18px] rounded border-[#E8825A] data-checked:border-[#E8825A] data-checked:bg-[#E8825A] data-checked:text-white"
            />
            <span className="text-xs font-medium text-[#5f6368] group-hover:text-[#202124]">
              I agree to the{' '}
              <Link
                href="/support/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#202124] underline underline-offset-2 hover:text-[#E8825A]"
              >
                Terms of Service
              </Link>
              .
            </span>
          </label>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="rounded-lg bg-[#FFF6F4] py-2.5 text-center text-xs font-semibold text-[#E8825A] shadow-sm">
            {Object.values(errors)[0]?.message as React.ReactNode}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (currentStepIndex === 0) {
                router.push('/sign-in')
                return
              }

              goBack()
            }}
            className="auth-button-secondary h-10 px-6"
          >
            Back
          </button>
          <button
            type="submit"
            className="auth-button-primary h-10 px-6"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}
