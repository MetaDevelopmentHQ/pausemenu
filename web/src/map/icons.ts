import {
  Anchor, Banknote, Beer, Book, Briefcase, Building2, Bus, Camera, Car, CarTaxiFront, Coffee, Crosshair, Dices, Dot, Drama,
  Droplets, Dumbbell, Film, Fish, Flag, Flame, Fuel, Gem, Hospital, House, Info, KeyRound, Landmark, Laptop, Leaf, MapPin,
  Mic, Music, Package, Pen, Pickaxe, Pill, Plane, Scissors, Shield, Shirt, Store, Target, Trash2, Truck, Utensils, Warehouse, Wrench,
  type LucideIcon,
} from "lucide-react";

/** Icon keys used by Config.MapBlips -> icon component */
const ICONS: Record<string, LucideIcon> = {
  shield: Shield, hospital: Hospital, flame: Flame, landmark: Landmark, banknote: Banknote, store: Store,
  shirt: Shirt, scissors: Scissors, pen: Pen, crosshair: Crosshair, drama: Drama, book: Book, fuel: Fuel,
  warehouse: Warehouse, wrench: Wrench, droplets: Droplets, car: Car, truck: Truck, trash: Trash2, bus: Bus,
  "car-taxi": CarTaxiFront, target: Target, briefcase: Briefcase, laptop: Laptop, beer: Beer, music: Music,
  film: Film, mic: Mic, flag: Flag, dumbbell: Dumbbell, camera: Camera, plane: Plane, helicopter: Plane,
  anchor: Anchor, home: House, building: Building2, leaf: Leaf, pill: Pill, package: Package, key: KeyRound,
  pin: MapPin, info: Info, dot: Dot, dice: Dices, fish: Fish, pickaxe: Pickaxe, utensils: Utensils, coffee: Coffee,
  gem: Gem,
};

export const iconFor = (key: string): LucideIcon => ICONS[key] ?? MapPin;
