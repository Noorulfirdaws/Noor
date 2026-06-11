import { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
  activePage: string | null;
  openPage: (slug: string) => void;
  closePage: () => void;
}

const PageContext = createContext<PageContextType>({
  activePage: null,
  openPage: () => {},
  closePage: () => {},
});

export function PageProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<string | null>(null);

  return (
    <PageContext.Provider value={{
      activePage,
      openPage: (slug) => setActivePage(slug),
      closePage: () => setActivePage(null),
    }}>
      {children}
    </PageContext.Provider>
  );
}

export const usePage = () => useContext(PageContext);
