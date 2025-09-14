export default function TabsDashboard({ activeTab, setActiveTab }) {
  const tabs = ["Nesplora Ice Cream", "EEG",];

  return (
    <div className="flex px-5 pt-0.5 bg-secondary-bg space-x-12 mb-2 border-b border-primary relative rounded-t-sm">
  {tabs.map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-0.5 rounded-t-sm text-sm transition-all duration-200 relative cursor-pointer ${
        activeTab === tab
          ? "bg-primary-bg text-primary font-medium border border-primary border-b-0 translate-y-[1px]"
          : "text-secondary-text hover:text-primary-hover z-0"
      }`}
    >
      {tab}
    </button>
  ))}
</div>

  );
}
