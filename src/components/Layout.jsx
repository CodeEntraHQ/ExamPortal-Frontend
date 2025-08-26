import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="fixed inset-0 flex flex-col">
      <Header className="flex-none" />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Footer className="flex-none" />
    </div>
  );
}
