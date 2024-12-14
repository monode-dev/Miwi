import { Box, BoxProps, Column, Page } from "./miwi";
import { JSX, Show } from "solid-js";
// import { UploadingIndicator } from "./UploadingIndicator";
// import { mfs } from "@/AppData";

export const pagePadding = 1.25;

export function SimplePage(
  props: {
    floating?: JSX.Element;
    floatBoxStyle?: BoxProps;
  } & BoxProps,
) {
  return (
    // TODO: For some reason the page squishes with the keyboard.
    <Page stack scale={1}>
      {/* Page */}
      <Column widthGrows heightGrows overrideProps={props} padBetween={0}>
        {props.children}
      </Column>

      {/* Upload Indicator */}
      {/* <Show when={mfs.isUploadingToCloud}>
        <Box asWideAsParent asTallAsParent alignBottomLeft pad={pagePadding}>
          <UploadingIndicator />
        </Box>
      </Show> */}

      {/* Floating Elements */}
      <Column
        widthGrows
        heightGrows
        alignBottomRight
        pad={pagePadding}
        zIndex={3}
        overrideProps={props.floatBoxStyle}
      >
        {props.floating}
      </Column>
    </Page>
  );
}
