import { component$ } from "@qwik.dev/core";
import {
  RouterOutlet,
  useDocumentHead,
  useLocation,
  useQwikRouter,
} from "@qwik.dev/router";
import { ToastProvider } from "~/components/ui";
import "./global.css";

const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();
  return (
    <>
      <title>{head.title}</title>
      <link rel="canonical" href={loc.url.href} />
      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}
      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}
      {head.styles.map((s) => (
        <style key={s.key} {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}
    </>
  );
});

export default component$(() => {
  useQwikRouter();
  return (
    <>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link
          rel="manifest"
          href={`${import.meta.env.BASE_URL}manifest.json`}
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        />
        <RouterHead />
      </head>
      <body>
        <ToastProvider>
          <RouterOutlet />
        </ToastProvider>
      </body>
    </>
  );
});
