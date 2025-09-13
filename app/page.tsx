"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const HomePage = () => {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)

  // Sample images - replace with your actual images
  const images = [
    "/placeholder-chphw.png",
    "/placeholder-2axn7.png",
    "/placeholder-iakrl.png",
    "/hardware-workspace.png",
  ]

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [images.length])

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (servicesRef.current) {
      observer.observe(servicesRef.current)
    }
    // // Run this in the browser console
    // localStorage.removeItem('orders');
    // Object.keys(localStorage).forEach(key => {
    //   if (key.startsWith('orders_')) {
    //     localStorage.removeItem(key);
    //   }
    // });
    // localStorage.removeItem('glonix_orders');
    // console.log('All orders data cleared!');
    // localStorage.clear()

    return () => observer.disconnect()
  }, [])

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  const services = [
    {
      title: "PCB Fabrication",
      description: "High-quality PCB manufacturing with quick turnaround times and precision engineering",
      icon: "🔧",
      path: "/fabrication",
      features: ["Multi-layer PCBs", "Quick turnaround", "Quality assurance"],
    },
    {
      title: "PCB Assembly",
      description: "Professional assembly services with advanced SMT and through-hole capabilities",
      icon: "⚡",
      path: "/assembly",
      features: ["SMT Assembly", "Through-hole", "Testing & QC"],
    },
    {
      title: "Component Sourcing",
      description: "Reliable component procurement from trusted suppliers worldwide",
      icon: "📦",
      path: "/product",
      features: ["Global sourcing", "Quality components", "Cost optimization"],
    },
    {
      title: "Custom Development",
      description: "End-to-end hardware development from concept to production",
      icon: "🚀",
      path: "/designenquiry",
      features: ["Design consultation", "Prototyping", "Production ready"],
    },
  ]

  const handleServiceClick = (path: string) => {
    if (isAuthenticated) {
      router.push(path)
    } else {
      localStorage.setItem("redirectAfterLogin", path)
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">Glonix Electronics</h1>
              <p className="text-xs text-muted-foreground">PCB Solutions & EMS</p>
            </div>
          </div> */}

          {/* <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" onClick={() => router.push("/")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => router.push("/about")}>
              About
            </Button>
            <Button variant="ghost">Services</Button>
            <Button variant="ghost">Contact</Button>
          </nav> */}

          
        </div>

      {/* Hero Section with 3D Animation */}
      <section ref={heroRef} className="relative overflow-hidden gradient-tech">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        {/* Floating 3D Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-secondary/20 rounded-full animate-float"></div>
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-primary/20 rounded-lg animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent/20 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-up">
              <Badge variant="secondary" className="w-fit">
                🚀 Trusted by 500+ Companies
              </Badge>

              <div>
                <h1 className="font-heading font-bold text-5xl lg:text-6xl text-foreground leading-tight">
                  Professional
                  <span className="text-primary block">PCB Solutions</span>
                  <span className="text-secondary">& EMS Services</span>
                </h1>
                <p className="text-xl text-muted-foreground mt-6 leading-relaxed">
                  From concept to production - we deliver high-quality PCB fabrication, assembly, and custom hardware
                  development services for startups to global OEMs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* <Button size="lg" className="animate-pulse-glow" onClick={() => handleServiceClick("/fabrication")}>
                  Start Your Project
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push("/about")}>
                  Learn More
                </Button> */}
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="font-heading font-bold text-2xl text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-bold text-2xl text-primary">24h</div>
                  <div className="text-sm text-muted-foreground">Quick Turnaround</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-bold text-2xl text-primary">99%</div>
                  <div className="text-sm text-muted-foreground">Quality Rate</div>
                </div>
              </div>
            </div>

            {/* 3D Carousel */}
            <div className="relative">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-2xl">
                <div
                  className="flex transition-transform duration-700 ease-in-out h-full"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {images.map((img, index) => (
                    <div key={index} className="w-full flex-shrink-0 h-full">
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`PCB Service ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Modern Navigation Dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex ? "bg-secondary w-8" : "bg-white/50 hover:bg-white/75"
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Our Services
            </Badge>
            <h2 className="font-heading font-bold text-4xl text-foreground mb-4">
              Complete Electronics Manufacturing Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide end-to-end electronics manufacturing services with precision, reliability, and innovation at
              every step.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card
                key={service.title}
                className={`group cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-2 border-border/50 hover:border-primary/50 ${
                  isVisible ? "animate-slide-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleServiceClick(service.path)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <CardTitle className="font-heading text-xl text-card-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-center">{service.description}</CardDescription>
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Learn More →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      CTA Section
      <section className="py-20 gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-4xl mb-6">Ready to Start Your Next Project?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Get in touch with our expert team for a free consultation and quote. Let's bring your electronics vision to
            life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => router.push("/contact")}>
              Get Free Quote
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              onClick={() => router.push("/about")}
            >
              Learn About Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
