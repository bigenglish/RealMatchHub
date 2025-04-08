// Color palette based on provided chart
export const colors = {
  gray: "#BFBFBF", // Light gray
  darkGreen: "#3E5956", // Dark green
  mediumGreen: "#6C8C86", // Medium green
  lightGreen: "#92A69A", // Light green
  beige: "#F2C3A7", // Light beige/peach
};

// Function to get color with opacity
export const getColorWithOpacity = (colorHex: string, opacity: number): string => {
  // Extract RGB values from hex
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);
  
  // Return rgba format
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Generate tailwind-like color scale with opacity variations
export const colorScale = {
  gray: {
    50: getColorWithOpacity(colors.gray, 0.05),
    100: getColorWithOpacity(colors.gray, 0.1),
    200: getColorWithOpacity(colors.gray, 0.2),
    300: getColorWithOpacity(colors.gray, 0.3),
    400: getColorWithOpacity(colors.gray, 0.4),
    500: colors.gray,
    600: "#ADADAD", // Darkened
    700: "#9B9B9B", // Darkened more
    800: "#898989", // Darkened even more
    900: "#777777", // Darkened the most
  },
  green: {
    50: getColorWithOpacity(colors.lightGreen, 0.05),
    100: getColorWithOpacity(colors.lightGreen, 0.1),
    200: getColorWithOpacity(colors.lightGreen, 0.2),
    300: colors.lightGreen,
    400: getColorWithOpacity(colors.mediumGreen, 0.8),
    500: colors.mediumGreen,
    600: colors.darkGreen,
    700: "#344A47", // Darkened darkGreen
    800: "#2A3B39", // Darkened more
    900: "#202C2B", // Darkened the most
  },
  beige: {
    50: getColorWithOpacity(colors.beige, 0.05),
    100: getColorWithOpacity(colors.beige, 0.1),
    200: getColorWithOpacity(colors.beige, 0.2),
    300: getColorWithOpacity(colors.beige, 0.3),
    400: getColorWithOpacity(colors.beige, 0.4),
    500: colors.beige,
    600: "#D9AF95", // Darkened
    700: "#C09B83", // Darkened more
    800: "#A78771", // Darkened even more
    900: "#8E7360", // Darkened the most
  }
};