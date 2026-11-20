import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Labels = Record<string, string>;

const Ctx = createContext<{
  labels: Labels;
  setLabel: (href: string, label?: string) => void;
}>({ labels: {}, setLabel: () => {} });

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Labels>({});

  const setLabel = useCallback((href: string, label?: string) => {
    setLabels((prev) => {
      if (label === undefined) {
        if (!(href in prev)) return prev;
        const { [href]: _removed, ...rest } = prev;
        return rest;
      }
      return prev[href] === label ? prev : { ...prev, [href]: label };
    });
  }, []);

  return <Ctx.Provider value={{ labels, setLabel }}>{children}</Ctx.Provider>;
}

export const useBreadcrumbLabels = () => useContext(Ctx).labels;

/** Call from a page to replace a crumb's text, e.g. a slug with a title. */
export function useBreadcrumbLabel(href: string | undefined, label: string | undefined) {
  const { setLabel } = useContext(Ctx);
  useEffect(() => {
    if (!href || !label) return;
    setLabel(href, label);
    return () => setLabel(href, undefined);
  }, [href, label, setLabel]);
}