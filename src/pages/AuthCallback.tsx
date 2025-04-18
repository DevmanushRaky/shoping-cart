import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await userService.handleAuthCallback();
        
        if (!result.success) {
          throw new Error(result.error);
        }

        if (result.user) {
          login(result.user);
          const isAdmin = result.user.profile?.is_admin || false;
          toast({
            title: 'Success',
            description: `You have successfully logged in as ${isAdmin ? 'admin' : 'user'}!`,
          });
          navigate('/', { replace: true });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to complete authentication',
          variant: 'destructive',
        });
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, toast, login]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  );
} 