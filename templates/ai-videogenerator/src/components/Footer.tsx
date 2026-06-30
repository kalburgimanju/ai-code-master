export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} AI Video Generator. Built with Next.js.
        </p>
      </div>
    </footer>
  );
}
