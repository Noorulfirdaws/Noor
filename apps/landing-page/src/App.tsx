import { PageProvider } from './context/PageContext';
import PageDrawer from './components/PageDrawer';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Coverage from './components/Coverage';
import Download from './components/Download';
import Safety from './components/Safety';
import PaymentMethods from './components/PaymentMethods';
import DriverSignup from './components/DriverSignup';
import Footer from './components/Footer';

export default function App() {
  return (
    <PageProvider>
      <div className="min-h-screen">
        <Header />
        <Hero />
        <Services />
        <Coverage />
        <Download />
        <PaymentMethods />
        <Safety />
        <DriverSignup />
        <Footer />
      </div>
      <PageDrawer />
    </PageProvider>
  );
}
