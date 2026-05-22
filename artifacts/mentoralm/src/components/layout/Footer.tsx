import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#080C1A] border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <img src="/logo.png" alt="MentoraLM" className="h-10 w-auto" />
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Your personal AI career counsellor. Navigate your future with personalized, data-driven advice.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/services" className="text-muted-foreground hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/how-it-works" className="text-muted-foreground hover:text-white transition-colors">How it works</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-white transition-colors">About</Link></li>
              <li><Link href="/auth/signin" className="text-muted-foreground hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MentoraLM. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* Social links could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
