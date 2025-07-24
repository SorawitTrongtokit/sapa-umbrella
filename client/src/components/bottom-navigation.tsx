import { BarChart3, Umbrella, Undo } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export function BottomNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around">
          <Link href="/">
            <button className={`nav-item flex flex-col items-center py-3 px-4 border-t-2 ${
              isActive('/') 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 border-transparent'
            }`}>
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">สถานะ</span>
            </button>
          </Link>
          <Link href="/borrow">
            <button className={`nav-item flex flex-col items-center py-3 px-4 border-t-2 ${
              isActive('/borrow') 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 border-transparent'
            }`}>
              <Umbrella className="w-5 h-5" />
              <span className="text-xs mt-1">ยืม</span>
            </button>
          </Link>
          <Link href="/return">
            <button className={`nav-item flex flex-col items-center py-3 px-4 border-t-2 ${
              isActive('/return') 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-500 border-transparent'
            }`}>
              <Undo className="w-5 h-5" />
              <span className="text-xs mt-1">คืน</span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
