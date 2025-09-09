export default function Container({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto my-4 px-4 max-w-7xl font-inter sm:px-6 lg:px-8">
      {children}
    </div>
  );
}