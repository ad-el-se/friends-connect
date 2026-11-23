import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { I18nProvider } from '@/shared/lib/i18n';
import { MockAppProvider } from '@/shared/lib/mockStore';
import { ThemeProvider } from '@/shared/lib/theme';
import '@/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <MockAppProvider>
          <App />
        </MockAppProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);
