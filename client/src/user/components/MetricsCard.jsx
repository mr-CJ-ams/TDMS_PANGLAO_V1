
export const MetricsCard = ({ title, value }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
};
