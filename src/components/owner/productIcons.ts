import {
  Coffee,
  Cookie,
  Cigarette,
  CupSoda,
  Package,
  Sandwich,
  type LucideIcon,
} from "lucide-react";
import type { ProductCategory } from "@/lib/types";

export const CATEGORY_ICONS: Record<ProductCategory, LucideIcon> = {
  Tea: Coffee,
  Coffee: CupSoda,
  Snacks: Sandwich,
  Biscuits: Cookie,
  Cigarettes: Cigarette,
  Other: Package,
};
