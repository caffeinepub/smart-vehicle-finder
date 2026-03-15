import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  BarChart3,
  Bike,
  Car,
  Download,
  Heart,
  Search,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type Vehicle, vehicles } from "../vehicles";

const formatPrice = (price: number): string => {
  if (price >= 100000) {
    const lakhs = price / 100000;
    return `\u20b9${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)}L`;
  }
  return `\u20b9${(price / 1000).toFixed(0)}K`;
};

type SortOption = "price-asc" | "price-desc" | "mileage-desc" | "mileage-asc";
type TypeFilter = "all" | "car" | "bike" | "truck";
type FuelFilter = "all" | "Petrol" | "Diesel" | "Electric" | "Hybrid" | "CNG";

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
      <html><head><title>${vehicle.brand} ${vehicle.name}</title>
      <style>body{font-family:sans-serif;padding:20px;max-width:400px}img{width:100%;border-radius:8px}h2{margin:12px 0 4px}.spec{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee}</style></head>
      <body><img src="${vehicle.imageUrl}" alt="${vehicle.name}" />
      <h2>${vehicle.brand} ${vehicle.name}</h2>
      <div class="spec"><span>Price</span><span>${formatPrice(vehicle.price)}</span></div>
      <div class="spec"><span>Engine</span><span>${vehicle.engine}</span></div>
      <div class="spec"><span>Fuel</span><span>${vehicle.fuel.join(", ")}</span></div>
      <div class="spec"><span>Mileage</span><span>${vehicle.mileage > 0 ? `${vehicle.mileage} km/l` : "Electric"}</span></div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const typeIcon =
    vehicle.type === "car" ? (
      <Car className="w-3 h-3 mr-1" />
    ) : vehicle.type === "truck" ? (
      <Truck className="w-3 h-3 mr-1" />
    ) : (
      <Bike className="w-3 h-3 mr-1" />
    );

  const typeLabel =
    vehicle.type === "car"
      ? "Car"
      : vehicle.type === "truck"
        ? "Truck"
        : "Bike";

  return (
    <motion.div
      data-ocid={`vehicle.item.${index}`}
      className="vehicle-card glass-card rounded-2xl overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
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
            {typeIcon}
            {typeLabel}
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
              {vehicle.mileage > 0 ? `${vehicle.mileage} km/l` : "Electric"}
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

export default function VehiclesPage({
  favorites,
  onFavoriteToggle,
  compareList,
  onCompareToggle,
  onNavigateToDealers,
}: {
  favorites: number[];
  onFavoriteToggle: (id: number) => void;
  compareList: number[];
  onCompareToggle: (id: number) => void;
  onNavigateToDealers: () => void;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [fuelFilter, setFuelFilter] = useState<FuelFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");

  const filtered = useMemo(() => {
    let result = vehicles.filter((v) => {
      if (typeFilter !== "all" && v.type !== typeFilter) return false;
      if (fuelFilter !== "all" && !v.fuel.includes(fuelFilter as never))
        return false;
      if (
        search &&
        !v.brand.toLowerCase().includes(search.toLowerCase()) &&
        !v.name.toLowerCase().includes(search.toLowerCase()) &&
        !v.type.toLowerCase().includes(search.toLowerCase())
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
  }, [search, typeFilter, fuelFilter, sortBy]);

  const counts = useMemo(
    () => ({
      all: vehicles.length,
      car: vehicles.filter((v) => v.type === "car").length,
      bike: vehicles.filter((v) => v.type === "bike").length,
      truck: vehicles.filter((v) => v.type === "truck").length,
    }),
    [],
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-3"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            All <span className="text-primary">Vehicles</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Browse our complete collection of {counts.all} vehicles — cars,
            bikes, and trucks.
          </p>
        </motion.div>

        {/* Type Filter Tabs */}
        <div
          className="flex flex-wrap gap-3 mb-6"
          data-ocid="vehicles.type.tab"
        >
          {(
            [
              { value: "all", label: "All", icon: null, count: counts.all },
              {
                value: "car",
                label: "Cars",
                icon: <Car className="w-4 h-4" />,
                count: counts.car,
              },
              {
                value: "bike",
                label: "Bikes",
                icon: <Bike className="w-4 h-4" />,
                count: counts.bike,
              },
              {
                value: "truck",
                label: "Trucks",
                icon: <Truck className="w-4 h-4" />,
                count: counts.truck,
              },
            ] as const
          ).map(({ value, label, icon, count }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value as TypeFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                typeFilter === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {icon}
              {label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-md ${
                  typeFilter === value ? "bg-primary-foreground/20" : "bg-muted"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="vehicles.search_input"
              placeholder="Search by brand, model, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Select
            value={fuelFilter}
            onValueChange={(v) => setFuelFilter(v as FuelFilter)}
          >
            <SelectTrigger
              data-ocid="vehicles.fuel_select"
              className="w-full sm:w-40"
            >
              <SelectValue placeholder="Fuel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fuels</SelectItem>
              <SelectItem value="Petrol">Petrol</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Electric">Electric</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="CNG">CNG</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger
              data-ocid="vehicles.sort_select"
              className="w-full sm:w-48 gap-2"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="mileage-desc">Mileage: Best First</SelectItem>
              <SelectItem value="mileage-asc">Mileage: Lowest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Showing{" "}
          <span className="text-foreground font-semibold">
            {filtered.length}
          </span>{" "}
          vehicle{filtered.length !== 1 ? "s" : ""}
        </p>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              data-ocid="vehicles.empty_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 rounded-2xl bg-muted/40 border border-border mx-auto flex items-center justify-center mb-6">
                <Car className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground mb-6">
                Try a different search term or filter.
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setFuelFilter("all");
                }}
                variant="outline"
                className="gap-2"
              >
                <X className="w-4 h-4" /> Clear Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              <AnimatePresence>
                {filtered.map((vehicle, i) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    index={i + 1}
                    isFavorite={favorites.includes(vehicle.id)}
                    onFavoriteToggle={onFavoriteToggle}
                    compareList={compareList}
                    onCompareToggle={onCompareToggle}
                    onNavigateToDealers={onNavigateToDealers}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
