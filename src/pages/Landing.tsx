import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Award } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary py-12 md:py-20 px-4 text-primary-foreground">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 animate-fade-in">
            <img src="logo.png" alt="Foundation School Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm object-cover" />
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              CEAC Foundation School
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-foreground/90 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Build your future with our programs
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="bg-accent text-accent-foreground border border-accent-foreground hover:bg-accent-foreground hover:text-accent hover:border-accent transition-colors text-base sm:text-lg md:text-xl w-full sm:w-auto"
            >
              Register Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 text-base sm:text-lg md:text-xl w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-foreground">
            Why Choose Us?
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-card p-4 md:p-6 rounded-lg border border-border hover-scale text-center sm:text-left">
              <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-primary mb-3 md:mb-4 mx-auto sm:mx-0" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-card-foreground">Expert Curriculum</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Quality courses for strong foundations
              </p>
            </div>
            <div className="bg-card p-4 md:p-6 rounded-lg border border-border hover-scale text-center sm:text-left">
              <Users className="w-10 h-10 md:w-12 md:h-12 text-secondary mb-3 md:mb-4 mx-auto sm:mx-0" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-card-foreground">Qualified Teachers</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Expert educators committed to success
              </p>
            </div>
            <div className="bg-card p-4 md:p-6 rounded-lg border border-border hover-scale sm:col-span-2 md:col-span-1 text-center sm:text-left">
              <Award className="w-10 h-10 md:w-12 md:h-12 text-accent mb-3 md:mb-4 mx-auto sm:mx-0" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-card-foreground">Certification</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Recognized certificates on completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-6 md:py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p className="text-sm md:text-base">© {new Date().getFullYear()} CEAC Foundation School. All rights reserved.</p>
          <p className="mt-2 text-xs">
            Proprietary software. Unauthorized use is prohibited.
          </p>
          <p className="mt-1 text-xs">Contact admin for licensing inquiries.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
