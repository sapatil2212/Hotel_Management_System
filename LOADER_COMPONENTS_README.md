# Reusable Loader & Success Modal Components

This document describes the reusable loader and success modal components that have been implemented to improve user experience during authentication and other async operations.

## Components Overview

### 1. Loader Component (`components/ui/loader.tsx`)

A comprehensive loader component with multiple variants for different use cases.

#### Main Loader
```tsx
import { Loader } from "@/components/ui/loader"

<Loader 
  show={isLoading} 
  message="Processing your request..."
  variant="primary"
  size="lg"
/>
```

#### Props
- `show: boolean` - Controls visibility
- `message?: string` - Loading message
- `fullscreen?: boolean` - Fullscreen overlay (default: true)
- `size?: "sm" | "md" | "lg"` - Loader size (default: "md")
- `variant?: "default" | "primary" | "secondary"` - Color variant (default: "default")
- `className?: string` - Additional CSS classes

### 2. InlineLoader Component

For small inline loading indicators.

```tsx
import { InlineLoader } from "@/components/ui/loader"

<InlineLoader 
  show={isLoading} 
  message="Processing..."
  variant="primary"
  size="sm"
/>
```

### 3. ButtonLoader Component

Perfect for buttons during form submissions.

```tsx
import { ButtonLoader } from "@/components/ui/loader"

<Button disabled={isLoading}>
  <ButtonLoader 
    show={isLoading} 
    loadingText="Submitting..."
  >
    Submit Form
  </ButtonLoader>
</Button>
```

### 4. SuccessModal Component (`components/ui/success-modal.tsx`)

A centered success modal with customizable content.

```tsx
import { SuccessModal } from "@/components/ui/success-modal"

<SuccessModal
  open={showSuccess}
  onOpenChange={setShowSuccess}
  title="Success!"
  description="Your action was completed successfully."
  onConfirm={() => router.push('/dashboard')}
  confirmText="Continue"
  showIcon={true}
/>
```

#### Props
- `open: boolean` - Controls modal visibility
- `onOpenChange: (open: boolean) => void` - Change handler
- `title: string` - Modal title
- `description: string` - Modal description
- `onConfirm?: () => void` - Confirm action handler
- `confirmText?: string` - Confirm button text (default: "Continue")
- `onCancel?: () => void` - Cancel action handler
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `showIcon?: boolean` - Show success icon (default: true)
- `className?: string` - Additional CSS classes

## Usage Examples

### Authentication Flow

#### Registration with OTP
```tsx
const [isPending, startTransition] = useTransition()
const [successOpen, setSuccessOpen] = useState(false)

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  startTransition(async () => {
    try {
      await requestOtp()
      toast({ title: "OTP sent", description: `We sent a code to ${email}` })
      setStep("verify")
    } catch (err: any) {
      setError(err.message)
    }
  })
}

return (
  <div>
    <Loader 
      show={isPending} 
      message="Sending OTP to your email..."
      variant="primary"
      size="lg"
    />
    
    <Button type="submit" disabled={isPending}>
      <ButtonLoader 
        show={isPending} 
        loadingText="Sending..."
      >
        Request OTP
      </ButtonLoader>
    </Button>

    <SuccessModal
      open={successOpen}
      onOpenChange={setSuccessOpen}
      title="Account Created Successfully!"
      description="Your account has been created successfully."
      onConfirm={() => router.push('/auth/sign-in')}
      confirmText="Go to Sign In"
    />
  </div>
)
```

#### Login Process
```tsx
const [isPending, startTransition] = useTransition()

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  startTransition(async () => {
    const res = await login(email, password)
    if (res?.error) {
      setError("Invalid credentials")
      return
    }
    router.push("/dashboard")
  })
}

return (
  <div>
    <Loader 
      show={isPending} 
      message="Signing you in..."
      variant="primary"
      size="lg"
    />
    
    <Button type="submit" disabled={isPending}>
      <ButtonLoader 
        show={isPending} 
        loadingText="Signing in..."
      >
        Sign In
      </ButtonLoader>
    </Button>
  </div>
)
```

### Other Use Cases

#### Data Fetching
```tsx
const [isLoading, setIsLoading] = useState(false)

const fetchData = async () => {
  setIsLoading(true)
  try {
    await apiCall()
  } finally {
    setIsLoading(false)
  }
}

return (
  <div>
    <Loader show={isLoading} message="Loading data..." />
    <Button onClick={fetchData} disabled={isLoading}>
      <ButtonLoader show={isLoading} loadingText="Loading...">
        Load Data
      </ButtonLoader>
    </Button>
  </div>
)
```

#### Form Submission
```tsx
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async (data: FormData) => {
  setIsSubmitting(true)
  try {
    await submitForm(data)
    setSuccessOpen(true)
  } finally {
    setIsSubmitting(false)
  }
}

return (
  <form onSubmit={handleSubmit}>
    <Button type="submit" disabled={isSubmitting}>
      <ButtonLoader 
        show={isSubmitting} 
        loadingText="Saving..."
      >
        Save Changes
      </ButtonLoader>
    </Button>
  </form>
)
```

## Best Practices

1. **Use fullscreen loaders** for major operations like authentication, data fetching, or file uploads
2. **Use inline loaders** for small operations or status indicators
3. **Use button loaders** for form submissions to provide immediate feedback
4. **Always disable buttons** when loading to prevent multiple submissions
5. **Provide clear, descriptive messages** that explain what's happening
6. **Use success modals** for important confirmations or redirects
7. **Keep loading states consistent** across your application

## Styling Customization

All components support custom styling through the `className` prop and use Tailwind CSS classes. The components are designed to work with the existing design system and theme.

## Accessibility

- All loaders include proper ARIA attributes (`role="status"`, `aria-live="polite"`, `aria-busy="true"`)
- Success modals are keyboard accessible and support screen readers
- Loading states are properly announced to assistive technologies

## Demo

See `components/ui/loader-demo.tsx` for a comprehensive example of all loader variants and usage patterns.
