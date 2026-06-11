import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  Clock,
  Shield,
  Zap,
  BarChart3,
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  Play,
  Users,
  Globe,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: Upload,
    title: "Auto Upload",
    description:
      "Seamlessly upload videos from Google Drive to YouTube with zero manual intervention.",
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description:
      "Schedule your videos with precise date and time controls for optimal audience reach.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Manage team access with granular permissions. Admins approve, users create.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Tracking",
    description:
      "Monitor every upload in real-time. Track status from pending to published.",
  },
  {
    icon: Zap,
    title: "Automated Thumbnails",
    description:
      "Auto-detect and set custom thumbnails from your Drive folder.",
  },
  {
    icon: Globe,
    title: "Google Sheets Integration",
    description:
      "Use Google Sheets as your content management hub. Simple, familiar, powerful.",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect Your Accounts",
    description:
      "Link your Google account to access Drive, Sheets, and YouTube in one click.",
  },
  {
    step: "02",
    title: "Add Videos to Your Sheet",
    description:
      "Fill in video details, titles, descriptions, and schedule dates in your Google Sheet.",
  },
  {
    step: "03",
    title: "Sit Back & Watch",
    description:
      "Our system polls your sheet, downloads videos, uploads to YouTube, and sets thumbnails automatically.",
  },
];

const stats = [
  { value: "10K+", label: "Videos Published" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 5min", label: "Avg. Processing" },
  { value: "24/7", label: "Automated" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                <PlayCircle className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-surface-900">
                AutoPublish
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
                How It Works
              </a>
              <a href="#stats" className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
                Stats
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary-100/50 blur-3xl" />
          <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-primary-200/30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-200 px-4 py-1.5 text-sm font-medium text-primary-700 mb-6">
                <Sparkles className="h-4 w-4" />
                Automate Your YouTube Workflow
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-heading text-5xl font-extrabold tracking-tight text-surface-950 sm:text-6xl lg:text-7xl"
            >
              Publish to YouTube
              <span className="block text-primary-600">On Autopilot</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg leading-8 text-surface-600 sm:text-xl"
            >
              Connect Google Drive, manage through Sheets, and let AutoPublish
              handle the rest. Schedule, upload, and track your videos
              effortlessly.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register">
                <Button size="xl" className="w-full sm:w-auto">
                  Start Publishing Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Play className="h-5 w-5" />
                  See How It Works
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 sm:mt-20"
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-2xl border border-surface-200 bg-surface-50 p-2 shadow-2xl shadow-surface-200/50">
                <div className="rounded-xl bg-white border border-surface-100 overflow-hidden">
                  {/* Mock dashboard header */}
                  <div className="flex items-center gap-2 border-b border-surface-100 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="ml-4 flex-1 rounded-md bg-surface-50 px-3 py-1 text-xs text-surface-400">
                      autopublish.app/dashboard
                    </div>
                  </div>
                  {/* Mock content */}
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[
                        { label: "Published", value: "124", color: "bg-emerald-500" },
                        { label: "Scheduled", value: "18", color: "bg-blue-500" },
                        { label: "Pending", value: "7", color: "bg-amber-500" },
                        { label: "Processing", value: "2", color: "bg-primary-500" },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="rounded-lg border border-surface-100 p-4"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${color}`} />
                            <span className="text-xs text-surface-500">{label}</span>
                          </div>
                          <p className="mt-1 font-heading text-2xl font-bold text-surface-900">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 rounded-lg border border-surface-100 p-3"
                        >
                          <div className="h-10 w-16 rounded bg-surface-100" />
                          <div className="flex-1">
                            <div className="h-3 w-48 rounded bg-surface-100" />
                            <div className="mt-2 h-2 w-32 rounded bg-surface-50" />
                          </div>
                          <div className="h-6 w-20 rounded-full bg-emerald-100" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-surface-100 bg-surface-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {stats.map(({ value, label }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="text-center"
              >
                <p className="font-heading text-4xl font-extrabold text-primary-600">
                  {value}
                </p>
                <p className="mt-1 text-sm font-medium text-surface-500">
                  {label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.span
              variants={fadeUp}
              className="text-sm font-semibold text-primary-600 uppercase tracking-wider"
            >
              Features
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-2 font-heading text-3xl font-bold text-surface-900 sm:text-4xl"
            >
              Everything You Need to Automate
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-surface-600">
              From upload to publish, we handle the entire pipeline so you can
              focus on creating content.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {features.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="group relative rounded-2xl border border-surface-200 bg-white p-8 transition-all duration-300 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-surface-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-600">
                  {description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-surface-950 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.span
              variants={fadeUp}
              className="text-sm font-semibold text-primary-400 uppercase tracking-wider"
            >
              How It Works
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-2 font-heading text-3xl font-bold text-white sm:text-4xl"
            >
              Three Simple Steps
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-surface-400">
              Get up and running in minutes, not hours.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {steps.map(({ step, title, description }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className="relative rounded-2xl border border-surface-800 bg-surface-900 p-8"
              >
                <span className="font-heading text-5xl font-extrabold text-primary-600/20">
                  {step}
                </span>
                <h3 className="mt-4 font-heading text-xl font-semibold text-white">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-surface-400">
                  {description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-8 py-16 text-center sm:px-16 sm:py-24"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Ready to Automate Your Workflow?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100">
              Join creators who have automated their YouTube publishing. Start
              free, scale as you grow.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button
                  size="xl"
                  className="bg-white text-primary-700 hover:bg-primary-50 w-full sm:w-auto"
                >
                  Get Started Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-surface-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <PlayCircle className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading text-lg font-bold text-surface-900">
                AutoPublish
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-surface-500">
              <a href="#features" className="hover:text-surface-700 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-surface-700 transition-colors">
                How It Works
              </a>
              <Link to="/login" className="hover:text-surface-700 transition-colors">
                Sign In
              </Link>
            </div>
            <p className="text-sm text-surface-400">
              &copy; {new Date().getFullYear()} AutoPublish. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
