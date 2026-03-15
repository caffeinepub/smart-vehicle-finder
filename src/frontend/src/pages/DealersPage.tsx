import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bike, Car, MapPin, Phone, Search, Star, Truck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useMemo, useState } from "react";
import { dealers } from "../dealers";

type DealerTypeFilter = "all" | "car" | "bike" | "truck";

export default function DealersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DealerTypeFilter>("all");
  const [stateFilter, setStateFilter] = useState("all");

  const states = useMemo(() => {
    const s = Array.from(new Set(dealers.map((d) => d.state))).sort();
    return s;
  }, []);

  const filtered = useMemo(() => {
    return dealers.filter((d) => {
      if (typeFilter !== "all" && !d.vehicleTypes.includes(typeFilter as never))
        return false;
      if (stateFilter !== "all" && d.state !== stateFilter) return false;
      if (
        search &&
        !d.name.toLowerCase().includes(search.toLowerCase()) &&
        !d.brand.toLowerCase().includes(search.toLowerCase()) &&
        !d.city.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [search, typeFilter, stateFilter]);

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
            Authorized <span className="text-primary">Dealers</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Find trusted dealerships near you. {dealers.length}+ dealers across
            India.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="dealers.search_input"
              placeholder="Search by dealer name, brand, or city..."
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

          <div className="flex gap-3 flex-wrap">
            {[
              {
                value: "all" as DealerTypeFilter,
                label: "All",
                icon: null as React.ReactNode,
              },
              {
                value: "car" as DealerTypeFilter,
                label: "Cars",
                icon: (<Car className="w-3.5 h-3.5" />) as React.ReactNode,
              },
              {
                value: "bike" as DealerTypeFilter,
                label: "Bikes",
                icon: (<Bike className="w-3.5 h-3.5" />) as React.ReactNode,
              },
              {
                value: "truck" as DealerTypeFilter,
                label: "Trucks",
                icon: (<Truck className="w-3.5 h-3.5" />) as React.ReactNode,
              },
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                data-ocid={"dealers.type.tab"}
                onClick={() => setTypeFilter(value as DealerTypeFilter)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  typeFilter === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger
              data-ocid="dealers.state_select"
              className="w-full sm:w-48"
            >
              <MapPin className="w-3.5 h-3.5 mr-1" />
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Showing{" "}
          <span className="text-foreground font-semibold">
            {filtered.length}
          </span>{" "}
          dealer{filtered.length !== 1 ? "s" : ""}
        </p>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              data-ocid="dealers.empty_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 rounded-2xl bg-muted/40 border border-border mx-auto flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No dealers found</h3>
              <p className="text-muted-foreground">
                Try a different search or filter.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence>
                {filtered.map((dealer, i) => (
                  <motion.div
                    key={dealer.id}
                    data-ocid={`dealer.item.${i + 1}`}
                    className="glass-card rounded-2xl overflow-hidden flex flex-col"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(i * 0.05, 0.4),
                    }}
                  >
                    <div className="relative">
                      <img
                        src={dealer.imageUrl}
                        alt={dealer.name}
                        className="w-full h-40 object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {dealer.vehicleTypes.map((t) => (
                          <Badge
                            key={t}
                            className="bg-background/80 text-foreground text-xs backdrop-blur"
                          >
                            {t === "car" ? (
                              <Car className="w-3 h-3 mr-1" />
                            ) : t === "truck" ? (
                              <Truck className="w-3 h-3 mr-1" />
                            ) : (
                              <Bike className="w-3 h-3 mr-1" />
                            )}
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </Badge>
                        ))}
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-amber-500/90 text-white text-xs font-bold">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          {dealer.rating}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
                          {dealer.brand}
                        </p>
                        <h3 className="text-lg font-bold text-foreground mt-0.5">
                          {dealer.name}
                        </h3>
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            {dealer.address}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3">
                        <div className="bg-muted/40 rounded-lg px-3 py-2">
                          <p className="text-xs text-muted-foreground">
                            Reviews
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {dealer.reviewCount.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-muted/40 rounded-lg px-3 py-2">
                          <p className="text-xs text-muted-foreground">Est.</p>
                          <p className="text-sm font-bold text-foreground">
                            {dealer.established}
                          </p>
                        </div>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 mb-4">
                        <p className="text-xs text-muted-foreground">
                          Speciality
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {dealer.speciality}
                        </p>
                      </div>

                      <a
                        href={`tel:${dealer.phone}`}
                        data-ocid={`dealer.call_button.${i + 1}`}
                        className="mt-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all text-sm font-semibold"
                      >
                        <Phone className="w-4 h-4" />
                        {dealer.phone}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
