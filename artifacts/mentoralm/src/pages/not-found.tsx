import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7B3FE4]/8 blur-[150px]" />
      </div>
      <main className="flex-1 flex items-center justify-center relative z-10 px-6">
        <div className="text-center max-w-md">
          <div className="text-[120px] font-extrabold leading-none text-gradient mb-4 select-none">404</div>
          <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
          <p className="text-muted-foreground mb-10">
            The page you're looking for doesn't exist. It may have been moved or never existed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="bg-gradient-primary border-0 hover:opacity-90">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button variant="outline" className="border-border" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
