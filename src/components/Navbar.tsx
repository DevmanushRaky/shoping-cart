import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn, isAdmin, logout } = useAuth();

  console.log('Navbar render - Auth state:', { isLoggedIn, isAdmin });

  const handleLogout = async () => {
    try {
      console.log('Navbar - Calling logout...');
      await logout();
      console.log('Navbar - Logout completed');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Navbar - Logout error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold">
              Shopping Cart
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn && isAdmin && (
              <Link to="/admin">
                <Button variant="outline">Admin</Button>
              </Link>
            )}
            {isLoggedIn ? (
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 