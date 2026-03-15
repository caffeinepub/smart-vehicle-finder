import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowUpDown,
  BarChart3,
  Bike,
  Building2,
  Car,
  ChevronDown,
  Download,
  Fuel,
  Gauge,
  Heart,
  LayoutGrid,
  Menu,
  Moon,
  Search,
  Settings2,
  Shuffle,
  SlidersHorizontal,
  Sun,
  Trophy,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import DealersPage from "./pages/DealersPage";
import VehiclesPage from "./pages/VehiclesPage";
import {
  type FuelType,
  type MileageCategory,
  type UsageType,
  type Vehicle,
  type VehicleType,
  vehicles,
} from "./vehicles";

type Page = "home" | "vehicles" | "dealers";

const formatPrice = (price: number): string => {
  if (price >= 100000) {
    const lakhs = price / 100000;
    return `\u20b9${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)}L`;
  }
  return `\u20b9${(price / 1000).toFixed(0)}K`;
};

const formatPriceRange = (price: number): string => {
  if (price >= 100000) {
    return `\u20b9${(price / 100000).toFixed(1)} Lakh`;
  }
  return `\u20b9${(price / 1000).toFixed(0)} Thousand`;
};

type SortOption = "price-asc" | "price-desc" | "mileage-desc" | "mileage-asc";

interface Filters {
  budget: number;
  vehicleType: VehicleType | "both";
  fuel: FuelType | "Any";
  transmission: "Manual" | "Automatic" | "Any";
  usage: UsageType[];
  mileage: MileageCategory | "Any";
}

const defaultFilters: Filters = {
  budget: 2000000,
  vehicleType: "both",
  fuel: "Any",
  transmission: "Any",
  usage: [],
  mileage: "Any",
};

function VehicleCard({
  vehicle,
  index,
  isFavorite,
  onFavoriteToggle,
  compareList,
  onCompareToggle,
  onNavigateToDealers,
}: {
  vehicle: Vehicle;
  index: number;
  isFavorite: boolean;
  onFavoriteToggle: (id: number) => void;
  compareList: number[];
  onCompareToggle: (id: number) => void;
  onNavigateToDealers: () => void;
}) {
  const isInCompare = compareList.includes(vehicle.id);

  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>${vehicle.brand} ${vehicle.name}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; max-width: 400px; }
          img { width: 100%; border-radius: 8px; }
          h2 { margin: 12px 0 4px; }
          .spec { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
        </style></head>
        <body>
          <img src="${vehicle.imageUrl}" alt="${vehicle.name}" />
          <h2>${vehicle.brand} ${vehicle.name}</h2>
          <div class="spec"><span>Price</span><span>${formatPrice(vehicle.price)}</span></div>
          <div class="spec"><span>Engine</span><span>${vehicle.engine}</span></div>
          <div class="spec"><span>Fuel</span><span>${vehicle.fuel.join(", ")}</span></div>
          <div class="spec"><span>Mileage</span><span>${vehicle.mileage} km/l</span></div>
          ${vehicle.type === "car" ? `<div class="spec"><span>Transmission</span><span>${vehicle.transmission.join(", ")}</span></div>` : ""}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <motion.div
      data-ocid={`vehicle.item.${index}`}
      className="vehicle-card glass-card rounded-2xl overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <div className="relative overflow-hidden">
        <img
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.name}`}
          className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-primary/90 text-primary-foreground text-xs font-semibold">
            {vehicle.type === "car"
              ? "Car"
              : vehicle.type === "truck"
                ? "Truck"
                : "Bike"}
          </Badge>
          {vehicle.fuel.includes("Electric") && (
            <Badge className="bg-emerald-600/90 text-white text-xs">
              <Zap className="w-3 h-3 mr-1" /> EV
            </Badge>
          )}
        </div>
        <button
          type="button"
          data-ocid={`vehicle.favorite_toggle.${index}`}
          onClick={() => onFavoriteToggle(vehicle.id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/70 backdrop-blur flex items-center justify-center transition-all hover:bg-background/90"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
            {vehicle.brand}
          </p>
          <h3 className="text-lg font-bold text-foreground mt-0.5 leading-tight">
            {vehicle.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {vehicle.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-sm font-bold text-primary">
              {formatPrice(vehicle.price)}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground">Mileage</p>
            <p className="text-sm font-bold text-foreground">
              {vehicle.mileage} km/l
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground">Fuel</p>
            <p className="text-sm font-semibold text-foreground truncate">
              {vehicle.fuel.join("/")}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground">Engine</p>
            <p className="text-sm font-semibold text-foreground">
              {vehicle.engine}
            </p>
          </div>
          {vehicle.type === "car" && (
            <div className="bg-muted/40 rounded-lg px-3 py-2 col-span-2">
              <p className="text-xs text-muted-foreground">Transmission</p>
              <p className="text-sm font-semibold text-foreground">
                {vehicle.transmission.join(" / ")}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-auto pt-2">
          <button
            type="button"
            data-ocid={`vehicle.compare_button.${index}`}
            onClick={() => {
              if (!isInCompare && compareList.length >= 2) {
                toast.error("You can compare at most 2 vehicles");
                return;
              }
              onCompareToggle(vehicle.id);
            }}
            className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg border transition-all ${
              isInCompare
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <BarChart3 className="w-3 h-3 inline mr-1" />
            {isInCompare ? "In Compare" : "Compare"}
          </button>
          <button
            type="button"
            data-ocid={`vehicle.buy_button.${index}`}
            onClick={onNavigateToDealers}
            className="flex-1 text-xs font-semibold py-2 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            Buy from Dealer
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
            aria-label="Download vehicle card"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CompareModal({
  vehicleIds,
  onClose,
}: {
  vehicleIds: number[];
  onClose: () => void;
}) {
  const v1 = vehicles.find((v) => v.id === vehicleIds[0]);
  const v2 = vehicles.find((v) => v.id === vehicleIds[1]);
  if (!v1 || !v2) return null;

  const specs = [
    {
      label: "Price",
      val1: formatPrice(v1.price),
      val2: formatPrice(v2.price),
    },
    { label: "Engine", val1: v1.engine, val2: v2.engine },
    { label: "Fuel", val1: v1.fuel.join(", "), val2: v2.fuel.join(", ") },
    {
      label: "Mileage",
      val1: `${v1.mileage} km/l`,
      val2: `${v2.mileage} km/l`,
    },
    {
      label: "Transmission",
      val1: v1.transmission.join(", "),
      val2: v2.transmission.join(", "),
    },
    { label: "Usage", val1: v1.usage.join(", "), val2: v2.usage.join(", ") },
    { label: "Type", val1: v1.type, val2: v2.type },
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="compare.modal"
        className="max-w-2xl glass-card border-border"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Vehicle Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div />
          <div className="text-center">
            <img
              src={v1.imageUrl}
              alt={v1.name}
              className="w-full h-28 object-cover rounded-xl mb-2"
            />
            <p className="text-xs text-muted-foreground">{v1.brand}</p>
            <p className="font-bold text-foreground">{v1.name}</p>
          </div>
          <div className="text-center">
            <img
              src={v2.imageUrl}
              alt={v2.name}
              className="w-full h-28 object-cover rounded-xl mb-2"
            />
            <p className="text-xs text-muted-foreground">{v2.brand}</p>
            <p className="font-bold text-foreground">{v2.name}</p>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          {specs.map((spec, i) => (
            <div
              key={spec.label}
              className={`grid grid-cols-3 gap-4 py-2.5 px-3 rounded-lg text-sm ${
                i % 2 === 0 ? "bg-muted/30" : ""
              }`}
            >
              <span className="text-muted-foreground font-medium">
                {spec.label}
              </span>
              <span className="text-center font-semibold text-foreground">
                {spec.val1}
              </span>
              <span className="text-center font-semibold text-foreground">
                {spec.val2}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            data-ocid="compare.close_button"
            variant="outline"
            onClick={onClose}
            className="gap-2"
          >
            <X className="w-4 h-4" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FavoritesModal({
  favoriteIds,
  onClose,
  onRemove,
}: {
  favoriteIds: number[];
  onClose: () => void;
  onRemove: (id: number) => void;
}) {
  const favVehicles = vehicles.filter((v) => favoriteIds.includes(v.id));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="favorites.modal"
        className="max-w-lg glass-card border-border"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            Saved Vehicles ({favVehicles.length})
          </DialogTitle>
        </DialogHeader>
        {favVehicles.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No favorites yet. Tap the heart icon on any vehicle.
          </p>
        ) : (
          <div className="space-y-3 mt-2 max-h-96 overflow-y-auto">
            {favVehicles.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 bg-muted/30 rounded-xl p-3"
              >
                <img
                  src={v.imageUrl}
                  alt={v.name}
                  className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{v.brand}</p>
                  <p className="font-semibold text-foreground truncate">
                    {v.name}
                  </p>
                  <p className="text-sm text-primary font-bold">
                    {formatPrice(v.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(v.id)}
                  className="w-8 h-8 rounded-full hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${v.name} from favorites`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [page, setPage] = useState<Page>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters);
  const [hasSearched, setHasSearched] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("svf_favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const finderRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.className = isDark ? "" : "light";
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("svf_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter((v) => {
      if (v.type === "truck") return false; // exclude trucks from finder
      if (
        appliedFilters.vehicleType !== "both" &&
        v.type !== appliedFilters.vehicleType
      )
        return false;
      if (v.price > appliedFilters.budget) return false;
      if (
        appliedFilters.fuel !== "Any" &&
        !v.fuel.includes(appliedFilters.fuel as FuelType)
      )
        return false;
      if (
        appliedFilters.transmission !== "Any" &&
        v.type === "car" &&
        !v.transmission.includes(
          appliedFilters.transmission as "Manual" | "Automatic",
        )
      )
        return false;
      if (
        appliedFilters.usage.length > 0 &&
        !appliedFilters.usage.some((u) => v.usage.includes(u))
      )
        return false;
      if (
        appliedFilters.mileage !== "Any" &&
        v.mileageCategory !== appliedFilters.mileage
      )
        return false;
      if (
        brandSearch &&
        !v.brand.toLowerCase().includes(brandSearch.toLowerCase()) &&
        !v.name.toLowerCase().includes(brandSearch.toLowerCase())
      )
        return false;
      return true;
    });

    result = result.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "mileage-desc") return b.mileage - a.mileage;
      if (sortBy === "mileage-asc") return a.mileage - b.mileage;
      return 0;
    });

    return result;
  }, [appliedFilters, brandSearch, sortBy]);

  const handleFind = () => {
    setAppliedFilters(filters);
    setHasSearched(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setHasSearched(false);
    setBrandSearch("");
    setSortBy("price-asc");
  };

  const handleRandom = () => {
    const carsAndBikes = vehicles;
    const random =
      carsAndBikes[Math.floor(Math.random() * carsAndBikes.length)];
    setAppliedFilters({ ...defaultFilters, budget: random.price });
    setHasSearched(true);
    toast.success(`Random pick: ${random.brand} ${random.name}!`);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const toggleCompare = (id: number) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const usageOptions: { value: UsageType; label: string }[] = [
    { value: "City", label: "City Driving" },
    { value: "Highway", label: "Highway Driving" },
    { value: "Off-road", label: "Off-road" },
    { value: "Commute", label: "Daily Commute" },
  ];

  const navLinks: { label: string; page: Page; icon: React.ReactNode }[] = [
    {
      label: "Home",
      page: "home",
      icon: <SlidersHorizontal className="w-4 h-4" />,
    },
    { label: "Vehicles", page: "vehicles", icon: <Car className="w-4 h-4" /> },
    {
      label: "Dealers",
      page: "dealers",
      icon: <Building2 className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className={`min-h-screen bg-background text-foreground ${isDark ? "" : "light"}`}
    >
      <Toaster theme={isDark ? "dark" : "light"} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            data-ocid="header.link"
            onClick={() => setPage("home")}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-4 h-4 text-primary-foreground" />
            </div>
            <span
              className="font-bold text-lg"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Smart<span className="text-primary">Vehicle</span>Finder
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, page: p, icon }) => (
              <button
                key={p}
                type="button"
                data-ocid={`header.${p}.link`}
                onClick={() => setPage(p)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="favorites.open_modal_button"
              onClick={() => setShowFavorites(true)}
              className="relative w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:border-primary transition-colors"
              aria-label="View favorites"
            >
              <Heart className="w-4 h-4" />
              {favorites.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </button>

            {compareList.length === 2 && (
              <Button
                size="sm"
                onClick={() => setShowCompare(true)}
                className="gap-1.5 text-xs"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Compare
              </Button>
            )}

            <button
              type="button"
              data-ocid="darkmode.toggle"
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:border-primary transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              data-ocid="header.menu.toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:border-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map(({ label, page: p, icon }) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPage(p);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        {page === "vehicles" ? (
          <motion.div
            key="vehicles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <VehiclesPage
              favorites={favorites}
              onFavoriteToggle={toggleFavorite}
              compareList={compareList}
              onCompareToggle={toggleCompare}
              onNavigateToDealers={() => setPage("dealers")}
            />
          </motion.div>
        ) : page === "dealers" ? (
          <motion.div
            key="dealers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <DealersPage />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center hero-bg grid-pattern overflow-hidden pt-16">
              <div className="particle particle-1" />
              <div className="particle particle-2" />
              <div className="particle particle-3" />

              <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <Badge className="mb-6 bg-primary/15 text-primary border-primary/30 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                    <Zap className="w-3 h-3 mr-1.5" /> Smart Recommendations
                  </Badge>

                  <h1
                    className="text-5xl sm:text-6xl md:text-8xl font-extrabold leading-none tracking-tight mb-6"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Smart
                    <span className="text-primary block sm:inline">
                      {" "}
                      Vehicle
                    </span>
                    <span className="block">Finder</span>
                  </h1>

                  <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                    Answer a few questions and find the perfect car, bike, or
                    truck.{" "}
                    <span className="text-foreground font-medium">
                      73 vehicles
                    </span>
                    ,{" "}
                    <span className="text-foreground font-medium">
                      23 dealers
                    </span>
                    , instant results.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      data-ocid="hero.primary_button"
                      size="lg"
                      onClick={() =>
                        finderRef.current?.scrollIntoView({
                          behavior: "smooth",
                        })
                      }
                      className="gap-2 text-base px-8 py-6 rounded-xl font-semibold fav-fab-pulse"
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                      Start Finding
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setPage("vehicles")}
                      className="gap-2 text-base px-8 py-6 rounded-xl font-semibold"
                    >
                      <Car className="w-5 h-5" />
                      Browse All Vehicles
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setPage("dealers")}
                      className="gap-2 text-base px-8 py-6 rounded-xl font-semibold"
                    >
                      <Building2 className="w-5 h-5" />
                      Find Dealers
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
                >
                  {[
                    { icon: Car, label: "Cars & Bikes", sub: "55 models" },
                    { icon: Truck, label: "Trucks", sub: "12 commercial" },
                    { icon: Building2, label: "Dealers", sub: "23 locations" },
                    {
                      icon: Trophy,
                      label: "Smart Match",
                      sub: "Instant filter",
                    },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border mx-auto flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* Finder */}
            <section id="finder" ref={finderRef} className="py-20 px-4">
              <div className="max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-12"
                >
                  <h2
                    className="text-3xl sm:text-4xl font-extrabold mb-3"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Find Your{" "}
                    <span className="text-primary">Perfect Match</span>
                  </h2>
                  <p className="text-muted-foreground">
                    Set your preferences and we'll find the best vehicles for
                    you.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="glass-card rounded-2xl p-6 sm:p-8 space-y-8"
                >
                  {/* Budget */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-sm">
                          \u20b9
                        </span>
                        Budget
                      </Label>
                      <span className="text-primary font-bold text-sm">
                        {formatPriceRange(filters.budget)}
                      </span>
                    </div>
                    <input
                      data-ocid="finder.budget_input"
                      type="range"
                      min={50000}
                      max={2000000}
                      step={50000}
                      value={filters.budget}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          budget: Number(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>\u20b950K</span>
                      <span>\u20b920L</span>
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <Label className="text-base font-semibold flex items-center gap-2 mb-4">
                      <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </span>
                      Vehicle Type
                    </Label>
                    <div
                      className="flex flex-wrap gap-3"
                      data-ocid="finder.vehicle_type.tab"
                    >
                      {(["car", "bike", "truck", "both"] as const).map(
                        (type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() =>
                              setFilters((f) => ({ ...f, vehicleType: type }))
                            }
                            className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all capitalize ${
                              filters.vehicleType === type
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {type === "car" && (
                              <Car className="w-4 h-4 inline mr-1.5" />
                            )}
                            {type === "bike" && (
                              <Bike className="w-4 h-4 inline mr-1.5" />
                            )}
                            {type === "truck" && (
                              <Truck className="w-4 h-4 inline mr-1.5" />
                            )}
                            {type === "both" && (
                              <LayoutGrid className="w-4 h-4 inline mr-1.5" />
                            )}
                            {type === "both"
                              ? "Both"
                              : type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <Label className="text-base font-semibold flex items-center gap-2 mb-4">
                      <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                        <Fuel className="w-3.5 h-3.5" />
                      </span>
                      Fuel Type
                    </Label>
                    <Select
                      value={filters.fuel}
                      onValueChange={(v) =>
                        setFilters((f) => ({
                          ...f,
                          fuel: v as FuelType | "Any",
                        }))
                      }
                    >
                      <SelectTrigger
                        data-ocid="finder.fuel_select"
                        className="w-full"
                      >
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any Fuel</SelectItem>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transmission */}
                  <AnimatePresence>
                    {(filters.vehicleType === "car" ||
                      filters.vehicleType === "both") && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Label className="text-base font-semibold flex items-center gap-2 mb-4">
                          <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                            <Settings2 className="w-3.5 h-3.5" />
                          </span>
                          Transmission
                        </Label>
                        <RadioGroup
                          data-ocid="finder.transmission.radio"
                          value={filters.transmission}
                          onValueChange={(v) =>
                            setFilters((f) => ({
                              ...f,
                              transmission: v as "Manual" | "Automatic" | "Any",
                            }))
                          }
                          className="flex gap-4"
                        >
                          {(["Manual", "Automatic", "Any"] as const).map(
                            (t) => (
                              <div key={t} className="flex items-center gap-2">
                                <RadioGroupItem value={t} id={`trans-${t}`} />
                                <Label
                                  htmlFor={`trans-${t}`}
                                  className="cursor-pointer text-sm"
                                >
                                  {t === "Any" ? "No Preference" : t}
                                </Label>
                              </div>
                            ),
                          )}
                        </RadioGroup>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Usage */}
                  <div>
                    <Label className="text-base font-semibold flex items-center gap-2 mb-4">
                      <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                        <Gauge className="w-3.5 h-3.5" />
                      </span>
                      Usage Type
                      <span className="text-xs text-muted-foreground font-normal">
                        (select multiple)
                      </span>
                    </Label>
                    <div
                      className="grid grid-cols-2 gap-3"
                      data-ocid="finder.usage.checkbox"
                    >
                      {usageOptions.map(({ value, label }) => (
                        <label
                          key={value}
                          htmlFor={`usage-${value}`}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                            filters.usage.includes(value)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <Checkbox
                            id={`usage-${value}`}
                            checked={filters.usage.includes(value)}
                            onCheckedChange={() =>
                              setFilters((f) => ({
                                ...f,
                                usage: f.usage.includes(value)
                                  ? f.usage.filter((u) => u !== value)
                                  : [...f.usage, value],
                              }))
                            }
                          />
                          <span className="text-sm font-medium">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Mileage */}
                  <div>
                    <Label className="text-base font-semibold flex items-center gap-2 mb-4">
                      <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                        <Gauge className="w-3.5 h-3.5" />
                      </span>
                      Mileage Preference
                    </Label>
                    <RadioGroup
                      data-ocid="finder.mileage.radio"
                      value={filters.mileage}
                      onValueChange={(v) =>
                        setFilters((f) => ({
                          ...f,
                          mileage: v as MileageCategory | "Any",
                        }))
                      }
                      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                    >
                      {(
                        ["Any", "high", "balanced", "performance"] as const
                      ).map((m) => (
                        <div key={m}>
                          <RadioGroupItem
                            value={m}
                            id={`mil-${m}`}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={`mil-${m}`}
                            className={`block text-center py-2.5 px-3 rounded-xl border cursor-pointer text-sm font-medium transition-all ${
                              filters.mileage === m
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {m === "Any"
                              ? "Any"
                              : m === "high"
                                ? "High Mileage"
                                : m === "balanced"
                                  ? "Balanced"
                                  : "Performance"}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      data-ocid="finder.submit_button"
                      size="lg"
                      onClick={handleFind}
                      className="flex-1 gap-2 rounded-xl font-semibold"
                    >
                      <Search className="w-4 h-4" />
                      Find My Vehicle
                    </Button>
                    <Button
                      data-ocid="finder.random_button"
                      variant="outline"
                      size="lg"
                      onClick={handleRandom}
                      className="gap-2 rounded-xl"
                    >
                      <Shuffle className="w-4 h-4" />
                      Random
                    </Button>
                    <Button
                      data-ocid="finder.reset_button"
                      variant="ghost"
                      size="lg"
                      onClick={handleReset}
                      className="gap-2 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Results */}
            {hasSearched && (
              <section id="results" ref={resultsRef} className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8"
                  >
                    <div>
                      <h2
                        className="text-2xl sm:text-3xl font-extrabold"
                        style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                        }}
                      >
                        {hasSearched ? (
                          <>
                            <span className="text-primary">
                              {filteredVehicles.length}
                            </span>{" "}
                            Vehicles Found
                          </>
                        ) : (
                          "All Vehicles"
                        )}
                      </h2>
                      {hasSearched && (
                        <p className="text-muted-foreground text-sm mt-1">
                          Showing results within{" "}
                          <span className="text-foreground font-medium">
                            {formatPriceRange(appliedFilters.budget)}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          data-ocid="results.search_input"
                          placeholder="Search by brand or name..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="pl-9 w-full sm:w-56"
                        />
                      </div>
                      <Select
                        value={sortBy}
                        onValueChange={(v) => setSortBy(v as SortOption)}
                      >
                        <SelectTrigger className="w-full sm:w-44 gap-2">
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price-asc">
                            Price: Low to High
                          </SelectItem>
                          <SelectItem value="price-desc">
                            Price: High to Low
                          </SelectItem>
                          <SelectItem value="mileage-desc">
                            Mileage: Best First
                          </SelectItem>
                          <SelectItem value="mileage-asc">
                            Mileage: Lowest First
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>

                  {compareList.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {compareList.length === 1
                            ? "Select 1 more vehicle to compare"
                            : "2 vehicles selected for comparison"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {compareList.length === 2 && (
                          <Button
                            size="sm"
                            onClick={() => setShowCompare(true)}
                            className="text-xs"
                          >
                            Compare Now
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCompareList([])}
                          className="text-xs"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {filteredVehicles.length === 0 ? (
                      <motion.div
                        key="empty"
                        data-ocid="results.empty_state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-24"
                      >
                        <div className="w-20 h-20 rounded-2xl bg-muted/40 border border-border mx-auto flex items-center justify-center mb-6">
                          <Car className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          No vehicles found
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Try increasing your budget or changing filters.
                        </p>
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          className="gap-2"
                        >
                          <X className="w-4 h-4" /> Reset Filters
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="grid"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                      >
                        <AnimatePresence>
                          {filteredVehicles.map((vehicle, i) => (
                            <VehicleCard
                              key={vehicle.id}
                              vehicle={vehicle}
                              index={i + 1}
                              isFavorite={favorites.includes(vehicle.id)}
                              onFavoriteToggle={toggleFavorite}
                              compareList={compareList}
                              onCompareToggle={toggleCompare}
                              onNavigateToDealers={() => setPage("dealers")}
                            />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="border-t border-border py-8 px-4">
              <div className="max-w-7xl mx-auto text-center">
                <p className="text-sm text-muted-foreground">
                  \u00a9 {new Date().getFullYear()}. Built with{" "}
                  <Heart className="w-3.5 h-3.5 inline text-primary fill-primary" />{" "}
                  using{" "}
                  <a
                    href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    caffeine.ai
                  </a>
                </p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCompare && compareList.length === 2 && (
          <CompareModal
            vehicleIds={compareList}
            onClose={() => setShowCompare(false)}
          />
        )}
        {showFavorites && (
          <FavoritesModal
            favoriteIds={favorites}
            onClose={() => setShowFavorites(false)}
            onRemove={toggleFavorite}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
