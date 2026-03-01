import { motion } from "framer-motion";
import { TrendingUp, Users, Leaf, AlertTriangle, MapPin, BarChart3, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Tourist Behavior Analytics",
    description: "ML-powered clustering identifies traveler segments — budget, luxury, eco, and weekend visitors.",
    color: "primary" as const,
  },
  {
    icon: TrendingUp,
    title: "Congestion Prediction",
    description: "Time-series forecasting predicts peak loads 30 days ahead using Prophet & LSTM models.",
    color: "warning" as const,
  },
  {
    icon: Leaf,
    title: "Sustainability Engine",
    description: "Recommends eco-certified hotels, public transport, and low-density alternative attractions.",
    color: "success" as const,
  },
  {
    icon: MapPin,
    title: "GIS Heatmap Visualization",
    description: "Real-time density maps showing congestion zones, pollution areas, and eco-score regions.",
    color: "primary" as const,
  },
  {
    icon: BarChart3,
    title: "Policy Dashboard",
    description: "Revenue analytics, infrastructure planning tools, and environmental stress monitoring.",
    color: "warning" as const,
  },
  {
    icon: Shield,
    title: "Environmental Stress Index",
    description: "Custom ESI metric measuring tourist impact on local infrastructure and ecology.",
    color: "success" as const,
  },
];

const colorMap = {
  primary: "text-primary glow-primary",
  warning: "text-warning glow-warning",
  success: "text-success glow-success",
};

const bgMap = {
  primary: "bg-primary/10",
  warning: "bg-warning/10",
  success: "bg-success/10",
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      
      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-primary font-mono text-sm mb-8">
          <Zap className="w-3.5 h-3.5" />
          AI + Smart Cities + Sustainable Tourism
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          <span className="text-gradient-primary">Smart Sustainable</span>
          <br />
          <span className="text-foreground">Tourism Platform</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Predict congestion. Reduce environmental stress. Empower policymakers 
          with AI-driven insights for responsible travel planning.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/dashboard"
            className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all glow-primary"
          >
            Open Dashboard
          </a>
          <a
            href="#features"
            className="px-8 py-3.5 rounded-lg glass-card text-foreground font-semibold text-base hover:border-primary/30 transition-all"
          >
            Explore Modules
          </a>
        </div>
      </motion.div>

      {/* Features grid */}
      <motion.div
        id="features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative z-10 mt-28 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20"
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="glass-card-hover rounded-xl p-6"
          >
            <div className={`w-10 h-10 rounded-lg ${bgMap[f.color]} flex items-center justify-center mb-4`}>
              <f.icon className={`w-5 h-5 ${f.color === "primary" ? "text-primary" : f.color === "warning" ? "text-warning" : "text-success"}`} />
            </div>
            <h3 className="text-foreground font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HeroSection;
