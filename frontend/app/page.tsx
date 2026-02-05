import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Auth App</h1>
        <div className="space-x-4">
          <Link href="/login">
            <Button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
