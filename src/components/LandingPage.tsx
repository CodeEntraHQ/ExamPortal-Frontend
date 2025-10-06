import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  CheckCircle, 
  Moon, 
  Sun,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface LandingPageProps {
  onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: GraduationCap,
      title: "Smart Exam Creation",
      description: "Create comprehensive exams with multiple question types, automated grading, and instant feedback."
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Secure multi-tier access control for superadmins, administrators, and students."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed performance insights, progress tracking, and comprehensive reporting tools."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with encrypted data storage and secure authentication protocols."
    },
    {
      icon: Clock,
      title: "Real-Time Monitoring",
      description: "Live exam monitoring, automatic time management, and instant result processing."
    },
    {
      icon: CheckCircle,
      title: "Automated Grading",
      description: "Intelligent auto-grading system with customizable scoring and detailed feedback."
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Students", icon: Users },
    { value: "500+", label: "Institutions", icon: BookOpen },
    { value: "99.9%", label: "Uptime", icon: TrendingUp },
    { value: "50M+", label: "Exams Completed", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">ExamEntra</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="border-border hover:bg-accent"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button 
              onClick={onLoginClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Next-Generation Exam Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Transform Your Exam Experience
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Comprehensive exam management system with advanced analytics, real-time monitoring, 
            and intelligent automation for educational institutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onLoginClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-border hover:bg-accent px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Modern Exams
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to streamline exam creation, administration, and analysis.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Revolutionize Your Exams?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of educational institutions already using ExamEntra to deliver 
            exceptional exam experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={onLoginClick}
              className="bg-white text-primary hover:bg-white/90 px-8 py-3"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-3"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-card/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold">ExamEntra</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 ExamEntra. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}