"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ArrowLeft, Phone, Mail, MapPin, Clock, Send, CheckCircle, Globe, Building } from "lucide-react"

function ContactContent() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Numbers",
      details: ["9444312035", "9944237235", "044-43189299"],
      color: "bg-green-500",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Address",
      details: ["info@glonix.in"],
      color: "bg-blue-500",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Website",
      details: ["www.glonix.in"],
      color: "bg-purple-500",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Head Office",
      details: ["Plot No.54, SF1, Raj Elegance", "Anna Nagar 2nd Street, Tansi Nagar", "Velachery, Chennai - 600042"],
      color: "bg-orange-500",
    },
  ]

  const offices = [
    { city: "Chennai", country: "India", type: "Head Office", status: "Primary" },
    { city: "Bangalore", country: "India", type: "Branch Office", status: "Active" },
    { city: "China", country: "China", type: "International", status: "Partner" },
    { city: "Germany", country: "Germany", type: "International", status: "Partner" },
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-slate-900 mb-4">Message Sent Successfully!</h2>
            <p className="text-slate-600 mb-8">
              Thank you for contacting Glonix Electronics. We'll get back to you within 24 hours.
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
                Send Another Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Contact Glonix Electronics
          </Badge>
          <h1 className="font-heading font-bold text-4xl lg:text-5xl text-slate-900 mb-6">Let's Start Your Project</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Ready to bring your electronics project to life? Get in touch with our expert team for a free consultation
            and quote. We're here to help turn your ideas into reality.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Form */}
          <div>
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-slate-900">Send us a Message</CardTitle>
                <CardDescription className="text-slate-600">
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-slate-700 font-medium">
                        Company
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Your company name"
                        value={formData.company}
                        onChange={handleChange}
                        className="h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700 font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-slate-700 font-medium">
                      Service Interest
                    </Label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full h-12 px-3 border border-slate-200 rounded-md focus:border-cyan-500 focus:ring-cyan-500 bg-white"
                    >
                      <option value="">Select a service</option>
                      <option value="pcb-fabrication">PCB Fabrication</option>
                      <option value="pcb-assembly">PCB Assembly</option>
                      <option value="component-sourcing">Component Sourcing</option>
                      <option value="design-development">Design & Development</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-700 font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your project requirements..."
                      value={formData.message}
                      onChange={handleChange}
                      className="min-h-32 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-cyan-600 to-lime-600 hover:from-cyan-700 hover:to-lime-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading font-bold text-2xl text-slate-900 mb-6">Contact Information</h2>
              <div className="grid gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={info.title} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}
                        >
                          {info.icon}
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">{info.title}</h3>
                          <div className="space-y-1">
                            {info.details.map((detail, idx) => (
                              <p key={idx} className="text-slate-600">
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading font-bold text-2xl text-slate-900 mb-6">Our Locations</h2>
              <div className="grid gap-4">
                {offices.map((office, index) => (
                  <Card
                    key={`${office.city}-${office.country}`}
                    className="shadow-lg border-0 bg-white/80 backdrop-blur-sm"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-lime-500 rounded-lg flex items-center justify-center text-white">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {office.city}, {office.country}
                            </h3>
                            <p className="text-sm text-slate-600">{office.type}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {office.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="shadow-lg border-0 bg-gradient-to-r from-cyan-600 to-lime-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6" />
                  <h3 className="font-heading font-semibold text-lg">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm opacity-90">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                  <p>Saturday: 9:00 AM - 1:00 PM IST</p>
                  <p>Sunday: Closed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <ProtectedRoute>
      <ContactContent />
    </ProtectedRoute>
  )
}
