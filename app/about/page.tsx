"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Award,
  Target,
  Heart,
  Lightbulb,
  Shield,
  Star,
} from "lucide-react"

function AboutContent() {
  const router = useRouter()

  const coreValues = [
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Innovation",
      description: "We thrive on turning new ideas into impactful electronic solutions.",
      color: "bg-yellow-500",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Quality",
      description: "We adhere to international design and manufacturing standards to ensure reliability.",
      color: "bg-cyan-500",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Integrity",
      description: "We believe in honest communication, ethical practices, and building trust.",
      color: "bg-green-500",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Customer Focus",
      description: "Every product is tailored with the end-user in mind.",
      color: "bg-blue-500",
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Excellence",
      description: "From design to delivery, we strive for perfection in everything we do.",
      color: "bg-purple-500",
    },
  ]

  const milestones = [
    {
      year: "2017",
      title: "Company Founded",
      description: "Glonix Electronics Private Limited was established in Salem, Tamil Nadu",
    },
    {
      year: "2017-2022",
      title: "Incubation Period",
      description: "Incubated at Anna University Incubation Cell, Guindy, developing our expertise",
    },
    {
      year: "2022",
      title: "New Headquarters",
      description: "Moved to our head office in Velachery, Chennai, expanding our operations",
    },
    {
      year: "2024",
      title: "Global Reach",
      description: "Serving clients across Chennai, Bangalore, China, and Germany",
    },
  ]

  const locations = [
    { city: "Chennai", country: "India", type: "Head Office" },
    { city: "Bangalore", country: "India", type: "Branch Office" },
    { city: "China", country: "China", type: "International" },
    { city: "Germany", country: "Germany", type: "International" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            About Glonix Electronics
          </Badge>
          <h1 className="font-heading font-bold text-4xl lg:text-5xl text-slate-900 mb-6">
            Bridging Innovation with Execution
          </h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Glonix Electronics Private Limited is a fast-evolving electronics company based in India, focused on
            Electronic Product Development and Electronic Manufacturing Services (EMS). We specialize in delivering
            high-quality PCB Fabrication, PCB Assembly, Component Sourcing, and Custom Hardware Development for clients
            across industries — from startups to global OEMs.
          </p>
        </div>

        {/* Company Story */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-slate-700">
              <p>
                Founded in November 2017 in Salem, Tamil Nadu, Glonix Electronics began its journey with a vision to
                revolutionize electronics manufacturing in India. Our early years were spent at the prestigious Anna
                University Incubation Cell in Guindy, where we honed our expertise and built the foundation for what
                would become a trusted name in the electronics industry.
              </p>
              <p>
                In April 2022, we moved to our current head office in Velachery, Chennai, marking a new chapter in our
                growth story. Today, we operate with a team of highly skilled engineers who provide solutions that are
                cost-effective, reliable, and tailored to specific client needs.
              </p>
              <p>
                We take pride in our ability to turn concepts and functional diagrams into fully operational,
                production-ready electronics — truly bridging innovation with execution.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-cyan-700">
                  <Target className="h-6 w-6" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  To become a trusted global leader in electronics product design and manufacturing, delivering
                  intelligent, reliable, and scalable solutions that shape the future of technology.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lime-600">
                  <Heart className="h-6 w-6" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-slate-700">
                  <p>1. To enable innovation through efficient and precise electronic product development.</p>
                  <p>2. To deliver end-to-end EMS solutions with uncompromising quality and speed.</p>
                  <p>
                    3. To foster long-term partnerships by exceeding customer expectations through transparency,
                    commitment, and technical excellence.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-slate-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <Card
                key={value.title}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`mx-auto w-16 h-16 ${value.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {value.icon}
                  </div>
                  <CardTitle className="font-heading text-xl text-slate-900">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-slate-600">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">Our Journey</h2>
            <p className="text-xl text-slate-600">Key milestones in our growth story</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-cyan-500 to-lime-500 rounded-full"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-sm font-bold">
                            {milestone.year}
                          </Badge>
                        </div>
                        <CardTitle className="font-heading text-lg text-slate-900">{milestone.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-slate-600">{milestone.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-white border-4 border-cyan-500 rounded-full"></div>
                  </div>

                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Presence */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">Global Presence</h2>
            <p className="text-xl text-slate-600">Serving clients worldwide from multiple locations</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {locations.map((location, index) => (
              <Card
                key={`${location.city}-${location.country}`}
                className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-cyan-500 to-lime-500 rounded-xl flex items-center justify-center text-white mb-3">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-heading text-lg text-slate-900">{location.city}</CardTitle>
                  <CardDescription className="text-slate-600">{location.country}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-xs">
                    {location.type}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-cyan-600 to-lime-600 rounded-3xl p-12 text-white text-center">
          <h2 className="font-heading font-bold text-3xl mb-6">Get in Touch</h2>
          <p className="text-xl mb-8 opacity-90">
            Ready to start your next electronics project? Contact our expert team today.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Phone className="h-6 w-6" />
              </div>
              <div className="text-sm opacity-90">Phone</div>
              <div className="font-semibold">9444312035 | 9944237235</div>
              <div className="font-semibold">044-43189299</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Mail className="h-6 w-6" />
              </div>
              <div className="text-sm opacity-90">Email</div>
              <div className="font-semibold">info@glonix.in</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Globe className="h-6 w-6" />
              </div>
              <div className="text-sm opacity-90">Website</div>
              <div className="font-semibold">www.glonix.in</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm opacity-90 mb-2">Head Office Address</p>
            <p className="font-semibold">
              Plot No.54, SF1, Raj Elegance, Anna Nagar 2nd Street,
              <br />
              Tansi Nagar, Velachery, Chennai - 600042
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push("/contact")}
              className="bg-white text-cyan-700 hover:bg-slate-100"
            >
              Contact Us
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              View Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <ProtectedRoute>
      <AboutContent />
    </ProtectedRoute>
  )
}
