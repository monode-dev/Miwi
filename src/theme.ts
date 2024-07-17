export const sizeScaleCssVarName = `--miwi-size-scale`;

export function cssVarForMiwiTexture(nameInPalette: string, color: string) {
  return {
    key: `--miwi-color-${nameInPalette}`,
    value: color,
  };
}

export const defaultTheme = {
  palette: {
    primary: `var(--miwi-color-primary)`,
    accent: `var(--miwi-color-accent)`,
    pageBackground: `var(--miwi-color-page-fill)`,
    text: `var(--miwi-color-text)`,
    hint: `var(--miwi-color-hint)`,
    lightHint: `var(--miwi-color-light-hint)`,
    warning: `var(--miwi-color-warning)`,
    error: `var(--miwi-color-error)`,
  },
};

export type MiwiTheme = {
  palette: {
    primary: string;
    accent: string;
    pageBackground: string;
    text: string;
    hint: string;
    lightHint: string;
    warning: string;
    error: string;
  };
};

export const strokeTexture = `currentColor`;
export const theme = {
  palette: {
    primary: `var(--miwi-color-primary)`,
    accent: `var(--miwi-color-accent)`,
    pageBackground: `var(--miwi-color-page-fill)`,
    text: `var(--miwi-color-text)`,
    hint: `var(--miwi-color-hint)`,
    lightHint: `var(--miwi-color-light-hint)`,
    warning: `var(--miwi-color-warning)`,
    error: `var(--miwi-color-error)`,
  },
};
