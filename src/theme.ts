export const sizeScaleCssVarName = `--miwi-size-scale`;

export function cssVarForMiwiMaterial(nameInPalette: string, color: string) {
  return {
    key: `--miwi-material-${nameInPalette}`,
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

export const foregroundMaterial = `currentColor`;
export const theme = {
  palette: {
    primary: `var(--miwi-material-primary)`,
    accent: `var(--miwi-material-accent)`,
    pageBackground: `var(--miwi-material-page-fill)`,
    text: `var(--miwi-material-text)`,
    hint: `var(--miwi-material-hint)`,
    lightHint: `var(--miwi-material-light-hint)`,
    warning: `var(--miwi-material-warning)`,
    error: `var(--miwi-material-error)`,
  },
};
