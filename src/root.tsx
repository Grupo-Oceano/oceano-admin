import { component$, isDev } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { FlowbiteProvider, FlowbiteProviderHeader } from "flowbite-qwik";
import { RouterHead } from "./components/etc/SEO/router-head";
import "./global.css";

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <FlowbiteProviderHeader />
        <RouterHead />
        <link
          rel="manifest"
          href={`${import.meta.env.BASE_URL}manifest.json`}
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body lang="en">
        <FlowbiteProvider theme="blue" toastPosition="top-right">
          <RouterOutlet />
        </FlowbiteProvider>
      </body>
    </QwikCityProvider>
  );
});
