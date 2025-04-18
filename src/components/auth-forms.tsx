import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { userService } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'

export function AuthForms() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { login } = useAuth()

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      const response = isLogin 
        ? await userService.loginWithGoogle()
        : await userService.signUpWithGoogle()

      if (response.success) {
        // After OAuth redirect, handleAuthCallback will be called
        // No need to navigate here as the OAuth flow will handle it
      } else {
        throw new Error(response.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check for empty fields first
    if (!email.trim() || !password.trim()) {
      if (!email.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter your email address',
          variant: 'destructive',
        })
      }
      if (!password.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter your password',
          variant: 'destructive',
        })
      }
      return
    }

    // Then validate email format and password length
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      if (isLogin) {
        const result = await userService.loginUser({ email, password })
        if (!result.success) throw new Error(result.error)
        
        if (result.user) {
          login(result.user)
          const isAdmin = result.user.profile?.is_admin || false
          toast({
            title: 'Success',
            description: `You have successfully logged in as ${isAdmin ? 'admin' : 'user'}!`,
          })
          const from = location.state?.from?.pathname || '/'
          navigate(from, { replace: true })
        }
      } else {
        const result = await userService.registerUser({ email, password })
        if (!result.success) throw new Error(result.error)
        
        toast({
          title: 'Success',
          description: 'Please check your email to verify your account',
        })
        setIsLogin(true)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{isLogin ? 'Login' : 'Register'}</h1>
        <p className="text-gray-500">
          {isLogin
            ? 'Enter your credentials to access your account'
            : 'Create a new account to get started'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleAuth}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {isLogin ? 'Login with Google' : 'Sign up with Google'}
      </Button>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => setIsLogin(!isLogin)}
          disabled={isLoading}
        >
          {isLogin
            ? "Don't have an account? Register"
            : 'Already have an account? Login'}
        </Button>
      </div>
    </div>
  )
} 