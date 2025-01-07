import '@mui/material/styles/createPalette';

declare module '@mui/material/styles' {
  interface Palette {
    greenPalette: Palette['primary'];
    blackPalette: Palette['primary'];
  }

  interface PaletteOptions {
    greenPalette?: PaletteOptions['primary'];
    blackPalette?: PaletteOptions['primary'];
  }
}

declare module '@mui/material' {
  interface CheckboxPropsColorOverrides {
    greenPalette: true;
    blackPalette: true;
  }

  interface ButtonPropsColorOverrides {
    greenPalette: true;
    blackPalette: true;
  }

  interface IconButtonPropsColorOverrides {
    greenPalette: true;
    blackPalette: true;
  }

  interface TextFieldPropsColorOverrides {
    greenPalette: true;
    blackPalette: true;
  }

  interface SliderPropsColorOverrides {
    greenPalette: true;
    blackPalette: true;
  }
}
