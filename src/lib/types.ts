export type SpotCategory =
  | "food"
  | "outdoors"
  | "culture"
  | "nightlife"
  | "weird"
  | "hidden-gem"
  | "historic"
  | "activity";

export type Spot = {
  id: string;
  name: string;
  description: string | null;
  category: SpotCategory | string;
  latitude: number;
  longitude: number;
  city: string;
  timezone: string | null;
  hours: Record<string, Array<{ open: string; close: string }>> | null;
  tags: string[] | null;
  submitted_by: string | null;
  upvotes: number;
  status: "approved" | "pending" | "rejected";
  created_at: string;
};

export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  home_latitude: number | null;
  home_longitude: number | null;
  city: string | null;
  budget_max: number;
  is_admin: boolean;
  created_at: string;
};

export type Trip = {
  id: string;
  user_id: string;
  spot_id: string;
  status: "suggested" | "ride_clicked" | "completed";
  rating: number | null;
  notes: string | null;
  is_public: boolean;
  created_at: string;
};

export type SpotVote = {
  user_id: string;
  spot_id: string;
  created_at: string;
};
