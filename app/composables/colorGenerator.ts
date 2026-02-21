  // composables/useColorGenerator.ts

/**
 * Génère une couleur HSL déterministe à partir d'une chaîne de caractères
 * Utilise l'algorithme de hash BKDR (Barker) pour garantir la même couleur pour la même chaîne
 */
export function useColorGenerator() {
  
  /**
   * Hash function BKDR (Barker) - rapide et efficace pour les strings
   */
  function hashString(str: string): number {
    let hash = 0
    if (str.length === 0) return hash
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    
    return Math.abs(hash)
  }

  /**
   * Génère une couleur HSL à partir d'une chaîne
   * @param str - La chaîne de caractères (nom de catégorie, etc.)
   * @param options - Options de personnalisation
   * @returns Objet avec hsl string et tailwind color class
   */
  function generateColor(str: string, options: {
    saturation?: number | number[]
    lightness?: number | number[]
    hueRange?: [number, number] // [min, max] en degrés (0-360)
  } = {}) {
    const {
      saturation = [50, 60, 70], // Plusieurs valeurs pour la variété
      lightness = [45, 55, 65],
      hueRange = [0, 360]
    } = options

    const hash = hashString(str)
    
    // Calcul de la teinte (Hue) dans la plage demandée
    const hueDiff = hueRange[1] - hueRange[0]
    const hue = (hash % hueDiff) + hueRange[0]
    
    // Sélection de saturation et lightness basées sur le hash
    const satArray = Array.isArray(saturation) ? saturation : [saturation]
    const lightArray = Array.isArray(lightness) ? lightness : [lightness]
    
    const satIndex = Math.floor((hash / 360) % satArray.length)
    const lightIndex = Math.floor((hash / 360 / satArray.length) % lightArray.length)
    
    const sat = satArray[satIndex]
    const light = lightArray[lightIndex]
    
    return {
      hsl: `hsl(${hue}, ${sat}%, ${light}%)`,
      hue,
      saturation: sat,
      lightness: light,
      // Pour Tailwind (approximation vers les couleurs disponibles)
      tailwindColor: getTailwindColor(hue, sat, light)
    }
  }

  /**
   * Approxime la couleur HSL vers une couleur Tailwind disponible
   * pour utiliser avec les composants Nuxt UI (UBadge, etc.)
   */
  function getTailwindColor(hue: number, sat: number, light: number): string {
    // Palette de couleurs Tailwind avec leurs teintes approximatives
    const tailwindColors: Record<string, number> = {
      red: 0,
      orange: 30,
      amber: 45,
      yellow: 60,
      lime: 75,
      green: 135,
      emerald: 150,
      teal: 175,
      cyan: 195,
      sky: 210,
      blue: 225,
      indigo: 245,
      violet: 270,
      purple: 285,
      fuchsia: 300,
      pink: 330,
      rose: 345,
      slate: 210, // Gris neutre
      gray: 0,    // Gris neutre
      zinc: 240,  // Gris neutre
      neutral: 0, // Gris neutre
      stone: 30   // Gris neutre
    }

    // Trouver la couleur la plus proche
    let closestColor = 'blue'
    let minDiff = 360

    for (const [name, colorHue] of Object.entries(tailwindColors)) {
      // Gestion du cercle chromatique (0° = 360°)
      let diff = Math.abs(hue - colorHue)
      if (diff > 180) diff = 360 - diff
      
      if (diff < minDiff) {
        minDiff = diff
        closestColor = name
      }
    }

    return closestColor
  }

  /**
   * Génère une couleur pour badge Nuxt UI (couleur sémantique)
   */
  function generateBadgeColor(str: string): string {
    const { tailwindColor } = generateColor(str, {
      saturation: [60, 70, 80],
      lightness: [50, 60],
      hueRange: [0, 360]
    })
    return tailwindColor
  }

  /**
   * Génère une couleur de fond avec texte lisible
   */
  function generateBackgroundColor(str: string): { bg: string; text: string } {
    const { tailwindColor, lightness } = generateColor(str, {
      saturation: [40, 50],
      lightness: [85, 90, 95], // Très clair pour le fond
      hueRange: [0, 360]
    })

    // Texte foncé si fond clair, sinon texte clair
    const textColor = lightness > 50 ? 'gray-900' : 'white'

    return {
      bg: `${tailwindColor}-100`,
      text: textColor
    }
  }

  return {
    generateColor,
    generateBadgeColor,
    generateBackgroundColor,
    hashString
  }
}