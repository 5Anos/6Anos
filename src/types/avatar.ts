export interface CustomAvatarConfig {
  skin: string;
  hair: string;
  hairColor: string;
  eyes: string;
  expression: string;
  glasses: string;
  hat: string;
  clothing: string;
  clothingColor: string;
  background: string;
}

export interface AvatarOptionItem {
  id: string;
  label: string;
  color?: string;
  icon?: string;
}

export interface AvatarCategoryDef {
  id: keyof CustomAvatarConfig;
  label: string;
  icon: string;
  options: AvatarOptionItem[];
}
