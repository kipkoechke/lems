export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      {children}
    </div>
  );
}
