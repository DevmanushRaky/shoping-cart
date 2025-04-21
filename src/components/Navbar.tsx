import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa';

export function Navbar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const { setTheme, theme } = useTheme();

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
            {/* Dark/Light mode toggle button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <FaSun className="h-5 w-5 text-yellow-400" />
              ) : (
                <FaMoon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              )}
            </Button>
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